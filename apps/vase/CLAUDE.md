# Vase app

Browser app around the OpenSCAD vase model in `models/vase` at the root of
the monorepo. Built on `@stl-creator/stl-kit` (render worker, viewer, form
fields, shared CSS). The plan is in `PLAN.md`; keep its checkboxes up to date.

- Model changes go in `models/vase/` as their own change; the app never
  patches or copies the `.scad` files.
- Pass all settings to OpenSCAD as `-D` overrides.
- Native reference render: `../../scripts/smoke-render.sh ../../models/vase/vase.scad`.
- Visitors don't use CAD: plain words and mm in the UI, no OpenSCAD jargon.
- Docs and comments in English.
