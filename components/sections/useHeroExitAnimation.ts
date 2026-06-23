'use client';

import { useLayoutEffect } from 'react';
import { gsap } from '@/lib/gsap';

export function useHeroExitAnimation() {
  useLayoutEffect(() => {
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

    return () => {
      heroExitTl.kill();
    };
  }, []);
}
