import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-white py-12 border-t border-border text-muted text-xs md:text-sm">
      <div className="max-w-content mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="max-w-3xl leading-relaxed text-center md:text-left">
          {t('footer.text')}
        </p>
        <div className="shrink-0">
          <Link
            to="/privacy"
            className="text-teal font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 rounded px-1 py-0.5"
          >
            {t('footer.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
};
