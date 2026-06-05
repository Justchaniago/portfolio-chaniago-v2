'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';

const emailTarget = 'chaniagoatwork@gmail.com';

interface FieldNode {
  id: number;
  x: number;
  y: number;
  size: number; // dot radius in px
  baseOpacity: number;
}

// Generate scattered dot-field forming an abstract organic cloud mass
// concentrated in the center-horizontal band of the viewport
function generateDotField(): FieldNode[] {
  const nodes: FieldNode[] = [];
  const totalDots = 280;

  for (let i = 0; i < totalDots; i++) {
    // Distribute across full width but concentrated vertically in the 25%–65% band
    const x = 3 + Math.random() * 94;
    // Use gaussian-ish distribution centered around 45vh
    const rawY = (Math.random() + Math.random() + Math.random()) / 3; // bell curve 0–1
    const y = 20 + rawY * 50; // map to 20vh–70vh

    // Vary dot sizes for depth (most are tiny, a few are slightly larger)
    const size = 1.5 + Math.random() * 2.5;

    // Vary base opacity to create depth layers
    const baseOpacity = 0.03 + Math.random() * 0.06;

    nodes.push({ id: i, x, y, size, baseOpacity });
  }

  return nodes;
}

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerWrapperRef = useRef<HTMLDivElement>(null);
  const nameLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const copyrightRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(false);
  const [displayEmail, setDisplayEmail] = useState('');
  const [fieldNodes, setFieldNodes] = useState<FieldNode[]>([]);

  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const fieldWakeRef = useRef(0);
  const revealedRef = useRef(false);

  // 1. Client-side only generation
  useEffect(() => {
    setFieldNodes(generateDotField());
    setDisplayEmail('□'.repeat(emailTarget.length));
  }, []);

  // 2. Section activation + reveal choreography
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let revealTl: gsap.core.Timeline | null = null;

    const handleProgress = (e: Event) => {
      const progress = (e as CustomEvent).detail?.progress ?? 0;
      const isActive = progress >= 0.971;
      const val = isActive ? 'auto' : 'none';

      if (innerWrapperRef.current) {
        innerWrapperRef.current.style.pointerEvents = val;
      }

      setActive(isActive);

      if (isActive) {
        if (!revealedRef.current) {
          revealedRef.current = true;
          if (revealTl) revealTl.kill();
          revealTl = gsap.timeline();

          // A. Name lines: masked translateY(120%) → 0%
          const lines = nameLineRefs.current.filter(Boolean);
          revealTl.fromTo(lines,
            { yPercent: 120 },
            { yPercent: 0, duration: 1.0, ease: 'power4.out', stagger: 0.12 },
            0.0
          );

          // B. Email resolve: blocks → characters
          const emailObj = { progress: 0 };
          const emailLength = emailTarget.length;
          revealTl.to(emailObj, {
            progress: emailLength,
            duration: 1.4,
            ease: 'power1.inOut',
            onUpdate: () => {
              const cur = emailObj.progress;
              const resolved = Math.floor(cur);
              let result = '';
              for (let i = 0; i < emailLength; i++) {
                if (i < resolved) {
                  result += emailTarget[i];
                } else if (i === resolved) {
                  const chars = '01#@+$%*□';
                  result += chars[Math.floor(Math.random() * chars.length)];
                } else {
                  result += '□';
                }
              }
              setDisplayEmail(result);
            },
            onComplete: () => setDisplayEmail(emailTarget),
          }, 0.6);

          // C. Copyright
          revealTl.fromTo(copyrightRef.current,
            { opacity: 0, y: 12 },
            { opacity: 0.4, y: 0, duration: 0.5, ease: 'power2.out' },
            0.9
          );

          // D. Social links
          revealTl.fromTo(socialsRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            1.0
          );

          // E. Nav links
          revealTl.fromTo(navLinksRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            1.1
          );

          // F. Dot field wake
          revealTl.to(fieldWakeRef, {
            current: 1,
            duration: 2.0,
            ease: 'power2.out',
          }, 0.8);
        }
      } else {
        if (revealedRef.current) {
          revealedRef.current = false;
          if (revealTl) revealTl.kill();
          const lines = nameLineRefs.current.filter(Boolean);
          gsap.killTweensOf([lines, copyrightRef.current, socialsRef.current, navLinksRef.current, fieldWakeRef]);

          setDisplayEmail('□'.repeat(emailTarget.length));
          gsap.set(lines, { yPercent: 120 });
          gsap.set(copyrightRef.current, { opacity: 0, y: 12 });
          gsap.set(socialsRef.current, { opacity: 0, y: 12 });
          gsap.set(navLinksRef.current, { opacity: 0, y: 12 });
          fieldWakeRef.current = 0;
        }
      }
    };

    window.addEventListener('scrollTriggerProgress', handleProgress);
    const initialProgress = (window as any).__scrollTriggerProgress ?? 0;
    handleProgress(new CustomEvent('scrollTriggerProgress', { detail: { progress: initialProgress } }));

    return () => {
      window.removeEventListener('scrollTriggerProgress', handleProgress);
      if (revealTl) revealTl.kill();
    };
  }, [fieldNodes.length]);

  // 3. Mouse tracking
  useEffect(() => {
    if (!active) return;
    const onMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mousePos.current = { x: -1000, y: -1000 }; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [active]);

  // 4. 60fps dot-field proximity loop (direct DOM writes)
  useEffect(() => {
    if (!active || fieldNodes.length === 0) return;

    let raf: number;
    const count = fieldNodes.length;
    const intensities = new Array(count).fill(0);

    const tick = () => {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const radius = 160;
      const wake = fieldWakeRef.current;

      for (let i = 0; i < count; i++) {
        const node = fieldNodes[i];
        const el = dotRefs.current[i];
        if (!el) continue;

        const nx = w * (node.x / 100);
        const ny = h * (node.y / 100);
        const dx = mx - nx;
        const dy = my - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let target = 0;
        if (mx > -500 && dist < radius) {
          target = 1 - dist / radius;
        }

        let intensity = intensities[i];
        intensity = target > intensity ? target : Math.max(0, intensity - 0.04);
        intensities[i] = intensity;

        const baseOp = wake * node.baseOpacity;
        const op = baseOp + intensity * (0.85 - baseOp);
        const scale = 1 + intensity * 0.6;

        el.style.opacity = String(op);
        el.style.transform = `scale(${scale})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, fieldNodes]);

  const handleNav = (targetProgress: number) => {
    if (typeof window !== 'undefined' && (window as any).__cinematicNavigate) {
      (window as any).__cinematicNavigate(targetProgress);
    }
  };

  return (
    <section
      ref={containerRef}
      className="contact-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#050505',
        zIndex: 3,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0,
      }}
    >
      <div
        ref={innerWrapperRef}
        className="contact-content-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        {/* ═══════════ TOP ROW: 3-column grid ═══════════ */}
        <div
          style={{
            position: 'absolute',
            top: '5vh',
            left: '4.5vw',
            right: '4.5vw',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 3,
            pointerEvents: 'auto',
          }}
        >
          {/* Col 1: Email + Copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a
              ref={emailRef}
              href={`mailto:${emailTarget}`}
              className="contact-top-link"
              style={{ textDecoration: 'none' }}
            >
              {displayEmail}
            </a>
            <div
              ref={copyrightRef}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                opacity: 0,
              }}
            >
              © 2026
            </div>
          </div>

          {/* Col 2: Social links (center) */}
          <div
            ref={socialsRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              opacity: 0,
            }}
          >
            <a href="https://github.com/Justchaniago" target="_blank" rel="noopener noreferrer" className="contact-top-link">GITHUB</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-top-link">LINKEDIN</a>
            <a href="https://behance.net" target="_blank" rel="noopener noreferrer" className="contact-top-link">BEHANCE</a>
          </div>

          {/* Col 3: Nav links (right-aligned) */}
          <div
            ref={navLinksRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '6px',
              opacity: 0,
            }}
          >
            <button onClick={() => handleNav(0.129)} className="contact-top-link contact-nav-btn">WORK</button>
            <button onClick={() => handleNav(0.05)} className="contact-top-link contact-nav-btn">INFO</button>
            <button onClick={() => handleNav(0.971)} className="contact-top-link contact-nav-btn">CONTACT</button>
          </div>
        </div>

        {/* ═══════════ DOT FIELD (organic scatter) ═══════════ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {fieldNodes.map((node) => (
            <div
              key={node.id}
              ref={(el) => { dotRefs.current[node.id] = el; }}
              style={{
                position: 'absolute',
                left: `${node.x}vw`,
                top: `${node.y}vh`,
                width: `${node.size}px`,
                height: `${node.size}px`,
                borderRadius: '50%',
                backgroundColor: '#ff784f',
                opacity: 0,
                transformOrigin: 'center',
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* ═══════════ BOTTOM: Massive Name ═══════════ */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 4.5vw',
            zIndex: 2,
            lineHeight: 0.82,
            /* Push the text below the fold so baseline crops against the bottom edge */
            transform: 'translateY(12%)',
          }}
        >
          {/* "Ferry" — bold sans-serif, like "Luke" in the reference */}
          <div style={{ overflow: 'hidden' }}>
            <span
              ref={(el) => { nameLineRefs.current[0] = el; }}
              style={{
                display: 'block',
                transform: 'translateY(120%)',
                willChange: 'transform',
                fontFamily: 'var(--font-body, "DM Sans", system-ui, sans-serif)',
                fontSize: 'clamp(100px, 18vw, 340px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#FFFFFF',
              }}
            >
              Ferry
            </span>
          </div>

          {/* "Chaniago." — italic serif + orange dot, like "Baffait." in the reference */}
          <div style={{ overflow: 'hidden' }}>
            <span
              ref={(el) => { nameLineRefs.current[1] = el; }}
              style={{
                display: 'block',
                transform: 'translateY(120%)',
                willChange: 'transform',
                fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(100px, 18vw, 340px)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              Chaniago<span style={{ color: '#ff784f' }}>.</span>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        /* Shared top-row link style */
        .contact-top-link {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #FFFFFF;
          text-decoration: none;
          opacity: 0.7;
          transition: opacity 0.25s ease;
          display: block;
          line-height: 1.6;
        }
        .contact-top-link:hover {
          opacity: 1;
        }

        /* Nav button reset */
        .contact-nav-btn {
          background: none;
          border: none;
          cursor: none;
          padding: 0;
          text-align: right;
        }
      `}</style>
    </section>
  );
}
