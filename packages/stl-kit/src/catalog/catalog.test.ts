import { describe, expect, it } from 'vitest'
import { CREATORS, creatorUrl, indexUrl, searchCreators } from './catalog'

describe('creatorUrl', () => {
  const vase = { devPort: 5172, path: '/vase/' }

  it('points at the local dev server during development', () => {
    expect(creatorUrl(vase, true)).toBe('http://localhost:5172/vase/')
  })

  it('is a path on the same site in production', () => {
    expect(creatorUrl(vase, false)).toBe('/vase/')
  })
})

describe('indexUrl', () => {
  it('is local during development and the site root in production', () => {
    expect(indexUrl(true)).toBe('http://localhost:5170/')
    expect(indexUrl(false)).toBe('/')
  })
})

describe('CREATORS', () => {
  it('each live under their own path on the site', () => {
    expect(CREATORS.map((c) => c.path).sort()).toEqual(['/keycaps/', '/keychain/', '/vase/'])
  })
})

describe('searchCreators', () => {
  it('returns everything for an empty query', () => {
    expect(searchCreators(CREATORS, '  ')).toHaveLength(CREATORS.length)
  })

  it('ignores case', () => {
    expect(searchCreators(CREATORS, 'VASE').map((c) => c.id)).toEqual(['vase'])
  })

  it('needs every word to match somewhere', () => {
    expect(searchCreators(CREATORS, 'key ring').map((c) => c.id)).toEqual(['keychain'])
  })

  it('returns nothing when nothing matches', () => {
    expect(searchCreators(CREATORS, 'zzz')).toEqual([])
  })
})
