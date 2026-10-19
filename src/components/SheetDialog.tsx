import { useEffect, useRef, type ReactNode } from 'react'
import './SheetDialog.css'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  /** "large" fills almost the whole window; "medium" fits its content. */
  size?: 'large' | 'medium'
  onOpen?: () => void
  /** Rendered below the header: the sheet body, then an optional footer. */
  children: ReactNode
}

/** A modal drawing sheet: mm grid paper, double frame, square close button. */
export function SheetDialog({ open, onClose, title, size = 'large', onOpen, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = `sheet-${title.toLowerCase().replace(/\W+/g, '-')}`

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      onOpen?.()
    }
    if (!open && el.open) el.close()
  }, [open, onOpen])

  return (
    <dialog
      ref={dialog}
      className={`sheet-dialog ${size}`}
      aria-labelledby={titleId}
      onClose={onClose}
      // a click on the backdrop lands on the dialog element itself
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet">
        <header className="sheet-head">
          <h1 id={titleId}>{title}</h1>
          <button type="button" className="close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
