# Plan: stl-creator

1. [x] Monorepo with pnpm workspaces and Turborepo; keycap-stl moved in as
       `apps/keycaps` (history kept), its model as `models/keycaps`.
2. [x] Vercel: one project, stl-creator (team artandflywork), serves every
       app as one site (index at `/`, creators under their own path).
2a. [x] Domain: stl-creator.app (www.stl-creator.app).
2b. [ ] Redirect the old keycap-stl project (keycap-stl.vercel.app,
       keycaps-stl.dev) to https://stl-creator.app/keycaps/.
3. [x] Creator index with search (`apps/index`), a vase creator
       (`apps/vase`) and a name keychain creator (`apps/keychain`); the
       shared STL-app kit is extracted into `packages/stl-kit`. See
       `docs/superpowers/specs/2026-10-21-index-and-vase-design.md`.
3b. [ ] Plant pot configurator (`apps/plant-pots`, model in
       `models/plant-pot`), on the kit.
4. [ ] Onigiri shaper.
5. [ ] More keyboard layouts for the keycaps app: one layout file per
       keyboard, read by both the .scad and the app (replaces the copy in
       `apps/keycaps/src/scad/sofle.ts`).
6. [ ] A shared deco-text component (the giant hidden-sentence background
       from the Art & Flywork site) once the site's design is defined, so
       every app carries its own sentence.
