import { COMMON_FAQ, Faq, InfoSheet, usageSection } from '@stl-creator/stl-kit'

const FAQ = [
  {
    q: 'What are the three pieces?',
    a: 'The base holds the ring; the ring shapes the rice; the press packs it down. They sit side by side on one print plate.',
  },
  {
    q: 'What does diameter mean?',
    a: 'The width of the rice cavity — the opening inside the ring. That is how big your onigiri will be.',
  },
  {
    q: 'Why only 3, 4 or 5 corners?',
    a: 'Classic onigiri is a rounded triangle (3). Four and five corners make softer “pillow” shapes. More sides start to look like a circle.',
  },
  ...COMMON_FAQ,
]

/** About the onigiri mold creator, as a drawing sheet over it. */
export function Info({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <InfoSheet
      open={open}
      onClose={onClose}
      title="About the onigiri mold"
      lead="Set the size of the rice cavity, how tall the ring is, how many corners (3–5), how soft those corners are, and the press handle length and height. Download one STL with the base, ring and press ready to print."
      sections={[
        {
          id: 'print-tips',
          title: 'Print tips',
          body: (
            <ul>
              <li>
                <strong>Flat on the bed.</strong> Print the plate as exported: base, ring and press already lie flat.
                No supports needed.
              </li>
              <li>
                <strong>Food contact.</strong> Use a food-safe filament if you can, wash before first use, and dry
                well. PLA is fine for cold rice; avoid hot water in the dishwasher.
              </li>
              <li>
                <strong>Fit.</strong> The press has a little play inside the ring so rice does not jam. If your
                printer runs oversized, scale X/Y down a hair in the slicer.
              </li>
              <li>
                <strong>How to use.</strong> Put the ring on the base lip, fill with rice, press, lift the ring,
                then turn out the onigiri.
              </li>
            </ul>
          ),
        },
        { id: 'faq', title: 'FAQ', body: <Faq items={FAQ} /> },
        usageSection(),
      ]}
      titleBlock={[
        { label: 'Title', value: 'Onigiri mold' },
        { label: 'Units', value: 'mm' },
        { label: 'License', value: 'CC BY-NC 4.0' },
      ]}
    />
  )
}
