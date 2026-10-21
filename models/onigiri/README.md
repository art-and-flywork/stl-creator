# Onigiri mold

A three-part rice mold on one print plate: a base with a lip, a ring for the
rice thickness, and a press with a handle. The cavity is a rounded regular
polygon (3–5 corners), classic triangle by default.

| Variable | Meaning |
| --- | --- |
| `diameter` | rice cavity width (mm) — inner opening of the ring |
| `height` | ring / rice thickness (mm) |
| `corners` | 3, 4 or 5 |
| `corner_radius` | how soft the corners are (mm) |
| `handle_length` | tip-to-tip length of the press handle (mm) |
| `handle_height` | how tall the handle stands above the press (mm) |

Wall thickness, press clearance and plate details are fixed in the model.

```bash
openscad --backend=manifold -o onigiri.stl -D corners=4 -D diameter=100 onigiri.scad
```

© Art & Flywork, CC BY-NC 4.0: free for personal use, commercial use needs a
license. See [`../LICENSE.md`](../LICENSE.md).
