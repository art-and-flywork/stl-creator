include <square.scad>

module rounded_square_shape(size, delta, progress, center = true) {
  offset(r=$corner_radius, $fa=360/$shape_facets){
    square_shape([size.x - $corner_radius*2, size.y - $corner_radius*2], delta, progress);
  }
}

