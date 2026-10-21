import { describe, expect, it } from 'vitest'
import { clampCornerRadius, clampCorners, DEFAULTS, toDefines } from './params'

describe('DEFAULTS', () => {
  it('come from onigiri.scad', () => {
    expect(DEFAULTS).toEqual({ diameter: 90, height: 35, corners: 3, corner_radius: 12 })
  })
})

describe('toDefines', () => {
  it('passes every setting with corners and radius clamped', () => {
    expect(toDefines({ ...DEFAULTS, corners: 9, corner_radius: 100 })).toEqual([
      'diameter=90',
      'height=35',
      'corners=5',
      'corner_radius=40',
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

describe('clampCornerRadius', () => {
  it('keeps values in the slider range', () => {
    expect(clampCornerRadius(1)).toBe(2)
    expect(clampCornerRadius(12)).toBe(12)
    expect(clampCornerRadius(50)).toBe(40)
  })
})
