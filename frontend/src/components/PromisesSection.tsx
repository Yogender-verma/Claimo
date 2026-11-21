import React from 'react';
import { useTranslation } from 'react-i18next';

export const PromisesSection: React.FC = () => {
  const { t } = useTranslation();

  const promises = [
    {
      key: 'guarantee',
      title: t('promises.cards.guarantee.title'),
      desc: t('promises.cards.guarantee.desc'),
    },
    {
      key: 'aadhaar',
      title: t('promises.cards.aadhaar.title'),
      desc: t('promises.cards.aadhaar.desc'),
    },
    {
      key: 'status',
      title: t('promises.cards.status.title'),
      desc: t('promises.cards.status.desc'),
    },
    {
      key: 'guess',
      title: t('promises.cards.guess.title'),
      desc: t('promises.cards.guess.desc'),
    },
  ];

  return (
    <section id="trust" className="w-full bg-ink text-white py-16 md:py-24 border-b border-[#223B44] scroll-mt-20">
      <div className="max-w-content mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 className="font-heading font-semibold text-white tracking-tight mb-4">
            {t('promises.title')}
          </h2>
          <p className="text-[#B9CDD2] text-base md:text-lg leading-relaxed">
            {t('promises.lead')}
          </p>
        </div>

        {/* 4 Outlined Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promises.map((item) => (
            <div
              key={item.key}
              className="border border-[#2D454E] bg-[#142C34]/60 rounded-card p-6 transition-all duration-200 hover:border-border-teal/60"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
                <h3 className="font-heading font-semibold text-lg text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-[#C1D2D6] text-sm md:text-base leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

