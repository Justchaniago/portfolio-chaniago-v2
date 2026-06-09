# AUDIT-TRANSITION-RESIDUAL-001 FINDINGS

Scope: forensic source audit only. No runtime screenshot or browser capture was taken, so no PASS verdict is issued. The grey band and flicker are treated as real symptoms and the conclusions below are ranked hypotheses backed by source evidence.

## 1. Layer Inventory

| Layer / element | Evidence | Position | z-index / stack | Opacity / filter / transform / mask / will-change | Stacking context / GPU risk | Active during Hero -> About transition |
|---|---:|---|---|---|---|---|
| `html` theme variables | `app/globals.css:3-40`, `components/about/AboutEnvironmentLifecycle.ts:10-24` | root | root | `--color-bg` starts dark and is tweened to `#FFFFFF`; text/card vars also tweened | root color source for body/About/nav | Yes |
| `body` | `app/globals.css:145-151`, `app/layout.tsx:60-65` | normal flow | root | `background: var(--color-bg)`, `color: var(--color-text-1)` | root paint changes with About activation | Yes |
| `main` | `app/page.tsx:5-7` | normal flow | auto | Tailwind `bg-void`, `min-h-screen` | fixed dark surface can show through if section opacity/layer coverage gaps exist | Yes |
| `PinnedSections` wrapper | `components/sections/PinnedSections.tsx:185-210` | relative | auto | `className="w-full relative"` | parent for section siblings; no z-index | Yes |
| `NavRail` | `components/layout/NavRail.tsx:146-165` | fixed, right center | `100` | `transform: translateY(-50%)` | fixed + transform creates independent compositor candidate | Yes |
| `NavRail` labels | `components/layout/NavRail.tsx:259-276` | absolute | inside rail | `opacity`, `filter: blur(8px)`, `willChange: opacity, filter` | filter and opacity can create contexts during hover | Only on hover |
| `NavRail` active indicator | `components/layout/NavRail.tsx:297-315` | absolute | `3` inside rail | Framer `y`, `scaleY`, `scaleX` transforms | transform-driven compositor surface | Yes |
| `MorphNav` fixed shell | `components/layout/MorphNav.tsx:478-512` | fixed top nav | `1000` | logo has `mixBlendMode` when menu open | fixed shell is above transition layer | Yes |
| `MorphNav` menu capsule | `components/layout/MorphNav.tsx:515-551` | fixed top-right/top-center | `1001` | `backdropFilter: blur(12px)`, `WebkitBackdropFilter`, animated `left/x/width/opacity/scale`, `overflow: hidden` | independent high z-index backdrop-filter surface; samples pixels behind it | Yes |
| `MorphNav` collapsed/expanded inner content | `components/layout/MorphNav.tsx:554-698` | absolute children | inside capsule | opacity/scale/y transitions; SVG line transforms | transform/opacity contexts inside backdrop surface | Yes |
| `MorphNav` liquid canvas | `components/layout/MorphNav.tsx:700-712` | fixed full-screen | `900` | canvas render surface | fixed full-screen compositor candidate, normally transparent unless menu animates | Mounted during transition; visually active only during menu open/close |
| `MorphNav` overlay | `components/layout/MorphNav.tsx:714-732` | fixed full-screen | `950` | `opacity: 0`, `visibility: hidden` when closed | high z-index fixed overlay remains mounted but hidden | Mounted; inactive unless menu open |
| `CustomCursor` portal | `components/ui/CustomCursor.tsx:221-252` | fixed portal into `document.body` | `99999` | JS writes `translate3d(...)`; `willChange: transform`; `mixBlendMode: difference`; opacity transition | guaranteed GPU candidate; above all app layers | Yes after cursor appears |
| Loader overlay | `components/ui/Loader.tsx:161-176`, `components/layout/LoaderWrapper.tsx:17-18` | fixed full-screen | `99999` | animated SVG and overlay opacity | only present until loader completes | No, unless loader still active |
| Hero wrapper `#hero-section` | `components/sections/PinnedSections.tsx:195-197` | relative | auto | GSAP fades `#hero-section` opacity to `0` | opacity tween creates stacking context during fade | Yes until scrolled out |
| Hero root `.hero-section-container` | `components/sections/Hero.tsx:198-218` | absolute inset | `2` | black background, overflow hidden | positioned z-index context | Yes during transition edge |
| Hero fluid canvas | `components/sections/Hero.tsx:220-232`, `hooks/useFluidSim.ts:42-63` | absolute inset | `1` | canvas renderer; no explicit opacity | GPU/WebGL/canvas surface | Yes while Hero mounted |
| Hero grain overlay | `components/sections/Hero.tsx:234-247` | absolute inset | `2` | `opacity: 0.028`, `mixBlendMode: overlay` | blend + opacity context | Yes while Hero mounted |
| Hero text | `components/sections/Hero.tsx:249-263`, `components/sections/PinnedSections.tsx:92-103` | absolute inset | `3` | GSAP opacity/y fade | opacity and transform tween context | Yes until faded |
| Hero meta row | `components/sections/Hero.tsx:361-379` | absolute bottom | `4` | opacity/transform transition | local opacity/transform context | Yes while Hero mounted |
| `EnvironmentTransitionLayer` root | `components/transitions/EnvironmentTransitionLayer.tsx:121-126`, `:132-141` | fixed full-screen | `80` | GSAP `autoAlpha`, exit opacity tween; `visibility` toggles | fixed overlay; creates viewport-level layer while mounted | Yes until unmounted |
| `.environment-transition-card` | `components/transitions/EnvironmentTransitionLayer.tsx:127`, `:143-155` | absolute bottom | auto inside layer | white background, animated y/width/height/radius/scale/shadow; `will-change`; `mask-image` | high compositor risk; mask + will-change | Yes during card rise/expansion |
| `.environment-transition-coverage` | `components/transitions/EnvironmentTransitionLayer.tsx:128`, `:157-162` | absolute inset | auto | white background; opacity tween to `1` | simple layer but inside promoted card | Yes during/after coverage |
| About wrapper `#about-section` | `components/sections/PinnedSections.tsx:199-201` | relative | auto | `overflow-hidden`; ScrollTrigger pin target | can be wrapped/pinned by GSAP | Yes |
| `.about-section-container` | `components/sections/About.tsx:12-29` | absolute inset | `1` | `backgroundColor: var(--color-bg)`, `transition: color 0.4s` | positioned z-index context; white canvas appears when vars change | Yes |
| `.about-glow-behind` | `components/about/AboutEnvironment.tsx:11-25` | absolute bottom center | `1` | `transform: translateX(-50%)`, `filter: blur(100px)`, opacity from `--about-env-opacity` | filter and opacity create compositor/stacking risk | Yes after env opacity rises |
| `.about-portrait-img` | `components/sections/About.tsx:33-52` | absolute bottom right | `2` | opacity `0`; `clipPath`; `transform`; `willChange: clip-path, transform` | clip-path/transform compositor candidate | Yes, initially hidden |
| `.about-portrait-left-img` | `components/sections/About.tsx:55-72` | absolute bottom left | `2` | opacity `0`; `willChange: transform, opacity` | compositor candidate | Yes, initially hidden |
| `.about-glass-overlay` | `components/about/AboutEnvironment.tsx:31-78` | absolute bottom center | `3` | opacity from `--about-env-opacity`; `maskImage`; child backdrop blur | mask + opacity context; backdrop child samples lower pixels | Yes after env opacity rises |
| About backdrop blur child | `components/about/AboutEnvironment.tsx:51-60` | absolute inset | auto inside glass | `backdropFilter: blur(24px)`, `WebkitBackdropFilter` | backdrop-filter surface | Yes after parent opacity rises |
| `.about-editorial-text` | `components/about/AboutChapterA.tsx:4-17` | absolute lower left | `4` | child opacity/transform/will-change | text reveal is gated by controller | Mounted but held hidden until transition complete |
| About Chapter A children | `components/about/AboutChapterA.tsx:19-127`, `components/about/AboutController.ts:24-62` | relative/inline | inside text | initial opacity/y/yPercent; will-change on chars/description | many small transform layers | Mounted; animated only after gate |
| `.about-sub-content` | `components/about/AboutChapterB.tsx:4-18` | absolute right | `4` | `opacity: 0`, `willChange: opacity, transform` | compositor candidate | Mounted; hidden during transition |
| `.about-portrait-trigger` | `components/sections/About.tsx:74-88` | absolute bottom right | `10` | pointer target only | above About content but below transition/nav | Mounted |
| Work section | `components/sections/PinnedSections.tsx:203-205`, `components/work/ProjectShowcase.tsx:30-74` | relative section below About | auto | reveal triggers and signature path when Work enters viewport | not expected during Hero -> About unless overscroll/deeplink | Normally inactive |

