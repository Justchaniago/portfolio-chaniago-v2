'use client';

import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

import Hero from './Hero';
import About from './About';
import ProjectShowcase from '../work/ProjectShowcase';
import Contact from './Contact';
import NavRail from '../layout/NavRail';
import { createAboutController } from '../about/AboutController';
import { createContactScene } from '../scenes/ContactScene';

type PortfolioWindow = Window & {
  __activeSection?: string;
  __scrollTriggerProgress?: number;
};

export default function PinnedSections() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const portfolioWindow = window as PortfolioWindow;
    const aboutController = createAboutController();
    const contactScene = createContactScene();
    contactScene.prepare();

    // Helper to dispatch active section ID to listeners (NavRail, MorphNav)
    const dispatchActiveSection = (sectionId: string) => {
      portfolioWindow.__activeSection = sectionId;
      window.dispatchEvent(
        new CustomEvent('activeSectionChange', {
          detail: { activeSection: sectionId },
        })
      );
    };

    // 1. Setup Section Observer (determines active section when visible area >= 40%)
    const sectionIds = ['hero', 'about', 'work', 'contact'];
    sectionIds.forEach((id) => {
      ScrollTrigger.create({
        trigger: `#${id}-section`,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) {
            dispatchActiveSection(id);
          }
        },
        onEnter: () => dispatchActiveSection(id),
        onEnterBack: () => dispatchActiveSection(id),
      });
    });

    // 2. Setup Global Scroll Progress Publisher for Navigation Rail fill
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        portfolioWindow.__scrollTriggerProgress = self.progress;
        window.dispatchEvent(
          new CustomEvent('scrollTriggerProgress', {
            detail: { progress: self.progress },
          })
        );
      },
    });

    // 3. Hero Parallax and Fade out on Scroll
    gsap.to('.hero-text-content', {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      opacity: 0,
      y: -80,
      ease: 'none',
    });

    gsap.to('.hero-fluid-canvas', {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      opacity: 0,
      ease: 'none',
    });

    // 4. About Section Local Timelines & Pinning
    aboutController.prepare();

    // 5. Contact Section ScrollTrigger Reveal
    ScrollTrigger.create({
      trigger: '#contact-section',
      start: 'top 70%',
      onEnter: () => contactScene?.enter(),
      onLeaveBack: () => contactScene?.exit(),
    });

    // Trigger theme variables to revert when exiting contact section upwards
    ScrollTrigger.create({
      trigger: '#contact-section',
      start: 'top bottom',
      onLeaveBack: () => {
        gsap.to('html', {
          '--color-bg': '#FFFFFF',
          '--color-text-1': '#0A0A0A',
          '--color-text-2': '#444444',
          '--color-border': 'rgba(10, 10, 10, 0.15)',
          '--color-accent': '#3F702A',
          duration: 0.3,
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      contactScene.destroy();
      aboutController.destroy();
      if (typeof window !== 'undefined') {
        delete portfolioWindow.__activeSection;
        delete portfolioWindow.__scrollTriggerProgress;
      }
    };
  }, []);

  return (
    <div className="w-full relative bg-void">
      <NavRail />

      <div id="hero-section" className="w-full h-screen relative overflow-hidden">
        <Hero />
      </div>

      <div id="about-section" className="w-full min-h-screen relative overflow-hidden">
        <About />
      </div>

      <div id="work-section" className="w-full min-h-screen relative overflow-hidden">
        <ProjectShowcase />
      </div>

      <div id="contact-section" className="w-full min-h-screen relative overflow-hidden">
        <Contact />
      </div>
    </div>
  );
}
