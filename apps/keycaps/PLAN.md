# Plan: keycaps app

A web app where you configure the custom DCS-based keycaps from
[sofle-optimized-DCS-keycaps](https://github.com/mcbrwr/sofle-optimized-DCS-keycaps),
preview them in 3D and download STLs. Everything runs in the browser:
OpenSCAD compiled to WebAssembly renders the existing `.scad` files, so the
model keeps a single source of truth.

## Starting point

- Vite + React + TypeScript app in the stl-creator monorepo
  (`pnpm --filter keycaps dev`, `pnpm --filter keycaps build`). It started
  as its own repo, keycap-stl; its history is kept in this one.
- `models/keycaps` (monorepo root) holds the keycap model as plain files,
  moved in from the keycap repo (which is no longer kept up to date).
  The app uses those `.scad` files as they are; it never keeps its own copy
  of the model.
- Milestones 0 and 1 are done: single key and full set render in a Web
  Worker, with sliders, a Google Fonts legend picker, 3D preview and STL
  download.

## Architecture

```
React UI (params form, key list, viewer)
   │  postMessage({ file, defines })
   ▼
Web Worker ── OpenSCAD WASM ── virtual FS with the model + font
   │  STL bytes
   ▼
three.js viewer (react-three-fiber) · download button
```

- **Model files:** `import.meta.glob('models/keycaps/**/*.scad', { query: '?raw' })`
  inlines them into the worker bundle (`src/scad/files.ts`); no build script.
  The worker, renderer, viewer, fields and fonts live in
  `packages/stl-kit`; `src/render.worker.ts` hands the kit's worker the
  keycap files.
  The worker writes them into the OpenSCAD virtual filesystem per render.
  UI defaults are parsed from the one-line assignments in the `.scad` files,
  so they follow the model.
- **Parameters:** every setting is passed as an OpenSCAD `-D name=value`
  override. This also works for variables in `profile.scad`, so the `.scad`
  files need no changes. Strings need quoting (`-D 'legend_text="F"'`),
  arrays are written as OpenSCAD lists (`-D 'heights=[12,8,6,6.5,6]'`).
- **Rendering:** `--backend=manifold --export-format=binstl`. OpenSCAD's
  `main()` only runs once per WASM instance, so each render creates a fresh
  instance (~20 ms) inside one long-lived worker. Latest request wins; a
  render that has run over 800 ms is cancelled with `worker.terminate()`.
  Every render passes `$fs=0.4` and `$shape_facets=12` (KeyV2 defaults 0.1
  and 30): half the triangles and render time, no visible difference.
- **Fonts:** Google Fonts via Fontsource: the family list from
  `api.fontsource.org`, static TTFs from jsDelivr (both CORS-enabled; the
  Google CSS API serves WOFF2). The TTF goes to `/fonts/` with a minimal
  `fonts.conf`, and `$font` is passed as a `-D` override. With one font in
  the FS, fontconfig always falls back to it, so legends never vanish.
- **Viewer:** `@react-three/fiber` + `@react-three/drei` with `STLLoader`.
- **Export:** single key as STL; full set as a zip (JSZip) of one STL per key,
  plus optionally one combined STL.

## Parameters to expose

From `profile.scad` (shared by all keys):

| Group | Variables |
| --- | --- |
| Profile per row | `heights`, `tilts`, `skews`, `fontSizes` (5 values each) |
| Top edge bevel | `top_bevel`, `top_bevel_steps` |
| Homing bumps | `home_keys`, `bump_depth`, `bump_edge` |
| Print | `stem_slop`, `stem_tines`, `stem_tine_width`, `stem_tine_height` |

From `key.scad`: `legend_text`, `row`, `length`, `roll`, `bump`.

From `layouts/sofle.scad`: `left`, `right` (legend grids), `thumb_length`,
`thumb_roll`, `half`.

## Milestones

### 0. Spike: OpenSCAD in a worker
- [x] Choose the WASM build (see open decisions). Hard requirements: manifold
      backend and `text()` support.
- [x] Render a cube in a Web Worker and show the STL byte size.
- [x] Load the model files and render `key.scad`. Get legends working:
      a Google Font (default Noto Sans Mono) plus a minimal `fonts.conf` in
      the virtual FS. DejaVu Sans Mono is not on Google Fonts, so legends
      differ slightly from the native default.
- [x] Measure render time for one key and for the full set: one key
      ~0.3 s, one half ~2.5 s, both halves ~5 s (warm, Chrome). The set
      renders on demand, not live while dragging.

### 1. Single key
- [x] Form for the `key.scad` and `profile.scad` parameters (sliders and
      number inputs, sensible ranges).
- [x] Debounced re-render on change, loading state, cancel the old render.
- [x] 3D viewer with orbit controls, one colour, nice lighting.
- [x] Download STL (filename from legend and row, e.g. `F-row2.stl`).
- [x] Legend font picker over all Google Fonts, with weight and italic.

### 2. Full Sofle set
- [x] Render `layouts/sofle.scad` (with `half` choice) and download it as
      one combined STL.
- [ ] Per-key export: loop over the keys and render each one on its own
      (`key.scad` with that key's row, legend, length and roll), then zip.
      That needs the Sofle layout data in TypeScript too, or a small
      `.scad` helper that renders key N of the layout.
- [ ] Progress indicator for the zip export.

### 3. Legend editor
- [x] Grid editor for the left and right legend arrays, in the Sofle shape
      (popup, with a small preview in the sidebar). `left`/`right` are
      parsed from `layouts/sofle.scad` and passed back as `-D` lists.
- [x] Click a key in the 3D set view to type its legend (Tab moves to the
      next key). The layout positions are mirrored in `src/scad/sofle.ts`;
      keep it in sync with `layouts/sofle.scad`.
- [ ] Click a key in the grid to preview it as a single key.

### 4. Polish
- [x] Settings in localStorage.
- [x] Settings in the URL (shareable link): "Share this set" copies a
      `#set=` link with base64url JSON of the settings that differ from
      the defaults, plus mode and font. Opening one shows a notice with a
      way back to your own settings.
- [ ] Presets: "original DCS", "this profile".
- [ ] Cache STLs by parameter hash so switching back is instant.
- [x] Side-view diagram of the rows (like `images/profile-side.png`).

### 5. Deploy
- [x] Deployed to Vercel (team artandflywork, project keycap-stl), so far
      with `vercel deploy` from a local checkout.
- [ ] Deploy from this monorepo on push: Vercel project with Root Directory
      `apps/keycaps`, `npx turbo-ignore` as Ignored Build
      Step; domain keycaps-stl.artandflywork.com.

## Open decisions

1. ~~**WASM build.**~~ Decided: `openscad-wasm-prebuilt` 1.2.0 (OpenSCAD
   2025.01.19, manifold works, fonts work). `openscad-wasm` 0.0.4 is newer
   but crashes ("null function or function signature mismatch") as soon as
   a font is loaded.
2. ~~**Viewer.**~~ Decided: react-three-fiber.
3. ~~**UI library.**~~ Decided: plain CSS.
4. **License:** OpenSCAD and the keycap model are GPL-3.0, so this app
   should be GPL-3.0 too.

## Risks

- **Render time** in WASM is single-threaded and slower than native. The
  native full set takes about 1 s; expect several seconds in the browser.
- **Download size:** the WASM binary is about 10 MB. Load it lazily, show a
  loading screen, and let the browser cache it.
- **Fonts:** without a font in the virtual FS, legends silently disappear.
  The app warns when the font failed to load (e.g. offline).
