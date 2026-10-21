import { COMMON_FAQ, Faq, InfoSheet, usageSection } from '@stl-creator/stl-kit'

const FAQ = [
  {
    q: 'Which fonts can I use?',
    a: 'Every Google Font. Bold, rounded fonts work best; thin or very curly script fonts can break at small sizes.',
  },
  {
    q: 'My name is long.',
    a: 'Names of up to 20 characters fit. A long name makes a long tag; lower the letter size to keep it handy.',
  },
  {
    q: 'What fits through the hole?',
    a: 'The hole is 5 mm across: a standard split key ring or a small carabiner.',
  },
  ...COMMON_FAQ,
]

/** About the keychain creator, as a drawing sheet over it. */
export function Info({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <InfoSheet
      open={open}
      onClose={onClose}
      title="About the name keychain"
      lead="Type a name, pick a font, and get a tag that follows the letters, with raised letters and a ring for your keys. Download the STL for your slicer."
      sections={[
        {
          id: 'print-tips',
          title: 'Print tips',
          body: (
            <ul>
              <li>
                <strong>Print it flat,</strong> letters up, as it comes out of the creator. It needs no supports.
              </li>
              <li>
                <strong>Two colours:</strong> add a filament change (or a pause) in your slicer at the top of the tag,
                at the tag thickness (3 mm by default), so the letters print in another colour.
              </li>
              <li>
                <strong>Sturdy letters:</strong> with a thin font, keep the letter size at 12 mm or more, and keep the
                border at 3 mm so the tag holds the letters together.
              </li>
            </ul>
          ),
        },
        { id: 'faq', title: 'FAQ', body: <Faq items={FAQ} /> },
        usageSection(),
      ]}
      titleBlock={[
        { label: 'Title', value: 'Name keychain creator' },
        { label: 'Units', value: 'mm' },
        { label: 'License', value: 'CC BY-NC 4.0' },
      ]}
    />
  )
}
