'use client';

import { useLayoutEffect } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import type { PortfolioSectionId } from '@/components/experience/PortfolioExperienceContext';

type UseActiveSectionObserverArgs = {
  isTransitioning: boolean;
  setActiveSection(sectionId: PortfolioSectionId): void;
};

export function useActiveSectionObserver({
  isTransitioning,
  setActiveSection,
}: UseActiveSectionObserverArgs) {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const triggers: ScrollTrigger[] = [];
    const dispatchActiveSection = (sectionId: PortfolioSectionId) => {
      if (isTransitioning) return;
      setActiveSection(sectionId);
    };

    const sectionIds: PortfolioSectionId[] = ['hero', 'about', 'work'];
    sectionIds.forEach((id) => {
      const trigger = ScrollTrigger.create({
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
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [isTransitioning, setActiveSection]);
}
