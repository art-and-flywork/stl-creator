// A single key. Useful for testing the profile and settings, or for printing
// a spare keycap. Profile and general settings: profile.scad

include <./profile.scad>

legend_text = "F";
row         = 2;    // [0:4]
length      = 1;    // length in units, e.g. 1.5 for the Sofle thumb key
roll        = 0;    // sideways tilt in degrees
bump        = "auto"; // ["auto", "on", "off"] auto = only for home_keys

custom_key(legend_text, row, length, roll,
           bump == "auto" ? undef : bump == "on");
