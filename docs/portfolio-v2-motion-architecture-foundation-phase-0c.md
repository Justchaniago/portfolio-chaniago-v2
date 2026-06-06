# Portfolio V2 Motion Architecture Foundation

## Phase 0C: Foundation Specification

This document defines the final foundation required before the V2 refactor begins.

No implementation code is included in this document.

## ExperienceDirector

`ExperienceDirector` is the top-level runtime authority for the portfolio experience.

Owns:

```txt
currentScene
previousScene
currentTransition
currentMode
interactionPermissions
overlayState
rendererState
performanceMode
globalExperienceState
```

Never owns:

```txt
scene DOM
component layout
scene animation internals
transition visuals
renderer implementation
hover details
```

Communication:

```txt
ScrollOrchestrator → ExperienceDirector
ExperienceDirector → SceneOrchestrator
ExperienceDirector → TransitionOrchestrator
ExperienceDirector → OverlayOrchestrator
ExperienceDirector → RendererRegistry
ExperienceDirector → InteractionRegistry
ExperienceDirector → PerformanceDirector
```

Lifecycle:

```txt
initialize
↓
registerSystems
↓
setInitialMode
↓
receiveScrollState
↓
resolveExperienceState
↓
dispatchLifecycleEvents
↓
destroy
```

Responsibility matrix:

```txt
Scene selection              ExperienceDirector
Scroll progress              ScrollOrchestrator
Scene internals              Scene
Transition object            Transition
Renderer frame loop          Renderer
Pointer interpretation       Interaction System
Cursor / loader / noise      Overlay
Performance policy           PerformanceDirector
```

## Scene Lifecycle

Every future scene should implement:

```ts
prepare()
enter()
activate()
pause()
resume()
exit()
destroy()
```

Lifecycle rules:

```txt
prepare
- cache refs
- set initial states
- create paused timelines

enter
- play scene-owned entrance

activate
- enable interactions
- enable renderers

pause
- pause expensive work

resume
- resume without replaying entrance

exit
- play scene-owned exit

destroy
- kill timelines
- remove listeners
- disconnect observers
- destroy renderers
```

Forbidden:

```txt
Scene must not animate another scene.
Scene must not own transitions.
Scene must not consume raw ScrollTrigger progress directly.
```

Required interface:

```ts
type SceneModule = {
  id: SceneId;
  prepare(): void;
  enter(): Promise<void> | void;
  activate(): void;
  pause(): void;
  resume(): void;
  exit(): Promise<void> | void;
  destroy(): void;
};
```

## Transition Lifecycle

Every transition should implement:

```ts
prepare(from, to)
enter()
covered()
exit()
complete()
destroy()
```

Transition owns:

```txt
transition object
transition timeline
coverage state
direction
reversibility
```

Transition never owns:

```txt
scene typography
scene hover
scene content
scene renderer
```

Flow:

```txt
ExperienceDirector calls transition.enter()
↓
Transition emits covered
↓
ExperienceDirector exits old scene
↓
ExperienceDirector enters new scene
```

Required interface:

```ts
type TransitionModule = {
  id: TransitionId;
  prepare(from: SceneId, to: SceneId): void;
  enter(): Promise<void>;
  covered(): boolean;
  exit(): Promise<void>;
  complete(): void;
  destroy(): void;
};
```

## Renderer Lifecycle

Renderer contract:

```ts
initialize()
activate()
pause()
resume()
resize()
setQuality()
destroy()
```

Renderer types:

```txt
CanvasRenderer
WebGLRenderer
ASCIIRenderer
FluidRenderer
ParticleRenderer
ShaderRenderer
```

Rules:

```txt
Scene owns scene renderer.
Overlay owns global renderer.
PerformanceDirector owns budget.
ExperienceDirector owns activation permission.
Inactive renderers must pause.
```

Pause renderers when:

```txt
scene inactive
tab hidden
reduced motion enabled
mobile budget exceeded
transition requires visual silence
```

Renderer budgeting:

```txt
high: desktop, full effects
medium: reduced particles / resolution
low: mobile or thermal constraints
off: reduced motion / inactive
```

## Interaction System

Interactions are independent systems:

```txt
cursor
magnetic
hover-field
pointer-reaction
fluid-hover
gesture
```

Flow:

```txt
Pointer input
↓
Interaction System
↓
Scene Adapter / Renderer Adapter / Overlay Adapter
```

Rules:

```txt
Interactions do not render.
Renderers do not interpret intent.
Scenes decide local permissions.
ExperienceDirector can globally disable interactions during transitions.
```

## Motion Tokens

Motion tokens are required.

Structure:

```txt
motion/tokens/
├─ durations
├─ eases
├─ distances
├─ staggers
├─ scenePresets
├─ transitionPresets
└─ interactionPresets
```

Naming:

```txt
DURATION_FAST
DURATION_NORMAL
DURATION_SLOW
DURATION_HEAVY

EASE_SOFT
EASE_SHARP
EASE_HEAVY
EASE_ENTER
EASE_EXIT

DISTANCE_SMALL
DISTANCE_MEDIUM
DISTANCE_LARGE

STAGGER_TIGHT
STAGGER_NORMAL
STAGGER_EXPANDED
```

