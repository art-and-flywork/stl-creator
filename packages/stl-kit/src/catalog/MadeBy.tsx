import { SupportLink } from './support'

/**
 * "Made with ❤️ by Art & Flywork" and a Ko-fi tip control, at the bottom of
 * the index and of every creator's panel.
 */
export function MadeBy({ creator }: { creator?: string }) {
  return (
    <footer className="made-by">
      Made with <span role="img" aria-label="love">❤️</span> by{' '}
      <a href="https://artandflywork.com" target="_blank" rel="noreferrer">
        Art &amp; Flywork
      </a>
      <SupportLink from="footer" creator={creator} className="support">
        ☕ Buy me a coffee
      </SupportLink>
    </footer>
  )
}
