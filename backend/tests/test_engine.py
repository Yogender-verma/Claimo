import pytest
from app.models import Rule, Document, Scheme, UserProfile
from app.engine import (
    compute_annual_income,
    evaluate_operator,
    evaluate_rule,
    generate_near_miss_explanation,
    sort_documents_topological,
    evaluate_scheme,
    match_all_schemes,
)

# ==================================================
# TEST-ONLY FIXTURES (Never in /backend/data/schemes.json)
# ==================================================

TEST_SCHEME_A = Scheme(
    id="TEST_SCHEME_A",
    name="Test Scholarship For Intermediate SC/ST",
    category="education",
    target_group="Intermediate Students",
    rules=[
        Rule(
            field="income",
            operator="less_than_or_equal",
            value=200000,
            source_clause="G.O.Ms.No. 12, Clause 4(a)",
            description="Annual family income must not exceed Rs 2,00,000",
            rule_label="Family income <= 2,00,000"
        ),
        Rule(
            field="caste",
            operator="in_list",
            value=["SC", "ST"],
            source_clause="Clause 2(b)",
            description="Applicant must belong to SC or ST category",
            rule_label="Category: SC or ST"
        ),
        Rule(
            field="current_course",
            operator="equals",
            value="intermediate",
            source_clause="Clause 3",
            description="Must be enrolled in Intermediate course",
            rule_label="Course: Intermediate"
        ),
    ],
    documents=[
        Document(
            id="doc_caste",
            name="Caste Certificate",
            issuer="MeeSeva / Revenue Dept",
            official_fee="0",
            prerequisites=[]
        ),
        Document(
            id="doc_income",
            name="Income Certificate",
            issuer="MeeSeva / Revenue Dept",
            official_fee="0",
            prerequisites=[]
        ),
        Document(
            id="doc_bonafide",
            name="College Bonafide Certificate",
            issuer="Junior College Principal",
            official_fee="0",
            prerequisites=[]
        ),
    ],
    official_apply_link="https://test.telangana.gov.in/apply",
    official_source_link="https://test.telangana.gov.in/rules",
    last_verified="2026-01-15",
    verified_by="Tester",
    checked_by="Reviewer",
    official_fee="0",
    grievance_contact="grievance@test.telangana.gov.in",
)

TEST_SCHEME_THRESHOLD = Scheme(
    id="TEST_SCHEME_THRESHOLD",
    name="Test Threshold Scheme",
    category="merit",
    target_group="High Scorers",
    rules=[
        Rule(
            field="marks_percentage",
            operator="greater_than_or_equal",
            value=60.0,
            source_clause="Rule 5.1",
            rule_label="Minimum 60% marks"
        ),
        Rule(
            field="attendance",
            operator="greater_than",
            value=75.0,
            source_clause="Rule 5.2",
            rule_label="Attendance above 75%"
        ),
        Rule(
            field="backlogs",
            operator="less_than",
            value=2,
            source_clause="Rule 5.3",
            rule_label="Backlogs less than 2"
        ),
    ],
    documents=[],
)

TEST_SCHEME_DOCS = Scheme(
    id="TEST_SCHEME_DOCS",
    name="Test Document Prerequisite Scheme",
    category="general",
    target_group="All Students",
    rules=[],
    documents=[
        Document(id="doc_c", name="Final Application Form", issuer="Dept", prerequisites=["doc_b"]),
        Document(id="doc_a", name="Basic Ration Card / Residence", issuer="Civil Supplies", prerequisites=[]),
        Document(id="doc_b", name="Income Certificate", issuer="MeeSeva", prerequisites=["doc_a"]),
    ],
)

TEST_SCHEME_CYCLE = Scheme(
    id="TEST_SCHEME_CYCLE",
    name="Test Cyclic Prerequisite Scheme",
    category="invalid",
    target_group="None",
    rules=[],
    documents=[
        Document(id="doc_x", name="Doc X", issuer="Issuer 1", prerequisites=["doc_y"]),
        Document(id="doc_y", name="Doc Y", issuer="Issuer 2", prerequisites=["doc_x"]),
    ],
)

# ==================================================
# UNIT TESTS: INCOME CONVERSION
# ==================================================

def test_compute_annual_income_monthly():
  # Monthly calculation: 15,000 * 12 = 180,000
  assert compute_annual_income(15000, "month") == 180000.0
  assert compute_annual_income(15000, "Monthly") == 180000.0
  assert compute_annual_income(15000, "per month") == 180000.0

