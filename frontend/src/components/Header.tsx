import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Initialize theme from HTML class or localStorage
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('claimo_theme', 'dark');
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#0E1A1F');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('claimo_theme', 'light');
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#FFFFFF');
    }
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'te' ? 'en' : 'te';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border sticky top-0 z-50">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        {/* Logo linking to top */}
        <a
          href="#top"
          className="font-heading font-bold text-2xl tracking-tight text-ink dark:text-dark-text flex items-center shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2 rounded"
          aria-label="Claimo - Back to top"
        >
          <span>Claim</span>
          <span className="text-accent dark:text-dark-accent">o</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink dark:text-dark-text" aria-label="Main navigation">
          <a
            href="#how"
            className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2 rounded"
          >
            {t('nav.how')}
          </a>
          <a
            href="#features"
            className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2 rounded"
          >
            {t('nav.features')}
          </a>
          <a
            href="#trust"
            className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2 rounded"
          >
            {t('nav.promises')}
          </a>
        </nav>

        {/* Right side controls: Theme toggle, Language switch, Auth buttons (desktop), Mobile menu button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card hover:border-teal dark:hover:border-dark-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2"
            aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {isDark ? (
              // Sun icon for dark mode (click to switch to light)
              <svg className="w-5 h-5 text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon for light mode (click to switch to dark)
              <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Language Switch Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card hover:border-teal dark:hover:border-dark-teal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2 min-h-[44px]"
            aria-label={`Switch language to ${currentLang === 'te' ? 'English' : 'Telugu'}`}
          >
            <span className={currentLang === 'te' ? 'text-teal dark:text-dark-teal font-bold' : 'text-muted dark:text-dark-muted'}>
              తెలుగు
            </span>
            <span className="text-border dark:text-dark-border">|</span>
            <span className={currentLang === 'en' ? 'text-teal dark:text-dark-teal font-bold' : 'text-muted dark:text-dark-muted'}>
              English
            </span>
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 ml-1">
            <Link to="/signin" className="btn-header-secondary">
              {t('nav.signIn')}
            </Link>
            <Link to="/signup" className="btn-header-primary">
              {t('nav.signUp')}
            </Link>
          </div>

          {/* Mobile Menu Toggle (small screens) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card hover:border-teal dark:hover:border-dark-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal focus-visible:outline-offset-2"
            aria-label={mobileMenuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5 text-ink dark:text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-ink dark:text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu (keeps mobile clean & prevents horizontal scroll at 360px) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-ink dark:text-dark-text">
            <a
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card text-ink dark:text-dark-text"
            >
              {t('nav.how')}
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card text-ink dark:text-dark-text"
            >
              {t('nav.features')}
            </a>
            <a
              href="#trust"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card text-ink dark:text-dark-text"
            >
              {t('nav.promises')}
            </a>
          </nav>
          <div className="pt-2 border-t border-border dark:border-dark-border flex flex-col gap-2.5">
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-header-secondary w-full text-center"
            >
              {t('nav.signIn')}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-header-primary w-full text-center"
            >
              {t('nav.signUp')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
