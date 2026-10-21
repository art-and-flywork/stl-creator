import { describe, expect, it } from 'vitest'
import { changedFrom, fromBase64Url, mergeKnown, toBase64Url } from './share'

describe('changedFrom', () => {
  it('keeps only values that differ from the defaults', () => {
    expect(changedFrom({ a: 1, b: [1] }, { a: 2, b: [1] })).toEqual({ a: 2 })
  })
})

describe('mergeKnown', () => {
  it('takes known keys of the same shape and drops the rest', () => {
    expect(mergeKnown({ a: 1, b: [1] }, { a: 'x', b: [2], c: 3 })).toEqual({ a: 1, b: [2] })
  })
})

describe('base64url', () => {
  it('round-trips text outside ASCII', () => {
    expect(fromBase64Url(toBase64Url('vaas ✓'))).toBe('vaas ✓')
  })

  it('uses no characters that need escaping in a URL', () => {
    expect(toBase64Url('??>>~~')).toMatch(/^[\w-]+$/)
  })
})
