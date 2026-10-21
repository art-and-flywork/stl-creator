# Onigiri mold app

Browser app around the OpenSCAD onigiri mold in `models/onigiri` at the
root of the monorepo. Built on `@stl-creator/stl-kit` (render worker, viewer,
form fields, shared CSS).

- Model changes go in `models/onigiri/` as their own change; the app never
  patches or copies the `.scad` files.
- Never use `minkowski()` in the model — it hangs the browser WASM render.
- Pass all settings to OpenSCAD as `-D` overrides.
- Native reference render: `../../scripts/smoke-render.sh ../../models/onigiri/onigiri.scad`
  (set `PIECES=3` — the mold is three separate parts on one plate).
- Visitors don't use CAD: plain words and mm in the UI, no OpenSCAD jargon.
- Docs and comments in English.
