import { useEffect, useState } from 'react'
import { transformations } from '../data/projects.js'
import { portfolio } from '../data/portfolio.js'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import CompareSlider from './CompareSlider.jsx'
import Lightbox from './Lightbox.jsx'
import RevealHeading from './RevealHeading.jsx'

/**
 * Real work only: the confirmed bathroom before & after, then the five
 * finished-room photos as a filmstrip. Nothing AI-generated appears here.
 */
export default function RealWork() {
  const t = transformations[0]
  const [view, setView] = useState('slider')
  const [painted, setPainted] = useState(false)
  const [demoDone, setDemoDone] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [stageRef, inView] = useInView({ threshold: 0.25 })
  const [stripRef, stripIn] = useInView({ threshold: 0.2 })

  useEffect(() => {
    if (!inView) return
    const id = requestAnimationFrame(() => setPainted(true))
    return () => cancelAnimationFrame(id)
  }, [inView])

  const src = (p) => asset(p.small || p.src)
  const srcset = (p) => (p.small ? `${asset(p.small)} 800w, ${asset(p.src)} ${p.w}w` : undefined)
  const close = () => {
    const id = openId
    setOpenId(null)
    requestAnimationFrame(() => document.querySelector(`[data-photo-id="${id}"]`)?.focus())
  }

  return (
    <section id="work" aria-labelledby="work-title" className="relative overflow-hidden bg-midnight py-20 text-white md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 right-[-12%] h-[40rem] w-[40rem] rounded-full bg-cobalt/35 blur-[140px]" />

      <div className="shell relative">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <RevealHeading id="work-title" className="t-h2 max-w-[12ch]">
            Real work, real rooms.
          </RevealHeading>
          <p className="max-w-sm text-white/80 md:text-right">
            Every photo in this section is from a Rose Painting Solutions project.
          </p>
        </div>

        {/* Before & after */}
        <div id="before-after" className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-14">
          <div ref={stageRef} className="ba-wrap relative mx-auto lg:mx-0">
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
                    sizes="(min-width: 1024px) 30rem, 92vw"
                    className="ba-photo rounded-[20px]"
                  />
                ) : (
                  <div className="compare ba-photo rounded-[20px]" aria-hidden="true" />
                )
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Before', t.before, '-2deg'],
                    ['After', t.after, '2deg'],
                  ].map(([label, p, rot]) => (
                    <figure key={label} className="relative">
                      <img
                        src={src(p)}
                        srcSet={srcset(p)}
                        sizes="(min-width: 1024px) 15rem, 46vw"
                        alt={p.alt}
                        width={p.w}
                        height={p.h}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[3/4] w-full rounded-[16px] object-cover"
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

          <div className="max-w-xl">
            <h3 className="font-display text-[clamp(1.9rem,1.4rem+1.6vw,2.8rem)] leading-[1.05]">
              Bathroom vanity, before and after.
            </h3>
            <p className="mt-4 t-lede text-white/85">
              {view === 'slider'
                ? 'Drag across the photo to compare the two stages, or view them side by side.'
                : 'The two stages side by side. Switch to the slider to compare them in one frame.'}
            </p>
            <div role="group" aria-label="Comparison view" className="view-switch mt-7">
              <button type="button" aria-pressed={view === 'slider'} onClick={() => setView('slider')}>
                Slider
              </button>
              <button type="button" aria-pressed={view === 'side'} onClick={() => setView('side')}>
                Side by side
              </button>
            </div>
            <p className="mt-5 text-[0.95rem] text-white/75">{t.note}</p>
          </div>
        </div>

        {/* Finished rooms */}
        <div className="mt-16 flex items-end justify-between gap-4 border-t border-white/12 pt-8">
          <h3 className="font-display text-[1.7rem] leading-none">Finished rooms</h3>
          <p className="text-[0.92rem] text-white/70">Select a photo to view it full screen</p>
        </div>
        <ul ref={stripRef} className="filmstrip mt-6" aria-label="Finished rooms">
          {portfolio.map((p, i) => (
            <li key={p.id} style={{ '--ar': p.w / p.h, '--d': `${i * 90}ms` }}>
              <button
                type="button"
                data-photo-id={p.id}
                onClick={() => setOpenId(p.id)}
                className="group relative block size-full overflow-hidden rounded-[14px]"
                aria-label={`Open photo: ${p.caption}`}
              >
                <span className={`paint-in block size-full ${stripIn ? 'is-in' : ''}`} style={{ background: p.tone }}>
                  <img
                    src={asset(p.small)}
                    srcSet={`${asset(p.small)} 800w, ${asset(p.src)} ${p.w}w`}
                    sizes="(min-width: 1024px) 20vw, 60vw"
                    alt={p.alt}
                    width={p.w}
                    height={p.h}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
                  />
                </span>
                <span className="work-caption" aria-hidden="true">
                  <span className="text-[1rem] font-semibold leading-tight">{p.caption}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {openId !== null && (
        <Lightbox
          photos={portfolio}
          index={portfolio.findIndex((p) => p.id === openId)}
          onIndex={(i) => setOpenId(portfolio[i].id)}
          onClose={close}
        />
      )}
    </section>
  )
}
