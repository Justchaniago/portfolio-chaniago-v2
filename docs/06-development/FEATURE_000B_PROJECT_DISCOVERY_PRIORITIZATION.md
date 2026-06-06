# Project Discovery Prioritization (FEATURE-000B)

Status:

```txt
PLANNING ONLY
```

Final verdict:

```txt
PASS
```

Recommended Model:

```txt
Hybrid
```

Readiness verdict:

```txt
READY FOR FEATURE-001
```

This document determines the long-term project discovery model for the portfolio before any Work section redesign or feature implementation.

No runtime code was changed.

No UI was modified.

No routes, filters, search, CMS, or explorer were implemented.

---

## 1. Current State Assessment

Current Work model:

```txt
Work Intro
↓
Project
↓
Project
↓
Project
↓
Contact
```

Current project count:

```txt
3
```

Current strengths:

- Strong cinematic storytelling.
- Each project receives focused attention.
- The Work section matches the current portfolio identity: immersive, editorial, and guided.
- Current project data is centralized in `data/projects.ts`.
- The current model works well for a small flagship set of 3-5 projects.
- The Work section specification explicitly defines Work as a narrative showcase, not a gallery.

Current weaknesses:

- Users cannot see all projects at once.
- Users cannot compare projects.
- Users cannot search, filter, or browse by category.
- Users must consume projects in the chosen sequence.
- The current model creates scroll fatigue as project count grows.
- Case-study routing is implied by project CTAs but not yet implemented.
- The current timeline model is high-risk to scale because project timing, snap behavior, and scroll length are sensitive.

Current product tension:

```txt
The portfolio needs to preserve the memorable narrative showcase while adding a scalable discovery layer for larger project inventories.
```

---

## 2. Option Analysis

### Option A: Keep Current Narrative Model

Model:

```txt
Work
↓
Project
↓
Project
↓
Project
↓
Project
```

Strengths:

- Best preserves current cinematic identity.
- Lowest conceptual change.
- Strongest storytelling for a small curated set.
- Keeps the user focused on one project at a time.
- Works for a portfolio positioned around a few flagship works.

Weaknesses:

- Poor scanning.
- Poor comparison.
- Poor direct access.
- Poor support for multiple user intents.
- Every new project adds scroll and pacing burden.
- The model makes the user's time cost grow linearly with project count.

Scalability:

```txt
Good at 3 projects.
Acceptable at 5 projects.
Weak at 10 projects.
Not suitable at 20+ projects.
Fails at 30 projects.
```

Maintenance burden:

```txt
Low while project count is small.
High once timeline length, project sequencing, media loading, and content updates grow.
```

Mobile UX:

```txt
High-friction beyond a small curated set because mobile users must scroll through every featured project.
```

Future project growth:

```txt
Requires another redesign once the inventory becomes broad.
```

### Option B: Narrative + Explorer Hybrid

Model:

```txt
Featured Work
├── Project A
├── Project B
├── Project C

↓ Explore All Projects

Project Explorer
├── Grid
├── Categories
├── Filters
└── Search
```

Strengths:

- Preserves current narrative identity.
- Adds fast discovery for users who need scanning.
- Supports both flagship storytelling and practical browsing.
- Lets the current cinematic Work sequence remain selective.
- Creates a clear path to case studies, project routes, SEO, analytics, and future CMS.
- Scales from 3 projects to 30+ without forcing every project into the cinematic sequence.

Weaknesses:

- More product design work than keeping the current model.
- Requires clear separation between featured projects and full inventory.
- Requires content metadata before filters/search can be useful.
- Requires careful mobile IA so Explorer does not feel bolted on.

Scalability:

```txt
Strong at 3 projects.
Strong at 5 projects.
Strong at 10 projects.
Strong at 20 projects.
Still viable at 30 projects if filters/search/media governance are added.
```

Maintenance burden:

```txt
Moderate.
Higher than the current model initially, but lower long-term because not every project needs bespoke cinematic sequencing.
```

Mobile UX:

```txt
Strongest balanced model.
Users can either experience featured work or jump into a compact browsing mode.
```

Future project growth:

```txt
Best fit.
Allows the portfolio to grow without discarding the existing storytelling layer.
```

### Option C: Explorer First

Model:

```txt
Work

Project Explorer
├── Grid
├── Search
├── Categories
└── Filters
```

Strengths:

- Fastest discovery.
- Best project comparison.
- Most familiar for recruiters and hiring managers.
- Strongest direct path to search, filters, SEO, and CMS.
- Lower risk than scaling a long cinematic sequence.

Weaknesses:

- Weakens the current portfolio's most distinctive product asset: cinematic narrative.
- Risks making the site feel more conventional.
- Reduces guided storytelling.
- Requires strong cards, metadata, and visual hierarchy to avoid becoming a generic grid.

Scalability:

