# Claimo Specification (SPEC.md)

**Project Name**: Claimo  
**Hackathon**: Codebenders ACE Builders' Hackathon 2026  
**Problem Statement 5**: "Claim What's Yours"  
**Tagline**: "From discovering your entitlement to completing your application."

---

## 1. Overview
Claimo is a web app designed to help low-income families and students in Telangana discover and complete applications for verified education and scholarship schemes.
The platform turns unstructured stories (in Telugu or English) into structured facts via an LLM, processes those facts deterministically via a Python rules engine, guides users on document acquisition order (topological sort), and tracks application deadlines.

---

## 2. Core Architectural Principles
1. **Code decides, AI translates**: The LLM extracts facts; a deterministic rules engine evaluates eligibility. The LLM never decides eligibility.
2. **Likely eligible, never guaranteed**: Every results screen emphasizes that official bodies make final decisions.
3. **Verified official data only**: Never invent schemes, dates, amounts, or limits. Unlisted fields are marked `"not_published"`.
4. **Zero ID collection**: Never collect or store Aadhaar, student IDs, phone contacts, or photos.
5. **Privacy first**: No server logging of story text, income values, or request bodies.
6. **User-reported tracking**: Status updates are purely user-reported; Claimo has no direct government portal integration.

---

## 3. Future & Roadmap Considerations

### Accounts & Authentication (Future)
* **Current Status**: Claimo is 100% guest-mode and requires no accounts or login.
* **Requirements if Accounts are Added Later**:
  * Must collect the absolute **minimum data** required (email address only).
  * Must **never collect Aadhaar, government ID numbers, phone contacts, or photos**.
  * Any proposed account workflow must undergo a formal **privacy page review and wording update** before implementation.
  * Must preserve the ability for users to use Claimo anonymously without an account.
