# Contact Link Hover Forensic Audit

## Scope

This report audits the Contact section utility link hover animation only.

No code changes were made for this audit.

Audited links:

- `HOME`
- `ABOUT`
- `WORK`
- `CHANIAGOATWORK@GMAIL.COM`
- `LINKEDIN ↗`
- `GITHUB ↗`

Observed issue from user screenshot:

```txt
LINKEDIN
↓
blank state
↓
LINKEDIN
```

Expected behavior:

```txt
old glyph moves upward
while
new glyph enters from below
```

Every character slot should remain visually occupied during the transition.

## DOM Hierarchy

The utility link text is rendered as a per-character replacement system.

Actual structure:

```txt
a.contact-utility-link
└─ span.contact-link-text
   └─ span.contact-link-char
      ├─ span.contact-link-char-front
      └─ span.contact-link-char-back
```

For `LINKEDIN ↗`, each character is split into its own slot:

```txt
LINKEDIN ↗
├─ L
│  ├─ front: L
│  └─ back:  L
├─ I
│  ├─ front: I
│  └─ back:  I
├─ N
│  ├─ front: N
│  └─ back:  N
├─ K
│  ├─ front: K
│  └─ back:  K
├─ E
│  ├─ front: E
│  └─ back:  E
├─ D
│  ├─ front: D
│  └─ back:  D
├─ I
│  ├─ front: I
│  └─ back:  I
├─ N
│  ├─ front: N
│  └─ back:  N
├─ space
│  ├─ front: non-breaking space
│  └─ back:  non-breaking space
└─ ↗
   ├─ front: ↗
   └─ back:  ↗
```

Source reference:

- `components/sections/Contact.tsx`
- `renderUtilityText()`
- `.contact-link-char`
- `.contact-link-char-front`
- `.contact-link-char-back`

## Computed Style Findings

The character slot is the clipping mask:

```css
.contact-link-char {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: 1em;
  line-height: 1;
  vertical-align: bottom;
}
```

The outgoing layer:

```css
.contact-link-char-front {
  display: block;
  transform: translateY(0%);
}
```

The incoming layer:

```css
.contact-link-char-back {
  position: absolute;
  inset: 0;
  display: block;
  transform: translateY(100%);
}
```

Important findings:

- Both layers exist in the DOM.
- Both layers are visible by default.
- Neither layer is hidden with `display: none`.
- Neither layer is hidden with `visibility: hidden`.
- Neither layer is hidden with `opacity: 0`.
- No `z-index` conflict is visible in the source.
- The visible blank state is caused by transform position relative to the clipping mask.

The blank state happens when this condition occurs:

```txt
front layer: above the mask
back layer: below the mask
```

Because `.contact-link-char` has `overflow: hidden`, if both layers are outside the mask at the same time, the slot appears empty.

## Timeline Findings

Current hover handler:

```ts
function animateUtilityLink(el: HTMLElement, active: boolean) {
  const previous = utilityTimelineRef.current.get(el);
  previous?.kill();

  const charSlots = Array.from(el.querySelectorAll<HTMLElement>('.contact-link-char'));
  const tl = gsap.timeline();
  const slotStagger = 0.04;
  const frontStart = active ? 0 : -100;
  const frontEnd = active ? -100 : 0;
  const backStart = active ? 100 : 0;
  const backEnd = active ? 0 : 100;

  charSlots.forEach((slot, index) => {
    const startAt = index * slotStagger;

    tl.fromTo(front, { yPercent: frontStart }, { yPercent: frontEnd }, startAt);
    tl.fromTo(back, { yPercent: backStart }, { yPercent: backEnd }, startAt);
  });
}
```

Timeline settings:

```txt
duration: 0.84s per character layer
stagger: 0.04s per character slot
ease: power4.out
```

For each character slot, source code places front and back on the same timeline position:

```txt
front starts at: index * 0.04
back starts at:  index * 0.04
```

Source-level overlap answer:

```txt
Do outgoing and incoming layers start at the same source timeline position?
YES
```

Runtime visual answer based on the screenshot:

```txt
Do outgoing and incoming layers remain visibly overlapped inside the mask?
NO
```

The visual result proves that source-level overlap is not enough. The layers can still be outside the masked slot at the same time because the timeline is killed and recreated with different `fromTo()` starting states.

## Screenshot Evidence

User-provided screenshot shows the blank state clearly.

Frame with issue:

```txt
CONNECT

CHANIAGOATWORK@GMAIL.COM

GITHUB ↗
```

Expected link between email and GitHub:

```txt
LINKEDIN ↗
```

In the blank frame, `LINKEDIN ↗` is absent entirely.

That confirms the issue is not just a single-character gap. The full row can become visually empty.

## Overlap Verification

Source timeline:

```txt
front and back animations are inserted at the same `startAt`
```

So the implementation intends to overlap them.

However, the visible result disproves continuous overlap inside the mask:

```txt
front exits clipping area
back has not entered clipping area
```

Final verification:

```txt
Timeline overlap exists in source: YES
Visible overlap inside the character mask: NO
```

## Root Cause

The root cause is the combination of:

1. Per-hover timeline recreation.
2. Killing the previous timeline on every enter and leave.
3. `fromTo()` forcing new start values.
4. A strict `overflow: hidden` character mask.
5. Front and back layers being allowed to occupy opposite off-screen states.

The failure mode:

```txt
hover state changes
↓
previous timeline is killed
↓
new fromTo timeline forces transform start values
↓
front may already be outside the mask
↓
back may still be outside the mask
↓
slot becomes empty
```

This is why the issue appears as:

```txt
LINKEDIN
↓
blank
↓
LINKEDIN
```

It is not primarily an opacity problem.

It is not primarily a z-index problem.

It is not caused by missing DOM nodes.

It is a transform-state continuity problem.

## Design Alignment Review

Intended interaction:

```txt
continuous rolling text conveyor
```

Current behavior:

```txt
text replacement with intermittent empty state
```

Mismatches:

- The word can disappear completely.
- The character slots are not guaranteed to stay occupied.
- The motion reads like replacement, not conveyor movement.
- The hover feels visually interrupted.
- The animation state can reset instead of continuing physically.

## Recommended Fix

Do not rebuild the utility link architecture.

Recommended direction:

1. Create one paused GSAP timeline per link.
2. Initialize front and back layer positions once.
3. On hover enter, play the existing timeline.
4. On hover leave, reverse the existing timeline.
5. Do not kill and recreate the timeline on every hover state change.

Target model:

```txt
initial:
front yPercent: 0
back  yPercent: 100

hover active:
front yPercent: -100
back  yPercent: 0

hover leave:
timeline reverses
```

This keeps animation continuity and prevents both layers from being outside the mask at the same time.

For each character slot, the invariant should be:

```txt
at least one layer must intersect the visible mask at every frame
```

## Final Audit Result

The current DOM structure supports the desired interaction.

The current GSAP timeline attempts simultaneous front/back movement.

The blank state occurs because timeline recreation and `fromTo()` start values can break visual continuity inside the clipped character slot.

The correct fix is not a new visual system. It is timeline lifecycle refinement:

```txt
from kill/recreate per hover
to persistent timeline play/reverse
```
