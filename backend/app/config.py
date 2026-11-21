import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load the single root .env file
root_dir = Path(__file__).resolve().parent.parent.parent
env_path = root_dir / '.env'
if env_path.exists():
  load_dotenv(dotenv_path=env_path)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Firebase Admin credentials
FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', '')
FIREBASE_CLIENT_EMAIL = os.getenv('FIREBASE_CLIENT_EMAIL', '')
raw_private_key = os.getenv('FIREBASE_PRIVATE_KEY', '')
FIREBASE_PRIVATE_KEY = raw_private_key.replace('\\n', '\n') if raw_private_key else ''

# Admin emails allowlist (case-insensitive set)
raw_admin_emails = os.getenv('ADMIN_EMAILS', '')
ADMIN_EMAILS: set[str] = {
    email.strip().lower()
    for email in raw_admin_emails.split(',')
    if email.strip()
}

# LLM Configuration
MOCK_LLM = os.getenv('MOCK_LLM', 'true').strip().lower() in ('true', '1', 'yes')
LLM_API_KEY = os.getenv('LLM_API_KEY', '').strip()


