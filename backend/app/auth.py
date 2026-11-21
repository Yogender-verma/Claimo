from fastapi import Header, HTTPException, Depends
from typing import Optional
import firebase_admin
from firebase_admin import credentials, auth as fb_auth

from app.config import (
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    ADMIN_EMAILS,
)

_firebase_initialized = False

def init_firebase_admin():
  global _firebase_initialized
  if _firebase_initialized:
    return True

  if not (FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY):
    return False

  try:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": FIREBASE_PROJECT_ID,
        "client_email": FIREBASE_CLIENT_EMAIL,
        "private_key": FIREBASE_PRIVATE_KEY,
    })
    firebase_admin.initialize_app(cred)
    _firebase_initialized = True
    return True
  except Exception:
    # Never log sensitive details or private keys
    return False

# Initialize on module load
init_firebase_admin()

def is_admin_service_ready() -> bool:
  global _firebase_initialized
  return _firebase_initialized

def verify_token(authorization: Optional[str] = Header(None)) -> dict:
  """
  Verifies the Firebase ID token from Authorization: Bearer <token>.
  Fails closed with 503 if backend credentials are not configured.
  Returns decoded token data without logging tokens or emails.
  """
  if not authorization or not authorization.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="Authentication token required")

  token = authorization.split("Bearer ", 1)[1].strip()
  if not token:
    raise HTTPException(status_code=401, detail="Authentication token required")

  if not is_admin_service_ready():
    # Fail closed for protected routes when secrets are unconfigured
    raise HTTPException(status_code=503, detail="Authentication service is unconfigured")

  try:
    decoded = fb_auth.verify_id_token(token)
    return {
        "uid": decoded.get("uid"),
        "email": (decoded.get("email") or "").lower(),
        "email_verified": bool(decoded.get("email_verified", False)),
    }
  except Exception:
    # Never log token or raw exception in reports
    raise HTTPException(status_code=401, detail="Invalid authentication token")

def require_admin(token_data: dict = Depends(verify_token)) -> dict:
  """
  Requires that the token belongs to an email on the ADMIN_EMAILS allowlist
  AND that email_verified is True.
  """
  email = token_data.get("email", "")
  email_verified = token_data.get("email_verified", False)

  if not email_verified:
    raise HTTPException(status_code=403, detail="Email verification required")

  if not email or email not in ADMIN_EMAILS:
    raise HTTPException(status_code=403, detail="Administrator privileges required")

  return token_data

