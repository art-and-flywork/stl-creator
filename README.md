# stl-creator

A collection of browser-based STL configurators by Art & Flywork. Each app
renders an OpenSCAD model in the browser (OpenSCAD compiled to WebAssembly),
with sliders for the model's settings, a 3D preview and an STL download.
Nothing is uploaded; everything runs on your own computer.

```
apps/
  keycaps/    Keycaps for the Sofle split keyboard, based on DCS.
              Live: keycap-stl.vercel.app
packages/     Shared code. The common STL-app kit (OpenSCAD worker, 3D
              viewer, controls, share links) moves here once a second app
              needs it.
models/
  keycaps/    The keycap model. Moved in from
              github.com/mcbrwr/sofle-optimized-DCS-keycaps, which is no
              longer kept up to date.
```

Planned: plant pots, onigiri shapers, and more keyboard layouts for the
keycaps app. The Art & Flywork website itself lives in
[art-and-flywork/artandflywork.com](https://github.com/art-and-flywork/artandflywork.com).

## Development

Needs Node 24 and pnpm (`corepack enable` picks the version from
`package.json`).

```bash
git clone https://github.com/art-and-flywork/stl-creator.git
cd stl-creator
pnpm install
pnpm --filter keycaps dev   # one app
pnpm build                  # every app, via Turborepo
pnpm lint
```

## Deployment

Each app is its own Vercel project (team artandflywork), connected to this
repository with its own Root Directory:

| App | Vercel project | Root Directory | Domain |
| --- | --- | --- | --- |
| `apps/keycaps` | keycap-stl | `apps/keycaps` | keycaps-stl.artandflywork.com |

Settings for the Vite apps: framework preset Vite, build command
`turbo build`, output directory `dist`, Ignored Build Step
`npx turbo-ignore` (a push only rebuilds the apps it changed).

## License

GPL-3.0, like OpenSCAD and the models. See [LICENSE.md](LICENSE.md).
