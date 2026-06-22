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
import { applyThemeVariables, getSectionTheme } from '@/lib/theme/sectionThemes';

type PortfolioWindow = Window & {
  __activeSection?: string;
  __scrollTriggerProgress?: number;
  __isTransitioning?: boolean;
  lenis?: {
    scrollTo(
      target: HTMLElement | string | number,
      options?: { immediate?: boolean }
    ): void;
  };
};

const CONTACT_OVERSCROLL_DISTANCE = 1800;
const CONTACT_MAX_PROGRESS_STEP = 0.12;
const CONTACT_PROGRESS_LERP = 0.12;
const CONTACT_SETTLE_THRESHOLD = 0.62;
const CONTACT_SETTLE_DELAY = 320;
const CONTACT_PROGRESS_EPSILON = 0.0015;
const BOTTOM_LOCK_EPSILON = 4;

function getMainScrollBottom() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export default function PinnedSections() {
  const portfolioExperience = usePortfolioExperience();
  const isTransitioningRef = useRef(false);

  const aboutEnvironmentRef = useRef<ReturnType<typeof createAboutEnvironmentLifecycle> | null>(null);
  const aboutControllerRef = useRef<ReturnType<typeof createAboutController> | null>(null);
  const contactSceneRef = useRef<ReturnType<typeof createContactScene> | null>(null);
  const renderedContactProgressRef = useRef(0);
  const targetContactProgressRef = useRef(0);
  const contactAnimationFrameRef = useRef<number | null>(null);
  const contactSettleTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const contactActiveSectionRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);

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

  const lockMainScrollToWorkBottom = useCallback(() => {
    if (typeof window === 'undefined') return;

    const bottom = getMainScrollBottom();
    const portfolioWindow = window as unknown as PortfolioWindow;

    if (portfolioWindow.lenis) {
      portfolioWindow.lenis.scrollTo(bottom, { immediate: true });
      return;
    }

    window.scrollTo(0, bottom);
  }, []);

  const dispatchOverlaySection = useCallback((sectionId: 'work' | 'contact') => {
    if (typeof window === 'undefined' || isTransitioningRef.current) return;

    const portfolioWindow = window as unknown as PortfolioWindow;
    portfolioWindow.__activeSection = sectionId;
    window.dispatchEvent(
      new CustomEvent('activeSectionChange', {
        detail: { activeSection: sectionId },
      })
    );
  }, []);

  const syncContactActiveSection = useCallback((progress: number) => {
    const shouldMarkContactActive = progress > 0;
    if (shouldMarkContactActive !== contactActiveSectionRef.current) {
      contactActiveSectionRef.current = shouldMarkContactActive;
      dispatchOverlaySection(shouldMarkContactActive ? 'contact' : 'work');
    }
  }, [dispatchOverlaySection]);

  const renderContactProgress = useCallback((progress: number) => {
    const clampedProgress = gsap.utils.clamp(0, 1, progress);

    renderedContactProgressRef.current = clampedProgress;
    contactSceneRef.current?.setProgress(clampedProgress);

    if (clampedProgress > 0) {
      lockMainScrollToWorkBottom();
    }

    syncContactActiveSection(clampedProgress);
  }, [lockMainScrollToWorkBottom, syncContactActiveSection]);

  const clearContactSettleTimer = useCallback(() => {
    if (contactSettleTimerRef.current === null || typeof window === 'undefined') return;

    window.clearTimeout(contactSettleTimerRef.current);
    contactSettleTimerRef.current = null;
  }, []);

  const animateContactProgress = useCallback(() => {
    if (typeof window === 'undefined') return;

    const current = renderedContactProgressRef.current;
    const target = targetContactProgressRef.current;
    const next = current + (target - current) * CONTACT_PROGRESS_LERP;
    const settled = Math.abs(target - next) <= CONTACT_PROGRESS_EPSILON;
    const renderedProgress = settled ? target : next;

    renderContactProgress(renderedProgress);

    if (!settled) {
      contactAnimationFrameRef.current = window.requestAnimationFrame(animateContactProgress);
      return;
    }

    contactAnimationFrameRef.current = null;
  }, [renderContactProgress]);

  const setContactTargetProgress = useCallback((nextProgress: number, options: { immediate?: boolean } = {}) => {
    const progress = gsap.utils.clamp(0, 1, nextProgress);

    targetContactProgressRef.current = progress;

    if (options.immediate) {
      if (contactAnimationFrameRef.current !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(contactAnimationFrameRef.current);
        contactAnimationFrameRef.current = null;
      }
      renderContactProgress(progress);
      return;
    }

    if (contactAnimationFrameRef.current === null && typeof window !== 'undefined') {
      contactAnimationFrameRef.current = window.requestAnimationFrame(animateContactProgress);
    }
  }, [animateContactProgress, renderContactProgress]);

  const scheduleContactSettle = useCallback(() => {
    if (typeof window === 'undefined') return;

    clearContactSettleTimer();
    contactSettleTimerRef.current = window.setTimeout(() => {
      const target = targetContactProgressRef.current;
      setContactTargetProgress(
        target >= CONTACT_SETTLE_THRESHOLD ? 1 : 0
      );
      contactSettleTimerRef.current = null;
    }, CONTACT_SETTLE_DELAY);
  }, [clearContactSettleTimer, setContactTargetProgress]);

  useEffect(() => {
    const isTrans = portfolioExperience?.isTransitioning ?? false;
    isTransitioningRef.current = isTrans;
    if (typeof window !== 'undefined') {
      (window as unknown as PortfolioWindow).__isTransitioning = isTrans;
    }

    if (portfolioExperience?.isTransitioning) {
      gsap.killTweensOf('html');

      // Sync the About Environment lifecycle state instantly by killing active tweens
      const pending = portfolioExperience.pendingSection;
      aboutEnvironmentRef.current?.destroy();

      // Apply target theme variables directly to html to prevent flash/wrong colors during snapping
      const targetTheme = getSectionTheme(pending);
      if (targetTheme) {
        applyThemeVariables(document.documentElement, targetTheme);
      }

      if (pending === 'contact') {
        setContactTargetProgress(1, { immediate: true });
      } else {
        setContactTargetProgress(0, { immediate: true });
      }
    } else {
      // Transition completed! Sync active section on window.
      const active = portfolioExperience?.activeSection;
      if (active && typeof window !== 'undefined') {
        const portfolioWindow = window as unknown as PortfolioWindow;
        portfolioWindow.__activeSection = active;
        window.dispatchEvent(
          new CustomEvent('activeSectionChange', {
            detail: { activeSection: active },
          })
        );
      }

      if (active === 'hero' || active === 'about' || active === 'work') {
        setContactTargetProgress(0, { immediate: true });
      }
    }
  }, [
    portfolioExperience?.isTransitioning,
    portfolioExperience?.pendingSection,
    portfolioExperience?.activeSection,
    setContactTargetProgress,
  ]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const portfolioWindow = window as unknown as PortfolioWindow;
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const aboutController = createAboutController({
      environment: aboutEnvironmentRef.current ?? undefined,
    });
    aboutControllerRef.current = aboutController;
    const contactScene = createContactScene();
    contactSceneRef.current = contactScene;
    contactScene.prepare();
    contactScene.setProgress(renderedContactProgressRef.current);

    // Helper to dispatch active section ID to listeners (NavRail, MorphNav)
    const dispatchActiveSection = (sectionId: string) => {
      if (isTransitioningRef.current) return;
      if (renderedContactProgressRef.current > 0 && sectionId !== 'contact') return;
      portfolioWindow.__activeSection = sectionId;
      window.dispatchEvent(
        new CustomEvent('activeSectionChange', {
          detail: { activeSection: sectionId },
        })
      );
    };

    // 1. Setup Section Observer (determines active section when visible area >= 40%)
    const sectionIds = ['hero', 'about', 'work'];
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

    const isAtMainBottom = () => (
      window.scrollY >= getMainScrollBottom() - BOTTOM_LOCK_EPSILON
    );

    const updateContactByDelta = (deltaY: number) => {
      const progress = targetContactProgressRef.current;
      const shouldOpenFromBottom = deltaY > 0 && isAtMainBottom();
      const shouldControlContact = progress > 0 || shouldOpenFromBottom;

      if (!shouldControlContact) return false;

      clearContactSettleTimer();
      const progressDelta = gsap.utils.clamp(
        -CONTACT_MAX_PROGRESS_STEP,
        CONTACT_MAX_PROGRESS_STEP,
        deltaY / CONTACT_OVERSCROLL_DISTANCE
      );
      const nextProgress = progress + progressDelta;

      if (prefersReducedMotionRef.current) {
        setContactTargetProgress(nextProgress >= CONTACT_SETTLE_THRESHOLD ? 1 : 0, {
          immediate: true,
        });
      } else {
        setContactTargetProgress(nextProgress);
        scheduleContactSettle();
      }
      return true;
    };

    const handleWheel = (event: WheelEvent) => {
      if (updateContactByDelta(event.deltaY)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      const previousY = touchStartYRef.current;

      if (currentY === undefined || previousY === null) return;

      const deltaY = previousY - currentY;
      touchStartYRef.current = currentY;

      if (updateContactByDelta(deltaY)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

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
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      clearContactSettleTimer();
      if (contactAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(contactAnimationFrameRef.current);
        contactAnimationFrameRef.current = null;
      }
      ScrollTrigger.getAll().forEach((st) => st.kill());
      contactScene.destroy();
      aboutController.destroy();
      if (typeof window !== 'undefined') {
        delete portfolioWindow.__activeSection;
        delete portfolioWindow.__scrollTriggerProgress;
        delete portfolioWindow.__isTransitioning;
      }
    };
  }, [
    clearContactSettleTimer,
    scheduleContactSettle,
    setContactTargetProgress,
  ]);

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
