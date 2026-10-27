import { useEffect, useRef } from 'react'
import { business } from '../data/site.js'
import { projects } from '../data/projects.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { PhoneIcon } from './Icons.jsx'
import BrushEdge from './BrushEdge.jsx'
import HeroRoom from './HeroRoom.jsx'

const feature = projects[0]

export default function Hero({ revealed }) {
  const reduced = useReducedMotion()
  const sectionRef = useRef(null)

  // Depth: scroll parallax for the room and type, pointer light + tilt on desktop.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || reduced) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let raf = 0
    let pointer = null
    const apply = () => {
      raf = 0
      const y = Math.min(window.scrollY, window.innerHeight * 1.2)
      el.style.setProperty('--scroll', `${y}px`)
      if (pointer) {
        const r = el.getBoundingClientRect()
        const x = (pointer.clientX - r.left) / r.width
        const yy = (pointer.clientY - r.top) / r.height
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${(yy * 100).toFixed(1)}%`)
        el.style.setProperty('--px', (x - 0.5).toFixed(3))
        el.style.setProperty('--py', (yy - 0.5).toFixed(3))
      }
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onMove = (e) => {
      pointer = e
      queue()
    }
    const onLeave = () => {
      pointer = null
      el.style.setProperty('--px', 0)
      el.style.setProperty('--py', 0)
    }
    window.addEventListener('scroll', queue, { passive: true })
    if (fine) {
      el.addEventListener('pointermove', onMove, { passive: true })
      el.addEventListener('pointerleave', onLeave)
    }
    apply()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', queue)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-title"
      className={`hero wall relative isolate overflow-hidden text-white ${revealed ? 'is-revealed' : ''}`}
    >
      <div className="wall-texture" aria-hidden="true" />
      <div className="window-light" aria-hidden="true" />
      <div className="pointer-light" aria-hidden="true" />

      {/* Architectural lines: a picture rail and a vertical door trim */}
      <span aria-hidden="true" className="hero-rail" />

      <div className="shell relative z-10 grid gap-12 pt-28 lg:min-h-[100svh] lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 lg:pt-0">
        <div className="hero-copy flex flex-col justify-center lg:py-28">
          <h1 id="hero-title" tabIndex={-1} className="hero-title outline-none">
            <span className="line-mask hero-l1" style={{ '--i': 0 }}>
              <span>Every room deserves</span>
            </span>
            <span className="line-mask hero-l2" style={{ '--i': 1 }}>
              <span>
                <span className="relative inline-block">
                  <svg className="hero-stroke" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M14 78 C 120 52 260 50 380 58 S 560 70 588 54"
                      pathLength="1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="46"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="relative">a second</span>
                </span>
              </span>
            </span>
            <span className="line-mask hero-l3" style={{ '--i': 2 }}>
              <span>first impression.</span>
            </span>
          </h1>

          <p className="rise t-lede mt-8 max-w-[31rem] text-white/90" style={{ '--i': 0 }}>
            We paint and restore interior rooms with careful prep, clean lines and a finish you’ll notice every time
            you walk in.
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ '--i': 1 }}>
            <a href="#contact" className="btn btn-light">
              Get a quote
            </a>
            <a href="#work" className="btn btn-ghost">
              See our transformations
            </a>
          </div>

          <a
            href={business.phoneHref}
            className="rise hero-phone group mt-8 inline-flex items-center gap-4 self-start rounded-2xl py-1"
            style={{ '--i': 2 }}
          >
            <span className="grid size-12 place-items-center rounded-full bg-white/12 ring-1 ring-white/30 transition group-hover:bg-white group-hover:text-cobalt">
              <PhoneIcon />
            </span>
            <span className="flex flex-col">
              <span className="text-[0.9rem] text-white/90">Call {business.hours.daysShort}, 9–5</span>
              <span className="font-display text-[1.9rem] leading-none tracking-[-0.01em]">{business.phoneDisplay}</span>
            </span>
          </a>
        </div>

        {/* The room */}
        <div className="hero-room relative h-[min(118vw,36rem)] sm:h-[38rem] lg:h-auto lg:self-stretch lg:pt-28">
          <span aria-hidden="true" className="arch-trim" />
          <div className="arch-stage relative h-full">
            <HeroRoom project={feature} start={revealed} reduced={reduced} />
          </div>
        </div>
      </div>

      <BrushEdge className="absolute inset-x-0 -bottom-px z-20 text-primer" />
    </section>
  )
}
