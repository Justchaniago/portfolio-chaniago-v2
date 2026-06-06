import {
  MOTION_DURATIONS,
  MOTION_EASES,
  MOTION_DISTANCES,
  MOTION_OPACITIES,
  MOTION_SCALES,
} from './motionSystem';

export const motionPresets = {
  // Fade transitions
  fadeIn: {
    opacity: MOTION_OPACITIES.visible,
    duration: MOTION_DURATIONS.fade,
    ease: MOTION_EASES.none,
  },
  fadeOut: {
    opacity: MOTION_OPACITIES.hidden,
    duration: MOTION_DURATIONS.fade,
    ease: MOTION_EASES.none,
  },

  // Work Scene presets
  workContainerEnter: {
    opacity: MOTION_OPACITIES.visible,
    duration: MOTION_DURATIONS.fade,
    ease: MOTION_EASES.none,
  },
  workIntroLineReveal: {
    yPercent: 0,
    opacity: MOTION_OPACITIES.visible,
    duration: MOTION_DURATIONS.lineReveal,
    ease: MOTION_EASES.premium,
  },
  workIntroExit: {
    y: `-${MOTION_DISTANCES.workExitOffset}px`,
    opacity: MOTION_OPACITIES.hidden,
    duration: MOTION_DURATIONS.containerExit,
    ease: MOTION_EASES.inOut,
  },

  // Contact Scene presets
  contactTitleReveal: {
    y: '0%',
    opacity: MOTION_OPACITIES.visible,
    duration: MOTION_DURATIONS.textReveal,
    ease: MOTION_EASES.power4Out,
  },
  contactColumnReveal: {
    opacity: MOTION_OPACITIES.visible,
    y: 0,
    duration: MOTION_DURATIONS.column,
    ease: MOTION_EASES.power3Out,
  },
  contactFooterReveal: {
    opacity: MOTION_OPACITIES.visible,
    y: 0,
    duration: MOTION_DURATIONS.footer,
    ease: MOTION_EASES.power3Out,
  },

  // Eclipse Transition presets
  eclipseRise: {
    opacity: MOTION_OPACITIES.visible,
    y: '-18vmax',
    scale: MOTION_SCALES.eclipseMid,
    ease: MOTION_EASES.power4InOut,
    duration: MOTION_DURATIONS.eclipseRise,
  },
  eclipseCover: {
    y: '-230vmax',
    scale: MOTION_SCALES.eclipseCover,
    ease: MOTION_EASES.expoInOut,
    duration: MOTION_DURATIONS.eclipseCover,
  },
  eclipseBlackout: {
    opacity: MOTION_OPACITIES.visible,
    ease: MOTION_EASES.none,
    duration: MOTION_DURATIONS.eclipseBlackout,
  },
};
