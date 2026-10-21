// Render of the full Sofle set in a single colour, used in the README.
// Regenerate with:
// openscad --backend=manifold --render=true --colorscheme=Tomorrow --imgsize=2400,1000 --camera=95,-42,0,52,0,10,430 -o images/sofle-set.png images/sofle-set.scad

include <../layouts/sofle.scad>

// \$ variables are evaluated before regular ones, so no shared variable here
$primary_color    = [0.25, 0.5, 0.9];
$secondary_color  = [0.25, 0.5, 0.9];
$tertiary_color   = [0.25, 0.5, 0.9];
$quaternary_color = [0.25, 0.5, 0.9];
