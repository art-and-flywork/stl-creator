# Plan: stl-creator

1. [x] Monorepo with pnpm workspaces and Turborepo; keycap-stl moved in as
       `apps/keycaps` (history kept), its model as `models/keycaps`.
2. [ ] Vercel: connect the keycap-stl project to this repo (Root Directory
       `apps/keycaps`) and add keycaps-stl.artandflywork.com.
3. [ ] Plant pot configurator (`apps/plant-pots`, model in
       `models/plant-pot`). Extract the shared STL-app kit into
       `packages/stl-kit` while building it.
4. [ ] Onigiri shaper.
5. [ ] More keyboard layouts for the keycaps app: one layout file per
       keyboard, read by both the .scad and the app (replaces the copy in
       `apps/keycaps/src/scad/sofle.ts`).
6. [ ] A shared deco-text component (the giant hidden-sentence background
       from the Art & Flywork site) once the site's design is defined, so
       every app carries its own sentence.