## 2. Stacking Context Map

```txt
[root] html/body - background/color from CSS variables
  [auto] main.bg-void
    [auto] PinnedSections wrapper - relative
      [100] NavRail - fixed, transform
        [2] dot/label layer - labels have opacity/filter on hover
        [3] active indicator - Framer transform
      [80] EnvironmentTransitionLayer - fixed full viewport, autoAlpha/opacity/visibility
        [auto] environment-transition-card - absolute, transform/scale, will-change, mask-image, white bg
          [auto] environment-transition-coverage - absolute, opacity, white bg
      [auto] #hero-section - relative, GSAP opacity fade
        [2] Hero root - absolute, black bg
          [1] hero-fluid-canvas - absolute canvas
          [2] grain overlay - opacity + mixBlendMode
          [3] hero-text-content - opacity/transform
          [4] hero-meta-row - opacity/transform
      [auto] #about-section - relative, ScrollTrigger pin target
        [1] about-section-container - absolute, background var(--color-bg)
          [1] about-glow-behind - filter blur + opacity
          [2] about-portrait images - transform/clip-path/opacity
          [3] about-glass-overlay - opacity + mask-image
            [auto] backdrop blur child - backdrop-filter
          [4] about-editorial-text / about-sub-content - opacity/transform children
          [10] about-portrait-trigger
      [auto] #work-section / #contact-section

[900] MorphNav canvas - fixed full viewport, mounted
[950] MorphNav overlay - fixed full viewport, hidden when closed
[1000] MorphNav shell - fixed top
  [1001] MorphNav logo
[1001] MorphNav menu capsule - fixed, backdrop-filter, animated opacity/scale/x
[99999] CustomCursor portal - fixed, translate3d, will-change, mix-blend-mode
[99999] Loader overlay - fixed, only before loader complete
```

