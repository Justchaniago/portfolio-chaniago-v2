# Project Discovery Hybrid Architecture (FEATURE-001)

Status:

```txt
ARCHITECTURE ONLY
```

Final verdict:

```txt
PASS
```

Architecture verdict:

```txt
Hybrid Architecture Approved
```

Readiness verdict:

```txt
READY FOR FEATURE-002
```

This document transforms the FEATURE-000B Hybrid discovery decision into a production-ready architecture.

No runtime code was changed.

No UI was implemented.

No Explorer was built.

No routes were created.

---

## 1. Hybrid Information Architecture

Approved IA:

```txt
Home
├── Hero
├── About
├── Featured Work
├── Project Explorer
└── Contact
```

### Ownership

Hero:

```txt
Owns first impression, identity, and interaction hook.
Does not own project discovery.
```

About:

```txt
Owns personal/professional context and credibility setup.
Does not own project filtering or project routing.
```

Featured Work:

```txt
Owns cinematic storytelling for selected flagship projects.
Owns narrative sequencing only for projects selected by metadata.
Does not own all-project discovery.
Does not own search, filters, CMS, or project repository source.
```

Project Explorer:

```txt
Owns direct project discovery for the full project inventory.
Owns browsing structure, category grouping, filter entry points, and case-study entry points.
Does not replace Featured Work.
Does not own case-study page content rendering.
```

Case Study:

```txt
Owns deep project detail for a single project.
Consumes project data by slug.
Does not own global project discovery.
```

Contact:

```txt
Owns conversion after narrative or project exploration.
Does not own project browsing.
```

Project Repository:

```txt
Owns project retrieval and source abstraction.
Feeds Featured Work, Project Explorer, and Case Study systems.
```

### User Flow

Primary narrative flow:

```txt
Hero
→ About
→ Featured Work
→ Project Explorer prompt
→ Contact
```

Fast discovery flow:

```txt
Hero or Navigation
→ Project Explorer
→ Project Card
→ Case Study
→ Contact
```

Case-study flow:

```txt
Featured Project or Explorer Card
→ /work/[slug]
→ Contact or related projects
```

### Discovery Flow

Discovery must support two user intents:

```txt
Immersive evaluation: "show me your best work"
Direct evaluation: "show me relevant work quickly"
```

Featured Work serves immersive evaluation.

Project Explorer serves direct evaluation.

### Conversion Flow

Conversion paths:

```txt
Featured Work → Case Study → Contact
Explorer → Case Study → Contact
Explorer → Contact
Contact quick jump → Work / Explorer
```

Contact should remain reachable from:

```txt
global navigation
case studies
end of Featured Work
Project Explorer
```

---

## 2. Featured Work Architecture

Featured Work is a curated narrative subset.

It is not:

```txt
the complete project inventory
a default slice of the first N projects
a hardcoded project position list
```

### Featured Qualification

Projects qualify as Featured through data metadata.

Required metadata:

```txt
featured: boolean
featuredPriority: number
sortOrder: number
status: published
```

Optional scoring inputs:

```txt
impactScore
craftScore
businessRelevance
technicalDepth
recency
```

Selection rule:

```txt
Featured Work selects published projects where featured is true, ordered by featuredPriority, then sortOrder.
```

Forbidden selection patterns:

```txt
projects[0]
projects[1]
projects[2]
projects.slice(0, 3)
array index as featured meaning
timeline position as featured meaning
```

### Featured Counts

Minimum featured count:

```txt
1
```

Recommended featured count:

```txt
3
```

Maximum featured count:

```txt
4
```

Reason:

```txt
Featured Work is cinematic and attention-expensive.
Beyond 4 projects it becomes a linear browsing burden instead of a focused showcase.
```

### Fallback Behavior

If no projects are marked featured:

```txt
Use published projects ordered by sortOrder.
Select the first project only as a minimal fallback.
Show Project Explorer as the primary Work discovery path.
Log/document the content configuration issue for maintainers.
```

If fewer than recommended featured projects exist:

```txt
Render the available featured projects.
Do not pad with unmarked projects unless fallback mode is active.
```

If more than maximum featured projects exist:

```txt
Render only the top 4 by featuredPriority and sortOrder.
Expose the rest through Project Explorer.
```

---

## 3. Project Explorer Architecture

Project Explorer is the scalable discovery layer for the full project inventory.

### Responsibilities

Explorer owns:

