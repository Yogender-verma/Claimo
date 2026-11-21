import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HelpSettingsModal from './HelpSettingsModal';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

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

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Truncate email for compact display
  const displayEmail = user?.email
    ? user.email.length > 18
      ? `${user.email.slice(0, 15)}...`
      : user.email
    : '';

  return (
    <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border sticky top-0 z-50">
      <div className="max-w-content mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="font-heading font-bold text-2xl tracking-tight text-ink dark:text-dark-text flex items-center shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal dark:focus-visible:outline-dark-teal rounded"
          aria-label="Claimo - Home"
        >
          <span>Claim</span>
          <span className="text-accent dark:text-dark-accent">o</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink dark:text-dark-text" aria-label="Main navigation">
          <a href="/#how" className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150">
            {t('nav.how')}
          </a>
          <a href="/#features" className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150">
            {t('nav.features')}
          </a>
          <a href="/#trust" className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150">
            {t('nav.promises')}
          </a>
          {user && (
            <Link to="/admin" className="hover:text-teal dark:hover:text-dark-teal transition-colors duration-150 text-xs px-2 py-0.5 rounded bg-alt-bg dark:bg-dark-card border border-border dark:border-dark-border">
              {t('nav.admin')}
            </Link>
          )}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Settings / Help Button */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card hover:border-teal dark:hover:border-dark-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
            aria-label="Help and Settings"
          >
            <svg className="w-4 h-4 text-ink dark:text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card hover:border-teal dark:hover:border-dark-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
            aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {isDark ? (
              <svg className="w-4 h-4 text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card hover:border-teal dark:hover:border-dark-teal min-h-[40px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
            aria-label={`Switch language to ${currentLang === 'te' ? 'English' : 'Telugu'}`}
          >
            <span className={currentLang === 'te' ? 'text-teal dark:text-dark-teal font-bold' : 'text-muted dark:text-dark-muted'}>
              తెలుగు
            </span>
            <span className="text-border dark:text-dark-border">|</span>
            <span className={currentLang === 'en' ? 'text-teal dark:text-dark-teal font-bold' : 'text-muted dark:text-dark-muted'}>
              En
            </span>
          </button>

          {/* Desktop Auth Section */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <span className="text-xs font-medium text-muted dark:text-dark-muted px-2 py-1 bg-alt-bg dark:bg-dark-card rounded-md border border-border dark:border-dark-border" title={user.email || ''}>
                  {displayEmail}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-header-secondary text-xs px-3 py-1.5 min-h-[38px]"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="btn-header-secondary text-xs px-3.5 py-1.5 min-h-[38px]">
                  {t('nav.signIn')}
                </Link>
                <Link to="/signup" className="btn-header-primary text-xs px-3.5 py-1.5 min-h-[38px]">
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border dark:border-dark-border text-ink dark:text-dark-text bg-alt-bg dark:bg-dark-card"
            aria-label={mobileMenuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-3 space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <a href="/#how" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card">
              {t('nav.how')}
            </a>
            <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card">
              {t('nav.features')}
            </a>
            <a href="/#trust" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card">
              {t('nav.promises')}
            </a>
            {user && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-alt-bg dark:hover:bg-dark-card text-teal dark:text-dark-teal font-semibold">
                {t('nav.admin')}
              </Link>
            )}
          </nav>
          <div className="pt-2 border-t border-border dark:border-dark-border flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-xs text-muted dark:text-dark-muted px-3 py-1">
                  {user.email}
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-header-secondary w-full text-center"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="btn-header-secondary w-full text-center">
                  {t('nav.signIn')}
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-header-primary w-full text-center">
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Help & Settings Modal */}
      <HelpSettingsModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </header>
  );
};