Independent stacking contexts identified from source: `#hero-section` during opacity tween (`components/sections/PinnedSections.tsx:105-114`), `.hero-section-container` with positioned `zIndex: 2` (`components/sections/Hero.tsx:198-218`), Hero grain with opacity/blend (`components/sections/Hero.tsx:234-247`), `EnvironmentTransitionLayer` fixed z-index (`components/transitions/EnvironmentTransitionLayer.tsx:132-141`), transition card with transform/mask/will-change (`components/transitions/EnvironmentTransitionLayer.tsx:143-155`), `.about-section-container` positioned z-index (`components/sections/About.tsx:12-29`), `.about-glow-behind` filter (`components/about/AboutEnvironment.tsx:11-25`), `.about-glass-overlay` opacity/mask (`components/about/AboutEnvironment.tsx:31-49`), its backdrop child (`components/about/AboutEnvironment.tsx:51-60`), `MorphNav` fixed capsule (`components/layout/MorphNav.tsx:515-551`), `NavRail` fixed transform (`components/layout/NavRail.tsx:146-165`), and `CustomCursor` fixed `translate3d` portal (`components/ui/CustomCursor.tsx:221-252`).

## 3. Backdrop-Filter Surfaces

| Surface | Evidence | Active during transition | Isolation status | Could sample Hero/Transition pixels? |
|---|---:|---|---|---|
| `MorphNav` menu capsule | `components/layout/MorphNav.tsx:531-551` | Yes. It is fixed and mounted globally from `app/layout.tsx:60-65`. | It has its own fixed positioned z-index `1001`, `overflow: hidden`, animated Framer transform/opacity, but no explicit isolated non-filter parent wrapper around the blur. | Yes. It sits above `EnvironmentTransitionLayer` (`z-index: 80`) and Hero/About, so its blur samples the composited pixels below it during the transition. This is the strongest source-level match for menu capsule contrast degradation. |
| About glass blur child | `components/about/AboutEnvironment.tsx:51-60` | Yes after `--about-env-opacity` rises. The parent opacity is `var(--about-env-opacity)` at `components/about/AboutEnvironment.tsx:45`. | Split into a parent mask container and child blur layer. Parent has mask/opacity/absolute positioning (`components/about/AboutEnvironment.tsx:31-49`), child has backdrop-filter. | It is inside About at z-index `3`, below transition layer z-index `80`; backdrop-filter samples pixels behind itself within About/Hero context, not the transition layer above it. It can still contribute to compositor cost during handoff. |
| `.project-gallery-pill` | `app/globals.css:232-260`, `:263-277` | Not normally active during Hero -> About. It belongs to project card/gallery surfaces later in Work. | Absolute pill with blur/filter/will-change; no evidence it is mounted in current `ProjectShowcase` render path. | Unlikely for this symptom unless legacy ProjectCard is mounted elsewhere. Source search shows `ProjectCard.legacy.tsx` but `ProjectShowcase.tsx` does not import it (`components/work/ProjectShowcase.tsx:1-8`). |
| Legacy project expanded backdrop | `components/work/ProjectCard.legacy.tsx:481-506` | Not active in current Hero -> About path based on imports. | Fixed/expanded overlay in legacy component. | Unverified/inactive for current page. |

