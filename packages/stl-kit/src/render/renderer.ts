import type { RenderRequest, RenderResponse } from './worker'

export interface RenderResult {
  stl: ArrayBuffer
  logs: string[]
  ms: number
}

export class Superseded extends Error {
  constructor() {
    super('A newer render replaced this one')
  }
}

type Job = Omit<RenderRequest, 'id'> & {
  resolve: (result: RenderResult) => void
  reject: (error: Error) => void
}

// Renders shorter than this finish before a new one starts; longer ones
// (a full set takes seconds) are killed so the latest settings show up fast.
const CANCEL_AFTER_MS = 800

/**
 * Runs renders in a Web Worker, latest request wins. `spawnWorker` creates
 * the app's worker, e.g.
 * `() => new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })`
 * (Vite only bundles workers created like that in the app itself).
 */
export class Renderer {
  private spawnWorker: () => Worker
  private worker: Worker
  private nextId = 1
  private running: { id: number; job: Job; started: number } | null = null
  private pending: Job | null = null

  constructor(spawnWorker: () => Worker) {
    this.spawnWorker = spawnWorker
    this.worker = this.spawn()
  }

  render(request: Omit<RenderRequest, 'id'>): Promise<RenderResult> {
    return new Promise((resolve, reject) => {
      this.pending?.reject(new Superseded())
      this.pending = { ...request, resolve, reject }
      if (this.running && performance.now() - this.running.started > CANCEL_AFTER_MS) {
        this.running.job.reject(new Superseded())
        this.running = null
        this.worker.terminate()
        this.worker = this.spawn()
      }
      this.next()
    })
  }

  private spawn() {
    const worker = this.spawnWorker()
    worker.onmessage = (event: MessageEvent<RenderResponse>) => this.done(event.data)
    worker.onerror = (event) => {
      this.running?.job.reject(new Error(event.message || 'The render worker crashed'))
      this.running = null
      this.worker = this.spawn()
      this.next()
    }
    return worker
  }

  private next() {
    if (this.running || !this.pending) return
    const job = this.pending
    this.pending = null
    const id = this.nextId++
    this.running = { id, job, started: performance.now() }
    const message: RenderRequest = { id, file: job.file, defines: job.defines, font: job.font }
    this.worker.postMessage(message)
  }

  private done(response: RenderResponse) {
    if (!this.running || this.running.id !== response.id) return
    const { job } = this.running
    this.running = null
    if (response.ok) job.resolve({ stl: response.stl, logs: response.logs, ms: response.ms })
    else job.reject(Object.assign(new Error(response.error), { logs: response.logs }))
    this.next()
  }
}
