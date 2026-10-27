import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import CompareSlider from './CompareSlider.jsx'
import RevealHeading from './RevealHeading.jsx'

/**
 * An exhibition of transformations: one large comparison panel, painted in
 * as it enters view. Switching projects paints the next room over the last.
 */
export default function BeforeAfter() {
  const [active, setActive] = useState(0)
  const [outgoing, setOutgoing] = useState(null)
  const [paintedIn, setPaintedIn] = useState(false)
  const [ref, inView] = useInView({ threshold: 0.3 })
  const timer = useRef(0)
  const p = projects[active]

  // First appearance: brush the panel in.
  useEffect(() => {
    if (!inView) return
    const id = requestAnimationFrame(() => setPaintedIn(true))
    return () => cancelAnimationFrame(id)
  }, [inView])

  const sizes = '(min-width: 1024px) 70rem, 100vw'
  const srcset = (proj, side) =>
    proj[side + 'Small'] ? `${asset(proj[side + 'Small'])} 800w, ${asset(proj[side])} 1600w` : undefined
  const load = (proj, side) => {
    const im = new Image()
    im.sizes = sizes
    if (srcset(proj, side)) im.srcset = srcset(proj, side)
    im.src = asset(proj[side])
    return im.decode ? im.decode().catch(() => {}) : Promise.resolve()
  }

  const go = (next) => {
    const i = (next + projects.length) % projects.length
    if (i === active) return
    const from = active
    // Have the next room decoded before painting it in — no blank wipes.
    Promise.race([
      Promise.all([load(projects[i], 'before'), load(projects[i], 'after')]),
      new Promise((r) => setTimeout(r, 1200)),
    ]).then(() => {
      setOutgoing(from)
      setPaintedIn(false)
      setActive(i)
      requestAnimationFrame(() => requestAnimationFrame(() => setPaintedIn(true)))
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setOutgoing(null), 1400)
    })
  }

  return (
    <section id="work" aria-labelledby="work-title" className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-cobalt/40 blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-12rem] left-[-12rem] h-[30rem] w-[30rem] rounded-full bg-electric/20 blur-[120px]" />

      <div className="shell relative">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <RevealHeading id="work-title" className="t-h2 max-w-[13ch]">
            The proof is on the walls.
          </RevealHeading>
          <p className="measure text-white/80 md:max-w-sm md:text-right">
            Same room, same angle, before and after. Drag across any room to see what changed.
          </p>
        </div>
      </div>

      {/* The exhibition panel */}
      <div ref={ref} className="exhibit relative mx-auto mt-14 w-[min(100%-1.5rem,88rem)] md:w-[min(100%-4rem,88rem)]">
        {outgoing !== null && (
          <img
            src={asset(projects[outgoing].afterSmall || projects[outgoing].after)}
            srcSet={srcset(projects[outgoing], 'after')}
            sizes={sizes}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full rounded-[22px] object-cover"
          />
        )}
        <div className={`paint-in relative ${paintedIn ? 'is-in' : ''}`} style={paintedIn ? undefined : { transition: 'none' }}>
          {inView ? (
            <CompareSlider
              key={p.id}
              project={p}
              demo={paintedIn}
              className="aspect-[4/5] rounded-[22px] sm:aspect-[16/10] lg:aspect-[16/9]"
            >
              <div className="exhibit-card pointer-events-none absolute bottom-4 left-4 z-[3] hidden max-w-md rounded-[18px] p-5 md:block lg:bottom-6 lg:left-6 lg:p-6">
                <p className="font-semibold text-sky">{p.room}</p>
                <p className="mt-1 font-display text-[1.7rem] leading-tight">{p.title}</p>
                <p className="mt-3 text-[0.95rem] text-white/80">{p.work}</p>
              </div>
              {p.sample && (
                <span className="absolute top-14 left-4 z-[3] rounded-full bg-ink/70 px-3 py-1 text-[0.75rem] font-medium text-white/90 backdrop-blur-sm md:top-auto md:right-6 md:bottom-6 md:left-auto">
                  Sample illustration
                </span>
              )}
            </CompareSlider>
          ) : (
            <div className="compare aspect-[4/5] rounded-[22px] sm:aspect-[16/10] lg:aspect-[16/9]" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="shell relative mt-6">
        {/* Mobile: the project story sits under the panel */}
        <div aria-live="polite" className="md:sr-only">
          <p className="font-semibold text-sky">{p.room}</p>
          <p className="mt-1 font-display text-[1.6rem] leading-tight">{p.title}</p>
          <p className="mt-3 text-white/80">{p.work}</p>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 md:mt-2">
          <p className="text-white/70 tabular-nums" aria-hidden="true">
            {active + 1} / {projects.length}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(active - 1)} className="exhibit-nav" aria-label="Previous project">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => go(active + 1)} className="exhibit-nav" aria-label="Next project">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        <div role="group" aria-label="Choose a project" className="exhibit-index mt-6 grid auto-cols-[62%] grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-[38%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
          {projects.map((proj, i) => (
            <button
              key={proj.id}
              type="button"
              aria-pressed={i === active}
              onClick={() => go(i)}
              className={`group relative overflow-hidden rounded-[14px] text-left transition duration-500 ${i === active ? 'is-active' : ''}`}
            >
              <span className="block overflow-hidden rounded-[14px]">
                <img
                  src={asset(proj.afterSmall || proj.after)}
                  alt=""
                  width="800"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  className={`aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.06] ${i === active ? '' : 'opacity-55 group-hover:opacity-100'}`}
                />
              </span>
              <span className="mt-3 flex items-baseline justify-between gap-3">
                <span className="font-semibold">{proj.room}</span>
              </span>
              <span aria-hidden="true" className="exhibit-bar" />
            </button>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl">Have a room like the “before”?</p>
          <a href="#contact" className="btn btn-light">
            Get a quote
          </a>
        </div>
      </div>
    </section>
  )
}
