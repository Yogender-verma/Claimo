import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SchemeMatch, matchSchemes, UserProfileFacts } from '../lib/api';

export const SchemeDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState<SchemeMatch | null>(
    (location.state as any)?.scheme || null
  );
  const [loading, setLoading] = useState(!scheme);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [addedToTracker, setAddedToTracker] = useState(false);

  useEffect(() => {
    if (!scheme && id) {
      // Load user profile and match to find this scheme
      const saved = localStorage.getItem('claimo_user_profile');
      if (saved) {
        try {
          const prof: UserProfileFacts = JSON.parse(saved);
          matchSchemes(prof).then((res) => {
            const found = res.matches.find((m) => m.scheme_id === id);
            if (found) setScheme(found);
            setLoading(false);
          }).catch(() => setLoading(false));
        } catch (e) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [id, scheme]);

  const handleStartApplication = () => {
    if (!scheme) return;
    const existing = JSON.parse(localStorage.getItem('claimo_applications') || '[]');
    const isAlreadyAdded = existing.some((item: any) => item.scheme_id === scheme.scheme_id);

    if (!isAlreadyAdded) {
      const newApp = {
        scheme_id: scheme.scheme_id,
        scheme_name: scheme.scheme_name,
        status: 'not_started',
        official_apply_link: scheme.official_apply_link,
        close_date: scheme.close_date || null,
        added_at: new Date().toISOString(),
        timeline_days: scheme.typical_timeline_days || 30,
        notes: '',
      };
      existing.push(newApp);
      localStorage.setItem('claimo_applications', JSON.stringify(existing));
    }
    setAddedToTracker(true);
    setTimeout(() => {
      navigate('/applications');
    }, 600);
  };

  const handleReportError = () => {
    if (!reportText.trim() || !scheme) return;
    const reports = JSON.parse(localStorage.getItem('claimo_error_reports') || '[]');
    reports.push({
      scheme_id: scheme.scheme_id,
      scheme_name: scheme.scheme_name,
      reported_at: new Date().toISOString(),
      details: reportText.trim(),
    });
    localStorage.setItem('claimo_error_reports', JSON.stringify(reports));
    setReportSent(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSent(false);
      setReportText('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <Header />

      <main className="max-w-content mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              to="/matches"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal dark:text-dark-teal hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to all matches</span>
            </Link>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="text-xs text-muted dark:text-dark-muted hover:text-red-600 inline-flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Report an error</span>
            </button>
          </div>

          {loading && (
            <div className="claimo-card p-8 bg-white dark:bg-dark-card border border-border dark:border-dark-border animate-pulse space-y-4">
              <div className="h-8 bg-border dark:bg-dark-border rounded w-3/4" />
              <div className="h-4 bg-border dark:bg-dark-border rounded w-1/2" />
              <div className="h-24 bg-border dark:bg-dark-border rounded w-full" />
            </div>
          )}

          {!loading && !scheme && (
            <div className="claimo-card p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-3">
              <p className="text-base font-semibold text-ink dark:text-dark-text">Scheme not found</p>
              <p className="text-xs text-muted dark:text-dark-muted">
                This scheme could not be found or your session was cleared.
              </p>
              <Link to="/matches" className="btn-primary inline-flex text-xs py-2 px-4">
                View Matches
              </Link>
            </div>
          )}

          {!loading && scheme && (
            <div className="space-y-6">

              {/* Main Scheme Header Card */}
              <div className="claimo-card p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal">
                      Verified by: {scheme.verified_by}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-alt-bg dark:bg-dark-bg text-muted dark:text-dark-muted">
                      Checked: {scheme.checked_by}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
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

                <div>
                  <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
                    {scheme.scheme_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted dark:text-dark-muted mt-2">
                    {scheme.last_verified && scheme.last_verified !== 'not_published' && (
                      <span>Last Verified: {scheme.last_verified}</span>
                    )}
                    {scheme.official_source_link && scheme.official_source_link !== 'not_published' && (
                      <a
                        href={scheme.official_source_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal dark:text-dark-teal hover:underline inline-flex items-center gap-1"
                      >
                        <span>Official Scheme Rules Document</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Benefit Amount Box */}
                <div className="p-3.5 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border text-xs">
                  <span className="font-semibold text-ink dark:text-dark-text">Official Benefit: </span>
                  {scheme.benefit_amount ? (
                    <span className="font-bold text-teal dark:text-dark-teal">
                      {scheme.benefit_amount}
                      {scheme.benefit_source && (
                        <span className="font-normal text-muted dark:text-dark-muted ml-1">
                          (Source: {scheme.benefit_source})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted dark:text-dark-muted">Not published by the scheme</span>
                  )}
                </div>

                {/* Overlap Notes Warning */}
                {scheme.overlap_notes && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <span className="text-base font-bold">⚠️</span>
                    <div>
                      <span className="font-semibold">Overlap Notice: </span>
                      {scheme.overlap_notes}
                    </div>
                  </div>
                )}

                {/* Near-miss statement if not_likely */}
                {scheme.near_miss_explanation && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 space-y-1">
                    <span className="font-bold">Why Not Likely:</span>
                    <p>{scheme.near_miss_explanation}</p>
                  </div>
                )}
              </div>

              {/* Rule by Rule Breakdown Card */}
              <div className="claimo-card p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-4">
                <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                  Rule-by-Rule Eligibility Breakdown
                </h2>
                <div className="space-y-3">
                  {scheme.rules_evaluated.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border dark:border-dark-border bg-alt-bg dark:bg-dark-bg flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              rule.status === 'pass'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                : rule.status === 'fail'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {rule.status === 'pass' ? '✓' : rule.status === 'fail' ? '✕' : '?'}
                          </span>
                          <span className="text-sm font-semibold text-ink dark:text-dark-text">
                            {rule.rule_label}
                          </span>
                        </div>
                        <div className="text-xs text-muted dark:text-dark-muted pl-7">
                          Official Source: <span className="font-mono text-ink dark:text-dark-text">{rule.source_clause}</span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                          rule.status === 'pass'
                            ? 'text-green-700 dark:text-green-300'
                            : rule.status === 'fail'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEE SHIELD & GRIEVANCE CONTACT */}
              <div className="claimo-card p-6 bg-teal-light/40 dark:bg-dark-card border-2 border-teal dark:border-dark-teal space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <h3 className="font-heading font-bold text-base text-ink dark:text-dark-text">
                    Fee Shield Guarantee
                  </h3>
                </div>
                <div className="text-sm text-ink dark:text-dark-text">
                  Official Application Fee: <span className="font-bold">{scheme.official_fee || 'Not published by the scheme'}</span>
                </div>
                <p className="text-xs text-muted dark:text-dark-muted leading-relaxed">
                  Never pay any agent, middleman, or internet cafe extra money to file your application. Official government applications have standard fixed fees or are completely free of cost.
                </p>
                {scheme.grievance_contact && scheme.grievance_contact !== 'not_published' && (
                  <div className="pt-2 text-xs flex flex-wrap items-center gap-2 text-ink dark:text-dark-text">
                    <span className="font-semibold">Official Grievance Contact:</span>
                    {scheme.grievance_contact.includes('@') ? (
                      <a
                        href={`mailto:${scheme.grievance_contact}`}
                        className="text-teal dark:text-dark-teal hover:underline font-mono"
                      >
                        {scheme.grievance_contact}
                      </a>
                    ) : (
                      <a
                        href={`tel:${scheme.grievance_contact}`}
                        className="text-teal dark:text-dark-teal hover:underline font-mono"
                      >
                        {scheme.grievance_contact}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Application CTAs */}
              <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-border dark:border-dark-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link
                  to={`/documents?scheme=${scheme.scheme_id}`}
                  className="btn-secondary text-sm py-3 px-4 text-center"
                >
                  View Document Checklist ({scheme.ordered_documents.length} docs)
                </Link>

                <button
                  type="button"
                  onClick={handleStartApplication}
                  className="btn-primary text-sm py-3 px-4 flex items-center justify-center gap-2"
                >
                  <span>{addedToTracker ? 'Added to Tracker!' : 'Start this application'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

            </div>
          )}

          {/* Mandatory Results Disclaimer Footer */}
          <div className="p-4 rounded-xl bg-alt-bg dark:bg-dark-card border border-border dark:border-dark-border text-center text-xs text-muted dark:text-dark-muted">
            <span className="font-semibold text-ink dark:text-dark-text">Notice: </span>
            Likely eligible, not guaranteed. The official office makes the final decision.
          </div>

        </div>
      </main>

      {/* Report Error Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                Report an Error in this Scheme
              </h3>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted dark:text-dark-muted">
              Did a government rule change or is a link broken? Help us keep Claimo accurate.
            </p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={3}
              placeholder="Describe the discrepancy or rule change..."
              className="w-full p-3 text-sm rounded-xl border border-border dark:border-dark-border bg-alt-bg dark:bg-dark-bg text-ink dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-teal"
            />
            {reportSent ? (
              <div className="p-2 rounded bg-green-100 text-green-800 text-xs font-semibold text-center">
                Thank you! Error reported.
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportError}
                  disabled={!reportText.trim()}
                  className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
                >
                  Submit Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default SchemeDetailPage;