## 4. GPU-Promoted Layers

| Element | Evidence | Promotion trigger | Intentional? | Active during transition? | Could persist after ownership transfer? |
|---|---:|---|---|---|---|
| `EnvironmentTransitionLayer` root | `components/transitions/EnvironmentTransitionLayer.tsx:132-141`, `:91-113` | `position: fixed`; GSAP opacity/visibility | Intentional transition overlay | Yes until React unmount | No after React unmount, but yes until `isTransitionComplete` flips |
| `.environment-transition-card` | `components/transitions/EnvironmentTransitionLayer.tsx:143-155` | `will-change: transform, width, height, border-radius, box-shadow, opacity`; mask | Intentional for card expansion | Yes | No after layer unmount; can persist during exit tween |
| Hero section opacity fade | `components/sections/PinnedSections.tsx:105-114` | GSAP opacity tween on `#hero-section` | Intentional fade | Yes | No, but overlap with transition occurs during boundary |
| Hero fluid canvas | `components/sections/Hero.tsx:220-232`, `hooks/useFluidSim.ts:42-63` | canvas renderer | Intentional | Yes while Hero mounted | It remains mounted as section remains in DOM |
| Hero grain overlay | `components/sections/Hero.tsx:234-247` | opacity + `mixBlendMode` | Intentional texture | Yes while Hero visible/fading | Mounted while Hero section exists |
| About glow | `components/about/AboutEnvironment.tsx:11-25` | `filter: blur(100px)`, opacity var | Intentional atmosphere | Activates after env handoff | Persists through About |
| About glass overlay and blur child | `components/about/AboutEnvironment.tsx:31-60` | mask, opacity, backdrop-filter | Intentional glass effect | Activates after env handoff | Persists through About |
| About portrait right | `components/sections/About.tsx:33-52` | `willChange: clip-path, transform` | Intentional reveal | Mounted; hidden until gate | Persists through About |
| About portrait left | `components/sections/About.tsx:55-72` | `willChange: transform, opacity` | Intentional morph | Mounted; hidden until later | Persists through About |
| About Chapter A text chars | `components/about/AboutChapterA.tsx:19-127` | `willChange: opacity, transform` and per-char transforms | Intentional reveal | Mounted; gated hidden | Persists through About |
| About Chapter B | `components/about/AboutChapterB.tsx:4-18`, `:21-29`, `:77-85`, `:151-159`, `:211-219` | multiple `willChange: opacity, transform` | Intentional reveal | Mounted; hidden | Persists through About |
| MorphNav capsule | `components/layout/MorphNav.tsx:515-551` | fixed, backdrop-filter, Framer transform/opacity/scale | Intentional nav | Yes | Yes, global persistent layer |
| MorphNav canvas/overlay | `components/layout/MorphNav.tsx:700-732` | fixed full-screen canvas and overlay | Intentional menu overlay | Mounted; visually hidden unless menu animates | Yes, global persistent layer |
| NavRail | `components/layout/NavRail.tsx:146-165`, `:259-315` | fixed transform, Framer transforms, label filters | Intentional nav rail | Yes | Yes, global persistent layer |
| CustomCursor | `components/ui/CustomCursor.tsx:112-115`, `:237-252` | `translate3d`, fixed, `willChange`, `mixBlendMode` | Intentional cursor | Yes after mousemove | Yes, global persistent layer |
| Loader | `components/ui/Loader.tsx:161-176`, `:179-192` | fixed overlay, will-change, blend | Intentional loading | Only before loaded | Removed by `LoaderWrapper` when complete (`components/layout/LoaderWrapper.tsx:17-18`) |

