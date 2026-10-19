# Plan: keycap-stl web app

A web app where you configure the custom DCS-based keycaps from
[sofle-optimized-DCS-keycaps](https://github.com/mcbrwr/sofle-optimized-DCS-keycaps),
preview them in 3D and download STLs. Everything runs in the browser:
OpenSCAD compiled to WebAssembly renders the existing `.scad` files, so the
model keeps a single source of truth.

## Starting point

- Vite + React + TypeScript scaffold (`npm run dev`, `npm run build`).
- `keycaps/` is a git submodule of the keycap repo. The app uses those
  `.scad` files as they are; it never keeps its own copy of the model.
- Nothing OpenSCAD-related is built yet.

## Architecture

```
React UI (params form, key list, viewer)
   │  postMessage({ file, defines })
   ▼
Web Worker ── OpenSCAD WASM ── virtual FS with keycaps/ + font
   │  STL bytes
   ▼
three.js viewer (react-three-fiber) · download button
```

- **Model files:** at build time a small script copies `keycaps/` (only
  `*.scad`) into the bundle as a manifest. The worker writes them into the
  OpenSCAD virtual filesystem on start-up.
- **Parameters:** every setting is passed as an OpenSCAD `-D name=value`
  override. This also works for variables in `profile.scad`, so the `.scad`
  files need no changes. Strings need quoting (`-D 'legend_text="F"'`),
  arrays are written as OpenSCAD lists (`-D 'heights=[12,8,6,6.5,6]'`).
- **Rendering:** `--backend=manifold`, export to binary STL. One worker per
  render, so a running render can be cancelled with `worker.terminate()`.
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
- [ ] Choose the WASM build (see open decisions). Hard requirements: manifold
      backend and `text()` support.
- [ ] Render a cube in a Web Worker and show the STL byte size.
- [ ] Load the `keycaps/` files and render `key.scad`. Get legends working:
      bundle `DejaVuSansMono.ttf` plus a minimal `fonts.conf` in the virtual FS.
- [ ] Measure render time for one key and for the full set. That decides
      whether milestone 2 previews the whole set live or only on demand.

### 1. Single key
- [ ] Form for the `key.scad` and `profile.scad` parameters (sliders and
      number inputs, sensible ranges).
- [ ] Debounced re-render on change, loading state, cancel the old render.
- [ ] 3D viewer with orbit controls, one colour, nice lighting.
- [ ] Download STL (filename from legend and row, e.g. `F-row2.stl`).

### 2. Full Sofle set
- [ ] Render `layouts/sofle.scad` (with `half` choice).
- [ ] Per-key export: loop over the keys and render each one on its own
      (`key.scad` with that key's row, legend, length and roll), then zip.
      That needs the Sofle layout data in TypeScript too, or a small
      `.scad` helper that renders key N of the layout.
- [ ] Progress indicator for the zip export.

### 3. Legend editor
- [ ] Grid editor for the left and right legend arrays, in the Sofle shape.
- [ ] Click a key in the grid to preview it as a single key.

### 4. Polish
- [ ] Settings in the URL (shareable link) and in localStorage.
- [ ] Presets: "original DCS", "this profile".
- [ ] Cache STLs by parameter hash so switching back is instant.
- [ ] Side-view diagram of the rows (like `images/profile-side.png`).

### 5. Deploy
- [ ] GitHub Pages via GitHub Actions (checkout with submodules, build, deploy).
- [ ] Workflow or Dependabot rule to bump the `keycaps` submodule.

## Open decisions

1. **WASM build.** Candidates on npm:
   `openscad-wasm` (0.0.4, Jul 2025), `openscad-wasm-prebuilt` (1.2.0,
   Jan 2025), or the `openscad.js`/`openscad.wasm` files that the
   `openscad-playground` package (2.4.0) ships. Check which one has the
   manifold backend and fontconfig support, and how recent its OpenSCAD is
   (the keycap model uses function literals, so it needs OpenSCAD 2021+).
2. **Viewer:** react-three-fiber (more control) or `<model-viewer>`
   (simpler, what openscad-playground uses).
3. **UI library:** plain CSS, or something light like Radix + Tailwind.
4. **License:** OpenSCAD and the keycap model are GPL-3.0, so this app
   should be GPL-3.0 too.

## Risks

- **Render time** in WASM is single-threaded and slower than native. The
  native full set takes about 1 s; expect several seconds in the browser.
- **Download size:** the WASM binary is about 10 MB. Load it lazily, show a
  loading screen, and let the browser cache it.
- **Fonts:** without a font in the virtual FS, legends silently disappear.
