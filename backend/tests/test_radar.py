import json
from pathlib import Path
from app.models import Scheme, Rule, UserProfile
from app.main import rule_change_radar, RadarRequest

def test_radar_diff_synthetic_profiles():
  # Create baseline scheme: Income <= 100,000
  baseline = Scheme(
      id="TEST_SCHEME_RADAR",
      name="Radar Test Scholarship",
      category="education",
      target_group="Students",
      rules=[
          Rule(
              field="income",
              operator="less_than_or_equal",
              value=100000,
              source_clause="Clause 1",
              rule_label="Income <= 1 Lakh"
          ),
      ]
  )

  # Create updated scheme: Raise threshold to Income <= 200,000
  updated = Scheme(
      id="TEST_SCHEME_RADAR",
      name="Radar Test Scholarship",
      category="education",
      target_group="Students",
      rules=[
          Rule(
              field="income",
              operator="less_than_or_equal",
              value=200000,
              source_clause="Clause 1 (Amended)",
              rule_label="Income <= 2 Lakhs"
          ),
      ]
  )

  req = RadarRequest(scheme=updated, baseline_scheme=baseline)
  # Mock admin user dict
  admin_user = {"email": "admin@example.com"}

  resp = rule_change_radar(req, admin=admin_user)
  assert resp.total_profiles == 6
  # Several profiles between 100k and 200k (e.g. 150k SC inter, 120k ST degree, 180k Minority) become newly eligible!
  assert resp.newly_eligible_count > 0
  assert resp.lost_eligibility_count == 0

  # Check that changed profiles have causing_rules identified
  changed = [p for p in resp.impacts if p.changed]
  assert len(changed) > 0
  for p in changed:
    assert len(p.causing_rules) > 0
    assert "not_likely -> likely" in f"{p.old_tier} -> {p.new_tier}"
