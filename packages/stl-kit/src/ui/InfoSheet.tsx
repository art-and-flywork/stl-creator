import { useCallback, useRef, type MouseEvent, type ReactNode } from 'react'
import { SupportLink } from '../catalog/support'
import { SheetDialog } from './SheetDialog'
import './InfoSheet.css'

export interface InfoSection {
  id: string
  title: string
  body: ReactNode
}

interface Props {
  open: boolean
  onClose: () => void
  /** Sheet title, e.g. "About the vase creator". */
  title: string
  lead: ReactNode
  sections: InfoSection[]
  /** The drawing's title block, bottom right; the first entry spans the width. */
  titleBlock: { label: string; value: string }[]
}

/**
 * About a creator, as a drawing sheet over it: a contents list on the left,
 * the sections, and a title block. Every creator has one, with at least
 * print tips, a FAQ and the "Use & license" section (usageSection()).
 */
export function InfoSheet({ open, onClose, title, lead, sections, titleBlock }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const toTop = useCallback(() => scroller.current?.scrollTo(0, 0), [])

  const jump = (event: MouseEvent, id: string) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <SheetDialog open={open} onClose={onClose} title={title} onOpen={toTop}>
      <div className="sheet-body">
        <nav className="info-nav" aria-label="On this page">
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="info-scroll" ref={scroller}>
          <article className="info-article">
            <p className="lead">{lead}</p>
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.title}</h2>
                {s.body}
              </section>
            ))}
            <p className="source-note">
              The app itself is open source: its code is on{' '}
              <Ext href="https://github.com/art-and-flywork/stl-creator">GitHub</Ext>, under the GPL-3.0.
            </p>
          </article>
        </div>
      </div>

      <footer className="title-block" aria-label="Drawing details">
        <dl>
          {titleBlock.map((item, i) => (
            <div key={item.label} className={i === 0 ? 'wide' : undefined}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </footer>
    </SheetDialog>
  )
}

/** A link that opens in a new tab. */
export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

/** Questions and answers, for the FAQ section. */
export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <dl className="faq">
      {items.map((item) => (
        <div key={item.q}>
          <dt>{item.q}</dt>
          <dd>{item.a}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Questions every creator gets; each creator adds its own in front. */
export const COMMON_FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Is my design uploaded anywhere?',
    a: 'No. The model is made on your own computer, in your browser. Your settings stay in this browser, and only go somewhere else when you share a link.',
  },
  {
    q: 'Can I sell what I print?',
    a: (
      <>
        Not without a commercial license; see Use &amp; license below. Get in touch via{' '}
        <Ext href="https://artandflywork.com">artandflywork.com</Ext>.
      </>
    ),
  },
]

/** "Use & license": the same terms for every creator. */
export function usageSection(): InfoSection {
  return {
    id: 'use',
    title: 'Use & license',
    body: (
      <>
        <p>This creator is free for everyone to use.</p>
        <ul>
          <li>
            <strong>Personal use is free.</strong> Print the STL, give the result away, share your design. Please
            mention Art &amp; Flywork when you share it. If you like it, you can{' '}
            <SupportLink from="info">buy me a coffee</SupportLink>.
          </li>
          <li>
            <strong>Commercial use needs a license.</strong> Selling prints, or using the STL in a product or service,
            needs a commercial license. Get in touch via <Ext href="https://artandflywork.com">artandflywork.com</Ext>.
          </li>
        </ul>
        <p>
          The model and the STL files made with it are © Art &amp; Flywork, licensed under{' '}
          <Ext href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</Ext>.
        </p>
      </>
    ),
  }
}
