# HOTFIX-TRANSITION-001 VERIFY

## Diff Summary

### `components/about/AboutEnvironmentLifecycle.ts`

- Split the former bundled environment variables into `ABOUT_BACKGROUND_VARS` and `ABOUT_ATMOSPHERE_VARS` (`components/about/AboutEnvironmentLifecycle.ts:10-22`).
- Added guarded `activateBackground()` for `--color-bg`, `--color-text-1`, and `--color-card-bg` only (`components/about/AboutEnvironmentLifecycle.ts:40-60`).
- Added guarded `activateAtmosphere()` for `--about-env-opacity` only (`components/about/AboutEnvironmentLifecycle.ts:63-79`).
- Kept `activate()` for compatibility and made it call both split methods when no timeline option is passed (`components/about/AboutEnvironmentLifecycle.ts:82-90`).
- Updated `deactivate()` and `destroy()` to manage both split tweens (`components/about/AboutEnvironmentLifecycle.ts:92-113`).

### `components/transitions/EnvironmentTransitionLayer.tsx`

- Removed the entry ScrollTrigger `onUpdate` progress `0.85` handoff path, so `onEnvironmentHandoff` is no longer called during entry coverage (`components/transitions/EnvironmentTransitionLayer.tsx:36-55`).
- Added `onStart` to the exit tween so `onEnvironmentHandoff` fires when the exit tween starts at `#about-section top 20%` (`components/transitions/EnvironmentTransitionLayer.tsx:77-88`).
- Preserved the exit tween ScrollTrigger range, visibility callbacks, scrub setting, and animation values (`components/transitions/EnvironmentTransitionLayer.tsx:77-101`).

### `components/sections/PinnedSections.tsx`

- Changed `handleEnvironmentHandoff` to call `activateBackground()` instead of bundled `activate()` (`components/sections/PinnedSections.tsx:30-32`).
- Added `activateAtmosphere()` inside lifecycle `onLeave`, alongside transition completion (`components/sections/PinnedSections.tsx:132-135`).
- Preserved the existing transition-complete state/controller logic around the added atmosphere call (`components/sections/PinnedSections.tsx:132-135`).

## Verification Checklist

| Check | Result | Evidence |
|---|---|---|
| `ABOUT_THEME_VARS` no longer exists as a single bundled object | PASS | `rg "ABOUT_THEME_VARS"` returns no matches. New split objects are at `components/about/AboutEnvironmentLifecycle.ts:10-22`. |
| `activateBackground()` only sets `--color-bg`, `--color-text-1`, `--color-card-bg` | PASS | `ABOUT_BACKGROUND_VARS` contains only those CSS variables plus `ease`/`duration` (`components/about/AboutEnvironmentLifecycle.ts:10-16`). |
| `activateAtmosphere()` only sets `--about-env-opacity` | PASS | `ABOUT_ATMOSPHERE_VARS` contains only `--about-env-opacity` plus `ease`/`duration` (`components/about/AboutEnvironmentLifecycle.ts:18-22`). |
| `activate()` still works if called | PASS | `activate()` calls `this.activateBackground()` and `this.activateAtmosphere()` when no timeline option is provided (`components/about/AboutEnvironmentLifecycle.ts:82-90`). |
| `onEnvironmentHandoff` is no longer called at progress `0.85` | PASS | The entry ScrollTrigger no longer has an `onUpdate` callback or progress `0.85` handoff (`components/transitions/EnvironmentTransitionLayer.tsx:36-55`). |
| `onEnvironmentHandoff` is called at exit start (`top 20%`) via `onStart` | PASS | Exit tween has `onStart: () => onEnvironmentHandoff?.()` and its ScrollTrigger starts at `top 20%` (`components/transitions/EnvironmentTransitionLayer.tsx:77-88`). |
| `activateAtmosphere()` is called in `onLeave` alongside `setTransitionComplete(true)` | PASS | `onLeave` calls `setIsTransitionComplete(true)`, then `activateAtmosphere()`, then `aboutController.setTransitionComplete(true)` (`components/sections/PinnedSections.tsx:132-135`). |
| No other call sites of `activate()` exist that would break | PASS | About environment `activate()` is still referenced by `AboutController` with a timeline option, which remains supported as a no-op gate (`components/about/AboutController.ts:75`, `components/about/AboutEnvironmentLifecycle.ts:82-86`). |
| `reset()` / `deactivate()` still resets all managed variables | PASS | `deactivate()` reverses both background and atmosphere tweens, including the tween that owns `--about-env-opacity` (`components/about/AboutEnvironmentLifecycle.ts:92-95`). |

## Deviations

None.

## Static Verification

- `npx tsc --noEmit`: PASS.

## Files Not Modified But Potentially Affected

- `components/about/AboutController.ts`: still calls `environment.activate({ timeline: aboutTl, position: 0.1 })`, which remains a gated no-op for timeline-based activation (`components/about/AboutController.ts:75`, `components/about/AboutEnvironmentLifecycle.ts:82-86`).
- `components/about/AboutEnvironment.tsx`: consumes `--about-env-opacity`, now activated after transition completion instead of with background activation (`components/about/AboutEnvironment.tsx:11-25`, `components/about/AboutEnvironment.tsx:31-60`).
- `components/sections/About.tsx`: consumes `--color-bg`, now prepared by `activateBackground()` at exit start (`components/sections/About.tsx:12-29`, `components/sections/PinnedSections.tsx:30-32`).
- `app/globals.css`: initial values remain unchanged and are still the reverse targets for the split GSAP tweens (`app/globals.css:3-40`).
