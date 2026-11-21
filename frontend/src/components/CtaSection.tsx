import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const CtaSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-teal-light py-16 md:py-24 border-b border-border-teal/50 text-center">
      <div className="max-w-content mx-auto px-6 flex flex-col items-center">
        <h2 className="font-heading font-bold text-ink tracking-tight mb-4 max-w-xl">
          {t('cta.title')}
        </h2>
        <p className="text-body-teal text-base md:text-lg leading-relaxed max-w-xl mb-8">
          {t('cta.text')}
        </p>
        <Link to="/story" className="btn-primary">
          {t('cta.button')}
        </Link>
      </div>
    </section>
  );
};
