import { indexUrl } from './catalog'

/**
 * The way back to the index, as a square button at the top of a creator's
 * panel: most visitors land straight on one creator and should see there
 * is more to make.
 */
export function MoreCreators() {
  return (
    <a className="more-creators" href={indexUrl()}>
      <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M12 4H4v8M4 4l9 9" />
      </svg>
      Back to all models
    </a>
  )
}
