import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
import app.auth as auth_module

client = TestClient(app)

ADMIN_EMAIL = "admin@example.com"

@pytest.fixture(autouse=True)
def setup_admin_allowlist(monkeypatch):
  # Ensure admin@example.com is in allowlist for tests
  monkeypatch.setattr(auth_module, "ADMIN_EMAILS", {ADMIN_EMAIL})
  # Simulate ready service by default in tests
  monkeypatch.setattr(auth_module, "_firebase_initialized", True)

def test_public_routes_unprotected():
  """Public routes must remain fully accessible without any token."""
  res_health = client.get("/health")
  assert res_health.status_code == 200
  assert res_health.json()["status"] == "ok"

  res_schemes = client.get("/api/schemes")
  assert res_schemes.status_code == 200

def test_admin_route_no_token():
  """Admin route without token must return 401."""
  res = client.get("/api/admin/check")
  assert res.status_code == 401
  assert "token required" in res.json()["detail"].lower()

def test_admin_route_invalid_token():
  """Admin route with invalid/tampered token must return 401."""
  with patch("firebase_admin.auth.verify_id_token", side_effect=Exception("Invalid signature")):
    res = client.get("/api/admin/check", headers={"Authorization": "Bearer bad-token"})
    assert res.status_code == 401
    assert "invalid" in res.json()["detail"].lower()

def test_admin_route_valid_non_admin():
  """Valid token for an email not in allowlist must return 403."""
  mock_decoded = {
      "uid": "user-123",
      "email": "student@example.com",
      "email_verified": True,
  }
  with patch("firebase_admin.auth.verify_id_token", return_value=mock_decoded):
    res = client.get("/api/admin/check", headers={"Authorization": "Bearer valid-student-token"})
    assert res.status_code == 403
    assert "administrator privileges required" in res.json()["detail"].lower()

def test_admin_route_valid_admin_unverified_email():
  """Valid admin email but unverified must return 403."""
  mock_decoded = {
      "uid": "admin-123",
      "email": ADMIN_EMAIL,
      "email_verified": False,
  }
  with patch("firebase_admin.auth.verify_id_token", return_value=mock_decoded):
    res = client.get("/api/admin/check", headers={"Authorization": "Bearer valid-unverified-admin"})
    assert res.status_code == 403
    assert "email verification required" in res.json()["detail"].lower()

def test_admin_route_valid_admin_verified():
  """Allowlisted admin with verified email must return 200."""
  mock_decoded = {
      "uid": "admin-123",
      "email": ADMIN_EMAIL,
      "email_verified": True,
  }
  with patch("firebase_admin.auth.verify_id_token", return_value=mock_decoded):
    res = client.get("/api/admin/check", headers={"Authorization": "Bearer valid-admin-token"})
    assert res.status_code == 200
    assert res.json() == {"status": "authorized"}

def test_admin_route_fail_closed_when_unconfigured(monkeypatch):
  """If backend secrets are not configured, protected routes fail closed with 503 while public routes stay up."""
  monkeypatch.setattr(auth_module, "_firebase_initialized", False)

  res_admin = client.get("/api/admin/check", headers={"Authorization": "Bearer any-token"})
  assert res_admin.status_code == 503
  assert "unconfigured" in res_admin.json()["detail"].lower()

  # Public route must still function cleanly
  res_health = client.get("/health")
  assert res_health.status_code == 200
