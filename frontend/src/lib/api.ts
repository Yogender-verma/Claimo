// Frontend API client for Claimo backend

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface UserProfileFacts {
  applying_for: 'me' | 'child';
  income_amount?: number | null;
  income_period?: 'month' | 'year' | null;
  caste?: string | null;
  current_course?: string | null;
  marks_percentage?: number | null;
  district?: string | null;
  telugu_number_flagged?: boolean;
  facts: Record<string, any>;
}

export interface RuleEvaluation {
  field: string;
  operator: string;
  expected_value: any;
  actual_value: any;
  status: 'pass' | 'fail' | 'unknown';
  source_clause: string;
  rule_label: string;
}

export interface Document {
  id: string;
  name: string;
  issuer: string;
  official_fee: string;
  apply_link: string;
  prerequisites: string[];
  steps: string[];
}

export interface SchemeMatch {
  scheme_id: string;
  scheme_name: string;
  tier: 'likely' | 'possibly' | 'not_likely';
  rules_evaluated: RuleEvaluation[];
  near_miss_explanation?: string | null;
  overlap_notes?: string | null;
  ordered_documents: Document[];
  official_apply_link: string;
  official_source_link: string;
  last_verified: string;
  verified_by: string;
  checked_by: string;
  official_fee: string;
  grievance_contact: string;
  rejection_reasons: Record<string, { reason: string; appeal: string }>;
  close_date?: string | null;
  typical_timeline_days?: number | null;
  benefit_amount?: string | null;
  benefit_source?: string | null;
}

export interface MatchResponse {
  matches: SchemeMatch[];
  profile_summary: Record<string, any>;
}

export async function extractStoryFacts(text: string): Promise<UserProfileFacts> {
  const res = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to extract facts from story');
  }
  const data = await res.json();
  const ext = data.extracted;
  return {
    applying_for: ext.applying_for || 'me',
    income_amount: ext.income_amount,
    income_period: ext.income_period,
    caste: ext.caste,
    current_course: ext.current_course,
    marks_percentage: ext.marks_percentage,
    district: ext.district,
    telugu_number_flagged: ext.telugu_number_flagged || false,
    facts: {
      caste: ext.caste,
      current_course: ext.current_course,
      marks_percentage: ext.marks_percentage,
      district: ext.district,
      ...ext.other_facts,
    },
  };
}

export async function matchSchemes(profile: UserProfileFacts): Promise<MatchResponse> {
  const payload = {
    applying_for: profile.applying_for,
    income_amount: profile.income_amount,
    income_period: profile.income_period,
    facts: profile.facts,
  };
  const res = await fetch(`${API_BASE}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to evaluate scheme matches');
  }
  return res.json();
}

export async function getSchemes(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/schemes`);
  if (!res.ok) throw new Error('Failed to fetch schemes');
  const data = await res.json();
  return data.schemes || [];
}
