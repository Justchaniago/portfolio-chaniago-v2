'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PortfolioTransitionPhase } from './PortfolioExperienceContext';

const curtainEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

type CurtainTransitionLayerProps = {
  phase: PortfolioTransitionPhase;
  onCovered(): void;
  onRevealed(): void;
};

export default function CurtainTransitionLayer({
  phase,
  onCovered,
  onRevealed,
}: CurtainTransitionLayerProps) {
  const prefersReducedMotion = useReducedMotion();
  const coveredNotifiedRef = useRef(false);
  const revealedNotifiedRef = useRef(false);

  useEffect(() => {
    if (phase === 'idle') {
      coveredNotifiedRef.current = false;
      revealedNotifiedRef.current = false;
    }
  }, [phase]);

  if (phase === 'idle') return null;

  const animate = phase === 'covering'
    ? { y: '0%', opacity: 1 }
    : { y: '-100%', opacity: prefersReducedMotion ? 0 : 1 };

  return (
    <motion.div
      aria-hidden="true"
      className="portfolio-curtain-transition"
      initial={{ y: '100%', opacity: 1 }}
      animate={animate}
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.64,
        ease: prefersReducedMotion ? 'linear' : curtainEase,
      }}
      onAnimationComplete={() => {
        if (phase === 'covering' && !coveredNotifiedRef.current) {
          coveredNotifiedRef.current = true;
          onCovered();
          return;
        }

        if (phase === 'revealing' && !revealedNotifiedRef.current) {
          revealedNotifiedRef.current = true;
          onRevealed();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1600,
        pointerEvents: 'none',
        background: '#c9f0a8',
        transform: 'translate3d(0, 100%, 0)',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        contain: 'paint',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 'auto 0 0',
          height: '20vh',
          background:
            'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.08) 100%)',
          opacity: 0.4,
        }}
      />
    </motion.div>
  );
}
