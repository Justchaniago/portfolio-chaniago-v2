// components/work/SignaturePathController.ts

export const SIGNATURE_PATH_CONFIG = {
  APPEAR_START: 0.15,
  APPEAR_END: 0.25,

  DRAW_START: 0.20,
  DRAW_END: 0.75,

  DRIFT_START: 0.20,
  DRIFT_END: 0.85,

  FADE_START: 0.78,
  FADE_END: 0.88,
};

export class SignaturePathController {
  private path: SVGPathElement;
  private svg: SVGSVGElement;
  private length: number;

  constructor(path: SVGPathElement, svg: SVGSVGElement) {
    this.path = path;
    this.svg = svg;
    
    // Fallback in case browser hasn't completed path parsing yet
    this.length = 0;
    try {
      this.length = path.getTotalLength();
    } catch (e) {
      console.warn('Failed to get path length, using fallback', e);
    }
    
    if (!this.length || isNaN(this.length)) {
      this.length = 6156.04; // Math-calculated length of target bezier curve coordinates
    }

    // Set initial unitless stroke dash properties on path attribute
    this.path.setAttribute('stroke-dasharray', this.length.toFixed(2));
    this.path.setAttribute('stroke-dashoffset', this.length.toFixed(2));
  }

  public update(progress: number) {
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const cfg = SIGNATURE_PATH_CONFIG;

    // 1. Calculate Opacity
    let opacity = 0;
    if (clampedProgress >= cfg.APPEAR_START && clampedProgress <= cfg.FADE_END) {
      if (clampedProgress < cfg.APPEAR_END) {
        // Fade in: APPEAR_START -> APPEAR_END
        opacity = (clampedProgress - cfg.APPEAR_START) / (cfg.APPEAR_END - cfg.APPEAR_START);
      } else if (clampedProgress > cfg.FADE_START) {
        // Fade out: FADE_START -> FADE_END
        opacity = 1 - (clampedProgress - cfg.FADE_START) / (cfg.FADE_END - cfg.FADE_START);
      } else {
        opacity = 1;
      }
    }
    
    // 2. Calculate Draw Progress
    let drawProgress = 0;
    if (clampedProgress >= cfg.DRAW_START) {
      if (clampedProgress <= cfg.DRAW_END) {
        drawProgress = (clampedProgress - cfg.DRAW_START) / (cfg.DRAW_END - cfg.DRAW_START);
      } else {
        drawProgress = 1;
      }
    }
    const offset = this.length * (1 - drawProgress);

    // 3. Calculate Drift Translation (-15px to +15px)
    let driftProgress = 0;
    if (clampedProgress >= cfg.DRIFT_START) {
      if (clampedProgress <= cfg.DRIFT_END) {
        driftProgress = (clampedProgress - cfg.DRIFT_START) / (cfg.DRIFT_END - cfg.DRIFT_START);
      } else {
        driftProgress = 1;
      }
    }
    const driftX = -15 + (driftProgress * 30);

    // 4. Render directly to elements (SVG attributes for attributes, style for opacity)
    this.path.setAttribute('stroke-dashoffset', offset.toFixed(2));
    this.svg.style.opacity = opacity.toFixed(3);
    this.path.setAttribute('transform', `translate(${driftX.toFixed(2)}, 0)`);

    // 5. Broadcast values for Debug HUD UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('signaturePathUpdate', {
          detail: {
            progress: clampedProgress,
            drawProgress,
            opacity,
            driftX,
            length: this.length,
            offset,
          },
        })
      );
    }
  }
}
