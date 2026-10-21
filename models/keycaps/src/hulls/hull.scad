module hull_shape_hull(thickness_difference, depth_difference, extra_slices = 0) {
  // extra_slices is used for inverted dishes, which extend past the top. no bevel there
  bevel = $top_bevel > 0 && extra_slices == 0;
  bevel_height = is_undef($top_bevel_height) ? $top_bevel : $top_bevel_height;
  // progress at which the bevel starts; the regular slices stop there
  bevel_start = bevel ? 1 - bevel_height / ($total_depth - depth_difference) : 1;

  for (index = [0:$height_slices - 1 + extra_slices]) {
    hull() {
      placed_shape_slice(index / $height_slices * bevel_start, thickness_difference, depth_difference);
      placed_shape_slice((index + 1) / $height_slices * bevel_start, thickness_difference, depth_difference);
    }
  }

  if (bevel) {
    // quarter circle profile from the side wall to the top. 1 step is a straight chamfer
    for (step = [0:$top_bevel_steps - 1]) {
      hull() {
        bevel_slice(step / $top_bevel_steps, bevel_start, thickness_difference, depth_difference);
        bevel_slice((step + 1) / $top_bevel_steps, bevel_start, thickness_difference, depth_difference);
      }
    }
  }
}

// t goes from 0 (bottom of the bevel, full size) to 1 (top of the key, inset by $top_bevel)
module bevel_slice(t, bevel_start, thickness_difference, depth_difference) {
  angle = 90 * t;
  rise = $top_bevel_steps == 1 ? t : sin(angle);
  inset = $top_bevel_steps == 1 ? t : 1 - cos(angle);
  placed_shape_slice(
    bevel_start + (1 - bevel_start) * rise,
    thickness_difference + 2 * $top_bevel * inset,
    depth_difference
  );
}

module placed_shape_slice(progress, thickness_difference, depth_difference) {
  skew_this_slice = $top_skew * progress;
  x_skew_this_slice = $top_skew_x * progress;

  depth_this_slice = ($total_depth - depth_difference) * progress;

  tilt_this_slice = -$top_tilt / $key_height * progress;
  y_tilt_this_slice = $double_sculpted ? (-$top_tilt_y / $key_length * progress) : 0;

  translate([x_skew_this_slice, skew_this_slice, depth_this_slice]) {
    rotate([tilt_this_slice,y_tilt_this_slice,0]){
      shape_slice(progress, thickness_difference, depth_difference);
    }
  }
}

module shape_slice(progress, thickness_difference, depth_difference) {
  linear_extrude(height = SMALLEST_POSSIBLE, scale = 1){
    key_shape(
      [
        total_key_width(thickness_difference),
        total_key_height(thickness_difference)
      ],
      [$width_difference, $height_difference],
      progress
    );
  }
}
