import {
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
import {
  DEFAULTS,
  loadParams,
  MAX_BULGES,
  nextBulge,
  RANGES,
  saveParams,
  toDefines,
  type Bulge,
  type Params,
} from './scad/params'
import { Info } from './Info'
import { clearSharedVase, readSharedVase, shareUrl } from './share'
import './App.css'

const spawnWorker = () => new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })

// A shared link replaces the stored settings; keep those for the undo button.
const shared = readSharedVase()
const stored = loadParams()

export default function App() {
  const [params, setParams] = useState<Params>(shared ?? stored)
  const [sharedNotice, setSharedNotice] = useState(shared !== null)
  const [infoOpen, setInfoOpen] = useState(false)
  const undoTo = useRef(stored)

  useEffect(() => {
    if (shared) clearSharedVase()
    // a shared link pasted into a tab that already has the app open
    const onHash = () => {
      const vase = readSharedVase()
      if (!vase) return
      undoTo.current = loadParams()
      setParams(vase)
      setSharedNotice(true)
      clearSharedVase()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => saveParams(params), [params])

  const defines = useMemo(() => toDefines(params), [params])
  const { stl, status, busy } = useLiveRender({ spawnWorker, file: MODEL_FILE, defines, label: 'Shaping the vase' })

  const set = <K extends keyof Params>(key: K, value: Params[K]) => setParams((p) => ({ ...p, [key]: value }))
  const setBulge = (index: number, bulge: Bulge) =>
    setParams((p) => ({ ...p, bulges: p.bulges.map((b, i) => (i === index ? bulge : b)) }))
  // re-frame the camera when the vase grows or shrinks a step, not on every tweak
  const widest = Math.max(params.bottom_radius, params.top_radius, ...params.bulges.map((b) => b[1] + params.top_radius))
  const frameKey = `${Math.round(params.height / 30)}-${Math.round(widest / 20)}`
  const heightRange = { min: 0, max: params.height, step: 1, unit: 'mm' }

  return (
    <div className="app">
      <aside className="panel">
        <header className="panel-head">
          <MoreCreators />
          <h1>Vase</h1>
          <p>
            Shape a vase with sliders, check it in 3D, download the file for your 3D printer.{' '}
            <button type="button" className="link about" onClick={() => setInfoOpen(true)}>
              Print tips, FAQ &amp; license
            </button>
          </p>
        </header>

        <div className="panel-scroll">
          <Section title="Shape">
            <Slider label="Height" value={params.height} range={RANGES.height} onChange={(v) => set('height', v)} />
            <Slider label="Bottom radius" value={params.bottom_radius} range={RANGES.radius} onChange={(v) => set('bottom_radius', v)} />
            <Slider label="Upper radius" value={params.top_radius} range={RANGES.radius} hint="at the rim" onChange={(v) => set('top_radius', v)} />
            <Slider label="Wall thickness" value={params.wall} range={RANGES.wall} hint="the bottom is just as thick" onChange={(v) => set('wall', v)} />
          </Section>

          <Section title="Shell curve">
            <p className="note">
              Make the wall bulge out or pinch in. Each bulge sits at a height; a positive amount pushes the wall out,
              a negative one pulls it in. Add a few for a wavy vase.
            </p>
            {params.bulges.length === 0 && <p className="note">No bulges: the wall runs straight from bottom to rim.</p>}
            <ol className="bulges">
              {params.bulges.map((bulge, i) => (
                <li key={i} className="bulge">
                  <div className="bulge-head">
                    <span>Bulge {i + 1}</span>
                    <button
                      type="button"
                      className="link"
                      onClick={() => setParams((p) => ({ ...p, bulges: p.bulges.filter((_, j) => j !== i) }))}
                    >
                      Remove
                    </button>
                  </div>
                  <Slider label="Height" value={bulge[0]} range={heightRange} hint="from the bottom" onChange={(v) => setBulge(i, [v, bulge[1]])} />
                  <Slider label="Amount" value={bulge[1]} range={RANGES.amount} hint="out +, in −" onChange={(v) => setBulge(i, [bulge[0], v])} />
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="secondary"
              disabled={params.bulges.length >= MAX_BULGES}
              onClick={() =>
                setParams((p) =>
                  p.bulges.length >= MAX_BULGES ? p : { ...p, bulges: [...p.bulges, nextBulge(p.bulges, p.height)] },
                )
              }
            >
              Add bulge
            </button>
          </Section>

          <button type="button" className="link reset-all" onClick={() => setParams({ ...DEFAULTS })}>
            Reset all settings
          </button>
        </div>
        <MadeBy />
      </aside>

      <main className="stage">
        <Viewer stl={stl} frameKey={frameKey} />
        <StatusLine status={status} hasModel={stl !== null} />
        {sharedNotice && (
          <SharedNotice
            text="You opened a shared vase. It replaced your own settings."
            onUndo={() => {
              setParams(undoTo.current)
              setSharedNotice(false)
            }}
            onDismiss={() => setSharedNotice(false)}
          />
        )}
        <StageActions
          creator="vase"
          shareUrl={() => shareUrl(params)}
          shareTitle="My vase"
          shareLabel="Share this vase"
          stl={stl}
          fileName="vase.stl"
          busy={busy}
        />
      </main>
      <Info open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}
