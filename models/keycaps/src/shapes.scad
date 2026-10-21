include <constants.scad>
include <shapes/rounded_square.scad>
include <shapes/square.scad>

// size: at progress 0, the shape is supposed to be this size
// delta: at progress 1, the keycap is supposed to be size - delta
// progress: how far along the transition you are.
module key_shape(size, delta, progress = 0) {
  if ($key_shape_type == "rounded_square") {
    rounded_square_shape(size, delta, progress);
  } else if ($key_shape_type == "flat_sided_square") {
    // rounded_square_shape handles this
    rounded_square_shape(size, delta, progress);
  } else if ($key_shape_type == "square") {
    square_shape(size, delta, progress);
  } else {
    echo("Warning: unsupported $key_shape_type");
  }
}
