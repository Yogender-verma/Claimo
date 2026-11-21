import os
import json
from pathlib import Path
from typing import List, Optional, Dict
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.auth import require_admin
from app.models import UserProfile, Scheme, MatchResponse, SchemeMatch
from app.engine import match_all_schemes, evaluate_scheme
from app.extract import (
    ExtractRequest,
    ExtractResponse,
    extract_facts_from_story,
    check_rate_limit,
)
from pydantic import BaseModel, Field

class RadarRequest(BaseModel):
  scheme: Scheme
  baseline_scheme: Optional[Scheme] = None

class ProfileImpact(BaseModel):
  profile_id: str
  profile_name: str
  old_tier: str
  new_tier: str
  changed: bool
  causing_rules: List[str]

class RadarResponse(BaseModel):
  total_profiles: int
  newly_eligible_count: int
  lost_eligibility_count: int
  unchanged_count: int
  impacts: List[ProfileImpact]

class ErrorReport(BaseModel):
  id: Optional[str] = None
  scheme_id: str
  scheme_name: str
  details: str
  reported_at: Optional[str] = None
  resolved: bool = False

# In-memory storage for error reports (supplemented by localStorage on client)
ADMIN_ERROR_REPORTS: List[dict] = []


app = FastAPI(
    title="Claimo API",
    description="Deterministic rules engine and verification API for Claimo",
    version="1.0.0",
)

# CORS configuration - limited strictly to FRONTEND_URL, allowing Authorization header
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

SCHEMES_FILE = Path(__file__).resolve().parent.parent / "data" / "schemes.json"

def get_loaded_schemes() -> List[Scheme]:
  if not SCHEMES_FILE.exists():
    return []
  try:
    with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
      data = json.load(f)
      if isinstance(data, list):
        return [Scheme(**item) for item in data]
  except Exception:
    return []
  return []

# ==================================================
# PUBLIC ROUTES (No login required - ever)
# ==================================================

@app.get("/health")
def health_check():
  return {"status": "ok", "app": "Claimo"}

@app.post("/api/extract", response_model=ExtractResponse)
def extract_facts(req: ExtractRequest, request: Request):
  """
  Story text to facts via stateless extractor.
  Zero logging of story text, income values, or IP addresses.
  """
  client_ip = request.client.host if request.client else "unknown"
  if not check_rate_limit(client_ip):
    raise HTTPException(status_code=429, detail="Too many extraction requests. Please wait a moment.")

  extracted = extract_facts_from_story(req.text)
  return ExtractResponse(
      success=True,
      extracted=extracted,
  )

@app.post("/api/match", response_model=MatchResponse)
def match_schemes(profile: UserProfile):
  """
  Stateless deterministic rules engine matching.
  Zero logging of request body or sensitive income/profile data.
  """
  schemes = get_loaded_schemes()
  matches = match_all_schemes(schemes, profile)
  return MatchResponse(
      matches=matches,
      profile_summary={
          "applying_for": profile.applying_for,
          "has_income": profile.income_amount is not None,
          "income_period": profile.income_period,
          "fact_count": len(profile.facts),
      }
  )

@app.get("/api/schemes")
def get_schemes():
  """Cacheable list of verified scholarship schemes."""
  schemes = get_loaded_schemes()
  return {"schemes": [s.model_dump() for s in schemes]}

# ==================================================
# PROTECTED ADMIN ROUTES (Require verified token + allowlisted email)
# ==================================================

SAMPLE_PROFILES_FILE = Path(__file__).resolve().parent.parent / "data" / "sample_profiles.json"

@app.get("/api/admin/check")
def check_admin(admin: dict = Depends(require_admin)):
  """Validates administrator authorization."""
  return {"status": "authorized"}

@app.post("/api/radar", response_model=RadarResponse)
def rule_change_radar(req: RadarRequest, admin: dict = Depends(require_admin)):
  """
  Before/after eligibility diff on synthetic sample profiles.
  Determines exactly which profiles changed tier and which rule caused it.
  """
  profiles_data = []
  if SAMPLE_PROFILES_FILE.exists():
    try:
      with open(SAMPLE_PROFILES_FILE, "r", encoding="utf-8") as f:
        profiles_data = json.load(f)
    except Exception:
      profiles_data = []

  # Determine baseline scheme: if provided, use it; else find in loaded schemes; else clone new scheme
  schemes = get_loaded_schemes()
  baseline = req.baseline_scheme
  if not baseline:
    baseline = next((s for s in schemes if s.id == req.scheme.id), None)
  if not baseline:
    # Baseline with first rule only or empty rules
    baseline = Scheme(
        id=req.scheme.id,
        name=req.scheme.name,
        category=req.scheme.category,
        target_group=req.scheme.target_group,
        rules=[],
    )

  impacts: List[ProfileImpact] = []
  newly_eligible = 0
  lost_eligibility = 0
  unchanged = 0

  for p in profiles_data:
    p_id = p["id"]
    p_name = p["name"]
    prof_obj = UserProfile(**p["profile"])

    old_match = evaluate_scheme(baseline, prof_obj)
    new_match = evaluate_scheme(req.scheme, prof_obj)

    changed = old_match.tier != new_match.tier
    causing_rules: List[str] = []

    if changed:
      # Compare evaluated rules
      old_rules_map = {r.field: r.status for r in old_match.rules_evaluated}
      for nr in new_match.rules_evaluated:
        old_status = old_rules_map.get(nr.field, "not_evaluated")
        if old_status != nr.status:
          causing_rules.append(f"{nr.rule_label}: {old_status} -> {nr.status}")

      if not causing_rules and len(req.scheme.rules) != len(baseline.rules):
        causing_rules.append(f"Scheme rules count changed ({len(baseline.rules)} -> {len(req.scheme.rules)})")

      if new_match.tier == "likely" and old_match.tier != "likely":
        newly_eligible += 1
      elif old_match.tier == "likely" and new_match.tier != "likely":
        lost_eligibility += 1
    else:
      unchanged += 1

    impacts.append(
        ProfileImpact(
            profile_id=p_id,
            profile_name=p_name,
            old_tier=old_match.tier,
            new_tier=new_match.tier,
            changed=changed,
            causing_rules=causing_rules,
        )
    )

  return RadarResponse(
      total_profiles=len(profiles_data),
      newly_eligible_count=newly_eligible,
      lost_eligibility_count=lost_eligibility,
      unchanged_count=unchanged,
      impacts=impacts,
  )

@app.post("/api/errors")
def submit_error_report(report: ErrorReport):
  """Public endpoint for users to report scheme discrepancies."""
  item = report.model_dump()
  item["id"] = f"err_{len(ADMIN_ERROR_REPORTS) + 1}"
  ADMIN_ERROR_REPORTS.append(item)
  return {"status": "received", "id": item["id"]}

@app.get("/api/admin/errors")
def get_error_reports(admin: dict = Depends(require_admin)):
  """List of user-reported scheme inaccuracies."""
  return {"reports": ADMIN_ERROR_REPORTS}

@app.post("/api/admin/errors/resolve")
def resolve_error_report(report_id: str, admin: dict = Depends(require_admin)):
  """Marks a user error report as resolved."""
  for r in ADMIN_ERROR_REPORTS:
    if r.get("id") == report_id:
      r["resolved"] = True
      return {"status": "resolved", "id": report_id}
  return {"status": "not_found"}



