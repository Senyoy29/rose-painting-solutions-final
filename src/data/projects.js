// ─────────────────────────────────────────────────────────────
// Confirmed before & after projects (real photos only).
//
// Only add a project here when you have confirmed that both photos
// show the same space and which one came first. Everything else
// belongs in portfolio.js.
//
// Paths are relative to /public. `small` versions (~800px) are used
// on phones; the full files on larger screens.
// ─────────────────────────────────────────────────────────────
const dir = 'images/rose-painting/real-work/'

export const transformations = [
  {
    id: 'bathroom-vanity',
    room: 'Bathroom',
    title: 'Bathroom vanity wall',
    // Confirmed by the owner: photo 11 (IMG_0326) is BEFORE, photo 10 (IMG_0325) is AFTER.
    before: {
      src: dir + '11-bathroom-vanity-patterned-wall.webp',
      small: dir + '11-bathroom-vanity-patterned-wall-800.webp',
      w: 1170,
      h: 1552,
      alt: 'Before: bathroom double vanity with a patterned wall covering behind and around the mirror',
    },
    after: {
      src: dir + '10-bathroom-vanity-plain-wall.webp',
      small: dir + '10-bathroom-vanity-plain-wall-800.webp',
      w: 1170,
      h: 1556,
      alt: 'After: the same bathroom double vanity with smooth plain white walls and a large mirror, with paint and tools still on the counter',
    },
    // Shown next to the comparison so the presentation stays honest.
    note: 'Both photos show the same vanity. They were taken from different angles, so details won’t line up exactly in the slider.',
  },
]
