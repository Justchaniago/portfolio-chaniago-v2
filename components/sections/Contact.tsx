'use client';

import { useRef } from 'react';

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);

  const socials = [
    { name: 'GitHub', href: 'https://github.com/Justchaniago' },
    { name: 'LinkedIn', href: 'https://linkedin.com' },
    { name: 'Email', href: 'mailto:ferryruslyc@gmail.com' },
    { name: 'Twitter / X', href: 'https://twitter.com' },
  ];

  return (
    <section
      ref={containerRef}
      className="contact-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-bg, #FFFFFF)',
        transition: 'background-color 0.4s ease, color 0.4s ease',
        zIndex: 1,
        pointerEvents: 'none', // Toggle managed by PinnedSections
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '0 8vw',
        opacity: 0, // Animated via PinnedSections timeline
      }}
    >
      <div
        className="contact-content-wrapper"
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '8vw',
          alignItems: 'start',
          opacity: 0, // Set/Tweened by GSAP in PinnedSections
          willChange: 'opacity, transform',
        }}
      >
        {/* Left Column: Big Editorial Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3vh' }}>
          <span
            className="contact-eyebrow"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-text-1, #0A0A0A)',
              opacity: 0.85,
            }}
          >
            04 — Contact
          </span>
          <h2
            className="contact-heading"
            style={{
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(48px, 4.2vw, 82px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: 'var(--color-text-1, #0A0A0A)',
              margin: 0,
            }}
          >
            Let's build<br />something bold<br />together.
          </h2>
        </div>

        {/* Right Column: Links and Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6vh',
            marginTop: '3vh',
          }}
        >
          {/* Main Direct Email Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '8px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-1, #0A0A0A)',
                opacity: 0.55,
              }}
            >
              Direct Channel
            </span>
            <a
              href="mailto:ferryruslyc@gmail.com"
              data-cursor="button"
              className="contact-email-link"
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                fontSize: 'clamp(24px, 2.2vw, 36px)',
                color: 'var(--color-text-1, #0A0A0A)',
                textDecoration: 'none',
                letterSpacing: '-0.02em',
                display: 'inline-block',
                borderBottom: '1px solid var(--color-border, rgba(10, 10, 10, 0.15))',
                paddingBottom: '8px',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease',
              }}
            >
              ferryruslyc@gmail.com
            </a>
          </div>

          {/* Social Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '8px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-1, #0A0A0A)',
                opacity: 0.55,
              }}
            >
              Digital Presence
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="button"
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, rgba(10, 10, 10, 0.15))',
                    background: 'var(--color-card-bg, rgba(255, 255, 255, 0.05))',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-text-1, #0A0A0A)',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
