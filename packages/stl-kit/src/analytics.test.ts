import { afterEach, describe, expect, it } from 'vitest'
import { analyticsScript, track } from './analytics'

afterEach(() => {
  delete (globalThis as { umami?: unknown }).umami
})

describe('track', () => {
  it('sends the event to Umami when it is loaded', () => {
    const sent: unknown[] = []
    ;(globalThis as { umami?: unknown }).umami = { track: (...args: unknown[]) => sent.push(args) }
    track('download', { creator: 'vase' })
    expect(sent).toEqual([['download', { creator: 'vase' }]])
  })

  it('does nothing without Umami (no ID set, blocked, or still loading)', () => {
    expect(() => track('share', { creator: 'vase' })).not.toThrow()
  })
})

describe('analyticsScript', () => {
  it('is the Umami script for the live domain only', () => {
    expect(analyticsScript('abc-123', false)).toEqual({
      src: 'https://cloud.umami.is/script.js',
      'data-website-id': 'abc-123',
      'data-domains': 'stl-creator.app,www.stl-creator.app',
    })
  })

  it('is left out without an ID and during development', () => {
    expect(analyticsScript(undefined, false)).toBeNull()
    expect(analyticsScript('abc-123', true)).toBeNull()
  })
})
