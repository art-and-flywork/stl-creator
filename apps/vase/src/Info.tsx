import { COMMON_FAQ, Faq, InfoSheet, usageSection } from '@stl-creator/stl-kit'

const FAQ = [
  {
    q: 'Can the vase hold water?',
    a: 'Often, but not always straight off the printer: thin printed walls can weep. See the print tips, or put a glass or jar inside for fresh flowers.',
  },
  {
    q: 'How big can it be?',
    a: 'Up to 250 mm tall and about 190 mm wide, bulges included. Check that it fits your printer before you print.',
  },
  {
    q: 'Why did a bulge move when I added another?',
    a: 'Bulges need a little room between them, and stay away from the very bottom and rim, so the wall stays smooth. The creator nudges them apart where needed.',
  },
  ...COMMON_FAQ,
]

/** About the vase creator, as a drawing sheet over it. */
export function Info({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <InfoSheet
      open={open}
      onClose={onClose}
      title="About the vase"
      lead="Shape a vase with a few sliders: its height, the width at the bottom and the rim, the wall thickness, how many sides it has (for roundness), and bulges that push the wall out or pull it in. Then download the STL for your slicer."
      sections={[
        {
          id: 'print-tips',
          title: 'Print tips',
          body: (
            <ul>
              <li>
                <strong>Solid walls.</strong> Set the number of walls (perimeters) in your slicer so they fill the wall
                thickness: a 2 mm wall with a 0.4 mm nozzle is 5 walls. Then the vase needs no infill.
              </li>
              <li>
                <strong>Gentle bulges print best.</strong> Where the wall leans out further than about 45°, it may need
                supports or come out rough. Spread a big bulge over more height, or make it a bit smaller.
              </li>
              <li>
                <strong>For water,</strong> use a wall of 2 mm or more and print a little slower and hotter so the
                layers fuse well. PETG seals better than PLA.
              </li>
              <li>
                <strong>Big vases</strong> benefit from a brim, so the base stays flat on the plate while the print is
                tall.
              </li>
              <li>
                <strong>Sides.</strong> The default (96) is fine for most prints. Raise it toward 200–300 if you want a
                smoother rim and wall; the file gets larger and the preview can take a bit longer.
              </li>
            </ul>
          ),
        },
        { id: 'faq', title: 'FAQ', body: <Faq items={FAQ} /> },
        usageSection(),
      ]}
      titleBlock={[
        { label: 'Title', value: 'Vase creator' },
        { label: 'Units', value: 'mm' },
        { label: 'License', value: 'CC BY-NC 4.0' },
      ]}
    />
  )
}
