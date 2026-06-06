# Portfolio V2 Motion Architecture Proposal

## Branch

Dedicated planning branch:

```txt
agency-motion-architecture
```

No implementation refactor was performed for this proposal.

## Current Architecture Map

Current system is centralized around `PinnedSections.tsx`.

```txt
PinnedSections
├─ owns master ScrollTrigger
├─ owns scene visibility
├─ owns Hero/About/Work/Contact activation
├─ owns Work project timeline
├─ owns Eclipse timing
├─ partially owns Contact reveal
└─ publishes global scrollTriggerProgress
```

Current coupling:

```txt
ScrollTrigger progress
├─ Hero exit
├─ About reveal/exit
├─ Work intro
├─ Project card morphs
├─ Project expansion attrs
├─ Eclipse circle
├─ Contact activation
├─ NavRail active state
├─ MorphNav active state
└─ previously Contact wordmark reveal
```

Global overlays:

- `CustomCursor`: independent concept, but reads DOM cursor attributes.
- `LoaderWrapper` / `Loader`: app-level boot sequence.
- Hero fluid canvas: currently owned by Hero, but behaves like an interactive scene system.

Motion ownership today:

- Most scroll motion belongs to `PinnedSections`.
- `ProjectCard` owns some local interaction motion.
- `Contact` owns hover systems.
- Navigation consumes global progress.

Main risk:

```txt
PinnedSections is becoming a god timeline.
It knows too much about every scene's internal class names.
```

## Scene Architecture

Target scenes:

```txt
HeroScene
AboutScene
WorkScene
ContactScene
```

Each scene should expose a lifecycle contract:

```ts
scene.prepare()
scene.enter()
scene.active()
scene.exit()
scene.destroy()
```

Each scene owns:

- DOM refs
- internal reveals
- hover systems
- local canvas/WebGL systems
- activation/deactivation
- cleanup

Scenes should not:

- animate other scenes
- know transition implementation
- read raw global scroll progress directly unless explicitly subscribed

Scene responsibilities:

```txt
HeroScene
- Owns fluid canvas
- Owns hero typography intro
- Owns hero pointer interaction

AboutScene
- Owns portrait
- Owns editorial text
- Owns portrait hover zone
- Owns internal portrait state

WorkScene
- Owns Work intro
- Owns project stack
- Owns project card lifecycle
- Exposes final-project-ready state

ContactScene
- Owns JUSTCHANIAGO
- Owns utility links
- Owns metadata
- Owns contact hover sweep
```

## Transition Architecture

Dedicated transitions:

```txt
EclipseTransition
FuturePageTransition
FutureSceneTransition
```

Transition rules:

- A transition bridges scenes.
- A transition never owns scene content.
- A transition may request scene states, but should not animate scene internals.
- Transition output is stateful: `idle`, `entering`, `covered`, `exiting`, `complete`.

For Work to Contact:

```txt
WorkScene active
↓
EclipseTransition.enter()
↓
EclipseTransition.covered
↓
WorkScene.deactivate()
↓
ContactScene.enter()
```

Reverse:

```txt
ContactScene.exit()
↓
EclipseTransition.covered
↓
EclipseTransition.reverse()
↓
WorkScene.activate()
```

## Motion System

Create reusable primitives instead of bespoke GSAP calls everywhere:

```txt
motion/primitives
├─ revealUp
├─ fadeIn
├─ fadeOut
├─ characterReveal
├─ maskReveal
├─ scaleIn
├─ scaleOut
├─ parallax
├─ float
├─ blurIn
└─ timelineGroup
```

Each primitive should define:

- accepted element/ref
- default duration
- default ease
- cleanup behavior
- reduced-motion fallback

Example ownership:

```txt
ContactScene uses characterReveal
WorkScene uses maskReveal
AboutScene uses revealUp + blurIn
EclipseTransition uses transition primitive
```

## Global Overlays

Independent systems:

```txt
overlays/
├─ CursorOverlay
├─ LoaderOverlay
├─ NoiseOverlay
├─ FutureParticleOverlay
├─ FutureCanvasOverlay
└─ FutureWebGLLayer
```

Rules:

- Overlays are app-level systems.
- They do not belong to a scene.
- They may react to scene state through a scene registry.
- They should not inspect arbitrary DOM except through defined attributes or events.

## Scroll Ownership

Target:

```txt
ScrollOrchestrator owns scroll.
Scenes consume scene state.
Transitions consume transition state.
Navigation consumes active scene.
```

Avoid:

```txt
Every component reads raw ScrollTrigger progress.
```

Recommended flow:

```txt
ScrollTrigger
↓
ScrollOrchestrator
↓
SceneStateStore
├─ activeScene
├─ sceneProgress
├─ transitionState
└─ direction
↓
Scenes / Transitions / Navigation
```

Who should consume raw scroll:

- `ScrollOrchestrator` only.

Who should not consume raw scroll:

- Contact wordmark
- utility links
- hover systems
- CustomCursor
- ProjectCard internals, except through WorkScene state

