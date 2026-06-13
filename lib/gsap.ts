// lib/gsap.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

// Register ScrollTrigger and CustomEase.
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

// Create the premium cubic-bezier ease (Apple / Porsche / Linear style)
CustomEase.create('premiumBezier', '0.22, 1, 0.36, 1');

export function initLenis(): Lenis {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const updateScrollTrigger = () => {
    ScrollTrigger.update();
  };

  const tickLenis = (time: number) => {
    lenis.raf(time * 1000);
  };

  const destroyLenis = lenis.destroy.bind(lenis);

  // Sync Lenis RAF with GSAP ticker — MANDATORY
  gsap.ticker.add(tickLenis);
  gsap.ticker.lagSmoothing(0);

  // Sync Lenis scroll position with ScrollTrigger
  lenis.on('scroll', updateScrollTrigger);

  lenis.destroy = () => {
    gsap.ticker.remove(tickLenis);
    lenis.off('scroll', updateScrollTrigger);
    destroyLenis();
  };

  return lenis;
}

export { gsap, ScrollTrigger, ScrollToPlugin, CustomEase };
