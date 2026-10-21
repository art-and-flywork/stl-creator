// Onigiri rice mold: base with lip, outer ring, and press with handle.
// One printable plate. Check edge cases with scripts/check-models.sh.
// All sizes in mm. The stl-creator app overrides these with -D.

diameter = 90; // rice cavity width (inner opening of the ring)
height = 35; // ring / rice thickness
corners = 3; // 3 = classic triangle, up to 5
corner_radius = 12; // how soft the corners are (mm)
handle_length = 55; // tip-to-tip length of the press handle (mm)
handle_height = 28; // how tall the handle stands above the press plate (mm)

wall = 3.5;
clearance = 0.4; // press sits loose inside the ring
base_t = 2.5;
lip_h = 4;
plate_margin = 6; // base plate beyond the ring
handle_width = 10; // thickness of the grip (Y)
handle_side_in = 1.2; // how much the long sides curve in (mm)
gap = 10; // space between parts on the plate

$fn = 64;

assert(corners >= 3 && corners <= 5, "corners must be 3, 4 or 5");

// Cap below the inradius so offset(delta=-r) does not erase the polygon.
max_corner_r = diameter / 2 * cos(180 / corners) * 0.9;
corner_r = min(max(corner_radius, 0.5), max_corner_r);

handle_l = max(handle_length, handle_width + 4);
handle_h = max(handle_height, 8);

// Rounded regular n-gon whose overall width is about `d`.
module profile(d) {
  offset(r = corner_r)
    offset(delta = -corner_r)
      circle(d = d, $fn = corners);
}

// Grip in XY: long in X, rounded tips, long sides gently scooped in.
module handle_2d() {
  tip_r = handle_width / 2;
  half = max(handle_l / 2 - tip_r, 0.1);
  scoop = handle_l; // large radius → shallow hollow along the sides
  difference() {
    hull() {
      translate([-half, 0]) circle(r = tip_r);
      translate([half, 0]) circle(r = tip_r);
    }
    translate([0, tip_r + scoop - handle_side_in]) circle(r = scoop);
    translate([0, -(tip_r + scoop - handle_side_in)]) circle(r = scoop);
  }
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
  translate([0, 0, base_t])
    linear_extrude(handle_h)
      handle_2d();
}

// Footprint width of one part (ring / base plate is the widest).
part_w = diameter + 2 * wall + 2 * plate_margin;
step = part_w + gap;

translate([-step, 0, 0]) base();
ring();
translate([step, 0, 0]) press();