## Eclipse Refactor Strategy

Future structure:

```txt
WorkScene
↓
EclipseTransition
↓
ContactScene
```

Activation order:

```txt
1. WorkScene remains active.
2. EclipseTransition starts.
3. EclipseTransition reaches covered.
4. WorkScene deactivates.
5. ContactScene prepares.
6. ContactScene enters.
```

Reverse:

```txt
1. ContactScene exits.
2. EclipseTransition returns to covered black.
3. EclipseTransition reverses.
4. WorkScene reactivates.
```

Timing strategy:

- Eclipse uses its own timeline.
- Contact uses its own timeline.
- Work uses its own timeline.
- Orchestrator only decides when one phase starts.

## Future Scalability Audit

This architecture supports:

- ASCII Hand as `systems/ascii-hand`
- Canvas as scene-owned or overlay-owned renderer
- WebGL as isolated renderer with lifecycle
- Fluid hover as scene-local interaction system
- Magnetic interactions as shared interaction primitive
- More sections as new scenes
- More transitions as transition modules
- Advanced typography as reusable typography systems

The key scalability win:

```txt
New experiments attach to scene lifecycle,
not the master scroll timeline.
```

## File Structure Proposal

Future shape:

```txt
src/
├─ app/
├─ scenes/
│  ├─ hero/
│  ├─ about/
│  ├─ work/
│  └─ contact/
├─ transitions/
│  └─ eclipse/
├─ motion/
│  ├─ primitives/
│  ├─ timelines/
│  └─ eases/
├─ overlays/
│  ├─ cursor/
│  ├─ loader/
│  └─ noise/
├─ systems/
│  ├─ fluid/
│  ├─ typography/
│  ├─ magnetic/
│  └─ webgl/
├─ orchestrators/
│  ├─ ScrollOrchestrator.ts
│  └─ SceneOrchestrator.ts
├─ hooks/
├─ data/
└─ shared/
```

Reasoning:

- `scenes` own experience blocks.
- `transitions` bridge scenes.
- `motion` stores reusable animation language.
- `systems` stores reusable interactive engines.
- `overlays` stores app-level visual layers.
- `orchestrators` coordinate without owning visual internals.

## Motion Ownership Model

```txt
ScrollOrchestrator
- Owns scroll input
- Owns normalized progress
- Emits scene/transition state

SceneOrchestrator
- Owns active scene
- Calls scene lifecycle methods

Scene
- Owns internal animation
- Owns local interaction
- Owns local renderer

Transition
- Owns transition object only
- Never owns scene content

Overlay
- Owns persistent global UI/rendering

Motion primitives
- Own reusable animation recipes
```

## Performance Strategy

DOM:

- Keep scene DOM mounted only when needed or inert when inactive.
- Avoid querying global selectors from orchestration.
- Prefer refs or scene registration.

GSAP:

- Use `gsap.context()` per scene/system.
- Kill timelines on scene destroy.
- Avoid one huge master timeline for all future motion.
- Use named local timelines.

ScrollTrigger:

- One top-level scroll owner.
- Avoid many components creating independent ScrollTriggers unless isolated.
- Avoid raw progress listeners in scenes.

GPU:

- Prefer `transform` and `opacity`.
- Avoid animating layout properties when possible.
- Avoid filter/blur during long scrubbed sequences.
- Use `will-change` only while active.

Rendering priority:

```txt
Active scene: full quality
Transition: full quality
Inactive scene: paused/inert
Overlay: always-on but cheap
Canvas/WebGL: pause when inactive
```

## Migration Roadmap

Phase 1: Inventory and Contracts

- Define scene lifecycle contract.
- Document current class-name dependencies.
- No behavior changes.

Phase 2: Scene Ownership

- Extract Hero/About/Work/Contact scene controllers.
- Move internal reveals into scene-owned timelines.

Phase 3: Transition Ownership

- Extract Eclipse into `EclipseTransition`.
- Remove scene content animation from transition.

Phase 4: Scroll Orchestrator

- Replace raw `scrollTriggerProgress` consumption with scene state.
- Navigation consumes active scene, not raw progress.

Phase 5: Motion Primitives

- Extract repeated reveal/mask/character animations.
- Standardize easing and cleanup.

Phase 6: Overlay Layer

- Move cursor/loader/noise/future particles into overlay systems.

Phase 7: Performance Layer

- Add scene activation/deactivation policies.
- Pause inactive canvas/WebGL systems.

Phase 8: Feature Development Resumes

- Add ASCII/WebGL/fluid/magnetic systems using the new lifecycle.

## Success Criteria

The proposed architecture preserves:

- current UI
- current UX
- visual identity
- storytelling flow
- interaction language

It improves:

- motion ownership
- transition isolation
- maintainability
- future experimentation
- performance control
- reverse-scroll reliability

Core rule:

```txt
Scenes own scenes.
Transitions bridge scenes.
Scroll owns navigation through time.
No system controls another system's internals.
```
