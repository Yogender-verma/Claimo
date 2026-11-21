# Claimo Core Standing Rules (RULES.md)

These principles must never be broken under any circumstances.

---

## 1. Core Logic & AI Boundary
* **Code decides, AI translates**: The LLM only converts user stories into structured facts. A deterministic Python rules engine decides eligibility. The LLM never decides eligibility.
* **Always "likely eligible", never "guaranteed"**: Every results screen has the footer:
  > *"Likely eligible, not guaranteed. The official office makes the final decision."*
* **Never invent or guess scheme details**: Any field not officially published is stored as `"not_published"` and displayed as *"Not published by the scheme"*.

---

## 2. Privacy & Data Minimization
* **Zero ID Collection**: Never collect Aadhaar, ID card numbers, phone numbers, contacts, photos, or school/college names. Ignore any ID typed in stories.
* **Zero Sensitive Logging**: Never log request bodies, story text, income values, email addresses, or auth tokens.
* **Storage Location**: User progress remains in browser `localStorage` only.
* **No Database / Cloud Storage**: Do NOT use Firestore, Realtime Database, or Firebase Storage.
* **Email Only for Auth**: If a user creates an account or signs in with Google, collect and store the email address only. Do NOT store names or avatar photos.

---

## 3. Authentication & Access Control
* **Guest Mode First**: Signing in is 100% optional. The entire student journey works without logging in.
* **Token Verification on Backend**: All protected admin routes must verify the Firebase ID token in FastAPI using `firebase-admin`.
* **Admin by Allowlist Only**:
  * An admin request must have a valid Firebase ID token.
  * The user's `email_verified` claim must be `True`.
  * The email address must exist in the backend `ADMIN_EMAILS` allowlist.
  * Environment variable passwords (e.g. `ADMIN_PASSWORD`) are prohibited.
* **Fail Closed**: If backend Firebase credentials are missing or invalid, protected admin routes return `503 Service Unavailable` with a safe error message, without degrading public routes (`/health`, `/api/extract`, `/api/match`, `/api/schemes`).

---

## 4. Application Status & Ground Truth
* **User-Reported Status Only**: Label application tracking as user-reported with the disclaimer:
  > *"Claimo cannot see the official status. Check the official portal."*
* **Synthetic Testing Only**: Use synthetic sample profiles for tests. Never use real student data.
* **Do Not Falsify Tests**: Official scheme rules are the single source of truth. Never alter a test or threshold to force a pass.
