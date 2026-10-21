// A sculpted keycap: a hollow body that narrows from a DCS-sized footprint to
// a smaller, tilted top with a cylindrical dish and a bevelled edge, a Cherry
// MX stem, and optionally a homing bump, an inset legend and thin "tines" on
// the first layer that hold the stem while printing. All sizes in mm.
//
// Written for stl-creator by Art & Flywork. CC BY-NC 4.0.

unit = 19.05; // distance between two keys on a keyboard

// Place children `x` keys to the right and `y` keys up.
module translate_u(x = 0, y = 0) {
  translate([x * unit, y * unit, 0]) children();
}

// Defaults for the parts every keycap shares.
footprint       = 18.16; // width and depth of a 1u keycap at the bottom
width_shrink    = 6;     // the top is this much narrower than the bottom
depth_shrink    = 4;     // and this much shallower
corner_radius   = 1;
wall            = 1.5;   // side walls
top_thickness   = 1.2;   // below the deepest point of the dish
max_cavity      = 5.5;   // taller keys get a solid top above this height
dish_depth      = 0.5;
legend_depth    = 0.6;

// Stem: a rounded block with a cross-shaped hole for the switch. The hole
// grows by `slop` (half on each side) for printers that print holes tight.
stem_block      = [6.3, 4.6];
stem_cross      = [4.0, 1.1, 1.0]; // arm length, horizontal arm width, vertical arm width
stem_depth      = 4;               // how deep the switch goes in
stem_chamfer    = 0.4;             // eases the keycap onto the switch
tine_offset     = 2;               // tines along y sit this far left and right of centre

function corner_fn() = is_undef($shape_facets) ? 24 : max(8, $shape_facets);

// Rounded rectangle, centred, 2D.
module rounded_rect(size, r = corner_radius) {
  r2 = min(r, size.x / 2 - 0.01, size.y / 2 - 0.01);
  offset(r = r2, $fn = corner_fn()) square([size.x - 2 * r2, size.y - 2 * r2], center = true);
}

// A paper-thin rounded rectangle, for hulls.
module slab(size, r = corner_radius) {
  linear_extrude(0.01) rounded_rect(size, r);
}

// Coordinate frame of the top: centred over the key (shifted back by
// `skew`), at `height`, tilted forward/back by `tilt` and sideways by `roll`.
// `tilt` is the angle for a 1u key; longer keys tilt proportionally less.
module top_frame(height, tilt, skew, roll, length = 1) {
  translate([0, skew, height]) rotate([-tilt / length, 0, 0]) rotate([0, -roll, 0]) children();
}

// The outside: bottom footprint hulled to the top, whose edge is bevelled in
// `bevel_steps` steps (1 = chamfer, 4 or more looks round).
module outer_body(bottom, top, height, tilt, skew, roll, length, bevel, bevel_steps) {
  steps = bevel > 0 ? max(1, bevel_steps) : 0;
  hull() {
    slab(bottom);
    top_frame(height, tilt, skew, roll, length)
      for (i = [0 : steps]) {
        a = steps == 0 ? 90 : 90 * i / steps;
        inset = bevel * (1 - cos(a));
        translate([0, 0, -bevel + bevel * sin(a) - 0.01])
          slab([top.x - 2 * inset, top.y - 2 * inset], max(0.1, corner_radius - inset / 2));
      }
  }
}

// The inside: the same shape, a wall thickness smaller, with its ceiling
// below the dish but never higher than `max_cavity`.
module inner_body(bottom, top, height, tilt, skew, roll, length) {
  inside = [bottom.x - 2 * wall, bottom.y - 2 * wall];
  intersection() {
    hull() {
      translate([0, 0, -1]) linear_extrude(1.01) rounded_rect(inside);
      top_frame(height, tilt, skew, roll, length)
        translate([0, 0, -dish_depth - top_thickness])
          slab([top.x - 2 * wall, top.y - 2 * wall]);
    }
    translate([-bottom.x, -bottom.y, -2]) cube([2 * bottom.x, 2 * bottom.y, max_cavity + 2]);
  }
}

