# stl-creator

Monorepo of browser-based OpenSCAD STL configurators: pnpm workspaces +
Turborepo. See `README.md` for the layout and `PLAN.md` for the roadmap; each
app has its own `CLAUDE.md` and `PLAN.md`.

- Use pnpm, never npm or yarn. Run app commands with `pnpm --filter <app>`.
- Never edit files in `models/*` submodules from here. Model changes belong in
  the model's own repo; then bump the submodule. New models without a repo of
  their own can live in `models/<name>` as plain folders.
- Apps are client-only Vite apps. Pass settings to OpenSCAD as `-D`
  overrides; the `.scad` files stay untouched.
- Don't extract shared code into `packages/` speculatively. Do it when a
  second app needs the same thing.
- Docs and comments in English.
