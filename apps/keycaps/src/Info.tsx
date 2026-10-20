import { useCallback, useRef, type MouseEvent, type ReactNode } from 'react'
import { ProfileStrip } from './components/ProfileStrip'
import { SheetDialog } from './components/SheetDialog'
import { DEFAULTS } from './scad/params'
import './Info.css'

// Original DCS values, from the comments in models/keycaps/profile.scad
const DCS = {
  heights: [11.5, 8.5, 7.5, 6, 6],
  tilts: [-6, -1, 3, 7, 16],
  skews: [1.75, 1.75, 1.75, 1.75, 1.75],
}

const ROW_NAMES = ['Number row', 'Top row', 'Home row', 'Bottom row', 'Thumb row']

const SECTIONS = [
  { id: 'how', title: 'How it works' },
  { id: 'profile', title: 'The profile' },
  { id: 'built-on', title: 'Built on' },
  { id: 'printing', title: 'Printing' },
  { id: 'license', title: 'License' },
]

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

/** About the app, as a drawing sheet over the configurator. */
export function Info({ open, onClose }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const toTop = useCallback(() => scroller.current?.scrollTo(0, 0), [])

  const jump = (event: MouseEvent, id: string) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <SheetDialog open={open} onClose={onClose} title="About Keycap STL" onOpen={toTop}>

      <div className="sheet-body">
        <nav className="info-nav" aria-label="On this page">
          <ul>
            {SECTIONS.map((s) => (
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
            <p className="lead">
              Keycap STL makes 3D-printable keycaps for the Sofle split keyboard, in a sculpted profile based on
              DCS. Change the shape, pick a legend font, check the result in 3D and download an STL for your slicer.
            </p>

            <section id="how">
              <h2>How it works</h2>
              <ol className="steps">
                <li>
                  Your settings become variables for the keycap model, passed to OpenSCAD as <code>-D</code> overrides.
                  The model files themselves are never changed.
                </li>
                <li>
                  OpenSCAD, compiled to WebAssembly, renders the model in a background thread in your browser, using the
                  Manifold geometry engine. A single key takes about a third of a second, the full set a few seconds.
                </li>
                <li>
                  The legend font is downloaded from Google Fonts and handed to OpenSCAD, which cuts the legend into the
                  top of the key.
                </li>
                <li>
                  The result is a binary STL. The 3D view shows exactly that file, and the download button saves it.
                </li>
              </ol>
              <p>
                Nothing is uploaded: every key is rendered on your own computer. The only things fetched from the
                internet are the list of fonts and the font you pick. Your settings are kept in this browser, so they
                are still there next time.
              </p>
            </section>

            <section id="profile">
              <h2>The profile</h2>
              <p>
                DCS is a sculpted keycap profile by Signature Plastics. Every row has its own height and top angle, so
                the tops of the keys form a curve under your fingers. This profile keeps the DCS footprint and its
                cylindrical dish, but changes the row heights and angles to suit a split keyboard with a thumb row, and
                adds a bevelled top edge.
              </p>
              <figure className="profile-figure">
                <ProfileStrip profile={DEFAULTS} compare={DCS} dimensions />
                <figcaption>
                  <span className="swatch filled" /> This profile <span className="swatch dashed" /> Original DCS <span className="swatch dim" /> Height in mm, at the centre of the top
                </figcaption>
              </figure>
              <table className="profile-table">
                <thead>
                  <tr>
                    <th scope="col">Row</th>
                    <th scope="col">Height</th>
                    <th scope="col">DCS</th>
                    <th scope="col">Top tilt</th>
                    <th scope="col">DCS</th>
                  </tr>
                </thead>
                <tbody>
                  {ROW_NAMES.map((name, r) => (
                    <tr key={name}>
                      <th scope="row">
                        {name} <span className="muted">{r === 4 ? 'T' : r}</span>
                      </th>
                      <td>{DEFAULTS.heights[r]} mm</td>
                      <td className="muted">{DCS.heights[r]} mm</td>
                      <td>{DEFAULTS.tilts[r]}°</td>
                      <td className="muted">{DCS.tilts[r]}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                Heights are measured at the centre of the top. A negative tilt makes the back of the key higher than the
                front. You can change every value per row in the configurator; these are the starting values.
              </p>
            </section>

            <section id="built-on">
              <h2>Built on</h2>
              <dl className="credits">
                <dt>
                  <Ext href="https://github.com/rsheldiii/KeyV2">KeyV2</Ext>
                </dt>
                <dd>
                  A parametric OpenSCAD keycap library by rsheldiii that can make SA, DSA, DCS, OEM and many other
                  profiles. The keycap model here is a modified version of it.
                </dd>
                <dt>
                  <Ext href="https://github.com/mcbrwr/sofle-optimized-DCS-keycaps">sofle-optimized-DCS-keycaps</Ext>
                </dt>
                <dd>
                  The OpenSCAD model this app renders: the profile, the shared settings and the Sofle layout. The app
                  uses its files as they are, so the model has one source of truth.
                </dd>
                <dt>DCS by Signature Plastics</dt>
                <dd>The sculpted profile the shape starts from.</dd>
                <dt>
                  <Ext href="https://github.com/josefadamcik/SofleKeyboard">Sofle</Ext>
                </dt>
                <dd>The split keyboard by Josef Adamčík that the full set is laid out for.</dd>
                <dt>
                  <Ext href="https://openscad.org">OpenSCAD</Ext> and <Ext href="https://github.com/elalish/manifold">Manifold</Ext>
                </dt>
                <dd>
                  The modelling program and its fast geometry engine, running in the browser through the{' '}
                  <Ext href="https://www.npmjs.com/package/openscad-wasm-prebuilt">openscad-wasm-prebuilt</Ext> build.
                </dd>
                <dt>
                  <Ext href="https://fonts.google.com">Google Fonts</Ext> via <Ext href="https://fontsource.org">Fontsource</Ext>
                </dt>
                <dd>All Google Fonts are available for legends, downloaded as TTF files that OpenSCAD can read.</dd>
                <dt>
                  <Ext href="https://threejs.org">three.js</Ext> and React Three Fiber
                </dt>
                <dd>The 3D view.</dd>
              </dl>
            </section>

            <section id="printing">
              <h2>Printing</h2>
              <ul>
                <li>
                  <strong>Stem slop</strong> is the extra room in the stem hole. If keycaps are too tight on your
                  switches, raise it a little; if they wobble, lower it.
                </li>
                <li>
                  <strong>Stem tines</strong> are thin lines on the first layer from the stem to the walls. They hold
                  the stem in place while printing; snip them off afterwards. Set their height to your first layer
                  height, and keep their width at or above your nozzle width, or some slicers leave them out.
                </li>
                <li>
                  <strong>Homing bumps</strong> go on F and J by default. Change the list under Homing bumps, or turn the
                  bump on or off for a single key.
                </li>
                <li>
                  <strong>Legends</strong> are cut 0.6 mm into the top. Thin or decorative fonts can print poorly at
                  small sizes; a bold monospace or sans-serif font is the safe choice.
                </li>
              </ul>
            </section>

            <section id="license">
              <h2>License</h2>
              <p>
                The keycap model is licensed under the GNU General Public License v3.0, like KeyV2 and OpenSCAD, and so
                is this app. The fonts keep their own licenses; Google Fonts are open source, mostly under the SIL Open
                Font License.
              </p>
            </section>

          </article>
        </div>
      </div>

      <footer className="title-block" aria-label="Drawing details">
        <dl>
          <div className="wide">
            <dt>Title</dt>
            <dd>Keycap STL, Sofle keycap configurator</dd>
          </div>
          <div>
            <dt>Profile</dt>
            <dd>DCS, modified</dd>
          </div>
          <div>
            <dt>Library</dt>
            <dd>KeyV2</dd>
          </div>
          <div>
            <dt>Units</dt>
            <dd>mm</dd>
          </div>
          <div>
            <dt>License</dt>
            <dd>GPL-3.0</dd>
          </div>
        </dl>
      </footer>
    </SheetDialog>
  )
}
