# Vase

A turned vase with an even wall, a closed base and an open rim, shaped by a
smooth curve through the base, any number of bulges and the rim. The
radius is a monotone cubic of the height, so the wall never folds back or
overshoots between two points.

| Variable | Meaning |
| --- | --- |
| `height` | outer height (mm) |
| `bottom_radius`, `top_radius` | outer radius at base and rim (mm) |
| `wall` | wall and base thickness (mm) |
| `sides` | how many sides the turned shape has (default 96; more = rounder) |
| `bulges` | `[[height, amount], ...]` in mm, sorted by height; amount > 0 bulges out, < 0 pinches in |

```bash
openscad --backend=manifold -o vase.stl -D 'bulges=[[40,30],[90,-25],[140,20]]' vase.scad
```

© Art & Flywork, CC BY-NC 4.0: free for personal use, commercial use needs a
license. See [`../LICENSE.md`](../LICENSE.md).
