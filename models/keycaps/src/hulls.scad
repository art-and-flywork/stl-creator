include <hulls/hull.scad>

// basic key shape, no dish, no inside
// which is only used for dishing to cut the dish off correctly
// $height_difference used for keytop thickness
// extra_slices is a hack to make inverted dishes still work
module shape_hull(thickness_difference, depth_difference, extra_slices = 0){
  render() {
    hull_shape_hull(thickness_difference, depth_difference, extra_slices);
  }
}
