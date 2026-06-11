'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import CurtainTransitionLayer from './CurtainTransitionLayer';

type WindowWithLenis = Window & {
  lenis?: {
    scrollTo(
      target: HTMLElement | string | number,
      options?: { immediate?: boolean }
    ): void;
  };
};

export type PortfolioSectionId = 'hero' | 'about' | 'work' | 'contact';

export type PortfolioTransitionPhase =
  | 'idle'
  | 'covering'
  | 'covered'
  | 'revealing';

type PortfolioExperienceContextValue = {
  activeSection: PortfolioSectionId;
  pendingSection: PortfolioSectionId;
  transitionPhase: PortfolioTransitionPhase;
  isTransitioning: boolean;
  navigateTo(sectionId: PortfolioSectionId): void;
  markCovered(): void;
  markRevealed(): void;
};

const PortfolioExperienceContext =
  createContext<PortfolioExperienceContextValue | null>(null);

export function PortfolioExperienceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeSection, setActiveSection] =
    useState<PortfolioSectionId>('hero');
  const [pendingSection, setPendingSection] =
    useState<PortfolioSectionId>('hero');
  const [transitionPhase, setTransitionPhase] =
    useState<PortfolioTransitionPhase>('idle');

  const isTransitioning = transitionPhase !== 'idle';

  // Synchronize active section with the scroll-based activeSectionChange events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleActiveSectionChange = (event: Event) => {
      const sectionId = (event as CustomEvent).detail.activeSection as PortfolioSectionId;
      setActiveSection(sectionId);
    };

    window.addEventListener('activeSectionChange', handleActiveSectionChange);

    return () => {
      window.removeEventListener('activeSectionChange', handleActiveSectionChange);
    };
  }, []);

  const navigateTo = useCallback(
    (sectionId: PortfolioSectionId) => {
      if (sectionId === activeSection || transitionPhase !== 'idle') return;

      setPendingSection(sectionId);
      setTransitionPhase('covering');
    },
    [activeSection, transitionPhase]
  );

  const markCovered = useCallback(() => {
    setTransitionPhase((phase) => {
      if (phase !== 'covering') return phase;

      // Snaps the scroll position to target section instantly under the curtain
      const targetEl = document.getElementById(`${pendingSection}-section`);
      if (targetEl) {
        const lenis = (window as unknown as WindowWithLenis).lenis;
        if (lenis) {
          lenis.scrollTo(targetEl, { immediate: true });
        } else {
          targetEl.scrollIntoView({ behavior: 'auto' });
        }
      }

      setActiveSection(pendingSection);
      return 'revealing';
    });
  }, [pendingSection]);

  const markRevealed = useCallback(() => {
    setTransitionPhase('idle');
  }, []);

  const value = useMemo(
    () => ({
      activeSection,
      pendingSection,
      transitionPhase,
      isTransitioning,
      navigateTo,
      markCovered,
      markRevealed,
    }),
    [
      activeSection,
      pendingSection,
      transitionPhase,
      isTransitioning,
      navigateTo,
      markCovered,
      markRevealed,
    ]
  );

  return (
    <PortfolioExperienceContext.Provider value={value}>
      {children}
      <CurtainTransitionLayer
        phase={transitionPhase}
        onCovered={markCovered}
        onRevealed={markRevealed}
      />
    </PortfolioExperienceContext.Provider>
  );
}

export function usePortfolioExperience() {
  return useContext(PortfolioExperienceContext);
}

export function useRequiredPortfolioExperience() {
  const context = usePortfolioExperience();

  if (!context) {
    throw new Error(
      'useRequiredPortfolioExperience must be used inside PortfolioExperienceProvider'
    );
  }

  return context;
}
