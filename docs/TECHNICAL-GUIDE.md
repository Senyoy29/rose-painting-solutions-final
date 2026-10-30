# Owner dashboard — technical setup & maintenance

For the developer delivering the site. The owner's guide is in [OWNER-GUIDE.md](OWNER-GUIDE.md).

## Architecture

```
Browser ─┬─ /            public site (React, static, CDN)
         │                 └─ fetches /api/content once at startup (preloaded, CDN-cached)
         ├─ /admin/      owner dashboard (separate bundle, plain CSS — never loaded by visitors)
         └─ /api/*, /media/*  →  netlify/functions/api.mjs  →  server/app.mjs
                                        │
                                        └─ Netlify Blobs (3 stores, durable, independent of deploys)
                                             rps-content  draft, published, history/<ts>
                                             rps-auth     password hash, sessions/<id>, rl/<hash>
                                             rps-media    m/<id>/<rev>/{master,lg,md,thumb}
```

**Why this design (and not Cloudinary / R2):**

| Option | Verdict |
|---|---|
| **Netlify Blobs** (chosen) | Already part of the Netlify hosting the site uses. Durable, per-site, survives every redeploy, no extra account, keys or bill. Works directly from Netlify Functions. |
| Cloudinary | Great transformations, but a second vendor and account for the owner, and free-tier credit limits to watch. Not needed: images are optimised in the browser (below). |
| Cloudflare R2 | Cheap and S3-compatible, but needs an extra account, keys and signed-URL plumbing. Worth it only if the photo library grows into many GB. |
| Files in the repo / deploy folder | Rejected: every upload would need a commit and redeploy, and the deploy folder is read-only at runtime. |

**Image pipeline:**

- **Where it happens:** photos are decoded, resized and re-encoded **in the owner's browser** (`src/admin/images.js`), never on the server.
  - Every upload stays well under the 6 MB function body limit, so signed direct uploads aren't needed.
  - No server image processing means no server image-processing abuse.
  - Re-encoding drops **all EXIF/GPS metadata**.
- **Sizes stored:**
  - `master`: ≤3200 px, private, for re-editing.
  - `lg`: ≤2000 px.
  - `md`: ≤1000 px.
  - `thumb`: ≤480 px.
- **Format:** WebP, falling back to JPEG where a browser can't encode WebP.
- **Edits** (crop, 90° rotation, brightness/contrast ±15%) are stored as settings and re-rendered from the master. That makes them non-destructive: each edit is a new **revision**, and the URLs are `/media/<id>/<rev>/<size>.webp`, so they're immutable and cached for a year.
- **Server checks:** the server validates every upload by its **actual bytes** (JPEG/WebP signatures and dimensions, not names or headers), plus per-size byte and pixel limits (`server/images.mjs`).

**Content model:**

- **One validated JSON document** (`src/content/schema.js`) holds business details, website text, services, categories, the photo library, the gallery order and before & after projects.
- **Every save runs `sanitizeDoc`:**
  - text is cleaned and length-limited;
  - ids, colours and focus values must match strict patterns;
  - links must be https only;
  - photos that shipped with the site must match exact path patterns;
  - uploads are referenced by id, never by URL.
- **Draft and published copies:**
  - The owner edits the **draft**.
  - **Publish** copies it to **published** and keeps the previous version in `history/` (the last 20; the first entry is always the original website).
  - **Publish** also removes photo files that no stored version references.

**Public site integration:**

