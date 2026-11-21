import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SampleResultCard } from './SampleResultCard';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-teal-light border-b border-border-teal/50 py-12 md:py-16 lg:py-20">
      <div className="max-w-content mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Information and CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Context Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-border-teal shadow-xs text-xs font-semibold text-teal tracking-wide">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              <span>{t('hero.pill')}</span>
            </div>

            {/* Main H1 Heading */}
            <h1 className="font-heading font-bold text-ink tracking-tight">
              {t('hero.title')}
            </h1>

            {/* Telugu Tagline Line (Noto Sans Telugu, teal, 20px) */}
            <p
              className="text-teal font-medium text-[20px] leading-relaxed"
              style={{ fontFamily: '"Noto Sans Telugu", Inter, sans-serif' }}
            >
              {t('hero.teluguLine')}
            </p>

            {/* Descriptive Body Paragraph */}
            <p className="text-body-teal text-base md:text-lg leading-relaxed max-w-2xl font-normal">
              {t('hero.description')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/story" className="btn-primary text-center">
                {t('hero.ctaPrimary')}
              </Link>
              <a href="#how" className="btn-secondary text-center">
                {t('hero.ctaSecondary')}
              </a>
            </div>

            {/* Privacy / Zero Login Note */}
            <div className="pt-1 flex items-center gap-2 text-xs text-muted">
              <svg className="w-4 h-4 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{t('hero.note')}</span>
            </div>
          </div>

          {/* Right Column: Decorative Sample Result Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <SampleResultCard />
          </div>
        </div>
      </div>
    </section>
  );
};
