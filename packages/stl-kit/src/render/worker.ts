/// <reference lib="webworker" />
// Renders one model per message. OpenSCAD's main() can only run once per
// WASM instance, so every render gets a fresh instance (about 20 ms).
// Each app has a tiny worker entry that calls serveRenders with its own
// model files.
import { createOpenSCAD } from 'openscad-wasm-prebuilt'

export interface RenderRequest {
  id: number
  file: string
  defines: string[]
  font?: Uint8Array
}

export type RenderResponse =
  | { id: number; ok: true; stl: ArrayBuffer; logs: string[]; ms: number }
  | { id: number; ok: false; error: string; logs: string[] }

const FONTS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig><dir>/fonts</dir></fontconfig>`

type FS = Awaited<ReturnType<typeof createOpenSCAD>> extends {
  getInstance(): { FS: infer F }
}
  ? F
  : never

function mkdirs(fs: FS, path: string) {
  let dir = ''
  for (const part of path.split('/').filter(Boolean)) {
    dir += `/${part}`
    try {
      fs.mkdir(dir)
    } catch {
      // already exists
    }
  }
}

/** Answer render requests with the given model files, written under `/<root>/`. */
export function serveRenders(modelFiles: Record<string, string>, root: string) {
  self.onmessage = (event: MessageEvent<RenderRequest>) => render(modelFiles, root, event.data)
}

async function render(modelFiles: Record<string, string>, root: string, request: RenderRequest) {
  const { id, file, defines, font } = request
  const logs: string[] = []
  const start = performance.now()
  try {
    const openscad = await createOpenSCAD({
      print: (line) => logs.push(line),
      printErr: (line) => logs.push(line),
    })
    const instance = openscad.getInstance()
    const fs = instance.FS

    for (const [path, source] of Object.entries(modelFiles)) {
      mkdirs(fs, `/${root}/${path.split('/').slice(0, -1).join('/')}`)
      fs.writeFile(`/${root}/${path}`, source)
    }
    // OpenSCAD reads fonts/fonts.conf next to its application path ("/")
    mkdirs(fs, '/fonts')
    fs.writeFile('/fonts/fonts.conf', FONTS_CONF)
    if (font) fs.writeFile('/fonts/legend.ttf', font)

    const args = [
      `/${root}/${file}`,
      '--backend=manifold',
      '--export-format=binstl',
      '-o',
      '/out.stl',
      ...defines.flatMap((define) => ['-D', define]),
    ]
    const code = instance.callMain(args)
    if (code !== 0) throw new Error(`OpenSCAD exited with code ${code}`)

    const stl = (fs.readFile('/out.stl', { encoding: 'binary' }) as Uint8Array).slice().buffer
    const response: RenderResponse = { id, ok: true, stl, logs, ms: performance.now() - start }
    self.postMessage(response, [stl])
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const response: RenderResponse = { id, ok: false, error: message, logs }
    self.postMessage(response)
  }
}
