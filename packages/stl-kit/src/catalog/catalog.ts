import keycapsImage from './images/keycaps.png'
import keychainImage from './images/keychain.png'
import onigiriImage from './images/onigiri.png'
import vaseImage from './images/vase.png'

// Every creator in this repo, for the index page and the "more creators"
// links. One place for names, search words and addresses. In production all
// apps are one site: the index at /, each creator under its own path (the
// app's Vite `base`; scripts/assemble-site.mjs puts them together).

export interface Creator {
  id: string
  name: string
  tagline: string
  /** Extra words people might search for. */
  keywords: string[]
  /** Fixed port of the app's dev server. */
  devPort: number
  /** Path on the site in production; also the app's Vite `base`. */
  path: string
  /** Thumbnail URL (made by scripts/thumbnails.sh). */
  image: string
}

export const CREATORS: Creator[] = [
  {
    id: 'vase',
    name: 'Custom vase',
    tagline: 'A printable vase in your own shape: tall or squat, bulging or pinched.',
    keywords: ['vase', 'stl', 'flowers', 'pot', 'plant', 'home', 'decoration', '3d print'],
    devPort: 5172,
    path: '/vase/',
    image: vaseImage,
  },
  {
    id: 'onigiri',
    name: 'Onigiri rice mold',
    tagline: 'Base, ring and press in one STL — pick size, height and corners.',
    keywords: ['onigiri', 'rice', 'mold', 'sushi', 'food', 'kitchen', 'triangle', 'stl', '3d print'],
    devPort: 5174,
    path: '/onigiri/',
    image: onigiriImage,
  },
  {
    id: 'keychain',
    name: 'Name keychain',
    tagline: 'Your name as a printable tag, in any Google font, with a hole for a key ring.',
    keywords: ['keychain', 'name', 'tag', 'label', 'text', 'gift', 'stl', '3d print'],
    devPort: 5173,
    path: '/keychain/',
    image: keychainImage,
  },
  {
    id: 'keycaps',
    name: 'Sofle keycaps',
    tagline: 'DCS-style keycaps for the Sofle — one key or the whole set, free STL.',
    keywords: ['keycaps', 'keyboard', 'mechanical', 'sofle', 'legend', 'dcs', 'stl', '3d print'],
    devPort: 5171,
    path: '/keycaps/',
    image: keycapsImage,
  },
]

/** The index page itself. */
export const INDEX = { devPort: 5170, path: '/' }

/** Each app runs on its own port during development. */
export function creatorUrl(c: { devPort: number; path: string }, dev: boolean = import.meta.env.DEV): string {
  return dev ? `http://localhost:${c.devPort}${c.path}` : c.path
}

export function indexUrl(dev: boolean = import.meta.env.DEV): string {
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
