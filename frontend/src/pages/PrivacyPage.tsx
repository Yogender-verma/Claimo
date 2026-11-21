import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-alt-bg flex flex-col justify-between">
      <header className="w-full bg-white border-b border-border py-4 px-6">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl text-ink">
            <span>Claim</span>
            <span className="text-accent">o</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-teal hover:underline">
            {t('placeholder.backHome')}
          </Link>
        </div>
      </header>

      <main className="max-w-content mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="claimo-card max-w-lg w-full p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-light text-teal flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="font-heading font-bold text-2xl text-ink mb-2">
            {t('placeholder.privacyTitle')}
          </h1>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent-dark mb-4">
            {t('placeholder.comingSoon')}
          </span>
          <p className="text-muted text-sm leading-relaxed mb-6">
            {t('placeholder.privacyDesc')}
          </p>
          <Link to="/" className="btn-secondary w-full">
            {t('placeholder.backHome')}
          </Link>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-border py-6 px-6 text-center text-xs text-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default PrivacyPage;
