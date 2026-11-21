from typing import Any, List, Dict, Optional, Set
from collections import defaultdict, deque
from app.models import (
    Scheme,
    Rule,
    Document,
    UserProfile,
    RuleEvaluation,
    SchemeMatch,
)

def compute_annual_income(amount: Optional[float], period: Optional[str]) -> Optional[float]:
  """
  Converts income to yearly amount from income_amount + income_period.
  Returns None if either is missing, period is invalid, or amount is None.
  """
  if amount is None or period is None:
    return None
  period_clean = str(period).strip().lower()
  if period_clean in ('month', 'per month', 'monthly', 'm'):
    return float(amount) * 12.0
  elif period_clean in ('year', 'per year', 'yearly', 'annual', 'annually', 'y'):
    return float(amount)
  return None

def evaluate_operator(actual: Any, operator: str, expected: Any) -> bool:
  op = operator.lower().strip()
  if op == 'equals':
    if isinstance(actual, str) and isinstance(expected, str):
      return actual.strip().lower() == expected.strip().lower()
    return actual == expected
  elif op == 'not_equals':
    if isinstance(actual, str) and isinstance(expected, str):
      return actual.strip().lower() != expected.strip().lower()
    return actual != expected
  elif op == 'less_than':
    return float(actual) < float(expected)
  elif op == 'less_than_or_equal':
    return float(actual) <= float(expected)
  elif op == 'greater_than':
    return float(actual) > float(expected)
  elif op == 'greater_than_or_equal':
    return float(actual) >= float(expected)
  elif op == 'in_list':
    if not isinstance(expected, (list, tuple, set)):
      expected = [expected]
    expected_normalized = [str(x).strip().lower() for x in expected]
    if isinstance(actual, (list, tuple, set)):
      return any(str(x).strip().lower() in expected_normalized for x in actual)
    return str(actual).strip().lower() in expected_normalized
  else:
    raise ValueError(f"Unsupported operator: {operator}")

def evaluate_rule(rule: Rule, facts: Dict[str, Any], annual_income: Optional[float]) -> RuleEvaluation:
  field = rule.field.strip().lower()

  # Check if rule evaluates income
  if field in ('income', 'family_income', 'annual_income', 'family_income_yearly'):
    actual_value = annual_income
  else:
    actual_value = facts.get(rule.field)
    if actual_value is None:
      # Try case-insensitive lookup
      for k, v in facts.items():
        if k.lower() == field:
          actual_value = v
          break

  rule_label = rule.rule_label or rule.description or f"{rule.field} {rule.operator} {rule.value}"

  if actual_value is None:
    return RuleEvaluation(
        field=rule.field,
        operator=rule.operator,
        expected_value=rule.value,
        actual_value=None,
        status="unknown",
        source_clause=rule.source_clause,
        rule_label=rule_label,
    )

  try:
    passed = evaluate_operator(actual_value, rule.operator, rule.value)
    status = "pass" if passed else "fail"
  except (ValueError, TypeError):
    status = "unknown"

  return RuleEvaluation(
      field=rule.field,
      operator=rule.operator,
      expected_value=rule.value,
      actual_value=actual_value,
      status=status,
      source_clause=rule.source_clause,
      rule_label=rule_label,
  )

def generate_near_miss_explanation(failed_rules: List[RuleEvaluation]) -> Optional[str]:
  """
  Builds a plain sentence strictly from the failed rules' own data.
  Never invents or assumes outside data.
  """
  if not failed_rules:
    return None

  # Pick the primary blocking rule
  rule = failed_rules[0]
  field_name = rule.field.replace('_', ' ')
  op = rule.operator.lower()

  if op in ('less_than_or_equal', 'less_than'):
    return (
        f"Blocked by the {field_name} rule. It would change if your verified "
        f"{field_name} is within {rule.expected_value} (current: {rule.actual_value})."
    )
  elif op in ('greater_than_or_equal', 'greater_than'):
    return (
        f"Blocked by the {field_name} rule. It would change if your verified "
        f"{field_name} is at least {rule.expected_value} (current: {rule.actual_value})."
    )
  elif op == 'in_list':
    allowed = ", ".join(str(x) for x in rule.expected_value) if isinstance(rule.expected_value, list) else str(rule.expected_value)
    return (
        f"Blocked by the {field_name} rule. It would change if your {field_name} "
        f"matches one of: {allowed}."
    )
  elif op == 'equals':
    return (
        f"Blocked by the {field_name} rule. It would change if your {field_name} "
        f"is {rule.expected_value}."
    )
  else:
    return f"Blocked by rule requirement: {rule.rule_label}."

