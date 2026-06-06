# Core Contract Definitions

## ARCH-001

Status:

```txt
Contract specification only.
No runtime implementation.
No UI change.
No migration.
```

## Purpose

This document defines the foundational contracts future V2 systems will implement.

The contracts establish:

- ownership boundaries
- lifecycle expectations
- communication rules
- consumer mapping

This document does not create runtime managers, orchestrators, services, or abstractions.

## Shared Types

The following names are conceptual contract types. They are not implemented in runtime code in ARCH-001.

```ts
type SceneId = 'hero' | 'about' | 'work' | 'contact';

type TransitionId = 'eclipse';

type ExperienceMode =
  | 'HERO_MODE'
  | 'ABOUT_MODE'
  | 'WORK_MODE'
  | 'ECLIPSE_MODE'
  | 'CONTACT_MODE';

type LifecycleResult = void | Promise<void>;

type Direction = 'forward' | 'reverse';
```

## ExperienceDirector Contract

### Responsibility

`ExperienceDirector` is the experience-state authority.

It does not animate, render, scroll, or mutate scene DOM.

### Owned Data

```txt
currentScene
previousScene
currentTransition
currentMode
direction
interactionPermissions
overlayState
rendererState
performanceMode
globalExperienceState
```

### Public API

Conceptual interface:

```ts
type ExperienceDirectorContract = {
  getCurrentScene(): SceneId;
  getPreviousScene(): SceneId | null;
  getCurrentTransition(): TransitionId | null;
  getCurrentMode(): ExperienceMode;

  registerScene(scene: SceneModuleContract): void;
  registerTransition(transition: TransitionModuleContract): void;

  setMode(mode: ExperienceMode): void;
  requestScene(sceneId: SceneId, options?: { transition?: TransitionId }): LifecycleResult;
  setInteractionPermissions(permissions: InteractionPermissions): void;
  getInteractionPermissions(): InteractionPermissions;

  notifyScrollState(state: ScrollStateSnapshot): void;
  destroy(): void;
};
```

Supporting conceptual types:

```ts
type InteractionPermissions = {
  pointer: boolean;
  hover: boolean;
  drag: boolean;
  keyboard: boolean;
};

type ScrollStateSnapshot = {
  progress: number;
  direction: Direction;
  velocity: number;
};
```

### Forbidden Responsibilities

`ExperienceDirector` must not:

- animate scene elements
- create GSAP timelines for scene internals
- own DOM refs
- own Canvas or WebGL render loops
- read raw pointer movement
- own ScrollTrigger
- know internal class names of scenes

### Communication Rules

Allowed:

```txt
ScrollOrchestrator → ExperienceDirector
ExperienceDirector → Scene lifecycle
ExperienceDirector → Transition lifecycle
ExperienceDirector → Overlay permission state
ExperienceDirector → Renderer activation policy
ExperienceDirector → Interaction permissions
```

Forbidden:

```txt
ExperienceDirector → direct DOM animation
ExperienceDirector → renderer frame loop internals
ExperienceDirector → scene class selectors
ExperienceDirector → component layout state
```

### Consumer Mapping

```txt
Current Consumer:
- None as runtime system.
- Current equivalent responsibilities are partially embedded in PinnedSections.tsx.

Future Consumer:
- ScrollOrchestrator
- SceneOrchestrator
- TransitionOrchestrator
- OverlayOrchestrator
- RendererRegistry
- InteractionRegistry

Migration Target:
- Extract mode and activation decisions currently living in PinnedSections.tsx.
```

## Scene Contract

### Responsibility

A scene owns its own visual content, animation internals, local interactions, local renderers, and cleanup.

Scenes do not own other scenes.

Scenes do not own transitions.

### Required Lifecycle

Conceptual interface:

```ts
type SceneModuleContract = {
  id: SceneId;

  prepare(context: SceneLifecycleContext): LifecycleResult;
  enter(context: SceneLifecycleContext): LifecycleResult;
  activate(context: SceneLifecycleContext): LifecycleResult;
  pause(context: SceneLifecycleContext): LifecycleResult;
  resume(context: SceneLifecycleContext): LifecycleResult;
  exit(context: SceneLifecycleContext): LifecycleResult;
  destroy(): LifecycleResult;
};
```

Context:

```ts
type SceneLifecycleContext = {
  direction: Direction;
  mode: ExperienceMode;
  reducedMotion: boolean;
  performanceMode: 'high' | 'medium' | 'low' | 'off';
};
```

### Lifecycle Meanings

```txt
prepare()
- cache refs
- create paused timelines
- set initial states
- initialize local renderer resources
- must not reveal or activate interaction

enter()
- play scene-owned entrance
- may start local reveal timelines
- must not animate another scene

activate()
- enable local pointer events
- enable local interactions
- resume local renderer if allowed

pause()
- freeze expensive work
- pause local renderers
- disable nonessential listeners
- preserve state

resume()
- resume from pause
- must not replay entrance

exit()
- play scene-owned exit
- disable interactions before or during exit
- must not trigger next scene directly

destroy()
- kill timelines
- remove listeners
- disconnect observers
- destroy local renderers
```

