# Vase

A turned vase with an even wall, a closed base and an open rim, shaped by a
smooth curve through the base, any number of bulges and the rim. The
radius is a monotone cubic of the height, so the wall never folds back or
overshoots between two points.

| Variable | Meaning (mm) |
| --- | --- |
| `height` | outer height |
| `bottom_radius`, `top_radius` | outer radius at base and rim |
| `wall` | wall and base thickness |
| `bulges` | `[[height, amount], ...]`, sorted by height; amount > 0 bulges out, < 0 pinches in |

```bash
openscad --backend=manifold -o vase.stl -D 'bulges=[[40,30],[90,-25],[140,20]]' vase.scad
```

© Art & Flywork, CC BY-NC 4.0: free for personal use, commercial use needs a
license. See [`../LICENSE.md`](../LICENSE.md).
