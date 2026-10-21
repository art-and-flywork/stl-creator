# Design: creator index, vase creator and a third creator

Date: 2026-10-21. Status: approved by the user on 2026-10-21.

## Intent

stl-creator is a collection of browser-based STL configurators. The people
it serves cannot or will not use CAD, but want a custom object: a keycap
with their own letter, a vase in their own shape. They change a few
sliders and download an STL to print (or have printed).

People usually arrive through a link to one specific creator, not through
the front page. The index is the shop window behind that door: once they
are in one creator, they should notice there is more, and the index lets
them look around.

Right now there is one creator (keycaps). This work adds the index, a vase
creator, and one more small creator, so there are enough entries to see how
the list works.

## Goals

- An index page that lists every creator, with a search box.
- Every creator links to the index ("more creators"), clearly but quietly.
- A vase creator with at least these settings: shell thickness, height,
  upper radius, bottom radius, shell curve.
- A third, small, fun creator (see "Third creator").
- One look and feel across index and creators: the style of the keycap
  creator, which the user likes and wants everywhere.
- The shared STL-app code moves into `packages/` now that a second app
  needs it (repo rule: extract only when a second app needs it).

## Non-goals

- No filter or categories on the index. The user does not know yet along
  which line visitors would sort. Search only.
- No deployment work in this round. Local `pnpm dev` is enough to see it.
  (Domains for the index and the new creators are still open.)
- No changes in behavior to the keycap creator beyond moving it onto the
  shared kit and adding the "more creators" link.
- No accounts, no backend, no uploads. Everything stays client-only.

## Anti-goals (would make this a failure even if it works)

- Jargon on screen. No "manifold", "-D", "OpenSCAD defines" or similar in
  the visitor-facing UI of index or vase. Plain words, units in mm.
- A creator that only makes sense if you came through the index. Each one
  must stand on its own as a landing page.
- The keycap creator getting worse (slower, broken share links, lost
  localStorage settings) because of the extraction.

## Constraints (from the repo)

- pnpm workspaces + Turborepo; pnpm only; `pnpm --filter <app>`.
- Apps are client-only Vite + React + TypeScript apps, plain CSS.
- OpenSCAD runs as WASM (`openscad-wasm-prebuilt` 1.2.0) in a Web Worker;
  settings go in as `-D` overrides; the `.scad` files are never patched or
  copied by an app. UI defaults are parsed from the `.scad` files where the
  keycap app already does that.
- Models live as plain folders in `models/<name>` (no submodules, decided
  today). New models: `models/vase/`, `models/<third>/`.
- Docs and comments in English. The UI is English too (as in keycaps).
- GPL-3.0.

## What the user decided

- Keycap model moved into the repo as a plain folder (done, uncommitted).
- Index: search box, no filter.
- Style: same as the keycap creator.
- Vase settings: shell thickness, height, upper radius, bottom radius,
  shell curve.
- Shell curve = whether the wall is convex or concave, as a **list of
  bulges**: each bulge has a height (mm, where along the vase it sits) and
  an amount (mm, positive bulges out, negative pinches in). One bulge gives
  e.g. a wide top tapering down; several give a "kinky" vase that goes
  wide-narrow-wide-narrow. The visitor can add and remove bulges.
- Third creator: the name keychain.

## Proposed shape (Claude's calls; the user can overrule)

### Apps and packages

```
apps/
  index/      the creator index (new)
  keycaps/    existing, moved onto the kit
  vase/       new
  <third>/    new
packages/
  stl-kit/    shared: worker + renderer, viewer, form fields, sheet dialog,
              share links, localStorage helpers, base CSS (tokens, panel
              layout), the "more creators" link, the creator catalog
models/
  keycaps/  vase/  <third>/
```

Each creator stays its own Vite app (and later its own Vercel project), as
the README already describes. The index is just another app.

### Shared kit

Move what the vase needs out of `apps/keycaps` into `packages/stl-kit`:
`Renderer` (latest request wins, cancel after 800 ms), the worker, the
viewer, `Field` components, `SheetDialog`, share-link encoding, base CSS.
The worker becomes generic: each app hands it its own model files
(each app keeps its own `import.meta.glob` over its own `models/<name>`).
How exactly (an app-side worker entry that calls into the kit, or another
way) is up to the builder. Fonts (`fonts.ts`, `FontPicker`) move to the
kit only if the third creator uses text.

### Creator catalog

One list in the kit with, per creator: id, name, one-line description,
search keywords, link, and a thumbnail. The index renders it; each
creator's "more creators" link points to the index. Links must work both
locally (each app on its own fixed dev port) and in production (URLs not
known yet; keep them in one place so they are easy to fill in). Claude's
call: while the index has no production address, the "more creators" link
is hidden in production builds, so the live keycap creator never shows a
dead link; creators without an address are left off the production index.

Thumbnails: a static image per creator, checked in. How they are made
(native OpenSCAD `--render` PNG export, a screenshot) is up to the builder.

### Index page

A page in the keycap style: a short intro in plain words (make your own
object, no CAD needed, everything happens in your browser), a search box,
and a grid of cards (image, name, one line). Search matches name,
description and keywords, as you type. With an empty result: say so, and
show everything again when the box is cleared.

### Vase creator

Same layout as keycaps: control panel on the left, 3D preview on the
right, download STL, share link, settings remembered in localStorage.

Model `models/vase/vase.scad`, a rotated profile (`rotate_extrude`), with
top-level variables so the app can parse defaults and pass `-D` values:

| Setting (UI label) | Variable | Meaning |
| --- | --- | --- |
| Height | `height` | outer height in mm |
| Bottom radius | `bottom_radius` | outer radius at the base, mm |
| Upper radius | `top_radius` | outer radius at the rim, mm |
| Shell curve | `bulges` | list of `[height, amount]` pairs in mm, e.g. `[[60, 15], [140, -10]]`; amount > 0 bulges out, < 0 pinches in |
| Shell thickness | `wall` | wall thickness, mm; the base is the same thickness |

The outer profile is a smooth curve through the base (`bottom_radius` at
0), each bulge (the straight base-to-rim radius at that height, plus its
amount) and the rim (`top_radius` at `height`). The exact curve (e.g. a
Catmull-Rom spline through those points, sampled finely) is the builder's
choice, as long as base and rim radii stay exactly as set, the curve passes
through each bulge point, and the wall keeps its thickness along the curve.
The UI keeps bulges sorted by height and stops the radius from going
below a printable minimum. Start with one bulge by default; "Add bulge"
and a remove button per bulge; a sensible cap (e.g. 8).

Ranges and defaults are the builder's call; aim for a vase that prints on
a normal printer (fits in roughly 200 × 200 × 200 mm), with a sensible
default that looks good on first load. Renders should feel live while
dragging (a simple solid of revolution should be well under a second).

### Third creator

Decided by the user: a **name keychain**: type a name, pick a font, get a flat
tag with a hole for a key ring. It reuses the keycap app's Google Fonts
picker, so fonts move into the kit. Settings: text, font, text size,
thickness, hole on/off and position.

### Docs

Update root `README.md` (layout, dev commands), root `PLAN.md` (this work
as a step, plant pot / onigiri still later), and give `apps/index`,
`apps/vase` and the third app a short `CLAUDE.md`, `PLAN.md`, `README.md`
like keycaps has.

## Left to the builder

- Package name and internal API of the kit; exact split of CSS.
- Worker wiring per app; dev ports; how URLs are configured.
- Vase curve math, ranges, defaults, `$fn`/`$fa` choices.
- Keychain geometry details.
- Thumbnail production.
- How the "more creators" link looks, within the keycap style.
