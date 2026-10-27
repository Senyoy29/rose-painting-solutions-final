import { services } from '../data/services.js'
import RevealHeading from './RevealHeading.jsx'

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="relative overflow-hidden bg-wash py-24 md:py-32">
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <RevealHeading id="services-title" className="t-h2 max-w-[14ch] text-ink">
            Six ways we bring a room back.
          </RevealHeading>
          <p className="measure text-ink-soft md:max-w-sm md:text-right">
            Every job is quoted for exactly what your room needs. Hover or tap a card to see what’s included.
          </p>
        </div>
      </div>

      {/* A fan of paint chips: lightest to deepest blue */}
      <ul
        className="shell mt-14 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto pb-6 sm:auto-cols-[46%] lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible lg:pb-0"
        aria-label="Our services"
      >
        {services.map((s, i) => (
          <li
            key={s.title}
            tabIndex={0}
            className="chip snap-start"
            style={{ '--chip-tone': s.tone, '--chip-ink': s.ink, '--chip-tilt': `${(i - 2.5) * 0.6}deg` }}
          >
            <span className="chip-swatch" aria-hidden="true" />
            <div className="chip-body">
              <h3 className="t-h3">{s.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed opacity-90">{s.summary}</p>
              <ul className="chip-list mt-4 grid gap-1.5 text-[0.92rem] font-medium" aria-label={`${s.title} includes`}>
                {s.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <div className="shell mt-12 flex flex-wrap items-center gap-4">
        <a href="#contact" className="btn btn-primary">
          Ask about your room
        </a>
        <span className="text-ink-soft t-small">Not sure what you need? We’ll advise when we visit.</span>
      </div>
    </section>
  )
}
