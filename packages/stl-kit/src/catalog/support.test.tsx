import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MadeBy } from './MadeBy'

describe('MadeBy', () => {
  it('credits Art & Flywork and links to Ko-fi', () => {
    const html = renderToStaticMarkup(<MadeBy creator="vase" />)
    expect(html).toContain('Made with')
    expect(html).toContain('https://artandflywork.com')
    expect(html).toContain('https://ko-fi.com/artandflywork')
  })
})
