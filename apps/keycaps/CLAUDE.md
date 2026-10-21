# Keycaps app

Browser app around the OpenSCAD keycap model in `models/keycaps` at the
root of the monorepo.
The plan, milestones and open decisions are in `PLAN.md`; keep its checkboxes
up to date as work lands.

- Model changes go in `models/keycaps/` as their own change; the app never
  patches or copies the `.scad` files.
- Pass all settings to OpenSCAD as `-D` overrides; the `.scad` files stay
  untouched.
- Native reference render: `openscad --backend=manifold -o out.stl ../../models/keycaps/key.scad`
  (OpenSCAD is installed via Homebrew) to compare against the WASM output.
- Docs and comments in English.
