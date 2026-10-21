#!/bin/sh
# Render a model with native OpenSCAD and fail on errors or an empty result.
# Usage: scripts/smoke-render.sh models/vase/vase.scad [-D 'name=value' ...]
# The result must be one piece, or $PIECES pieces (e.g. a keycap set).
set -eu
file=$1
shift
out=$(mktemp -t smoke).stl
trap 'rm -f "$out"' EXIT
if ! log=$(openscad --backend=manifold --export-format=binstl -o "$out" "$@" "$file" 2>&1); then
  echo "$log" >&2
  echo "FAIL: $file $*" >&2
  exit 1
fi
if echo "$log" | grep -q '^WARNING'; then
  echo "$log" | grep '^WARNING' >&2
  echo "FAIL (warnings): $file $*" >&2
  exit 1
fi
triangles=$(( ($(wc -c < "$out") - 84) / 50 ))
if [ "$triangles" -le 0 ]; then
  echo "FAIL (empty): $file $*" >&2
  exit 1
fi
pieces=$(python3 -I "$(dirname "$0")/stl-parts.py" "$out")
if [ "$pieces" -ne "${PIECES:-1}" ]; then
  echo "FAIL ($pieces separate pieces): $file $*" >&2
  exit 1
fi
echo "ok: $file $* ($triangles triangles)"
