import type { Params } from '../scad/params'
import { layoutKeys, type HalfName } from '../scad/sofle'

interface Props {
  params: Params
  /** "preview" draws small read-only caps; "edit" draws text boxes. */
  variant: 'preview' | 'edit'
  selected?: string | null
  fontFamily?: string
  onSelect?: (id: string | null) => void
  onLegend?: (id: string, legend: string) => void
}

/** Both halves laid out like the keyboard. */
export function LegendGrid({ params, variant, selected, fontFamily, onSelect, onLegend }: Props) {
  const keys = layoutKeys(params, 'both')
  return (
    <div className={`legend-grid ${variant}`}>
      {(['left', 'right'] as HalfName[]).map((half) => (
        <div key={half} className="legend-half" role="group" aria-label={`${half} half`}>
          {keys
            .filter((k) => k.half === half)
            .map((k) => {
              const style = { gridColumn: k.gridCol + 1, gridRow: k.big ? '5 / span 2' : k.row + 1, fontFamily }
              const className = [k.big ? 'big' : '', k.id === selected ? 'selected' : ''].join(' ')
              if (variant === 'preview')
                return (
                  <span key={k.id} className={className} style={style}>
                    {k.legend}
                  </span>
                )
              return (
                <input
                  key={k.id}
                  className={className}
                  style={style}
                  value={k.legend}
                  maxLength={8}
                  aria-label={`${half} half, ${k.row === 4 ? 'thumb row' : `row ${k.row}`}, key ${k.col + 1}`}
                  onFocus={(e) => {
                    e.currentTarget.select()
                    onSelect?.(k.id)
                  }}
                  onBlur={() => onSelect?.(null)}
                  onChange={(e) => onLegend?.(k.id, e.target.value)}
                />
              )
            })}
        </div>
      ))}
    </div>
  )
}
