import { reasons } from '../data/content.js'
import { testimonials } from '../data/site.js'
import { BrushTick } from './Icons.jsx'
import RevealHeading from './RevealHeading.jsx'

export default function Trust() {
  return (
    <section aria-labelledby="trust-title" className="bg-primer py-24 md:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <RevealHeading id="trust-title" className="t-h2 max-w-[14ch] text-ink">
            Why homeowners call us back.
          </RevealHeading>
          <p className="mt-6 measure text-ink-soft t-lede">
            Painting is personal — we’re working in the rooms you live in. Here’s what you can count on every time.
          </p>
          <a href="#contact" className="btn btn-ink-ghost mt-9">
            Book a free quote
          </a>
        </div>

        <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
          {reasons.map((r) => (
            <li key={r.title} className="group flex gap-4 border-b border-ink/10 py-7">
              <BrushTick className="mt-1 shrink-0 text-cobalt transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
              <div>
                <h3 className="font-display text-[1.45rem] leading-tight text-ink">{r.title}</h3>
                <p className="mt-2 text-ink-soft">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {testimonials.length > 0 && (
        <div className="shell mt-20 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-[20px] bg-wash p-8">
              <blockquote className="font-display text-2xl leading-snug text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-ink-soft">
                {t.name}
                {t.room ? `, ${t.room}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
