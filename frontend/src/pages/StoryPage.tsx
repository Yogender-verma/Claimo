import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const StoryPage: React.FC = () => {
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
            {t('placeholder.backHome')}
          </Link>
        </div>
      </header>

      <main className="max-w-content mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="claimo-card max-w-lg w-full p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border">
          <div className="w-12 h-12 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text mb-2">
            {t('placeholder.storyTitle')}
          </h1>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft dark:bg-dark-accent-soft text-accent-dark dark:text-dark-accent-text mb-4">
            {t('placeholder.comingSoon')}
          </span>
          <p className="text-muted dark:text-dark-muted text-sm leading-relaxed mb-6">
            {t('placeholder.storyDesc')}
          </p>
          <Link to="/" className="btn-secondary w-full">
            {t('placeholder.backHome')}
          </Link>
        </div>
      </main>

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default StoryPage;
