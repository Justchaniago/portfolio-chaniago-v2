# AUDIT-TRANSITION-RESIDUAL-002 FINDINGS

Scope: forensic source audit only. No application code was modified. The goal is to identify the safest source-level point for About environment activation without breaking the Hero -> Transition -> About visual choreography.

## 1. Proven Current Activation Path

| Event | Source evidence | What is proven |
|---|---:|---|
| The environment object is created once in `PinnedSections` via a ref. | `components/sections/PinnedSections.tsx:21-28` | `aboutEnvironmentRef.current` is initialized before callbacks use it. |
| `EnvironmentTransitionLayer` receives `handleEnvironmentHandoff` and `handleEnvironmentReset` as props. | `components/sections/PinnedSections.tsx:185-193` | The transition layer owns the callback moment for environment handoff/reset. |
| `handleEnvironmentHandoff` calls `aboutEnvironmentRef.current?.activate()`. | `components/sections/PinnedSections.tsx:30-32` | The current environment activation trigger is the transition layer's handoff callback. |
| `activate()` writes About variables to `html` through `gsap.to('html', ABOUT_THEME_VARS)`. | `components/about/AboutEnvironmentLifecycle.ts:40-56` | Activation changes global CSS variables, not only the About component. |
| `ABOUT_THEME_VARS` includes `--color-bg`, `--color-text-1`, `--color-card-bg`, and `--about-env-opacity`. | `components/about/AboutEnvironmentLifecycle.ts:10-24` | Background, text, card, and About atmosphere are currently bundled into one activation. |
| `--color-bg` starts dark and body uses it as background. | `app/globals.css:33-40`, `app/globals.css:145-151` | Changing `--color-bg` affects the root/body visual environment. |
| About container also uses `backgroundColor: var(--color-bg)`. | `components/sections/About.tsx:12-29` | Changing `--color-bg` affects the About canvas. |
| About glow and glass opacity depend on `--about-env-opacity`. | `components/about/AboutEnvironment.tsx:11-25`, `components/about/AboutEnvironment.tsx:31-60` | Activation also turns on About atmospheric layers, including a filtered glow and backdrop-filter surface. |

## 2. Current Scroll Timing Map

| Phase | Source evidence | Timing implication |
|---|---:|---|
| Transition entry ScrollTrigger runs from `#about-section` `top 70%` to `top 35%`. | `components/transitions/EnvironmentTransitionLayer.tsx:38-43` | Entry progress is tied to About top moving through a 35 viewport-percent window. |
| Current handoff fires at `self.progress >= 0.85`. | `components/transitions/EnvironmentTransitionLayer.tsx:58-62` | Current activation happens before the entry ScrollTrigger completes. |
| At progress `0.85`, About top is approximately `40.25%` of viewport height. | `components/transitions/EnvironmentTransitionLayer.tsx:40-43`, `components/transitions/EnvironmentTransitionLayer.tsx:58-62` | This calculation comes from `70% - (0.85 * (70% - 35%))`; exact pixel timing depends on ScrollTrigger runtime. |
| Card rise runs from timeline `0` to `0.4`. | `components/transitions/EnvironmentTransitionLayer.tsx:72-82` | Card movement precedes full-card expansion. |
| Card expands to `100vw`/`100vh` from timeline `0.4` to `0.75`. | `components/transitions/EnvironmentTransitionLayer.tsx:75-82` | Full viewport card size is intended before handoff at `0.85`. |
| Coverage opacity runs from timeline `0.75` to `0.85`. | `components/transitions/EnvironmentTransitionLayer.tsx:83-89` | Current handoff aligns with the end of coverage opacity. |
| Exit fade runs from `#about-section` `top 20%` to `top -5%`. | `components/transitions/EnvironmentTransitionLayer.tsx:91-113` | The transition overlay starts revealing the underlying canvas at `top 20%`. |
| React unmount / transition complete runs on a separate lifecycle trigger with the same `top 20%` to `top -5%` range. | `components/sections/PinnedSections.tsx:119-140`, `components/sections/PinnedSections.tsx:185-193` | The layer is conditionally removed only after lifecycle `onLeave` sets `isTransitionComplete` true. |
| About desktop content is pinned at `top top`, but held at progress `0` while `isTransitionComplete` is false. | `components/about/AboutController.ts:40-55` | Desktop About content should not reveal until the transition complete gate is opened. |
| `setTransitionComplete(true)` updates the About controller when lifecycle `onLeave` fires. | `components/sections/PinnedSections.tsx:132-135`, `components/about/AboutController.ts:121-129` | About content release is tied to the end of the lifecycle trigger, not to current environment activation. |

