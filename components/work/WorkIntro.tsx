'use client';

export default function WorkIntro() {
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
        backgroundColor: '#FFFFFF', // Solid pristine white for seamless handoff
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0, // Controlled by master timeline in PinnedSections
        willChange: 'opacity, transform',
      }}
    >
      {/* Editorial grid background lines to make it feel sophisticated and structured */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(10, 10, 10, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 10, 10, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0px',
        }}
      >
        {/* Line 1 clipping container */}
        <div
          style={{
            overflow: 'hidden',
            display: 'block',
            paddingBottom: '0.05em', // Prevent character descenders clipping
          }}
        >
          <span
            className="work-intro-line-1"
            style={{
              display: 'block',
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(80px, 15vw, 220px)',
              fontWeight: 800,
              fontStyle: 'italic',
              color: '#000000',
              letterSpacing: '-0.05em',
              lineHeight: 0.8,
            }}
          >
            Our
          </span>
        </div>

        {/* Line 2 clipping container */}
        <div
          style={{
            overflow: 'hidden',
            display: 'block',
            paddingBottom: '0.05em',
          }}
        >
          <span
            className="work-intro-line-2"
            style={{
              display: 'block',
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(80px, 15vw, 220px)',
              fontWeight: 800,
              fontStyle: 'italic',
              color: '#000000',
              letterSpacing: '-0.05em',
              lineHeight: 0.8,
            }}
          >
            Work
          </span>
        </div>
      </div>
    </div>
  );
}
