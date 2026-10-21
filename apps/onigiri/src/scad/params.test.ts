import { describe, expect, it } from 'vitest'
import {
  clampHandleLength,
  clampParams,
  DEFAULTS,
  maxHandleLength,
  pressMinWidth,
  toDefines,
} from './params'

describe('DEFAULTS', () => {
  it('come from onigiri.scad', () => {
    expect(DEFAULTS).toEqual({
      diameter: 90,
      height: 35,
      corners: 3,
      corner_radius: 12,
      handle_length: 30,
      handle_height: 15,
    })
  })
})

describe('pressMinWidth', () => {
  it('is half the diameter for a triangle', () => {
    expect(pressMinWidth(90, 3)).toBeCloseTo(44.6, 0)
  })
})

describe('maxHandleLength', () => {
  it('is at least 5 mm shorter than the triangular press', () => {
    expect(maxHandleLength(90, 3)).toBeCloseTo(39.6, 0)
  })
})

describe('clampHandleLength', () => {
  it('caps a long handle on a triangular press', () => {
    expect(clampHandleLength(80, 90, 3)).toBeLessThanOrEqual(40)
  })
})

describe('toDefines', () => {
  it('clamps handle_length onto the press', () => {
    const defines = toDefines({ ...DEFAULTS, handle_length: 80 })
    const length = Number(defines.find((d) => d.startsWith('handle_length='))!.split('=')[1])
    expect(length).toBeLessThanOrEqual(40)
  })
})

describe('clampParams', () => {
  it('shortens an oversized handle', () => {
    expect(clampParams({ ...DEFAULTS, handle_length: 80 }).handle_length).toBeLessThanOrEqual(40)
  })
})
