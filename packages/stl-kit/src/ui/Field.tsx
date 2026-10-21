import { useId, useState, type ReactNode } from 'react'

/** Slider range of a setting. */
export interface Range {
  min: number
  max: number
  step: number
  unit?: string
}

interface SliderProps {
  label: string
  value: number
  range: Range
  hint?: string
  onChange: (value: number) => void
}

/** Slider plus number box. The box accepts values outside the slider range. */
export function Slider({ label, value, range, hint, onChange }: SliderProps) {
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  const [shown, setShown] = useState(value)
  if (shown !== value) {
    // value changed from outside (slider, reset): show it in the box
    setShown(value)
    setDraft(String(value))
  }

  const commit = (text: string) => {
    const number = Number(text.replace(',', '.'))
    if (text.trim() !== '' && Number.isFinite(number)) onChange(number)
    else setDraft(String(value))
  }

  return (
    <div className="field slider">
      <label htmlFor={id}>
        {label}
        {hint && <span className="hint">{hint}</span>}
      </label>
      <input
        type="range"
        aria-label={label}
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="number">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(e.currentTarget.value)
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault()
              const step = range.step * (e.shiftKey ? 10 : 1)
              const next = value + (e.key === 'ArrowUp' ? step : -step)
              onChange(Number((Math.round(next / range.step) * range.step).toFixed(4)))
            }
          }}
        />
        {range.unit && <span className="unit">{range.unit}</span>}
      </span>
    </div>
  )
}

interface ChoiceProps<T extends string | number> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function Choice<T extends string | number>({ label, value, options, onChange }: ChoiceProps<T>) {
  return (
    <div className="field choice" role="radiogroup" aria-label={label}>
      <span className="label">{label}</span>
      <div className="segments">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            className={option.value === value ? 'active' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="field toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="section" open={open}>
      <summary>{title}</summary>
      <div className="section-body">{children}</div>
    </details>
  )
}
