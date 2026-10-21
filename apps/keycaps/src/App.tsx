import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Choice,
  DownloadIcon,
  downloadStl,
  Renderer,
  Section,
  ShareIcon,
  shareLink,
  SheetDialog,
  Slider,
  StatusLine,
  Superseded,
  Toggle,
  Viewer,
  type RenderStatus,
} from '@stl-creator/stl-kit'
import {
  FontPicker,
  loadFont,
  loadFontChoice,
  saveFontChoice,
  type FontChoice,
  type LoadedFont,
} from '@stl-creator/stl-kit/fonts'
import { KeyPicker } from './components/KeyPicker'
import { ProfileStrip } from './components/ProfileStrip'
import { LegendGrid } from './components/LegendGrid'
import { Info } from './Info'
import {
  DEFAULTS,
  loadParams,
  modelFile,
  RANGES,
  saveParams,
  toDefines,
  type Bump,
  type Half,
  type Mode,
  type Params,
  type RowKey,
} from './scad/params'
import { layoutKeys, setLegend, type LayoutKey } from './scad/sofle'
import { clearSharedSet, readSharedSet, shareUrl } from './share'
import './App.css'

const spawnWorker = () => new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })

const FONT_KEY = 'keycap-stl:font'

// A shared link replaces the stored settings; keep those for the undo button.
const storedSettings = () => ({
  params: loadParams(),
  mode: (localStorage.getItem('keycap-stl:mode') as Mode) || 'key',
  font: loadFontChoice(FONT_KEY),
})
const shared = readSharedSet()
const stored = storedSettings()

const ROWS = [0, 1, 2, 3, 4].map((r) => ({ value: r, label: r === 4 ? 'Thumb' : `Row ${r}` }))

function fileName(params: Params, mode: Mode) {
  if (mode === 'set') return `sofle-${params.half}.stl`
  const legend = params.legend_text.replace(/[^\w-]+/g, '') || (params.legend_text ? 'symbol' : 'blank')
  return `${legend}-row${params.row}.stl`
}

