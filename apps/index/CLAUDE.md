# Index app

The front page of stl-creator: every creator from the catalog in
`@stl-creator/stl-kit/catalog`, with a search box. No filter for now (the
owner doesn't know yet along which line visitors would sort).

- Creators, taglines, search words and addresses live in the catalog
  (`packages/stl-kit/src/catalog/catalog.ts`), not here. Thumbnails come
  from `scripts/thumbnails.sh`.
- Import from `@stl-creator/stl-kit/catalog`, not the main entry, so
  three.js and OpenSCAD stay out of this bundle.
- Visitors don't use CAD: plain words, no jargon.
- Docs and comments in English.