## 3. Ordering That Can and Cannot Be Proven

### Proven from source

- Current environment activation is caused by `EnvironmentTransitionLayer` progress `>= 0.85`, because `onUpdate` calls `onEnvironmentHandoff?.()` at that threshold and `PinnedSections` maps that callback to `activate()` (`components/transitions/EnvironmentTransitionLayer.tsx:58-62`, `components/sections/PinnedSections.tsx:30-32`).
- Current activation begins before exit fade starts, because handoff is on the entry trigger range `top 70%` -> `top 35%`, while exit fade starts at `top 20%` (`components/transitions/EnvironmentTransitionLayer.tsx:40-43`, `components/transitions/EnvironmentTransitionLayer.tsx:91-99`).
- Current activation begins before About content is released, because content release is driven by `setTransitionComplete(true)` on lifecycle `onLeave`, and the lifecycle trigger ends at `top -5%` (`components/sections/PinnedSections.tsx:119-140`, `components/about/AboutController.ts:45-53`, `components/about/AboutController.ts:121-129`).
- Current activation turns on both the white canvas variables and `--about-env-opacity`, because all of those keys are inside `ABOUT_THEME_VARS` (`components/about/AboutEnvironmentLifecycle.ts:10-24`).
- `--about-env-opacity` affects filtered/backdrop surfaces, because About glow opacity uses it and About glass opacity uses it (`components/about/AboutEnvironment.tsx:11-25`, `components/about/AboutEnvironment.tsx:31-60`).

### Not provable from source alone

