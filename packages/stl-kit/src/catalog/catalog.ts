// Every creator in this repo, for the index page and the "more creators"
// links. One place for names, search words and addresses.

export interface Creator {
  id: string
  name: string
  tagline: string
  /** Extra words people might search for. */
  keywords: string[]
  /** Fixed port of the app's dev server. */
  devPort: number
  /** Production address; null until the app is deployed. */
  url: string | null
  /** Thumbnail URL. */
  image: string
}

export const CREATORS: Creator[] = [
  {
    id: 'vase',
    name: 'Vase',
    tagline: 'A vase in your own shape: tall or squat, bulging or pinched.',
    keywords: ['vase', 'flowers', 'pot', 'plant', 'home', 'decoration'],
    devPort: 5172,
    url: null,
    image: '',
  },
  {
    id: 'keychain',
    name: 'Name keychain',
    tagline: 'Your name as a tag, in any Google font, with a hole for a key ring.',
    keywords: ['keychain', 'name', 'tag', 'label', 'text', 'gift'],
    devPort: 5173,
    url: null,
    image: '',
  },
  {
    id: 'keycaps',
    name: 'Keycaps',
    tagline: 'DCS-style keycaps for the Sofle keyboard, one key or the whole set.',
    keywords: ['keycaps', 'keyboard', 'mechanical', 'sofle', 'legend'],
    devPort: 5171,
    url: 'https://keycap-stl.vercel.app/',
    image: '',
  },
]

/** The index page itself. No production address yet. */
export const INDEX = { devPort: 5170, url: null as string | null }

export function creatorUrl(c: { devPort: number; url: string | null }, dev: boolean = import.meta.env.DEV): string | null {
  return dev ? `http://localhost:${c.devPort}/` : c.url
}

export function indexUrl(dev: boolean = import.meta.env.DEV): string | null {
  return creatorUrl(INDEX, dev)
}

/** Creators that contain every word of the query in their name, tagline or keywords. */
export function searchCreators(list: Creator[], query: string): Creator[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  return list.filter((c) => {
    const text = [c.name, c.tagline, ...c.keywords].join(' ').toLowerCase()
    return words.every((word) => text.includes(word))
  })
}
