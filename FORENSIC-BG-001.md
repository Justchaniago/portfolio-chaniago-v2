# FORENSIC-BG-001 OUTPUT

## Command 1 — grep background app/globals.css
146:  background: var(--color-bg);
160:  background: var(--color-void);
164:  background: var(--color-graphite);
169:  background: var(--color-onyx);
203:  background-color: var(--color-card-bg, #F9F9F9);
240:  background-color: rgba(10, 10, 10, 0.3);
255:  transition: background-color 350ms cubic-bezier(0.4, 0, 0.2, 1),
264:  background-color: rgba(10, 10, 10, 0.35);
272:  background-color: rgba(10, 10, 10, 0.3);
309:  background-color: #050505;

## Command 2 — grep --color-bg app/globals.css
app/globals.css:34:  --color-bg: var(--color-void);
app/globals.css:115:  --color-bg: var(--color-bg);
app/globals.css:146:  background: var(--color-bg);

## Command 3 — grep background app/page.tsx
app/page.tsx:5:    <main className="w-full min-h-screen bg-void">

## Command 4 — grep background PinnedSections.tsx
components/sections/PinnedSections.tsx:31:    // background now hardcoded on about-section-container

## Command 5 — grep color values globals.css
app/globals.css:6:  --color-void: #0A0A0A;
app/globals.css:16:  --color-white: #FFFFFF;
app/globals.css:30:  --color-linen: #FFFFFF;
app/globals.css:34:  --color-bg: var(--color-void);
app/globals.css:103:  --color-void: var(--color-void);
app/globals.css:115:  --color-bg: var(--color-bg);
app/globals.css:146:  background: var(--color-bg);
app/globals.css:160:  background: var(--color-void);

## Command 6 — grep body/html/main background globals.css
[no output]

## Command 7 — grep bg- classes page and layout
app/page.tsx:5:    <main className="w-full min-h-screen bg-void">
app/layout.tsx:60:      <body className="min-h-full flex flex-col bg-void text-white">

## Command 8 — grep background EnvironmentTransitionLayer
components/transitions/EnvironmentTransitionLayer.tsx:147:          background: #FFFFFF;
components/transitions/EnvironmentTransitionLayer.tsx:157:          background: #FFFFFF;
