// Full Sofle keyset. Profile and general settings: ../profile.scad

include <../profile.scad>

// --- separate thumb keys (BKS left, ENT right) ---
thumb_length = 1.5;  // length in units (vertical)
thumb_roll   = 10;   // outward tilt in degrees (0 = flat)

// --- legends ("" = blank keycap) ---
left = [
  ["ESC", "1!",  "2@",  "3#",  "4$",  "5%"],
  ["TAB", "Q",   "W",   "E",   "R",   "T"],
  ["CPS", "A",   "S",   "D",   "F",   "G"],
  ["SHT", "Z",   "X",   "C",   "V",   "B",   ""],
  ["CTL", "ALT", "GUI", "ESC", "BKS"]
];
right = [
  ["6^",  "7&",  "8*",  "9(",  "0)",  "BKS"],
  ["Y",   "U",   "I",   "O",   "P",   "-_"],
  ["H",   "J",   "K",   "L",   ";:",  "'\""],
  ["",    "N",   "M",   ",<",  ".>",  "/?",  "=+"],
  ["ENT", "SPC", "GUI", "ALT", "CTL"]
];

// "left", "right" or "both"
half = "both";

// offsets: shift per row in units (so the columns line up)
// big_col: column of the separate thumb key in the thumb row
// roll: positive = left side down, negative = right side down
module sofle_half(legends, x0, offsets, big_col, roll) {
  for (r = [0:4], c = [0:len(legends[r]) - 1]) {
    big = r == 4 && c == big_col;
    translate_u(x0 + c + offsets[r],
                -r - (big ? (thumb_length - 1) / 2 : 0))
      custom_key(legends[r][c], r, big ? thumb_length : 1, big ? roll : 0);
  }
}

// the separate thumb keys tilt towards the outside of the keyboard
if (half != "right") sofle_half(left,  -2, [-1, -1, -1, -1,  1], 4,  thumb_roll);
if (half != "left")  sofle_half(right,  7, [-1, -1, -1, -2, -2], 0, -thumb_roll);
