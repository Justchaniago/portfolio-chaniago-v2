# Project Schema & Repository Layer (FEATURE-005)

Status:

```txt
ARCHITECTURE ONLY
```

Final verdict:

```txt
PASS
```

Readiness verdict:

```txt
READY FOR FEATURE-004 OR FEATURE-005R
```

This document defines the production-ready project schema, repository contract, source architecture, seed strategy, merge strategy, migration path, and runtime readiness for Hybrid Project Discovery.

No Explorer UI was implemented.

No Case Study UI was implemented.

No CMS, Admin Dashboard, search, filters, analytics, SEO runtime, routes, or Firebase integration were implemented.

---

## 1. Existing Project Audit

Current file:

```txt
data/projects.ts
```

Current schema:

```ts
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  slug: string;
  impact: string;
  gallery: string[];
  galleryBrightness?: ('light' | 'dark')[];
}
```

Current seed projects:

```txt
01 Gong Cha Panel
02 Gong Cha
03 Teman Dengar
```

Current strengths:

- Project content is centralized.
- Each project has stable `id`, `slug`, `title`, `category`, summary-style copy, impact copy, cover image, and gallery images.
- Existing seed media is local and does not depend on Firebase, CMS, or network availability.
- The current model is enough for the current Featured Work sequence.

Current technical debt:

- No `status`, so draft/published/archive behavior cannot be expressed.
- No `featured` flag, so Featured Work cannot be data-driven.
- No `featuredPriority`, so featured ordering cannot be controlled independently.
- No `sortOrder`, so inventory order is implicitly array order.
- No `year`, making Explorer and case-study chronology weak.
- No `technologies`, limiting developer and hiring-manager discovery.
- No structured `coverImage`; current `image` is a simple string.
- No structured media metadata beyond optional brightness.
- No links model for live site, repo, external links, or case-study references.
- No SEO metadata.
- No case-study content structure.
- No timestamps for CMS operations.
- No industry, role, project type, or tags for filtering/search.

Future risks:

```txt
Array order becomes product logic.
Featured selection becomes hardcoded.
Explorer filters cannot be added cleanly.
Case-study pages cannot be generated consistently.
CMS migration requires a schema rewrite.
Firebase content could accidentally replace canonical seed content.
UI components may start consuming Firebase directly without a repository boundary.
```

Fields required by FEATURE-002 UX but missing today:

```txt
featured
featuredPriority
sortOrder
status
year
technologies
coverImage
links
caseStudy
seo
industry
role
```

---

## 2. Final Project Schema

The final schema must support:

```txt
Featured Work
Project Explorer
Case Studies
Filters
Search
SEO
Analytics
CMS
Admin Dashboard
Local seed fallback
```

Recommended TypeScript shape:

```ts
export type ProjectStatus = 'draft' | 'published' | 'archived';

export type ProjectLinkType =
  | 'live'
  | 'repo'
  | 'case-study'
  | 'external';

export type ProjectMediaKind =
  | 'cover'
  | 'thumbnail'
  | 'gallery'
  | 'hero'
  | 'og';

export type ProjectMediaBrightness = 'light' | 'dark';

export interface ProjectMedia {
  src: string;
  alt: string;
  kind: ProjectMediaKind;
  brightness?: ProjectMediaBrightness;
  width?: number;
  height?: number;
  focalPoint?: {
    x: number;
    y: number;
  };
}

export interface ProjectLink {
  label: string;
  href: string;
  type: ProjectLinkType;
}

export interface ProjectSeo {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
}

export interface ProjectCaseStudy {
  problem?: string;
  solution?: string;
  outcome?: string;
  role?: string;
  process?: string;
  technicalDetails?: string;
  body?: string;
}

export interface ProjectAnalyticsMeta {
  trackingId?: string;
  conversionCategory?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  featured: boolean;
  featuredPriority: number;
  sortOrder: number;
  status: ProjectStatus;
  year: number;
  category: string;
  technologies: string[];
  coverImage: ProjectMedia;
  gallery: ProjectMedia[];
  links: ProjectLink[];
  description?: string;
  industry?: string;
  role?: string[];
  impact?: string;
  projectType?: string;
  tags?: string[];
  seo?: ProjectSeo;
  caseStudy?: ProjectCaseStudy;
  analytics?: ProjectAnalyticsMeta;
  createdAt?: string;
  updatedAt?: string;
}
```