## 5. EnvironmentTransitionLayer Unmount Analysis

Unmount trigger: `PinnedSections` conditionally renders `<EnvironmentTransitionLayer />` only while `!isTransitionComplete` (`components/sections/PinnedSections.tsx:185-193`). `isTransitionComplete` is set to `true` in the `lifecycleTrigger.onLeave` callback (`components/sections/PinnedSections.tsx:119-140`).

Exact scroll boundary: that lifecycle trigger uses `#about-section`, `start: 'top 20%'`, `end: 'top -5%'` (`components/sections/PinnedSections.tsx:120-123`). Therefore, React unmount occurs after the About section top has passed `-5%` of the viewport on downward scroll, when `onLeave` fires (`components/sections/PinnedSections.tsx:132-135`).

GSAP work still targeting the component before unmount: `EnvironmentTransitionLayer` owns an entry/expansion ScrollTrigger from `top 70%` to `top 35%` (`components/transitions/EnvironmentTransitionLayer.tsx:38-70`) and an exit tween from `top 20%` to `top -5%` (`components/transitions/EnvironmentTransitionLayer.tsx:91-113`). On component unmount, cleanup kills both `transitionTimeline` and `exitTween` (`components/transitions/EnvironmentTransitionLayer.tsx:115-118`).

CSS animations/keyframes on this component: none were found in `EnvironmentTransitionLayer.tsx`; the component uses GSAP timelines and inline scoped CSS only (`components/transitions/EnvironmentTransitionLayer.tsx:131-171`).

Could visual pixels persist after React removes it? From React source alone, the DOM node is removed when the conditional render turns false (`components/sections/PinnedSections.tsx:185-193`), and cleanup kills GSAP tweens (`components/transitions/EnvironmentTransitionLayer.tsx:115-118`). A browser compositor one-frame stale texture is possible but unverified without runtime capture. There is a proven high-risk frame at the same `top -5%` boundary because exit tween completion, visibility change, state change, React unmount, and About content gate release all converge there (`components/transitions/EnvironmentTransitionLayer.tsx:91-113`, `components/sections/PinnedSections.tsx:132-135`, `components/about/AboutController.ts:121-137`).

## 6. CSS Variable Transition Timing