```txt
Strong at 10+ projects.
Strong at 20+ projects.
Strong at 30+ projects.
Less differentiated at 3-5 projects.
```

Maintenance burden:

```txt
Moderate to low after schema is stable.
Initial burden is metadata, filtering taxonomy, and route structure.
```

Mobile UX:

```txt
Efficient if designed well.
Less immersive than the current Work experience.
```

Future project growth:

```txt
Excellent for inventory growth, weaker for brand storytelling.
```

---

## 3. Option Comparison Matrix

Scale:

```txt
5 = strongest
1 = weakest
```

| Criterion | Narrative | Hybrid | Explorer First |
|---|---:|---:|---:|
| Discovery Speed | 1 | 4 | 5 |
| Storytelling | 5 | 5 | 2 |
| Scalability | 1 | 5 | 5 |
| Maintenance | 2 | 4 | 4 |
| Mobile UX | 2 | 4 | 4 |
| Future Growth | 1 | 5 | 5 |
| Implementation Complexity | 4 | 3 | 3 |
| Brand Differentiation | 5 | 5 | 3 |
| Project Comparison | 1 | 4 | 5 |
| Case Study Path | 2 | 5 | 5 |

Interpretation:

```txt
Narrative wins on simplicity and storytelling but loses on scale.
Explorer First wins on speed and inventory but loses brand differentiation.
Hybrid keeps storytelling while creating the scalable project discovery layer.
```

---

## 4. Recruiter Journey Analysis

### Recruiter

Needs:

```txt
Fast signal.
Relevant projects.
Role and skill proof.
Direct case studies.
Contact path.
```

Narrative:

```txt
Memorable but slow.
Works if recruiter has time.
Weak if recruiter wants quick proof.
```

Hybrid:

```txt
Best fit.
Recruiter can experience featured work or jump to Explorer.
```

Explorer First:

```txt
Fastest but less distinctive.
Good for proof, weaker for brand memory.
```

### Hiring Manager

Needs:

```txt
Capability breadth.
Project depth.
Relevance to team needs.
Clear case-study outcomes.
```

Narrative:

```txt
Good for depth on a few projects.
Weak for breadth.
```

Hybrid:

```txt
Best fit.
Featured work communicates quality; Explorer communicates breadth.
```

Explorer First:

```txt
Good for breadth, but may under-communicate craft and taste.
```

### Founder

Needs:

```txt
Trust.
Taste.
Business relevance.
Ability to solve similar problems.
Fast contact path.
```

Narrative:

```txt
Strong trust and taste signal.
Weak if founder wants to find comparable examples quickly.
```

Hybrid:

```txt
Best fit.
Founder gets both emotional confidence and practical proof.
```

Explorer First:

```txt
Efficient, but less persuasive as a premium creative/technical experience.
```

### Client

Needs:

```txt
Comparable work.
Visual proof.
Outcome proof.
Confidence in process.
Easy inquiry.
```

Narrative:

```txt
Strong impression, weak comparison.
```

Hybrid:

```txt
Best fit.
Featured sequence sells quality; Explorer supports comparison.
```

Explorer First:

```txt
Good for browsing, but needs strong case-study design to sell quality.
```

### Developer

Needs:

```txt
Technical detail.
Architecture proof.
Stack relevance.
Repository or build credibility.
```

Narrative:

```txt
Weak unless the showcased projects happen to match technical interest.
```

Hybrid:

```txt
Strong.
Explorer can expose stack, architecture, and technical filters without diluting featured storytelling.
```

Explorer First:

```txt
Strong for technical browsing, weaker for brand narrative.
```

Journey conclusion:

```txt
Hybrid serves all five audiences with the fewest tradeoffs.
```

---

## 5. Growth Simulation

### 3 Projects

Narrative:

```txt
Excellent. Current model fits.
```

Hybrid:

```txt
Good, but Explorer can be lightweight or framed as "All Work".
```

Explorer First:

```txt
Functional but premature. Inventory may feel too small.
```

Breakpoint:

```txt
No forced redesign needed yet.
```

### 5 Projects

Narrative:

```txt
Still acceptable if projects are highly curated.
Scroll fatigue starts to appear.
```

Hybrid:

```txt
Strong. Featured 3 plus Explorer for all 5 works well.
```

Explorer First:

```txt
Useful but may reduce memorability.
```

Breakpoint:

```txt
Add an "Explore All Projects" path before exceeding 5 projects.
```

### 10 Projects

Narrative:

```txt
Weak. Users cannot scan or compare efficiently.
```

Hybrid:

```txt
Strong. Featured 3-4 projects stay cinematic; Explorer handles the full set.
```

Explorer First:

```txt
Strong. Efficient for inventory.
```

Breakpoint:

```txt
Filters/categories become useful.
Search is optional but not required.
```

### 20 Projects

Narrative:

```txt
Unsuitable as the primary discovery model.
```

Hybrid:

```txt
Strong if Explorer has categories and filters.
Featured narrative remains selective.
```

