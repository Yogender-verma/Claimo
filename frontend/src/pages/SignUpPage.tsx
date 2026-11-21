import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      {/* Simple Header */}
      <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border py-4 px-6">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl text-ink dark:text-dark-text flex items-center">
            <span>Claim</span>
            <span className="text-accent dark:text-dark-accent">o</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-teal dark:text-dark-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal rounded px-1"
          >
            {t('auth.backHome')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-content mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="claimo-card max-w-md w-full p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border">
          {/* User Add Icon */}
          <div className="w-14 h-14 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text mb-3">
            {t('auth.signUpHeading')}
          </h1>

          <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent-soft dark:bg-dark-accent-soft text-accent-dark dark:text-dark-accent-text mb-5">
            {t('auth.comingSoon')}
          </div>

          {/* Honest Status Message */}
          <p className="text-muted dark:text-dark-muted text-sm md:text-base leading-relaxed mb-8">
            {t('auth.honestMessage')}
          </p>

          {/* Action to continue without account */}
          <div className="space-y-4">
            <Link to="/story" className="btn-primary w-full text-center">
              {t('auth.continueWithout')}
            </Link>
            <Link
              to="/"
              className="inline-block text-sm font-medium text-teal dark:text-dark-teal hover:underline pt-2"
            >
              {t('auth.backHome')}
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default SignUpPage;
