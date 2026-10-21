# Onigiri mold creator

Browser app for the OpenSCAD model in `models/onigiri/`. Settings are passed
as `-D` overrides; the `.scad` file is not patched by the app.

## Settings

| UI | OpenSCAD | Notes |
| --- | --- | --- |
| Diameter | `diameter` | Rice cavity width (inner of the ring), 50–140 mm |
| Height | `height` | Ring / rice thickness, 15–60 mm |
| Corners | `corners` | 3, 4 or 5 (segmented control) |
| Corner radius | `corner_radius` | Softness of the corners, 2–40 mm (the model caps it so the shape stays valid) |

One download: base, ring and press laid out on a single plate (`PIECES=3` for
smoke renders).

## Dev

```bash
pnpm --filter onigiri dev    # http://localhost:5174/onigiri/
```
