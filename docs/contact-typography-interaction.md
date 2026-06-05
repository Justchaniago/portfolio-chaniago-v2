# JUST CHANIAGO Typography Interaction Architecture

## Current Architecture

The typography is implemented in `components/sections/Contact.tsx`.

The rendered DOM hierarchy is:

```txt
Contact section
└─ .contact-content-wrapper
   └─ .contact-title-debug
      ├─ span.contact-title-char-wrap
      │  └─ span.contact-title-char  // "J"
      ├─ span.contact-title-char-wrap
      │  └─ span.contact-title-char  // "U"
      ├─ ...
      ├─ span.contact-title-space    // space between JUST and CHANIAGO
      ├─ ...
      └─ span.contact-title-char-wrap
         └─ span.contact-title-char  // "O"
```

Important detail: the dots are not individual DOM nodes. They are produced by the `Bitcount Grid Single` font glyphs.

The real visual hierarchy is:

```txt
JUST CHANIAGO
└─ characters as DOM spans
   └─ font glyph shapes
      └─ visual dots drawn by the font, not addressable elements
```

The text is generated from:

```ts
const CONTACT_TITLE = 'JUST CHANIAGO';
```

Every non-space character gets:

```txt
.contact-title-char-wrap
└─ .contact-title-char
```

The space gets:

```txt
.contact-title-space
```

## Hover Pipeline

The hover engine is implemented with pointer events and direct CSS variable mutation.

Event listeners:

```tsx
onPointerMove={handleTitlePointerMove}
onPointerLeave={resetTitleHover}
```

These handlers are attached to:

```txt
.contact-title-debug
```

The hover system uses:

```txt
React pointer events
DOM reads with getBoundingClientRect()
Direct CSS variable writes with element.style.setProperty()
CSS radial-gradient clipped to text
```

The hover system does not use:

```txt
requestAnimationFrame
React state
GSAP ticker
Framer Motion
Canvas
```

On every pointer move over the title, the implementation loops through all `.contact-title-char` elements and updates these CSS variables:

```txt
--contact-hover-x
--contact-hover-y
--contact-hover-stop
```

On pointer leave, it resets:

```txt
--contact-hover-stop: 0%
```

## Proximity Calculation

Each character decides its red intensity by measuring cursor distance to the center of the character span.

It does not measure distance to each visual dot, because dots are part of the font glyph and are not DOM elements.

Current radius:

```ts
const TITLE_HOVER_RADIUS = 150;
```

Current formula:

```ts
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
const strength = Math.max(0, 1 - distance / TITLE_HOVER_RADIUS);
const hoverStop = Math.round(strength * 62);
```

Expanded:

```txt
distance = sqrt((cursorX - charCenterX)^2 + (cursorY - charCenterY)^2)

strength = max(0, 1 - distance / 150)

hover stop = round(strength * 62)%
```

The activation threshold is effectively `150px` from a character center. Outside that radius, `strength` becomes `0`, so the red area disappears.

## Rendering Strategy

When a character is active, no individual dot element changes. The inner character span changes its text fill through a radial gradient.

Current CSS:

```css
.contact-title-char {
  color: transparent;
  background-image: radial-gradient(
    circle 112px at var(--contact-hover-x, 50%) var(--contact-hover-y, 50%),
    #ff3b30 0 var(--contact-hover-stop, 0%),
    #fff calc(var(--contact-hover-stop, 0%) + 22%)
  );
  background-clip: text;
  -webkit-background-clip: text;
}
```

Changed properties during hover:

```txt
color: transparent
background-image: radial-gradient(...)
background-clip: text
-webkit-background-clip: text
```

The hover interaction does not currently change:

```txt
opacity
scale
transform
filter
```

The red area appears because the font glyph is used as a text mask over the gradient. Since Bitcount Grid Single renders dot-like glyphs, the gradient appears to color nearby dots red.

## Reveal Pipeline

```txt
Reveal Layer:
GSAP animates each .contact-title-char vertically from y: 112% to y: 0%, with opacity 0 to 1.
It uses staggered character animation.
```

Reveal animation:

```ts
gsap.fromTo(
  chars,
  {
    y: '112%',
    opacity: 0,
  },
  {
    y: '0%',
    opacity: 1,
    duration: 0.82,
    stagger: 0.045,
    ease: 'power4.out',
  }
);
```

Reverse reveal animation:

```ts
gsap.to(chars, {
  y: '112%',
  opacity: 0,
  duration: 0.82,
  stagger: {
    each: 0.045,
    from: 'end',
  },
  ease: 'power4.in',
});
```

```txt
Interaction Layer:
Pointer movement updates CSS variables on the same .contact-title-char elements.
Those variables only affect the background gradient/text color.
```

The reveal and hover systems are mostly independent.

They share the same DOM element, `.contact-title-char`, but they control different rendering concerns:

```txt
Reveal:
transform + opacity controlled by GSAP

Hover:
background-image position/stop controlled by CSS variables
```

The coupling risk is low, but both systems operate on the same character spans.

## Performance Notes

For `JUST CHANIAGO`:

```txt
Text length including space: 13
Rendered character spans excluding space: 12
Space spans: 1
Glyph count: 12 font glyphs
Dot count: not available from DOM
```

The dot count cannot be reported exactly because dots are inside the font glyph outlines, not actual elements.

Approximate DOM count for the title:

```txt
1 title container
12 .contact-title-char-wrap spans
12 .contact-title-char spans
1 .contact-title-space span
Total title DOM nodes: 26
```

Expected performance cost is light.

On pointer move, the code loops over 12 characters, reads `getBoundingClientRect()` for each, then writes 3 CSS variables per character.

That means each pointer move performs approximately:

```txt
12 layout reads
36 CSS variable writes
```

This is acceptable at the current scale.

The main performance caveat is that `getBoundingClientRect()` runs for every character on every pointer event. That is fine for 12 characters, but it would be less ideal for much longer text or more complex interactions.

## Recommended Improvements

1. Cache character rectangles while hovered

Currently every pointer move reads layout for all characters. Caching rects on `pointerenter` and refreshing on resize or scroll would make hover smoother without changing the current architecture.

2. Smooth hover values instead of immediate jumps

CSS variables update directly per pointer event. Adding a small interpolation layer would make the red sweep feel more liquid and premium while keeping the same gradient-based system.

3. Tune the gradient edge

The current transition from red to white is controlled by `+ 22%`. Adjusting that edge width, red radius, and falloff can make the effect feel less like a hard spotlight and more like dots warming up under the cursor.
