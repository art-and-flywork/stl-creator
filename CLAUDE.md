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
- All apps deploy as one site (Vercel project stl-creator): index at `/`,
  each creator under its own path. A new creator: add it to the catalog in
  `packages/stl-kit/src/catalog/catalog.ts` (fixed dev port + path), set the
  same path as `base` in its `vite.config.ts`, add it to
  `scripts/assemble-site.mjs` and `scripts/thumbnails.sh`, and add a config
  to `.claude/launch.json`.
- Code that runs in the render worker imports from
  `@stl-creator/stl-kit/scad`, never the main entry (that pulls React and
  three.js into the worker).
- Visitors don't use CAD: plain words and mm in the UI, no OpenSCAD jargon.
- Every creator has an info sheet (`InfoSheet` from the kit, opened by the
  "Print tips, FAQ & license" link): its own print tips and FAQ, plus the
  shared `usageSection()` and `COMMON_FAQ`, and "Made with ❤️ by Art &
  Flywork" (`MadeBy`, with the Ko-fi tip control) at the bottom of the panel.
- Personal use is free; tips go through Ko-fi (`SupportLink` opens the tip
  panel in a dialog; `KOFI_URL` / `KOFI_EMBED_URL` in the kit). Commercial
  licenses: contact via artandflywork.com.
- Licenses: models and the STLs made with them are (c) Art & Flywork,
  CC BY-NC 4.0 (`models/LICENSE.md`); never copy code from GPL or other
  outside projects into `models/`. App code is GPL-3.0 because it bundles
  OpenSCAD.
- Button shapes: choices (segmented controls like Single key / Sofle set)
  are rounded; action buttons (Add bulge, Make something else) have square
  corners.
- Analytics (Umami, cookie-free): count actions with `track(event, { creator })`
  from the kit. Never send what visitors type (names, legends).
- Docs and comments in English.
