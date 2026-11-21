import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProfileImpact {
  profile_id: string;
  profile_name: string;
  old_tier: string;
  new_tier: string;
  changed: boolean;
  causing_rules: string[];
}

interface RadarResponse {
  total_profiles: number;
  newly_eligible_count: number;
  lost_eligibility_count: number;
  unchanged_count: number;
  impacts: ProfileImpact[];
}

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading, getIdToken, signOut } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Radar State
  const [incomeThreshold, setIncomeThreshold] = useState<number>(200000);
  const [courseFilter, setCourseFilter] = useState<string>('intermediate');
  const [radarLoading, setRadarLoading] = useState<boolean>(false);
  const [radarResult, setRadarResult] = useState<RadarResponse | null>(null);
  const [radarError, setRadarError] = useState<string | null>(null);

  // Error Reports State
  const [errorReports, setErrorReports] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/signin?redirect=/admin');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/admin/check`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsAdmin(true);
          // Fetch error reports
          fetchErrorReports(token);
        } else if (res.status === 403) {
          setIsAdmin(false);
          const data = await res.json().catch(() => ({}));
          setStatusMessage(data.detail || t('auth.adminAccessDeniedDesc'));
        } else if (res.status === 503) {
          setIsAdmin(false);
          setStatusMessage('Backend Firebase Admin secrets are not configured. Admin area is disabled.');
        } else {
          setIsAdmin(false);
          setStatusMessage(t('auth.adminAccessDeniedDesc'));
        }
      } catch (err) {
        setIsAdmin(false);
        setStatusMessage('Could not connect to the backend server.');
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, getIdToken, navigate, t]);

  const fetchErrorReports = async (token: string) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${apiBase}/api/admin/errors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Also combine with any saved in localStorage
        const local = JSON.parse(localStorage.getItem('claimo_error_reports') || '[]');
        const combined = [...(data.reports || []), ...local];
        setErrorReports(combined);
      }
    } catch (e) {}
  };

  const handleRunRadar = async () => {
    setRadarLoading(true);
    setRadarError(null);
    try {
      const token = await getIdToken();
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

      const simulatedScheme = {
        id: 'SIMULATED_TEST_SCHEME',
        name: 'Simulated Policy Change Scheme',
        category: 'education',
        target_group: 'Students',
        rules: [
          {
            field: 'income',
            operator: 'less_than_or_equal',
            value: incomeThreshold,
            source_clause: 'Proposed Clause 4(a)',
            rule_label: `Annual Income <= ₹${incomeThreshold.toLocaleString('en-IN')}`,
          },
          {
            field: 'current_course',
            operator: 'equals',
            value: courseFilter,
            source_clause: 'Clause 2',
            rule_label: `Course: ${courseFilter}`,
          },
        ],
        documents: [],
        official_apply_link: 'not_published',
        official_source_link: 'not_published',
        last_verified: 'Simulated',
        verified_by: 'Admin Simulation',
        checked_by: 'Rule Change Radar',
        official_fee: '0',
        grievance_contact: 'not_published',
      };

      const baselineScheme = {
        id: 'SIMULATED_TEST_SCHEME',
        name: 'Baseline Policy Scheme',
        category: 'education',
        target_group: 'Students',
        rules: [
          {
            field: 'income',
            operator: 'less_than_or_equal',
            value: 100000,
            source_clause: 'Original Clause 4(a)',
            rule_label: 'Annual Income <= ₹1,00,000',
          },
          {
            field: 'current_course',
            operator: 'equals',
            value: 'intermediate',
            source_clause: 'Clause 2',
            rule_label: 'Course: intermediate',
          },
        ],
        documents: [],
      };

      const res = await fetch(`${apiBase}/api/radar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheme: simulatedScheme,
          baseline_scheme: baselineScheme,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to simulate radar');
      }

      const data = await res.json();
      setRadarResult(data);
    } catch (e: any) {
      setRadarError(e.message || 'Error running Rule Change Radar');
    } finally {
      setRadarLoading(false);
    }
  };

  const handleResolveError = (idx: number) => {
    const updated = errorReports.filter((_, i) => i !== idx);
    setErrorReports(updated);
    localStorage.setItem('claimo_error_reports', JSON.stringify(updated));
  };

  const launchDemoMode = () => {
    const demoProfile = {
      applying_for: 'me',
      income_amount: 150000,
      income_period: 'year',
      caste: 'SC',
      current_course: 'intermediate',
      district: 'Warangal',
      marks_percentage: 75,
      telugu_number_flagged: false,
      facts: {
        caste: 'SC',
        current_course: 'intermediate',
        district: 'Warangal',
        marks_percentage: 75,
      },
    };
    localStorage.setItem('claimo_user_profile', JSON.stringify(demoProfile));
    navigate('/matches');
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex items-center justify-center text-teal dark:text-dark-teal">
        <div className="w-8 h-8 border-2 border-teal dark:border-dark-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      {/* Header */}
      <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border py-4 px-6">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl text-ink dark:text-dark-text flex items-center">
            <span>Claim</span>
            <span className="text-accent dark:text-dark-accent">o</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted dark:text-dark-muted hidden sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut().then(() => navigate('/'))}
              className="btn-header-secondary text-xs px-3 py-1.5 min-h-[38px]"
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-content mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {isAdmin ? (
          /* Authorized Admin Area */
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Top Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border dark:border-dark-border pb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal border border-border-teal dark:border-teal/30">
                  Verified Administrator • Allowlisted
                </span>
                <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text mt-2">
                  Admin Policy Radar & Scheme Control
                </h1>
              </div>

              <button
                type="button"
                onClick={launchDemoMode}
                className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto inline-flex items-center gap-1 font-semibold text-teal dark:text-dark-teal"
              >
                <span>⚡ Test Demo Flow</span>
              </button>
            </div>

            {/* RULE CHANGE RADAR SECTION */}
            <div className="claimo-card p-6 bg-white dark:bg-dark-card border-2 border-teal dark:border-dark-teal space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📡</span>
                  <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                    Rule Change Radar
                  </h2>
                </div>
                <p className="text-xs text-muted dark:text-dark-muted">
                  Simulate policy changes against 6 synthetic student profiles in Telangana before publishing.
                </p>
                <div className="p-2.5 rounded-lg bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border text-[11px] text-muted dark:text-dark-muted">
                  <strong>Notice:</strong> Changes here are for testing impact only and do not modify the verified data file without explicit export.
                </div>
              </div>

              {/* Tweak Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink dark:text-dark-text">
                    Simulated Income Limit (₹):
                  </label>
                  <input
                    type="number"
                    step="25000"
                    value={incomeThreshold}
                    onChange={(e) => setIncomeThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-ink dark:text-dark-text focus:ring-2 focus:ring-teal"
                  />
                  <span className="text-[11px] text-muted dark:text-dark-muted">
                    Baseline is ₹1,00,000. Try raising to ₹2,00,000 or ₹2,50,000.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink dark:text-dark-text">
                    Target Course:
                  </label>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-ink dark:text-dark-text focus:ring-2 focus:ring-teal"
                  >
                    <option value="intermediate">Intermediate</option>
                    <option value="polytechnic">Polytechnic</option>
                    <option value="degree">Degree</option>
                    <option value="engineering">Engineering</option>
                  </select>
                </div>
              </div>

              {/* Run Radar Action */}
              <div>
                <button
                  type="button"
                  onClick={handleRunRadar}
                  disabled={radarLoading}
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  {radarLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-dark-bg border-t-transparent rounded-full animate-spin" />
                      <span>Simulating Synthetic Impact...</span>
                    </>
                  ) : (
                    <>
                      <span>Run Rule Change Radar</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {radarError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                  {radarError}
                </div>
              )}

              {/* Radar Simulation Results */}
              {radarResult && (
                <div className="space-y-4 pt-4 border-t border-border dark:border-dark-border">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
                      <div className="text-xl font-bold text-green-700 dark:text-green-300">
                        +{radarResult.newly_eligible_count}
                      </div>
                      <div className="text-xs text-green-800 dark:text-green-400 font-medium">Newly Eligible</div>
                    </div>

                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                      <div className="text-xl font-bold text-red-700 dark:text-red-300">
                        -{radarResult.lost_eligibility_count}
                      </div>
                      <div className="text-xs text-red-800 dark:text-red-400 font-medium">Lost Eligibility</div>
                    </div>

                    <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border">
                      <div className="text-xl font-bold text-ink dark:text-dark-text">
                        {radarResult.unchanged_count}
                      </div>
                      <div className="text-xs text-muted dark:text-dark-muted font-medium">Unchanged</div>
                    </div>
                  </div>

                  {/* Profile Level Diff Details */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
                      Synthetic Profile Breakdown ({radarResult.total_profiles} profiles):
                    </h3>
                    <div className="space-y-2">
                      {radarResult.impacts.map((imp) => (
                        <div
                          key={imp.profile_id}
                          className="p-3 rounded-xl border border-border dark:border-dark-border bg-alt-bg/60 dark:bg-dark-bg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink dark:text-dark-text">{imp.profile_name}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-semibold ${
                                imp.changed
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {imp.old_tier} → {imp.new_tier}
                            </span>
                          </div>
                          {imp.causing_rules.length > 0 && (
                            <div className="text-muted dark:text-dark-muted">
                              Causing rule: <span className="font-mono text-teal dark:text-dark-teal">{imp.causing_rules.join('; ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* USER ERROR REPORTS QUEUE */}
            <div className="claimo-card p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚩</span>
                  <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                    User Error Reports Queue
                  </h2>
                </div>
                <span className="text-xs text-muted dark:text-dark-muted">
                  {errorReports.length} report{errorReports.length === 1 ? '' : 's'}
                </span>
              </div>

              {errorReports.length === 0 ? (
                <p className="text-xs text-muted dark:text-dark-muted">
                  No active error reports from students or citizens.
                </p>
              ) : (
                <div className="space-y-3">
                  {errorReports.map((rep, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border dark:border-dark-border bg-alt-bg dark:bg-dark-bg flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-ink dark:text-dark-text">{rep.scheme_name}</div>
                        <p className="text-muted dark:text-dark-muted">{rep.details}</p>
                        {rep.reported_at && (
                          <div className="text-[10px] text-muted">
                            Reported: {new Date(rep.reported_at).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleResolveError(idx)}
                        className="btn-secondary py-1 px-2.5 text-xs text-green-700 dark:text-green-300 hover:border-green-500 shrink-0"
                      >
                        ✓ Mark Resolved
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Access Denied */
          <div className="claimo-card max-w-md w-full p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border mx-auto">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text mb-2">
              {t('auth.adminAccessDeniedTitle')}
            </h1>
            <p className="text-muted dark:text-dark-muted text-sm leading-relaxed mb-6">
              {statusMessage || t('auth.adminAccessDeniedDesc')}
            </p>
            <div className="space-y-3">
              <Link to="/" className="btn-secondary w-full text-center">
                {t('auth.backHome')}
              </Link>
              <button
                type="button"
                onClick={() => signOut().then(() => navigate('/signin'))}
                className="text-xs text-muted dark:text-dark-muted hover:underline"
              >
                Sign in with another account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-4 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default AdminPage;