Standardize:

```txt
durations
eases
distances
staggers
reveal presets
transition presets
interaction timings
```

Keep flexible:

```txt
one-off art direction values
renderer-specific shader constants
scene-specific composition offsets
```

Rule:

```txt
Future animations should consume a shared motion language.
```

## Technology Ownership

Final model:

```txt
Hybrid architecture.
```

Ownership matrix:

```txt
System                     Primary Owner              Secondary Owner

Hero Scene                 GSAP                       React
Hero Fluid                 Native Canvas              Interaction System
About Scene                GSAP                       React
Work Scene                 GSAP                       React
Project Expansion          GSAP                       React state
Eclipse                    GSAP                       ExperienceDirector
Contact                    GSAP                       React
Hover Systems              GSAP / DOM / RAF           React
Interaction Systems        Native TypeScript          Scene adapters
Canvas Systems             Native Canvas              PerformanceDirector
WebGL Systems              Three.js / R3F             PerformanceDirector
Presence UI                Framer Motion optional     React
Experimental Systems       Dedicated system module    ExperienceDirector
```

Core rules:

```txt
GSAP owns choreography.
React owns structure and state.
Canvas/WebGL own rendering.
ExperienceDirector owns mode and state.
Framer Motion is optional for small UI presence, not core scene choreography.
```

## Performance Governance

`PerformanceDirector` should exist.

Owns:

```txt
device capability
reduced-motion policy
renderer budgets
quality level
active renderer count
frame-pressure policy
mobile policy
```

Policies:

```txt
Desktop high:
- full effects

Desktop normal:
- capped renderer DPR

Mobile:
- reduced particles
- lower DPR
- fewer simultaneous renderers

Reduced motion:
- simplified transitions
- no heavy autoplay renderers
```

Degradation order:

```txt
1. lower DPR
2. reduce particles
3. pause background systems
4. disable nonessential overlays
5. static fallback
```

## System Communication Map

Allowed architecture:

```txt
ScrollTrigger
↓
ScrollOrchestrator
↓
ExperienceDirector
├─ SceneOrchestrator
│  ├─ HeroScene
│  ├─ AboutScene
│  ├─ WorkScene
│  └─ ContactScene
├─ TransitionOrchestrator
│  └─ EclipseTransition
├─ OverlayOrchestrator
│  ├─ CursorOverlay
│  ├─ LoaderOverlay
│  └─ NoiseOverlay
├─ RendererRegistry
│  ├─ CanvasRenderer
│  ├─ WebGLRenderer
│  └─ ASCIIRenderer
├─ InteractionRegistry
│  ├─ MagneticSystem
│  ├─ HoverFieldSystem
│  └─ PointerReactionSystem
└─ PerformanceDirector
```

Forbidden dependencies:

```txt
Scene → Scene
Scene → raw ScrollTrigger
Transition → scene internals
Renderer → experience mutation
Interaction → direct lifecycle mutation
Overlay → scene internals
Component → global timeline mutation
```

Allowed dependencies:

```txt
Scene → own renderer
Scene → own interactions
Transition → ExperienceDirector events
Renderer → PerformanceDirector budget
Interaction → scene adapter
Overlay → ExperienceDirector state
Navigation → ExperienceDirector activeScene
```

## Final Agency Readiness Review

Scores:

```txt
Scene Ownership:              8.5/10
Transition Ownership:         8.5/10
Motion Ownership:             8/10
Technology Ownership:         8.5/10
Renderer Ownership:           8/10
Interaction Ownership:        8/10
Performance Governance:       8/10
Scalability:                  8.5/10
Maintainability:              8.5/10
Future Experimentation:       8.5/10
```

Strengths:

```txt
Clear ownership boundaries.
Scroll no longer acts as total experience authority.
Scenes can scale independently.
Transitions become reusable bridge modules.
Future Canvas/WebGL/ASCII systems have lifecycle rules.
Performance has governance before complexity expands.
```

Weaknesses:

```txt
More architecture overhead.
Requires disciplined implementation.
Initial migration will be slower.
Needs strong naming conventions and documentation.
```

Remaining risks:

```txt
Overengineering if abstractions are introduced before migration points are clear.
Timeline behavior can still drift if motion tokens are ignored.
Renderer lifecycle must be enforced consistently.
ExperienceDirector should stay orchestration-only, not become a new god object.
```

Final recommendation:

```txt
Implement foundation incrementally.
Do not build all abstractions upfront as empty architecture.
Start with contracts, then migrate one scene or transition at a time.
```

## Final Verdict

```txt
READY FOR IMPLEMENTATION
```

Justification:

The missing foundation layers are now defined:

```txt
ExperienceDirector
Scene lifecycle
Transition lifecycle
Renderer lifecycle
Interaction architecture
Motion tokens
Technology ownership
Performance governance
Communication boundaries
```

The architecture is strong enough to begin refactor planning and incremental implementation, as long as the first implementation phase is limited to contracts and orchestration boundaries, not visual redesign.
