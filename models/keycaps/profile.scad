// Custom keycap profile, based on DCS.
// Shared by key.scad (single key) and the layouts in layouts/.

include <./includes.scad>

// --- profile per row 0–4 (row 4 = thumb keys) ---
heights   = [12,   8,    6,    6.5,  6];    // original DCS: 11.5, 8.5, 7.5, 6, 6
tilts     = [-14,  -10,  -3,   7,    -11];  // original DCS: -6, -1, 3, 7, 16
skews     = [1.75, 1.75, 1.75, 1.75, 0.8];  // original DCS: 1.75
fontSizes = [6,    6,    6,    6,    3];

// --- bevelled top edge ---
top_bevel       = 1;  // width of the bevel in mm (0 = sharp edge)
top_bevel_steps = 5;  // 1 = straight chamfer, 4+ = rounded edge

// --- homing bumps ---
home_keys  = ["F", "J"];
bump_depth = 0.5;    // height of the bump
bump_edge  = 1.5;    // distance from the front edge in mm

// --- print settings ---
stem_slop = 0.45;

// thin lines on the first layer from the stem to the walls, to hold the stem
// in place while printing. snip them off afterwards
stem_tines       = true;
stem_tine_width  = 0.4;  // in mm. below the nozzle width some slicers drop them
stem_tine_height = 0.2;  // in mm. match your first layer height

// multi-character legends shrink to at most ~10 mm wide (~1.1 mm per character per unit of font size)
function legend_size(t, row) =
  len(t) <= 1 ? fontSizes[row] : min(fontSizes[row], 10 / (1.1 * len(t)));

function is_home(t) = len([for (h = home_keys) if (h == t) h]) > 0;

// t: legend ("" = blank keycap), row: profile row 0–4
// length: length in units (vertical), roll: sideways tilt in degrees
// bump: homing bump, defaults to on for the keys in home_keys
module custom_key(t, row, length = 1, roll = 0, bump = undef) {
  let(
    // base dimensions from DCS
    $bottom_key_width   = 18.16,
    $bottom_key_height  = 18.16,
    $width_difference   = 6,
    $height_difference  = 4,
    $dish_type          = "cylindrical",
    $dish_depth         = 0.5,
    $dish_skew_x        = 0,
    $dish_skew_y        = 0,

    $stem_slop          = stem_slop,
    $stem_support_type  = stem_tines ? "tines" : "disable",
    $stem_support_height     = stem_tine_height,
    $stem_support_tine_width = stem_tine_width,
    // tilting sideways lowers one side; compensate the height
    $total_depth        = heights[row] + 6 * sin(abs(roll)),
    $top_tilt           = tilts[row],
    $top_skew           = skews[row],
    $key_height         = length,
    $double_sculpted    = roll != 0,
    $top_tilt_y         = roll,
    $key_bump           = is_undef(bump) ? is_home(t) : bump,
    $key_bump_depth     = bump_depth,
    $key_bump_edge      = bump_edge,
    $font_size          = legend_size(t, row),
    $inset_legend_depth = 0.6,
    $top_bevel          = top_bevel,
    $top_bevel_steps    = top_bevel_steps
  ) legend(t) key();
}
