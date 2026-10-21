// Put the built apps together into one static site in site/: the index at
// the root, each creator under its own path (its Vite `base`, listed in the
// catalog in packages/stl-kit). Run after `turbo run build`.
import { cpSync, existsSync, rmSync } from 'node:fs'

const apps = { index: '', keycaps: 'keycaps', vase: 'vase', keychain: 'keychain' }

rmSync('site', { recursive: true, force: true })
for (const [app, path] of Object.entries(apps)) {
  const dist = `apps/${app}/dist`
  if (!existsSync(dist)) throw new Error(`${dist} is missing; build the apps first`)
  cpSync(dist, `site/${path}`, { recursive: true })
}
console.log('site/ assembled:', Object.values(apps).map((p) => `/${p}`).join(' '))
