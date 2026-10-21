# Creator index, vase and keychain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shared STL-app kit, a vase creator, a name-keychain creator and an index page with search, all in the keycap creator's style.

**Architecture:** `packages/stl-kit` is a source-only TS/React package (no build step; Vite compiles it inside each app) holding the render pipeline, UI components, fonts, base CSS and the creator catalog. Every creator stays its own Vite app with its own model folder in `models/`; the index is one more Vite app that reads the catalog.

**Tech Stack:** pnpm workspaces, Turborepo, Vite 8, React 19, TypeScript 7, three.js / react-three-fiber, `openscad-wasm-prebuilt` 1.2.0, Vitest for pure logic, native `openscad` (Homebrew) for model smoke tests.

**Spec:** `docs/superpowers/specs/2026-10-21-index-and-vase-design.md`

## Global Constraints

- pnpm only; app commands via `pnpm --filter <app>`.
- Client-only apps; settings reach OpenSCAD only as `-D` overrides; apps never patch or copy `.scad` files.
- Models are plain folders: `models/vase/`, `models/keychain/`.
- UI text in English, plain words, units in mm; no "manifold", "-D", "defines" or similar on screen in index, vase or keychain.
- Docs and comments in English. GPL-3.0.
- Keycaps must keep working exactly as now: same localStorage keys (`keycap-stl:params`, `keycap-stl:font`, `keycap-stl:mode`), same `#set=` share-link format, same render speed.
- Style: the keycap creator's tokens and layout (`apps/keycaps/src/index.css`, `App.css`).
- Fixed dev ports (`strictPort: true`): index 5170, keycaps 5171, vase 5172, keychain 5173.
- No filter on the index, search only.

## Review Focus

1. Old keycaps share links and stored settings still load after the move to the kit → Task 3 verifies with a link made before the change.
2. Vase bulges at nearly the same height, or at the very base/rim, make the spline loop or self-intersect → `normalizeBulges` test in Task 6 (min gap, clamped range).
3. A bulge pinching the radius below the wall thickness makes the cavity vanish or the wall break → clamp in the model (Task 5) and a smoke render with an extreme negative bulge.
4. Keychain with an empty name, or with no font loaded (offline) → Task 7: empty name renders a blank tag with ring, missing font shows the warning, no crash.
5. Production build shows a "more creators" link or index card pointing at localhost → `creatorUrl`/`indexUrl` tests in Task 4 for prod mode.

---

### Task 1: Branch and commit the groundwork

**Files:** the already staged submodule removal, `docs/superpowers/specs/…`, `docs/superpowers/plans/…`

- [ ] **Step 1:** `git switch -c index-and-vase`
- [ ] **Step 2:** Commit the staged submodule removal: message "Move the keycap model into the repo as a plain folder".
- [ ] **Step 3:** Commit spec and plan: message "Design and plan: creator index, vase and keychain".

### Task 2: Kit package with pure helpers

**Files:**
- Create: `packages/stl-kit/package.json` (name `@stl-creator/stl-kit`, `"type": "module"`, `exports` map to source files, scripts `test: vitest run`, `lint: oxlint`), `packages/stl-kit/tsconfig.json`
- Create: `packages/stl-kit/src/scad.ts`, `src/share.ts`, `src/storage.ts`
- Test: `packages/stl-kit/src/scad.test.ts`, `src/share.test.ts`
- Modify: `turbo.json` (add `test` task), root `package.json` (`test` script)

