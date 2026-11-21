from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.auth import require_admin

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

# ==================================================
# PUBLIC ROUTES (No login required - ever)
# ==================================================

@app.get("/health")
def health_check():
  return {"status": "ok", "app": "Claimo"}

@app.post("/api/extract")
def extract_facts():
  """Story text to facts via LLM (to be implemented in engine phase)."""
  return {"status": "ready", "facts": {}}

@app.post("/api/match")
def match_schemes():
  """Stateless deterministic rules engine matching."""
  return {"status": "ready", "matches": []}

@app.get("/api/schemes")
def get_schemes():
  """Cacheable list of verified scholarship schemes."""
  return {"schemes": []}

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
