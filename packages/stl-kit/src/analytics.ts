// Cookie-free usage stats with Umami: page views come in automatically,
// downloads and shares are sent with track(). Off until VITE_UMAMI_WEBSITE_ID
// is set (in Vercel's environment variables), never during development, and
// only counted on the live domain.

declare global {
  // set by Umami's script once it has loaded
  var umami: { track: (event: string, data?: Record<string, string | number>) => void } | undefined
}

const DOMAINS = 'stl-creator.app,www.stl-creator.app'

/** Attributes of the Umami script tag, or null when it should not load. */
export function analyticsScript(
  websiteId: string | undefined = import.meta.env.VITE_UMAMI_WEBSITE_ID,
  dev: boolean = import.meta.env.DEV,
): Record<string, string> | null {
  if (!websiteId || dev) return null
  return { src: 'https://cloud.umami.is/script.js', 'data-website-id': websiteId, 'data-domains': DOMAINS }
}

/** Add the Umami script to the page; call once from main.tsx. */
export function loadAnalytics() {
  const attributes = analyticsScript()
  if (!attributes) return
  const script = document.createElement('script')
  script.defer = true
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value)
  document.head.append(script)
}

/** Count an event, e.g. track('download', { creator: 'vase' }). Never throws. */
export function track(event: string, data?: Record<string, string | number>) {
  try {
    globalThis.umami?.track(event, data)
  } catch {
    // blocked or broken analytics must never break the app
  }
}
