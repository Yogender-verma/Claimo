import React from 'react';
import { useTranslation } from 'react-i18next';

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      num: 1,
      title: t('how.steps.step1.title'),
      desc: t('how.steps.step1.desc'),
    },
    {
      num: 2,
      title: t('how.steps.step2.title'),
      desc: t('how.steps.step2.desc'),
    },
    {
      num: 3,
      title: t('how.steps.step3.title'),
      desc: t('how.steps.step3.desc'),
    },
    {
      num: 4,
      title: t('how.steps.step4.title'),
      desc: t('how.steps.step4.desc'),
    },
  ];

  return (
    <section id="how" className="w-full bg-alt-bg py-16 md:py-24 border-b border-border scroll-mt-20">
      <div className="max-w-content mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <h2 className="font-heading font-semibold text-ink tracking-tight mb-4">
            {t('how.title')}
          </h2>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            {t('how.lead')}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="claimo-card flex flex-col justify-between"
            >
              <div>
                {/* Teal circle with step number */}
                <div
                  className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-heading font-bold text-base mb-6 shadow-sm"
                  aria-hidden="true"
                >
                  {step.num}
                </div>
                <h3 className="font-heading font-semibold text-lg text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
