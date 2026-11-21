from typing import Any, Optional, List, Dict
from pydantic import BaseModel, Field

class Rule(BaseModel):
  field: str
  operator: str  # equals, not_equals, less_than, less_than_or_equal, greater_than, greater_than_or_equal, in_list
  value: Any
  source_clause: str
  description: Optional[str] = None
  rule_label: Optional[str] = None

class Document(BaseModel):
  id: str
  name: str
  issuer: str
  official_fee: str = "not_published"  # "0", "₹50", or "not_published"
  apply_link: str = "not_published"
  prerequisites: List[str] = Field(default_factory=list)
  steps: List[str] = Field(default_factory=list)

class Scheme(BaseModel):
  id: str
  name: str
  category: str
  target_group: str
  rules: List[Rule] = Field(default_factory=list)
  documents: List[Document] = Field(default_factory=list)
  official_apply_link: str = "not_published"
  official_source_link: str = "not_published"
  last_verified: str = "not_published"
  verified_by: str = "not_published"
  checked_by: str = "not_published"
  official_fee: str = "not_published"
  grievance_contact: str = "not_published"
  overlap_notes: Optional[str] = None
  rejection_reasons: Dict[str, Dict[str, str]] = Field(default_factory=dict)
  close_date: Optional[str] = None
  typical_timeline_days: Optional[int] = None
  benefit_amount: Optional[str] = None
  benefit_source: Optional[str] = None

class UserProfile(BaseModel):
  applying_for: str = "me"  # "me" or "child"
  income_amount: Optional[float] = None
  income_period: Optional[str] = None  # "month" or "year" (None if unknown)
  facts: Dict[str, Any] = Field(default_factory=dict)

class RuleEvaluation(BaseModel):
  field: str
  operator: str
  expected_value: Any
  actual_value: Any
  status: str  # "pass", "fail", "unknown"
  source_clause: str
  rule_label: str

class SchemeMatch(BaseModel):
  scheme_id: str
  scheme_name: str
  tier: str  # "likely", "possibly", "not_likely"
  rules_evaluated: List[RuleEvaluation]
  near_miss_explanation: Optional[str] = None
  overlap_notes: Optional[str] = None
  ordered_documents: List[Document]
  official_apply_link: str
  official_source_link: str
  last_verified: str
  verified_by: str
  checked_by: str
  official_fee: str
  grievance_contact: str
  rejection_reasons: Dict[str, Dict[str, str]] = Field(default_factory=dict)
  close_date: Optional[str] = None
  typical_timeline_days: Optional[int] = None
  benefit_amount: Optional[str] = None
  benefit_source: Optional[str] = None

class MatchResponse(BaseModel):
  matches: List[SchemeMatch]
  profile_summary: Dict[str, Any]
