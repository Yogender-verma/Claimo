import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface HelpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSettingsModal: React.FC<HelpSettingsModalProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    const isLarge = document.documentElement.classList.contains('text-size-large');
    setLargeText(isLarge);
    const isReduced = localStorage.getItem('claimo_reduced_motion') === 'true';
    setReducedMotion(isReduced);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'te' ? 'en' : 'te';
    i18n.changeLanguage(nextLang);
  };

  const toggleTextSize = () => {
    const nextVal = !largeText;
    setLargeText(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('text-size-large');
      localStorage.setItem('claimo_large_text', 'true');
    } else {
      document.documentElement.classList.remove('text-size-large');
      localStorage.removeItem('claimo_large_text');
    }
  };

  const toggleReduceMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('motion-reduce');
      localStorage.setItem('claimo_reduced_motion', 'true');
    } else {
      document.documentElement.classList.remove('motion-reduce');
      localStorage.removeItem('claimo_reduced_motion');
    }
  };

  const handleClearAllData = () => {
    localStorage.removeItem('claimo_user_profile');
    localStorage.removeItem('claimo_applications');
    localStorage.removeItem('claimo_doc_statuses');
    localStorage.removeItem('claimo_error_reports');
    setConfirmClearOpen(false);
    setClearedNotice(true);
    setTimeout(() => {
      setClearedNotice(false);
      onClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 id="help-modal-title" className="font-heading font-bold text-xl text-ink dark:text-dark-text">
              Help & Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-text hover:bg-alt-bg dark:hover:bg-dark-bg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 1. Official Grievance Contacts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            <span>Official Government Helplines (Telangana)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="font-bold text-ink dark:text-dark-text">ePASS Scholarship Helpdesk</div>
                <div className="text-muted dark:text-dark-muted">Post-Matric & Pre-Matric queries</div>
              </div>
              <a
                href="tel:04023390228"
                className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1 font-mono"
              >
                📞 040-23390228
              </a>
            </div>

            <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="font-bold text-ink dark:text-dark-text">MeeSeva Citizen Toll-Free</div>
                <div className="text-muted dark:text-dark-muted">Caste, Income & Residence certs</div>
              </div>
              <a
                href="tel:18004251110"
                className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1 font-mono"
              >
                📞 1800-425-1110
              </a>
            </div>

            <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="font-bold text-ink dark:text-dark-text">ePASS Grievance Email</div>
                <div className="text-muted dark:text-dark-muted">Official email support</div>
              </div>
              <a
                href="mailto:helpdesk.telanganaepass@cgg.gov.in"
                className="text-teal dark:text-dark-teal hover:underline font-mono text-[11px]"
              >
                helpdesk.telanganaepass@cgg.gov.in
              </a>
            </div>
          </div>
        </div>

        {/* 2. Preferences & Accessibility */}
        <div className="space-y-3 pt-2 border-t border-border dark:border-dark-border">
          <div className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            Preferences & Accessibility
          </div>

          <div className="space-y-2 text-xs">
            {/* Language toggle */}
            <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="font-bold text-ink dark:text-dark-text">Language / భాష</div>
                <div className="text-muted dark:text-dark-muted">
                  Current: {i18n.language === 'te' ? 'తెలుగు' : 'English'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold"
              >
                Switch to {i18n.language === 'te' ? 'English' : 'తెలుగు'}
              </button>
            </div>

            {/* Text size toggle */}
            <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="font-bold text-ink dark:text-dark-text">Text Size</div>
                <div className="text-muted dark:text-dark-muted">
                  {largeText ? 'Large text enabled' : 'Standard size'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTextSize}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  largeText
                    ? 'bg-teal text-white dark:bg-dark-teal dark:text-dark-bg border-teal'
                    : 'btn-secondary'
                }`}
              >
                {largeText ? 'Standard' : 'Large'}
              </button>
            </div>

            {/* Reduce motion toggle */}
            <div className="p-3 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border flex items-center justify-between">
              <div>
                <div className="font-bold text-ink dark:text-dark-text">Reduce Motion</div>
                <div className="text-muted dark:text-dark-muted">
                  Minimizes transitions and animated elements
                </div>
              </div>
              <button
                type="button"
                onClick={toggleReduceMotion}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  reducedMotion
                    ? 'bg-teal text-white dark:bg-dark-teal dark:text-dark-bg border-teal'
                    : 'btn-secondary'
                }`}
              >
                {reducedMotion ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Privacy & Data Reset */}
        <div className="space-y-3 pt-2 border-t border-border dark:border-dark-border">
          <div className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
            Data Privacy & Reset
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/privacy"
              onClick={onClose}
              className="text-xs font-semibold text-teal dark:text-dark-teal hover:underline"
            >
              Read our full Privacy Commitments →
            </Link>
          </div>

          {clearedNotice ? (
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 text-xs font-semibold text-center">
              ✓ All local data cleared from this browser. Reloading...
            </div>
          ) : confirmClearOpen ? (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
              <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                Are you sure? This will wipe your story, saved facts, document checklists, and application tracker from this device.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="py-1.5 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                >
                  Yes, wipe everything
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
            >
              Clear all my data from this device
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default HelpSettingsModal;
