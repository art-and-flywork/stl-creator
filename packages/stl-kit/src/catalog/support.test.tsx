import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MadeBy } from './MadeBy'
import { KOFI_EMBED_URL, KOFI_URL } from './support'

describe('MadeBy', () => {
  it('credits Art & Flywork and offers the Ko-fi tip control', () => {
    const html = renderToStaticMarkup(<MadeBy creator="vase" />)
    expect(html).toContain('Made with')
    expect(html).toContain('https://artandflywork.com')
    expect(html).toContain('Buy me a coffee')
    expect(html).toContain('support-link')
  })
})

describe('Ko-fi URLs', () => {
  it('points the tip panel embed at the Art & Flywork account', () => {
    expect(KOFI_URL).toBe('https://ko-fi.com/artandflywork')
    expect(KOFI_EMBED_URL).toContain('ko-fi.com/artandflywork')
    expect(KOFI_EMBED_URL).toContain('widget=true')
    expect(KOFI_EMBED_URL).toContain('embed=true')
    expect(KOFI_EMBED_URL).toContain('hidefeed=true')
  })
})