- The exact callback ordering between the transition layer's exit ScrollTrigger and `PinnedSections` lifecycle ScrollTrigger cannot be proven statically, because both are separate `ScrollTrigger` instances targeting `#about-section` with overlapping `top 20%` -> `top -5%` ranges (`components/transitions/EnvironmentTransitionLayer.tsx:91-113`, `components/sections/PinnedSections.tsx:119-140`).
- The exact rendered frame where `gsap.to('html', ABOUT_THEME_VARS)` visually completes cannot be proven statically, because the tween is time-based with `duration: 0.3` and not tied to a scrubbed ScrollTrigger (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/about/AboutEnvironmentLifecycle.ts:51-56`).
- Whether a one-frame compositor artifact appears at unmount cannot be proven from source alone, because React conditional removal and GSAP cleanup are visible in source but browser compositor retention is runtime-specific (`components/sections/PinnedSections.tsx:185-193`, `components/transitions/EnvironmentTransitionLayer.tsx:115-118`).

## 4. Candidate Activation Points

| Candidate | Source anchor | Safety assessment |
|---|---:|---|
| Current handoff: entry progress `0.85` | `components/transitions/EnvironmentTransitionLayer.tsx:58-62` | Too early for bundled activation. It starts global white/About atmosphere around entry progress `0.85`, while About content is still gated until lifecycle completion (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/about/AboutController.ts:45-53`, `components/sections/PinnedSections.tsx:132-135`). |
| Entry end: `#about-section top 35%` | `components/transitions/EnvironmentTransitionLayer.tsx:40-43` | Safer than current because it waits for the entry trigger to complete, but it is still before exit fade and before content gate release (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `components/about/AboutController.ts:45-53`). |
| Exit start: `#about-section top 20%` | `components/transitions/EnvironmentTransitionLayer.tsx:91-99` | Best bounded source-level point for current choreography. It is after card full coverage work has completed on the entry timeline and before the exit fade starts revealing the underlying About canvas (`components/transitions/EnvironmentTransitionLayer.tsx:75-89`, `components/transitions/EnvironmentTransitionLayer.tsx:91-99`). |
| Exit end / transition complete: `#about-section top -5%` | `components/sections/PinnedSections.tsx:119-140` | Too late for the current bundled background activation. The transition overlay opacity fades from `top 20%` to `top -5%`, so delaying `--color-bg` until `top -5%` risks revealing a non-About background during the fade (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `app/globals.css:33-40`, `components/sections/About.tsx:12-29`). |
| About content gate release | `components/about/AboutController.ts:121-129` | Safest for content animation but too late for background preparation if `--color-bg` remains bundled with `--about-env-opacity` (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/transitions/EnvironmentTransitionLayer.tsx:91-99`). |

## 5. Safest Activation Window

The safest source-level activation window is after entry coverage is complete and before exit fade begins.

Evidence:
- Entry coverage completes by timeline position `0.85`, because coverage opacity runs at `0.75` for `0.1` duration and current handoff checks `self.progress >= 0.85` (`components/transitions/EnvironmentTransitionLayer.tsx:83-89`, `components/transitions/EnvironmentTransitionLayer.tsx:58-62`).
- Exit fade begins at `#about-section top 20%`, because the exit tween ScrollTrigger starts there (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`).
- About content remains gated until lifecycle completion, because `AboutController` forces `aboutTl.progress(0)` while `isTransitionComplete` is false and `PinnedSections` sets transition complete on lifecycle `onLeave` (`components/about/AboutController.ts:45-53`, `components/sections/PinnedSections.tsx:132-135`).

Within that window, the latest safe source-level point is exit start: `#about-section top 20%`.

Reasoning:
- Triggering later than `top 20%` can expose the underlying About canvas while `--color-bg` is not yet white, because the transition layer opacity tween begins at `top 20%` and the About canvas uses `var(--color-bg)` (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `components/sections/About.tsx:12-29`).
- Triggering earlier than needed increases the duration where About atmosphere can be active while content is still locked, because `--about-env-opacity` is bundled with the same activation as `--color-bg` and content remains gated until transition complete (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/about/AboutController.ts:45-53`, `components/sections/PinnedSections.tsx:132-135`).
- Exact visual completion of the 0.3s CSS variable tween relative to the scrubbed exit fade cannot be proven statically, because activation is time-based while exit opacity is scroll-scrubbed (`components/about/AboutEnvironmentLifecycle.ts:21-24`, `components/transitions/EnvironmentTransitionLayer.tsx:91-99`).

## 6. Risk Notes for Current Bundled Activation

- `--color-bg` and `--about-env-opacity` cannot currently be timed independently, because both are part of `ABOUT_THEME_VARS` and are applied together in `activate()` (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/about/AboutEnvironmentLifecycle.ts:51-56`).
- The white canvas needs to be prepared before the exit fade reveals the underlying About layer, because the exit layer opacity starts decreasing at `top 20%` and About uses `backgroundColor: var(--color-bg)` (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `components/sections/About.tsx:12-29`).
- The atmospheric About layers are safer later than the background, because glow/glass opacity comes from `--about-env-opacity` and those surfaces include `filter: blur(100px)` and `backdropFilter: blur(24px)` (`components/about/AboutEnvironment.tsx:11-25`, `components/about/AboutEnvironment.tsx:31-60`).
- With the current bundle, moving activation to transition-complete would protect against early atmosphere but risks breaking the white fade choreography, because `--color-bg` would also be delayed until after the exit fade window (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/transitions/EnvironmentTransitionLayer.tsx:91-99`).

## 7. Finding

The current activation point is source-level too early for the bundled environment activation. It fires at entry progress `0.85`, before the entry trigger ends and well before the exit/content-complete boundary (`components/transitions/EnvironmentTransitionLayer.tsx:40-62`, `components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `components/sections/PinnedSections.tsx:119-140`).

The safest source-level point for the current single bundled activation is the start of the exit window: `#about-section top 20%`. This is the latest point before the transition overlay begins fading and revealing the underlying About canvas (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `components/sections/About.tsx:12-29`).

The safest conceptual choreography is split timing: prepare only the white background before or at exit start, then delay About atmospheric opacity until transition completion. This cannot be achieved with the current `activate()` shape without changing implementation, because `--color-bg` and `--about-env-opacity` are bundled in the same `ABOUT_THEME_VARS` object (`components/about/AboutEnvironmentLifecycle.ts:10-24`, `components/about/AboutEnvironmentLifecycle.ts:51-56`).

## 8. Unknowns Requiring Runtime Evidence

- The exact visual frame where the white canvas becomes visible cannot be proven from source alone, because the exit tween is scroll-scrubbed while CSS variable activation is time-based (`components/transitions/EnvironmentTransitionLayer.tsx:91-99`, `components/about/AboutEnvironmentLifecycle.ts:21-24`).
- The exact order of callbacks at the `top 20%` and `top -5%` thresholds cannot be proven from source alone, because independent ScrollTriggers are created in separate components for the same target/range (`components/transitions/EnvironmentTransitionLayer.tsx:91-113`, `components/sections/PinnedSections.tsx:119-140`).
- The exact source of the grey band cannot be proven by this audit, because this report did not run visual capture or browser layer inspection.
