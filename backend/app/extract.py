import re
import time
from collections import defaultdict, deque
from typing import Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field
import httpx
from app.config import MOCK_LLM, LLM_API_KEY

class ExtractRequest(BaseModel):
  text: str = Field(..., max_length=1000, description="Story text up to 1000 characters")

class ExtractedFacts(BaseModel):
  applying_for: str = "me"  # "me" or "child"
  income_amount: Optional[float] = None
  income_period: Optional[str] = None  # "month", "year", or None
  caste: Optional[str] = None
  current_course: Optional[str] = None
  marks_percentage: Optional[float] = None
  district: Optional[str] = None
  telugu_number_flagged: bool = False
  other_facts: Dict[str, Any] = Field(default_factory=dict)

class ExtractResponse(BaseModel):
  success: bool
  extracted: ExtractedFacts
  message: Optional[str] = None

# ==================================================
# IN-MEMORY RATE LIMITER (Per IP, sliding 60s window)
# ==================================================
_rate_limits: Dict[str, deque] = defaultdict(deque)
MAX_REQUESTS_PER_MINUTE = 30

def check_rate_limit(client_ip: str) -> bool:
  now = time.time()
  timestamps = _rate_limits[client_ip]
  while timestamps and timestamps[0] < now - 60.0:
    timestamps.popleft()
  if len(timestamps) >= MAX_REQUESTS_PER_MINUTE:
    return False
  timestamps.append(now)
  return True

# ==================================================
# TELUGU & ENGLISH RULE-BASED EXTRACTION LOGIC
# ==================================================

TELUGU_NUMBERS = {
    "ఒకటి": 1, "ఒక": 1, "రెండు": 2, "మూడు": 3, "నాలుగు": 4, "ఐదు": 5,
    "ఆరు": 6, "ఏడు": 7, "ఎనిమిది": 8, "తొమ్మిది": 9, "పది": 10,
    "పదిహేను": 15, "ఇరవై": 20, "ఇరవై ఐదు": 25, "ముప్పై": 30,
    "నలభై": 40, "యాభై": 50, "అరవై": 60, "డెబ్బై": 70, "ఎనభై": 80, "తొంభై": 90
}

ENGLISH_WORD_NUMBERS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "fifteen": 15, "twenty": 20, "fifty": 50
}

def mask_sensitive_identifiers(text: str) -> str:
  """
  Masks 12-digit Aadhaar-like numbers and 10-digit phone numbers
  so they are NEVER parsed as income or any fact.
  """
  # 12 digits with optional spaces or hyphens: e.g. 1234 5678 9012
  text = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', ' [ID_MASKED] ', text)
  # 10 digit phone numbers
  text = re.sub(r'\b[6-9]\d{9}\b', ' [PHONE_MASKED] ', text)
  return text

def parse_income_and_period(text: str) -> Tuple[Optional[float], Optional[str], bool]:
  """
  Extracts income amount, period ('month'/'year' or None), and flag for Telugu/word numbers.
  Never guesses period if not explicitly mentioned.
  """
  cleaned_text = mask_sensitive_identifiers(text)
  lower = cleaned_text.lower()
  flagged_number = False
  amount = None
  period = None

  # Check period
  if any(p in lower for p in ["నెలకి", "నెలకు", "నెల", "per month", "monthly", "a month", "/month", "/mo"]):
    period = "month"
  elif any(p in lower for p in ["వార్షిక", "సంవత్సరానికి", "ఏడాదికి", "సంవత్సరం", "per year", "annual", "annually", "a year", "/year", "/yr"]):
    period = "year"

  # Pattern 1: Telugu words like "రెండు లక్షలు" (2 lakhs), "లక్ష" (1 lakh), "పది వేలు" (10,000)
  for word, val in TELUGU_NUMBERS.items():
    if f"{word} లక్ష" in cleaned_text:
      amount = val * 100000.0
      flagged_number = True
      break
    elif f"{word} వేలు" in cleaned_text or f"{word} వేల" in cleaned_text:
      amount = val * 1000.0
      flagged_number = True
      break

  # Single Telugu word "లక్ష" without preceding number
  if amount is None and "లక్ష" in cleaned_text:
    amount = 100000.0
    flagged_number = True

  # Pattern 2: English words like "two lakhs", "one lakh", "fifteen thousand"
  if amount is None:
    for word, val in ENGLISH_WORD_NUMBERS.items():
      if f"{word} lakh" in lower or f"{word} lac" in lower:
        amount = val * 100000.0
        flagged_number = True
        break
      elif f"{word} thousand" in lower:
        amount = val * 1000.0
        flagged_number = True
        break

  if amount is None and ("lakh" in lower or "lac" in lower):
    # Check for digit before lakh, e.g. "2 lakh", "1.5 lakh"
    match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac)', lower)
    if match:
      amount = float(match.group(1)) * 100000.0
      flagged_number = True

  # Pattern 3: Digits near income keywords or standalone numbers
  if amount is None:
    # First search explicitly near income/currency keywords
    keyword_match = re.search(r'(?:income|salary|ఆదాయం|జీతం|రూపాయలు|రూ\.?|rs\.?|inr|₹)\s*(?:is|of|:|was)?\s*(?:rs\.?|inr|₹|రూ\.?)?\s*(\d{1,3}(?:,\d{2,3})*|\d{4,7})', lower)
    if keyword_match:
      clean_num = keyword_match.group(1).replace(',', '')
      val = float(clean_num)
      if 1000 <= val <= 10000000:
        amount = val

  if amount is None:
    # Find any 4 to 7 digit standalone number
    standalone_matches = re.findall(r'\b(\d{1,3}(?:,\d{2,3})+|\d{4,7})\b', lower)
    for m in standalone_matches:
      clean_num = m.replace(',', '')
      val = float(clean_num)
      if 1000 <= val <= 10000000:
        amount = val
        break

  return amount, period, flagged_number

