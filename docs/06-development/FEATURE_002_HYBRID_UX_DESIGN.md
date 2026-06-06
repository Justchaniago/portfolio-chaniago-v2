# Hybrid UX Design System (FEATURE-002)

Status:

```txt
DESIGN ONLY
```

Final verdict:

```txt
PASS
```

Readiness verdict:

```txt
READY FOR FEATURE-003 / FEATURE-004 / FEATURE-005 IMPLEMENTATION PLANNING
```

This document defines the complete UX system for the approved Hybrid Project Discovery model before runtime implementation begins.

No runtime code was changed.

No UI was implemented.

No routes were created.

No schemas, repository code, or CMS systems were implemented.

---

## 1. User Personas

### Recruiter

Primary Goal:

```txt
Confirm fit quickly and find proof of relevant work.
```

Discovery Behavior:

```txt
Skims Hero and About.
Looks for recognizable project types.
Jumps to Work or Project Explorer.
Uses case studies only if the project looks relevant.
```

Decision Triggers:

```txt
clear role signal
project relevance
credible outcomes
fast access to contact
professional links
```

Expected Friction:

```txt
long cinematic path
unclear project relevance
missing case-study route
too much interaction before proof
```

Desired Conversion:

```txt
Email or LinkedIn contact after viewing one or two relevant projects.
```

### Hiring Manager

Primary Goal:

```txt
Evaluate capability depth and execution quality.
```

Discovery Behavior:

```txt
Watches some featured work.
Uses Explorer to compare breadth.
Opens case studies for process, scope, and outcome.
```

Decision Triggers:

```txt
project complexity
technical ownership
business impact
implementation evidence
case-study clarity
```

Expected Friction:

```txt
not enough detail above the fold
unclear technologies
hard-to-compare projects
no direct project routes
```

Desired Conversion:

```txt
Contact after confirming both craft quality and delivery depth.
```

### Founder

Primary Goal:

```txt
Decide whether the portfolio owner can solve a high-value product problem with taste.
```

Discovery Behavior:

```txt
Experiences the narrative first.
Looks for comparable business/product context.
Uses Explorer if the featured examples are not immediately relevant.
```

Decision Triggers:

```txt
premium feel
clear product thinking
business outcome
trustworthy process
fast contact path
```

Expected Friction:

```txt
too much visual experience before business proof
missing comparable examples
unclear availability or collaboration intent
```

Desired Conversion:

```txt
Email contact after one strong featured project or relevant case study.
```

### Client

Primary Goal:

```txt
Find comparable work and understand what engagement quality looks like.
```

Discovery Behavior:

```txt
Scans Explorer by category or project type.
Uses case studies for visual proof and outcome proof.
Returns to Contact.
```

Decision Triggers:

```txt
industry relevance
visual quality
clear outcome
case-study confidence
easy inquiry path
```

Expected Friction:

```txt
no filters
no project comparison
missing contact hierarchy
unclear project deliverables
```

Desired Conversion:

```txt
Email inquiry from Contact or case-study CTA.
```

### Developer

Primary Goal:

```txt
Evaluate technical credibility and implementation maturity.
```

Discovery Behavior:

```txt
Uses Explorer to find technical projects.
Looks for stack, architecture, repository, and implementation detail.
Opens case studies with technical sections.
```

Decision Triggers:

```txt
technology stack
architecture explanation
tradeoff clarity
runtime quality
source/repo link when available
```

Expected Friction:

```txt
visual-only project cards
missing technical details
no stack filter
no case-study depth
```

Desired Conversion:

```txt
GitHub, technical case study, or direct contact.
```

---

## 2. Featured Work UX

### Experience Role

Featured Work is the premium narrative layer.

It answers:

```txt
What is your best work?
What does your taste feel like?
Can you guide me through a polished product story?
```

It does not answer:

```txt
Show me every project.
Let me compare all projects.
Let me filter by category.
```

### Entry