### Field Classification

Required now:

```txt
id
slug
title
summary
featured
featuredPriority
sortOrder
status
year
category
technologies
coverImage
gallery
links
```

Optional now:

```txt
description
industry
role
impact
projectType
tags
seo
caseStudy
analytics
createdAt
updatedAt
```

Derived:

```txt
case-study path from slug: /work/[slug]
published visibility from status
featured ordering from featuredPriority and sortOrder
Explorer category list from published projects
technology filter values from technologies
search index text from title, summary, category, technologies, tags, and caseStudy
```

Future:

```txt
analytics tracking IDs
CMS preview metadata
media focal points
related project overrides
localized copy
structured metrics
```

### Evaluated Additional Fields

industry:

```txt
Optional now.
Useful for Client and Founder discovery and future filters.
```

role:

```txt
Optional now.
Useful for recruiters, hiring managers, and case-study context.
```

impact:

```txt
Optional but recommended for seed projects.
Useful for Featured Work and case-study summaries.
```

seo:

```txt
Optional now.
Required before public case-study SEO work.
```

caseStudy:

```txt
Optional now.
Required before full /work/[slug] pages become rich case studies.
Projects without caseStudy may still render a lightweight detail page.
```

createdAt / updatedAt:

```txt
Optional for local seed.
Required for CMS/Admin operations.
```

---

## 3. Repository Contract

The UI must consume a repository/usecase boundary, not Firebase or CMS sources directly.

Recommended contract:

```ts
export interface ProjectRepository {
  getAllProjects(): Promise<Project[]>;
  getPublishedProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getProjectsByCategory(category: string): Promise<Project[]>;
}
```

Synchronous local implementations may wrap local data in resolved promises to keep future remote compatibility.

Required method ownership:

getAllProjects:

```txt
Returns all known projects from the repository merge strategy.
May include draft/archive only for internal/admin contexts later.
Public UI should generally not call this directly.
```

getPublishedProjects:

```txt
Returns public projects where status is published.
Primary source for Explorer and public listing.
```

getFeaturedProjects:

```txt
Returns published projects where featured is true.
Sorts by featuredPriority, then sortOrder.
Applies Featured Work max-count policy at the consumer/usecase boundary, not source order.
```

getProjectBySlug:

```txt
Returns one published or historically routable archived project by slug.
Primary source for /work/[slug].
```

getProjectsByCategory:

```txt
Returns published projects matching category.
Primary source for category browsing and future filters.
```

Future methods:

```ts
searchProjects(query: string): Promise<Project[]>;
getRelatedProjects(project: Project, limit?: number): Promise<Project[]>;
getProjectsByTechnology(technology: string): Promise<Project[]>;
getProjectsByTag(tag: string): Promise<Project[]>;
```

Future method guidance:

- `searchProjects()` should wait until inventory and searchable case-study content justify it.
- `getRelatedProjects()` should begin derived from category/technology, with optional manual overrides later.
- `getProjectsByTechnology()` should wait until `technologies` are normalized.

Repository non-goals:

```txt
React rendering
Explorer layout
Case Study UI
Featured Work animation
Firebase SDK initialization
CMS UI
Navigation
Analytics provider implementation
SEO rendering
```

---

## 4. Source Architecture

Approved source model:

```txt
ProjectRepository
├── LocalSeedSource
├── FirebaseSource
└── FutureCMSSource
```

### LocalSeedSource

Purpose:

```txt
Provide canonical seed projects and offline-safe portfolio content.
```

Responsibilities:

```txt
map current data/projects.ts into final Project schema
preserve existing projects and media
provide fallback for Home, Featured Work, Explorer, and Case Studies
remain available when Firebase/CMS/network fail
```

Failure behavior:

```txt
LocalSeedSource should be treated as always available at build/runtime because it is bundled with the app.
If local seed data is malformed, repository validation should fail loudly during development.
```

Ownership:

```txt
Portfolio codebase owns local seeds.
Seeds are canonical baseline content, not disposable placeholders.
```

### FirebaseSource

Purpose:

```txt
Provide remote project content after repository and schema are stable.
```

Responsibilities:

```txt
read project documents from Firebase infrastructure
normalize remote documents into Project schema
return failure/empty states to ProjectRepository
avoid leaking Firebase SDK details to UI
```

Failure behavior:

Firebase empty:

```txt
Repository still returns LocalSeedSource projects.
```

Firebase fails:

```txt
Repository logs/records source failure and returns LocalSeedSource projects.
Public portfolio remains functional.
```

Network unavailable:

```txt
Repository returns LocalSeedSource projects.
Remote-only projects are unavailable until source recovers.
```

Ownership:

```txt
Infrastructure layer owns Firebase SDK calls.
Repository consumes FirebaseSource output.
UI never imports Firebase.
```

### FutureCMSSource

Purpose:

```txt
Provide authored project content from Admin Dashboard / CMS after CMS exists.
```

Responsibilities:

```txt
enforce publish/draft/archive lifecycle
provide CMS-authored project data through repository-compatible schema
coexist with seed projects
support future preview/publish workflows
```

Failure behavior:

CMS unavailable:

```txt
Repository continues serving LocalSeedSource and any cached/available remote published content.
Portfolio remains functional.
```

CMS empty:

```txt
Repository still serves seed projects.
```

Ownership:

```txt
Admin/CMS owns authoring.
Repository owns read model.
UI owns presentation only.
```

---

## 5. Seed Project Strategy

Existing seed projects and media are canonical baseline content.

Preservation rules:

```txt
Seed projects must not be deleted by Firebase/CMS state.
Seed projects must not require network access.
Seed media must remain local unless explicitly migrated in a scoped media task.
Seed projects must remain available for Home, Featured Work, Explorer, and Case Studies.
```

Can seed projects be hidden?

```txt
Yes, but only through local seed metadata such as status: archived or published visibility rules.
Remote sources must not hide seeds by omission.
```

Can seed projects be archived?

```txt
Yes, if intentionally marked archived in local seed metadata.
Archived seed projects may remain routable if previously public.
```

Can seed projects be featured?

```txt
Yes. Seed projects should use featured and featuredPriority like CMS projects.
```

Can CMS projects coexist?

```txt
Yes. CMS projects should merge with seed projects using stable ids/slugs and source precedence rules.
```

Recommendation:

```txt
Treat seed projects as protected source-controlled baseline content.
Remote/CMS projects may add to or override matching seed projects by explicit id/slug only, but remote absence must never remove seed projects.
```

---

## 6. Merge Strategy

### Option A: Firebase Replaces Local

Behavior:

```txt
If Firebase exists, use Firebase only.
```

Strengths:

```txt
Simple mental model after CMS exists.
```

Weaknesses:

```txt
Violates seed protection.
Breaks offline/network-failure resilience.
Can make portfolio empty when Firebase is empty or misconfigured.
Makes local seed content less canonical.
```

Verdict:

```txt
Rejected.
```

### Option B: Firebase Fallback to Local

Behavior:

```txt
Use Firebase when available; fallback to Local when Firebase fails or is empty.
```

Strengths:

```txt
Keeps portfolio functional during failure.
Simple for early remote integration.
```

Weaknesses:

```txt
Remote projects can still conceptually replace local seeds when Firebase is healthy.
Seed and CMS coexistence is not first-class.
Can hide merge conflicts until failure mode.
```

Verdict:

```txt
Acceptable intermediate strategy, not final strategy.
```

### Option C: Seed Projects + CMS Projects

