# keycap-stl

Web app to configure the
[Sofle DCS-based keycaps](https://github.com/mcbrwr/sofle-optimized-DCS-keycaps),
preview them in 3D and download STLs. OpenSCAD runs in the browser via
WebAssembly.

Work in progress. See [PLAN.md](PLAN.md) for the plan.

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
