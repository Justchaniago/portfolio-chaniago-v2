// components/work/SignaturePath.tsx
'use client';

import { RefObject } from 'react';

interface SignaturePathProps {
  svgRef: RefObject<SVGSVGElement | null>;
  pathRef: RefObject<SVGPathElement | null>;
}

export default function SignaturePath({ svgRef, pathRef }: SignaturePathProps) {
  return (
    <svg
      ref={svgRef}
      className="work-path-svg"
      viewBox="0 0 1000 4000"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
        opacity: 0, // Managed by SignaturePathController
        willChange: 'opacity',
      }}
    >
      <path
        ref={pathRef}
        d="M -100 480 C 200 480, 400 550, 450 750 C 500 950, 200 1150, -150 1250 C -300 1300, 100 1500, 500 1600 C 900 1700, 1150 1900, 1200 2100 C 1250 2300, 600 2500, 150 2600 C -100 2650, 100 2950, 500 3100 C 900 3250, 1100 3400, 1200 3650"
        stroke="#3F702A"
        strokeWidth="var(--path-stroke-width, 18px)"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          willChange: 'stroke-dashoffset, transform',
        }}
      />
      
      <style>{`
        .work-path-svg {
          --path-stroke-width: clamp(12px, 1.8vw, 24px);
        }
      `}</style>
    </svg>
  );
}
