// Onigiri rice mold: base with lip, outer ring, and press with handle.
// One printable plate. Check edge cases with scripts/check-models.sh.
// All sizes in mm. The stl-creator app overrides these with -D.

diameter = 90; // rice cavity width (inner opening of the ring)
height = 35; // ring / rice thickness
corners = 3; // 3 = classic triangle, up to 5
corner_radius = 12; // how soft the corners are (mm)

wall = 3.5;
clearance = 0.4; // press sits loose inside the ring
base_t = 2.5;
lip_h = 4;
plate_margin = 6; // base plate beyond the ring
handle_w = 12;
handle_d = 6;
handle_h = 18;
gap = 10; // space between parts on the plate

$fn = 64;

assert(corners >= 3 && corners <= 5, "corners must be 3, 4 or 5");

// Cap below the inradius so offset(delta=-r) does not erase the polygon.
max_corner_r = diameter / 2 * cos(180 / corners) * 0.9;
corner_r = min(max(corner_radius, 0.5), max_corner_r);

// Rounded regular n-gon whose overall width is about `d`.
module profile(d) {
  offset(r = corner_r)
    offset(delta = -corner_r)
      circle(d = d, $fn = corners);
}

module ring() {
  linear_extrude(height)
    difference() {
      offset(r = wall) profile(diameter);
      profile(diameter);
    }
}

module base() {
  // Flat plate wider than the ring, plus a lip the ring sits over.
  linear_extrude(base_t)
    offset(r = wall + plate_margin) profile(diameter);
  translate([0, 0, base_t])
    linear_extrude(lip_h)
      offset(r = -0.15) profile(diameter);
}

module press() {
  inner = diameter - 2 * clearance;
  linear_extrude(base_t)
    profile(inner);
  // Handle across the short axis of the shape
  translate([0, 0, base_t])
    linear_extrude(handle_h)
      square([handle_w, handle_d], center = true);
}

// Footprint width of one part (ring is the widest).
part_w = diameter + 2 * wall + 2 * plate_margin;
step = part_w + gap;

translate([-step, 0, 0]) base();
ring();
translate([step, 0, 0]) press();
