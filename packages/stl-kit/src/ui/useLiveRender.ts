import { useEffect, useRef, useState } from 'react'
import { Renderer, Superseded } from '../render/renderer'
import type { RenderStatus } from './StatusLine'

interface Options {
  spawnWorker: () => Worker
  file: string
  defines: string[]
  font?: Uint8Array
  /** False while something the render needs (a font) is still loading. */
  ready?: boolean
  /** Loader text, e.g. "Rendering the vase". */
  label: string
  /** Added to the warnings of every finished render. */
  warnings?: string[]
}

/** Re-renders shortly after the last change; the latest settings win. */
export function useLiveRender({ spawnWorker, file, defines, font, ready = true, label, warnings = [] }: Options) {
  const [stl, setStl] = useState<ArrayBuffer | null>(null)
  const [status, setStatus] = useState<RenderStatus>({ kind: 'idle' })
  const renderer = useRef<Renderer | null>(null)
  const lastMs = useRef(1000)
  const run = useRef(0)
  const key = JSON.stringify(defines)
  const extra = JSON.stringify(warnings)

  useEffect(() => {
    if (!ready) return
    renderer.current ??= new Renderer(spawnWorker)
    const timer = setTimeout(() => {
      setStatus({ kind: 'rendering', label, expectedMs: lastMs.current, run: ++run.current, big: false })
      renderer.current!.render({ file, defines: JSON.parse(key), font }).then(
        (result) => {
          lastMs.current = result.ms
          setStl(result.stl)
          setStatus({
            kind: 'done',
            ms: result.ms,
            triangles: (result.stl.byteLength - 84) / 50,
            warnings: [...JSON.parse(extra), ...result.logs.filter((l) => /^WARNING/.test(l))],
          })
        },
        (error: Error & { logs?: string[] }) => {
          if (error instanceof Superseded) return
          setStatus({ kind: 'error', message: error.message, logs: error.logs ?? [] })
        },
      )
    }, 120)
    return () => clearTimeout(timer)
  }, [spawnWorker, file, key, font, ready, label, extra])

  return { stl, status, busy: status.kind === 'rendering' }
}
