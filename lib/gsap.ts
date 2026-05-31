// lib/gsap.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

// Register ScrollTrigger and CustomEase.
gsap.registerPlugin(ScrollTrigger, CustomEase);

// Create the premium cubic-bezier ease (Apple / Porsche / Linear style)
CustomEase.create('premiumBezier', '0.22, 1, 0.36, 1');

export function initLenis(): Lenis {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Sync Lenis RAF with GSAP ticker — MANDATORY
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Sync Lenis scroll position with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  return lenis;
}

export { gsap, ScrollTrigger, CustomEase };
