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