Behavior:

```txt
Repository always starts with LocalSeedSource.
Remote/CMS sources add projects.
Remote/CMS may explicitly override matching seed projects by id/slug.
Remote/CMS absence does not delete seeds.
```

Strengths:

```txt
Preserves seed content.
Supports offline/network failure.
Supports CMS growth.
Allows canonical initial projects to coexist with future content.
Prevents empty remote collections from breaking the portfolio.
```

Weaknesses:

```txt
Requires merge rules.
Requires duplicate id/slug validation.
Requires clear source precedence.
```

Verdict:

```txt
Recommended.
```

Chosen merge strategy:

```txt
Option C — Seed Projects + CMS Projects
```

Rationale:

```txt
It is the only option that satisfies seed protection, CMS readiness, Firebase failure behavior, and future project growth.
```

Recommended precedence:

```txt
1. Local seeds always exist.
2. Remote/CMS projects with new ids/slugs are appended into repository results.
3. Remote/CMS projects with matching ids/slugs may override mutable fields only if explicitly marked as an override.
4. Remote absence never deletes a seed.
5. Deleting/hiding a seed requires source-controlled seed metadata change.
```

---

## 7. Growth Simulation

### 3 Projects

Repository behavior:

```txt
LocalSeedSource is enough.
All projects can be published and featured.
Repository still exposes future-compatible methods.
```

Performance risks:

```txt
Low.
```

Data management risks:

```txt
Low, but array order must stop acting as product logic.
```

CMS implications:

```txt
CMS not needed.
```

### 10 Projects

Repository behavior:

```txt
Local source can still work.
Repository methods become useful for featured, category, and published queries.
```

Performance risks:

```txt
Low to moderate depending on media loading.
```

Data management risks:

```txt
Need normalized category and technology fields.
Need reliable sortOrder and featuredPriority.
```

CMS implications:

```txt
CMS optional.
Structured local data may still be sufficient.
```

### 30 Projects

Repository behavior:

```txt
Repository becomes essential.
Explorer needs published/category/technology queries.
Case studies need slug lookups.
```

Performance risks:

```txt
Media loading and Explorer rendering become more important than raw data lookup.
```

Data management risks:

```txt
Manual local updates become error-prone.
Need duplicate slug checks and schema validation.
```

CMS implications:

```txt
CMS readiness becomes high priority.
```

### 50 Projects

Repository behavior:

```txt
Repository must support efficient filtering/search preparation.
Local seed remains baseline, but CMS/remote source becomes valuable.
```

Performance risks:

```txt
Explorer needs progressive loading, pagination, or virtualization planning.
Search indexing may be needed.
```

Data management risks:

```txt
Taxonomy drift, stale media, and inconsistent case-study content become likely.
```

CMS implications:

```txt
CMS/Admin integration should be planned or active.
```

### 100 Projects

Repository behavior:

```txt
Repository must act as a query boundary.
Search/filter methods become first-class.
CMS/remote source likely becomes primary authoring system.
Local seeds still remain protected baseline content.
```

Performance risks:

```txt
Client-side full inventory rendering becomes risky.
Need server-side/static generation strategy, pagination, progressive loading, or indexed search.
```

Data management risks:

```txt
Schema governance, validation, media lifecycle, and publishing workflow become mandatory.
```

CMS implications:

```txt
CMS/Admin is required for maintainability.
```

---

## 8. Migration Plan

### Phase 1: Current data/projects.ts

Goal:

```txt
Preserve current seed projects.
Document schema gaps.
Do not break current Featured Work.
```

Rules:

```txt
Do not remove seed projects.
Do not remove seed media.
Do not introduce Firebase dependency.
```

### Phase 2: ProjectRepository

Goal:

```txt
Introduce repository boundary and final Project schema mapping.
```

Work:

```txt
Create Project type.
Create LocalSeedSource.
Create ProjectRepository contract.
Map existing seed projects into final schema.
Expose getPublishedProjects, getFeaturedProjects, getProjectBySlug, and getProjectsByCategory.
```

