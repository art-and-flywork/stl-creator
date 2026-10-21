# stl-creator

Monorepo of browser-based OpenSCAD STL configurators: pnpm workspaces +
Turborepo. See `README.md` for the layout and `PLAN.md` for the roadmap; each
app has its own `CLAUDE.md` and `PLAN.md`.

- Use pnpm, never npm or yarn. Run app commands with `pnpm --filter <app>`.
- Models live in `models/<name>` as plain folders (no submodules). Change a
  model there, as a model change; apps never patch or copy the `.scad` files.
- Apps are client-only Vite apps. Pass settings to OpenSCAD as `-D`
  overrides; the `.scad` files stay untouched.
- Shared code lives in `packages/stl-kit` (render worker, viewer, fields,
  fonts, share links, base CSS, creator catalog). Don't move things there
  speculatively; do it when a second app needs the same thing.
- A new creator: add it to the catalog in
  `packages/stl-kit/src/catalog/catalog.ts` with a fixed dev port, add a
  thumbnail to `scripts/thumbnails.sh`, and a config to `.claude/launch.json`.
- Code that runs in the render worker imports from
  `@stl-creator/stl-kit/scad`, never the main entry (that pulls React and
  three.js into the worker).
- Visitors don't use CAD: plain words and mm in the UI, no OpenSCAD jargon.
- Docs and comments in English.