**Interfaces:**
- Produces:
  - `toScad(value: unknown): string` (moved verbatim from `apps/keycaps/src/scad/params.ts`)
  - `parseScadDefaults(source: string): Record<string, unknown>` (the body of keycaps' `scadDefaults` + `readValue` + `stringEnd`, taking source instead of a file name)
  - `modelFilesFrom(raw: Record<string, string>, folder: string, skip?: RegExp): Record<string, string>`: keys become paths inside `models/<folder>/`
  - `changedFrom<T extends object>(defaults: T, values: T): Partial<T>`; `mergeKnown<T extends object>(defaults: T, partial: Record<string, unknown>): T` (keeps only known keys with the same shape, as in keycaps' `readSharedSet`)
  - `toBase64Url(text: string): string`; `fromBase64Url(text: string): string`; `clearHash(): void`
  - `loadStored<T>(key: string, defaults: T, merge?: (d: T, saved: unknown) => T): T`; `saveStored(key: string, value: unknown): void` (both swallow storage errors)

- [ ] **Step 1: Failing tests**

```ts
expect(toScad([1, 'a', true])).toBe('[1, "a", true]')
expect(parseScadDefaults('height = 160; // mm\nbulges = [[60, 15]];\nx = sin(3);')).toEqual({ height: 160, bulges: [[60, 15]] })
expect(modelFilesFrom({ '../../models/vase/vase.scad': 'a' }, 'vase')).toEqual({ 'vase.scad': 'a' })
expect(changedFrom({ a: 1, b: [1] }, { a: 2, b: [1] })).toEqual({ a: 2 })
expect(mergeKnown({ a: 1, b: [1] }, { a: 'x', b: [2], c: 3 })).toEqual({ a: 1, b: [2] })
expect(fromBase64Url(toBase64Url('vaas ✓'))).toBe('vaas ✓')
```

- [ ] **Step 2:** `pnpm --filter @stl-creator/stl-kit test`: FAIL (modules missing).
- [ ] **Step 3:** Implement the helpers listed above.
- [ ] **Step 4:** `pnpm --filter @stl-creator/stl-kit test`: PASS. `pnpm install` links the workspace package.
- [ ] **Step 5:** Commit "Start packages/stl-kit with the shared pure helpers".

### Task 3: Move render pipeline, UI and styles into the kit; keycaps on the kit

**Files:**
- Create in `packages/stl-kit/src/`: `render/renderer.ts`, `render/worker.ts`, `ui/Field.tsx`, `ui/SheetDialog.tsx` + `.css`, `ui/Viewer.tsx`, `ui/StatusLine.tsx` (StatusLine + Loader + `RenderStatus` type), `ui/icons.tsx` (ShareIcon, DownloadIcon), `ui/actions.ts`, `fonts/fonts.ts`, `fonts/FontPicker.tsx`, `styles/base.css` (from keycaps `index.css`), `styles/app.css` (shared panel/stage parts of keycaps `App.css`)
- Create: `apps/keycaps/src/render.worker.ts`
- Modify: `apps/keycaps/src/App.tsx`, `src/main.tsx`, `src/App.css` (keep only keycap-specific rules), `src/scad/files.ts`, `src/scad/params.ts`, `src/share.ts`, `package.json` (depend on `@stl-creator/stl-kit: workspace:*`), `vite.config.ts` (port 5171)
- Delete: the moved files from `apps/keycaps/src` (`scad/renderer.ts`, `scad/openscad.worker.ts`, `fonts.ts`, `components/Field.tsx`, `FontPicker.tsx`, `SheetDialog.*`)

**Interfaces:**
- Consumes: Task 2 helpers.
- Produces:
  - `serveRenders(files: Record<string, string>, root: string): void` in `@stl-creator/stl-kit/worker`: today's worker body, writing files under `/${root}/`; request/response types unchanged (`RenderRequest { id, file, defines, font? }`).
  - `new Renderer(spawn: () => Worker)`; `render(req: { file: string; defines: string[]; font?: Uint8Array }): Promise<RenderResult>`; `Superseded`. Each app spawns with `() => new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })`.
  - `Slider`, `Choice`, `Toggle`, `Section`, `type Range` (moved from keycaps `params.ts`).
  - `Viewer({ stl, frameKey, children?: (model: { geometry: BufferGeometry; origin: Vector3 }) => ReactNode })`: without `children` it draws the default plastic mesh; keycaps keeps `KeyPicker`/`Footprint`/`LegendInput` in `apps/keycaps/src/components/KeyPicker.tsx` and passes them as `children`. Export `PLASTIC`, `FOCUS` colours.
  - `StatusLine({ status, hasModel })`, `type RenderStatus` (the `Status` union from keycaps App).
  - `downloadStl(stl: ArrayBuffer, name: string): void`; `shareLink(url: string, title: string): Promise<'shared' | 'copied' | 'failed'>`.
  - fonts: as today, but `loadFontChoice(storageKey: string)` / `saveFontChoice(storageKey: string, choice)`; keycaps passes `'keycap-stl:font'`.
  - Import paths: `@stl-creator/stl-kit` (main), `/worker`, `/fonts`, `/styles/base.css`, `/styles/app.css`.

- [ ] **Step 1:** Before changing anything, run keycaps (`pnpm --filter keycaps dev`), change a few settings, click "Share this set" and save that link in the scratchpad.
- [ ] **Step 2:** Move the code as listed. Keep keycaps class names, so its CSS keeps working.
- [ ] **Step 3:** `pnpm --filter keycaps build` and `pnpm --filter keycaps lint`: pass.
- [ ] **Step 4:** Check it in the browser at `http://localhost:5171`. Single key renders, the set renders, the font picker works, click-to-edit legends works, and the saved share link from step 1 opens with the same settings. Settings from before the move are still there after a reload. No console errors.
- [ ] **Step 5:** Commit "Move the STL-app kit out of keycaps into packages/stl-kit".

### Task 4: Creator catalog and the "more creators" link

**Files:**
- Create: `packages/stl-kit/src/catalog/catalog.ts`, `catalog/MoreCreators.tsx`, `catalog/images/` (filled in Task 8)
- Test: `packages/stl-kit/src/catalog/catalog.test.ts`
- Modify: `apps/keycaps/src/App.tsx` (link in the panel header), `packages/stl-kit/src/styles/app.css`

**Interfaces:**
- Produces:
  - `interface Creator { id: string; name: string; tagline: string; keywords: string[]; devPort: number; url: string | null; image: string }`
  - `CREATORS: Creator[]` (keycaps: `url: 'https://keycap-stl.vercel.app/'`; vase, keychain: `url: null`), `INDEX: { devPort: 5170; url: string | null }` (url `null`)
  - `creatorUrl(c: { devPort: number; url: string | null }, dev = import.meta.env.DEV): string | null` (dev: `http://localhost:<port>/`; prod: `url`)
  - `indexUrl(dev?: boolean): string | null`
  - `searchCreators(list: Creator[], query: string): Creator[]` (case-insensitive. Every word in the query must appear in name, tagline or keywords. An empty query returns everything.)
  - `<MoreCreators />`: renders nothing when `indexUrl()` is null.

- [ ] **Step 1: Failing tests**

```ts
const c = { devPort: 5172, url: null }
expect(creatorUrl(c, true)).toBe('http://localhost:5172/')
expect(creatorUrl(c, false)).toBeNull()
expect(indexUrl(false)).toBeNull()
expect(searchCreators(CREATORS, '').length).toBe(CREATORS.length)
expect(searchCreators(CREATORS, 'VASE').map((c) => c.id)).toEqual(['vase'])
expect(searchCreators(CREATORS, 'key ring').map((c) => c.id)).toEqual(['keychain'])
expect(searchCreators(CREATORS, 'zzz')).toEqual([])
```

- [ ] **Step 2:** Run: FAIL. **Step 3:** Implement. **Step 4:** Run: PASS.
- [ ] **Step 5:** Add `<MoreCreators />` to the keycaps panel header ("More creators →", quiet link style). Check that `pnpm --filter keycaps build` output does not contain `localhost:5170`: `grep -r localhost:5170 apps/keycaps/dist` returns nothing.
- [ ] **Step 6:** Commit "Creator catalog and a 'more creators' link".

### Task 5: Vase model

**Files:**
- Create: `models/vase/vase.scad`, `models/vase/README.md`, `scripts/smoke-render.sh` (renders a `.scad` with native openscad and given `-D` args to a temp STL, fails on a non-zero exit or an empty file)

Top-level variables (one-line JSON-parsable assignments, so `parseScadDefaults` reads them): `height = 160;` `bottom_radius = 35;` `top_radius = 45;` `wall = 2;` `bulges = [[60, 15]];` plus `$fn = 96;`.

Geometry (not obvious from the variables, so here it is):
1. Control points `(r, z)`: `[bottom_radius, 0]`, then for each `[h, a]` in `bulges` (assumed sorted): `[lerp(bottom_radius, top_radius, h/height) + a, h]`, then `[top_radius, height]`.
2. Uniform Catmull-Rom through them (duplicate the end points), 24 samples per segment. Clamp every r to `max(r, wall + 3)`.
3. Silhouette = polygon of the curve mirrored around the z axis (`-r..r`), closed at z=0 and extended straight up from the rim to `height + 2*wall`.
4. Cavity 2D = `offset(r = -wall)` of the silhouette, intersected with `z >= wall`. Wall 2D = silhouette (cut at `height`) minus cavity. Keep `x >= 0`, then `rotate_extrude`.

This gives an even wall along the curve, a base of `wall` thickness and an open rim.

- [ ] **Step 1:** Write `scripts/smoke-render.sh <file.scad> [-D …]`.
- [ ] **Step 2:** `scripts/smoke-render.sh models/vase/vase.scad`: FAIL (file missing).
- [ ] **Step 3:** Write `vase.scad`.
- [ ] **Step 4:** All of these must pass:
  - `scripts/smoke-render.sh models/vase/vase.scad`
  - … `-D 'bulges=[]'`
  - … `-D 'bulges=[[40,30],[90,-25],[140,20]]'`
  - … `-D 'bulges=[[80,-40]]' -D wall=4` (extreme pinch, clamped)
  - Also look at a PNG: `openscad -o /tmp/…/vase.png --imgsize=600,600 models/vase/vase.scad`. Read it and check that it looks like a vase with an even wall.
- [ ] **Step 5:** Commit "Vase model".

### Task 6: Vase app

**Files:**
- Create `apps/vase/` with the same structure as keycaps:
  - `package.json`, `index.html`, `vite.config.ts` (port 5172), `tsconfig*.json`, `public/favicon.svg`
  - `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/render.worker.ts`
  - `src/scad/files.ts`, `src/scad/params.ts`, `src/share.ts`
  - `CLAUDE.md`, `PLAN.md`, `README.md`, `LICENSE.md` (copied from keycaps)
- Test: `apps/vase/src/scad/params.test.ts`

**Interfaces:**
- Consumes: kit (Tasks 2–4).
- Produces:
  - `interface Params { height: number; bottom_radius: number; top_radius: number; wall: number; bulges: [number, number][] }`
  - `DEFAULTS` (parsed from `vase.scad`), `RANGES`:
    - height 40–250 step 1
    - radii 10–95 step 0.5
    - wall 0.8–6 step 0.1
    - bulge amount −40–40 step 0.5
    - bulge height 0–height step 1
    - all in mm
  - `MAX_BULGES = 8`
  - `normalizeBulges(bulges: [number, number][], height: number): [number, number][]`: sort by height, clamp heights to `[0.05*height, 0.95*height]`, push apart so neighbours are at least `max(2, 0.04*height)` mm apart (drop ones that no longer fit)
  - `toDefines(p: Params): string[]`: passes normalized bulges
  - storage key `vase-stl:params`; share prefix `#vase=`

- [ ] **Step 1: Failing tests**

```ts
expect(normalizeBulges([[120, 5], [40, -3]], 160)).toEqual([[40, -3], [120, 5]])
expect(normalizeBulges([[0, 5]], 160)).toEqual([[8, 5]])
const close = normalizeBulges([[80, 5], [80.5, -5]], 160)
expect(close[1][0] - close[0][0]).toBeGreaterThanOrEqual(6.4)
expect(toDefines({ ...DEFAULTS, bulges: [[60, 15]] })).toContain('bulges=[[60, 15]]')
```

- [ ] **Step 2:** Run: FAIL. **Step 3:** Implement params. **Step 4:** Run: PASS.
- [ ] **Step 5:** Build the UI the keycaps way:
  - Panel head: title "Vase", a one-line description, `<MoreCreators />`.
  - Section "Shape": Height, Bottom radius, Upper radius, Wall thickness.
  - Section "Shell curve": one row per bulge (height slider, amount slider with the hint "out + / in −", a remove button), "Add bulge" (disabled at 8; the new bulge goes in the largest gap).
  - "Reset all settings".
  - Stage: viewer, StatusLine, Share and Download (`vase.stl`) buttons, shared-set notice with undo.
- [ ] **Step 6:** `pnpm --filter vase build` and `lint` pass. In the browser at `http://localhost:5172`:
  - The default vase renders.
  - Dragging sliders re-renders live (each render under 1 s).
  - Adding and removing bulges works.
  - A share link round-trips.
  - The download is a valid STL.
  - No console errors.
  Take a screenshot.
- [ ] **Step 7:** Commit "Vase creator".

### Task 7: Name keychain model and app

**Files:**
- Create: `models/keychain/keychain.scad`, `models/keychain/README.md`; `apps/keychain/` (same file set as vase, port 5173)
- Test: `apps/keychain/src/scad/params.test.ts`

Model variables:
- `name = "Robin";`
- `font = "";`
- `text_size = 14;`
- `plate_thickness = 3;`
- `text_height = 1.2;`
- `border = 3;`
- `hole = true;`
- `hole_side = "left";`, one of `"left" | "right" | "top"`

Geometry:
- The plate is `offset(r = border) text(...)`, extruded `plate_thickness`. The text is raised `text_height` on top.
- No text metrics are needed: anchor with `halign`/`valign` so the ring sits at the origin side:
  - left: `halign="left"`, ring at `x = -border`
  - right: `halign="right"`, ring at `x = border`
  - top: `halign="center", valign="bottom"`, ring above
- The ring is outer Ø 10, hole Ø 5, the same thickness as the plate. It overlaps the plate by 2 mm.
- An empty name gives just the ring (and no error).

**Interfaces:**
- Produces: `Params { name; text_size; plate_thickness; text_height; border; hole: boolean; hole_side: 'left' | 'right' | 'top' }`, `toDefines(p: Params, font?: string): string[]` (adds `font=<scadName>`), storage keys `keychain-stl:params` and `keychain-stl:font`, share prefix `#tag=`.

- [ ] **Step 1:** Smoke renders fail (file missing). Then write the model and pass all of these:
  - `scripts/smoke-render.sh models/keychain/keychain.scad`
  - `-D 'name=""'`
  - `-D 'hole_side="top"'`
  - `-D hole=false`
  - Check a PNG preview.
- [ ] **Step 2: Failing test:** `expect(toDefines({ ...DEFAULTS, name: 'Ané "x"' }, 'Roboto:style=Bold')).toEqual(expect.arrayContaining(['name="Ané \\"x\\""', 'font="Roboto:style=Bold"']))`. Then implement it and see it pass.
- [ ] **Step 3:** UI:
  - Panel head: "Name keychain" plus `<MoreCreators />`.
  - Section "Text": the name input, shown in the chosen font; Text size.
  - Section "Font": FontPicker.
  - Section "Tag": Plate thickness, Raised text, Border.
  - Section "Key ring": a Toggle and a Choice of Left/Right/Top.
  - Download file name: `<name>-keychain.stl`.
  - Warn when the font failed to load.
- [ ] **Step 4:** Build and lint pass. Check at `http://localhost:5173`:
  - Typing a name re-renders.
  - Changing the font works.
  - The ring moves with its side setting.
  - An empty name works.
  - A share link round-trips.
  Take a screenshot.
- [ ] **Step 5:** Commit "Name keychain creator".

### Task 8: Thumbnails and the index app

**Files:**
- Create: `scripts/thumbnails.sh`. It renders `packages/stl-kit/src/catalog/images/{keycaps,vase,keychain}.png` (800×600) with native openscad from each model's defaults. For keycaps it uses `layouts/sofle.scad` with `half="left"`.
- Create: `apps/index/` with:
  - `package.json`, `index.html`, `vite.config.ts` (port 5170), `tsconfig*.json`, `public/favicon.svg`
  - `src/main.tsx`, `src/App.tsx`, `src/App.css`
  - `CLAUDE.md`, `PLAN.md`, `README.md`, `LICENSE.md`
- Modify: `catalog.ts`, so it imports the images.

**Interfaces:** Consumes `CREATORS`, `searchCreators`, `creatorUrl` (Task 4).

- [ ] **Step 1:** Run `scripts/thumbnails.sh`. Check the three PNGs by reading them.
- [ ] **Step 2:** Build the index page, using the kit's base CSS and the keycaps look (paper, mat green, Instrument Sans, technical-drawing feel):
  - A header with an intro in plain words, roughly: "Make your own object. Pick a creator, move the sliders, download a file for your 3D printer. No CAD needed; everything runs in your browser."
  - A search box (`type="search"`, label "Search creators") that filters as you type.
  - A card grid with image, name and tagline. Each card links to `creatorUrl(c)`. Cards whose URL is null are left out.
  - When nothing matches: "Nothing matches "<query>"." and a "Clear search" button.
  - It must work at phone width.
- [ ] **Step 3:** Run `pnpm --filter index build` and `lint`; both pass. Then `pnpm dev` from the root (all four apps). In the browser at `http://localhost:5170`:
  - Three cards are shown.
  - Typing "vase" leaves one card.
  - Typing "zzz" shows the empty state.
  - A click on a card opens that creator.
  - In that creator, "More creators" leads back.
  - At 375 px wide it looks right.
  Take screenshots.
- [ ] **Step 4:** Commit "Creator index with search".

### Task 9: Docs and final check

**Files:**
- Modify: root `README.md` (layout with index/vase/keychain/stl-kit, dev ports, `pnpm test`), root `PLAN.md` (this work as a done step; deploying index/vase/keychain and their domains as an open step; plant pot and onigiri stay), `CLAUDE.md` (kit exists now: shared code goes in `packages/stl-kit`), `apps/keycaps/PLAN.md` / `CLAUDE.md` (renderer/worker paths moved to the kit).

- [ ] **Step 1:** Update the docs.
- [ ] **Step 2:** `pnpm build && pnpm lint && pnpm test` from the root: all green.
- [ ] **Step 3:** Commit "Docs for the index, vase and keychain".
