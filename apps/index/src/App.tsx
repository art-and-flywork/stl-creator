import { CREATORS, creatorUrl, searchCreators, type Creator } from '@stl-creator/stl-kit/catalog'
import { useMemo, useState } from 'react'
import './App.css'

export default function App() {
  const [query, setQuery] = useState('')
  const found = useMemo(() => searchCreators(CREATORS, query), [query])
  const searching = query.trim() !== ''

  return (
    <div className="index">
      <header className="intro">
        <h1>Make your own object</h1>
        <p>
          Pick a creator, move the sliders and download a file for your 3D printer. No CAD needed: everything runs
          in your browser, nothing is uploaded.
        </p>

        <div className="search">
          <label htmlFor="search">Search creators</label>
          <input
            id="search"
            type="search"
            value={query}
            placeholder="Vase, name, keyboard…"
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="count" aria-live="polite">
            {searching ? `${found.length} of ${CREATORS.length} creators` : `${CREATORS.length} creators`}
          </p>
        </div>

        <footer className="credits">
          Made by Art &amp; Flywork. Open source under the GPL-3.0 on{' '}
          <a href="https://github.com/art-and-flywork/stl-creator">GitHub</a>.
        </footer>
      </header>

      <main className="mat">
        {found.length > 0 ? (
          <ul className="creators">
            {found.map((creator) => (
              <CreatorTile key={creator.id} creator={creator} />
            ))}
          </ul>
        ) : (
          <div className="nothing">
            <p>Nothing matches “{query.trim()}”.</p>
            <button type="button" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function CreatorTile({ creator }: { creator: Creator }) {
  return (
    <li>
      <a className="tile" href={creatorUrl(creator)}>
        <img src={creator.image} alt="" width={800} height={600} />
        <span className="name">{creator.name}</span>
        <span className="tagline">{creator.tagline}</span>
      </a>
    </li>
  )
}
