# Keycaps

Web app to configure the
[Sofle DCS-based keycaps](https://github.com/mcbrwr/sofle-optimized-DCS-keycaps),
preview them in 3D and download STLs. OpenSCAD runs in the browser via
WebAssembly.

Pick a row, drag the sliders, choose a legend font from Google Fonts, and
download the STL of a single key or the whole Sofle set. See
[PLAN.md](PLAN.md) for what is done and what is next.

## Development

From the root of the monorepo:

```bash
pnpm install
pnpm --filter keycaps dev
```

The keycap model lives in the `models/keycaps` git submodule at the root of
the monorepo. To update it, from the root:

```bash
git submodule update --remote models/keycaps
```

## License

GPL-3.0, like OpenSCAD and the keycap model. See [LICENSE.md](LICENSE.md).