def sort_documents_topological(documents: List[Document]) -> List[Document]:
  """
  Sorts documents in get-this-first order using prerequisites.
  Raises ValueError on prerequisite cycle.
  """
  if not documents:
    return []

  doc_map = {doc.id: doc for doc in documents}
  in_degree = {doc.id: 0 for doc in documents}
  graph = defaultdict(list)

  for doc in documents:
    for prereq_id in doc.prerequisites:
      if prereq_id in doc_map:
        # prereq_id must come before doc.id
        graph[prereq_id].append(doc.id)
        in_degree[doc.id] += 1

  # Queue with in_degree == 0
  queue = deque([doc_id for doc_id, deg in in_degree.items() if deg == 0])
  ordered_ids = []

  while queue:
    curr = queue.popleft()
    ordered_ids.append(curr)
    for neighbor in graph[curr]:
      in_degree[neighbor] -= 1
      if in_degree[neighbor] == 0:
        queue.append(neighbor)

  if len(ordered_ids) != len(documents):
    # Find cyclic nodes
    cyclic_ids = [doc_id for doc_id, deg in in_degree.items() if deg > 0]
    raise ValueError(f"Cycle detected in document prerequisites: {cyclic_ids}")

  return [doc_map[doc_id] for doc_id in ordered_ids]

def evaluate_scheme(scheme: Scheme, profile: UserProfile) -> SchemeMatch:
  annual_income = compute_annual_income(profile.income_amount, profile.income_period)

  # Consolidate user profile facts
  facts = dict(profile.facts)
  facts["applying_for"] = profile.applying_for
  if annual_income is not None:
    facts["annual_income"] = annual_income
    facts["family_income"] = annual_income
    facts["family_income_yearly"] = annual_income

  evaluations: List[RuleEvaluation] = []
  for rule in scheme.rules:
    res = evaluate_rule(rule, facts, annual_income)
    evaluations.append(res)

  has_fail = any(r.status == 'fail' for r in evaluations)
  has_unknown = any(r.status == 'unknown' for r in evaluations)

  if has_fail:
    tier = "not_likely"
  elif has_unknown:
    tier = "possibly"
  else:
    tier = "likely"

  failed_rules = [r for r in evaluations if r.status == 'fail']
  near_miss = generate_near_miss_explanation(failed_rules) if tier == "not_likely" else None

  # Topologically sort documents
  try:
    ordered_docs = sort_documents_topological(scheme.documents)
  except ValueError:
    # If a scheme in data has an error, keep documents in original list order and flag
    ordered_docs = scheme.documents

  return SchemeMatch(
      scheme_id=scheme.id,
      scheme_name=scheme.name,
      tier=tier,
      rules_evaluated=evaluations,
      near_miss_explanation=near_miss,
      overlap_notes=scheme.overlap_notes,
      ordered_documents=ordered_docs,
      official_apply_link=scheme.official_apply_link,
      official_source_link=scheme.official_source_link,
      last_verified=scheme.last_verified,
      verified_by=scheme.verified_by,
      checked_by=scheme.checked_by,
      official_fee=scheme.official_fee,
      grievance_contact=scheme.grievance_contact,
      rejection_reasons=scheme.rejection_reasons,
      close_date=scheme.close_date,
      typical_timeline_days=scheme.typical_timeline_days,
      benefit_amount=scheme.benefit_amount,
      benefit_source=scheme.benefit_source,
  )

def match_all_schemes(schemes: List[Scheme], profile: UserProfile) -> List[SchemeMatch]:
  results = [evaluate_scheme(s, profile) for s in schemes]
  # Sort results: likely first, then possibly, then not_likely
  tier_order = {"likely": 0, "possibly": 1, "not_likely": 2}
  results.sort(key=lambda r: tier_order.get(r.tier, 3))
  return results
