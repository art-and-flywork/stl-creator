// Icons drawn like a technical drawing: thin strokes, square ends and open
// arrowheads; the download base line has end ticks like a dimension line.

export function ShareIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M8 4H3v13h13v-5" />
      <path d="M9 11l8-8M12 3h5v5" />
    </svg>
  )
}

export function DownloadIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2v11M6 9l4 4 4-4" />
      <path d="M3 17h14M3 15v4M17 15v4" />
    </svg>
  )
}
