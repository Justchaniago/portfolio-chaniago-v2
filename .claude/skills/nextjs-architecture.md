NEXTJS ARCHITECTURE

Component Responsibility

One component.

One responsibility.

⸻

Client Components

Default:

Server Component.

Only use:

“use client”

when necessary.

⸻

Data Flow

Prefer:

Server
↓
Props
↓
UI

Avoid:

Deep prop drilling.

⸻

Reuse First

Before creating:

* component
* hook
* utility

Check if one already exists.

⸻

TypeScript

Forbidden:

* any
* unknown as any
* disabled type checks

⸻

Refactoring Rules

Do not refactor unrelated code.

Do not perform opportunistic rewrites.

Stay inside requested scope.

