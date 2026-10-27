import { projects } from '../data/projects.js'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import RevealHeading from './RevealHeading.jsx'

const pic = projects[2]

export default function About() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  return (
    <section id="about" aria-labelledby="about-title" className="overflow-x-clip bg-primer py-24 md:py-32">
      <div className="shell grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <RevealHeading id="about-title" className="t-h2 max-w-[16ch] text-ink">
            Painters who treat your home like their own.
          </RevealHeading>
          <div className="mt-8 grid gap-5 text-ink-soft measure t-lede">
            <p>
              Rose Painting Solutions is a dedicated interior painting team. We take rooms that have gone tired,
              marked or damaged and bring them back to clean, bright, finished spaces.
            </p>
            <p className="text-[1.0625rem] leading-relaxed">
              Most of a great paint job happens before the first coat: filling, sanding, priming and protecting
              everything around the work. We take that part seriously, so the finish looks right on day one and
              keeps looking right for years.
            </p>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              ['Interior focus', 'Rooms, ceilings, trim and doors'],
              ['Free quotes', 'Written, clear and no-pressure'],
              ['Weekday hours', 'Mon–Fri, 9 AM to 5 PM'],
            ].map(([t, d]) => (
              <div key={t} className="border-t-2 border-cobalt pt-4">
                <dt className="font-display text-[1.35rem] text-ink">{t}</dt>
                <dd className="mt-1 text-ink-soft t-small">{d}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={ref} className="relative">
          <div className="absolute -inset-4 -z-0 rotate-[-2.5deg] rounded-[28px] bg-sky/60" aria-hidden="true" />
          <div className={`paint-in relative overflow-hidden rounded-[22px] shadow-[0_40px_80px_-40px_rgb(13_31_77/0.6)] ${inView ? 'is-in' : ''}`}>
            <img
              src={asset(pic.afterSmall)}
              srcSet={`${asset(pic.afterSmall)} 800w, ${asset(pic.after)} 1600w`}
              sizes="(min-width: 1024px) 34rem, 92vw"
              alt={pic.afterAlt}
              width="1600"
              height="1000"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <span className="tape -bottom-3 right-8" style={{ '--tape-rot': '-2deg' }}>
            Finished: {pic.room.toLowerCase()}
          </span>
        </div>
      </div>
    </section>
  )
}
