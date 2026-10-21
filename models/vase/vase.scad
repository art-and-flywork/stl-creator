// Vase: a turned shape with an even wall, a closed base and an open rim.
// All sizes in mm. The stl-creator app overrides these with -D.

height = 160;
bottom_radius = 35;
top_radius = 45;
wall = 2; // wall thickness, also the base thickness
// Bulges in the wall, sorted by height: [height, amount]. A positive amount
// bulges out, a negative one pinches in, measured from the straight line
// between base and rim.
bulges = [[60, 15]];

$fn = 96;

samples = 24; // curve points per segment between two control points
min_radius = wall + 3; // keeps the inside open where the wall pinches in

function lerp(a, b, t) = a + (b - a) * t;

// Control points [r, z]: base, every bulge, rim.
function control_points() = concat(
  [[bottom_radius, 0]],
  [for (b = bulges) [lerp(bottom_radius, top_radius, b[0] / height) + b[1], b[0]]],
  [[top_radius, height]]
);

// Uniform Catmull-Rom spline through all points (end points doubled).
function catmull_rom(p0, p1, p2, p3, t) =
  0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
         + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);

function profile(points) =
  let (n = len(points), at = function (i) points[max(0, min(n - 1, i))])
  concat(
    [for (i = [0 : n - 2], s = [0 : samples - 1])
      catmull_rom(at(i - 1), at(i), at(i + 1), at(i + 2), s / samples)],
    [points[n - 1]]
  );

// Outer curve with the radius kept above the minimum.
outer = [for (p = profile(control_points())) [max(p[0], min_radius), p[1]]];

// Full cross-section through the axis, extended straight up past the rim so
// the offset below leaves the top open.
module silhouette() {
  top = [[outer[len(outer) - 1][0], height + 2 * wall]];
  right = concat(outer, top);
  left = [for (i = [len(right) - 1 : -1 : 0]) [-right[i][0], right[i][1]]];
  polygon(concat(right, left));
}

module wall_section() {
  difference() {
    intersection() {
      silhouette();
      translate([-1000, 0]) square([2000, height]);
    }
    offset(r = -wall) silhouette();
  }
}

rotate_extrude()
  intersection() {
    wall_section();
    square([1000, height]);
  }