def test_compute_annual_income_yearly():
  # Yearly calculation: direct
  assert compute_annual_income(200000, "year") == 200000.0
  assert compute_annual_income(200000, "yearly") == 200000.0
  assert compute_annual_income(200000, "Annual") == 200000.0

def test_compute_annual_income_missing_or_invalid():
  # Missing period or amount must return None
  assert compute_annual_income(None, "month") is None
  assert compute_annual_income(200000, None) is None
  assert compute_annual_income(None, None) is None
  assert compute_annual_income(200000, "unknown_period") is None

# ==================================================
# UNIT TESTS: OPERATORS
# ==================================================

def test_operator_equals_and_not_equals():
  assert evaluate_operator("Intermediate", "equals", "intermediate") is True
  assert evaluate_operator("B.Tech", "equals", "intermediate") is False
  assert evaluate_operator(100, "equals", 100) is True
  assert evaluate_operator("Intermediate", "not_equals", "degree") is True
  assert evaluate_operator("Intermediate", "not_equals", "intermediate") is False

def test_operator_in_list():
  assert evaluate_operator("SC", "in_list", ["SC", "ST"]) is True
  assert evaluate_operator("sc", "in_list", ["SC", "ST"]) is True
  assert evaluate_operator("BC", "in_list", ["SC", "ST"]) is False

def test_operator_invalid():
  with pytest.raises(ValueError, match="Unsupported operator"):
    evaluate_operator("test", "magic_operator", "test")

# ==================================================
# UNIT TESTS: NUMERIC THRESHOLDS (UNDER, AT, OVER)
# ==================================================

def test_threshold_less_than_or_equal():
  rule = Rule(
      field="income",
      operator="less_than_or_equal",
      value=200000,
      source_clause="Clause 4(a)"
  )
  # Just under: 199,999 -> pass
  res_under = evaluate_rule(rule, {}, 199999.0)
  assert res_under.status == "pass"

  # Exactly at: 200,000 -> pass
  res_at = evaluate_rule(rule, {}, 200000.0)
  assert res_at.status == "pass"

  # Just over: 200,001 -> fail
  res_over = evaluate_rule(rule, {}, 200001.0)
  assert res_over.status == "fail"

def test_threshold_greater_than_or_equal():
  rule = Rule(
      field="marks_percentage",
      operator="greater_than_or_equal",
      value=60.0,
      source_clause="Rule 5.1"
  )
  # Just under: 59.9 -> fail
  assert evaluate_rule(rule, {"marks_percentage": 59.9}, None).status == "fail"
  # Exactly at: 60.0 -> pass
  assert evaluate_rule(rule, {"marks_percentage": 60.0}, None).status == "pass"
  # Just over: 60.1 -> pass
  assert evaluate_rule(rule, {"marks_percentage": 60.1}, None).status == "pass"

def test_threshold_greater_than():
  rule = Rule(
      field="attendance",
      operator="greater_than",
      value=75.0,
      source_clause="Rule 5.2"
  )
  # Just under: 74.9 -> fail
  assert evaluate_rule(rule, {"attendance": 74.9}, None).status == "fail"
  # Exactly at: 75.0 -> fail
  assert evaluate_rule(rule, {"attendance": 75.0}, None).status == "fail"
  # Just over: 75.1 -> pass
  assert evaluate_rule(rule, {"attendance": 75.1}, None).status == "pass"

def test_threshold_less_than():
  rule = Rule(
      field="backlogs",
      operator="less_than",
      value=2,
      source_clause="Rule 5.3"
  )
  # Just under: 1 -> pass
  assert evaluate_rule(rule, {"backlogs": 1}, None).status == "pass"
  # Exactly at: 2 -> fail
  assert evaluate_rule(rule, {"backlogs": 2}, None).status == "fail"
  # Just over: 3 -> fail
  assert evaluate_rule(rule, {"backlogs": 3}, None).status == "fail"

# ==================================================
# UNIT TESTS: MISSING FIELDS -> UNKNOWN
# ==================================================

def test_missing_facts_return_unknown():
  rule = Rule(field="caste", operator="equals", value="SC", source_clause="Clause 1")
  res = evaluate_rule(rule, {}, None)
  assert res.status == "unknown"
  assert res.actual_value is None

def test_missing_income_period_returns_unknown():
  # User gives income_amount=150000 but income_period is None
  profile = UserProfile(
      income_amount=150000,
      income_period=None,
      facts={"caste": "SC", "current_course": "intermediate"}
  )
  match = evaluate_scheme(TEST_SCHEME_A, profile)
  # Income rule must be unknown because annual income couldn't be calculated
  income_eval = next(r for r in match.rules_evaluated if r.field == "income")
  assert income_eval.status == "unknown"
  # Entire tier must be "possibly" (no failures, but 1 unknown)
  assert match.tier == "possibly"

