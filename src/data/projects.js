// ─────────────────────────────────────────────────────────────
// Before & after projects.
//
// To use your own photos:
//   1. Put them in  public/images/rose-painting/
//   2. Change the file names below (keep before + after the same framing).
//   3. Delete the `sample: true` line — it shows a "Sample illustration" note.
//   4. Optional: add a smaller ~800px-wide copy as `beforeSmall` / `afterSmall`
//      for faster loading on phones. If you don't have one, delete those lines.
//
// Paths are relative to the public folder, without a leading slash.
// ─────────────────────────────────────────────────────────────
const dir = 'images/rose-painting/'

export const projects = [
  {
    sample: true,
    id: 'living-room',
    room: 'Living room',
    title: 'From tired beige to a calm, bright living room',
    work: 'Patched nail holes, removed tape marks, primed and repainted walls and trim, plus a deep blue feature wall.',
    before: dir + 'living-room-before.webp',
    after: dir + 'living-room-after.webp',
    beforeSmall: dir + 'living-room-before-800.webp',
    afterSmall: dir + 'living-room-after-800.webp',
    beforeAlt: 'Living room before painting: yellowed beige walls with scuffs and patchy marks',
    afterAlt: 'Living room after painting: clean white walls with a deep blue feature wall behind the sofa',
  },
  {
    sample: true,
    id: 'bedroom',
    room: 'Bedroom',
    title: 'Peeling olive walls restored to a soft sky blue',
    work: 'Scraped and sanded flaking paint, filled and primed, then two coats of pale blue with a bright white ceiling.',
    before: dir + 'bedroom-before.webp',
    after: dir + 'bedroom-after.webp',
    beforeSmall: dir + 'bedroom-before-800.webp',
    afterSmall: dir + 'bedroom-after-800.webp',
    beforeAlt: 'Bedroom before: dark olive walls with paint peeling near the ceiling',
    afterAlt: 'Bedroom after: smooth pale sky-blue walls and a bright white ceiling',
  },
  {
    sample: true,
    id: 'dining-room',
    room: 'Dining room',
    title: 'Water stains and cracks gone for good',
    work: 'Sealed a ceiling water stain, repaired hairline plaster cracks and refinished walls with a blue-grey lower wall.',
    before: dir + 'dining-room-before.webp',
    after: dir + 'dining-room-after.webp',
    beforeSmall: dir + 'dining-room-before-800.webp',
    afterSmall: dir + 'dining-room-after-800.webp',
    beforeAlt: 'Dining room before: water-stained ceiling and cracked, faded walls',
    afterAlt: 'Dining room after: crisp white walls, smooth ceiling and a blue-grey lower wall',
  },
  {
    sample: true,
    id: 'hallway',
    room: 'Hallway',
    title: 'A busy hallway that finally looks cared for',
    work: 'Cleaned and repaired scuffed walls, filled chipped trim and finished doors and frames in durable gloss white.',
    before: dir + 'hallway-before.webp',
    after: dir + 'hallway-after.webp',
    beforeSmall: dir + 'hallway-before-800.webp',
    afterSmall: dir + 'hallway-after-800.webp',
    beforeAlt: 'Hallway before: scuffed walls, handprints and chipped trim',
    afterAlt: 'Hallway after: light blue-grey walls with fresh gloss white doors and trim',
  },
]
