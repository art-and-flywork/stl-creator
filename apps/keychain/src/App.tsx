import {
  Choice,
  MoreCreators,
  Section,
  SharedNotice,
  Slider,
  StageActions,
  StatusLine,
  Toggle,
  useLiveRender,
  Viewer,
} from '@stl-creator/stl-kit'
import {
  FontPicker,
  loadFont,
  loadFontChoice,
  saveFontChoice,
  type FontChoice,
  type LoadedFont,
} from '@stl-creator/stl-kit/fonts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_FONT } from './font'
import { MODEL_FILE } from './scad/files'
import {
  DEFAULTS,
  fileName,
  FONT_KEY,
  loadParams,
  MAX_NAME_LENGTH,
  nothingToMake,
  RANGES,
  saveParams,
  toDefines,
  type HoleSide,
  type Params,
} from './scad/params'
import { clearSharedTag, readSharedTag, shareUrl } from './share'
import './App.css'

const spawnWorker = () => new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })

// A shared link replaces the stored settings; keep those for the undo button.
const storedSettings = () => ({ params: loadParams(), font: loadFontChoice(FONT_KEY, DEFAULT_FONT) })
const shared = readSharedTag()
const stored = storedSettings()

const NO_FONT = 'The font could not be loaded, so the name is left out. Check your connection or pick another font.'

export default function App() {
  const [params, setParams] = useState<Params>(shared?.params ?? stored.params)
  const [fontChoice, setFontChoice] = useState<FontChoice>(shared?.font ?? stored.font)
  const [sharedNotice, setSharedNotice] = useState(shared !== null)
  const undoTo = useRef(stored)
  const [fontResult, setFontResult] = useState<{ key: string; font: LoadedFont | null } | null>(null)

  useEffect(() => {
    if (shared) clearSharedTag()
    // a shared link pasted into a tab that already has the app open
    const onHash = () => {
      const tag = readSharedTag()
      if (!tag) return
      undoTo.current = storedSettings()
      setParams(tag.params)
      setFontChoice(tag.font)
      setSharedNotice(true)
      clearSharedTag()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => saveParams(params), [params])
  useEffect(() => saveFontChoice(FONT_KEY, fontChoice), [fontChoice])

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

  const defines = useMemo(() => toDefines(params, font?.scadName), [params, font])
  // OpenSCAD fails on an empty model; say what to do instead of rendering
  const nothing = fontStatus === 'loading' ? null : nothingToMake(params, fontStatus === 'ready')
  const warnings = useMemo(() => (fontStatus === 'error' ? [NO_FONT] : []), [fontStatus])
  const { stl, status, busy } = useLiveRender({
    spawnWorker,
    file: MODEL_FILE,
    defines,
    font: font?.bytes,
    ready: fontStatus !== 'loading' && nothing === null,
    label: 'Making your keychain',
    warnings,
  })

  const set = <K extends keyof Params>(key: K, value: Params[K]) => setParams((p) => ({ ...p, [key]: value }))

  return (
    <div className="app">
      <aside className="panel">
        <header className="panel-head">
          <MoreCreators />
          <h1>Name keychain</h1>
          <p>Type a name, pick a font, download the file for your 3D printer.</p>
        </header>

        <div className="panel-scroll">
          <Section title="Name">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                className="name-input"
                type="text"
                value={params.name}
                placeholder="Your name"
                maxLength={MAX_NAME_LENGTH}
                autoComplete="off"
                style={font ? { fontFamily: `"${font.cssFamily}", sans-serif` } : undefined}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <Slider label="Letter size" value={params.text_size} range={RANGES.text_size} hint="height of a capital" onChange={(v) => set('text_size', v)} />
          </Section>

          <Section title="Font">
            <FontPicker value={fontChoice} status={fontStatus} onChange={setFontChoice} />
          </Section>

          <Section title="Tag">
            <Slider label="Tag thickness" value={params.plate_thickness} range={RANGES.plate_thickness} onChange={(v) => set('plate_thickness', v)} />
            <Slider label="Raised letters" value={params.text_height} range={RANGES.text_height} hint="0 is flat" onChange={(v) => set('text_height', v)} />
            <Slider label="Border" value={params.border} range={RANGES.border} hint="around the letters" onChange={(v) => set('border', v)} />
          </Section>

          <Section title="Key ring">
            <Toggle label="Hole for a key ring" checked={params.hole} onChange={(v) => set('hole', v)} />
            {params.hole && (
              <Choice<HoleSide>
                label="Where"
                value={params.hole_side}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'top', label: 'Top' },
                  { value: 'right', label: 'Right' },
                ]}
                onChange={(v) => set('hole_side', v)}
              />
            )}
          </Section>

          <button
            type="button"
            className="link reset-all"
            onClick={() => {
              setParams({ ...DEFAULTS })
              setFontChoice(DEFAULT_FONT)
            }}
          >
            Reset all settings
          </button>
        </div>
      </aside>

      <main className="stage">
        <Viewer stl={nothing ? null : stl} frameKey={`${Math.round(params.text_size / 5)}-${Math.round(params.name.length / 5)}-${params.hole_side}`} />
        {nothing ? (
          <div className="status" role="status">
            {nothing}
          </div>
        ) : (
          <StatusLine status={status} hasModel={stl !== null} />
        )}
        {sharedNotice && (
          <SharedNotice
            text="You opened a shared keychain. It replaced your own settings."
            onUndo={() => {
              setParams(undoTo.current.params)
              setFontChoice(undoTo.current.font)
              setSharedNotice(false)
            }}
            onDismiss={() => setSharedNotice(false)}
          />
        )}
        <StageActions
          creator="keychain"
          shareUrl={() => shareUrl({ params, font: fontChoice })}
          shareTitle="My keychain"
          shareLabel="Share this keychain"
          stl={nothing ? null : stl}
          fileName={fileName(params.name)}
          busy={busy}
        />
      </main>
    </div>
  )
}
