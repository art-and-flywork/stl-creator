// Name keychain: a name on a flat tag that follows the letters, with a ring
// for a key ring. All sizes in mm. The stl-creator app overrides these with -D.

name = "Robin";
font = ""; // e.g. "Roboto:style=Bold"; empty uses OpenSCAD's default font
text_size = 14;
plate_thickness = 3;
text_height = 1.2; // how far the letters stand out above the tag
border = 3; // tag margin around the letters
hole = true;
hole_side = "left"; // "left", "right" or "top"

$fn = 48;

ring_outer = 10;
ring_hole = 5;
overlap = 2; // how far the ring reaches into the tag

halign = hole && hole_side == "right" ? "right" : hole && hole_side == "top" ? "center" : "left";
valign = hole && hole_side == "top" ? "top" : "center";

// The ring's centre, just outside the tag on the chosen side.
ring_at =
  hole_side == "left" ? [-border - ring_outer / 2 + overlap, 0] :
  hole_side == "right" ? [border + ring_outer / 2 - overlap, 0] :
  [0, border + ring_outer / 2 - overlap];

module letters() {
  text(name, size = text_size, font = font, halign = halign, valign = valign);
}

module tag_outline() {
  offset(r = border) letters();
  if (hole) {
    translate(ring_at) circle(d = ring_outer);
    // A bridge from the ring into the first (or last, or middle) letter, so
    // the ring stays attached whatever the letter's shape: an "A" or a
    // lowercase name leaves a gap at the edge otherwise.
    reach = text_size * 0.5;
    if (hole_side == "left")
      translate([ring_at[0], -ring_outer / 4]) square([reach - ring_at[0], ring_outer / 2]);
    else if (hole_side == "right")
      translate([-reach, -ring_outer / 4]) square([reach + ring_at[0], ring_outer / 2]);
    else
      translate([-ring_outer / 4, -reach]) square([ring_outer / 2, reach + ring_at[1]]);
  }
}

difference() {
  union() {
    linear_extrude(plate_thickness) tag_outline();
    linear_extrude(plate_thickness + text_height) letters();
  }
  if (hole) translate([ring_at[0], ring_at[1], -1]) cylinder(d = ring_hole, h = plate_thickness + text_height + 2);
}
