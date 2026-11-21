import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { TrustStrip } from '../components/TrustStrip';
import { ProblemSection } from '../components/ProblemSection';
import { HowItWorks } from '../components/HowItWorks';
import { FeaturesSection } from '../components/FeaturesSection';
import { PromisesSection } from '../components/PromisesSection';
import { CtaSection } from '../components/CtaSection';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [appCount, setAppCount] = useState<number>(0);

  useEffect(() => {
    try {
      const savedProf = localStorage.getItem('claimo_user_profile');
      if (savedProf) setActiveProfile(JSON.parse(savedProf));
      const savedApps = localStorage.getItem('claimo_applications');
      if (savedApps) setAppCount(JSON.parse(savedApps).length);
    } catch (e) {}
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const sections = containerRef.current?.querySelectorAll('.fade-in-section');
    if (!sections || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <div id="top" ref={containerRef} className="min-h-screen flex flex-col bg-white dark:bg-dark-bg text-ink dark:text-dark-text overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {/* Welcome Back / Progress Resume Card */}
        {activeProfile && (
          <div className="max-w-content mx-auto px-4 sm:px-6 pt-6">
            <div className="claimo-card p-4 sm:p-5 bg-teal-light/50 dark:bg-dark-card border-2 border-teal dark:border-dark-teal flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal dark:text-dark-teal">
                  <span>👋 Welcome Back</span>
                </div>
                <h2 className="font-heading font-bold text-base text-ink dark:text-dark-text">
                  You have an active profile with confirmed facts
                </h2>
                <p className="text-xs text-muted dark:text-dark-muted">
                  {appCount > 0
                    ? `You are tracking ${appCount} application${appCount === 1 ? '' : 's'}. Review upcoming deadlines or check new schemes.`
                    : 'Your verified criteria are ready. View your matching schemes or print your visit plan.'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Link to="/matches" className="btn-primary text-xs py-2 px-4">
                  View My Matches →
                </Link>
                {appCount > 0 && (
                  <Link to="/applications" className="btn-secondary text-xs py-2 px-3">
                    Tracker ({appCount})
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="fade-in-section is-visible">
          <Hero />
        </div>
        <div className="fade-in-section">
          <TrustStrip />
        </div>
        <div className="fade-in-section">
          <ProblemSection />
        </div>
        <div className="fade-in-section">
          <HowItWorks />
        </div>
        <div className="fade-in-section">
          <FeaturesSection />
        </div>
        <div className="fade-in-section">
          <PromisesSection />
        </div>
        <div className="fade-in-section">
          <CtaSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
