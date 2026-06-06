# PORTFOLIO V2 REFACTOR OPERATING SYSTEM (AOS)

Version: 1.0

Status: MANDATORY

Applies To:

- Claude Code
- Codex
- Gemini CLI
- Cursor Agent
- Any future engineering agent

This document is the mandatory entry point for ALL work performed inside this repository.

No task may begin before this document has been read.

## Core Principle

Assume:

```txt
Agents have NO memory.
Agents do NOT know each other.
Agents do NOT share context.
Agents may disappear at any time.
Agents may hit usage limits.
Agents may continue work days later.
Agents may be replaced entirely.
```

Therefore:

```txt
Repository Documentation
=
System Memory
```

NOT:

```txt
Chat History
Conversation Context
Agent Memory
Human Memory
```

If something is not documented:

```txt
It does not exist.
```

## Project Mission

Current Status:

```txt
Portfolio V2

Approx. 40% Complete
```

This project is evolving from:

```txt
Portfolio Website
```

into:

```txt
Agency-Grade Interactive Experience Platform
```

The objective is:

```txt
Preserve UI
Preserve UX
Preserve Storytelling
Preserve Visual Language
Refactor Architecture
Refactor Ownership Model
Refactor Motion Foundation
```

This is NOT a redesign.

This is NOT a visual rewrite.

This is NOT a branding exercise.

## Branch Policy

ALL WORK MUST OCCUR ON:

```bash
architecture/v2-motion-refactor
```

Never work on:

```bash
main
```

Main branch remains stable.

## Golden Rule

Before ANY task:

Read documentation.

Never assume.

Never guess.

Never reconstruct context from code alone.

Documentation is the source of truth.

## Agent Startup Sequence

Before touching code:

Read documents in this exact order.

### Step 1

Read:

```txt
/docs/00-foundation/01_CONTEXT_BRIEF.md
```

Purpose:

Understand:

- project
- architecture
- mission
- current state

### Step 2

Read:

```txt
/docs/05-project-management/02_PROJECT_STATE.md
```

Purpose:

Understand:

- active sprint
- active phase
- active objective
- current blockers

### Step 3

Read:

```txt
/docs/05-project-management/03_TASK_REGISTRY.md
```

Purpose:

Identify:

- active task
- completed tasks
- task ownership
- priorities

### Step 4

Read:

```txt
/docs/04-handoffs/07_HANDOFF.md
```

Purpose:

Understand:

- most recent work
- latest progress
- next recommended action

### Step 5

Read:

```txt
/docs/01-governance/04_ARCHITECTURE_DECISIONS.md
```

ONLY the ADRs relevant to the task.

Do NOT re-review all ADRs.

Read only what affects current work.

### Step 6

Read relevant code.

Only after all previous steps are complete.

## Bootstrap Checklist

Before beginning work, answer:

```txt
Current Phase:
Current Sprint:
Current Branch:
Current Objective:
Current Active Task:
Last Completed Task:
Current Blockers:
Next Deliverable:
```

If unable to answer:

STOP.

Read documentation again.

## Repository Memory Model

The repository is the memory system.

Every important piece of information must exist in documentation.

Nothing important should live only in:

```txt
chat history
agent reasoning
temporary memory
conversation context
```

## Required Documents

### 01_CONTEXT_BRIEF.md

Purpose:

5-minute onboarding.

Contains:

```txt
Project Summary
Mission
Architecture Summary
Current Refactor Goal
Approved Foundations
Major Constraints
Current Milestone
```

### 02_PROJECT_STATE.md

Purpose:

Current repository state.

Contains:

```txt
Current Phase
Current Sprint
Current Objective
Current Status
Current Branch
Current Risks
Current Priorities
Next Actions
```

Only one active state exists.

### 03_TASK_REGISTRY.md

Purpose:

Track all tasks.

Example:

```txt
Task ID
Status
Priority
Dependencies
Owner Type
```

Statuses:

```txt
TODO
IN_PROGRESS
BLOCKED
DONE
CANCELLED
```

### 04_ARCHITECTURE_DECISIONS.md

Purpose:

ADR System.

Architecture decisions live here.

Example:

```txt
ADR-001
Decision
Reason
Alternatives
Tradeoffs
Status
```

Architecture decisions are immutable.

### 05_PROGRESS_LOG.md

Purpose:

Chronological history.

Tracks:

```txt
Date
Task
Completed Work
Files Modified
Result
Next Step
```

