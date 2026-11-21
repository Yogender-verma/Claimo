import React from 'react';
import { useTranslation } from 'react-i18next';

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      key: 'confirmation',
      title: t('features.cards.confirmation.title'),
      desc: t('features.cards.confirmation.desc'),
      icon: (
        <svg className="w-5 h-5 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'tiers',
      title: t('features.cards.tiers.title'),
      desc: t('features.cards.tiers.desc'),
      icon: (
        <svg className="w-5 h-5 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'nearMiss',
      title: t('features.cards.nearMiss.title'),
      desc: t('features.cards.nearMiss.desc'),
      icon: (
        <svg className="w-5 h-5 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'docOrder',
      title: t('features.cards.docOrder.title'),
      desc: t('features.cards.docOrder.desc'),
      icon: (
        <svg className="w-5 h-5 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      key: 'feeShield',
      title: t('features.cards.feeShield.title'),
      desc: t('features.cards.feeShield.desc'),
      icon: (
        <svg className="w-5 h-5 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: 'telugu',
      title: t('features.cards.telugu.title'),
      desc: t('features.cards.telugu.desc'),
      icon: (
        <svg className="w-5 h-5 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="w-full bg-white dark:bg-dark-bg py-16 md:py-24 border-b border-border dark:border-dark-border scroll-mt-20">
      <div className="max-w-content mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 className="font-heading font-semibold text-ink dark:text-dark-text tracking-tight mb-4">
            {t('features.title')}
          </h2>
          <p className="text-muted dark:text-dark-muted text-base md:text-lg leading-relaxed">
            {t('features.lead')}
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((card) => (
            <div
              key={card.key}
              className="claimo-card flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-light dark:bg-dark-hero flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg text-ink dark:text-dark-text mb-2">
                  {card.title}
                </h3>
                <p className="text-muted dark:text-dark-muted text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