```txt
full project inventory browsing
project grid/list structure
category entry points
future filtering
future search entry point
project cards
case-study entry points
empty states
loading states
published-only visibility
```

### Non-Goals

Explorer must not own:

```txt
Featured Work cinematic sequencing
case-study article rendering
project data source implementation
CMS authoring
analytics provider implementation
global navigation
Contact conversion UI
```

### Grid/List Behavior

Architecture requirement:

```txt
Explorer must support both grid and list-compatible data.
Initial implementation may choose one presentation, but project data must not assume one layout.
```

Grid is best for:

```txt
visual scanning
media-rich comparison
portfolio browsing
```

List is best for:

```txt
dense mobile browsing
technical filtering
low-bandwidth fallback
large inventory scanning
```

### Categories

Categories should be data-driven.

Initial category examples:

```txt
Web Platform
Mobile App
Admin / Dashboard
AI Product
Commerce
Operations
```

Categories must not be hardcoded to current project names.

### Future Filters

Filter dimensions should be schema-backed:

```txt
category
technology
industry
role
year
projectType
featured
status
```

Filters should not be implemented until:

```txt
project schema is stable
inventory is large enough to benefit
filter labels are product-reviewed
```

### Future Search

Search becomes valuable when:

```txt
inventory exceeds roughly 15 projects
case-study body content exists
project tags and summaries are stable
```

Search should query:

```txt
title
summary
category
technology
industry
role
case-study body
```

### Project Cards

Project cards should expose:

```txt
title
summary
category
year
featured marker when relevant
cover image
technology highlights
primary outcome
case-study link
```

Cards must support:

```txt
published project only
direct /work/[slug] navigation
accessible title and action
responsive image metadata
```

### Case Study Entry Points

Every published project should have a stable case-study entry point:

```txt
/work/[slug]
```

Projects without full case-study content may use a lightweight detail page, but the route should still resolve.

---

## 4. Route Architecture

Evaluated models:

```txt
Option 1:
/
/work
/work/[slug]

Option 2:
/
/#work
/projects/[slug]

Option 3:
/
/projects
/projects/[slug]
```

### Recommended Route Model

Use:

```txt
/
/work
/work/[slug]
```

### Why This Model Wins

`/`:

```txt
Owns the immersive home narrative.
Includes Hero, About, Featured Work, Project Explorer preview or entry, and Contact.
```

`/work`:

```txt
Owns the full Project Explorer.
Supports direct browsing, filters, future search, and all project inventory.
```

`/work/[slug]`:

```txt
Owns individual case-study detail.
Supports direct sharing, SEO, analytics, and conversion.
```

### Alternatives Rejected

`/#work` only:

```txt
Rejected because it does not create a durable full-project discovery route or SEO-friendly project index.
```

`/projects`:

```txt
Viable but less aligned with current product language, navigation labels, and existing CTA expectations.
```

### SEO Implications

The recommended model supports:

```txt
home page brand narrative
indexable project explorer
indexable project case studies
shareable project links
Open Graph project previews
canonical project URLs
```

### Sharing Implications

Users can share:

```txt
the overall portfolio: /
the full work index: /work
a specific project: /work/[slug]
```

### Maintenance Implications

Route ownership becomes clear:

```txt
Home owns narrative.
Work route owns inventory discovery.
Slug route owns project depth.
Project repository feeds all three.
```

---

## 5. Project Data Architecture

Future-safe project schema:

```ts
type ProjectStatus = 'draft' | 'published' | 'archived';

type ProjectLink = {
  label: string;
  href: string;
  type: 'live' | 'repo' | 'case-study' | 'external';
};

type ProjectMedia = {
  src: string;
  alt: string;
  kind: 'cover' | 'gallery' | 'thumbnail' | 'og';
  brightness?: 'light' | 'dark';
  width?: number;
  height?: number;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: string;
  impact?: string;
  featured: boolean;
  featuredPriority?: number;
  sortOrder: number;
  year: number;
  category: string;
  technologies: string[];
  industry?: string;
  role?: string[];
  status: ProjectStatus;
  coverImage: ProjectMedia;
  gallery: ProjectMedia[];
  links: ProjectLink[];
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
  caseStudy?: {
    problem?: string;
    solution?: string;
    outcome?: string;
    body?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};
```

Required fields for FEATURE-005:

```txt
id
slug
title
summary
featured
sortOrder
year
category
technologies
status
coverImage
gallery
links
```

