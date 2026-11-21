import React from 'react';
import { useTranslation } from 'react-i18next';

export const ProblemSection: React.FC = () => {
  const { t } = useTranslation();

  const problemCards = [
    {
      key: 'scattered',
      title: t('problem.cards.scattered.title'),
      desc: t('problem.cards.scattered.desc'),
      icon: (
        <svg className="w-6 h-6 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      key: 'rules',
      title: t('problem.cards.rules.title'),
      desc: t('problem.cards.rules.desc'),
      icon: (
        <svg className="w-6 h-6 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      key: 'documents',
      title: t('problem.cards.documents.title'),
      desc: t('problem.cards.documents.desc'),
      icon: (
        <svg className="w-6 h-6 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'middlemen',
      title: t('problem.cards.middlemen.title'),
      desc: t('problem.cards.middlemen.desc'),
      icon: (
        <svg className="w-6 h-6 text-teal dark:text-dark-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white dark:bg-dark-bg py-16 md:py-20 border-b border-border dark:border-dark-border">
      <div className="max-w-content mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="font-heading font-semibold text-ink dark:text-dark-text tracking-tight mb-4">
            {t('problem.title')}
          </h2>
          <p className="text-muted dark:text-dark-muted text-base md:text-lg leading-relaxed">
            {t('problem.lead')}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problemCards.map((card) => (
            <div
              key={card.key}
              className="claimo-card flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-light dark:bg-dark-hero flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <h3 className="font-heading font-semibold text-xl text-ink dark:text-dark-text mb-2">
                  {card.title}
                </h3>
                <p className="text-muted dark:text-dark-muted text-sm md:text-base leading-relaxed">
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
