import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import ReadAloudButton from '../components/ReadAloudButton';
import { matchSchemes, Document, UserProfileFacts } from '../lib/api';

type DocStatus = 'have' | 'in_progress' | 'missing';

export const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const targetSchemeId = searchParams.get('scheme');

  const [profile, setProfile] = useState<UserProfileFacts | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [schemeName, setSchemeName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, DocStatus>>({});

  useEffect(() => {
    // Load saved doc statuses from localStorage
    const savedStatuses = localStorage.getItem('claimo_doc_statuses');
    if (savedStatuses) {
      try {
        setStatuses(JSON.parse(savedStatuses));
      } catch (e) {}
    }

    // Load profile and match to get topologically sorted documents
    const savedProfile = localStorage.getItem('claimo_user_profile');
    if (savedProfile) {
      try {
        const prof: UserProfileFacts = JSON.parse(savedProfile);
        setProfile(prof);

        matchSchemes(prof).then((res) => {
          let docs: Document[] = [];
          if (targetSchemeId) {
            const matched = res.matches.find((m) => m.scheme_id === targetSchemeId);
            if (matched) {
              docs = matched.ordered_documents;
              setSchemeName(matched.scheme_name);
            }
          } else {
            // Aggregate ordered documents across all likely/possibly schemes
            const docMap = new Map<string, Document>();
            res.matches.forEach((m) => {
              m.ordered_documents.forEach((d) => {
                if (!docMap.has(d.id)) {
                  docMap.set(d.id, d);
                }
              });
            });
            docs = Array.from(docMap.values());
            setSchemeName('All Entitlement Documents');
          }
          setDocuments(docs);
          setLoading(false);
        }).catch(() => setLoading(false));
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [targetSchemeId]);

  const setDocStatus = (docId: string, status: DocStatus) => {
    const updated = { ...statuses, [docId]: status };
    setStatuses(updated);
    localStorage.setItem('claimo_doc_statuses', JSON.stringify(updated));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <div className="no-print">
        <Header />
      </div>

      <main className="max-w-content mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Top Bar (No Print) */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border dark:border-dark-border pb-4">
            <div>
              <Link
                to="/matches"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal dark:text-dark-teal hover:underline mb-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Matches</span>
              </Link>
              <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
                Document Checklist & Visit Plan
              </h1>
              {schemeName && (
                <div className="text-xs font-semibold text-teal dark:text-dark-teal">
                  Checklist for: {schemeName}
                </div>
              )}
              <p className="text-xs text-muted dark:text-dark-muted">
                Sorted in &quot;Get-This-First&quot; prerequisite order. Complete certificates in this sequence.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary text-xs py-2.5 px-4 self-start sm:self-auto inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Visit Plan</span>
            </button>

            <div className="self-start sm:self-auto">
              <ReadAloudButton
                textToRead={`దరఖాస్తుకు అవసరమైన పత్రాలు: ${documents.map((d, i) => `${i + 1}. ${d.name} from ${d.issuer}`).join('. ')}`}
                label="Listen Plan / వినండి"
              />
            </div>
          </div>

          {/* PRINT-ONLY HEADER */}
          <div className="hidden print-only mb-6 border-b-2 border-black pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-heading">Claimo • Entitlement Visit Plan</h1>
                <p className="text-xs">Take this sheet to the MeeSeva center or college office.</p>
              </div>
              <div className="text-right text-xs">
                {profile?.district && <p className="font-bold">District: {profile.district}</p>}
                <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div className="mt-2 text-xs bg-gray-100 p-2 border border-gray-300">
              <strong>Important:</strong> Carry original documents + 2 photocopies of each. Never pay any extra fee to middlemen.
            </div>
          </div>

          {/* Privacy Pill (No Print) */}
          <div className="no-print p-3 rounded-xl bg-teal-light dark:bg-dark-hero border border-teal/20 dark:border-dark-teal/20 text-xs text-teal dark:text-dark-teal flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>
              <strong>Zero Document IDs Collected:</strong> Claimo helps you track readiness without collecting your Aadhaar, certificate numbers, or document uploads.
            </span>
          </div>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="claimo-card p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border animate-pulse space-y-3">
                  <div className="h-5 bg-border dark:bg-dark-border rounded w-1/2" />
                  <div className="h-4 bg-border dark:bg-dark-border rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="claimo-card p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-3">
              <p className="text-sm font-semibold text-ink dark:text-dark-text">No documents listed</p>
              <p className="text-xs text-muted dark:text-dark-muted">
                {targetSchemeId
                  ? 'This scheme has no specific document checklist published.'
                  : 'Complete your story to see required documents.'}
              </p>
              <Link to="/story" className="btn-primary inline-flex text-xs py-2 px-4">
                Go to Story Input
              </Link>
            </div>
          )}

          {/* Ordered Document Checklist */}
          {!loading && documents.length > 0 && (
            <div className="space-y-4">
              {documents.map((doc, idx) => {
                const currentStatus = statuses[doc.id] || 'missing';

                return (
                  <div
                    key={doc.id}
                    className="claimo-card p-5 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-3 break-inside-avoid"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Step Number in topological order */}
                        <span className="w-7 h-7 rounded-full bg-teal text-white dark:bg-dark-teal dark:text-dark-bg font-heading font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>

                        <div className="space-y-1">
                          <h2 className="font-heading font-bold text-base text-ink dark:text-dark-text">
                            {doc.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted dark:text-dark-muted">
                            <span>Issuer Office: <strong className="text-ink dark:text-dark-text">{doc.issuer}</strong></span>
                            <span>Official Fee: <strong className="text-ink dark:text-dark-text">{doc.official_fee || 'Not published by the scheme'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle (No Print) */}
                      <div className="no-print flex items-center gap-1.5 self-start sm:self-auto bg-alt-bg dark:bg-dark-bg p-1 rounded-xl border border-border dark:border-dark-border">
                        <button
                          type="button"
                          onClick={() => setDocStatus(doc.id, 'have')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            currentStatus === 'have'
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'text-muted dark:text-dark-muted hover:text-ink'
                          }`}
                        >
                          Have it
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocStatus(doc.id, 'in_progress')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            currentStatus === 'in_progress'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-muted dark:text-dark-muted hover:text-ink'
                          }`}
                        >
                          Applying
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocStatus(doc.id, 'missing')}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            currentStatus === 'missing'
                              ? 'bg-gray-600 text-white shadow-sm'
                              : 'text-muted dark:text-dark-muted hover:text-ink'
                          }`}
                        >
                          Need it
                        </button>
                      </div>

                      {/* Checkbox for Print View Only */}
                      <div className="hidden print-only text-right">
                        <div className="inline-block w-5 h-5 border-2 border-black" />
                      </div>
                    </div>

                    {/* Prerequisites Note */}
                    {doc.prerequisites && doc.prerequisites.length > 0 && (
                      <div className="text-xs text-muted dark:text-dark-muted pl-10">
                        <span className="font-semibold text-amber-700 dark:text-amber-400">Prerequisite: </span>
                        Obtain document(s) [{doc.prerequisites.join(', ')}] first before applying for this certificate.
                      </div>
                    )}

                    {/* Steps in order */}
                    {doc.steps && doc.steps.length > 0 && (
                      <div className="pl-10 space-y-1 pt-1 text-xs text-muted dark:text-dark-muted">
                        <div className="font-semibold text-ink dark:text-dark-text">How to apply:</div>
                        <ol className="list-decimal list-inside space-y-0.5">
                          {doc.steps.map((st, sidx) => (
                            <li key={sidx}>{st}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Online Portal Link (No Print) */}
                    {doc.apply_link && doc.apply_link !== 'not_published' && (
                      <div className="no-print pl-10 pt-1">
                        <a
                          href={doc.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal dark:text-dark-teal hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <span>Apply on Official Portal ({doc.issuer})</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <div className="no-print">
        <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
          {t('footer.text')}
        </footer>
      </div>
    </div>
  );
};

export default DocumentsPage;
