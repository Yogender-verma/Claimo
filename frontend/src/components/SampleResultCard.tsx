import React from 'react';
import { useTranslation } from 'react-i18next';

export const SampleResultCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      role="region"
      aria-label={t('sampleCard.ariaLabel')}
      className="bg-white border border-border rounded-card p-6 shadow-sm w-full max-w-[500px] mx-auto text-ink"
    >
      {/* Header with Sample Profile pill */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Inline SVG bookmark icon */}
          <svg
            className="w-5 h-5 text-teal"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="font-heading font-semibold text-lg text-ink">
            {t('sampleCard.header')}
          </span>
        </div>
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-alt-bg text-muted border border-border">
          {t('sampleCard.pill')}
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {/* 1. Likely eligible card */}
        <div className="p-3.5 rounded-xl bg-teal-light/40 border border-border-teal">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              {t('sampleCard.likelyTier')}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal text-white">
              {t('sampleCard.passPill')}
            </span>
          </div>
          <p className="font-heading font-semibold text-base text-ink mb-2">
            {t('sampleCard.likelyTitle')}
          </p>
          <ul className="space-y-1.5 text-xs text-body-teal">
            <li className="flex items-start gap-1.5">
              <svg className="w-4 h-4 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('sampleCard.rule1')}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <svg className="w-4 h-4 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('sampleCard.rule2')}</span>
            </li>
          </ul>
          <p className="mt-2.5 text-[11px] text-muted border-t border-border-teal/60 pt-2">
            {t('sampleCard.verified')}
          </p>
        </div>

        {/* 2. Possibly card (dashed border) */}
        <div className="p-3.5 rounded-xl border-2 border-dashed border-border bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-accent">
              {t('sampleCard.possiblyTier')}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {t('sampleCard.possiblyTitle')}
          </p>
        </div>

        {/* 3. Not likely card */}
        <div className="p-3.5 rounded-xl border border-border bg-alt-bg/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted">
              {t('sampleCard.notLikelyTier')}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {t('sampleCard.notLikelyTitle')}
          </p>
        </div>
      </div>

      {/* Mandatory Results Footer */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[11px] text-muted text-center font-medium leading-normal">
          {t('sampleCard.footer')}
        </p>
      </div>
    </div>
  );
};
