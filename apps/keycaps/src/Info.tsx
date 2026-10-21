import { COMMON_FAQ, Ext, Faq, InfoSheet, usageSection } from '@stl-creator/stl-kit'
import { ProfileStrip } from './components/ProfileStrip'
import { DEFAULTS } from './scad/params'
import './Info.css'

// Original DCS values, from the comments in models/keycaps/profile.scad
const DCS = {
  heights: [11.5, 8.5, 7.5, 6, 6],
  tilts: [-6, -1, 3, 7, 16],
  skews: [1.75, 1.75, 1.75, 1.75, 1.75],
}

const ROW_NAMES = ['Number row', 'Top row', 'Home row', 'Bottom row', 'Thumb row']

const FAQ = [
  {
    q: 'Which switches do these fit?',
    a: 'Switches with a Cherry MX-style cross stem: Cherry MX and the many switches that copy it (Gateron, Kailh Box, Akko and so on). Not Kailh Choc or Alps.',
  },
  {
    q: 'The keycap is too tight or too loose on the switch.',
    a: 'Change Stem slop under Printing: raise it a little when the keycap is too tight, lower it when it wobbles. Print a single key to test before printing the set.',
  },
  {
    q: 'Can I make keycaps for another keyboard?',
    a: 'Single keys, yes: pick a row and a length. The full set is only laid out for the Sofle for now.',
  },
  ...COMMON_FAQ,
]

interface Props {
  open: boolean
  onClose: () => void
}

/** About the keycap creator, as a drawing sheet over it. */
export function Info({ open, onClose }: Props) {
  return (
    <InfoSheet
      open={open}
      onClose={onClose}
      title="About Keycap STL"
      lead={
        <>
          Keycap STL makes 3D-printable keycaps for the Sofle split keyboard, in a sculpted profile based on DCS.
          Change the shape, pick a legend font, check the result in 3D and download an STL for your slicer.
        </>
      }
      sections={[
        { id: 'print-tips', title: 'Print tips', body: (<>
              <p>
                Keycaps are a hard print: a small part, a thin stem that has to stand on its own, and a sculpted top that
                should come out smooth. This is what gives the best results so far:
              </p>
              <ul>
                <li>
                  <strong>A textured build plate.</strong> A Biqu Frost-bite plate holds the small footprint well and
                  lets go once it has cooled.
                </li>
                <li>
                  <strong>A 3 mm brim</strong>, so the keycap stays put on the plate. It peels off easily afterwards.
                </li>
                <li>
                  <strong>A 0.25 mm nozzle</strong> for crisp legends and edges. Keep the stem tine width at or above
                  the nozzle width (under Printing in the settings).
                </li>
                <li>
                  <strong>Matte filament.</strong> It hides the layer lines on the curved top far better than glossy
                  filament.
                </li>
              </ul>
              <p>
                <strong>Stem comes loose?</strong> Print with supports instead. Then turn off <em>Stem tines</em> under
                Printing in the settings: the supports hold the stem, and tines would only get in the way.
              </p>
            
        </>) },
        { id: 'printing', title: 'Print settings', body: (<>
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
            
        </>) },
        { id: 'profile', title: 'The profile', body: (<>
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
            
        </>) },
        { id: 'how', title: 'How it works', body: (<>
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
            
        </>) },
        { id: 'faq', title: 'FAQ', body: <Faq items={FAQ} /> },
        usageSection(),
        { id: 'made-with', title: 'Made with', body: <MadeWith /> },
      ]}
      titleBlock={[
        { label: 'Title', value: 'Keycap STL, Sofle keycap configurator' },
        { label: 'Profile', value: 'DCS-inspired' },
        { label: 'Units', value: 'mm' },
        { label: 'License', value: 'CC BY-NC 4.0' },
      ]}
    />
  )
}

function MadeWith() {
  return (
    <dl className="credits">
      <dt>
        <Ext href="https://github.com/rsheldiii/KeyV2">KeyV2</Ext>
      </dt>
      <dd>
        The parametric OpenSCAD keycap library by rsheldiii, which inspired this keycap model. The model itself is
        written from scratch by Art &amp; Flywork.
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
        The modelling program and its fast geometry engine, running in the browser through the 
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
  )
}
