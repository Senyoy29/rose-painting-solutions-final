import { useEffect, useRef, useState } from 'react'
import { transformations, angleNote } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import Lightbox from './Lightbox.jsx'

/**
 * The three confirmed before & after projects, hung like an exhibition.
 *
 * Every pair was photographed from a different spot, so nothing is overlaid
 * or "wiped" across. Two honest views:
 *  - Side by side: a diptych at equal height, each photo in its own proportions.
 *  - Before / after: one frame; the after photo is brushed over the before.
 */
const ratio = (p) => p.w / p.h
const srcSet = (p) => `${asset(p.small)} ${p.smallW}w, ${asset(p.src)} ${p.w}w`
const loaded = new Set()
function preload(t) {
  if (loaded.has(t.id)) return
  loaded.add(t.id)
  ;[t.before, t.after].forEach((p) => {
    const im = new Image()
    im.src = asset(p.small)
  })
}
const smallScreen = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export default function ProjectShowcase({ active }) {
  const [idx, setIdx] = useState(0)
  const [isSmall, setIsSmall] = useState(smallScreen)
  const [view, setView] = useState(() => (smallScreen() ? 'flip' : 'pair'))
  const [side, setSide] = useState('before')
  const [shown, setShown] = useState(false)
  const [openAt, setOpenAt] = useState(null)
  const touch = useRef(null)
  const opener = useRef(null)
  const refocus = useRef(null)
  const t = transformations[idx]

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setIsSmall(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // Paint the photos in whenever the section arrives, the project changes or the view changes.
  useEffect(() => {
    if (!active) return
    setShown(false)
    let b = 0
    const a = requestAnimationFrame(() => (b = requestAnimationFrame(() => setShown(true))))
    return () => {
      cancelAnimationFrame(a)
      cancelAnimationFrame(b)
    }
  }, [active, idx, view])

  const choose = (i) => {
    if (i === idx) return
    setShown(false)
    setIdx(i)
    setSide('before')
  }
  const changeView = (v) => {
    if (v === view) return
    setShown(false)
    setView(v)
  }
  const onPickerKey = (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!d) return
    e.preventDefault()
    const n = (idx + d + transformations.length) % transformations.length
    choose(n)
    e.currentTarget.querySelectorAll('button')[n]?.focus()
  }

  const bothPortrait = ratio(t.before) < 1 && ratio(t.after) < 1
  const frameRatio = bothPortrait ? 0.76 : isSmall ? 0.8 : 4 / 3
  const split = ratio(t.before) / (ratio(t.before) + ratio(t.after))

  const lightboxPhotos = [
    { ...t.before, id: `${t.id}-before`, caption: 'Before', group: t.title },
    { ...t.after, id: `${t.id}-after`, caption: 'After', group: t.title },
  ]
  const closeLightbox = () => {
    refocus.current = opener.current
    setOpenAt(null)
  }
  // Return focus once the viewer has fully closed and the page is interactive again.
  useEffect(() => {
    if (openAt !== null || !refocus.current) return
    document.querySelector(`[data-photo-id="${refocus.current}"]`)?.focus()
    refocus.current = null
  }, [openAt])

  return (
    <div className="exhibit">
      {/* Project picker */}
      <div role="group" aria-label="Choose a project" className="picker" onKeyDown={onPickerKey}>
        {transformations.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="pick"
            aria-pressed={i === idx}
            aria-controls="exhibit-stage"
            onClick={() => choose(i)}
            onPointerEnter={() => preload(p)}
            onFocus={() => preload(p)}
          >
            <span className="pick-thumb" aria-hidden="true">
              <img src={asset(p.before.thumb)} alt="" width="320" height="240" loading="lazy" decoding="async" />
              <img src={asset(p.after.thumb)} alt="" width="320" height="240" loading="lazy" decoding="async" className="pick-after" />
            </span>
            <span className="pick-text">
              <span className="pick-title">{p.title}</span>
              <span className="pick-change">{p.change}</span>
              <span className={`pick-stroke paint-mask ${i === idx ? 'is-shown' : ''}`} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      {/* The photographs */}
      <div id="exhibit-stage" className="exhibit-stage" data-project={t.id} data-view={view}>
        {view === 'pair' ? (
          <div
            key={t.id}
            className="diptych"
            style={{ '--ab': ratio(t.before), '--aa': ratio(t.after), '--split': split, gridTemplateColumns: `${ratio(t.before)}fr ${ratio(t.after)}fr` }}
          >
            {[
              ['Before', t.before, '-2.5deg'],
              ['After', t.after, '2deg'],
            ].map(([label, p, rot], i) => (
              <figure key={label} className="dip" data-side={label.toLowerCase()}>
                <button
                  type="button"
                  className={`dip-frame paint-in ${shown ? 'is-in' : ''}`}
                  style={{ '--d': `${i * 260}ms`, background: p.tone, aspectRatio: `${p.w} / ${p.h}` }}
                  data-photo-id={lightboxPhotos[i].id}
                  aria-label={`Enlarge the ${label.toLowerCase()} photo`}
                  onClick={() => {
                    opener.current = lightboxPhotos[i].id
                    setOpenAt(i)
                  }}
                >
                  <img
                    src={asset(p.small)}
                    srcSet={srcSet(p)}
                    sizes={`(min-width: 1024px) ${Math.round(ratio(p) * 36)}rem, ${Math.round((ratio(p) / (ratio(t.before) + ratio(t.after))) * 92)}vw`}
                    alt={p.alt}
                    width={p.w}
                    height={p.h}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
                <figcaption className="tape top-3 left-3" style={{ '--tape-rot': rot }}>
                  {label}
                </figcaption>
              </figure>
            ))}
            <svg className={`dip-seam ${shown ? 'is-in' : ''}`} viewBox="0 0 120 64" aria-hidden="true">
              <path
                className="dip-seam-paint"
                d="M9 36c3-10 15-17 34-19 22-2 43-1 61 3 8 2 12 7 10 13-2 6-10 9-22 10-23 2-47 4-68 1-10-1-17-3-15-8Z"
              />
              <g className="dip-seam-paint" opacity=".7">
                <rect x="2" y="27" width="22" height="2.2" rx="1.1" />
                <rect x="0" y="34" width="16" height="1.6" rx=".8" />
                <rect x="4" y="41" width="20" height="2" rx="1" />
                <rect x="104" y="44" width="14" height="1.6" rx=".8" />
              </g>
              <path d="M44 32h30m-9-9 10 9-10 9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div
            key={t.id}
            className={`flip paint-in ${shown ? 'is-in' : ''}`}
            style={{ '--fa': frameRatio }}
            onClick={() => setSide((s) => (s === 'before' ? 'after' : 'before'))}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current == null) return
              const dx = e.changedTouches[0].clientX - touch.current
              touch.current = null
              if (Math.abs(dx) > 40) {
                e.preventDefault()
                setSide(dx < 0 ? 'after' : 'before')
              }
            }}
          >
            {[
              ['before', t.before],
              ['after', t.after],
            ].map(([key, p]) => (
              <div
                key={key}
                className={`flip-layer ${key === 'after' ? `paint-mask ${side === 'after' ? 'is-shown' : ''}` : ''}`}
                data-side={key}
                aria-hidden={side !== key}
              >
                <img className="flip-bg" src={asset(p.small)} alt="" aria-hidden="true" decoding="async" />
                <img
                  className="flip-img"
                  src={asset(p.small)}
                  srcSet={srcSet(p)}
                  sizes="(min-width: 1024px) 48rem, 92vw"
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  loading={key === 'after' ? 'lazy' : undefined}
                  decoding="async"
                />
                <span className="tape top-4 left-4" style={{ '--tape-rot': key === 'before' ? '-2.5deg' : '2deg' }}>
                  {key === 'before' ? 'Before' : 'After'}
                </span>
              </div>
            ))}
            <div role="group" aria-label="Photo shown" className="flip-toggle" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-pressed={side === 'before'} onClick={() => setSide('before')}>
                Before
              </button>
              <button type="button" aria-pressed={side === 'after'} onClick={() => setSide('after')}>
                After
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wall label */}
      <div className="exhibit-label">
        <p className="sr-only" aria-live="polite">
          Showing {t.title}
          {view === 'flip' ? `, ${side} photo` : ''}
        </p>
        <h3 key={t.id} className="exhibit-title font-display">
          {t.title}
        </h3>
        <p className="mt-3 text-white/85">{t.summary}</p>
        <div role="group" aria-label="Comparison view" className="view-switch mt-6">
          <button type="button" aria-pressed={view === 'pair'} onClick={() => changeView('pair')}>
            Side by side
          </button>
          <button type="button" aria-pressed={view === 'flip'} onClick={() => changeView('flip')}>
            Before / after
          </button>
        </div>
        <p className="mt-5 text-[0.92rem] leading-relaxed text-white/70">{angleNote}</p>
      </div>

      {openAt !== null && (
        <Lightbox photos={lightboxPhotos} index={openAt} onIndex={setOpenAt} onClose={closeLightbox} />
      )}
    </div>
  )
}
