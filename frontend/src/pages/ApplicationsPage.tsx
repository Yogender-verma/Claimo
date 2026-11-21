import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { getSchemes } from '../lib/api';

type AppStatus = 'not_started' | 'docs_ready' | 'submitted' | 'approved' | 'rejected';

interface TrackedApplication {
  scheme_id: string;
  scheme_name: string;
  status: AppStatus;
  official_apply_link?: string;
  close_date?: string | null;
  added_at: string;
  submitted_at?: string;
  typical_timeline_days?: number;
  grievance_contact?: string;
  rejection_reason_key?: string;
}

export const ApplicationsPage: React.FC = () => {
  const { t } = useTranslation();

  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [schemesCatalog, setSchemesCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tracker from localStorage & scheme data
  useEffect(() => {
    const saved = localStorage.getItem('claimo_applications');
    if (saved) {
      try {
        setApplications(JSON.parse(saved));
      } catch (e) {}
    }

    getSchemes()
      .then((data) => {
        setSchemesCatalog(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveApplications = (updated: TrackedApplication[]) => {
    setApplications(updated);
    localStorage.setItem('claimo_applications', JSON.stringify(updated));
  };

  const handleStatusChange = (schemeId: string, newStatus: AppStatus) => {
    const updated = applications.map((app) => {
      if (app.scheme_id === schemeId) {
        const item: TrackedApplication = { ...app, status: newStatus };
        if (newStatus === 'submitted' && !item.submitted_at) {
          item.submitted_at = new Date().toISOString();
        }
        return item;
      }
      return app;
    });
    saveApplications(updated);
  };

  const handleRejectionReasonChange = (schemeId: string, reasonKey: string) => {
    const updated = applications.map((app) => {
      if (app.scheme_id === schemeId) {
        return { ...app, rejection_reason_key: reasonKey };
      }
      return app;
    });
    saveApplications(updated);
  };

  const handleRemove = (schemeId: string) => {
    const updated = applications.filter((app) => app.scheme_id !== schemeId);
    saveApplications(updated);
  };

  // Helper for human-readable deadline countdown
  const getDeadlineText = (closeDateStr?: string | null) => {
    if (!closeDateStr) return null;
    const closeDate = new Date(closeDateStr);
    if (isNaN(closeDate.getTime())) return null;

    const now = new Date();
    const diffMs = closeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        text: `Closes in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        urgent: diffDays <= 7,
        passed: false,
      };
    } else if (diffDays === 0) {
      return { text: 'Closes today', urgent: true, passed: false };
    } else {
      const pastDays = Math.abs(diffDays);
      return {
        text: `Closed ${pastDays} day${pastDays === 1 ? '' : 's'} ago`,
        urgent: false,
        passed: true,
      };
    }
  };

  // Helper for timeline nudge calculation
  const getTimelineNudge = (app: TrackedApplication, schemeDetails?: any) => {
    if (app.status !== 'submitted' || !app.submitted_at) return null;
    const submittedDate = new Date(app.submitted_at);
    const now = new Date();
    const elapsedDays = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

    const typicalDays = app.typical_timeline_days || schemeDetails?.typical_timeline_days || 30;
    const grievance = app.grievance_contact || schemeDetails?.grievance_contact || 'the departmental officer';

    if (elapsedDays > typicalDays) {
      return {
        elapsedDays,
        typicalDays,
        grievance,
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <Header />

      <main className="max-w-content mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Page Title & Official Ground Truth Disclaimer */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
                Application Tracker & Deadlines
              </h1>
              <Link to="/matches" className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto">
                + Add from Matches
              </Link>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <span className="text-base font-bold">ℹ️</span>
              <div>
                <strong>User-Reported Status: </strong>
                Claimo cannot see your official status in government databases. Statuses here are recorded by you to keep track of deadlines. Always check the official portal for official updates.
              </div>
            </div>
          </div>

          {/* Empty Tracker State */}
          {!loading && applications.length === 0 && (
            <div className="claimo-card p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                No active applications tracked yet
              </h2>
              <p className="text-xs text-muted dark:text-dark-muted max-w-sm mx-auto">
                Review your scheme matches and tap &quot;Start this application&quot; to track your progress and deadlines.
              </p>
              <Link to="/matches" className="btn-primary inline-flex text-xs py-2.5 px-4">
                Explore Matches
              </Link>
            </div>
          )}

          {/* Applications List */}
          {applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app) => {
                const schemeDetails = schemesCatalog.find((s) => s.id === app.scheme_id);
                const deadline = getDeadlineText(app.close_date || schemeDetails?.close_date);
                const nudge = getTimelineNudge(app, schemeDetails);
                const rejectionReasons = schemeDetails?.rejection_reasons || {};

                return (
                  <div
                    key={app.scheme_id}
                    className="claimo-card p-5 sm:p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="font-heading font-bold text-lg text-ink dark:text-dark-text">
                          {app.scheme_name}
                        </h2>
                        {deadline && (
                          <div
                            className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              deadline.passed
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                : deadline.urgent
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                : 'bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal'
                            }`}
                          >
                            📅 {deadline.text}
                          </div>
                        )}
                      </div>

                      {/* Status Selector */}
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
                          Your Status:
                        </label>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.scheme_id, e.target.value as AppStatus)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal ${
                            app.status === 'approved'
                              ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-300'
                              : app.status === 'rejected'
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-300'
                              : app.status === 'submitted'
                              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-300'
                              : 'bg-alt-bg dark:bg-dark-bg text-ink dark:text-dark-text border-border dark:border-dark-border'
                          }`}
                        >
                          <option value="not_started">Not started</option>
                          <option value="docs_ready">Documents ready</option>
                          <option value="submitted">Submitted</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Timeline Nudge Alert */}
                    {nudge && (
                      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                        <span className="font-bold">⏰</span>
                        <div>
                          <strong>Timeline Nudge: </strong>
                          Applications for this scheme usually take ~{nudge.typicalDays} days. It has been {nudge.elapsedDays} days since you submitted. Consider contacting the official grievance cell ({nudge.grievance}) if there is no progress.
                        </div>
                      </div>
                    )}

                    {/* REJECTION HELPER PANEL */}
                    {app.status === 'rejected' && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-3 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-300">
                          <span>⚠️</span>
                          <span>Rejection Helper: Find published reasons and how to appeal</span>
                        </div>

                        {Object.keys(rejectionReasons).length > 0 ? (
                          <div className="space-y-2">
                            <label className="block text-ink dark:text-dark-text font-medium">
                              Select rejection reason given by department:
                            </label>
                            <select
                              value={app.rejection_reason_key || ''}
                              onChange={(e) => handleRejectionReasonChange(app.scheme_id, e.target.value)}
                              className="w-full p-2 text-xs rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text"
                            >
                              <option value="">Select reason...</option>
                              {Object.entries(rejectionReasons).map(([key, item]: [string, any]) => (
                                <option key={key} value={key}>
                                  {item.reason}
                                </option>
                              ))}
                            </select>

                            {app.rejection_reason_key && rejectionReasons[app.rejection_reason_key] && (
                              <div className="p-3 bg-white dark:bg-dark-card rounded-lg border border-red-200 dark:border-red-900/40 space-y-2 mt-2">
                                <div className="font-semibold text-ink dark:text-dark-text">
                                  What went wrong:
                                </div>
                                <p className="text-muted dark:text-dark-muted">
                                  {rejectionReasons[app.rejection_reason_key].reason}
                                </p>
                                <div className="font-semibold text-teal dark:text-dark-teal pt-1">
                                  Official Appeal Route:
                                </div>
                                <p className="text-muted dark:text-dark-muted">
                                  {rejectionReasons[app.rejection_reason_key].appeal}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted dark:text-dark-muted">
                            Specific rejection reasons have not been published by this scheme. Contact the departmental grievance contact to request an appeal or clarification.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border dark:border-dark-border text-xs">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/documents?scheme=${app.scheme_id}`}
                          className="text-teal dark:text-dark-teal hover:underline font-medium"
                        >
                          View Document Checklist
                        </Link>
                        {app.official_apply_link && (
                          <a
                            href={app.official_apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted dark:text-dark-muted hover:text-ink inline-flex items-center gap-1"
                          >
                            <span>Official Portal</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(app.scheme_id)}
                        className="text-muted hover:text-red-600 text-left sm:text-right"
                      >
                        Remove from tracker
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default ApplicationsPage;
