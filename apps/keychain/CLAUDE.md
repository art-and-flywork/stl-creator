# Name keychain app

Browser app around the OpenSCAD keychain model in `models/keychain` at the
root of the monorepo. Built on `@stl-creator/stl-kit` (render worker,
viewer, form fields, Google Fonts picker, shared CSS). The plan is in
`PLAN.md`; keep its checkboxes up to date.

- Model changes go in `models/keychain/` as their own change; the app never
  patches or copies the `.scad` files.
- Pass all settings to OpenSCAD as `-D` overrides; the font goes in as
  `font="Family:style=Style"` with the TTF in the worker's `/fonts/`.
- Without a loaded font OpenSCAD has no font at all and the name is left
  out; the app says so.
- Native reference render: `../../scripts/smoke-render.sh ../../models/keychain/keychain.scad`.
- Visitors don't use CAD: plain words and mm in the UI, no OpenSCAD jargon.
- Docs and comments in English.