Initial variables: `--color-bg` starts as `var(--color-void)` and `--color-text-1` as `var(--color-white)` in `app/globals.css:33-40`; `--about-env-opacity` starts at `0` in `app/globals.css:3-4`.

About theme target values: `--color-bg: #FFFFFF`, `--color-text-1: #0A0A0A`, and `--color-card-bg: rgba(10, 10, 10, 0.04)` are defined in `ABOUT_THEME_VARS` with `duration: 0.3` (`components/about/AboutEnvironmentLifecycle.ts:10-24`).

Activation trigger: `EnvironmentTransitionLayer` calls `onEnvironmentHandoff` when its first ScrollTrigger progress reaches `>= 0.85` (`components/transitions/EnvironmentTransitionLayer.tsx:58-62`). That callback calls `aboutEnvironmentRef.current?.activate()` (`components/sections/PinnedSections.tsx:30-32`), which runs `gsap.to('html', ABOUT_THEME_VARS)` (`components/about/AboutEnvironmentLifecycle.ts:41-56`).

Scroll mapping: the handoff progress is calculated on `#about-section` from `top 70%` to `top 35%` (`components/transitions/EnvironmentTransitionLayer.tsx:40-43`). At progress `0.85`, the About top is approximately `40.25%` of viewport height: `70% - (0.85 * 35%)`. This means the root theme begins turning white well before the unmount/content gate at `top -5%` (`components/sections/PinnedSections.tsx:120-140`).

Content reveal gate: About content is held at timeline progress `0` while `isTransitionComplete` is false (`components/about/AboutController.ts:45-53`). The gate flips only when `setTransitionComplete(true)` is called after lifecycle trigger `onLeave` (`components/sections/PinnedSections.tsx:132-135`, `components/about/AboutController.ts:121-129`).

Mismatch finding: the environment variables become white around `#about-section top ~= 40.25%`, while About content remains locked until `#about-section top < -5%`. This is a source-proven mismatch that can cause the "white canvas before content" symptom. It is not visually disproven by the current source.

## 7. Menu Capsule Stack Analysis

The menu capsule is `#morph-nav-container` in `MorphNav` (`components/layout/MorphNav.tsx:515-551`). It is globally mounted in `RootLayout` before page children (`app/layout.tsx:60-65`), independent of `PinnedSections`.

Stack facts:
- The capsule is `position: fixed`, `top: 12px`, `zIndex: 1001`, with `backdropFilter: blur(12px)` and `WebkitBackdropFilter: blur(12px)` (`components/layout/MorphNav.tsx:531-551`).
- It animates `left`, Framer `x`, `width`, `opacity`, and `scale` (`components/layout/MorphNav.tsx:515-525`).
- It sits above `EnvironmentTransitionLayer` z-index `80` (`components/transitions/EnvironmentTransitionLayer.tsx:132-141`), `NavRail` z-index `100` (`components/layout/NavRail.tsx:146-165`), and the About/Hero section layers.
- No parent element wrapping the capsule provides an isolated non-blurred glass container. The fixed shell is separate from the capsule (`components/layout/MorphNav.tsx:478-512`), while the capsule itself owns the blur (`components/layout/MorphNav.tsx:531-551`).

Contamination direction: source evidence points to contamination from below the capsule, not above it. Because the capsule's backdrop-filter samples already-composited pixels behind a `z-index:1001` fixed element, it can sample Hero dark pixels, transition white card pixels, About white canvas pixels, or mixed opacity frames depending on scroll timing. This matches the reported contrast degradation during the transition.

## 8. Root Cause Hypotheses

1. High probability: CSS variable handoff happens too early relative to About content release.
   Evidence: root variables begin tweening at transition progress `0.85` in the `top 70% -> top 35%` range (`components/transitions/EnvironmentTransitionLayer.tsx:40-62`, `components/about/AboutEnvironmentLifecycle.ts:10-24`), while About content is gated until lifecycle `top -5%` (`components/sections/PinnedSections.tsx:119-140`, `components/about/AboutController.ts:45-53`). This directly supports the "white About environment appears too early" symptom.

