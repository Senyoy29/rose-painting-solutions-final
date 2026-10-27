import { useEffect, useState } from 'react'
import { transformations } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import CompareSlider from './CompareSlider.jsx'
import RevealHeading from './RevealHeading.jsx'

/**
 * Real before & after — one confirmed project, presented honestly.
 * The two photos were taken from different angles, so visitors can switch
 * between the drag slider and a plain side-by-side view.
 */
export default function BeforeAfter() {
  const t = transformations[0]
  const [view, setView] = useState('slider') // slider | side
  const [painted, setPainted] = useState(false)
  const [demoDone, setDemoDone] = useState(false)
  const [ref, inView] = useInView({ threshold: 0.25 })

  useEffect(() => {
    if (!inView) return
    const id = requestAnimationFrame(() => setPainted(true))
    return () => cancelAnimationFrame(id)
  }, [inView])

  if (!t) return null
  const src = (p) => asset(p.small || p.src)
  const srcset = (p) => (p.small ? `${asset(p.small)} 800w, ${asset(p.src)} ${p.w}w` : undefined)

  return (
    <section id="before-after" aria-labelledby="ba-title" className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-cobalt/40 blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-12rem] left-[-12rem] h-[30rem] w-[30rem] rounded-full bg-electric/20 blur-[120px]" />

      <div className="shell relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        {/* The exhibit */}
        <div ref={ref} className="ba-stage relative order-2 lg:order-1">
          <div className={`relative mx-auto ${view === 'slider' ? 'ba-wrap' : 'w-full'}`}>
          {view === 'slider' && <span aria-hidden="true" className="ba-frame" />}
          <div className={`paint-in relative ${painted ? 'is-in' : ''}`}>
            {view === 'slider' ? (
              inView ? (
                <CompareSlider
                  before={t.before}
                  after={t.after}
                  label={t.title}
                  demo={painted && !demoDone}
                  onDemoEnd={() => setDemoDone(true)}
                  sizes="(min-width: 1024px) 34rem, 92vw"
                  className="ba-photo rounded-[20px]"
                />
              ) : (
                <div className="compare ba-photo rounded-[20px]" aria-hidden="true" />
              )
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  ['Before', t.before, '-2deg'],
                  ['After', t.after, '2deg'],
                ].map(([label, p, rot]) => (
                  <figure key={label} className="relative">
                    <img
                      src={src(p)}
                      srcSet={srcset(p)}
                      sizes="(min-width: 1024px) 17rem, 46vw"
                      alt={p.alt}
                      width={p.w}
                      height={p.h}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[3/4] w-full rounded-[16px] object-cover shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)]"
                    />
                    <figcaption className="tape top-3 left-3" style={{ '--tape-rot': rot }}>
                      {label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* The story */}
        <div className="order-1 lg:order-2">
          <p className="font-semibold text-sky">Real project photos</p>
          <RevealHeading id="ba-title" className="t-h2 mt-3 max-w-[12ch]">
            Before and after, from our own work.
          </RevealHeading>
          <p className="mt-6 measure t-lede text-white/85">
            {t.title}.{' '}
            {view === 'slider'
              ? 'Drag across the photo to compare the two stages, or view them side by side.'
              : 'The two stages side by side. Switch to the slider to compare them in one frame.'}
          </p>

          <div role="group" aria-label="Comparison view" className="view-switch mt-8">
            <button type="button" aria-pressed={view === 'slider'} onClick={() => setView('slider')}>
              Slider
            </button>
            <button type="button" aria-pressed={view === 'side'} onClick={() => setView('side')}>
              Side by side
            </button>
          </div>

          <p className="mt-6 flex max-w-md gap-3 text-[0.95rem] text-white/75">
            <svg width="20" height="20" viewBox="0 0 24 24" className="mt-0.5 shrink-0 text-sky" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 11v5M12 7.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t.note}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#contact" className="btn btn-light">
              Get a quote
            </a>
            <a href="#work" className="btn btn-ghost">
              View our work
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
