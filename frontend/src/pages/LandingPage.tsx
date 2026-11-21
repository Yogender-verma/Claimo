import React, { useEffect, useRef } from 'react';
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
    <div id="top" ref={containerRef} className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />
      <main className="flex-1">
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
