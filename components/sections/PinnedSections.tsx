'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { usePortfolioExperience } from '@/components/experience/PortfolioExperienceContext';

import Hero from './Hero';
import About from './About';
import ProjectShowcase from '../work/ProjectShowcase';
import Contact from './Contact';
import NavRail from '../layout/NavRail';
import { createAboutController } from '../about/AboutController';
import { createAboutEnvironmentLifecycle } from '../about/AboutEnvironmentLifecycle';
import { createContactScene } from '../scenes/ContactScene';
import EnvironmentTransitionLayer from '../transitions/EnvironmentTransitionLayer';
import { applyThemeVariables, getSectionTheme, palette } from '@/lib/theme/sectionThemes';

type PortfolioWindow = Window & {
  __activeSection?: string;
  __scrollTriggerProgress?: number;
  __isTransitioning?: boolean;
};

export default function PinnedSections() {
  const portfolioExperience = usePortfolioExperience();
  const isTransitioningRef = useRef(false);
  const contactThemeResetDelayRef = useRef<gsap.core.Tween | null>(null);

  const aboutEnvironmentRef = useRef<ReturnType<typeof createAboutEnvironmentLifecycle> | null>(null);
  const aboutControllerRef = useRef<ReturnType<typeof createAboutController> | null>(null);
  const contactScrollSpacerRef = useRef<HTMLDivElement>(null);
  const contactSceneRef = useRef<ReturnType<typeof createContactScene> | null>(null);

  if (aboutEnvironmentRef.current === null) {
    aboutEnvironmentRef.current = createAboutEnvironmentLifecycle();
  }

  const handleEnvironmentHandoff = useCallback(() => {
    if (isTransitioningRef.current) return;
    aboutEnvironmentRef.current?.activate();
  }, []);

  const handleEnvironmentReset = useCallback(() => {
    if (isTransitioningRef.current) return;
    aboutEnvironmentRef.current?.deactivate();
  }, []);

  const handleTransitionComplete = useCallback((complete: boolean) => {
    aboutControllerRef.current?.setTransitionComplete(complete);
  }, []);

  useEffect(() => {
    const isTrans = portfolioExperience?.isTransitioning ?? false;
    isTransitioningRef.current = isTrans;
    if (typeof window !== 'undefined') {
      (window as PortfolioWindow).__isTransitioning = isTrans;
    }

    if (portfolioExperience?.isTransitioning) {
      // Kill any active delayed theme resets and active GSAP tweens on html element
      contactThemeResetDelayRef.current?.kill();
      contactThemeResetDelayRef.current = null;
      gsap.killTweensOf('html');

      // Sync the About Environment lifecycle state instantly by killing active tweens
      const pending = portfolioExperience.pendingSection;
      aboutEnvironmentRef.current?.destroy();

      // Apply target theme variables directly to html to prevent flash/wrong colors during snapping
      const targetTheme = getSectionTheme(pending);
      if (targetTheme) {
        applyThemeVariables(document.documentElement, targetTheme);
      }

      // Reset contact scene if transitioning away from contact
      if (pending !== 'contact') {
        contactSceneRef.current?.setProgress(0);
      }
    } else {
      // Transition completed! Sync active section on window.
      const active = portfolioExperience?.activeSection;
      if (active && typeof window !== 'undefined') {
        const portfolioWindow = window as PortfolioWindow;
        portfolioWindow.__activeSection = active;
        window.dispatchEvent(
          new CustomEvent('activeSectionChange', {
            detail: { activeSection: active },
          })
        );
      }
    }
  }, [portfolioExperience?.isTransitioning, portfolioExperience?.pendingSection, portfolioExperience?.activeSection]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const portfolioWindow = window as PortfolioWindow;
    const aboutController = createAboutController({
      environment: aboutEnvironmentRef.current ?? undefined,
    });
    aboutControllerRef.current = aboutController;
    const contactScene = createContactScene();
    contactSceneRef.current = contactScene;
    let contactThemeResetDelay: gsap.core.Tween | null = null;
    const syncTween = (val: gsap.core.Tween | null) => {
      contactThemeResetDelay = val;
      contactThemeResetDelayRef.current = val;
    };
    contactScene.prepare();

    // Helper to dispatch active section ID to listeners (NavRail, MorphNav)
    const dispatchActiveSection = (sectionId: string) => {
      if (isTransitioningRef.current) return;
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
    const heroExitTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    heroExitTl
      .to('.hero-text-content', { opacity: 0, y: -80, ease: 'none' }, 0)
      .to('.hero-line-scroll-left', { xPercent: -12, ease: 'none' }, 0)
      .to('.hero-line-scroll-right', { xPercent: 12, ease: 'none' }, 0);

    gsap.to('#hero-section', {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom 20%',
        scrub: true,
      },
      opacity: 0,
      ease: 'none',
    });

    // 4. About Section Local Timelines & Pinning
    aboutController.prepare();

    const updateContactOverlayProgress = () => {
      const workSection = document.getElementById('work-section');
      if (!workSection) return;

      const workBounds = workSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const contactScrollDistance = contactScrollSpacerRef.current?.offsetHeight || viewportHeight;
      const progress = contactScrollDistance > 0
        ? gsap.utils.clamp(0, 1, (viewportHeight - workBounds.bottom) / contactScrollDistance)
        : 0;

      contactScene.setProgress(progress);
    };

    // 5. Contact Section Overlay Reveal
    ScrollTrigger.create({
      trigger: '#work-section',
      start: 'bottom bottom',
      end: () => `+=${contactScrollSpacerRef.current?.offsetHeight || window.innerHeight}`,
      scrub: true,
      onEnter: updateContactOverlayProgress,
      onEnterBack: updateContactOverlayProgress,
      onUpdate: updateContactOverlayProgress,
      onRefresh: updateContactOverlayProgress,
      onLeave: () => contactScene?.setProgress(1),
      onLeaveBack: () => contactScene?.setProgress(0),
    });
    window.addEventListener('resize', updateContactOverlayProgress);
    updateContactOverlayProgress();

    // Trigger theme variables to revert when exiting contact section upwards
    ScrollTrigger.create({
      trigger: '#contact-section',
      start: 'top bottom',
      onEnter: () => {
        if (isTransitioningRef.current) return;
        contactThemeResetDelay?.kill();
        syncTween(null);
      },
      onLeaveBack: () => {
        if (isTransitioningRef.current) return;
        contactThemeResetDelay?.kill();
        syncTween(gsap.delayedCall(0.4, () => {
          gsap.to('html', {
            ...getSectionTheme('work'),
            '--about-env-opacity': '1',
            duration: 0.3,
          });
          syncTween(null);
        }));
      }
    });

    const handleScrollUpdate = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      const decimalProgress = docHeight > 0 ? (scrollY / docHeight) : 0;
      
      const rulerIndicator = document.getElementById('debug-ruler-indicator');
      const rulerText = document.getElementById('debug-ruler-text');
      if (rulerIndicator) {
        rulerIndicator.style.top = `${progress}%`;
      }
      if (rulerText) {
        rulerText.innerHTML = `
          <div style="font-size: 11px; font-weight: bold; color: #00ff66;">${decimalProgress.toFixed(3)}</div>
          <div style="font-size: 8px; color: rgba(255,255,255,0.5); margin-top: 2px;">${Math.round(progress)}% | ${scrollY}px</div>
        `.trim();
      }
    };

    window.addEventListener('scroll', handleScrollUpdate, { passive: true });
    handleScrollUpdate();

    return () => {
      window.removeEventListener('scroll', handleScrollUpdate);
      window.removeEventListener('resize', updateContactOverlayProgress);
      contactThemeResetDelay?.kill();
      syncTween(null);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      contactScene.destroy();
      aboutController.destroy();
      if (typeof window !== 'undefined') {
        delete portfolioWindow.__activeSection;
        delete portfolioWindow.__scrollTriggerProgress;
        delete portfolioWindow.__isTransitioning;
      }
    };
  }, []);

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

      <div id="work-section" className="w-full min-h-screen relative overflow-hidden">
        <ProjectShowcase />
      </div>

      <div
        className="contact-transition-underlay"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: '-2px',
          backgroundColor: palette.nearBlack,
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: 840,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          contain: 'paint',
          willChange: 'opacity',
        }}
      />

      <div
        id="contact-section"
        ref={contactScrollSpacerRef}
        className="w-full relative overflow-visible"
        style={{
          height: '64vh',
          minHeight: '480px',
        }}
      >
        <Contact />
      </div>

      {/* Floating Debug Scroll Ruler */}
      <div
        id="debug-scroll-ruler"
        style={{
          position: 'fixed',
          right: '20px',
          top: '15vh',
          height: '70vh',
          width: '60px',
          backgroundColor: 'rgba(20, 20, 20, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 0',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#00ff66',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          userSelect: 'none',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '9px', color: '#fff' }}>SCROLL</div>
        <div id="debug-ruler-text" style={{ marginBottom: '10px', textAlign: 'center' }}>0% (0px)</div>
        
        {/* Ruler Track */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            width: '12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            margin: '10px 0',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Ruler Ticks */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
            <div
              key={tick}
              style={{
                position: 'absolute',
                top: `${tick}%`,
                left: '-15px',
                right: '-15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '0',
                pointerEvents: 'none',
              }}
            >
              {/* Left label (tick percentage) */}
              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', width: '12px', textAlign: 'right' }}>
                {tick % 20 === 0 ? `${tick}` : ''}
              </span>
              {/* Tick line */}
              <div
                style={{
                  width: tick % 50 === 0 ? '16px' : (tick % 10 === 0 ? '10px' : '6px'),
                  height: '1px',
                  backgroundColor: tick % 50 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                }}
              />
              {/* Right spacer */}
              <div style={{ width: '12px' }} />
            </div>
          ))}
          
          {/* Active Indicator Line */}
          <div
            id="debug-ruler-indicator"
            style={{
              position: 'absolute',
              top: '0%',
              left: '-8px',
              right: '-8px',
              height: '3px',
              backgroundColor: '#00ff66',
              borderRadius: '2px',
              boxShadow: '0 0 8px #00ff66',
              transform: 'translateY(-50%)',
              transition: 'top 0.05s linear',
              willChange: 'top',
            }}
          />
        </div>
      </div>
    </div>
  );
}