2. High probability: menu capsule contrast is degraded by its own backdrop-filter sampling mixed transition pixels underneath.
   Evidence: `MorphNav` capsule is fixed at z-index `1001` with `backdropFilter: blur(12px)` (`components/layout/MorphNav.tsx:531-551`), above the transition layer z-index `80` (`components/transitions/EnvironmentTransitionLayer.tsx:132-141`). It is active throughout because `MorphNav` is mounted globally (`app/layout.tsx:60-65`).

3. Medium-high probability: micro flicker occurs at the `top -5%` convergence frame.
   Evidence: the same boundary controls exit tween end/visibility (`components/transitions/EnvironmentTransitionLayer.tsx:91-113`), React unmount (`components/sections/PinnedSections.tsx:132-135`, `:185-193`), and About gate release (`components/about/AboutController.ts:121-137`). At that point About also has filter/backdrop-filter/will-change surfaces ready to activate (`components/about/AboutEnvironment.tsx:11-60`, `components/sections/About.tsx:33-72`).

4. Medium probability: top grey band is an opacity blend artifact between a fading Hero, white transition card, and early white body/About variables.
   Evidence: Hero section opacity is scrubbed from `top top` to `bottom 20%` (`components/sections/PinnedSections.tsx:105-114`); transition layer/card opacity and white coverage are independently scrubbed (`components/transitions/EnvironmentTransitionLayer.tsx:72-89`, `:91-113`); root background also changes independently (`components/about/AboutEnvironmentLifecycle.ts:10-24`). This creates multiple simultaneous semi-independent opacity/paint owners. The source supports the mechanism but not the exact 80-120px top band shape.

5. Medium probability: About glass/backdrop/filter surfaces create a compositor invalidation during handoff.
   Evidence: About glow has `filter: blur(100px)` (`components/about/AboutEnvironment.tsx:11-25`), About glass has mask/opacity (`components/about/AboutEnvironment.tsx:31-49`), and the blur child uses `backdropFilter: blur(24px)` (`components/about/AboutEnvironment.tsx:51-60`). These activate via `--about-env-opacity` before content is ready (`components/about/AboutEnvironmentLifecycle.ts:10-24`). The exact flicker requires runtime proof.

6. Low-medium probability: persistent global GPU layers amplify instability.
   Evidence: `CustomCursor` is `zIndex: 99999` with `translate3d`, `willChange`, and `mixBlendMode` (`components/ui/CustomCursor.tsx:112-115`, `:237-252`); `MorphNav` canvas/overlay are fixed full-screen at z-index `900/950` (`components/layout/MorphNav.tsx:700-732`); `NavRail` is fixed with transform at z-index `100` (`components/layout/NavRail.tsx:146-165`). These are not direct root causes by themselves, but they add compositor surfaces during the transition.

## 9. What Is Still Unknown

- The exact pixel source of the top grey band remains unverified. Source evidence supports several opacity/blending paths, but proving the 80-120px band requires frame capture or computed-layer inspection at the transition scroll positions.
- The actual DOM order and callback ordering at the `top -5%` frame is not proven from source alone. Both `PinnedSections` and `EnvironmentTransitionLayer` create ScrollTriggers on the same `#about-section` range (`components/sections/PinnedSections.tsx:119-140`, `components/transitions/EnvironmentTransitionLayer.tsx:91-113`).
- Whether a compositor texture visually persists for one frame after React unmount is browser/runtime-specific and cannot be proven from static code.
- The actual GSAP pin wrapper structure for `#about-section` is generated at runtime by ScrollTrigger (`components/about/AboutController.ts:40-55`), so the final DOM stacking tree requires runtime inspection.
- The visual state of `MorphNav` during the symptom depends on scroll position, hover state, and whether the capsule is collapsed; source shows it collapses after `window.scrollY > 80` (`components/layout/MorphNav.tsx:209-236`), but exact symptom frames need visual capture.
