import { describe, expect, it } from 'vitest'
import { DEFAULTS, fileName, toDefines } from './params'

describe('DEFAULTS', () => {
  it('come from keychain.scad', () => {
    expect(DEFAULTS).toEqual({
      name: 'Robin',
      text_size: 14,
      plate_thickness: 3,
      text_height: 1.2,
      border: 3,
      hole: true,
      hole_side: 'left',
    })
  })
})

describe('toDefines', () => {
  it('quotes the name and passes the font', () => {
    expect(toDefines({ ...DEFAULTS, name: 'Ané "x"' }, 'Roboto:style=Bold')).toEqual(
      expect.arrayContaining(['name="Ané \\"x\\""', 'font="Roboto:style=Bold"', 'hole=true']),
    )
  })

  it('leaves the font out when none is loaded', () => {
    expect(toDefines(DEFAULTS).some((d) => d.startsWith('font='))).toBe(false)
  })
})

describe('fileName', () => {
  it('is the name, made safe for a file', () => {
    expect(fileName('Robin')).toBe('Robin-keychain.stl')
    expect(fileName('Ané & co')).toBe('Ane-co-keychain.stl')
    expect(fileName('  ')).toBe('keychain.stl')
  })
})
