import { indexUrl } from './catalog'

/** Quiet link to the index, at the top of a creator's panel. */
export function MoreCreators() {
  return (
    <a className="more-creators" href={indexUrl()}>
      <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />
      </svg>
      More creators
    </a>
  )
}
