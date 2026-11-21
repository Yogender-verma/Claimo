# Claimo Specification (SPEC.md)

**Project Name**: Claimo  
**Hackathon**: Codebenders ACE Builders' Hackathon 2026  
**Problem Statement 5**: "Claim What's Yours"  
**Tagline**: "From discovering your entitlement to completing your application."

---

## 1. Overview
Claimo is a web app designed to help low-income families and intermediate/college students in Telangana discover and complete applications for verified education and scholarship schemes.

The platform extracts structured facts from user stories (in Telugu or English) using an LLM, evaluates eligibility deterministically via a Python rules engine, organizes document checklists in prerequisite order (topological sort), and tracks deadlines.

---

## 2. Architectural Updates & Changed Decisions
1. **Optional Authentication (Changed Decision)**:
   * **Earlier**: Completely anonymous, no login whatsoever.
   * **Updated**: Firebase Authentication is added for optional user accounts (Email/Password + Google Sign-In).
   * **Standing Rule**: Guest mode remains completely functional. The core journey (story input, confirmation card, scheme matches, document checklist, and application tracker) NEVER requires logging in.
   * **No Server User DB**: No Firestore, Realtime Database, or Firebase Storage. Progress is retained in browser `localStorage`.
2. **Admin Authorization (Changed Decision)**:
   * **Earlier**: Admin password checked from an environment variable.
   * **Updated**: Admin access requires a verified Firebase ID token passed via `Authorization: Bearer <token>`. Access is granted only if `email_verified == True` and the email is in the `ADMIN_EMAILS` allowlist.

---

## 3. Core Principles
* **Code decides, AI translates**: Deterministic Python rules engine makes all eligibility decisions.
* **Likely eligible, never guaranteed**: Clear disclaimers on all result screens.
* **Zero ID collection**: No Aadhaar, government IDs, phone numbers, or photos.
* **No sensitive server logging**: No logging of stories, income, request bodies, or auth tokens.

---

## 4. Deploy Notes
* **Firebase Authorized Domains**: Add your production and staging domains (e.g. `claimo.vercel.app`, `claimo.netlify.app`) to the Firebase Console under **Authentication -> Settings -> Authorized domains**.
* **Environment Variables**: Configure all public variables (`VITE_FIREBASE_*`, `VITE_API_BASE_URL`) on the frontend host and secret variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_EMAILS`) on the backend host.
* **Key Rotation**: If the `FIREBASE_PRIVATE_KEY` or service account credential is ever exposed, immediately revoke and re-issue the key in the Google Cloud / Firebase console and update host settings.