Users enter Featured Work through:

```txt
natural home scroll after About
Work navigation
Contact quick jump back to Work
future Explorer-to-featured link
```

### Exit

Users leave Featured Work through:

```txt
Explore All Projects CTA
View Case Study CTA
Continue to Contact
global navigation
```

### Featured Count

Recommended desktop count:

```txt
3
```

Maximum desktop count:

```txt
4
```

Recommended mobile count:

```txt
2-3
```

Maximum mobile count:

```txt
3
```

### Explore All Projects Placement

Recommendation:

```txt
Explorer should appear after Featured Work as a clear bridge before Contact.
```

Reason:

```txt
This preserves the narrative sequence while giving direct-discovery users a visible escape hatch before conversion.
```

### Explorer Preview Before Contact

Recommendation:

```txt
Yes. Include an Explorer preview or Explore All Projects bridge before Contact.
```

The preview should communicate:

```txt
there are more projects
projects can be browsed directly
the full work index exists at /work
```

It should not become:

```txt
a full Explorer inside the cinematic timeline
```

### Mobile Collapse

Recommendation:

```txt
Featured Work should not collapse entirely on mobile.
It should shorten and simplify.
```

Mobile behavior:

```txt
show fewer featured projects
make Explore All Projects available early
avoid hiding project access behind long pinned scrolling
reduce gesture ambiguity
```

### CTA Hierarchy

Primary CTA:

```txt
View Case Study
```

Secondary CTA:

```txt
Explore All Projects
```

Tertiary CTA:

```txt
Contact
```

CTA rule:

```txt
Featured Work should convert interest into either depth (case study) or breadth (Explorer).
Contact remains available but should not interrupt evaluation too early.
```

### Desktop Behavior

Desktop Featured Work should:

```txt
preserve cinematic sequencing
show high-impact project media
use one project at a time
make project title/category/outcome visible during each project
provide a clear case-study action once project interest is established
offer Explore All Projects at the end of featured sequence
```

### Mobile Behavior

Mobile Featured Work should:

```txt
reduce project count
shorten path to Explorer
keep tap targets clear
avoid hover-dependent affordances
avoid nested gesture confusion between scroll and gallery swipe
```

---

## 3. Project Explorer UX

Route:

```txt
/work
```

### Explorer Role

Explorer is the efficient discovery surface.

It answers:

```txt
What have you built?
Which projects are relevant to me?
Can I compare your work quickly?
Where can I go deeper?
```

### Grid vs List

Recommendation:

```txt
Desktop: grid-first.
Mobile: list-first or compact-card-first.
```

Desktop grid:

```txt
best for visual scanning and portfolio impact
supports category grouping
supports project comparison
```

Mobile list/compact cards:

```txt
reduces scroll fatigue
improves readability
reduces layout density problems
keeps case-study entry obvious
```

### Desktop Layout

Desktop Explorer should include:

```txt
page title / concise positioning
category row
future search slot
future filter slot
project grid
contact or availability CTA after project set
```

### Mobile Layout

Mobile Explorer should include:

```txt
compact title
horizontal category chips
collapsible filters when filters exist
vertical project list or one-column cards
sticky or repeated lightweight navigation only if non-intrusive
clear return to Home / Contact paths
```

### Category Visibility

Initial category visibility:

```txt
visible as top-level discovery chips or tabs
```

Category behavior:

```txt
categories help users narrow without opening a complex filter panel
categories should be data-driven
all projects remains the default view
```

### Future Filter Placement

Desktop:

```txt
filters near category row, likely as a compact panel or segmented filter area
```

Mobile:

```txt
filters behind a collapsible control below category chips
```

Filter rule:

```txt
Do not implement filters until project schema and inventory justify them.
```

### Future Search Placement

Desktop:

```txt
near the top of /work, after title and before grid
```

Mobile:

```txt
below title and above category chips, or behind a search icon if inventory is still small
```

Search rule:

