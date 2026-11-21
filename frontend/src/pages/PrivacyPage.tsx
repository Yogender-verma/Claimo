import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border py-4 px-6">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl text-ink dark:text-dark-text flex items-center">
            <span>Claim</span>
            <span className="text-accent dark:text-dark-accent">o</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-teal dark:text-dark-teal hover:underline">
            {t('privacy.backHome')}
          </Link>
        </div>
      </header>

      <main className="max-w-content mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center">
        <div className="claimo-card max-w-2xl w-full p-8 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-6 text-left">
          <div className="flex items-center gap-3 pb-4 border-b border-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
              {t('privacy.title')}
            </h1>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-body-teal dark:text-dark-muted">
            <p className="font-medium text-ink dark:text-dark-text">
              {t('privacy.authDisclosure')}
            </p>

            <div className="p-4 rounded-xl bg-alt-bg/70 dark:bg-dark-alt border border-border dark:border-dark-border space-y-3">
              <h2 className="font-heading font-semibold text-base text-ink dark:text-dark-text">
                Our Privacy Commitments:
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li><strong>No ID Numbers:</strong> We never ask for or store Aadhaar numbers, ration card numbers, or college student IDs.</li>
                <li><strong>No Database of Stories:</strong> Your story text and confirmed income are sent securely to our API solely to evaluate rules and are never logged or stored in a server database.</li>
                <li><strong>Optional Accounts:</strong> Signing in is optional. Google Firebase Authentication manages email credentials only.</li>
                <li><strong>Local Progress:</strong> Application tracker checkpoints stay safely in your browser&apos;s localStorage and can be wiped anytime via &quot;Clear my data&quot;.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/" className="btn-primary w-full text-center">
              {t('privacy.backHome')}
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-4 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default PrivacyPage;
