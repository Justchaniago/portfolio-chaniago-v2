'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const laserLineRef = useRef<HTMLDivElement>(null);
  
  // Text container refs
  const textContainerRef = useRef<HTMLDivElement>(null);
  const wordCraftRef = useRef<HTMLDivElement>(null);
  const wordSystemsRef = useRef<HTMLDivElement>(null);
  const wordChaniagoRef = useRef<HTMLDivElement>(null);
  
  // Individual letter refs for CHANIAGO
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  
  // Monogram container and line refs
  const monogramContainerRef = useRef<HTMLDivElement>(null);
  const monogramLineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    // Pre-load the critical portrait image to browser cache
    let imageLoaded = false;
    const img = new Image();
    img.src = '/images/portrait.png';
    const checkImage = () => {
      if (img.complete) {
        imageLoaded = true;
      } else {
        img.onload = () => { imageLoaded = true; };
        img.onerror = () => { imageLoaded = true; }; // Fail-safe
      }
    };
    checkImage();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      // =========================================================================
      // --- INITIAL STATES ---
      // =========================================================================
      gsap.set(laserLineRef.current, { width: 0, height: '1px', opacity: 0 });
      gsap.set(textContainerRef.current, { opacity: 0, clipPath: 'inset(50% 0% 50% 0%)' });
      gsap.set(wordCraftRef.current, { y: 0, opacity: 0 });
      gsap.set(wordSystemsRef.current, { y: 60, opacity: 0 });
      gsap.set(wordChaniagoRef.current, { y: 60, opacity: 0 });
      gsap.set(monogramContainerRef.current, { opacity: 0 });
      
      // Hide monogram lines initially
      monogramLineRefs.current.forEach((line) => {
        if (line) gsap.set(line, { scaleX: 0, opacity: 0 });
      });

      // =========================================================================
      // --- SCENE 01: ABSOLUTE DARKNESS & LASER LINE (0.0s -> 1.2s) ---
      // =========================================================================
      // Laser line appears in the center
      tl.to(laserLineRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'none'
      }, 0.2);

      // Laser line expands horizontally with extreme precision
      tl.to(laserLineRef.current, {
        width: '280px',
        duration: 0.8,
        ease: 'power4.inOut'
      }, 0.4);

      // =========================================================================
      // --- SCENE 02: LIGHT-CARVED TYPOGRAPHY - CRAFT (1.2s -> 2.2s) ---
      // =========================================================================
      // The laser line expands vertically to "carve out" the text container mask
      tl.to(laserLineRef.current, {
        height: '50px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        duration: 0.6,
        ease: 'power3.inOut'
      }, 1.2);

      tl.to(textContainerRef.current, {
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.6,
        ease: 'power3.inOut'
      }, 1.2);

      // Reveal CRAFT inside the carved space
      tl.to(wordCraftRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 1.4);

      // =========================================================================
      // --- SCENE 03: TYPOGRAPHIC EVOLUTION - SYSTEMS (2.2s -> 3.4s) ---
      // =========================================================================
      // CRAFT exits upward, SYSTEMS immediately replaces it (tension-based, no bounce)
      tl.to(wordCraftRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.5,
        ease: 'power4.inOut'
      }, 2.2);

      tl.to(wordSystemsRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power4.inOut'
      }, 2.2);

      // =========================================================================
      // --- SCENE 04: IDENTITY EMERGENCE - CHANIAGO (3.4s -> 4.8s) ---
      // =========================================================================
      // SYSTEMS exits upward, CHANIAGO enters
      tl.to(wordSystemsRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.5,
        ease: 'power4.inOut'
      }, 3.4);

      tl.to(wordChaniagoRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power4.inOut'
      }, 3.4);

      // Pause on CHANIAGO to let identity sink in (emotional peak)
      tl.to({}, { duration: 1.0 });

      // =========================================================================
      // --- SCENE 05 & 06: DECONSTRUCTION & MONOGRAM FORMATION (4.8s -> 6.5s) ---
      // =========================================================================
      tl.add(() => {
        // 1. Fade out the laser line borders
        gsap.to(laserLineRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });

        // 2. Get positions of CHANIAGO letters relative to the global container
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // Show monogram container
        gsap.set(monogramContainerRef.current, { opacity: 1 });

        letterRefs.current.forEach((letter, idx) => {
          if (!letter) return;
          const letterRect = letter.getBoundingClientRect();
          
          // Calculate center coordinates of the letter relative to container
          const startX = letterRect.left - containerRect.left + letterRect.width / 2;
          const startY = letterRect.top - containerRect.top + letterRect.height / 2;

          // Fade out the letter text
          gsap.to(letter, {
            opacity: 0,
            scale: 0.5,
            filter: 'blur(4px)',
            duration: 0.4,
            ease: 'power2.in'
          });

          // Get the corresponding monogram line
          const monoLine = monogramLineRefs.current[idx];
          if (monoLine) {
            // Position the monogram line exactly at the letter's center initially
            gsap.set(monoLine, {
              position: 'absolute',
              left: `${startX}px`,
              top: `${startY}px`,
              width: '40px', // Initial length
              height: '1px',
              backgroundColor: '#FFFFFF',
              transformOrigin: 'center center',
              xPercent: -50,
              yPercent: -50,
              rotation: idx * 45, // Scattered initial rotations
              scaleX: 0,
              opacity: 0
            });

            // Animate the line appearing at the letter's position
            gsap.to(monoLine, {
              opacity: 1,
              scaleX: 1,
              duration: 0.3,
              ease: 'power2.out'
            });

            // Fly and morph the line to its final architectural monogram position
            // We clear the absolute pixel offsets and let the CSS grid/flex layout of the monogram take over,
            // or we animate them to their final relative positions inside the monogram container.
            // To make it perfectly responsive, we animate them to x: 0, y: 0 relative to their final grid slots!
            const finalLeft = monoLine.getAttribute('data-final-left') || '0%';
            const finalTop = monoLine.getAttribute('data-final-top') || '0%';
            const finalWidth = monoLine.getAttribute('data-final-width') || '100%';
            const finalHeight = monoLine.getAttribute('data-final-height') || '1px';
            const finalRotation = monoLine.getAttribute('data-final-rotation') || '0';

            gsap.to(monoLine, {
              left: finalLeft,
              top: finalTop,
              width: finalWidth,
              height: finalHeight,
              rotation: finalRotation,
              xPercent: 0,
              yPercent: 0,
              backgroundColor: '#FFFFFF',
              duration: 1.2,
              delay: 0.1 + idx * 0.04, // Staggered assembly
              ease: 'power4.inOut'
            });
          }
        });
      }, 4.8);

      // Wait for the monogram assembly to complete
      tl.to({}, { duration: 1.8 });

      // Pause to verify image is loaded before portal reveal
      tl.addPause(6.6, () => {
        const verifyAndTrigger = () => {
          if (imageLoaded) {
            tl.play();
          } else {
            requestAnimationFrame(verifyAndTrigger);
          }
        };
        verifyAndTrigger();
      });

      // =========================================================================
      // --- SCENE 07: PORTAL REVEAL (6.6s -> 7.8s) ---
      // =========================================================================
      // The monogram scales up rapidly from the center, acting as a geometric portal
      tl.to(monogramContainerRef.current, {
        scale: 25,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.in'
      }, 6.6);

      // Animate an expanding geometric clip-path on the overlay to reveal the homepage
      tl.to(overlayRef.current, {
        clipPath: 'circle(150% at 50% 50%)',
        duration: 1.0,
        ease: 'power4.inOut'
      }, 6.6);

      // Fade out overlay wrapper synchronously at the very end
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, 7.2);

    });

    return () => ctx.revert();
  }, [onComplete]);

  // Monogram lines configuration (8 strokes forming an architectural structural glyph)
  const monogramStrokes = [
    // 1. Left vertical stem of 'C'
    { left: '25%', top: '20%', width: '2px', height: '60%', rotation: 0 },
    // 2. Top horizontal bar of 'C'
    { left: '25%', top: '20%', width: '50%', height: '2px', rotation: 0 },
    // 3. Bottom horizontal bar of 'C'
    { left: '25%', top: '80%', width: '50%', height: '2px', rotation: 0 },
    // 4. Middle horizontal bar (structural brace)
    { left: '25%', top: '50%', width: '35%', height: '2px', rotation: 0 },
    // 5. Right vertical stem (forming 'H' / 'N' intersection)
    { left: '75%', top: '20%', width: '2px', height: '60%', rotation: 0 },
    // 6. Diagonal cross-brace (architectural tension line)
    { left: '25%', top: '50%', width: '56%', height: '2px', rotation: -31 },
    // 7. Inner vertical accent
    { left: '50%', top: '35%', width: '2px', height: '30%', rotation: 0 },
    // 8. Outer diagonal accent (geometric finish)
    { left: '60%', top: '80%', width: '21%', height: '2px', rotation: -45 }
  ];

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
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Scene 01 & 02: Laser Calibration Line */}
        <div
          ref={laserLineRef}
          className="absolute z-10 border-white/20"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.1)',
            willChange: 'width, height, opacity'
          }}
        />

        {/* Centered Typographic Container */}
        <div
          ref={textContainerRef}
          className="relative z-20 flex items-center justify-center h-[60px] w-[320px] overflow-hidden"
          style={{ willChange: 'clip-path, opacity' }}
        >
          {/* Word 1: CRAFT */}
          <div
            ref={wordCraftRef}
            className="absolute font-display text-4xl md:text-5xl font-bold tracking-[0.15em] text-white uppercase text-center"
            style={{ willChange: 'transform, opacity' }}
          >
            CRAFT
          </div>

          {/* Word 2: SYSTEMS */}
          <div
            ref={wordSystemsRef}
            className="absolute font-display text-4xl md:text-5xl font-bold tracking-[0.15em] text-white uppercase text-center"
            style={{ willChange: 'transform, opacity' }}
          >
            SYSTEMS
          </div>

          {/* Word 3: CHANIAGO (Individual letters for deconstruction) */}
          <div
            ref={wordChaniagoRef}
            className="absolute flex gap-2 md:gap-3 justify-center items-center"
            style={{ willChange: 'transform, opacity' }}
          >
            {['C', 'H', 'A', 'N', 'I', 'A', 'G', 'O'].map((char, idx) => (
              <span
                key={idx}
                ref={(el) => { letterRefs.current[idx] = el; }}
                className="font-display text-3xl md:text-4xl font-bold tracking-[0.05em] text-white uppercase inline-block"
                style={{ willChange: 'transform, opacity, filter' }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Scene 06: Architectural Monogram Container */}
        <div
          ref={monogramContainerRef}
          className="absolute w-[120px] h-[120px] z-30 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            willChange: 'transform, opacity'
          }}
        >
          {monogramStrokes.map((stroke, idx) => (
            <div
              key={idx}
              ref={(el) => { monogramLineRefs.current[idx] = el; }}
              data-final-left={stroke.left}
              data-final-top={stroke.top}
              data-final-width={stroke.width}
              data-final-height={stroke.height}
              data-final-rotation={stroke.rotation}
              className="absolute bg-white"
              style={{
                willChange: 'left, top, width, height, transform, opacity'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