```txt
Search becomes useful around 15+ projects.
```

### Card Hierarchy

Immediately visible on card:

```txt
cover image or thumbnail
title
category
summary
year
primary technology or technology cluster
case-study affordance
```

Secondary card detail:

```txt
featured marker
role
industry
brief outcome
```

Requires entering case study:

```txt
full problem
full solution
full outcome
technical breakdown
gallery deep dive
process notes
links
related projects
```

### Empty States

Explorer empty states:

```txt
no published projects
no category result
no filter result
future no search result
```

Empty state behavior:

```txt
explain what happened
offer reset action
offer Contact path
never strand the user
```

### Loading States

Loading states should:

```txt
reserve project card space
avoid layout jumps
show lightweight skeletons or staged loading
avoid blocking the entire page when partial project data is available
```

---

## 4. Case Study UX

Route:

```txt
/work/[slug]
```

### Case Study Role

Case Study is the depth layer.

It answers:

```txt
What was the problem?
What did you do?
How did the solution work?
Why should I trust you?
What should I do next?
```

### Information Hierarchy

Recommended order:

```txt
Project Hero
Overview / summary
Problem
Solution
Outcome
Media
Technical Details
Role / stack / timeline
Related Projects
Contact CTA
```

### Hero Section

Above the fold should include:

```txt
project title
category
one-sentence summary
primary outcome or impact statement
hero media
case-study navigation context
primary CTA to contact or continue reading
```

Above the fold should not include:

```txt
full technical detail
full gallery
long process narrative
all metadata
```

### Scroll Depth

Recommended scroll model:

```txt
summary above fold
proof and story below fold
technical details after outcome
conversion repeated near end
```

Reason:

```txt
Recruiters and founders need quick signal.
Hiring managers and developers need depth.
The page must support both scanning and reading.
```

### Problem

Problem section should define:

```txt
user/business problem
constraints
stakes
```

### Solution

Solution section should define:

```txt
product approach
design/technical approach
key decisions
tradeoffs
```

### Outcome

Outcome section should define:

```txt
impact
result
learning
measurable outcome when available
qualitative outcome when metrics are unavailable
```

### Media

Media should support:

```txt
hero image
gallery
mobile-safe crops
captions
alt text
```

Media should not overwhelm the narrative before the project value is clear.

### Technical Details

Technical detail should be expandable or sectioned.

Recommended content:

```txt
stack
architecture highlights
integration details
performance considerations
interesting constraints
repo/live links if available
```

### Contact CTA

Primary case-study CTA:

```txt
Start a conversation / Contact
```

Secondary CTA:

```txt
Explore more projects
```

### Related Projects

Recommendation:

```txt
Yes. Related Projects should exist.
```

Related Projects should be:

```txt
category-related
technology-related
industry-related
or manually curated later
```

Related Projects should not appear before the main case-study outcome.

---

## 5. Navigation Architecture

### Desktop Navigation

Desktop navigation should support:

```txt
Home
About
Work
Contact
```

Recommendation:

```txt
Work should route users to the Work ecosystem, not only the featured sequence.
```

Desktop Work behavior:

```txt
from Home context: Work can jump to Featured Work
from global nav or direct route: /work opens Explorer
```

### Mobile Navigation

Mobile navigation should prioritize:

```txt
Work
Contact
Home
```

Mobile should avoid:

```txt
deep nested menus
tiny project navigation controls
hover-only states
forcing cinematic path before Explorer access
```

### Global Navigation

Recommendation:

```txt
Explorer should not be a separate top-level nav item.
Work and Explorer should be merged under Work.
```

Reason:

```txt
The product language should remain simple.
Work contains both Featured Work and Project Explorer.
```

### Work Navigation

Work-specific navigation should support:

```txt
Featured
All Projects
Case Studies
Contact
```

This can be represented inside `/work` rather than global navigation.

### Case Study Navigation

Case-study pages should include:

