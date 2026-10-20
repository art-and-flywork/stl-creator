import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchFontList, type FontChoice, type FontFamily } from '../fonts'

interface Props {
  value: FontChoice
  status: 'loading' | 'ready' | 'error'
  onChange: (choice: FontChoice) => void
}

const CATEGORIES = ['all', 'monospace', 'sans-serif', 'serif', 'display', 'handwriting']

export function FontPicker({ value, status, onChange }: Props) {
  const [fonts, setFonts] = useState<FontFamily[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchFontList().then(setFonts, (e: Error) => setListError(e.message))
  }, [])

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const current = fonts.find((f) => f.id === value.id)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return fonts
      .filter((f) => category === 'all' || f.category === category)
      .filter((f) => !q || f.family.toLowerCase().includes(q))
      .slice(0, 60)
  }, [fonts, query, category])

  const pick = (font: FontFamily) => {
    const weight = font.weights.includes(value.weight)
      ? value.weight
      : font.weights.includes(400)
        ? 400
        : font.weights[0]
    onChange({ id: font.id, family: font.family, weight, italic: value.italic && font.styles.includes('italic') })
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="font-picker" ref={box}>
      <div className="field">
        <label htmlFor="font-search">Font</label>
        <div className="combo">
          <input
            id="font-search"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="font-list"
            autoComplete="off"
            placeholder={value.family}
            value={open ? query : value.family}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
              if (e.key === 'Enter' && matches[0]) pick(matches[0])
            }}
          />
          <span className={`font-status ${status}`} aria-live="polite">
            {status === 'loading' ? 'Loading' : status === 'error' ? 'Failed' : ''}
          </span>
        </div>
      </div>

      {open && (
        <div className="font-menu">
          <div className="segments small">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={c === category ? 'active' : ''}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <ul id="font-list" role="listbox">
            {listError && <li className="empty">Could not load the font list: {listError}</li>}
            {!listError && fonts.length === 0 && <li className="empty">Loading Google Fonts…</li>}
            {fonts.length > 0 && matches.length === 0 && <li className="empty">No font matches “{query}”.</li>}
            {matches.map((font) => (
              <li key={font.id} role="option" aria-selected={font.id === value.id}>
                <button type="button" onClick={() => pick(font)}>
                  <span>{font.family}</span>
                  <span className="meta">{font.category}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="font-options">
        <select
          aria-label="Font weight"
          value={value.weight}
          onChange={(e) => onChange({ ...value, weight: Number(e.target.value) })}
        >
          {(current?.weights ?? [value.weight]).map((w) => (
            <option key={w} value={w}>
              Weight {w}
            </option>
          ))}
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={value.italic}
            disabled={current ? !current.styles.includes('italic') : false}
            onChange={(e) => onChange({ ...value, italic: e.target.checked })}
          />
          <span>Italic</span>
        </label>
      </div>
    </div>
  )
}