### Optional Capabilities

Scenes may optionally expose:

```ts
type SceneOptionalCapabilities = {
  getStatus?(): 'idle' | 'prepared' | 'entering' | 'active' | 'paused' | 'exiting' | 'destroyed';
  getRenderers?(): RendererModuleContract[];
  getInteractions?(): InteractionSystemContract[];
};
```

### Ownership Rules

Allowed:

- scene-owned GSAP timelines
- scene-owned local interaction setup
- scene-owned local renderer setup
- scene-owned DOM refs

Forbidden:

- raw ScrollTrigger progress consumption
- animation of another scene
- transition orchestration
- global overlay mutation
- global performance policy decisions

### Consumer Mapping

```txt
Current Consumer:
- Hero.tsx
- About.tsx
- ProjectShowcase.tsx / ProjectCard.tsx
- Contact.tsx
- PinnedSections.tsx currently acts as external owner for many scene internals.

Future Consumer:
- SceneOrchestrator
- ExperienceDirector

Migration Target:
- HeroScene
- AboutScene
- WorkScene
- ContactScene
```

## Transition Contract

### Responsibility

A transition bridges scenes.

It owns the transition visual object and transition timeline only.

It never owns scene content.

### Required Lifecycle

Conceptual interface:

```ts
type TransitionModuleContract = {
  id: TransitionId;

  prepare(context: TransitionLifecycleContext): LifecycleResult;
  enter(context: TransitionLifecycleContext): LifecycleResult;
  covered(): boolean;
  exit(context: TransitionLifecycleContext): LifecycleResult;
  complete(context: TransitionLifecycleContext): LifecycleResult;
  destroy(): LifecycleResult;
};
```

Context:

```ts
type TransitionLifecycleContext = {
  from: SceneId;
  to: SceneId;
  direction: Direction;
  reducedMotion: boolean;
};
```

### Lifecycle Meanings

```txt
prepare()
- set transition object initial state
- create transition timeline
- must not prepare scene internals

enter()
- play transition into coverage
- may emit covered state when viewport is fully taken over

covered()
- returns whether transition has fully covered the scene
- should be deterministic

exit()
- release transition from coverage
- may play reverse or outgoing transition timeline

complete()
- mark transition as complete
- release transition-owned visual resources if appropriate

destroy()
- kill transition timelines
- remove transition listeners
- cleanup transition-owned objects
```

### Ownership Rules

Allowed:

- transition object DOM/ref
- transition timeline
- transition direction
- transition coverage state

Forbidden:

- scene typography animation
- scene hover animation
- scene renderer control
- scene content visibility decisions beyond lifecycle events
- direct mutation of unrelated sections

### Communication Rules

Allowed:

```txt
ExperienceDirector calls transition lifecycle.
Transition reports covered / complete.
ExperienceDirector decides scene activation.
```

Forbidden:

```txt
Transition directly calls next scene enter.
Transition animates scene internals.
Transition reads raw ScrollTrigger progress.
```

### Consumer Mapping

```txt
Current Consumer:
- Eclipse behavior currently lives in PinnedSections.tsx as .debug-circle timeline.

Future Consumer:
- TransitionOrchestrator
- ExperienceDirector

Migration Target:
- EclipseTransition
```

## Renderer Contract

### Responsibility

A renderer owns drawing and render-loop work for a visual system.

Renderer examples:

```txt
Canvas
WebGL
ASCII
Fluid
Particle
Shader
```

### Required Lifecycle

Conceptual interface:

```ts
type RendererModuleContract = {
  id: string;
  type: 'canvas' | 'webgl' | 'ascii' | 'fluid' | 'particles' | 'shader';

  initialize(context: RendererLifecycleContext): LifecycleResult;
  activate(): LifecycleResult;
  pause(): LifecycleResult;
  resume(): LifecycleResult;
  resize(size: RendererSize): LifecycleResult;
  setQuality(quality: RendererQuality): LifecycleResult;
  destroy(): LifecycleResult;
};
```

Supporting types:

```ts
type RendererLifecycleContext = {
  ownerScene?: SceneId;
  ownerOverlay?: string;
  reducedMotion: boolean;
  quality: RendererQuality;
};

type RendererSize = {
  width: number;
  height: number;
  dpr: number;
};

type RendererQuality = 'high' | 'medium' | 'low' | 'off';
```

### Activation Policy

```txt
initialize()
- allocate resources
- bind canvas/webgl/ascii target
- do not start expensive loop unless required

activate()
- start or resume draw loop
- only if owner scene or overlay is allowed

pause()
- stop draw loop
- preserve state

resume()
- restart draw loop without reinitializing

resize()
- update dimensions and DPR
- respect performance quality

setQuality()
- adjust resolution, particles, shader complexity, or feature level

destroy()
- release resources
- cancel RAF
- dispose WebGL resources
```

### Performance Constraints

Renderers must:

- pause when inactive
- obey reduced motion
- obey quality policy
- avoid duplicate RAF loops
- expose cleanup

