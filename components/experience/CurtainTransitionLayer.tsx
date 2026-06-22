'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SlotText } from 'slot-text/react';
import type { PortfolioTransitionPhase } from './PortfolioExperienceContext';

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
  const coverHoldTimerRef = useRef<number | null>(null);
  const isCovering = phase === 'covering';
  const isRevealing = phase === 'revealing';
  const [slotTextValue, setSlotTextValue] = useState('Loading');

  useEffect(() => {
    if (phase === 'idle') {
      coveredNotifiedRef.current = false;
      revealedNotifiedRef.current = false;
      setSlotTextValue('Loading');
      if (coverHoldTimerRef.current !== null) {
        window.clearTimeout(coverHoldTimerRef.current);
        coverHoldTimerRef.current = null;
      }
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'idle') {
      setSlotTextValue('Loading');
      const timer = window.setTimeout(() => {
        setSlotTextValue('Transit');
      }, prefersReducedMotion ? 180 : 720);

      return () => window.clearTimeout(timer);
    }
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    if (phase === 'idle') return;

    const fallbackDelay = prefersReducedMotion ? 260 : 1520;
    const timer = window.setTimeout(() => {
      if (phase === 'covering' && !coveredNotifiedRef.current) {
        coveredNotifiedRef.current = true;
        onCovered();
        return;
      }

      if (phase === 'revealing' && !revealedNotifiedRef.current) {
        revealedNotifiedRef.current = true;
        onRevealed();
      }
    }, fallbackDelay);

    return () => window.clearTimeout(timer);
  }, [onCovered, onRevealed, phase, prefersReducedMotion]);

  if (phase === 'idle') return null;

  return (
    <motion.div
      aria-hidden="true"
      className="portfolio-curtain-transition"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={
        isCovering
          ? { opacity: 1, backdropFilter: 'blur(0px)' }
          : { opacity: 0, backdropFilter: 'blur(0px)' }
      }
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.58,
        ease: prefersReducedMotion ? 'linear' : [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (isCovering && !coveredNotifiedRef.current) {
          if (coverHoldTimerRef.current !== null) {
            window.clearTimeout(coverHoldTimerRef.current);
          }

          coverHoldTimerRef.current = window.setTimeout(() => {
            if (coveredNotifiedRef.current) return;
            coveredNotifiedRef.current = true;
            onCovered();
            coverHoldTimerRef.current = null;
          }, prefersReducedMotion ? 220 : 1180);
          return;
        }

        if (isRevealing && !revealedNotifiedRef.current) {
          revealedNotifiedRef.current = true;
          onRevealed();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1600,
        pointerEvents: 'none',
        backgroundColor: '#5C141F',
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
        contain: 'paint',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          userSelect: 'none',
        }}
      >
        <SlotText
          text={slotTextValue}
          options={{
            direction: 'up',
            stagger: prefersReducedMotion ? 0 : 56,
            duration: prefersReducedMotion ? 0 : 420,
            exitOffset: 36,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            bounce: 0.45,
            skipUnchanged: true,
            interrupt: true,
          }}
          style={{
            color: 'rgba(255, 255, 255, 0.98)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 'clamp(42px, 8vw, 120px)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight: 1,
            transform: 'translateY(-1px)',
          }}
        />
      </div>
    </motion.div>
  );
}
