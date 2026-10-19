# keycap-stl

Browser app around the OpenSCAD keycap model in the `keycaps/` submodule.
The plan, milestones and open decisions are in `PLAN.md`; keep its checkboxes
up to date as work lands.

- Never edit files in `keycaps/` from here. Model changes belong in the
  keycap repo (github.com/mcbrwr/sofle-optimized-DCS-keycaps), then bump the
  submodule.
- Pass all settings to OpenSCAD as `-D` overrides; the `.scad` files stay
  untouched.
- Native reference render: `openscad --backend=manifold -o out.stl keycaps/key.scad`
  (OpenSCAD is installed via Homebrew) to compare against the WASM output.
- Docs and comments in English.
