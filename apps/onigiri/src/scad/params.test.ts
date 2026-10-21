import { describe, expect, it } from 'vitest'
import { clampCorners, DEFAULTS, toDefines } from './params'

describe('DEFAULTS', () => {
  it('come from onigiri.scad', () => {
    expect(DEFAULTS).toEqual({
      diameter: 90,
      height: 35,
      corners: 3,
      corner_radius: 12,
      handle_length: 55,
      handle_height: 28,
    })
  })
})

describe('toDefines', () => {
  it('passes every setting with values clamped', () => {
    expect(
      toDefines({
        ...DEFAULTS,
        corners: 9,
        corner_radius: 100,
        handle_length: 5,
        handle_height: 200,
      }),
    ).toEqual([
      'diameter=90',
      'height=35',
      'corners=5',
      'corner_radius=40',
      'handle_length=30',
      'handle_height=50',
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