# ==================================================
# UNIT TESTS: MONTHLY VS YEARLY IN SCHEME EVALUATION
# ==================================================

def test_monthly_income_pass():
  # 15,000/month = 180,000/yr <= 200,000 -> PASS
  profile = UserProfile(
      income_amount=15000,
      income_period="month",
      facts={"caste": "SC", "current_course": "intermediate"}
  )
  match = evaluate_scheme(TEST_SCHEME_A, profile)
  assert match.tier == "likely"
  assert all(r.status == "pass" for r in match.rules_evaluated)

def test_monthly_income_fail():
  # 20,000/month = 240,000/yr > 200,000 -> FAIL
  profile = UserProfile(
      income_amount=20000,
      income_period="month",
      facts={"caste": "SC", "current_course": "intermediate"}
  )
  match = evaluate_scheme(TEST_SCHEME_A, profile)
  assert match.tier == "not_likely"
  income_eval = next(r for r in match.rules_evaluated if r.field == "income")
  assert income_eval.status == "fail"
  assert income_eval.actual_value == 240000.0

# ==================================================
# UNIT TESTS: TIERS & NEAR-MISS
# ==================================================

def test_all_rules_pass_yields_likely():
  profile = UserProfile(
      income_amount=180000,
      income_period="year",
      facts={"caste": "ST", "current_course": "intermediate"}
  )
  match = evaluate_scheme(TEST_SCHEME_A, profile)
  assert match.tier == "likely"
  assert match.near_miss_explanation is None

def test_one_rule_fail_yields_not_likely_with_near_miss():
  profile = UserProfile(
      income_amount=210000,
      income_period="year",
      facts={"caste": "ST", "current_course": "intermediate"}
  )
  match = evaluate_scheme(TEST_SCHEME_A, profile)
  assert match.tier == "not_likely"
  assert match.near_miss_explanation is not None
  assert "Blocked by the income rule" in match.near_miss_explanation
  assert "200000" in match.near_miss_explanation
  assert "210000" in match.near_miss_explanation

def test_no_fails_but_missing_field_yields_possibly():
  profile = UserProfile(
      income_amount=150000,
      income_period="year",
      facts={"current_course": "intermediate"}  # missing caste
  )
  match = evaluate_scheme(TEST_SCHEME_A, profile)
  assert match.tier == "possibly"
  assert match.near_miss_explanation is None

# ==================================================
# UNIT TESTS: DOCUMENT TOPOLOGICAL SORT & CYCLE
# ==================================================

def test_document_topological_sort():
  # In TEST_SCHEME_DOCS: doc_b requires doc_a, doc_c requires doc_b
  # Correct prerequisite order MUST be: doc_a -> doc_b -> doc_c
  sorted_docs = sort_documents_topological(TEST_SCHEME_DOCS.documents)
  doc_ids = [d.id for d in sorted_docs]
  assert doc_ids == ["doc_a", "doc_b", "doc_c"]

def test_document_cycle_detection():
  # In TEST_SCHEME_CYCLE: doc_x requires doc_y and doc_y requires doc_x
  with pytest.raises(ValueError, match="Cycle detected in document prerequisites"):
    sort_documents_topological(TEST_SCHEME_CYCLE.documents)

# ==================================================
# UNIT TESTS: MATCH ALL SCHEMES ORDERING
# ==================================================

def test_match_all_schemes_sorts_by_tier():
  # Profile matches TEST_SCHEME_A, but fails TEST_SCHEME_THRESHOLD
  profile = UserProfile(
      income_amount=150000,
      income_period="year",
      facts={
          "caste": "SC",
          "current_course": "intermediate",
          "marks_percentage": 50.0,  # Fails threshold (needs 60)
          "attendance": 80.0,
          "backlogs": 0,
      }
  )
  matches = match_all_schemes([TEST_SCHEME_THRESHOLD, TEST_SCHEME_A], profile)
  # TEST_SCHEME_A is "likely", TEST_SCHEME_THRESHOLD is "not_likely"
  assert matches[0].scheme_id == "TEST_SCHEME_A"
  assert matches[0].tier == "likely"
  assert matches[1].scheme_id == "TEST_SCHEME_THRESHOLD"
  assert matches[1].tier == "not_likely"