export default function App() {
  const [params, setParams] = useState<Params>(shared?.params ?? stored.params)
  const [mode, setMode] = useState<Mode>(shared?.mode ?? stored.mode)
  const [setRow, setSetRow] = useState(2)
  const [fontChoice, setFontChoice] = useState<FontChoice>(shared?.font ?? stored.font)
  const [sharedNotice, setSharedNotice] = useState(shared !== null)
  const undoTo = useRef(stored)
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (shared) clearSharedSet()
    // a shared link pasted into a tab that already has the app open
    const onHash = () => {
      const set = readSharedSet()
      if (!set) return
      undoTo.current = storedSettings()
      setParams(set.params)
      setMode(set.mode)
      setFontChoice(set.font)
      setSharedNotice(true)
      clearSharedSet()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const [fontResult, setFontResult] = useState<{ key: string; font: LoadedFont | null } | null>(null)
  const [model, setModel] = useState<{
    stl: ArrayBuffer
    mode: Mode
    view: string
    /** Layout keys of a rendered set, for click-to-edit. */
    keys: LayoutKey[]
  } | null>(null)
  const [selection, setSelection] = useState<{ id: string; from: 'view' | 'panel' } | null>(null)
  const selectedKey = selection?.id ?? null
  const stl = model?.stl ?? null
  const [status, setStatus] = useState<RenderStatus>({ kind: 'idle' })
  const [infoOpen, setInfoOpen] = useState(false)
  const [legendsOpen, setLegendsOpen] = useState(false)
  const renderer = useRef<Renderer | null>(null)
  // last render time per view, so the loader can estimate how long it takes
  const renderTimes = useRef<Record<string, number>>({ key: 800, 'set-both': 6000, 'set-left': 3500, 'set-right': 3500 })
  const renderRun = useRef(0)

  const set = <K extends keyof Params>(key: K, value: Params[K]) =>
    setParams((p) => ({ ...p, [key]: value }))
  const setRowValue = (key: RowKey, row: number, value: number) =>
    setParams((p) => ({ ...p, [key]: p[key].map((v, i) => (i === row ? value : v)) }))

  useEffect(() => saveParams(params), [params])
  useEffect(() => saveFontChoice(FONT_KEY, fontChoice), [fontChoice])
  useEffect(() => localStorage.setItem('keycap-stl:mode', mode), [mode])

  const fontKey = `${fontChoice.id}-${fontChoice.weight}-${fontChoice.italic}`
  const fontStatus = fontResult?.key !== fontKey ? 'loading' : fontResult.font ? 'ready' : 'error'
  const font = fontResult?.font ?? null

  useEffect(() => {
    let current = true
    loadFont(fontChoice).then(
      (loaded) => current && setFontResult({ key: fontKey, font: loaded }),
      () => current && setFontResult({ key: fontKey, font: null }),
    )
    return () => {
      current = false
    }
  }, [fontChoice, fontKey])

  // re-render shortly after the last change
  useEffect(() => {
    if (fontStatus === 'loading') return
    renderer.current ??= new Renderer(spawnWorker)
    const timer = setTimeout(() => {
      const view = mode === 'set' ? `set-${params.half}` : 'key'
      setStatus({
        kind: 'rendering',
        label: mode === 'set' ? `Rendering ${layoutKeys(params).length} keys` : 'Rendering the key',
        expectedMs: renderTimes.current[view] ?? 3000,
        run: ++renderRun.current,
        big: mode === 'set',
      })
      renderer
        .current!.render({
          file: modelFile(mode),
          defines: toDefines(params, mode, font?.scadName),
          font: font?.bytes,
        })
        .then(
          (result) => {
            renderTimes.current[view] = result.ms
            setModel({
              stl: result.stl,
              mode,
              view,
              keys: mode === 'set' ? layoutKeys(params) : [],
            })
            const warnings = result.logs.filter((l) => /^WARNING/.test(l))
            if (!font) warnings.unshift('No legend font loaded, so legends are left out.')
            setStatus({
              kind: 'done',
              ms: result.ms,
              triangles: (result.stl.byteLength - 84) / 50,
              warnings,
            })
          },
          (error: Error & { logs?: string[] }) => {
            if (error instanceof Superseded) return
            setStatus({ kind: 'error', message: error.message, logs: error.logs ?? [] })
          },
        )
    }, 180)
    return () => clearTimeout(timer)
  }, [params, mode, font, fontStatus])

  const share = async () => {
    const result = await shareLink(shareUrl({ mode, params, font: fontChoice }), 'Keycap set')
    if (result === 'shared') return
    setShareState(result)
    setTimeout(() => setShareState('idle'), 2000)
  }

  const undoShared = () => {
    setParams(undoTo.current.params)
    setMode(undoTo.current.mode)
    setFontChoice(undoTo.current.font)
    setSharedNotice(false)
  }

  const download = () => {
    if (model) downloadStl(model.stl, fileName(params, model.mode))
  }

  const legendFont = font ? `"${font.cssFamily}", monospace` : undefined
  const editRow = mode === 'key' ? params.row : setRow
  const homeKeys = useMemo(() => params.home_keys.join(', '), [params.home_keys])
  const busy = status.kind === 'rendering'

  return (
    <div className="app">
      <aside className="panel">
        <header className="panel-head">
          <h1>Keycap STL</h1>
          <p>
            Shape a DCS-style keycap, check it in 3D, download the STL.{' '}
            <button type="button" className="link about" onClick={() => setInfoOpen(true)}>
              How it works
            </button>
          </p>
          <div className="segments mode" role="tablist" aria-label="What to render">
            <button role="tab" aria-selected={mode === 'key'} className={mode === 'key' ? 'active' : ''} onClick={() => setMode('key')}>
              Single key
            </button>
            <button role="tab" aria-selected={mode === 'set'} className={mode === 'set' ? 'active' : ''} onClick={() => setMode('set')}>
              Sofle set
            </button>
          </div>
        </header>

        <div className="panel-scroll">
          {mode === 'key' ? (
            <Section title="Key">
              <div className="field">
                <label htmlFor="legend">Legend</label>
                <input
                  id="legend"
                  className="legend-input"
                  type="text"
                  value={params.legend_text}
                  placeholder="Blank"
                  maxLength={8}
                  style={font ? { fontFamily: `"${font.cssFamily}", monospace` } : undefined}
                  onChange={(e) => set('legend_text', e.target.value)}
                />
              </div>
              <Choice label="Row" value={params.row} options={ROWS} onChange={(v) => set('row', v)} />
              <Slider label="Length" value={params.length} range={RANGES.length} hint="1.5 for the Sofle thumb key" onChange={(v) => set('length', v)} />
              <Slider label="Sideways tilt" value={params.roll} range={RANGES.roll} onChange={(v) => set('roll', v)} />
              <Choice<Bump>
                label="Homing bump"
                value={params.bump}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'on', label: 'On' },
                  { value: 'off', label: 'Off' },
                ]}
                onChange={(v) => set('bump', v)}
              />
            </Section>
          ) : (
            <Section title="Set">
              <Choice<Half>
                label="Half"
                value={params.half}
                options={[
                  { value: 'both', label: 'Both' },
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                ]}
                onChange={(v) => set('half', v)}
              />
              <Slider label="Thumb key length" value={params.thumb_length} range={RANGES.thumb_length} onChange={(v) => set('thumb_length', v)} />
              <Slider label="Thumb key tilt" value={params.thumb_roll} range={RANGES.thumb_roll} hint="outwards" onChange={(v) => set('thumb_roll', v)} />
              <div className="field">
                <span className="label">Legends</span>
                <button type="button" className="legend-preview" onClick={() => setLegendsOpen(true)}>
                  <LegendGrid params={params} variant="preview" fontFamily={legendFont} />
                </button>
                <div className="legend-actions">
                  <button type="button" className="secondary" onClick={() => setLegendsOpen(true)}>
                    Edit legends
                  </button>
                  <span className="note">or click a key in the 3D view</span>
                </div>
              </div>
            </Section>
          )}

          <Section title="Legend font">
            <FontPicker value={fontChoice} status={fontStatus} onChange={setFontChoice} />
          </Section>

          <Section title="Row profile">
            {mode === 'set' && <Choice label="Edit row" value={setRow} options={ROWS} onChange={setSetRow} />}
            <ProfileStrip profile={params} active={editRow} onPick={(r) => (mode === 'key' ? set('row', r) : setSetRow(r))} />
            <Slider label="Height" value={params.heights[editRow]} range={RANGES.heights} onChange={(v) => setRowValue('heights', editRow, v)} />
            <Slider label="Top tilt" value={params.tilts[editRow]} range={RANGES.tilts} onChange={(v) => setRowValue('tilts', editRow, v)} />
            <Slider label="Top skew" value={params.skews[editRow]} range={RANGES.skews} onChange={(v) => setRowValue('skews', editRow, v)} />
            <Slider label="Legend size" value={params.fontSizes[editRow]} range={RANGES.fontSizes} onChange={(v) => setRowValue('fontSizes', editRow, v)} />
            <button
              type="button"
              className="link"
              onClick={() =>
                setParams((p) => ({
                  ...p,
                  heights: p.heights.map((v, i) => (i === editRow ? DEFAULTS.heights[i] : v)),
                  tilts: p.tilts.map((v, i) => (i === editRow ? DEFAULTS.tilts[i] : v)),
                  skews: p.skews.map((v, i) => (i === editRow ? DEFAULTS.skews[i] : v)),
                  fontSizes: p.fontSizes.map((v, i) => (i === editRow ? DEFAULTS.fontSizes[i] : v)),
                }))
              }
            >
              Reset {editRow === 4 ? 'thumb row' : `row ${editRow}`}
            </button>
          </Section>

          <Section title="Top edge" open={false}>
            <Slider label="Bevel width" value={params.top_bevel} range={RANGES.top_bevel} hint="0 is a sharp edge" onChange={(v) => set('top_bevel', v)} />
            <Slider label="Bevel steps" value={params.top_bevel_steps} range={RANGES.top_bevel_steps} hint="1 is a chamfer, 4+ is round" onChange={(v) => set('top_bevel_steps', v)} />
          </Section>

          <Section title="Homing bumps" open={false}>
            <div className="field">
              <label htmlFor="home-keys">Keys with a bump</label>
              <input
                id="home-keys"
                type="text"
                defaultValue={homeKeys}
                key={homeKeys}
                onBlur={(e) =>
                  set(
                    'home_keys',
                    e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                  )
                }
              />
            </div>
            <Slider label="Bump height" value={params.bump_depth} range={RANGES.bump_depth} onChange={(v) => set('bump_depth', v)} />
            <Slider label="Distance from front edge" value={params.bump_edge} range={RANGES.bump_edge} onChange={(v) => set('bump_edge', v)} />
          </Section>

          <Section title="Printing" open={false}>
            <Slider label="Stem slop" value={params.stem_slop} range={RANGES.stem_slop} hint="extra room in the stem hole" onChange={(v) => set('stem_slop', v)} />
            <Toggle label="Stem tines (snip off after printing)" checked={params.stem_tines} onChange={(v) => set('stem_tines', v)} />
            {params.stem_tines && (
              <>
                <Slider label="Tine width" value={params.stem_tine_width} range={RANGES.stem_tine_width} onChange={(v) => set('stem_tine_width', v)} />
                <Slider label="Tine height" value={params.stem_tine_height} range={RANGES.stem_tine_height} hint="your first layer height" onChange={(v) => set('stem_tine_height', v)} />
              </>
            )}
          </Section>

          <button type="button" className="link reset-all" onClick={() => setParams({ ...DEFAULTS })}>
            Reset all settings
          </button>
        </div>
      </aside>

      <main className="stage">
        <Viewer stl={stl} frameKey={model?.view ?? mode} onPointerMissed={() => setSelection(null)}>
          {mode === 'set' && model?.mode === 'set'
            ? (shown) => (
                <KeyPicker
                  model={shown}
                  editing={{
                    keys: model.keys,
                    selected: selectedKey,
                    inputOpen: selection?.from === 'view',
                    onSelect: (id) => setSelection(id ? { id, from: 'view' } : null),
                    onLegend: (id, legend) => setParams((p) => setLegend(p, id, legend)),
                    fontFamily: legendFont,
                  }}
                />
              )
            : undefined}
        </Viewer>
        <StatusLine status={status} hasModel={stl !== null} />
        {sharedNotice && (
          <div className="shared-notice" role="status">
            <span>You opened a shared keycap set. It replaced your own settings.</span>
            <button type="button" className="secondary" onClick={undoShared}>
              Back to my settings
            </button>
            <button type="button" className="close-small" aria-label="Dismiss" onClick={() => setSharedNotice(false)}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
        )}
        <div className="stage-actions">
          <button type="button" className="keycap-button share" onClick={share} aria-live="polite">
            <ShareIcon />
            {shareState === 'copied' ? 'Link copied' : shareState === 'failed' ? 'Copy the link' : 'Share this set'}
          </button>
          <button type="button" className="keycap-button download" onClick={download} disabled={!stl || busy}>
            <DownloadIcon />
            Download {fileName(params, model?.mode ?? mode)}
          </button>
        </div>
      </main>
      <Info open={infoOpen} onClose={() => setInfoOpen(false)} />
      <SheetDialog open={legendsOpen} onClose={() => setLegendsOpen(false)} title="Legends" size="medium">
        <div className="legend-editor">
          <p className="note">
            Type the legend for each key; leave a box empty for a blank keycap. Homing bumps go on{' '}
            {params.home_keys.join(' and ') || 'no keys'}, set under Homing bumps.
          </p>
          <LegendGrid
            params={params}
            variant="edit"
            selected={selectedKey}
            fontFamily={legendFont}
            onSelect={(id) => setSelection(id ? { id, from: 'panel' } : null)}
            onLegend={(id, legend) => setParams((p) => setLegend(p, id, legend))}
          />
          <button
            type="button"
            className="link"
            onClick={() => setParams((p) => ({ ...p, left: DEFAULTS.left, right: DEFAULTS.right }))}
          >
            Reset to the default legends
          </button>
        </div>
      </SheetDialog>
    </div>
  )
}