- **What changed:** `src/content/load.js` fetches `/api/content` before the first render and fills the existing data modules (`data/site.js`, `text.js`, `services.js`, `portfolio.js`, `projects.js`). Components changed only where hard-coded wording became editable.
- **Fallback:** if the API is unreachable or takes over 2.5 s, the built-in content (today's site) is used.
- **Preview:** `/?preview` loads the draft, and only with an owner session.

## Requirements

- **Hosting:** Netlify. The site deploys anywhere static, but the dashboard and API are a Netlify Function using Netlify Blobs.
  - `vercel.json` remains for the static site only. On Vercel the dashboard would not work.
- **Node:** 20.19+ (Netlify uses Node 22, set in `netlify.toml`).
- **Packages:** `npm install` adds `@netlify/blobs` and `@netlify/functions`. Netlify installs them during the build.

## Environment variables (Netlify › Site configuration › Environment variables)

| Name | Required | Value |
|---|---|---|
| `SESSION_SECRET` | yes | 32+ random characters. `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Changing it signs everyone out. |
| `ADMIN_INITIAL_PASSWORD` | yes, for first sign-in | 12+ characters, random. The owner must replace it at first sign-in; after that it stops working. |
| `ADMIN_PASSWORD_RESET` | no | `yes` lets `ADMIN_INITIAL_PASSWORD` work again (forgotten password). **Remove after use.** |
| `VITE_FORM_ENDPOINT` | as before | Contact form endpoint (public). Unrelated to the dashboard. |

Mark `SESSION_SECRET` and `ADMIN_INITIAL_PASSWORD` as **secret** in Netlify, and scope them to **Functions** only, not Builds. Never commit real values; `.env.example` lists the names only.

Without `SESSION_SECRET`, the dashboard stays switched off (it shows a friendly message), and the public site keeps working.

## Deploying

1. Merge the dashboard branch into `main` (or deploy the branch first as a preview).
2. In Netlify, add the environment variables above.
3. Push. Netlify runs `npm run build` (Vite builds `index.html` and `admin/index.html` into `dist/`) and deploys `netlify/functions/api.mjs`.
4. Open `https://<site>/api/health`. It should report `{"ok":true,"dashboard":true}`.
5. Open `https://<site>/admin/`, sign in with the initial password, choose a password, then sign out.
6. Hand over access (below).

**No deploys are needed for content changes.** The owner's publishing doesn't trigger builds, so it uses no build minutes or deploy credits.

## Local development

```bash
npm install
npm run build                  # builds dist/ (site + dashboard)
SESSION_SECRET=dev-only-secret-at-least-32-characters-long \
ADMIN_INITIAL_PASSWORD=dev-initial-password npm run serve   # http://localhost:8888, data in ./.data
npm test                       # backend tests (node --test, no network, no real photos)
```

`npm run serve` runs the same API against a local folder instead of Blobs, and applies `public/_headers`, so the security headers match production. `.data/` is git-ignored.

## Expected monthly cost

Netlify bills in credits: Free is 300 credits/month, Personal $9 for 1,000, Pro $20 for 3,000+. Bandwidth is 20 credits/GB, functions 10 credits/GB-hour, requests 2 credits per 10k, and production deploys 15 credits each ([netlify.com/pricing](https://netlify.com/pricing)).

Rough estimate for a local painting business (about 2,000 visits a month):

| Item | Credits |
|---|---|
| Bandwidth: ~2,000 × ~1.4 MB first load, with CDN and browser caching | ~55 |
| Requests | ~15 |
| Functions: owner editing plus CDN-cached content and photos | <5 |
| Deploys: only when you change code (not when the owner publishes) | 15 each |
| **Typical total** | **~75–120** |

That fits the **Free plan**. If traffic grows several-fold, Personal ($9/month) covers it. Photos use about 1–3 MB of Blob storage each (all sizes). Netlify lists Blobs as included on the Free plan; check the current limits on the pricing page if the library grows into many GB. No other subscriptions are involved.

## Backups & restore

- **Built-in history:** the last 20 published versions, plus the original site, can be restored from the dashboard (Account & security).
- **Bin:** projects and photos go to a bin before permanent deletion. A photo's files are deleted only once nothing (draft, published or history) refers to it any more.
- **Full backup:** export the Blobs stores periodically. With the Netlify CLI linked to the site:

  ```bash
  npx netlify blobs:list rps-content
  npx netlify blobs:get rps-content published > backup/published.json
  npx netlify blobs:get rps-content draft > backup/draft.json
  # photos: list rps-media and fetch each key (m/<id>/<rev>/<size>)
  ```

  Restore with `npx netlify blobs:set <store> <key> --input <file>`.

**Recovering an accidentally deleted photo:**

1. If it's in the bin, restore it from the dashboard.
2. If it was deleted for good but an earlier published version used it, bring that version back from the history. Its files are kept for as long as that history entry exists.
3. Otherwise, use your backups.

## Handing over owner access

1. Set a random `ADMIN_INITIAL_PASSWORD` in Netlify.
2. Give it to the owner **in person or by phone**, not in the same email as the site address.
3. The owner signs in and must choose their own password immediately. From then on only they know it; it's stored as a scrypt hash.
4. Clear `ADMIN_INITIAL_PASSWORD` from Netlify after handover. Set it again only together with `ADMIN_PASSWORD_RESET=yes` if they ever forget their password.
5. To end every session at once (for example on a lost phone), change `SESSION_SECRET`, or change the password from the dashboard.

## Security summary

- **Sign-in:** one owner account. Passwords are hashed with scrypt; the minimum is 10 characters, and common or repeated passwords are refused.
- **Sessions:**
  - The session id is random and stored server-side; the cookie is signed with HMAC.
  - The cookie is `__Host-`, `HttpOnly`, `Secure` and `SameSite=Strict`.
  - Sessions expire after 3 days idle or 14 days at most; logout deletes the session.
  - A password change ends every other session.
- **Brute force:** 5 failures per connection per 15 minutes triggers a 15-minute lock, plus a site-wide limit (40 per 15 minutes, which locks for 10 minutes).
  - That site-wide limit could be used to delay the owner's sign-in briefly; it can't be used to get in.
- **CSRF:** every change requires a per-session token header and a same-origin request.
- **Uploads:**
  - Only an owner session can upload.
  - Files are checked by content and capped in bytes and pixels.
  - Photos are served with `nosniff` and a sandbox CSP.
  - A live photo's files can't be overwritten.
- **Private photos:**
  - Photos not live on the published site, and every `master` original, are only served to the owner session.
  - Photos that were once live remain at their (unguessable, immutable) URLs in CDN caches.
- **Content and headers:**
  - All stored text is plain text; React escapes it, and links are https-only.
  - `/admin` and `/api` are `noindex` and disallowed in `robots.txt`.
  - The site-wide CSP applies to the dashboard too (no inline scripts).

## Maintaining

| What | Where |
|---|---|
| Editable fields | `src/content/schema.js` (validation), `src/content/seed.js` (defaults from the data files) |
| New editable text | Add to `src/data/text.js` with a limit in `TEXT_LIMITS`, use `text.yourKey` in the component, and list it in `src/admin/pages/Content.jsx` |
| API | `server/app.mjs`; tests in `server/tests/api.test.mjs` |
| Dashboard pages | `src/admin/pages/` |

Run `npm test` after any server change.
