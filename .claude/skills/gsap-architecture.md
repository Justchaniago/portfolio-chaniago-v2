GSAP ARCHITECTURE

Golden Rule

Never create animation conflicts.

⸻

Timeline Ownership

One section.

One owner timeline.

Avoid timeline duplication.

⸻

ScrollTrigger Rules

Before adding ScrollTrigger:

Check:

* existing triggers
* existing pinning
* existing timelines

⸻

Mobile Rules

Desktop animations are not automatically valid on mobile.

Use:

ScrollTrigger.matchMedia()

for responsive behavior.

⸻

Cleanup Rules

Every GSAP setup must include cleanup.

Example:

ctx.revert()

or

ScrollTrigger.kill()

⸻

Performance Budget

Avoid:

* excessive blur
* unnecessary filters
* nested pinning
* animation spam

Prioritize smoothness.

⸻

Debug Checklist

Before adding animation:

Check:

* z-index
* transform conflicts
* opacity conflicts
* pin conflicts
* sticky conflicts

Most animation bugs come from these.