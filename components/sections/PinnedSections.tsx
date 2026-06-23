'use client';

import { useCallback } from 'react';
import { usePortfolioExperience } from '@/components/experience/PortfolioExperienceContext';

import Hero from './Hero';
import About from './About';
import ProjectShowcase from '../work/ProjectShowcase';
import Contact from './Contact';
import ScrollRuler from '../debug/ScrollRuler';
import NavRail from '../layout/NavRail';
import { useContactOverscroll } from './useContactOverscroll';
import { useHeroExitAnimation } from './useHeroExitAnimation';
import { useScrollProgressPublisher } from './useScrollProgressPublisher';
import { useAboutOrchestration } from './useAboutOrchestration';
import { useActiveSectionObserver } from './useActiveSectionObserver';
import { useContactSceneLifecycle } from './useContactSceneLifecycle';
import EnvironmentTransitionLayer from '../transitions/EnvironmentTransitionLayer';
import { applyThemeVariables, getSectionTheme } from '@/lib/theme/sectionThemes';
import type { PortfolioSectionId } from '@/components/experience/PortfolioExperienceContext';

export default function PinnedSections() {
  const portfolioExperience = usePortfolioExperience();
  const contactScene = useContactSceneLifecycle();
  const setActiveSection = portfolioExperience?.setActiveSection;
  const applySectionTheme = useCallback((sectionId: PortfolioSectionId) => {
    if (typeof document === 'undefined') return;

    applyThemeVariables(document.documentElement, getSectionTheme(sectionId));
  }, []);
  const { handleEnvironmentHandoff, handleEnvironmentReset, handleTransitionComplete } =
    useAboutOrchestration({
      activeSection: portfolioExperience?.activeSection,
      pendingSection: portfolioExperience?.pendingSection,
      isTransitioning: portfolioExperience?.isTransitioning ?? false,
    });

  useActiveSectionObserver({
    isTransitioning: portfolioExperience?.isTransitioning ?? false,
    setActiveSection: setActiveSection ?? (() => {}),
  });

  useContactOverscroll({
    isTransitioning: portfolioExperience?.isTransitioning ?? false,
    activeSection: portfolioExperience?.activeSection,
    pendingSection: portfolioExperience?.pendingSection,
    contactScene,
    setActiveSection: setActiveSection ?? (() => {}),
    onThemeSection: applySectionTheme,
  });

  useHeroExitAnimation();
  useScrollProgressPublisher();

  return (
    <div className="w-full relative bg-[var(--color-bg)]">
      <NavRail />
      <EnvironmentTransitionLayer
        onEnvironmentHandoff={handleEnvironmentHandoff}
        onEnvironmentReset={handleEnvironmentReset}
        onTransitionComplete={handleTransitionComplete}
      />

      <div id="hero-section" className="w-full h-screen relative overflow-hidden">
        <Hero />
      </div>

      <div id="about-section" className="w-full min-h-screen relative overflow-hidden">
        <About />
      </div>

      <div
        id="work-section"
        className="w-full min-h-screen relative overflow-hidden"
        style={{ backgroundColor: '#F6F4F1' }}
      >
        <ProjectShowcase />
      </div>

      <Contact />
      <ScrollRuler />
    </div>
  );
}