// Cylindrical dish: a cylinder running front to back, cutting `dish_depth`
// into the middle of the top.
module dish(top) {
  r = (top.x * top.x / 4 + dish_depth * dish_depth) / (2 * dish_depth);
  translate([0, 0, r - dish_depth])
    rotate([90, 0, 0]) cylinder(r = r, h = top.y + 20, center = true, $fa = 0.5, $fs = 0.2);
}

// The legend, cut `legend_depth` into the dish everywhere (it follows the
// curve): the letters, as far as they reach into the dish lowered by that depth.
module legend_cut(t, size, top, font) {
  intersection() {
    translate([0, 0, -dish_depth - legend_depth - 1])
      linear_extrude(dish_depth + legend_depth + 10)
        text(t, size = size, font = font, halign = "center", valign = "center");
    translate([0, 0, -legend_depth]) dish(top);
  }
}

// Homing bump: a straight round bar, 1 mm thick and 6.4 mm long, across the
// front of the dish; its top stands `depth` + 0.5 above the bottom of the dish.
module bump(top, depth, edge) {
  translate([0, -top.y / 2 + edge, -dish_depth + depth])
    hull() for (x = [-2.7, 2.7]) translate([x, 0, 0]) sphere(r = 0.5, $fn = 16);
}

module stem_hole(slop) {
  l = stem_cross[0] + slop / 2;
  wh = stem_cross[1] + slop / 2;
  wv = stem_cross[2] + slop / 2;
  c = stem_chamfer;
  // horizontal arm, and the vertical arm open through the whole block;
  // each with a chamfer at the bottom
  for (arm = [[l, wh], [wv, stem_block.y + 0.4]]) {
    hull() {
      translate([0, 0, -1]) linear_extrude(1) square([arm.x + 2 * c, arm.y + 2 * c], center = true);
      translate([0, 0, c]) linear_extrude(0.01) square(arm, center = true);
    }
    translate([0, 0, c]) linear_extrude(stem_depth - c) square(arm, center = true);
  }
}

// Thin lines on the first layer from the stem out to the walls: sideways
// through the middle, and front-to-back on both sides of the cross.
module tines(bottom, width, height) {
  linear_extrude(height) {
    for (s = [-1, 1]) {
      translate([s * (stem_block.x + bottom.x) / 4, 0])
        square([(bottom.x - stem_block.x) / 2 + 0.2, width], center = true);
      for (x = [-tine_offset, tine_offset])
        translate([x, s * (stem_block.y + bottom.y) / 4])
          square([width, (bottom.y - stem_block.y) / 2 + 0.2], center = true);
    }
  }
}

// One keycap.
// legend: text on top ("" = blank); length: in units, front to back;
// height: height of the top at its centre; tilt: forward/back angle of the
// top (negative raises the back); skew: shifts the top back; roll: sideways
// angle (positive lowers the left side).
module keycap(legend = "", font_size = 6, font = undef, length = 1,
              height = 7, tilt = 0, skew = 0, roll = 0,
              bump = false, bump_depth = 0.5, bump_edge = 1.5,
              bevel = 1, bevel_steps = 5,
              slop = 0.45, tines = true, tine_width = 0.4, tine_height = 0.2) {
  bottom = [footprint, footprint + (length - 1) * unit];
  top = [bottom.x - width_shrink, bottom.y - depth_shrink];
  legend_font = is_undef(font) ? (is_undef($font) ? "" : $font) : font;

  // one colour for previews and images (an STL has none)
  color("#f1ece1") difference() {
    union() {
      difference() {
        outer_body(bottom, top, height, tilt, skew, roll, length, bevel, bevel_steps);
        inner_body(bottom, top, height, tilt, skew, roll, length);
      }
      intersection() {
        outer_body(bottom, top, height, tilt, skew, roll, length, bevel, bevel_steps);
        union() {
          translate([0, 0, -1]) linear_extrude(height + 20) rounded_rect(stem_block);
          if (tines) tines(bottom, tine_width, tine_height);
        }
      }
    }
    top_frame(height, tilt, skew, roll, length) dish(top);
    if (legend != "") top_frame(height, tilt, skew, roll, length) legend_cut(legend, font_size, top, legend_font);
    stem_hole(slop);
  }
  // after the dish, which would otherwise cut it away
  if (bump) color("#f1ece1") top_frame(height, tilt, skew, roll, length) bump(top, bump_depth, bump_edge);
}
