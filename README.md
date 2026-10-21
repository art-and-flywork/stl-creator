# stl-creator

Browser-based STL configurators: OpenSCAD in WebAssembly, sliders, a 3D
preview, and an STL download. Everything runs locally in the browser.

## Layout

```
apps/
  index/       Front page with all creators          :5170
  keycaps/     Sofle split-keyboard keycaps          :5171
  vase/        Vase with bulges in the wall          :5172
  keychain/    Name tag with a ring                  :5173
  onigiri/     Rice mold (base, ring, press)         :5174
packages/
  stl-kit/     Shared render worker, viewer, fields, catalog
models/
  keycaps/     Keycap OpenSCAD model
  vase/        Vase OpenSCAD model
  keychain/    Keychain OpenSCAD model
  onigiri/     Onigiri mold OpenSCAD model
scripts/       Model checks, thumbnails, site assembly
```

Dev ports are fixed; the catalog uses them during development.

## Development

Needs Node 24 and pnpm (`corepack enable` picks the version from
`package.json`).

```bash
pnpm install
pnpm dev                    # every app, on its own port
pnpm --filter vase dev      # one app
pnpm build
pnpm lint
pnpm test
```
