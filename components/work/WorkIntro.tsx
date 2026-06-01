'use client';

export default function WorkIntro() {
  const text = "MY WORK";
  
  return (
    <div
      className="work-intro-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg, #FFFFFF)',
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0, // Controlled by master timeline
        willChange: 'opacity',
      }}
    >
      {/* Editorial grid background lines to make it feel sophisticated and structured */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(10, 10, 10, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 10, 10, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
          pointerEvents: 'none',
        }}
      />

      <h1
        style={{
          fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
          fontSize: 'clamp(80px, 12vw, 180px)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          lineHeight: 1.0,
          margin: 0,
          overflow: 'hidden',
          display: 'flex',
          gap: '0.05em',
        }}
      >
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="work-intro-char"
            style={{
              display: 'inline-block',
              willChange: 'transform, filter, opacity',
              transform: 'translateY(100%)',
              opacity: 0,
              filter: 'blur(12px)',
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
}
