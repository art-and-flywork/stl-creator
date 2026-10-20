interface Profile {
  heights: number[]
  tilts: number[]
  skews: number[]
}

interface Props {
  profile: Profile
  /** Drawn as a dashed outline behind the rows, e.g. the original DCS. */
  compare?: Profile
  active?: number
  onPick?: (row: number) => void
  /** Draw a height dimension line at the centre of each row. */
  dimensions?: boolean
}

const W = 18.16 // DCS base width in mm
const GAP = 3
const MAX_H = 18

/** Outline of one row in side view, back on the left like models/keycaps/images/profile-side.png. */
function outline(profile: Profile, r: number): string {
  const x = r * (W + GAP)
  const h = profile.heights[r]
  // the top is about 6 mm narrower than the base; skew shifts it towards the back
  const top = W - 6 + profile.skews[r]
  const rise = Math.tan((profile.tilts[r] * Math.PI) / 180) * (top / 2)
  const left = x + (W - top) / 2 - profile.skews[r]
  return [
    [x, 0],
    [x + W, 0],
    [left + top, -(h + rise)],
    [left, -(h - rise)],
  ]
    .map((p) => p.join(','))
    .join(' ')
}

/** Side view of all five rows. */
export function ProfileStrip({ profile, compare, active, onPick, dimensions }: Props) {
  return (
    <svg
      className={onPick ? 'profile pickable' : 'profile'}
      viewBox={`-2 ${-MAX_H - 2} ${5 * (W + GAP) + 1} ${MAX_H + 10}`}
      role="group"
      aria-label="Side view of the rows, back on the left"
    >
      {profile.heights.map((_, r) => (
        <g key={r} className={r === active ? 'row active' : 'row'} onClick={() => onPick?.(r)}>
          <polygon points={outline(profile, r)} />
          {compare && <polygon className="compare" points={outline(compare, r)} />}
          {dimensions && <Dimension x={r * (W + GAP) + W / 2} h={profile.heights[r]} />}
          <text x={r * (W + GAP) + W / 2} y={3.6}>
            {r === 4 ? 'T' : r}
          </text>
        </g>
      ))}
      <text className="side" x={0} y={8} style={{ textAnchor: 'start' }}>
        back
      </text>
      <text className="side" x={5 * (W + GAP) - GAP} y={8} style={{ textAnchor: 'end' }}>
        front
      </text>
    </svg>
  )
}

/** Vertical dimension line from the base to the height at the centre of the top. */
function Dimension({ x, h }: { x: number; h: number }) {
  const tick = 0.9
  return (
    <g className="dimension">
      <line x1={x} y1={0} x2={x} y2={-h} />
      <line x1={x - tick} y1={-h} x2={x + tick} y2={-h} />
      <line x1={x - tick} y1={0} x2={x + tick} y2={0} />
      <text x={x + 1.2} y={-h / 2} style={{ textAnchor: 'start' }}>
        {h}
      </text>
    </g>
  )
}
