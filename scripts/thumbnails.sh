#!/bin/sh
# Render the index thumbnails with native OpenSCAD: the model in plastic
# colour on the green cutting mat, like the creators' 3D view.
# Usage: scripts/thumbnails.sh   (needs openscad and ImageMagick)
set -eu
cd "$(dirname "$0")/.."
out=packages/stl-kit/src/catalog/images
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"

# thumb <name> <camera rot x,y,z> <scad file> [-D ...]
thumb() {
  name=$1 rotation=$2 file=$3
  shift 3
  openscad --backend=manifold -o "$tmp/$name.stl" "$@" "$file" 2>/dev/null
  printf 'color("#f1ece1") import("%s");\n' "$tmp/$name.stl" > "$tmp/$name.scad"
  openscad --preview --imgsize=800,600 --viewall --autocenter --camera=0,0,0,"$rotation",0 \
    --colorscheme=Tomorrow -o "$tmp/$name.png" "$tmp/$name.scad" 2>/dev/null
  # Tomorrow's background is rgb(248,248,248); swap it for the mat green
  magick "$tmp/$name.png" -fuzz 1% -fill '#2f5b4c' -opaque 'rgb(248,248,248)' -strip "$out/$name.png"
  echo "$out/$name.png"
}

thumb vase 65,0,30 models/vase/vase.scad -D 'bulges=[[45,22],[105,-10],[145,6]]'
thumb keychain 40,0,20 models/keychain/keychain.scad -D 'font="Arial Rounded MT Bold"' -D 'name="Robin"'
thumb keycaps 45,0,25 models/keycaps/layouts/sofle.scad -D 'half="left"'
