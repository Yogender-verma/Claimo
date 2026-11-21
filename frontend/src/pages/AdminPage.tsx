import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading, getIdToken, signOut } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/signin?redirect=/admin');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/admin/check`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsAdmin(true);
        } else if (res.status === 403) {
          setIsAdmin(false);
          const data = await res.json().catch(() => ({}));
          setStatusMessage(data.detail || t('auth.adminAccessDeniedDesc'));
        } else if (res.status === 503) {
          setIsAdmin(false);
          setStatusMessage('Backend Firebase Admin secrets are not configured. Admin area is disabled.');
        } else {
          setIsAdmin(false);
          setStatusMessage(t('auth.adminAccessDeniedDesc'));
        }
      } catch (err) {
        setIsAdmin(false);
        setStatusMessage('Could not connect to the backend server.');
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, getIdToken, navigate, t]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex items-center justify-center text-teal dark:text-dark-teal">
        <div className="w-8 h-8 border-2 border-teal dark:border-dark-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      {/* Header */}
      <header className="w-full bg-white dark:bg-dark-bg border-b border-border dark:border-dark-border py-4 px-6">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl text-ink dark:text-dark-text flex items-center">
            <span>Claim</span>
            <span className="text-accent dark:text-dark-accent">o</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted dark:text-dark-muted hidden sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut().then(() => navigate('/'))}
              className="btn-header-secondary text-xs px-3 py-1.5 min-h-[38px]"
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-content mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        {isAdmin ? (
          /* Authorized Admin Area */
          <div className="claimo-card max-w-2xl w-full p-8 text-left bg-white dark:bg-dark-card border border-border dark:border-dark-border">
            <div className="flex items-center justify-between pb-4 border-b border-border dark:border-dark-border mb-6">
              <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text">
                Admin Dashboard
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal border border-border-teal dark:border-teal/30">
                Verified Admin
              </span>
            </div>
            <p className="text-muted dark:text-dark-muted text-sm mb-6">
              Authenticated as <strong className="text-ink dark:text-dark-text">{user?.email}</strong>. Backend token verification succeeded against allowlist.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-alt-bg/60 dark:bg-dark-alt">
                <h2 className="font-heading font-semibold text-base mb-1 text-ink dark:text-dark-text">Scheme Editor</h2>
                <p className="text-xs text-muted dark:text-dark-muted">Edit verified schemes with verified_by and checked_by fields.</p>
              </div>
              <div className="p-4 rounded-xl border border-border dark:border-dark-border bg-alt-bg/60 dark:bg-dark-alt">
                <h2 className="font-heading font-semibold text-base mb-1 text-ink dark:text-dark-text">Rule Change Radar</h2>
                <p className="text-xs text-muted dark:text-dark-muted">Simulate policy eligibility diffs on synthetic profiles.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Access Denied */
          <div className="claimo-card max-w-md w-full p-8 text-center bg-white dark:bg-dark-card border border-border dark:border-dark-border">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="font-heading font-bold text-2xl text-ink dark:text-dark-text mb-2">
              {t('auth.adminAccessDeniedTitle')}
            </h1>
            <p className="text-muted dark:text-dark-muted text-sm leading-relaxed mb-6">
              {statusMessage || t('auth.adminAccessDeniedDesc')}
            </p>
            <div className="space-y-3">
              <Link to="/" className="btn-secondary w-full text-center">
                {t('auth.backHome')}
              </Link>
              <button
                type="button"
                onClick={() => signOut().then(() => navigate('/signin'))}
                className="text-xs text-muted dark:text-dark-muted hover:underline"
              >
                Sign in with another account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-4 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default AdminPage;
