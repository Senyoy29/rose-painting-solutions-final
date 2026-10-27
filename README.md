# Rose Painting Solutions — website

A fast, single-page site for Rose Painting Solutions. It opens with “The First Stroke”: the paintbrush logo comes to life and paints the homepage in. The brush then paints a real project photo into the hero's arched doorway. Below that are a real before & after, an “Our Work” exhibition of project photos with a full-screen viewer, then services, process, FAQ and a quote form.

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

## Your photos

All real photos live in **`public/images/rose-painting/real-work/`**. Each one has a full-size file and an `-800` copy for phones.

### Before & after (`src/data/projects.js`)

This file holds **confirmed** pairs only. Right now it has one: the bathroom vanity, with photo 10 (`IMG_0325`) as before and photo 11 (`IMG_0326`) as after, as confirmed by you. The section shows a drag slider and a side-by-side view. It also includes a note that the two photos were taken from different angles, because they don't line up exactly.

To add another pair, add a block with a `before` and `after` photo. The section shows the first pair; ask if you'd like a project switcher once you have more than one. Tips:

- Take both photos from the same spot, at the same height and zoom, so the slider lines up.
- Never add a pair you haven't confirmed. Other photos belong in the portfolio.

### Our Work gallery (`src/data/portfolio.js`)

Five photos of finished projects: photos 01–05. Captions and alt text describe what's visible in each photo. To add one:

1. Put `13-my-photo.webp` and `13-my-photo-800.webp` (800px wide) in the `real-work` folder.
2. Add a `photo(...)` line in `portfolio.js` with the pixel size, a short caption and alt text.
3. Optionally place it in the `hang` list, which sets the desktop column order. Photos not listed there are added automatically.

Photos keep their real proportions, so portrait and landscape shots both work. The hero arch uses the first photo in the list (`heroPhoto`). The About section uses photo 03.

### Making `-800` copies

The free tool [Squoosh](https://squoosh.app) works well: resize to 800px wide and export as WebP at about 75% quality.

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

- [ ] Check every caption in `src/data/portfolio.js` reads the way you'd describe the room
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
    HeroRoom.jsx          arch doorway where the brush paints a real photo in
    BeforeAfter.jsx       the confirmed real before & after (slider / side by side)
    OurWork.jsx           exhibition wall of project photos
    Lightbox.jsx          full-screen photo viewer (keyboard, swipe)
    RevealHeading.jsx     headings that rise in as they scroll into view
    Services.jsx          paint-chip service cards
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