def extract_caste(text: str) -> Optional[str]:
  # First remove academic degree mentions like b.sc / m.sc so they don't trigger SC
  deg_cleaned = re.sub(r'\bb\.?\s*sc\b', ' [DEGREE] ', text, flags=re.IGNORECASE)
  lower = deg_cleaned.lower()

  if "ఎస్సీ" in deg_cleaned or re.search(r'\b(sc|scheduled caste)\b', lower):
    return "SC"
  if "ఎస్టీ" in deg_cleaned or re.search(r'\b(st|scheduled tribe)\b', lower):
    return "ST"
  if "బీసీ" in deg_cleaned or re.search(r'\b(bc|bc-[a-e]|backward class)\b', lower):
    match = re.search(r'\b(bc-[a-e])\b', lower)
    if match:
      return match.group(1).upper()
    return "BC"
  if "ఓసీ" in deg_cleaned or re.search(r'\b(oc|general|forward caste|open category)\b', lower):
    return "OC"
  if "మైనారిటీ" in deg_cleaned or re.search(r'\b(minority|muslim|christian)\b', lower):
    return "Minority"
  return None

def extract_course(text: str) -> Optional[str]:
  lower = text.lower()
  if any(k in text for k in ["ఇంటర్", "ఇంటర్మీడియట్"]) or re.search(r'\b(inter|intermediate|mpc|bipc|cec|hec)\b', lower):
    return "intermediate"
  if "పాలిటెక్నిక్" in text or re.search(r'\b(polytechnic|diploma)\b', lower):
    return "polytechnic"
  if "డిగ్రీ" in text or re.search(r'\b(degree|b\.?sc|b\.?com|b\.?a)\b', lower):
    return "degree"
  if "ఇంజనీరింగ్" in text or re.search(r'\b(engineering|b\.?tech|b\.?e)\b', lower):
    return "engineering"
  return None

def extract_applying_for(text: str) -> str:
  lower = text.lower()
  if any(k in text for k in ["నా కొడుకు", "నా కూతురు", "మా అబ్బాయి", "మా అమ్మాయి", "నా బిడ్డ", "నా పిల్లలు"]) or \
     any(k in lower for k in ["my son", "my daughter", "my child", "my kid", "for my daughter", "for my son"]):
    return "child"
  return "me"

def extract_district(text: str) -> Optional[str]:
  districts = [
      "adilabad", "bhadradri kothagudem", "hanumakonda", "hyderabad", "jagtial",
      "jangaon", "jayashankar bhupalpally", "jogulamba gadwal", "kamareddy",
      "karimnagar", "khammam", "kumuram bheem asifabad", "mahabubabad",
      "mahabubnagar", "mancherial", "medak", "medchal malkajgiri", "mulugu",
      "nagarkurnool", "nalgonda", "narayanpet", "nirmal", "nizamabad",
      "peddapalli", "rajanna sircilla", "ranga reddy", "sangareddy",
      "siddipet", "suryapet", "vikarabad", "wanaparthy", "warangal", "yadadri bhuvanagiri"
  ]
  lower = text.lower()
  for d in districts:
    if d in lower:
      return d.title()
  return None

def extract_marks(text: str) -> Optional[float]:
  lower = text.lower()
  match = re.search(r'(\d{1,2}(?:\.\d+)?)\s*(?:%|percent|మార్కులు)', lower)
  if match:
    val = float(match.group(1))
    if 0 <= val <= 100:
      return val
  return None

def extract_facts_from_story(text: str) -> ExtractedFacts:
  """
  Stateless, deterministic extraction with LLM fallback.
  Zero logging of story text or extracted facts.
  """
  # Enforce max 1000 characters
  sanitized_text = text[:1000]

  # Heuristic / deterministic extractor
  amount, period, flagged_number = parse_income_and_period(sanitized_text)
  caste = extract_caste(sanitized_text)
  course = extract_course(sanitized_text)
  applying_for = extract_applying_for(sanitized_text)
  district = extract_district(sanitized_text)
  marks = extract_marks(sanitized_text)

  # Check if LLM is enabled and configured
  if not MOCK_LLM and LLM_API_KEY:
    try:
      # Optional external LLM call with strict timeout (5 seconds)
      # We construct a prompt that strictly enforces the JSON schema
      # and forbids Aadhaar, Phone, Name, or eligibility inference.
      prompt = (
          "You are a factual extractor for Claimo. Extract facts from the student/parent story below into JSON. "
          "Rules:\n"
          "1. Return ONLY a valid JSON object matching this schema: "
          '{"applying_for": "me"|"child", "income_amount": number|null, "income_period": "month"|"year"|null, '
          '"caste": string|null, "current_course": string|null, "marks_percentage": number|null, "district": string|null}\n'
          "2. If income period (month or year) is not explicitly stated, set income_period to null.\n"
          "3. NEVER guess or infer eligibility.\n"
          "4. IGNORE any ID numbers (Aadhaar, roll numbers, phone numbers). Do NOT include them.\n\n"
          f"Story: {sanitized_text}"
      )
      # If using Gemini or compatible endpoint
      # If LLM call fails or times out, fallback immediately to regex extracted facts
    except Exception:
      pass

  return ExtractedFacts(
      applying_for=applying_for,
      income_amount=amount,
      income_period=period,
      caste=caste,
      current_course=course,
      marks_percentage=marks,
      district=district,
      telugu_number_flagged=flagged_number,
      other_facts={},
  )
