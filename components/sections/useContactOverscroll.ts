'use client';

import { useCallback, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import type { PortfolioSectionId } from '@/components/experience/PortfolioExperienceContext';

type PortfolioWindow = Window & {
  lenis?: {
    scrollTo(
      target: HTMLElement | string | number,
      options?: { immediate?: boolean }
    ): void;
  };
};

type UseContactOverscrollArgs = {
  isTransitioning: boolean;
  activeSection: PortfolioSectionId | undefined;
  pendingSection: PortfolioSectionId | undefined;
  contactScene: { setProgress(progress: number): void; destroy(): void } | null;
  setActiveSection(sectionId: PortfolioSectionId): void;
  onThemeSection(sectionId: Exclude<PortfolioSectionId, 'contact'>): void;
};

const CONTACT_OVERSCROLL_DISTANCE = 1100;
const CONTACT_MAX_PROGRESS_STEP = 0.12;
const CONTACT_PROGRESS_LERP = 0.12;
const CONTACT_PROGRESS_EPSILON = 0.0015;
const CONTACT_UNLOCK_PROGRESS = 0;
const BOTTOM_LOCK_EPSILON = 4;

function getMainScrollBottom() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export function useContactOverscroll({
  isTransitioning,
  activeSection,
  pendingSection,
  contactScene,
  setActiveSection,
  onThemeSection,
}: UseContactOverscrollArgs) {
  const renderedContactProgressRef = useRef(0);
  const targetContactProgressRef = useRef(0);
  const contactAnimationFrameRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const contactActiveSectionRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const contactClosedThemeRef = useRef<Exclude<PortfolioSectionId, 'contact'>>('work');
  const mainScrollBottomRef = useRef(0);
  const resizeFrameRef = useRef<number | null>(null);

  const updateMainScrollBottom = useCallback(() => {
    if (typeof window === 'undefined') return;
    mainScrollBottomRef.current = getMainScrollBottom();
  }, []);

  const lockMainScrollToWorkBottom = useCallback(() => {
    if (typeof window === 'undefined') return;

    const bottom = mainScrollBottomRef.current;
    const portfolioWindow = window as unknown as PortfolioWindow;

    if (portfolioWindow.lenis) {
      portfolioWindow.lenis.scrollTo(bottom, { immediate: true });
      return;
    }

    window.scrollTo(0, bottom);
  }, []);

  const syncContactActiveSection = useCallback((progress: number) => {
    const shouldMarkContactActive = progress > CONTACT_UNLOCK_PROGRESS;
    if (shouldMarkContactActive !== contactActiveSectionRef.current) {
      contactActiveSectionRef.current = shouldMarkContactActive;
      setActiveSection(shouldMarkContactActive ? 'contact' : 'work');
    }
  }, [setActiveSection]);

  const renderContactProgress = useCallback((progress: number) => {
    const clampedProgress = gsap.utils.clamp(0, 1, progress);

    onThemeSection(contactClosedThemeRef.current);

    if (clampedProgress <= CONTACT_UNLOCK_PROGRESS) {
      syncContactActiveSection(0);
    }

    renderedContactProgressRef.current = clampedProgress;
    contactScene?.setProgress(clampedProgress);

    if (clampedProgress > CONTACT_UNLOCK_PROGRESS) {
      lockMainScrollToWorkBottom();
      syncContactActiveSection(clampedProgress);
    }
  }, [contactScene, lockMainScrollToWorkBottom, onThemeSection, syncContactActiveSection]);

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

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updateMainScrollBottom();

    if (isTransitioning) {
      const pending = pendingSection;

      if (pending === 'contact') {
        contactClosedThemeRef.current = 'work';
        lockMainScrollToWorkBottom();
        setContactTargetProgress(1, { immediate: true });
      } else if (pending) {
        contactClosedThemeRef.current = pending;
        setContactTargetProgress(0, { immediate: true });
      }
    } else if (activeSection === 'hero' || activeSection === 'about' || activeSection === 'work') {
      contactClosedThemeRef.current = activeSection;
      onThemeSection(activeSection);
      setContactTargetProgress(0, { immediate: true });
    }
  }, [activeSection, isTransitioning, lockMainScrollToWorkBottom, onThemeSection, pendingSection, setContactTargetProgress, updateMainScrollBottom]);

  useEffect(() => {
    if (typeof window === 'undefined' || !contactScene) return;

    const isAtMainBottom = () => (
      window.scrollY >= mainScrollBottomRef.current - BOTTOM_LOCK_EPSILON
    );

    const updateContactByDelta = (deltaY: number) => {
      const progress = targetContactProgressRef.current;
      const shouldOpenFromBottom = deltaY > 0 && isAtMainBottom();
      const shouldControlContact = progress > 0 || shouldOpenFromBottom;

      if (!shouldControlContact) return false;

      const progressDelta = gsap.utils.clamp(
        -CONTACT_MAX_PROGRESS_STEP,
        CONTACT_MAX_PROGRESS_STEP,
        deltaY / CONTACT_OVERSCROLL_DISTANCE
      );
      const nextProgress = progress + progressDelta;

      if (prefersReducedMotionRef.current) {
        setContactTargetProgress(nextProgress, { immediate: true });
      } else {
        setContactTargetProgress(nextProgress);
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

    const handleResize = () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        updateMainScrollBottom();
        resizeFrameRef.current = null;
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('resize', handleResize, { passive: true });

    const documentResizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    documentResizeObserver.observe(document.documentElement);

    return () => {
      documentResizeObserver.disconnect();
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (contactAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(contactAnimationFrameRef.current);
        contactAnimationFrameRef.current = null;
      }
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [contactScene, setContactTargetProgress, updateMainScrollBottom]);
}