Explorer First:

```txt
Strong.
```

Breakpoint:

```txt
Search, metadata, and media governance become important.
```

### 30 Projects

Narrative:

```txt
Fails as product navigation.
```

Hybrid:

```txt
Viable if Explorer supports search, filters, direct routes, and structured case studies.
```

Explorer First:

```txt
Viable if grid and filters are strong.
```

Breakpoint:

```txt
CMS or structured content operations become materially valuable.
```

Growth conclusion:

```txt
The first hard breakpoint is 6-10 projects.
By 20 projects, a non-linear explorer is required.
By 30 projects, search, metadata, media governance, and content operations are required.
```

---

## 6. Recommendation

Recommended model:

```txt
Narrative + Explorer Hybrid
```

### Why It Wins

Hybrid wins because it preserves the portfolio's strongest differentiator while solving the core scalability problem.

It supports two user modes:

```txt
Mode 1: Guided storytelling for flagship work.
Mode 2: Fast browsing for project discovery and comparison.
```

It allows:

- 3-4 featured projects to remain cinematic.
- 10+ projects to become browsable.
- 20+ projects to become filterable.
- 30+ projects to become searchable and CMS-ready.
- Case studies to become direct, shareable destinations.
- Mobile users to avoid unnecessary scroll fatigue.

### Why Narrative Loses

Narrative loses as the long-term model because:

- It scales linearly with project count.
- It forces every project into the same expensive storytelling path.
- It prevents quick comparison.
- It creates mobile fatigue.
- It will require another redesign once project count grows.

Narrative should remain, but only as:

```txt
Featured Work
```

not:

```txt
All Work
```

### Why Explorer First Loses

Explorer First loses because:

- It discards too much of the current portfolio's distinctive value.
- It turns the Work section into a conventional inventory.
- It weakens the cinematic transition from About into Work.
- It is less compelling while project count is still small.

Explorer First may become appropriate only if:

```txt
The portfolio shifts from high-craft narrative identity to high-volume portfolio database.
```

That is not the current product direction.

### Long-Term Implications

The Work system should evolve into:

```txt
Work
├─ Featured Narrative Showcase
│  ├─ 3-4 flagship projects
│  └─ cinematic project storytelling
│
└─ Project Explorer
   ├─ all projects
   ├─ direct routes
   ├─ category filters
   ├─ search when inventory reaches 15+
   └─ case-study entry points
```

The current Work narrative should not be expanded indefinitely.

---

## 7. Future Feature Impact

### Case Studies

Hybrid requires direct case-study destinations:

```txt
/work/{slug}
```

Case studies should become the detail layer behind both Featured Work and Explorer cards.

### Project Routing

Hybrid requires project routing before Explorer reaches full value.

Minimum route model:

```txt
/work
/work/{slug}
```

The `/work` route can become the Explorer or route users to the Work section plus Explorer.

### SEO

Hybrid improves SEO because individual projects can become indexable pages while the home narrative remains brand-led.

Required later:

```txt
project title metadata
description metadata
Open Graph images
canonical URLs
structured project summaries
```

### Analytics

Hybrid creates clearer analytics events:

```txt
featured project viewed
explorer opened
filter used
search used
case study opened
contact clicked after project
```

This can reveal whether narrative or Explorer drives conversion.

### CMS

Hybrid delays CMS until the content schema is known.

CMS should support:

```txt
featured flag
project category
project tags
project year
role
stack
industry
case-study content
gallery media
SEO fields
sort order
```

CMS should not be built before:

```txt
Project routing
Case-study template
Explorer data schema
```

### Mobile UX

Hybrid gives mobile users a shorter path:

```txt
Featured swipe/story mode for highlights.
Explorer list/grid for fast browsing.
Direct case-study routes for depth.
```

This reduces dependence on long pinned scroll sequences.

### Media Management

Hybrid requires media governance earlier than Narrative does because Explorer cards need thumbnails and case studies need structured media.

Future requirements:

```txt
thumbnail image
hero image
gallery images
mobile-safe crops
alt text
brightness/theme metadata
lazy-loading strategy
```

---

## 8. Future Work Direction

FEATURE-001 should not start with runtime implementation.

Recommended next step:

```txt
FEATURE-001 — Project Discovery Hybrid Architecture
```

Scope:

```txt
Define the Hybrid IA, data model, route model, featured project rules, Explorer requirements, mobile behavior, and implementation phases.
```

Non-goals for FEATURE-001:

```txt
No Explorer implementation.
No filters implementation.
No search implementation.
No CMS implementation.
No Work runtime refactor.
```

---

## Success Criteria

Single recommended discovery model exists:

```txt
PASS
```

Project growth risks are quantified:

```txt
PASS
```

Future Work architecture direction is clear:

```txt
PASS
```

Portfolio can scale beyond 10+ projects without requiring another redesign:

```txt
PASS
```
