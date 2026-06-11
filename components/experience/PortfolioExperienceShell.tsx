'use client';

import { useEffect, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import ProjectShowcase from '@/components/work/ProjectShowcase';
import NavRail from '@/components/layout/NavRail';
import { createContactScene } from '@/components/scenes/ContactScene';
import CurtainTransitionLayer from './CurtainTransitionLayer';
import {
  useRequiredPortfolioExperience,
  type PortfolioSectionId,
} from './PortfolioExperienceContext';

const sceneMotion = {
  initial: { opacity: 0, y: 16, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.998 },
};

const sceneTransition = {
  duration: 0.48,
  ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number],
};

function HeroSceneView() {
  return (
    <section id="hero-section" className="portfolio-scene-surface">
      <Hero />
    </section>
  );
}

function AboutSceneView() {
  useLayoutEffect(() => {
    gsap.set('.about-portrait-img', {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      y: 0,
      scale: 1,
    });
    gsap.set('.about-portrait-left-img', { opacity: 0 });
    gsap.set([
      '.about-editorial-text',
      '.about-text-line',
      '.about-eyebrow',
      '.about-description',
      '.about-sub-content',
      '.sub-section-eyebrow',
      '.sub-section-focus',
      '.sub-section-metrics',
      '.sub-section-stack',
    ], {
      opacity: 1,
      y: 0,
      yPercent: 0,
      filter: 'blur(0px)',
      pointerEvents: 'auto',
    });
    gsap.set('.about-char', {
      opacity: 1,
      y: 0,
      yPercent: 0,
      filter: 'blur(0px)',
    });
  }, []);

  return (
    <section id="about-section" className="portfolio-scene-surface about-virtual-scene">
      <About />
    </section>
  );
}

function WorkSceneView() {
  return (
    <section id="work-section" className="portfolio-scene-surface work-virtual-scene">
      <div className="portfolio-local-scroll">
        <ProjectShowcase enableScrollEffects={false} />
      </div>
    </section>
  );
}

function ContactSceneView() {
  useLayoutEffect(() => {
    const contactScene = createContactScene();
    contactScene.prepare();
    contactScene.setProgress(1);

    return () => {
      contactScene.exit();
      contactScene.destroy();
    };
  }, []);

  return (
    <section id="contact-section" className="portfolio-scene-surface contact-virtual-scene">
      <Contact />
    </section>
  );
}

function renderScene(section: PortfolioSectionId) {
  switch (section) {
    case 'about':
      return <AboutSceneView />;
    case 'work':
      return <WorkSceneView />;
    case 'contact':
      return <ContactSceneView />;
    case 'hero':
    default:
      return <HeroSceneView />;
  }
}

function PortfolioExperienceRuntime() {
  const {
    activeSection,
    transitionPhase,
    markCovered,
    markRevealed,
  } = useRequiredPortfolioExperience();

  useEffect(() => {
    document.documentElement.classList.add('portfolio-virtual-experience');
    document.body.classList.add('portfolio-virtual-experience');

    return () => {
      document.documentElement.classList.remove('portfolio-virtual-experience');
      document.body.classList.remove('portfolio-virtual-experience');
    };
  }, []);

  useEffect(() => {
    (window as Window & { __activeSection?: PortfolioSectionId }).__activeSection =
      activeSection;
    window.dispatchEvent(
      new CustomEvent('activeSectionChange', {
        detail: { activeSection },
      })
    );
  }, [activeSection]);

  useEffect(() => {
    const themeBySection: Record<PortfolioSectionId, Record<string, string>> = {
      hero: {
        '--color-bg': '#0A0A0A',
        '--color-text-1': '#FFFFFF',
        '--color-text-2': '#888888',
        '--color-text-3': '#555555',
        '--color-border': '#2A2A2A',
        '--color-accent': '#C9F0A8',
      },
      about: {
        '--color-bg': '#FFFFFF',
        '--color-text-1': '#0A0A0A',
        '--color-text-2': '#444444',
        '--color-text-3': '#555555',
        '--color-border': 'rgba(10, 10, 10, 0.15)',
        '--color-accent': '#3F702A',
      },
      work: {
        '--color-bg': '#FFFFFF',
        '--color-text-1': '#0A0A0A',
        '--color-text-2': '#444444',
        '--color-text-3': '#555555',
        '--color-border': 'rgba(10, 10, 10, 0.15)',
        '--color-accent': '#3F702A',
      },
      contact: {
        '--color-bg': '#050505',
        '--color-text-1': '#FFFFFF',
        '--color-text-2': '#CFCFCF',
        '--color-text-3': '#777777',
        '--color-border': 'rgba(255, 255, 255, 0.14)',
        '--color-accent': '#C9F0A8',
      },
    };

    Object.entries(themeBySection[activeSection]).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, [activeSection]);

  useEffect(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }, [activeSection]);

  return (
    <div className="portfolio-experience-shell">
      <NavRail />
      <main className="portfolio-scene-host" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            className="portfolio-scene-layer"
            variants={sceneMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={sceneTransition}
          >
            {renderScene(activeSection)}
          </motion.div>
        </AnimatePresence>
      </main>

      <CurtainTransitionLayer
        phase={transitionPhase}
        onCovered={markCovered}
        onRevealed={markRevealed}
      />
    </div>
  );
}

export default function PortfolioExperienceShell() {
  return <PortfolioExperienceRuntime />;
}
