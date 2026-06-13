import type { PortfolioSectionId } from '@/components/experience/PortfolioExperienceContext';

export const palette = {
  paper: '#F6F4F1',
  stone: '#E4DED2',
  coral: '#F95C4B',
  coralDim: '#D9473B',
  black: '#000000',
  nearBlack: '#050505',
  void: '#0A0A0A',
  white: '#FFFFFF',
} as const;

export type SectionTheme = Record<string, string>;

export const SECTION_THEMES: Record<PortfolioSectionId, SectionTheme> = {
  hero: {
    '--color-bg': palette.void,
    '--color-surface': '#111111',
    '--color-surface-2': '#1C1C1C',
    '--color-surface-soft': '#1C1C1C',
    '--color-text-1': palette.white,
    '--color-text-2': '#888888',
    '--color-text-3': '#555555',
    '--color-border': '#2A2A2A',
    '--color-accent': palette.coral,
    '--color-accent-dim': palette.coralDim,
    '--about-env-opacity': '0',
  },
  about: {
    '--color-bg': palette.paper,
    '--color-surface': palette.paper,
    '--color-surface-2': palette.stone,
    '--color-surface-soft': palette.stone,
    '--color-text-1': palette.void,
    '--color-text-2': '#3E3A36',
    '--color-text-3': '#68615A',
    '--color-border': 'rgba(10, 10, 10, 0.14)',
    '--color-accent': palette.coral,
    '--color-accent-dim': palette.coralDim,
    '--about-env-opacity': '1',
  },
  work: {
    '--color-bg': palette.paper,
    '--color-surface': palette.paper,
    '--color-surface-2': palette.stone,
    '--color-surface-soft': palette.stone,
    '--color-text-1': palette.void,
    '--color-text-2': '#3E3A36',
    '--color-text-3': '#68615A',
    '--color-border': 'rgba(10, 10, 10, 0.14)',
    '--color-accent': palette.coral,
    '--color-accent-dim': palette.coralDim,
    '--about-env-opacity': '1',
  },
  contact: {
    '--color-bg': palette.nearBlack,
    '--color-surface': '#111111',
    '--color-surface-2': '#1C1C1C',
    '--color-surface-soft': '#1C1C1C',
    '--color-text-1': palette.white,
    '--color-text-2': '#CFCFCF',
    '--color-text-3': '#777777',
    '--color-border': 'rgba(255, 255, 255, 0.14)',
    '--color-accent': palette.coral,
    '--color-accent-dim': palette.coralDim,
    '--about-env-opacity': '0',
  },
};

export function getSectionTheme(sectionId: PortfolioSectionId): SectionTheme {
  return SECTION_THEMES[sectionId];
}

export function applyThemeVariables(target: HTMLElement, theme: SectionTheme) {
  Object.entries(theme).forEach(([property, value]) => {
    target.style.setProperty(property, value);
  });
}

export function applySectionTheme(sectionId: PortfolioSectionId, target = document.documentElement) {
  applyThemeVariables(target, getSectionTheme(sectionId));
}

export function getTransitionTheme(
  _from: PortfolioSectionId | undefined,
  to: PortfolioSectionId
): SectionTheme {
  return getSectionTheme(to);
}
