# Rose Painting Solutions — website

A fast, single-page site for Rose Painting Solutions. It opens with “The First Stroke”: the paintbrush logo comes to life and paints the homepage in. The hero then paints a room from before to after inside an arched doorway, followed by an exhibition-style before/after gallery, services, process, FAQ and a quote form.

Built with **React 19 + Vite + Tailwind CSS v4**. Animation is hand-built (canvas + CSS + Web Animations) rather than a motion library, so the whole site ships about 78 KB of gzipped JavaScript and has no runtime animation dependencies.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) 20.19 or newer.

```bash
npm install
npm run dev        # local preview at http://localhost:5173
npm run build      # production files go to /dist
npm run preview    # check the production build locally
```

The intro plays once per browser session. To see it again, use **Replay intro** in the footer, or open a new private window. Visitors who turn on “reduce motion” never see it.

---

## Swap in your real before & after photos

1. Put your photos in **`public/images/rose-painting/`**.
2. Open **`src/data/projects.js`** and change the file names, room names and descriptions.
3. That's it — the slider, project picker, hero card and About photo all read from that file.

Tips for great comparisons:

- **Take each before and after from the same spot, at the same height and zoom.** The slider only works if the two photos line up.
- Landscape photos at **1600 × 1000 px** (16:10) look best. Export as **WebP** or high-quality **JPG**, ideally under 300 KB each.
- Optional: also export an **800 px wide** copy of each photo and list it as `beforeSmall` / `afterSmall`. Phones will load the small one. If you skip this, delete those two lines for that project.
- Write alt text that describes the room, like the examples (“Bedroom before: dark walls with peeling paint…”). It helps people using screen readers and helps Google.
- Add or remove projects by adding or removing blocks in the list. Four to six projects works well.

The **hero room** (the arch the brush paints) uses the first project, and the **About** photo uses the third. Each sample project has `sample: true`, which shows a “Sample illustration” note on screen. Delete that line once you've swapped in a real photo.

Also replace `public/images/rose-painting/og-image.jpg` (1200 × 630). It's the preview image shown when someone shares the site link.

---

## Edit text, phone and hours

| What | Where |
| --- | --- |
| Phone, hours, business name | `src/data/site.js` |
| Services (paint chip cards) | `src/data/services.js` |
| Why-choose-us points, process steps, FAQ | `src/data/content.js` |
| Testimonials (real ones only, hidden while empty) | `testimonials` in `src/data/site.js` |
| Page title, description, Google business info | `index.html` |

---

## Turn on the quote form

The form needs somewhere to send enquiries. The easiest option is [Formspree](https://formspree.io), which has a free tier:

1. Create a form on Formspree and copy its endpoint (looks like `https://formspree.io/f/abcdwxyz`).
2. Copy `.env.example` to `.env` and set `VITE_FORM_ENDPOINT=` to that address.
3. Rebuild (`npm run build`). On Netlify or Vercel, add `VITE_FORM_ENDPOINT` under environment variables instead.

Until an endpoint is set, the form validates normally but shows a friendly “please call us” message rather than pretending to send.

If you use a service other than Formspree, also add its domain to `connect-src` and `form-action` in `public/_headers` and `vercel.json`.

---

## Deploy

Any static host works. The build uses relative paths, so it also runs from a sub-folder.

- **Netlify / Cloudflare Pages:** build command `npm run build`, publish folder `dist`. Security headers come from `public/_headers`.
- **Vercel:** import the project; headers come from `vercel.json`.
- **Traditional hosting (cPanel etc.):** upload the contents of `dist/`. Ask your host to add the headers from `public/_headers` if they can.

### Before launch

- [ ] Replace the placeholder images and `og-image.jpg`
- [ ] Set `VITE_FORM_ENDPOINT` and send yourself a test enquiry
- [ ] Add your domain to the `canonical` tag in `index.html`
- [ ] Add your service area (towns or counties) to the copy and to the `areaServed` field in the JSON-LD in `index.html`. It's good for local search, but it was left out because it wasn't confirmed.
- [ ] Check the FAQ answers match how you actually work
- [ ] Set up a Google Business Profile with the same name, phone and hours

---

## How it's put together

```
src/
  App.jsx                 page order + intro orchestration
  index.css               design tokens (colours, type) + component styles
  data/                   ← everything you'd normally edit
  components/
    Intro.jsx             “The First Stroke” opening sequence
    Brush.jsx             the rendered brush (shares geometry with the logo)
    Logo.jsx              logo lockups + BrushMark
    Hero.jsx              art-directed headline, depth/parallax
    HeroRoom.jsx          arch doorway where the brush paints the room
    RevealHeading.jsx     headings that rise in as they scroll into view
    Services.jsx          paint-chip service cards
    BeforeAfter.jsx       project showcase
    CompareSlider.jsx     draggable comparison (mouse, touch, keyboard)
    Trust.jsx, Process.jsx, Faq.jsx, Contact.jsx, ContactForm.jsx, Footer.jsx
    Header.jsx, MobileCallBar.jsx, Logo.jsx, BrushEdge.jsx, Icons.jsx
```

**Brand identity.** The paintbrush logo and the brush in the intro share exactly the same shapes (`src/lib/brushGeometry.js`), so the brand mark *is* the brush that paints the site. `src/components/Logo.jsx` provides:

- `<Logo tone="light" />` for white backgrounds, and `<Logo tone="dark" />` for blue ones
- `layout="stacked"` for the footer and other large uses
- `<BrushMark tone="tile" />` for a square icon (the favicon in `public/favicon.svg` is the same design)

**Motion.** The paint engine (`src/lib/paintEngine.js`) powers both the intro and the hero room. It simulates each bristle individually, varies brush pressure and throws off a few droplets. One brushed-edge mask (`--brush-mask` in `index.css`) drives the image reveals, project switches, the before/after toggle and the button fills. If anything in the intro fails, the site shows immediately: there's a fallback when canvas isn't available, plus a 6-second failsafe.

**Design system.** Colours: primer `#FBFCFE`, cobalt `#2348D6`, electric cobalt `#3D6BFF`, navy `#0D1F4D`, ice `#E7EFFC`, sky `#BFD3F7`, wash `#EEF3FA`, blue-gray `#5B6888`, painter's-tape blue `#5AA6E8`. Type: Gloock for display, Hanken Grotesk for text.

**Accessibility.** The site has keyboard-operable sliders, accordion and menu, a skip link, visible focus rings, labelled form errors and live regions. The intro is skipped for anyone with “reduce motion” turned on and can be skipped with Esc or the button.

**Performance.** Images are responsive (`srcset`) and lazy-loaded below the fold, with explicit sizes to avoid layout shift. The intro canvas is capped at 1.75× pixel density and is removed from the page when it finishes.
