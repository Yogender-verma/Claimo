from fastapi.testclient import TestClient
from app.main import app
from app.extract import extract_facts_from_story, check_rate_limit

client = TestClient(app)

def test_extract_facts_telugu_intermediate():
  text = "నేను ఇంటర్మీడియట్ మొదటి సంవత్సరం చదువుతున్నాను. మా కుటుంబ వార్షిక ఆదాయం లక్ష రూపాయలు. మేము ఎస్సీ కులానికి చెందినవారము."
  res = extract_facts_from_story(text)
  assert res.applying_for == "me"
  assert res.income_amount == 100000.0
  assert res.income_period == "year"
  assert res.caste == "SC"
  assert res.current_course == "intermediate"
  assert res.telugu_number_flagged is True

def test_extract_facts_ignores_aadhaar_and_requires_period():
  text = "నా పేరు రాజు. నా ఆధార్ నెంబర్ 1234 5678 9012. నేను ఇంటర్ చదువుతున్నాను. మా ఆదాయం 50000."
  res = extract_facts_from_story(text)
  assert res.income_amount == 50000.0
  assert res.income_period is None  # Must NOT guess month or year
  assert res.current_course == "intermediate"

def test_extract_facts_child_application():
  text = "My son is studying polytechnic diploma 2nd year. Monthly income is 15000. BC-B caste in Warangal district."
  res = extract_facts_from_story(text)
  assert res.applying_for == "child"
  assert res.income_amount == 15000.0
  assert res.income_period == "month"
  assert res.caste == "BC-B"
  assert res.current_course == "polytechnic"
  assert res.district == "Warangal"

def test_api_extract_endpoint():
  response = client.post("/api/extract", json={"text": "I am studying intermediate. Family income is 150000 per year. SC caste."})
  assert response.status_code == 200
  data = response.json()
  assert data["success"] is True
  assert data["extracted"]["caste"] == "SC"
  assert data["extracted"]["income_amount"] == 150000.0
  assert data["extracted"]["income_period"] == "year"
  assert data["extracted"]["current_course"] == "intermediate"

def test_api_extract_length_limit():
  # Max length 1000 characters
  long_text = "a" * 1005
  response = client.post("/api/extract", json={"text": long_text})
  assert response.status_code == 422  # Pydantic validation error for > 1000 chars
