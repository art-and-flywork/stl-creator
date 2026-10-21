import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { track } from '../analytics'
import './SupportDialog.css'

/** Where visitors can tip Art & Flywork for free personal use. */
export const KOFI_URL = 'https://ko-fi.com/artandflywork'

/** Tip panel only (no feed / profile chrome), for the in-app dialog. */
export const KOFI_EMBED_URL =
  'https://ko-fi.com/artandflywork/?hidefeed=true&widget=true&embed=true'

function SupportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="support-dialog"
      aria-label="Buy me a coffee"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="support-dialog-panel">
        <button type="button" className="support-dialog-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        {open ? (
          <iframe
            className="support-dialog-frame"
            src={KOFI_EMBED_URL}
            title="Buy a coffee for Art & Flywork"
            loading="lazy"
          />
        ) : null}
      </div>
    </dialog>
  )
}

/**
 * Opens the Ko-fi tip panel in a small dialog (not the full profile page).
 * `from` says where the control sits, for analytics.
 */
export function SupportLink({
  from,
  creator,
  className,
  children = 'Buy me a coffee',
}: {
  from: string
  creator?: string
  className?: string
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const classes = ['support-link', className].filter(Boolean).join(' ')

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={() => {
          track('support', creator ? { from, creator } : { from })
          setOpen(true)
        }}
      >
        {children}
      </button>
      {typeof document !== 'undefined'
        ? createPortal(<SupportDialog open={open} onClose={() => setOpen(false)} />, document.body)
        : null}
    </>
  )
}