Renderers must not:

- decide scene activation
- own global performance policy
- mutate ExperienceDirector
- run indefinitely while hidden

### Consumer Mapping

```txt
Current Consumer:
- Hero fluid canvas behavior.
- Future Contact / ASCII / WebGL systems not implemented yet.

Future Consumer:
- Scene-owned renderers
- Overlay-owned renderers
- PerformanceDirector

Migration Target:
- HeroFluidRenderer first likely real consumer.
```

## Interaction Contract

### Responsibility

An interaction system interprets input and emits intent.

It does not own rendering.

It does not own scene lifecycle.

### Required Lifecycle

Conceptual interface:

```ts
type InteractionSystemContract = {
  id: string;
  type: 'cursor' | 'magnetic' | 'hover-field' | 'pointer-reaction' | 'fluid-hover' | 'gesture';

  initialize(context: InteractionLifecycleContext): LifecycleResult;
  activate(): LifecycleResult;
  deactivate(): LifecycleResult;
  destroy(): LifecycleResult;
};
```

Context:

```ts
type InteractionLifecycleContext = {
  ownerScene?: SceneId;
  ownerOverlay?: string;
  permissions: InteractionPermissions;
  target?: HTMLElement;
};
```

### Ownership Rules

Allowed:

- pointer interpretation
- hover proximity calculations
- gesture state
- magnetic field math
- event listener ownership
- intent events

Forbidden:

- renderer draw loop ownership
- scene lifecycle mutation
- transition lifecycle mutation
- direct global mode changes
- animation of unrelated DOM

### Scene Integration

Scenes may own local interaction systems.

Example:

```txt
ContactScene owns contact wordmark hover field.
HeroScene owns fluid pointer interaction adapter.
```

### Renderer Integration

Interactions communicate with renderers through adapters or explicit methods.

Allowed:

```txt
FluidHoverInteraction → HeroFluidRenderer.disturb()
PointerFieldInteraction → CanvasRenderer input adapter
```

Forbidden:

```txt
Interaction creates renderer.
Interaction controls renderer lifecycle globally.
```

### Consumer Mapping

```txt
Current Consumer:
- Custom cursor concept.
- Hero fluid pointer movement.
- Contact wordmark hover sweep.
- Utility link hover wave.

Future Consumer:
- InteractionRegistry
- Scene-owned interaction adapters
- Renderer input adapters

Migration Target:
- ContactHoverField
- HeroFluidInteraction
- CursorInteraction
```

## Communication Boundary Summary

Allowed:

```txt
ScrollOrchestrator → ExperienceDirector
ExperienceDirector → Scene lifecycle
ExperienceDirector → Transition lifecycle
ExperienceDirector → Interaction permissions
ExperienceDirector → Renderer activation policy
Scene → own renderers
Scene → own interactions
Transition → coverage state
Renderer → render output only
Interaction → input intent only
```

Forbidden:

```txt
Scene → Scene
Scene → raw ScrollTrigger
Transition → scene internals
Renderer → ExperienceDirector mutation
Interaction → direct lifecycle mutation
Overlay → scene internals
Component → global timeline mutation
```

## ARCH-001 First-Consumer Plan

The first consumer should not be a full runtime manager.

Recommended first consumer:

```txt
EclipseTransition contract mapping
```

Reason:

- Current Eclipse behavior is already isolated conceptually.
- Current implementation still lives in `PinnedSections.tsx`.
- It is a known refactor target.
- It can validate `TransitionModuleContract` without changing UI design.

Second likely consumer:

```txt
ContactScene lifecycle mapping
```

Reason:

- Contact already has clear scene-owned systems:
  - JUSTCHANIAGO reveal
  - hover sweep
  - utility link hover
  - metadata
- It should stop depending on parent orchestration for internal behavior.

Renderer first consumer:

```txt
HeroFluidRenderer
```

Reason:

- Hero already has a canvas-like fluid interaction direction.
- Renderer lifecycle can be validated without introducing WebGL.

Interaction first consumer:

```txt
ContactHoverField
```

Reason:

- Existing wordmark hover sweep is clearly an interaction system.
- It has pointer state, geometry caching, energy decay, and visual output boundaries.

## ARCH-001 Risks

```txt
Risk: Contracts become empty architecture.
Mitigation: Do not implement runtime managers yet. Pair each contract with an identified real consumer.

Risk: Contracts are too broad.
Mitigation: Keep lifecycle minimal and map only approved systems.

Risk: Future agents treat contracts as implementation.
Mitigation: This document is contract specification only.

Risk: PinnedSections continues to accumulate behavior.
Mitigation: Mark PinnedSections as REFACTOR_TARGET and avoid adding behavior there during ARCH-001.
```

## ARCH-001 Completion Status

```txt
All required contracts are defined.
Lifecycle expectations are documented.
Ownership rules are documented.
Communication rules are documented.
Consumer mapping exists.
No runtime code changed.
No UI changed.
No visual behavior changed.
No speculative managers created.
```
