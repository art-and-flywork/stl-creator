# Support (Ko-fi tip dialog)

Visitors can tip Art & Flywork via Ko-fi. The UI label is “Buy me a coffee”;
the provider is Ko-fi.

## Behaviour

`SupportLink` (in `packages/stl-kit`) is a button that opens a small modal
with Ko-fi’s **tip panel** iframe — amount, optional message, one-time or
monthly — not the full profile page.

Used in:

- Footer credit (`MadeBy`)
- Info sheet “Use & license” copy
- Post-download thank-you notice (`StageActions`)

Clicks still count as Umami `support` events with `from` (`footer`, `info`,
`download`) and optional `creator`.

## URLs

| Constant | Purpose |
| --- | --- |
| `KOFI_URL` | Full profile (`https://ko-fi.com/artandflywork`) |
| `KOFI_EMBED_URL` | Tip panel embed (`hidefeed`, `widget`, `embed`) |

The dialog loads the iframe only while open. It is portaled to `document.body`
so it works above the info sheet dialog.

## Styling

- Default: inline text-link look (`.support-link`)
- `className="support"`: muted footer control
- `className="secondary"`: square action button (thank-you notice)
