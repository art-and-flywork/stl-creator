// Vase: a turned shape with an even wall, a closed base and an open rim.
// Check edge cases with scripts/check-models.sh.
// All sizes in mm. The stl-creator app overrides these with -D.

height = 160;
bottom_radius = 35;
top_radius = 45;
wall = 2; // wall thickness, also the base thickness
// How many sides the turned shape has. More sides = rounder wall and a
// larger STL; 96 is fine for most FDM prints, up to ~300 for a smoother rim.
sides = 96;
// Bulges in the wall, sorted by height: [height, amount]. A positive amount
// bulges out, a negative one pinches in, measured from the straight line
// between base and rim.
bulges = [[60, 15]];

$fn = sides;

samples = 24; // curve points per segment between two control points
min_radius = wall + 3; // keeps the inside open where the wall pinches in

function lerp(a, b, t) = a + (b - a) * t;

// Control points [r, z]: base, every bulge, rim.
function control_points() = concat(
  [[bottom_radius, 0]],
  [for (b = bulges) [lerp(bottom_radius, top_radius, b[0] / height) + b[1], b[0]]],
  [[top_radius, height]]
);

// The radius as a smooth function of height through the control points
// (monotone cubic, "PCHIP"): it never overshoots between two points and,
// because height only goes up, the wall can't fold back on itself.
function slopes(p) = [for (k = [0 : len(p) - 2]) (p[k + 1][0] - p[k][0]) / (p[k + 1][1] - p[k][1])];

function tangents(p) =
  let (n = len(p), d = slopes(p))
  [for (k = [0 : n - 1])
    k == 0 ? d[0] :
    k == n - 1 ? d[n - 2] :
    d[k - 1] * d[k] <= 0 ? 0 :
    let (h0 = p[k][1] - p[k - 1][1], h1 = p[k + 1][1] - p[k][1],
         w1 = 2 * h1 + h0, w2 = h1 + 2 * h0)
    (w1 + w2) / (w1 / d[k - 1] + w2 / d[k])];

function hermite(r0, r1, m0, m1, h, t) =
  (2 * t * t * t - 3 * t * t + 1) * r0 + (t * t * t - 2 * t * t + t) * h * m0
  + (-2 * t * t * t + 3 * t * t) * r1 + (t * t * t - t * t) * h * m1;

function profile(p) =
  let (n = len(p), m = tangents(p))
  concat(
    [for (k = [0 : n - 2], s = [0 : samples - 1])
      let (h = p[k + 1][1] - p[k][1], t = s / samples)
      [hermite(p[k][0], p[k + 1][0], m[k], m[k + 1], h, t), p[k][1] + h * t]],
    [p[n - 1]]
  );

// Outer curve with the radius kept above the minimum.
outer = [for (p = profile(control_points())) [max(p[0], min_radius), p[1]]];

// The wall must only go up; a curve that folds back makes loose or cracked walls.
assert(len([for (i = [1 : len(outer) - 1]) if (outer[i][1] < outer[i - 1][1]) i]) == 0,
       "the wall curve folds back on itself");

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
