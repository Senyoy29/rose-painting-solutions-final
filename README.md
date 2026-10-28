# Rose Painting Solutions — website

A fast, single-page site for Rose Painting Solutions in five sections. It opens with “The First Stroke”, where the paintbrush logo paints the homepage's house photograph into view. Then come services and why choose us, real work (four confirmed before & after projects plus five finished rooms), “Imagine the possibilities” (AI concept interiors, clearly labelled), and an FAQ plus contact.

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

All real photos live in **`public/images/rose-painting/real-work/`**. Each one has a full-size file and a smaller copy for phones.

### Before & after (`src/data/projects.js`)

This file holds **confirmed** pairs only. You confirmed all four:

| Project | Before | After |
| --- | --- | --- |
| Bathroom vanity | photo 11 (`IMG_0326`) → `11-bathroom-vanity-patterned-wall` | photo 10 (`IMG_0325`) → `10-bathroom-vanity-plain-wall` |
| Room with a high window | `IMG_0330` → `room-project-02-before` | `IMG_0333` → `room-project-02-after` |
| Room with a wide window | `IMG_0331` → `room-project-03-before` | `IMG_0332` → `room-project-03-after` |
| Room with built-in shelves | `IMG_0336` → `room-project-04-before` | `IMG_0337` → `room-project-04-after` |

Visitors pick a project from the cards (one row of four on larger screens, a swipeable row on phones), then compare it two ways:

- **Slider** (the default): the before photo sits underneath and the after photo is revealed as you drag the paintbrush handle. It works with a mouse, trackpad, touch (a clear sideways swipe, so scrolling the page never moves it) and the keyboard (arrow keys, Page Up/Down, Home/End). It starts at 50% and plays one short sweep the first time it appears, unless reduced motion is on. The frame is 16:9 on larger screens and 4:5 on phones. Each photo is cropped to fit, never stretched; `focus` and `focusM` in `projects.js` set where each crop is centred (desktop and phone).
- **Side by side**: both photos whole, at equal height, in their own proportions. Select either one to view the pair full screen.

The photos in each pair were taken from slightly different spots, so the views don't line up exactly. Nothing has been warped or edited to make them match, and a note on the page says so.

Each photo has a full-size file, a smaller copy (`-760` or `-800`) and a `-thumb` copy (320×240) for the project picker. The project 2–4 photos came from phone screenshots: the black bands and home bar were cropped off and nothing in the rooms was changed.

To add a project, add a block with `photo(...)` entries for `before` and `after`, plus a `title`, `change` and `summary`. Never add a pair you haven't confirmed. Other photos belong in the portfolio.

### Finished rooms (`src/data/portfolio.js`)

Five photos of finished projects: photos 01–05. They're shown as a filmstrip under the before & after, with a full-screen viewer. To add one, put `13-my-photo.webp` and an 800px-wide `13-my-photo-800.webp` in the `real-work` folder, then add a `photo(...)` line.

### AI-generated images (`src/data/generated.js`)

These five images were made with Higgsfield (Nano Banana Pro, 2K) and live in `public/images/rose-painting/generated/`:

| File | Used for |
| --- | --- |
| `house-hero-2400.webp`, `house-hero-1600.webp`, `house-hero-mobile.webp` | Homepage hero, labelled "Illustrative image" |
| `concept-living-room*.webp` | Imagine the possibilities |
| `concept-bedroom*.webp` | Imagine the possibilities |
| `concept-kitchen*.webp` | Imagine the possibilities |
| `concept-bathroom*.webp` | Imagine the possibilities |

**They are not Rose Painting Solutions projects.** Each is tagged "AI concept", and the section says so. Keep them out of `projects.js` and `portfolio.js`. The house is illustrative only; the site doesn't claim exterior work.

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
    Hero.jsx              full-bleed house photograph, camera push, parallax
    ServicesWhy.jsx       services as a paint-swatch fan + four promises
    RealWork.jsx          before & after projects + finished-rooms filmstrip
    ProjectShowcase.jsx   project cards, slider and side-by-side views
    CompareSlider.jsx     draggable before/after slider (mouse, touch, keyboard)
    Possibilities.jsx     AI concept interiors (clearly labelled)
    Lightbox.jsx          full-screen photo viewer (keyboard, swipe)
    RevealHeading.jsx     headings that rise in as they scroll into view
    Faq.jsx, Contact.jsx, ContactForm.jsx, Footer.jsx
    Header.jsx, MobileCallBar.jsx, BrushEdge.jsx, Icons.jsx
```

**Brand identity.** The paintbrush logo and the brush in the intro share exactly the same shapes (`src/lib/brushGeometry.js`), so the brand mark *is* the brush that paints the site. `src/components/Logo.jsx` provides:

- `<Logo tone="light" />` for white backgrounds, and `<Logo tone="dark" />` for blue ones
- `layout="stacked"` for the footer and other large uses
- `<BrushMark tone="tile" />` for a square icon (the favicon in `public/favicon.svg` is the same design)

**Motion.** The paint engine (`src/lib/paintEngine.js`) powers both the intro and the hero room. It simulates each bristle individually, varies brush pressure and throws off a few droplets. One brushed-edge mask (`--brush-mask` in `index.css`) drives the image reveals, project switches, the before/after toggle and the button fills. If anything in the intro fails, the site shows immediately: there's a fallback when canvas isn't available, plus a 6-second failsafe.

**Design system.** Colours: primer `#FBFCFE`, cobalt `#2348D6`, electric cobalt `#3D6BFF`, navy `#0D1F4D`, ice `#E7EFFC`, sky `#BFD3F7`, wash `#EEF3FA`, blue-gray `#5B6888`, painter's-tape blue `#5AA6E8`. Type: Gloock for display, Hanken Grotesk for text.

**Accessibility.** The site has a keyboard-operable before & after slider and project cards (arrow keys work too), accordion and menu, a skip link, visible focus rings, labelled form errors and live regions. The intro is skipped for anyone with “reduce motion” turned on and can be skipped with Esc or the button.

**Performance.** Images are responsive (`srcset`) and lazy-loaded below the fold, with explicit sizes to avoid layout shift. The intro canvas is capped at 1.75× pixel density and is removed from the page when it finishes.
