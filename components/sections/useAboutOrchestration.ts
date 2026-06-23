'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { createAboutController } from '@/components/about/AboutController';
import { createAboutEnvironmentLifecycle } from '@/components/about/AboutEnvironmentLifecycle';
import type { PortfolioSectionId } from '@/components/experience/PortfolioExperienceContext';
import { applyThemeVariables, getSectionTheme } from '@/lib/theme/sectionThemes';

type UseAboutOrchestrationArgs = {
  activeSection: PortfolioSectionId | undefined;
  pendingSection: PortfolioSectionId | undefined;
  isTransitioning: boolean;
};

export function useAboutOrchestration({
  activeSection,
  pendingSection,
  isTransitioning,
}: UseAboutOrchestrationArgs) {
  const aboutEnvironmentRef = useRef<ReturnType<typeof createAboutEnvironmentLifecycle> | null>(null);
  const aboutControllerRef = useRef<ReturnType<typeof createAboutController> | null>(null);
  const aboutEnvironmentReadyRef = useRef(false);

  if (aboutEnvironmentRef.current === null) {
    aboutEnvironmentRef.current = createAboutEnvironmentLifecycle();
  }

  const handleEnvironmentHandoff = useCallback(() => {
    if (isTransitioning) return;
    aboutEnvironmentRef.current?.activate();
  }, [isTransitioning]);

  const handleEnvironmentReset = useCallback(() => {
    if (isTransitioning) return;
    aboutEnvironmentRef.current?.deactivate();
  }, [isTransitioning]);

  const handleTransitionComplete = useCallback((complete: boolean) => {
    aboutControllerRef.current?.setTransitionComplete(complete);
  }, []);

  const applySectionTheme = useCallback((sectionId: PortfolioSectionId) => {
    if (typeof document === 'undefined') return;

    applyThemeVariables(document.documentElement, getSectionTheme(sectionId));
  }, []);

  useEffect(() => {
    if (isTransitioning) {
      gsap.killTweensOf('html');
      aboutEnvironmentRef.current?.destroy();

      const targetSection = pendingSection === 'contact' ? 'work' : pendingSection ?? 'work';
      const targetTheme = getSectionTheme(targetSection);
      if (targetTheme) {
        applyThemeVariables(document.documentElement, targetTheme);
      }
      return;
    }

    if (activeSection === 'hero' || activeSection === 'about' || activeSection === 'work') {
      applySectionTheme(activeSection);
    }
  }, [activeSection, applySectionTheme, isTransitioning, pendingSection]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const aboutController = createAboutController({
      environment: aboutEnvironmentRef.current ?? undefined,
    });
    aboutControllerRef.current = aboutController;

    aboutController.prepare();
    aboutEnvironmentReadyRef.current = true;

    return () => {
      aboutController.destroy();
      aboutControllerRef.current = null;
      aboutEnvironmentReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!aboutEnvironmentReadyRef.current) return;
    aboutControllerRef.current?.setTransitionComplete(!isTransitioning);
  }, [isTransitioning]);

  useEffect(() => {
    return () => {
      aboutEnvironmentRef.current?.destroy();
    };
  }, []);

  return {
    handleEnvironmentHandoff,
    handleEnvironmentReset,
    handleTransitionComplete,
  };
}
