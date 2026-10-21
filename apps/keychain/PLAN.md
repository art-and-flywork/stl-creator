# Plan: name keychain app

Type a name, pick a Google font, get a tag with raised letters and a ring
for a key ring. Live 3D preview, STL download, share link.

## Done

- [x] Model `models/keychain/keychain.scad`: tag follows the letters
      (offset), raised letters, ring left/right/top with a bridge into the
      text.
- [x] App on the stl-kit: name, letter size, font (default Fredoka 600),
      tag thickness, raised letters, border, ring on/off and side.
      Settings in localStorage (`keychain-stl:params`, `keychain-stl:font`),
      share link (`#tag=`), download as `<name>-keychain.stl`.

## Ideas

- [ ] Two-colour print: letters as a separate STL for a filament swap.
- [ ] More than one line of text.
- [ ] Deploy as its own Vercel project; add its address to the catalog.
