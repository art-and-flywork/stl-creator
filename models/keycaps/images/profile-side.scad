// Side view of the keycap rows 0–4, used in the README.
// Regenerate with:
// openscad --backend=manifold --render=true --projection=o --colorscheme=Tomorrow --imgsize=2000,700 --camera=0,-38,0,90,0,-90,112 -o images/profile-side.png images/profile-side.scad

include <../profile.scad>

names = ["row 0", "row 1", "row 2", "row 3", "thumb"];

module label2d(pos, c) color(c) translate([-15, -38, 0]) rotate([90, 0, -90])
  linear_extrude(0.1) translate(pos) children();

for (r = [0:4]) translate_u(0, -r) {
  custom_key("", r);
  // labels, facing the camera (which looks along +x)
  color([0.2, 0.2, 0.2])
    translate([-15, 0, -5]) rotate([90, 0, -90])
      linear_extrude(0.1) {
        text(names[r], size = 2.6, halign = "center", font = "Helvetica");
        translate([0, -3.6]) text(str(heights[r], " mm, ", tilts[r], "°"),
                                  size = 2, halign = "center", font = "Helvetica");
      }
}

label2d([-47, -15.5], [0.45, 0.45, 0.45]) text("< back", size = 2, font = "Helvetica");
label2d([47, -15.5],  [0.45, 0.45, 0.45]) text("front (you) >", size = 2, halign = "right", font = "Helvetica");
