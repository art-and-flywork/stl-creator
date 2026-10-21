import { describe, expect, it } from 'vitest'
import { CREATORS, creatorUrl, indexUrl, searchCreators } from './catalog'

describe('creatorUrl', () => {
  const vase = { devPort: 5172, url: null }

  it('points at the local dev server during development', () => {
    expect(creatorUrl(vase, true)).toBe('http://localhost:5172/')
  })

  it('has no link in production until the creator has an address', () => {
    expect(creatorUrl(vase, false)).toBeNull()
  })

  it('uses the production address when there is one', () => {
    expect(creatorUrl({ devPort: 5171, url: 'https://example.com/' }, false)).toBe('https://example.com/')
  })
})

describe('indexUrl', () => {
  it('is local during development and absent in production for now', () => {
    expect(indexUrl(true)).toBe('http://localhost:5170/')
    expect(indexUrl(false)).toBeNull()
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
