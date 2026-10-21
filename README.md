# stl-creator

A collection of browser-based STL configurators by Art & Flywork. Each app
renders an OpenSCAD model in the browser (OpenSCAD compiled to WebAssembly),
with sliders for the model's settings, a 3D preview and an STL download.
Nothing is uploaded; everything runs on your own computer.

```
apps/
  index/      The front page: every creator, with a search box.   :5170
  keycaps/    Keycaps for the Sofle split keyboard, based on DCS.  :5171
  vase/       A vase with any number of bulges in the wall.        :5172
  keychain/   A name on a tag with a ring, in any Google font.     :5173
packages/
  stl-kit/    Shared kit: OpenSCAD render worker, 3D viewer, form
              fields, font picker, share links, base CSS, and the
              creator catalog (names, search words, addresses,
              thumbnails) that the index and "More creators" links use.
models/
  keycaps/    The keycap model. Moved in from
              github.com/mcbrwr/sofle-optimized-DCS-keycaps, which is no
              longer kept up to date.
  vase/       The vase model.
  keychain/   The name keychain model.
scripts/
  smoke-render.sh   Render a model with native OpenSCAD, fail on errors.
  thumbnails.sh     Render the index thumbnails (OpenSCAD + ImageMagick).
  check-models.sh   Edge-case renders of every model (`pnpm test:models`).
  assemble-site.mjs Combine the built apps into one site (`pnpm build:site`).
```

The numbers are each app's fixed dev port; the creator catalog links to
them during development.

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
pnpm dev                    # every app, on its own port
pnpm --filter vase dev      # one app
pnpm build                  # every app, via Turborepo
pnpm lint
pnpm test                   # Vitest in the kit and the creators
```

## Deployment

All apps are one site: Vercel project **stl-creator** (team artandflywork),
connected to this repository, Root Directory the repo root. `vercel.json`
holds the settings: `pnpm build:site` builds every app and
`scripts/assemble-site.mjs` copies them into `site/`:

| Path | App |
| --- | --- |
| `/` | `apps/index` |
| `/keycaps/` | `apps/keycaps` |
| `/vase/` | `apps/vase` |
| `/keychain/` | `apps/keychain` |

Each creator's path is its Vite `base` and its `path` in the catalog
(`packages/stl-kit/src/catalog/catalog.ts`). Try the combined site locally:

```bash
pnpm build:site && python3 -m http.server 5180 --directory site
```

The older keycap-stl project (keycap-stl.vercel.app) was deployed by hand
from the separate repo; point it at `/keycaps/` on this site once the
domain is set.

## License

GPL-3.0, like OpenSCAD and the models. See [LICENSE.md](LICENSE.md).