Must avoid:

```txt
UI consuming Firebase.
Featured Work relying on array indexes.
Breaking current Work sequence.
```

### Phase 3: Case Study System

Goal:

```txt
Make /work/[slug] resolve from repository data.
```

Work:

```txt
Render published project by slug.
Fallback lightweight case-study content when full caseStudy is missing.
Preserve Contact flow.
```

Must avoid:

```txt
Broken project CTAs.
Remote-only case-study dependency.
```

### Phase 4: Project Explorer

Goal:

```txt
Build /work inventory discovery from repository data.
```

Work:

```txt
Use getPublishedProjects.
Use category values from schema.
Use case-study links from slug.
Do not implement advanced search/filters until inventory justifies them.
```

Must avoid:

```txt
Replacing Featured Work.
Hardcoding categories from current project names.
```

### Phase 5: Firebase Source

Goal:

```txt
Add remote source without breaking local seed fallback.
```

Work:

```txt
Create FirebaseSource in infrastructure.
Normalize Firebase docs into Project schema.
Merge with LocalSeedSource through repository.
Return seeds when Firebase is empty or unavailable.
```

Must avoid:

```txt
Firebase calls in UI.
Firebase replacing seeds by default.
Empty Firebase causing empty portfolio.
```

### Phase 6: CMS/Admin

Goal:

```txt
Enable content authoring for scalable project inventory.
```

Work:

```txt
Admin CRUD.
Publish/draft/archive workflow.
Media metadata workflow.
Preview/publish support.
CMS source adapter.
```

Must avoid:

```txt
CMS-specific assumptions leaking into UI.
Schema changes that break seeds.
Admin writes that make points of truth ambiguous.
```

---

## 9. Runtime Readiness Assessment

Options:

```txt
Architecture Only
Architecture + Runtime Foundation
```

Assessment:

```txt
The schema and repository layer are foundational enough to justify runtime implementation soon, but this FEATURE-005 task should remain Architecture Only because the requested deliverable is a planning artifact and several uncommitted governance/feature planning docs are still open.
```

Recommendation:

```txt
FEATURE-005 remains Architecture Only.
Create FEATURE-005R for Runtime Repository Foundation.
```

FEATURE-005R should own:

```txt
Project type definitions
LocalSeedSource
ProjectRepository contract
Local repository implementation
Mapping current seed projects into final schema
Unit/static validation for duplicate slugs and required fields
No Firebase integration
No Explorer UI
No Case Study UI
No CMS
No search
No filters
```

Why not implement runtime in FEATURE-005:

```txt
This task is primarily architecture and migration planning.
Runtime implementation should be separately scoped to avoid mixing data foundation code with Explorer or Case Study assumptions.
```

---

## Data Ownership Rules

Canonical baseline:

```txt
Local seed projects are canonical baseline content.
```

Remote content:

```txt
Firebase/CMS content may extend project inventory.
Firebase/CMS content must not remove seed projects by omission.
```

UI access:

```txt
UI consumes repository/usecase APIs only.
UI must never import Firebase SDK or Firebase source adapters.
```

Featured selection:

```txt
Featured status comes from metadata, not array position.
```

Ordering:

```txt
Inventory ordering comes from sortOrder.
Featured ordering comes from featuredPriority, then sortOrder.
```

Visibility:

```txt
Public UI shows published projects.
Draft projects are hidden.
Archived projects may remain routable when historically public.
```

---

## Validation Checklist

No Explorer implementation:

```txt
PASS
```

No Case Study implementation:

```txt
PASS
```

No CMS implementation:

```txt
PASS
```

No Search implementation:

```txt
PASS
```

No Filter implementation:

```txt
PASS
```

Seed project protection documented:

```txt
PASS
```

Repository contract documented:

```txt
PASS
```

Source architecture documented:

```txt
PASS
```

Migration strategy documented:

```txt
PASS
```

Runtime readiness recommendation documented:

```txt
PASS
```