```txt
Back to Work
Previous/next or related projects
Contact
Home
```

Case Studies should not appear as individual global nav items.

### Recommendation

```txt
Work and Explorer are merged.
Case Studies are not global nav items.
/work is the full Explorer.
Home Featured Work remains a narrative section.
```

---

## 6. Conversion Architecture

### Recruiter Path

```txt
Entry: Home or /work
→ Discovery: Explorer or Featured Work
→ Evaluation: project card + one case study
→ Trust: role, outcome, professional links
→ Contact: email or LinkedIn
```

Primary CTA:

```txt
Contact
```

Secondary CTA:

```txt
View Case Study
```

Drop-off risks:

```txt
too much motion before proof
missing direct case-study route
generic LinkedIn link
```

### Founder Path

```txt
Entry: Home
→ Discovery: Featured Work
→ Evaluation: business outcome and taste
→ Trust: case-study story and impact
→ Contact: email inquiry
```

Primary CTA:

```txt
Start a conversation
```

Secondary CTA:

```txt
Explore relevant projects
```

Drop-off risks:

```txt
unclear business relevance
no availability statement
too much visual proof without outcome proof
```

### Client Path

```txt
Entry: Home or /work
→ Discovery: Explorer categories
→ Evaluation: comparable project and case study
→ Trust: outcome, media, process
→ Contact: email
```

Primary CTA:

```txt
Contact
```

Secondary CTA:

```txt
View related projects
```

Drop-off risks:

```txt
no category browsing
no project comparison
no clear service/capability signal
```

### Developer Path

```txt
Entry: /work or Home
→ Discovery: technology/category project scan
→ Evaluation: technical details in case study
→ Trust: architecture, stack, links
→ Contact: GitHub or email
```

Primary CTA:

```txt
View technical details
```

Secondary CTA:

```txt
GitHub / Contact
```

Drop-off risks:

```txt
missing stack data
case studies too visual
no technical depth
```

### Conversion Opportunities

Place conversion options at:

```txt
end of Featured Work
top of /work after project scan
case-study hero
case-study end
Contact section
```

CTA hierarchy:

```txt
Primary: Contact / Start a conversation
Secondary: View Case Study
Tertiary: Explore All Projects
```

---

## 7. Mobile Experience

### Featured Work Mobile

Mobile Featured Work should:

```txt
limit featured count to 2-3
show Explore All Projects early
avoid requiring long pinned scroll
make case-study CTA tap-friendly
avoid hover-only interactions
```

### Explorer Mobile

Mobile Explorer should:

```txt
use compact one-column cards or list cards
show category chips before filters
make filters collapsible
defer search until inventory justifies it
keep card text concise
make case-study CTA obvious
```

### Case Study Mobile

Mobile Case Study should:

```txt
put title, summary, outcome, and CTA high on page
make media progressive
avoid heavy gallery before problem/solution/outcome
use section anchors only if content becomes long
include Back to Work
include Contact near end
```

### Navigation Mobile

Mobile navigation should:

```txt
merge Work and Explorer
avoid adding Explorer as a separate global item
surface Contact clearly
avoid tiny rail-only navigation as the only path
```

### Contact Mobile

Mobile Contact should:

```txt
prioritize email
show professional links clearly
avoid relying on hover interaction for value
keep quick jumps usable
```

Mobile design goal:

```txt
Reduce scroll fatigue.
Reduce gesture conflicts.
Preserve premium feel through pacing, typography, and media rather than excessive gesture complexity.
```

---

## 8. Scalability Simulation

### 3 Projects

What breaks:

```txt
Nothing major. Explorer may feel light if over-designed.
```

What remains stable:

```txt
Featured Work can show all projects.
Case-study routes already provide value.
```

Required upgrades:

```txt
case-study routes
basic /work Explorer shell
```

### 5 Projects

What breaks:

```txt
Narrative starts feeling long if all 5 are featured.
```

What remains stable:

