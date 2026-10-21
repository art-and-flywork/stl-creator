export type RenderStatus =
  | { kind: 'idle' }
  | { kind: 'rendering'; label: string; expectedMs: number; run: number; big: boolean }
  | { kind: 'done'; ms: number; triangles: number; warnings: string[] }
  | { kind: 'error'; message: string; logs: string[] }

/**
 * Render progress, timing and warnings under the 3D view. OpenSCAD's own
 * error output only shows during development (`dev`); visitors get plain words.
 */
export function StatusLine({
  status,
  hasModel,
  dev = import.meta.env.DEV,
}: {
  status: RenderStatus
  hasModel: boolean
  dev?: boolean
}) {
  if (status.kind === 'idle') return <Loader label="Loading OpenSCAD" expectedMs={2000} big />
  if (status.kind === 'rendering')
    return (
      <Loader
        key={status.run}
        label={hasModel ? status.label : 'Loading OpenSCAD'}
        expectedMs={status.expectedMs + (hasModel ? 0 : 1500)}
        big={status.big || !hasModel}
      />
    )
  if (status.kind === 'error')
    return (
      <div className="status error" role="alert">
        <strong>The model could not be made with these settings. Try changing the last one back.</strong>
        {dev && (
          <pre>
            {status.message}
            {'\n'}
            {status.logs.slice(-8).join('\n')}
          </pre>
        )}
      </div>
    )
  return (
    <div className="status">
      {Math.round(status.ms)} ms · {status.triangles.toLocaleString()} triangles
      {status.warnings.map((w) => (
        <div key={w} className="warning">
          {w}
        </div>
      ))}
    </div>
  )
}

/**
 * OpenSCAD reports no progress, so the bar fills over the time the previous
 * render of this view took and slows down near the end.
 */
function Loader({ label, expectedMs, big }: { label: string; expectedMs: number; big: boolean }) {
  return (
    <div className={big ? 'loader big' : 'loader'} role="status">
      <span>{label}…</span>
      <div className="ruler" aria-hidden="true">
        <div className="fill" style={{ animationDuration: `${Math.max(400, expectedMs)}ms` }} />
      </div>
    </div>
  )
}
