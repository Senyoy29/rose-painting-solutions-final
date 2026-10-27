import { useEffect, useMemo, useRef, useState } from 'react'
import { hang, portfolio } from '../data/portfolio.js'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import Lightbox from './Lightbox.jsx'
import RevealHeading from './RevealHeading.jsx'

const byId = Object.fromEntries(portfolio.map((p) => [p.id, p]))

/** Splits photos into n columns, always adding to the shortest one. */
function balance(items, n) {
  const cols = Array.from({ length: n }, () => ({ h: 0, items: [] }))
  for (const p of items) {
    const c = cols.reduce((a, b) => (b.h < a.h ? b : a))
    c.items.push(p)
    c.h += p.h / p.w
  }
  return cols.map((c) => c.items)
}

function useColumns() {
  const get = () => (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 3 : 2)
  const [n, setN] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setN(get())
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return n
}

function Tile({ photo, index, onOpen, sizes }) {
  const [ref, inView] = useInView({ threshold: 0.15, rootMargin: '0px 0px -5% 0px' })
  return (
    <figure ref={ref} className="work-tile" style={{ '--d': `${(index % 3) * 120}ms` }}>
      <button
        type="button"
        onClick={() => onOpen(photo.id)}
        data-photo-id={photo.id}
        className="group relative block w-full overflow-hidden rounded-[16px] text-left"
        aria-label={`Open photo: ${photo.caption}`}
      >
        <span
          className={`paint-in block ${inView ? 'is-in' : ''}`}
          style={{ background: photo.tone, aspectRatio: `${photo.w} / ${photo.h}` }}
        >
          <img
            src={asset(photo.small)}
            srcSet={`${asset(photo.small)} 800w, ${asset(photo.src)} ${photo.w}w`}
            sizes={sizes}
            alt={photo.alt}
            width={photo.w}
            height={photo.h}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-[1.045]"
          />
        </span>
        <span className="work-caption" aria-hidden="true">
          <span className="font-display text-[1.3rem] leading-tight">{photo.caption}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
            <path d="M4 10V4h6M20 14v6h-6M4 4l6.5 6.5M20 20l-6.5-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <figcaption className="mt-3 flex flex-col gap-0.5 text-[0.92rem] leading-snug lg:flex-row lg:items-baseline lg:justify-between lg:gap-3">
        <span className="font-semibold text-ink">{photo.caption}</span>
        <span className="text-steel">{photo.group}</span>
      </figcaption>
    </figure>
  )
}

/**
 * Our Work — an exhibition wall of real project photos.
 * Every photo keeps its true proportions; nothing is cropped.
 */
export default function OurWork() {
  const n = useColumns()
  const [openId, setOpenId] = useState(null)
  const lastId = useRef(null)

  const columns = useMemo(() => {
    if (n !== 3) return balance(portfolio, 2)
    const cols = hang.map((col) => col.map((id) => byId[id]).filter(Boolean))
    // Any photo added to portfolio.js but not to the desktop hang still appears.
    portfolio.filter((p) => !hang.flat().includes(p.id)).forEach((p, i) => cols[i % 3].push(p))
    return cols
  }, [n])

  const open = (id) => {
    lastId.current = id
    setOpenId(id)
  }
  // Return focus to the tile of the photo that was last shown — looked up by id,
  // so it works even if the columns re-flowed while the viewer was open.
  const close = () => {
    const id = lastId.current
    setOpenId(null)
    requestAnimationFrame(() => document.querySelector(`[data-photo-id="${id}"]`)?.focus({ preventScroll: false }))
  }

  return (
    <section id="work" aria-labelledby="work-title" className="relative bg-primer py-24 md:py-32">
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <RevealHeading id="work-title" className="t-h2 max-w-[11ch] text-ink">
            Finished rooms.
          </RevealHeading>
          <p className="measure text-ink-soft md:max-w-sm md:text-right">
            Real photos of finished Rose Painting Solutions projects. Select any photo to see it full screen.
          </p>
        </div>

        <div className={`work-wall mt-14 ${n === 3 ? 'is-hung' : ''}`}>
          {columns.map((col, ci) => (
            <div key={ci} className="work-col">
              {col.map((p, i) => (
                <Tile
                  key={p.id}
                  photo={p}
                  index={ci + i}
                  onOpen={open}
                  sizes={n === 3 ? '(min-width: 1400px) 32rem, 36vw' : '48vw'}
                />
              ))}
              {n === 3 && ci === 0 && (
                <div className="work-cta">
                  <p className="font-display text-[1.9rem] leading-tight text-ink">Have a room you’d like to refresh?</p>
                  <p className="mt-3 text-ink-soft">Tell us about it and we’ll arrange a free quote.</p>
                  <a href="#contact" className="btn btn-primary mt-6">
                    Get a quote
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`mt-16 flex flex-col items-start gap-4 border-t border-ink/10 pt-10 sm:flex-row sm:items-center sm:justify-between ${n === 3 ? 'hidden' : ''}`}>
          <p className="font-display text-2xl text-ink">Have a room you’d like to refresh?</p>
          <a href="#contact" className="btn btn-primary">
            Get a quote
          </a>
        </div>
      </div>

      {openId !== null && (
        <Lightbox
          photos={portfolio}
          index={portfolio.findIndex((p) => p.id === openId)}
          onIndex={(i) => {
            lastId.current = portfolio[i].id
            setOpenId(portfolio[i].id)
          }}
          onClose={close}
        />
      )}
    </section>
  )
}
