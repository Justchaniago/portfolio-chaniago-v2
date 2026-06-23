'use client';

import { useCallback, useEffect } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

type PortfolioWindow = Window & {
  __scrollTriggerProgress?: number;
};

export function useScrollProgressPublisher() {
  const publishProgress = useCallback((progress: number) => {
    if (typeof window === 'undefined') return;

    (window as PortfolioWindow).__scrollTriggerProgress = progress;
    window.dispatchEvent(
      new CustomEvent('scrollTriggerProgress', {
        detail: { progress },
      })
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        publishProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
      delete (window as PortfolioWindow).__scrollTriggerProgress;
    };
  }, [publishProgress]);
}