Additional useful fields:

```txt
industry
role
featuredPriority
impact
caseStudy
seo
createdAt
updatedAt
```

Schema rules:

```txt
slug must be unique.
sortOrder must not imply featured status.
featured must be explicit.
published projects are visible publicly.
draft projects are never shown publicly.
archived projects may remain routable if already published historically.
```

---

## 6. Repository Architecture

Current state:

```txt
data/projects.ts
```

Future architecture:

```txt
ProjectRepository
├── Local Source
├── Firebase Source
└── Future CMS Source
```

### Ownership

ProjectRepository owns:

```txt
getAllProjects()
getPublishedProjects()
getFeaturedProjects()
getProjectBySlug(slug)
getProjectsByCategory(category)
future search/filter query methods
```

ProjectRepository does not own:

```txt
React rendering
Featured Work animation
Explorer layout
Case-study page presentation
Firebase SDK details outside infrastructure adapters
CMS authoring UI
```

### Source Adapters

Local Source:

```txt
Reads current local project data.
Used during transition and static builds.
```

Firebase Source:

```txt
Reads published project documents from Firebase through infrastructure layer only.
Does not leak Firebase calls into UI components.
```

Future CMS Source:

```txt
Feeds the same repository contract after Admin Dashboard authoring exists.
```

### Migration Path

Phase 1:

```txt
Keep data/projects.ts.
Define schema and repository contract.
Map existing projects into future-safe fields.
```

Phase 2:

```txt
Move reads behind ProjectRepository.
Featured Work, Explorer, and Case Study consume repository methods.
```

Phase 3:

```txt
Add Firebase adapter in infrastructure.
Keep UI dependent on repository/usecase layer, not Firebase.
```

Phase 4:

```txt
Connect Admin Dashboard/CMS to the same project schema.
```

Future compatibility rule:

```txt
UI must never access Firebase directly.
Portfolio UI consumes project data through repository-backed application/usecase APIs.
```

---

## 7. CMS Readiness Analysis

CMS work must not begin until these are stable:

```txt
route model
project schema
featured selection rules
Explorer architecture
case-study architecture
media metadata requirements
published/draft/archive lifecycle
repository contract
```

CMS should not be built yet:

```txt
Admin Dashboard project CRUD
Firebase project collections
media upload workflow
search indexing
analytics dashboards
preview/publish workflow
role-based content permissions
```

Reason:

```txt
Building CMS before the portfolio schema and discovery model are stable would lock content operations into premature assumptions.
```

CMS readiness checklist:

```txt
Can a project be represented without layout-specific assumptions?
Can a project be shown in Featured Work, Explorer, and Case Study from the same data?
Can featured selection change without code edits?
Can ordering change without code edits?
Can unpublished content remain hidden?
Can media metadata support mobile and SEO?
```

---

## 8. Mobile Architecture

Mobile goals:

```txt
reduce scroll fatigue
support fast project scanning
preserve premium feel
avoid gesture conflicts
make case-study access direct
```

### Featured Work Mobile Behavior

Featured Work on mobile should:

```txt
show fewer featured projects when needed
preserve narrative focus
avoid forcing every project into a long pinned sequence
provide an early Explore All Projects action
keep swipe/scroll gestures predictable
```

Recommended mobile featured count:

```txt
2-3
```

Maximum mobile featured count:

```txt
3
```

### Explorer Mobile Behavior

Explorer on mobile should:

```txt
support compact cards
support list-compatible data
allow category browsing
avoid hover-only interactions
keep filters collapsible
make search optional until inventory justifies it
```

### Case Study Mobile Behavior

Case Study on mobile should:

```txt
load quickly
prioritize summary and outcome first
avoid heavy gallery-first layouts
provide sticky or repeated Contact entry points only if non-intrusive
support direct back to Explorer
```

Mobile breakpoint principle:

```txt
Mobile should not be a compressed version of the desktop cinematic timeline.
Mobile should provide a shorter discovery path.
```

---

## 9. Growth Simulation

### 3 Projects

Architecture behavior:

```txt
Featured Work may show all 3.
Explorer can be lightweight.
Filters and search are unnecessary.
```

Required upgrades:

```txt
case-study routes
schema fields
repository contract planning
```

### 5 Projects

Architecture behavior:

```txt
Featured Work shows 3-4.
Explorer shows all 5.
Categories become useful if projects differ meaningfully.
```

Required upgrades:

