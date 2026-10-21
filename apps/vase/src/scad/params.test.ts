import { describe, expect, it } from 'vitest'
import { DEFAULTS, nextBulge, normalizeBulges, toDefines } from './params'

describe('DEFAULTS', () => {
  it('come from vase.scad', () => {
    expect(DEFAULTS).toEqual({
      height: 160,
      bottom_radius: 35,
      top_radius: 45,
      wall: 2,
      sides: 96,
      bulges: [[60, 15]],
    })
  })
})

describe('normalizeBulges', () => {
  it('sorts bulges by height', () => {
    expect(normalizeBulges([[120, 5], [40, -3]], 160)).toEqual([[40, -3], [120, 5]])
  })

  it('keeps bulges away from the base and the rim', () => {
    expect(normalizeBulges([[0, 5]], 160)).toEqual([[8, 5]])
    expect(normalizeBulges([[200, 5]], 160)).toEqual([[152, 5]])
  })

  it('pushes bulges at nearly the same height apart', () => {
    const close = normalizeBulges([[80, 5], [80.5, -5]], 160)
    expect(close).toHaveLength(2)
    expect(close[1][0] - close[0][0]).toBeGreaterThanOrEqual(6.4)
  })

  it('drops bulges that no longer fit', () => {
    const crowded = normalizeBulges(Array.from({ length: 8 }, () => [150, 1] as [number, number]), 40)
    for (let i = 1; i < crowded.length; i++) expect(crowded[i][0] - crowded[i - 1][0]).toBeGreaterThanOrEqual(2)
    expect(crowded.at(-1)![0]).toBeLessThanOrEqual(38)
  })
})

describe('toDefines', () => {
  it('passes every setting, with the bulges cleaned up', () => {
    expect(toDefines({ ...DEFAULTS, bulges: [[200, 15]] })).toEqual([
      'height=160',
      'bottom_radius=35',
      'top_radius=45',
      'wall=2',
      'sides=96',
      'bulges=[[152, 15]]',
    ])
  })
})

describe('nextBulge', () => {
  it('goes in the middle of the largest free stretch of wall', () => {
    expect(nextBulge([[40, 5], [140, 5]], 160)[0]).toBe(90)
    expect(nextBulge([], 160)[0]).toBe(80)
  })
})
