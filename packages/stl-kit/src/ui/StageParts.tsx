import { useState } from 'react'
import { track } from '../analytics'
import { shareLink, downloadStl } from './actions'
import { DownloadIcon, ShareIcon } from './icons'

/** Share and download buttons in the corner of the 3D stage; every creator uses these. */
export function StageActions({
  creator,
  eventData,
  shareUrl,
  shareTitle,
  shareLabel,
  stl,
  fileName,
  busy,
}: {
  /** Catalog id, for the download and share counts. */
  creator: string
  /** Extra details for those counts, e.g. { mode: 'set' }. Never what visitors typed. */
  eventData?: Record<string, string>
  /** Builds the link when the button is pressed. */
  shareUrl: () => string
  shareTitle: string
  shareLabel: string
  stl: ArrayBuffer | null
  fileName: string
  busy: boolean
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const share = async () => {
    track('share', { creator, ...eventData })
    const result = await shareLink(shareUrl(), shareTitle)
    if (result === 'shared') return
    setState(result)
    setTimeout(() => setState('idle'), 2000)
  }
  return (
    <div className="stage-actions">
      <button type="button" className="keycap-button share" onClick={share} aria-live="polite">
        <ShareIcon />
        {state === 'copied' ? 'Link copied' : state === 'failed' ? 'Copy the link' : shareLabel}
      </button>
      <button
        type="button"
        className="keycap-button download"
        onClick={() => {
          if (!stl) return
          downloadStl(stl, fileName)
          track('download', { creator, ...eventData })
        }}
        disabled={!stl || busy}
      >
        <DownloadIcon />
        Download {fileName}
      </button>
    </div>
  )
}

/** Shown after opening a shared link, with a way back to your own settings. */
export function SharedNotice({ text, onUndo, onDismiss }: { text: string; onUndo: () => void; onDismiss: () => void }) {
  return (
    <div className="shared-notice" role="status">
      <span>{text}</span>
      <button type="button" className="secondary" onClick={onUndo}>
        Back to my settings
      </button>
      <button type="button" className="close-small" aria-label="Dismiss" onClick={onDismiss}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </div>
  )
}
