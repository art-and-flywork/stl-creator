# Vase creator

Browser app for the OpenSCAD model in `models/vase/`. Settings are passed as
`-D` overrides; the `.scad` file is not patched by the app.

## Sides

`sides` sets how many facets the turned vase has (`$fn` in OpenSCAD).

| | |
| --- | --- |
| Default | 96 — slightly faceted, good for most FDM prints |
| Range in the UI | 4–300 |
| Higher values | Rounder wall and rim, larger STL, slower preview |

Above ~200 the gain for a typical 0.4 mm nozzle is small; 300 is enough for a
very smooth look without making the mesh huge.
