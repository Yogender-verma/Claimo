import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../lib/authErrors';

const SignInPage: React.FC = () => {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle, sendPasswordReset, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setErrorKey(null);
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate(redirectPath);
    } catch (err: any) {
      setErrorKey(getFriendlyAuthErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorKey(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      navigate(redirectPath);
    } catch (err: any) {
      setErrorKey(getFriendlyAuthErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetSubmitting(true);
    try {
      await sendPasswordReset(resetEmail.trim());
    } catch (err: any) {
      // Intentionally show neutral success message even if email does not exist,
      // as required to prevent email enumeration.
    } finally {
      setResetSent(true);
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      {/* Header */}
      <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border py-4 px-6">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl text-ink dark:text-dark-text flex items-center">
            <span>Claim</span>
            <span className="text-accent dark:text-dark-accent">o</span>
          </Link>
          <Link
            to="/story"
            className="text-xs sm:text-sm font-medium text-teal dark:text-dark-teal hover:underline px-2 py-1"
          >
            {t('auth.continueWithout')} &rarr;
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-content mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="claimo-card max-w-md w-full p-6 sm:p-8 bg-white dark:bg-dark-card border border-border dark:border-dark-border shadow-sm">
          {/* Logo Badge */}
          <div className="w-12 h-12 rounded-xl bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>

          <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text text-center mb-2">
            {t('auth.signInHeading')}
          </h1>

          <p className="text-muted dark:text-dark-muted text-xs sm:text-sm text-center mb-6 leading-relaxed">
            {t('auth.honestMessage')}
          </p>

          {!isConfigured && (
            <div className="p-3 mb-6 rounded-lg bg-accent-soft dark:bg-dark-accent-soft text-accent-dark dark:text-dark-accent-text text-xs leading-relaxed">
              {t('auth.notConfiguredNotice')}
            </div>
          )}

          {errorKey && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 mb-5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs leading-relaxed"
            >
              {t(errorKey)}
            </div>
          )}

          {/* Sign In Form */}
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-semibold text-ink dark:text-dark-text mb-1.5"
                >
                  {t('auth.emailLabel')}
                </label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  autoComplete="email"
                  disabled={!isConfigured || isSubmitting}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-alt text-ink dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal disabled:opacity-50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="signin-password"
                    className="block text-xs font-semibold text-ink dark:text-dark-text"
                  >
                    {t('auth.passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-teal dark:text-dark-teal hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                    autoComplete="current-password"
                    disabled={!isConfigured || isSubmitting}
                    className="w-full px-3.5 py-2.5 pr-12 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-alt text-ink dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted dark:text-dark-muted px-2 py-1 rounded hover:text-ink dark:hover:text-dark-text min-h-[32px]"
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isConfigured || isSubmitting}
                className="btn-primary w-full text-center mt-2"
              >
                {isSubmitting ? '...' : t('auth.submitSignIn')}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border dark:border-dark-border" />
                <span className="flex-shrink mx-3 text-xs text-muted dark:text-dark-muted">
                  {t('auth.or')}
                </span>
                <div className="flex-grow border-t border-border dark:border-dark-border" />
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={!isConfigured || isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-btn border border-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-alt-bg dark:hover:bg-dark-alt text-ink dark:text-dark-text transition-colors min-h-[44px] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('auth.continueWithGoogle')}</span>
              </button>

              <div className="pt-3 text-center text-xs text-muted dark:text-dark-muted">
                <span>{t('auth.dontHaveAccount')} </span>
                <Link to="/signup" className="text-teal dark:text-dark-teal font-semibold hover:underline">
                  {t('nav.signUp')}
                </Link>
              </div>
            </form>
          ) : (
            /* Forgot Password Flow */
            <form onSubmit={handleSendResetLink} className="space-y-4 text-left">
              <h2 className="font-heading font-semibold text-lg text-ink dark:text-dark-text">
                {t('auth.resetPasswordTitle')}
              </h2>
              <p className="text-xs text-muted dark:text-dark-muted leading-relaxed">
                {t('auth.resetPasswordDesc')}
              </p>

              {resetSent ? (
                <div className="p-3.5 rounded-lg bg-teal-light dark:bg-dark-hero text-body-teal dark:text-dark-text text-xs leading-relaxed space-y-3">
                  <p>{t('auth.resetSentNotice')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                    }}
                    className="text-teal dark:text-dark-teal font-semibold hover:underline"
                  >
                    &larr; {t('auth.submitSignIn')}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-xs font-semibold text-ink dark:text-dark-text mb-1.5"
                    >
                      {t('auth.emailLabel')}
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      required
                      autoComplete="email"
                      disabled={resetSubmitting}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-alt text-ink dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="btn-primary w-full text-center"
                  >
                    {resetSubmitting ? '...' : t('auth.sendResetLink')}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-xs text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-text"
                    >
                      &larr; {t('auth.submitSignIn')}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Continue without account fallback */}
          <div className="mt-6 pt-5 border-t border-border dark:border-dark-border text-center">
            <Link
              to="/story"
              className="inline-block text-xs sm:text-sm font-medium text-teal dark:text-dark-teal hover:underline"
            >
              {t('auth.continueWithout')} &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-4 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default SignInPage;
