export default function AboutChapterA() {
  return (
    /* 4. Editorial Neue Montreal Text Block (Shifted left to increase gap → photo by >60px) */
    <div
      className="about-editorial-text"
      style={{
        position: 'absolute',
        left: '6vw', // Shifted left (from 8vw to 6vw) to add spacious breathing room and gap
        bottom: '12vh', // Placed intentionally in the lower-left quadrant
        width: 'clamp(460px, 42vw, 680px)', // Increased width to ensure plenty of breathing room for long lines
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      {/* Eyebrow */}
      <span
        className="about-eyebrow"
        style={{
          fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-2)',
          marginBottom: '16px',
          opacity: 0,
          transform: 'translateY(15px)',
          willChange: 'opacity, transform',
          display: 'block',
        }}
      >
        Fullstack Developer
      </span>

      {/* Headline (Hi, I'm Chaniago.) with Character Split */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
        {/* Line 1: Hi, */}
        <h2
          className="about-text-line"
          style={{
            fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
            fontSize: 'clamp(56px, 5.5vw, 96px)', // Reduced min-size for mobile
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.045em',
            lineHeight: 0.9,
            margin: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap', // Force line to stay strictly on one line (no wrapping)
          }}
        >
          {"Hi,".split("").map((char, index) => (
            <span
              key={index}
              className="about-char"
              style={{
                display: 'inline-block',
                willChange: 'transform',
              }}
            >
              {char}
            </span>
          ))}
        </h2>

        {/* Line 2: I'm Chaniago. */}
        <h2
          className="about-text-line about-text-line-2"
          style={{
            fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
            fontSize: 'clamp(56px, 5.5vw, 96px)', // Reduced min-size for mobile
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.045em',
            lineHeight: 0.9,
            margin: 0,
            overflow: 'hidden',
            whiteSpace: 'normal', // Allow wrapping on mobile if needed
            wordBreak: 'break-word', // Ensure long names don't overflow
          }}
        >
          {"I'm Chaniago.".split(" ").map((word, wordIndex, array) => (
            <span
              key={wordIndex}
              style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                marginRight: wordIndex < array.length - 1 ? '0.25em' : '0'
              }}
            >
              {word.split("").map((char, charIndex) => (
                <span
                  key={`${wordIndex}-${charIndex}`}
                  className="about-char"
                  style={{
                    display: 'inline-block',
                    willChange: 'transform',
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h2>
      </div>

      {/* Subheadline / Description */}
      <p
        className="about-description"
        style={{
          fontFamily: 'var(--font-body), sans-serif',
          fontSize: 'clamp(18px, 1.3vw, 22px)',
          lineHeight: 1.45,
          color: 'var(--color-text-2)',
          maxWidth: '28ch',
          margin: 0,
          opacity: 0,
          transform: 'translateY(20px)',
          willChange: 'opacity, transform',
        }}
      >
        Building thoughtful digital experiences through code, design, and AI.
      </p>
    </div>
  );
}