```txt
Featured 3 + Explorer all 5.
```

Required upgrades:

```txt
Explore All Projects bridge
category labels
case-study route completion
```

### 10 Projects

What breaks:

```txt
Linear-only browsing.
Unfiltered project comparison.
Mobile scroll patience.
```

What remains stable:

```txt
Featured Work capped at 3-4.
Explorer card model.
/work and /work/[slug] route structure.
```

Required upgrades:

```txt
category chips
basic filters
strong mobile list/card behavior
```

### 20 Projects

What breaks:

```txt
manual browsing by visual scan only
weak metadata
media loading without governance
```

What remains stable:

```txt
Hybrid IA
featured cap
case-study routing
Explorer as primary inventory
```

Required upgrades:

```txt
filters
search planning
metadata quality
media loading strategy
analytics events
```

### 30 Projects

What breaks:

```txt
Explorer without search
manual content maintenance
unstructured media
ad hoc ordering
```

What remains stable:

```txt
Featured narrative remains independent.
Explorer remains inventory owner.
Case-study route remains detail owner.
```

Required upgrades:

```txt
search
CMS readiness
repository layer
SEO metadata
published/draft lifecycle
```

### 50 Projects

What breaks:

```txt
static/manual content operations
unpaginated or non-progressive Explorer
weak taxonomy
unmanaged media library
```

What remains stable:

```txt
Hybrid top-level IA
Featured Work cap
/work route
/work/[slug] route
Contact conversion path
```

Required upgrades:

```txt
CMS/Admin workflow
progressive loading or pagination
search indexing
taxonomy governance
media management
analytics review loop
```

---

## 9. Final UX Recommendation

### Recommended Experience

Home:

```txt
Hero
→ About
→ Featured Work
→ Explore All Projects bridge
→ Contact
```

Work:

```txt
/work
→ Project Explorer
→ categories
→ future filters/search
→ project cards
→ case-study entries
```

Case Study:

```txt
/work/[slug]
→ project hero
→ summary
→ problem
→ solution
→ outcome
→ media
→ technical details
→ related projects
→ contact
```

Contact:

```txt
direct email first
professional links second
quick jumps preserved
```

### Recommended Discovery Flow

```txt
Featured Work
→ Explorer bridge
→ Project Explorer
→ Case Study
→ Contact
```

### Recommended Mobile Flow

```txt
Hero
→ About
→ shortened Featured Work
→ early Explore All Projects
→ compact Explorer
→ Case Study summary-first page
→ Contact
```

### Recommended Conversion Flow

```txt
Visitor
→ chooses narrative or direct discovery
→ evaluates project card or case study
→ sees proof and outcome
→ contacts via email or professional link
```

### Final Decisions

Explorer after Featured Work:

```txt
YES
```

Explorer preview before Contact:

```txt
YES, as a bridge or preview, not a full duplicate Explorer.
```

Featured Work collapse on mobile:

```txt
NO. Shorten and simplify it instead.
```

Explorer as separate global nav item:

```txt
NO. Merge Explorer under Work.
```

Case Studies in global navigation:

```txt
NO. Case studies are entered from Featured Work, Explorer, or related projects.
```

Related Projects:

```txt
YES. Include after the main case-study outcome and content.
```

---

## Implementation Readiness Notes

FEATURE-003 can use this document to design Project Explorer runtime behavior.

FEATURE-004 can use this document to design Case Study route and page behavior.

FEATURE-005 can use this document to align schema fields with UX needs.

FEATURE-006 can use this document to avoid building CMS fields that do not support actual discovery or conversion behavior.

---

## Success Criteria

Featured Work UX defined:

```txt
PASS
```

Project Explorer UX defined:

```txt
PASS
```

Case Study UX defined:

```txt
PASS
```

Desktop, mobile, navigation, and conversion flows defined:

```txt
PASS
```

Scalability simulation completed:

```txt
PASS
```

No runtime code modified:

```txt
PASS
```
