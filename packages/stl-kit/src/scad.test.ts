import { describe, expect, it } from 'vitest'
import { modelFilesFrom, parseScadDefaults, toScad } from './scad'

describe('toScad', () => {
  it('writes lists, strings and booleans as OpenSCAD literals', () => {
    expect(toScad([1, 'a', true])).toBe('[1, "a", true]')
  })

  it('refuses values OpenSCAD cannot take', () => {
    expect(() => toScad(Number.NaN)).toThrow()
  })
})

describe('parseScadDefaults', () => {
  it('reads plain top-level assignments and skips expressions', () => {
    expect(parseScadDefaults('height = 160; // mm\nbulges = [[60, 15]];\nx = sin(3);')).toEqual({
      height: 160,
      bulges: [[60, 15]],
    })
  })

  it('keeps semicolons inside strings', () => {
    expect(parseScadDefaults('name = "a;b";')).toEqual({ name: 'a;b' })
  })
})

describe('modelFilesFrom', () => {
  it('keys files by their path inside the model folder', () => {
    expect(modelFilesFrom({ '../../models/vase/vase.scad': 'a' }, 'vase')).toEqual({ 'vase.scad': 'a' })
  })

  it('leaves out skipped paths', () => {
    expect(
      modelFilesFrom({ '../models/keycaps/key.scad': 'k', '../models/keycaps/images/x.scad': 'i' }, 'keycaps', /\/images\//),
    ).toEqual({ 'key.scad': 'k' })
  })
})
