#!/bin/sh
# Smoke-render every model in normal and edge-case settings with native
# OpenSCAD: each must render without errors or warnings, as one piece.
set -eu
cd "$(dirname "$0")/.."
s=scripts/smoke-render.sh

$s models/vase/vase.scad
$s models/vase/vase.scad -D 'bulges=[]'
$s models/vase/vase.scad -D 'bulges=[[40,30],[90,-25],[140,20]]'
# bulges right at the base or rim, close together, or pinching hard
$s models/vase/vase.scad -D 'bulges=[[8,15]]'
$s models/vase/vase.scad -D 'bulges=[[8,-25]]'
$s models/vase/vase.scad -D 'bulges=[[152,15]]'
$s models/vase/vase.scad -D 'bulges=[[152,40]]'
$s models/vase/vase.scad -D 'bulges=[[152,-40]]'
$s models/vase/vase.scad -D 'bulges=[[80,30],[86.4,30]]'
$s models/vase/vase.scad -D 'bulges=[[80,-40]]' -D wall=4

$s models/keychain/keychain.scad
$s models/keychain/keychain.scad -D 'name=""'
$s models/keychain/keychain.scad -D 'hole_side="top"' -D 'name="anna"'
$s models/keychain/keychain.scad -D 'hole_side="right"' -D 'name="LAVA"'
$s models/keychain/keychain.scad -D hole=false

# three separate parts on one plate
PIECES=3 $s models/onigiri/onigiri.scad
PIECES=3 $s models/onigiri/onigiri.scad -D corners=4
PIECES=3 $s models/onigiri/onigiri.scad -D corners=5 -D diameter=120 -D height=50
PIECES=3 $s models/onigiri/onigiri.scad -D diameter=50 -D height=15
PIECES=3 $s models/onigiri/onigiri.scad -D diameter=140 -D height=60
PIECES=3 $s models/onigiri/onigiri.scad -D corner_radius=2
PIECES=3 $s models/onigiri/onigiri.scad -D corner_radius=20

$s models/keycaps/key.scad
$s models/keycaps/key.scad -D 'legend_text=""' -D 'bump="on"'
$s models/keycaps/key.scad -D row=0 -D 'legend_text="ESC"'
$s models/keycaps/key.scad -D row=4 -D length=1.5 -D roll=10
$s models/keycaps/key.scad -D stem_tines=false -D stem_slop=0
$s models/keycaps/key.scad -D top_bevel=0
# one piece per keycap: 6 + 6 + 6 + 7 + 5 on each half
PIECES=30 $s models/keycaps/layouts/sofle.scad -D 'half="left"'
PIECES=60 $s models/keycaps/layouts/sofle.scad