### 06_ISSUES_AND_RESOLUTIONS.md

Purpose:

Issue tracking.

Tracks:

```txt
Issue
Impact
Root Cause
Resolution
Status
Related Files
```

### 07_HANDOFF.md

Purpose:

Cross-agent continuity.

Contains:

```txt
Current Task
Progress
Completed
Remaining
Known Risks
Blockers
Recommended Next Action
```

Must never reference specific agents.

Use task-centric language.

## Architecture Foundations

The following architecture is approved.

Do NOT redesign without ADR supersession.

### ExperienceDirector

Owns:

```txt
Current Scene
Current Transition
Experience Mode
Interaction Permissions
Global Experience State
```

Does NOT own:

```txt
Animation
DOM
Rendering
Scroll Logic
```

### ScrollOrchestrator

Owns:

```txt
Scroll State
Scroll Events
Scene Activation Triggers
```

### Scene Layer

Contains:

```txt
HeroScene
AboutScene
WorkScene
ContactScene
```

Scenes own themselves.

Scenes do not own other scenes.

### Transition Layer

Contains:

```txt
EclipseTransition
```

Transitions bridge scenes.

Transitions do not own scene content.

### Interaction Layer

Contains:

```txt
Cursor
Magnetic Systems
Hover Systems
Pointer Systems
```

### Renderer Layer

Contains:

```txt
Canvas
WebGL
ASCII
Fluid
Particle Systems
```

### Motion Layer

Contains:

```txt
Motion Tokens
Motion Presets
Animation Utilities
```

### Performance Layer

Contains:

```txt
PerformanceDirector
```

Responsible for:

```txt
Renderer Budget
Pause Strategy
Resource Allocation
```

## Technology Ownership

Approved ownership:

### GSAP

Owns:

```txt
Scene Motion
Scroll Motion
Transitions
Choreography
Reveal Systems
Project Expansion
Eclipse
Contact Reveal
```

GSAP is the primary motion engine.

### Framer Motion

Owns:

```txt
Optional UI Presence
Small UI State Animations
Future Menus
Future Panels
Future Modal Systems
```

Framer Motion is NOT the primary scene engine.

### React

Owns:

```txt
Structure
State
Composition
```

### Canvas

Owns:

```txt
2D Rendering
```

### Three.js / R3F

Owns:

```txt
WebGL Rendering
Shaders
Future 3D Systems
```

## Agent Rules

### Rule 01

Never re-audit:

```txt
Phase 0A
Phase 0B
Phase 0C
```

These phases are approved.

### Rule 02

Never redesign approved architecture.

Architecture changes require:

```txt
New ADR
Supersession
```

### Rule 03

Every task must define:

```txt
Objective
Deliverable
Done Definition
```

Before implementation begins.

### Rule 04

Stop immediately when Done Definition is reached.

No scope creep.

No "while we're here".

### Rule 05

Never create abstractions without consumers.

Forbidden:

```txt
Future Managers
Future Registries
Future Controllers
Future Services
```

without active usage.

### Rule 06

Never perform repeated investigations.

Forbidden:

```txt
Audit
Audit Again
Audit Again
Audit Again
```

Required:

```txt
Audit
Root Cause
Plan
Implementation
Validation
```

### Rule 07

Never scan the entire repository unless explicitly required.

Read:

```txt
Documentation
Relevant Files
Target Scope
```

Only.

### Rule 08

Documentation before transfer.

Before ending session:

Update:

```txt
05_PROGRESS_LOG.md
06_ISSUES_AND_RESOLUTIONS.md
07_HANDOFF.md
```

if applicable.

### Rule 09

Preserve UI and UX.

Unless explicitly approved.

Architecture may change.

Experience may not.

### Rule 10

Repository documentation is the source of truth.

Not chat.

Not memory.

Not assumptions.

## Token Efficiency Protocol

Goal:

```txt
Maximum Progress
Minimum Token Waste
```

### Do

Read state.

Read handoff.

Continue active work.

Reuse decisions.

Reference ADRs.

Work incrementally.

Stop when complete.

### Do Not

Re-analyze approved work.

Re-open closed decisions.

Re-plan completed architecture.

Re-audit finished phases.

Repeat investigations.

## Session End Protocol

Before ending work:

1. Update Progress Log.
2. Update Issues Log if needed.
3. Update Handoff.
4. Update Project State if changed.
