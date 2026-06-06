'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

import Hero from './Hero';
import About from './About';
import ProjectShowcase from '../work/ProjectShowcase';
import Contact from './Contact';
import NavRail from '../layout/NavRail';
import { createContactScene } from '../scenes/ContactScene';

export default function PinnedSections() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let contactScene = createContactScene();
    contactScene.prepare();

    const mm = gsap.matchMedia();

    // Helper to dispatch active section ID to listeners (NavRail, MorphNav)
    const dispatchActiveSection = (sectionId: string) => {
      (window as any).__activeSection = sectionId;
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
        (window as any).__scrollTriggerProgress = self.progress;
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

    // 4. About Section Local Timelines & Pinning (matchMedia for desktop vs mobile)
    // Desktop: Pinned details morph
    mm.add('(min-width: 769px)', () => {
      gsap.set('.about-portrait-img', { clipPath: 'inset(100% 0% 0% 0%)', y: 120, opacity: 0 });
      gsap.set('.about-eyebrow', { opacity: 0, y: 15 });
      gsap.set('.about-char', { yPercent: 100, opacity: 0 });
      gsap.set('.about-description', { opacity: 0, y: 20 });
      gsap.set('.about-portrait-left-img', { xPercent: 50, opacity: 0 });
      gsap.set('.about-sub-content', { opacity: 0 });

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about-section',
          start: 'top top',
          end: '+=100%',
          scrub: 0.5,
          pin: true,
        },
      });

      // Phase 1: Reveal About Intro (0.0 -> 0.35)
      aboutTl
        .to('.about-portrait-img', { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: 0.4 }, 0.0)
        .to('.about-eyebrow', { opacity: 1, y: 0, duration: 0.2 }, 0.1)
        .to('.about-char', { yPercent: 0, opacity: 1, stagger: 0.015, duration: 0.4 }, 0.12)
        .to('.about-description', { opacity: 1, y: 0, duration: 0.2 }, 0.25);

      // Phase 2: Transition from Intro to Deep Dive (0.55 -> 1.0)
      aboutTl
        .to('.about-editorial-text', { opacity: 0, y: -80, duration: 0.35, ease: 'power2.inOut' }, 0.55)
        .to('.about-portrait-img', { xPercent: -50, opacity: 0, duration: 0.35, ease: 'power2.inOut' }, 0.55)
        .to('.about-portrait-left-img', { xPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.inOut' }, 0.55)
        .to('.about-sub-content', { opacity: 1, pointerEvents: 'auto', duration: 0.35, ease: 'none' }, 0.6)
        .to('.sub-section-eyebrow', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.65)
        .to('.sub-section-focus', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.7)
        .to('.sub-section-metrics', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.75)
        .to('.sub-section-stack', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.75);

      // Transition HTML theme variables on scroll
      aboutTl.to('html', {
        '--color-bg': '#FFFFFF',
        '--color-text-1': '#0A0A0A',
        '--color-text-2': '#444444',
        '--color-border': 'rgba(10, 10, 10, 0.15)',
        '--color-accent': '#3F702A',
        '--text-shadow-glow': '0 2px 12px rgba(10, 10, 10, 0.02)',
        '--color-card-bg': 'rgba(255, 255, 255, 0.35)',
        '--color-card-shadow': '0 8px 32px rgba(10, 10, 10, 0.03)',
        '--color-card-shadow-hover': '0 12px 40px rgba(10, 10, 10, 0.05)',
        '--color-text-reveal-bg': 'rgba(10, 10, 10, 0.12)',
        ease: 'power2.inOut',
        duration: 0.3,
      }, 0.1);
    });

    // Mobile: Flowing vertical layout with simple reveals
    mm.add('(max-width: 768px)', () => {
      gsap.set('.about-portrait-img', { opacity: 0, y: 60 });
      gsap.set('.about-eyebrow, .about-description', { opacity: 0, y: 20 });
      gsap.set('.about-char', { opacity: 0, yPercent: 100 });
      gsap.set('.about-sub-content', { opacity: 0, y: 40 });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about-section',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        }
      });

      introTl
        .to('.about-portrait-img', { opacity: 1, y: 0, duration: 0.6 })
        .to('.about-eyebrow', { opacity: 1, y: 0, duration: 0.3 }, 0.2)
        .to('.about-char', { opacity: 1, yPercent: 0, stagger: 0.01, duration: 0.5 }, 0.3)
        .to('.about-description', { opacity: 1, y: 0, duration: 0.3 }, 0.4);

      gsap.to('.about-sub-content', {
        scrollTrigger: {
          trigger: '.about-sub-content',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1,
        y: 0,
        pointerEvents: 'auto',
        duration: 0.5,
      });
    });

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
      mm.revert();
      if (typeof window !== 'undefined') {
        delete (window as any).__activeSection;
        delete (window as any).__scrollTriggerProgress;
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
