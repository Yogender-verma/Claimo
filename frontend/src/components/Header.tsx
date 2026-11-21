import React from 'react';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'te' ? 'en' : 'te';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-content mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Logo linking to top */}
        <a
          href="#top"
          className="font-heading font-bold text-2xl tracking-tight text-ink flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 rounded"
          aria-label="Claimo - Back to top"
        >
          <span>Claim</span>
          <span className="text-accent">o</span>
        </a>

        {/* Navigation links & Language Switcher */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <nav className="flex items-center gap-5 sm:gap-7 text-sm font-medium text-ink" aria-label="Main navigation">
            <a
              href="#how"
              className="hover:text-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 rounded"
            >
              {t('nav.how')}
            </a>
            <a
              href="#features"
              className="hover:text-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 rounded"
            >
              {t('nav.features')}
            </a>
            <a
              href="#trust"
              className="hover:text-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 rounded"
            >
              {t('nav.promises')}
            </a>
          </nav>

          {/* Language Switch Button: Telugu | English */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border hover:border-teal text-ink bg-alt-bg transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 min-h-[44px]"
            aria-label={`Switch language to ${currentLang === 'te' ? 'English' : 'Telugu'}`}
          >
            <span className={currentLang === 'te' ? 'text-teal font-bold' : 'text-muted'}>
              తెలుగు
            </span>
            <span className="text-border">|</span>
            <span className={currentLang === 'en' ? 'text-teal font-bold' : 'text-muted'}>
              English
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
