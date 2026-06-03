'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Text container refs
  const textContainerRef = useRef<HTMLDivElement>(null);
  const wordCraftRef = useRef<HTMLDivElement>(null);
  const wordSystemsRef = useRef<HTMLDivElement>(null);
  const wordChaniagoRef = useRef<HTMLDivElement>(null);
  
  // SVG Monogram refs
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | SVGLineElement | SVGRectElement | SVGCircleElement | null)[]>([]);

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    // Pre-load the critical portrait image to browser cache in a non-blocking way
    const img = new Image();
    img.src = '/images/portrait.png';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      // =========================================================================
      // --- INITIAL STATES ---
      // =========================================================================
      gsap.set(gridRef.current, { opacity: 0 });
      gsap.set(counterRef.current, { opacity: 0, y: 10 });
      gsap.set(textContainerRef.current, { opacity: 0 });
      gsap.set(wordCraftRef.current, { y: 40, opacity: 0 });
      gsap.set(wordSystemsRef.current, { y: 40, opacity: 0 });
      gsap.set(wordChaniagoRef.current, { y: 40, opacity: 0 });
      gsap.set(svgRef.current, { opacity: 0, scale: 0.8 });

      // Initialize SVG paths for drawing animation
      pathRefs.current.forEach((path) => {
        if (path) {
          const length = path instanceof SVGPathElement || path instanceof SVGLineElement || path instanceof SVGRectElement || path instanceof SVGCircleElement
            ? (path as any).getTotalLength?.() || 300
            : 300;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 0
          });
        }
      });

      // =========================================================================
      // --- SCENE 01: THE GRID & CALIBRATION (0.0s -> 1.5s) ---
      // =========================================================================
      // Subtle background grid fades in
      tl.to(gridRef.current, {
        opacity: 1,
        duration: 1.0,
        ease: 'power2.out'
      }, 0.2);

      // Monospace counter fades in
      tl.to(counterRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, 0.4);

      // Animate the percentage counter from 0 to 100 with tension-heavy easing
      const counterObj = { value: 0 };
      tl.to(counterObj, {
        value: 100,
        duration: 4.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          setCount(Math.floor(counterObj.value));
        }
      }, 0.4);

      // =========================================================================
      // --- SCENE 02: CRAFT (1.0s -> 2.2s) ---
      // =========================================================================
      tl.to(textContainerRef.current, {
        opacity: 1,
        duration: 0.5
      }, 1.0);

      tl.to(wordCraftRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power4.out'
      }, 1.0);

      // =========================================================================
      // --- SCENE 03: SYSTEMS (2.2s -> 3.4s) ---
      // =========================================================================
      tl.to(wordCraftRef.current, {
        y: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power4.in'
      }, 2.2);

      tl.to(wordSystemsRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power4.out'
      }, 2.4);

      // =========================================================================
      // --- SCENE 04: IDENTITY (3.4s -> 4.6s) ---
      // =========================================================================
      tl.to(wordSystemsRef.current, {
        y: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power4.in'
      }, 3.4);

      tl.to(wordChaniagoRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power4.out'
      }, 3.6);

      // =========================================================================
      // --- SCENE 05: THE MONOLITH / MONOGRAM ASSEMBLY (4.6s -> 6.0s) ---
      // =========================================================================
      // Fade out typography and counter to make room for the monogram
      tl.to([wordChaniagoRef.current, counterRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: 'power3.in'
      }, 4.6);

      // Fade in and scale the SVG container
      tl.to(svgRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out'
      }, 4.8);

      // Draw the SVG paths in a highly orchestrated, staggered sequence
      pathRefs.current.forEach((path, idx) => {
        if (path) {
          const length = path instanceof SVGPathElement || path instanceof SVGLineElement || path instanceof SVGRectElement || path instanceof SVGCircleElement
            ? (path as any).getTotalLength?.() || 300
            : 300;
          
          tl.to(path, {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut'
          }, 4.8 + idx * 0.1);
        }
      });

      // Subtle grid pulse at the moment of assembly completion
      tl.to(gridRef.current, {
        opacity: 0.4,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      }, 5.8);

      // =========================================================================
      // --- SCENE 06: PORTAL REVEAL (6.0s -> 7.2s) ---
      // =========================================================================
      // The monogram scales up massively, acting as a geometric portal
      tl.to(svgRef.current, {
        scale: 15,
        opacity: 0,
        duration: 1.0,
        ease: 'power4.in'
      }, 6.2);

      // Expand the circular clip-path on the overlay to reveal the homepage
      tl.to(overlayRef.current, {
        clipPath: 'circle(150% at 50% 50%)',
        duration: 1.2,
        ease: 'power4.inOut'
      }, 6.2);

      // Fade out the entire preloader overlay
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, 6.8);

    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      role="progressbar"
      aria-label="Loading creative portfolio"
      className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center select-none bg-void"
      style={{
        clipPath: 'circle(0% at 50% 50%)', // Starts fully masked, expands to reveal homepage
        willChange: 'clip-path, opacity'
      }}
    >
      {/* Subtle Background Grid (Systems) */}
      <div
        ref={gridRef}
        className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-0"
        style={{ willChange: 'opacity' }}
      >
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="border-[0.5px] border-white/[0.02] flex items-center justify-center"
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col items-center justify-center gap-8"
      >
        {/* Centered Typographic Container */}
        <div
          ref={textContainerRef}
          className="relative h-[80px] w-[320px] flex items-center justify-center overflow-hidden"
          style={{ willChange: 'opacity' }}
        >
          {/* Word 1: CRAFT */}
          <div
            ref={wordCraftRef}
            className="absolute font-display text-4xl md:text-5xl font-bold tracking-[0.2em] text-white uppercase text-center"
            style={{ willChange: 'transform, opacity' }}
          >
            CRAFT
          </div>

          {/* Word 2: SYSTEMS */}
          <div
            ref={wordSystemsRef}
            className="absolute font-display text-4xl md:text-5xl font-bold tracking-[0.2em] text-white uppercase text-center"
            style={{ willChange: 'transform, opacity' }}
          >
            SYSTEMS
          </div>

          {/* Word 3: CHANIAGO */}
          <div
            ref={wordChaniagoRef}
            className="absolute font-display text-4xl md:text-5xl font-bold tracking-[0.15em] text-white uppercase text-center"
            style={{ willChange: 'transform, opacity' }}
          >
            CHANIAGO
          </div>
        </div>

        {/* SVG Monogram (The Monolith) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            className="w-24 h-24 md:w-32 md:h-32 stroke-white fill-none stroke-[1.5] stroke-linecap-round stroke-linejoin-round"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* 1. Outer structural frame */}
            <rect
              ref={(el) => { pathRefs.current[0] = el; }}
              x="15"
              y="15"
              width="70"
              height="70"
              className="stroke-white/20"
            />
            {/* 2. Vertical stem */}
            <line
              ref={(el) => { pathRefs.current[1] = el; }}
              x1="50"
              y1="15"
              x2="50"
              y2="85"
            />
            {/* 3. Horizontal crossbar */}
            <line
              ref={(el) => { pathRefs.current[2] = el; }}
              x1="15"
              y1="50"
              x2="85"
              y2="50"
            />
            {/* 4. Diagonal tension line 1 */}
            <line
              ref={(el) => { pathRefs.current[3] = el; }}
              x1="15"
              y1="15"
              x2="85"
              y2="85"
            />
            {/* 5. Diagonal tension line 2 */}
            <line
              ref={(el) => { pathRefs.current[4] = el; }}
              x1="85"
              y1="15"
              x2="15"
              y2="85"
            />
            {/* 6. Inner structural circle */}
            <circle
              ref={(el) => { pathRefs.current[5] = el; }}
              cx="50"
              cy="50"
              r="25"
              className="stroke-white/40"
            />
          </svg>
        </div>

        {/* Monospace Percentage Counter */}
        <div
          ref={counterRef}
          className="absolute bottom-16 font-mono text-sm tracking-[0.3em] text-white/40"
          style={{ willChange: 'transform, opacity' }}
        >
          {count.toString().padStart(3, '0')}%
        </div>
      </div>
    </div>
  );
}
