# keycap-stl

Web app to configure the
[Sofle DCS-based keycaps](https://github.com/mcbrwr/sofle-optimized-DCS-keycaps),
preview them in 3D and download STLs. OpenSCAD runs in the browser via
WebAssembly.

Pick a row, drag the sliders, choose a legend font from Google Fonts, and
download the STL of a single key or the whole Sofle set. See
[PLAN.md](PLAN.md) for what is done and what is next.

## Development

```bash
git clone --recurse-submodules <this repo>
npm install
npm run dev
```

The keycap model lives in the `keycaps/` git submodule. To update it:

```bash
git submodule update --remote keycaps
```
