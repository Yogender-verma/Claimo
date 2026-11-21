# Claimo · Demo Checklist & Deployment Guide

> **Tagline**: *"From discovering your entitlement to completing your application."*  
> **Target Audience**: Low-income intermediate and college students and their families in Telangana.

---

## 1. Quick 30-Second Hackathon Demo Flow

For judges and reviewers who want to see Claimo in under a minute:

1. **Landing Page (`/`)**:
   - Notice the high-contrast palette (passes WCAG AAA 7:1 for core text).
   - Click the **Dark / Light mode toggle** in the header — zero theme flash on refresh.
   - Click **తెలుగు | En** to toggle copy in real-time.
2. **Launch Story (`/story`)**:
   - Click any sample chip (e.g. *తెలుగు ఉదాహరణ 1* or *English Example 1*).
   - Or click **Speak story (Voice)** to test Web Speech API voice input.
   - Click **Extract Facts**.
3. **The Trust Screen (Confirmation Card)**:
   - Notice how all extracted facts are editable chips.
   - Notice the **Mandatory Income Frequency** (Month vs Year) — eligibility calculations strictly block until confirmed.
   - Notice that any Aadhaar or ID numbers typed in the story were automatically ignored/masked.
   - Click **See Eligible Schemes**.
4. **Matches (`/matches`)**:
   - Review the 3 tabs: **Likely eligible**, **Possibly: confirm one thing**, and **Not likely, and why**.
   - Toggle **Applying for: Me / My Child** to see matches recalculate dynamically without re-typing.
   - Notice the mandatory footer: *"Likely eligible, not guaranteed. The official office makes the final decision."*
5. **Scheme Detail (`/schemes/:id`)**:
   - Inspect the rule-by-rule breakdown with official G.O. clause citations.
   - See the **Fee Shield**: official application fee (₹0) and grievance contact.
   - Click **Listen in Telugu / వినండి** to hear read-aloud playback.
   - Click **Start this application** to add to tracker.
6. **Visit Plan (`/documents`)**:
   - Documents ordered strictly in prerequisite **"Get-This-First"** topological sequence.
   - Click **Print Visit Plan** to preview the clean one-page printable checklist for MeeSeva / college office visits.
7. **Application Tracker (`/applications`)**:
   - User-reported status with deadline countdown (*"Closes in X days"*).
   - Change status to **Rejected** to test the **Rejection Helper** with published appeal routes.
8. **Admin Rule Change Radar (`/admin`)**:
   - Sign in with an allowlisted admin email.
   - Adjust simulated income thresholds and click **Run Rule Change Radar**.
   - See instant before/after policy impact across 6 synthetic Telangana student profiles.

---

## 2. Pre-Demo Checklist & Free-Tier Wake-Up Notes

- [ ] **Backend Wake-Up Ping (Crucial for Render / Railway Free Tiers)**:
  - Free instances on Render/Railway sleep after 15 minutes of inactivity and take 30-50 seconds to spin up.
  - **Action**: 2 minutes before the presentation or demo, open your backend URL in a browser:
    ```
    https://your-claimo-backend.onrender.com/health
    ```
  - Verify it returns `{"status": "ok", "app": "Claimo"}`. Once awake, all requests respond within ~50ms.
- [ ] **Microphone Permission**:
  - Test browser microphone permissions beforehand if demonstrating voice input.
  - If microphone access is denied in your browser, Claimo displays a graceful fallback notice and keeps the text box active.
- [ ] **Screen Recording Settings**:
  - Record at 1080p (1920x1080) or mobile device preview mode (390px width).
  - Claimo is designed mobile-first and tested down to 360px without horizontal scroll.

---

## 3. Production Deployment Guide

### A. Frontend Deployment (Vercel or Netlify)

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   ```ini
   VITE_FIREBASE_API_KEY=AIzaSyBTe000o0T73qZQmyxK5n-sKD28jTNsw10
   VITE_FIREBASE_AUTH_DOMAIN=claim-77ef5.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=claim-77ef5
   VITE_FIREBASE_APP_ID=1:544584700510:web:2908511d2e26b591e59acf
   VITE_API_BASE_URL=https://your-claimo-backend.onrender.com
   ```
6. **Single Page App Routing**:
   - For Vercel: `frontend/vercel.json` rewrite:
     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
     ```
   - For Netlify: `frontend/public/_redirects`:
     ```
     /*    /index.html   200
     ```

### B. Backend Deployment (Render or Railway)

1. **Environment**: Python 3.11+
2. **Root Directory**: `backend` (or repo root with `backend` working dir)
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. **Environment Variables**:
   ```ini
   FRONTEND_URL=https://your-claimo-frontend.vercel.app
   ADMIN_EMAILS=admin@example.com,your-email@gmail.com
   FIREBASE_PROJECT_ID=claim-77ef5
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@claim-77ef5.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   MOCK_LLM=true
   LLM_API_KEY=
   ```

### C. Firebase Console Configuration

1. In Firebase Console under **Authentication -> Settings -> Authorized domains**:
   - Add your production domain: `your-claimo-frontend.vercel.app`
   - Add your custom domain if applicable.
2. Under **Sign-in method**:
   - Enable **Email/Password**.
   - Enable **Google**.

---

## 4. Verification & Test Commands

Run from the repository root:

```bash
# 1. Run all 33 backend pytest unit tests
python -m pytest backend/tests

# 2. Run Telugu story extraction score benchmark (6 cases, 100% accuracy)
python backend/scripts/score_telugu_test.py

# 3. Type check and build frontend app shell
cd frontend && npm run build
```
