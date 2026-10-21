# Plan: vase app

A vase you shape with sliders: height, bottom and upper radius, wall
thickness, and a list of bulges (height + amount) that make the wall bulge
out or pinch in. Live 3D preview, STL download, share link.

## Done

- [x] Model `models/vase/vase.scad`: Catmull-Rom curve through base, bulges
      and rim; even wall via a 2D offset; closed base, open rim.
- [x] App on the stl-kit: live render (~0.3 s), up to 8 bulges, settings in
      localStorage (`vase-stl:params`), share link (`#vase=`), download.
- [x] "More creators" link to the index; served at `/vase/` on the
      combined site.

## Ideas

- [ ] A side-view diagram of the profile in the panel, like the keycaps
      row profile.
- [ ] Vase mode (single wall, spiralized) as an export option.
