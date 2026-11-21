import os
import json
from pathlib import Path
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.auth import require_admin
from app.models import UserProfile, Scheme, MatchResponse, SchemeMatch
from app.engine import match_all_schemes

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

@app.post("/api/extract")
def extract_facts():
  """Story text to facts via LLM (to be implemented in Part 2)."""
  return {"status": "ready", "facts": {}}

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

@app.get("/api/admin/check")
def check_admin(admin: dict = Depends(require_admin)):
  """Validates administrator authorization."""
  return {"status": "authorized"}

@app.post("/api/radar")
def rule_change_radar(admin: dict = Depends(require_admin)):
  """Before/after eligibility diff on synthetic sample profiles."""
  return {"status": "ok", "diff": {}}

@app.get("/api/admin/errors")
def get_error_reports(admin: dict = Depends(require_admin)):
  """List of user-reported scheme inaccuracies."""
  return {"reports": []}


