import { describe, expect, it } from 'vitest'
import { clampCorners, DEFAULTS, toDefines } from './params'

describe('DEFAULTS', () => {
  it('come from onigiri.scad', () => {
    expect(DEFAULTS).toEqual({ diameter: 90, height: 35, corners: 3 })
  })
})

describe('toDefines', () => {
  it('passes every setting with corners clamped', () => {
    expect(toDefines({ ...DEFAULTS, corners: 9 })).toEqual([
      'diameter=90',
      'height=35',
      'corners=5',
    ])
  })
})

describe('clampCorners', () => {
  it('keeps values in 3–5', () => {
    expect(clampCorners(2)).toBe(3)
    expect(clampCorners(4)).toBe(4)
    expect(clampCorners(7)).toBe(5)
  })
})
