include <dishes/cylindrical.scad>

//dish selector
module dish(width, height, depth, inverted) {
  if ($dish_type == "cylindrical") {
    cylindrical_dish(width, height, depth, inverted);
  } else if ($dish_type == "disable") {
    // else no dish
  } else {
    echo("WARN: $dish_type unsupported");
  }
}