```txt
Explore All Projects action
/work route
case-study route template
```

### 10 Projects

Architecture behavior:

```txt
Featured Work remains capped at 3-4.
Explorer becomes the primary complete inventory.
Categories and basic filters become useful.
```

Required upgrades:

```txt
category metadata
technology metadata
sort controls
mobile explorer behavior
```

### 20 Projects

Architecture behavior:

```txt
Explorer carries most discovery.
Featured Work remains a curated entry.
Filters become expected.
Search becomes valuable.
```

Required upgrades:

```txt
filter architecture
search planning
media loading strategy
analytics events
```

### 30 Projects

Architecture behavior:

```txt
Explorer must support strong filtering, search, direct routes, and stable metadata.
CMS readiness becomes high priority.
```

Required upgrades:

```txt
repository source abstraction
CMS schema readiness
media governance
SEO metadata
```

### 50 Projects

Architecture behavior:

```txt
Explorer becomes a product surface.
Search, filters, categories, pagination or progressive loading, and CMS workflows become mandatory.
Featured Work remains independent and curated.
```

Required upgrades:

```txt
CMS/Admin integration
search indexing
published/draft workflows
thumbnail generation or media rules
analytics review loop
```

Breakpoints:

```txt
5 projects: add Explorer entry.
10 projects: add categories/basic filters.
20 projects: plan search and media governance.
30 projects: CMS readiness becomes urgent.
50 projects: CMS, search, and progressive loading become mandatory.
```

---

## 10. Future Dependency Map

### FEATURE-002: Hybrid UX Design

Owns:

```txt
Featured Work to Explorer transition
Explorer information layout
mobile discovery flow
CTA hierarchy
empty/loading states
case-study entry affordances
```

Does not own:

```txt
runtime implementation
repository layer
CMS
route creation
```

### FEATURE-003: Project Explorer Runtime

Owns:

```txt
/work Explorer implementation
project card rendering
category browsing
initial grid/list behavior
published project visibility
```

Does not own:

```txt
CMS integration
advanced search
Admin Dashboard
Featured Work timeline refactor unless explicitly scoped
```

### FEATURE-004: Case Study System

Owns:

```txt
/work/[slug] route
case-study template
project detail rendering
SEO metadata for case studies
missing slug behavior
related project entry points
```

Does not own:

```txt
Explorer filters
CMS authoring
Featured Work cinematic logic
```

### FEATURE-005: Project Schema & Repository Layer

Owns:

```txt
future-safe Project type
ProjectRepository contract
local source adapter
project selection methods
featured project query
slug lookup
published filtering
```

Does not own:

```txt
Firebase adapter unless explicitly included
CMS UI
Explorer visual design
case-study visual design
```

### FEATURE-006: CMS / Admin Integration

Owns:

```txt
Admin Dashboard project CRUD
Firebase project source adapter
publish/draft/archive workflow
media management workflow
preview/publish support
```

Does not own:

```txt
initial discovery IA
initial route model
initial case-study schema
```

Dependency order:

```txt
FEATURE-002
→ FEATURE-005
→ FEATURE-004
→ FEATURE-003
→ FEATURE-006
```

Alternative implementation order:

```txt
FEATURE-002
→ FEATURE-005
→ FEATURE-003
→ FEATURE-004
→ FEATURE-006
```

Decision note:

```txt
If fixing broken case-study CTAs is urgent, FEATURE-004 may precede FEATURE-003.
If Explorer discovery is urgent, FEATURE-003 may precede FEATURE-004, but CTAs must not point to missing routes.
```

---

## Implementation Guardrails

Do not implement:

```txt
Explorer UI
filters
search
CMS
routes
runtime Work refactor
Firebase integration
```

Do not depend on:

```txt
fixed project count
hardcoded project order
hardcoded featured positions
timeline-specific project assumptions
array index meaning
```

Required future implementation principle:

```txt
Project discovery must be data-driven.
Featured status must come from metadata.
Portfolio UI must consume project data through repository/usecase boundaries.
```

---

## Success Criteria

Hybrid architecture fully defined:

```txt
PASS
```

Route architecture selected:

```txt
PASS
```

Project schema defined:

```txt
PASS
```

Repository architecture defined:

```txt
PASS
```

CMS readiness documented:

```txt
PASS
```

Growth path to 30+ projects documented:

```txt
PASS
```

Future implementation roadmap clarified:

```txt
PASS
```
