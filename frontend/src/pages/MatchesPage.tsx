import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { matchSchemes, SchemeMatch, UserProfileFacts } from '../lib/api';

type TabType = 'likely' | 'possibly' | 'not_likely';

export const MatchesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileFacts | null>(null);
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('likely');

  const fetchMatches = async (prof: UserProfileFacts) => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchSchemes(prof);
      setMatches(res.matches);
    } catch (e: any) {
      setError(e.message || 'Failed to evaluate schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('claimo_user_profile');
    if (saved) {
      try {
        const prof: UserProfileFacts = JSON.parse(saved);
        setProfile(prof);
        fetchMatches(prof);
      } catch (e) {
        setProfile(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleApplyingForSwitch = (val: 'me' | 'child') => {
    if (!profile) return;
    const updated = { ...profile, applying_for: val };
    setProfile(updated);
    localStorage.setItem('claimo_user_profile', JSON.stringify(updated));
    fetchMatches(updated);
  };

  const likelyMatches = matches.filter((m) => m.tier === 'likely');
  const possiblyMatches = matches.filter((m) => m.tier === 'possibly');
  const notLikelyMatches = matches.filter((m) => m.tier === 'not_likely');

  const currentList =
    activeTab === 'likely'
      ? likelyMatches
      : activeTab === 'possibly'
      ? possiblyMatches
      : notLikelyMatches;

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <Header />

      <main className="max-w-content mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Top Bar: Back to story & Applying For Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border dark:border-dark-border pb-4">
            <div>
              <Link
                to="/story"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal dark:text-dark-teal hover:underline mb-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Edit your facts</span>
              </Link>
              <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
                Your Entitlement Matches
              </h1>
            </div>

            {profile && (
              <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl p-1 self-start sm:self-auto">
                <span className="text-xs text-muted dark:text-dark-muted px-2 font-medium">Applying for:</span>
                <button
                  type="button"
                  onClick={() => handleApplyingForSwitch('me')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    profile.applying_for === 'me'
                      ? 'bg-teal text-white dark:bg-dark-teal dark:text-dark-bg shadow-sm'
                      : 'text-ink dark:text-dark-text hover:text-teal'
                  }`}
                >
                  Me
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyingForSwitch('child')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    profile.applying_for === 'child'
                      ? 'bg-teal text-white dark:bg-dark-teal dark:text-dark-bg shadow-sm'
                      : 'text-ink dark:text-dark-text hover:text-teal'
                  }`}
                >
                  My Child
                </button>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Empty State if no profile saved */}
          {!profile && !loading && (
            <div className="claimo-card p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                No story facts found
              </h2>
              <p className="text-sm text-muted dark:text-dark-muted max-w-sm mx-auto">
                Please share your story first so we can deterministically evaluate scheme eligibility.
              </p>
              <Link to="/story" className="btn-primary inline-flex items-center gap-2 text-sm">
                <span>Start Story Input</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}

          {/* Tabs */}
          {profile && (
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-alt-bg dark:bg-dark-card/50 rounded-2xl border border-border dark:border-dark-border">
              <button
                type="button"
                onClick={() => setActiveTab('likely')}
                className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'likely'
                    ? 'bg-white dark:bg-dark-card text-teal dark:text-dark-teal shadow-sm border border-border dark:border-dark-border'
                    : 'text-muted dark:text-dark-muted hover:text-ink'
                }`}
              >
                <span>Likely eligible</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-bold">
                  {likelyMatches.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('possibly')}
                className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'possibly'
                    ? 'bg-white dark:bg-dark-card text-amber-600 dark:text-amber-400 shadow-sm border border-border dark:border-dark-border'
                    : 'text-muted dark:text-dark-muted hover:text-ink'
                }`}
              >
                <span>Possibly</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                  {possiblyMatches.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('not_likely')}
                className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  activeTab === 'not_likely'
                    ? 'bg-white dark:bg-dark-card text-ink dark:text-dark-text shadow-sm border border-border dark:border-dark-border'
                    : 'text-muted dark:text-dark-muted hover:text-ink'
                }`}
              >
                <span>Not likely</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold">
                  {notLikelyMatches.length}
                </span>
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="claimo-card p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border animate-pulse space-y-3">
                  <div className="h-6 bg-border dark:bg-dark-border rounded w-2/3" />
                  <div className="h-4 bg-border dark:bg-dark-border rounded w-1/3" />
                  <div className="h-10 bg-border dark:bg-dark-border rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Scheme Cards List */}
          {!loading && profile && (
            <div className="space-y-4">
              {currentList.length === 0 ? (
                <div className="claimo-card p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-2">
                  <p className="text-sm font-medium text-ink dark:text-dark-text">
                    No schemes in this category.
                  </p>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {activeTab === 'likely'
                      ? 'No scheme currently meets all criteria based on your facts.'
                      : activeTab === 'possibly'
                      ? 'No schemes require additional fact confirmation.'
                      : 'None of the schemes are blocked by your criteria.'}
                  </p>
                </div>
              ) : (
                currentList.map((scheme) => (
                  <div
                    key={scheme.scheme_id}
                    className="claimo-card p-5 sm:p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border hover:border-teal dark:hover:border-dark-teal transition-all space-y-4"
                  >
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Verified badge */}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal">
                          Verified by: {scheme.verified_by}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-alt-bg dark:bg-dark-bg text-muted dark:text-dark-muted">
                          Checked: {scheme.checked_by}
                        </span>
                      </div>

                      {/* Tier Pill */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          scheme.tier === 'likely'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                            : scheme.tier === 'possibly'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {scheme.tier === 'likely'
                          ? 'Likely eligible'
                          : scheme.tier === 'possibly'
                          ? 'Possibly eligible'
                          : 'Not likely'}
                      </span>
                    </div>

                    {/* Scheme Title */}
                    <div>
                      <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                        {scheme.scheme_name}
                      </h2>
                      <div className="text-xs text-muted dark:text-dark-muted mt-0.5">
                        {scheme.benefit_amount ? (
                          <span className="text-ink dark:text-dark-text font-semibold">
                            Benefit: {scheme.benefit_amount}
                            {scheme.benefit_source && (
                              <span className="font-normal text-muted dark:text-dark-muted ml-1">
                                (Source: {scheme.benefit_source})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>Benefit: Not published by the scheme</span>
                        )}
                      </div>
                    </div>

                    {/* Rules Evaluated Chips */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
                        Eligibility Criteria Checked:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.rules_evaluated.map((rule, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                              rule.status === 'pass'
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                                : rule.status === 'fail'
                                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <span className="font-bold">
                              {rule.status === 'pass' ? '✓' : rule.status === 'fail' ? '✕' : '?'}
                            </span>
                            <span className="font-medium">{rule.rule_label}</span>
                            <span className="text-[10px] opacity-75">({rule.source_clause})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Near-miss sentence if not_likely */}
                    {scheme.near_miss_explanation && (
                      <div className="p-3 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                        <span className="font-bold">ℹ</span>
                        <span>{scheme.near_miss_explanation}</span>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border dark:border-dark-border">
                      <div className="text-xs text-muted dark:text-dark-muted">
                        Official Fee: {scheme.official_fee || 'Not published by the scheme'}
                      </div>

                      <div className="flex items-center gap-2">
                        {scheme.official_apply_link && scheme.official_apply_link !== 'not_published' && (
                          <a
                            href={scheme.official_apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1"
                          >
                            <span>Official Portal</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => navigate(`/schemes/${scheme.scheme_id}`, { state: { scheme } })}
                          className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1"
                        >
                          <span>View Details & Checklist</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

          {/* Mandatory Results Disclaimer Footer */}
          <div className="p-4 rounded-xl bg-alt-bg dark:bg-dark-card border border-border dark:border-dark-border text-center text-xs text-muted dark:text-dark-muted">
            <span className="font-semibold text-ink dark:text-dark-text">Notice: </span>
            Likely eligible, not guaranteed. The official office makes the final decision.
          </div>

        </div>
      </main>

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default MatchesPage;
