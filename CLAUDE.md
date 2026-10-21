# stl-creator

Monorepo of browser-based OpenSCAD STL configurators: pnpm workspaces +
Turborepo. See `README.md` for the layout and `PLAN.md` for the roadmap; each
app has its own `CLAUDE.md` and `PLAN.md`.

- Use pnpm, never npm or yarn. Run app commands with `pnpm --filter <app>`.
- Models live in `models/<name>` as plain folders (no submodules). Change a
  model there, as a model change; apps never patch or copy the `.scad` files.
- Apps are client-only Vite apps. Pass settings to OpenSCAD as `-D`
  overrides; the `.scad` files stay untouched.
- Don't extract shared code into `packages/` speculatively. Do it when a
  second app needs the same thing.
- Docs and comments in English.
