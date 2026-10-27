import { useEffect, useRef } from 'react'
import { business } from '../data/site.js'
import { heroHouse } from '../data/generated.js'
import { asset } from '../lib/asset.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { PhoneIcon } from './Icons.jsx'
import BrushEdge from './BrushEdge.jsx'

/**
 * "A fresh perspective" — a full-bleed architectural photograph that the
 * opening brush paints into view. Once revealed, the camera eases forward,
 * the headline rises and the calls to action settle in.
 * The house is an illustrative AI image (see data/generated.js), so the copy
 * talks about rooms and a caption says so.
 */
export default function Hero({ revealed }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)

  // Scroll parallax + a whisper of pointer depth on desktop.
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let raf = 0
    let pointer = null
    const apply = () => {
      raf = 0
      el.style.setProperty('--scroll', `${Math.min(window.scrollY, window.innerHeight * 1.2)}px`)
      if (pointer) {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--px', ((pointer.clientX - r.left) / r.width - 0.5).toFixed(3))
        el.style.setProperty('--py', ((pointer.clientY - r.top) / r.height - 0.5).toFixed(3))
      }
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onMove = (e) => {
      pointer = e
      queue()
    }
    window.addEventListener('scroll', queue, { passive: true })
    if (fine) el.addEventListener('pointermove', onMove, { passive: true })
    apply()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', queue)
      el.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className={`hero3 relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-midnight text-white ${revealed ? 'is-revealed' : ''}`}
    >
      {/* The photograph */}
      <div className="hero3-photo" aria-hidden="false">
        <picture>
          <source media="(max-width: 767px)" srcSet={asset(heroHouse.small)} />
          <img
            src={asset(heroHouse.mid)}
            srcSet={`${asset(heroHouse.mid)} 1600w, ${asset(heroHouse.src)} ${heroHouse.w}w`}
            sizes="100vw"
            alt={heroHouse.alt}
            width={heroHouse.w}
            height={heroHouse.h}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="hero3-shade" aria-hidden="true" />
      {/* An architectural mat line that frames the photograph */}
      <span className="hero3-frame" aria-hidden="true" />

      <div className="shell relative z-10 mt-auto grid gap-10 pt-36 pb-[clamp(5rem,9vw,8rem)] lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 id="hero-title" tabIndex={-1} className="hero3-title outline-none">
            <span className="line-mask" style={{ '--i': 0 }}>
              <span>A fresh perspective,</span>
            </span>
            <span className="line-mask" style={{ '--i': 1 }}>
              <span>room by room.</span>
            </span>
          </h1>
          <p className="rise t-lede mt-6 max-w-[34rem] text-white/90" style={{ '--i': 0 }}>
            Rose Painting Solutions transforms interior spaces with careful preparation, quality finishes and real
            attention to detail.
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ '--i': 1 }}>
            <a href="#contact" className="btn btn-light">
              Get a quote
            </a>
            <a href="#work" className="btn btn-ghost">
              Explore our work
            </a>
          </div>
        </div>

        <a href={business.phoneHref} className="rise hero3-call group" style={{ '--i': 2 }}>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-cobalt transition group-hover:bg-cobalt group-hover:text-white">
            <PhoneIcon />
          </span>
          <span className="flex flex-col">
            <span className="text-[0.9rem] text-white/85">
              Call {business.hours.daysShort}, 9 AM–5 PM
            </span>
            <span className="font-display text-[2rem] leading-none tracking-[-0.01em]">{business.phoneDisplay}</span>
          </span>
        </a>
      </div>

      <p className="hero3-caption">Illustrative image</p>
      <BrushEdge className="absolute inset-x-0 -bottom-px z-20 text-primer" />
    </section>
  )
}
