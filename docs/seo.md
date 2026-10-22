# SEO

Titles, descriptions and share previews for [stl-creator.app](https://stl-creator.app).

## Approach

Competitors (LyraMaker, 3D Buddy, mrvarity) lean on loud claims (“No Limits”, long feature lists). We stay
specific and quiet: what you can make, that it is free, that it runs in the browser, that nothing is uploaded.

Each URL has its own:

- `<title>` — primary phrase + `| stl-creator.app`
- `meta description` — one short sentence visitors might search for
- `canonical` — `https://stl-creator.app/…`
- Open Graph + Twitter cards + `og.png` (catalog thumbnail, 800×600)
- JSON-LD (`WebSite` on the index, `WebApplication` on each creator)

Also at the site root (from `apps/index/public/`):

- `robots.txt` — allow all, points at the sitemap
- `sitemap.xml` — index + every creator path

Visible H1s and lead paragraphs on each app match the same wording so crawlers that execute JS see the same
story as the static head.

## URLs

| Path | Title |
| --- | --- |
| `/` | Create STLs in your browser \| stl-creator.app |
| `/vase/` | Custom vase STL generator \| stl-creator.app |
| `/onigiri/` | Onigiri rice mold STL \| stl-creator.app |
| `/keychain/` | Name keychain STL generator \| stl-creator.app |
| `/keycaps/` | Sofle keycap STL generator \| stl-creator.app |

## Editing

Change copy in each app’s `index.html` (head) and the matching H1/lead in `src/App.tsx`. Catalog card names and
taglines live in `packages/stl-kit/src/catalog/catalog.ts`. When you add a creator, add a row to
`apps/index/public/sitemap.xml` and an `og.png` under that app’s `public/`.
