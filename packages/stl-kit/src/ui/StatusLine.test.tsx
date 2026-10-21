import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StatusLine } from './StatusLine'

const failed = { kind: 'error' as const, message: 'OpenSCAD exited with code 1', logs: ['ERROR: Current top level object is empty.'] }

describe('StatusLine errors', () => {
  it('tell visitors in plain words, without OpenSCAD output', () => {
    const html = renderToStaticMarkup(<StatusLine status={failed} hasModel dev={false} />)
    expect(html).toContain('could not be made')
    expect(html).not.toContain('OpenSCAD')
    expect(html).not.toContain('top level object')
  })

  it('show the details during development', () => {
    const html = renderToStaticMarkup(<StatusLine status={failed} hasModel dev />)
    expect(html).toContain('top level object')
  })
})
