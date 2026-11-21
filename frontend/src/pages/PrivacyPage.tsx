import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    localStorage.removeItem('claimo_user_profile');
    localStorage.removeItem('claimo_applications');
    localStorage.removeItem('claimo_doc_statuses');
    localStorage.removeItem('claimo_error_reports');
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <Header />

      <main className="max-w-content mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="claimo-card max-w-2xl w-full p-6 sm:p-8 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-6 text-left shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
                Privacy & Data Guarantees
              </h1>
              <p className="text-xs text-muted dark:text-dark-muted">
                How Claimo protects low-income families and intermediate/college students.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-body-teal dark:text-dark-muted">
            <div className="p-4 rounded-xl bg-alt-bg/70 dark:bg-dark-alt border border-border dark:border-dark-border space-y-3">
              <h2 className="font-heading font-semibold text-base text-ink dark:text-dark-text">
                Our Non-Negotiable Rules:
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Zero ID Number Collection:</strong> We never collect or store Aadhaar numbers, ration card numbers, student ID numbers, or phone contacts. If you type an ID number in your story, our system automatically detects and masks it.
                </li>
                <li>
                  <strong>No Story Database or Body Logging:</strong> Stories are processed in-memory solely to extract facts for eligibility checking. We never store story texts, income values, or profile payloads in any server database or server logs.
                </li>
                <li>
                  <strong>Deterministic Rules Engine (Code Decides, AI Translates):</strong> The AI only translates your story into facts. A transparent Python rules engine evaluates scheme eligibility deterministically. The AI never decides whether you qualify.
                </li>
                <li>
                  <strong>Zero Tracking SDKs:</strong> Claimo does not use Google Analytics, Firebase Analytics, Facebook Pixels, or third-party advertising cookies.
                </li>
                <li>
                  <strong>Optional Guest Mode:</strong> Signing in is 100% optional. The entire Claimo journey (story input, matches, documents, visit plan, application tracker) works without creating an account.
                </li>
                <li>
                  <strong>Local Storage Only:</strong> Your saved facts, document readiness, and tracked applications live exclusively inside your browser&apos;s localStorage on your personal device.
                </li>
              </ul>
            </div>

            {/* Clear All Data Section */}
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 space-y-2">
              <h3 className="font-heading font-semibold text-sm text-red-900 dark:text-red-300">
                Wipe Your Data Anytime
              </h3>
              <p className="text-xs text-muted dark:text-dark-muted">
                You can instantly delete all locally saved facts, applications, and documents with one tap.
              </p>
              {cleared ? (
                <div className="p-2 rounded bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 text-xs font-semibold text-center">
                  ✓ All data wiped from this browser. Reloading...
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClearData}
                  className="btn-secondary text-xs py-2 px-3 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50"
                >
                  Clear all data from this device
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Link to="/" className="btn-primary w-full text-center text-xs py-3">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default PrivacyPage;
