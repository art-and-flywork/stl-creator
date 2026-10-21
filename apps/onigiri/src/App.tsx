import {
  Choice,
  MadeBy,
  MoreCreators,
  Section,
  SharedNotice,
  Slider,
  StageActions,
  StatusLine,
  useLiveRender,
  Viewer,
} from '@stl-creator/stl-kit'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MODEL_FILE } from './scad/files'
import { CORNER_OPTIONS, DEFAULTS, loadParams, RANGES, saveParams, toDefines, type Params } from './scad/params'
import { Info } from './Info'
import { clearSharedOnigiri, readSharedOnigiri, shareUrl } from './share'
import './App.css'

const spawnWorker = () => new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })

const shared = readSharedOnigiri()
const stored = loadParams()

export default function App() {
  const [params, setParams] = useState<Params>(shared ?? stored)
  const [sharedNotice, setSharedNotice] = useState(shared !== null)
  const [infoOpen, setInfoOpen] = useState(false)
  const undoTo = useRef(stored)

  useEffect(() => {
    if (shared) clearSharedOnigiri()
    const onHash = () => {
      const mold = readSharedOnigiri()
      if (!mold) return
      undoTo.current = loadParams()
      setParams(mold)
      setSharedNotice(true)
      clearSharedOnigiri()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => saveParams(params), [params])

  const defines = useMemo(() => toDefines(params), [params])
  const { stl, status, busy } = useLiveRender({
    spawnWorker,
    file: MODEL_FILE,
    defines,
    label: 'Shaping the mold',
  })

  const set = <K extends keyof Params>(key: K, value: Params[K]) => setParams((p) => ({ ...p, [key]: value }))
  const frameKey = `${Math.round(params.diameter / 20)}-${Math.round(params.height / 15)}-${params.corners}`

  return (
    <div className="app">
      <aside className="panel">
        <header className="panel-head">
          <MoreCreators />
          <h1>Onigiri mold</h1>
          <p>
            Make a rice mold: set the cavity size, height and corners, then download one file with base, ring and
            press.{' '}
            <button type="button" className="link about" onClick={() => setInfoOpen(true)}>
              Print tips, FAQ &amp; license
            </button>
          </p>
        </header>

        <div className="panel-scroll">
          <Section title="Mold">
            <Slider
              label="Diameter"
              value={params.diameter}
              range={RANGES.diameter}
              hint="rice cavity — how wide the onigiri is"
              onChange={(v) => set('diameter', v)}
            />
            <Slider
              label="Height"
              value={params.height}
              range={RANGES.height}
              hint="thickness of the rice / height of the ring"
              onChange={(v) => set('height', v)}
            />
            <Choice
              label="Corners"
              value={params.corners}
              options={[...CORNER_OPTIONS]}
              onChange={(v) => set('corners', v)}
            />
            <Slider
              label="Corner radius"
              value={params.corner_radius}
              range={RANGES.corner_radius}
              hint="how soft the corners are"
              onChange={(v) => set('corner_radius', v)}
            />
          </Section>

          <button type="button" className="link reset-all" onClick={() => setParams({ ...DEFAULTS })}>
            Reset all settings
          </button>
        </div>
        <MadeBy creator="onigiri" />
      </aside>

      <main className="stage">
        <Viewer stl={stl} frameKey={frameKey} />
        <StatusLine status={status} hasModel={stl !== null} />
        {sharedNotice && (
          <SharedNotice
            text="You opened a shared mold. It replaced your own settings."
            onUndo={() => {
              setParams(undoTo.current)
              setSharedNotice(false)
            }}
            onDismiss={() => setSharedNotice(false)}
          />
        )}
        <StageActions
          creator="onigiri"
          shareUrl={() => shareUrl(params)}
          shareTitle="My onigiri mold"
          shareLabel="Share this mold"
          stl={stl}
          fileName="onigiri.stl"
          busy={busy}
        />
      </main>
      <Info open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}
