import { steps } from '../data/content.js'
import { useInView } from '../hooks/useInView.js'
import RevealHeading from './RevealHeading.jsx'

export default function Process() {
  const [ref, inView] = useInView({ threshold: 0.35 })
  return (
    <section id="process" aria-labelledby="process-title" className="relative overflow-hidden bg-wash py-24 md:py-32">
      <div className="shell">
        <RevealHeading id="process-title" className="t-h2 max-w-[15ch] text-ink">
          A simple process, done properly.
        </RevealHeading>
        <p className="mt-6 measure text-ink-soft t-lede">
          From first call to final walk-through, you’ll always know what’s happening next.
        </p>

        <div ref={ref} className="relative mt-16">
          {/* The brush line that connects the steps, painted in as you arrive */}
          <svg
            className="process-stroke pointer-events-none absolute top-[1.6rem] left-0 hidden h-6 w-full lg:block"
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M30 12 C 200 4 340 20 520 11 S 860 4 1000 13 S 1150 16 1180 11"
              fill="none"
              stroke="#2348D6"
              strokeWidth="7"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              style={{ strokeDashoffset: inView ? 0 : 1 }}
            />
          </svg>
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[1.55rem] w-[5px] origin-top rounded-full bg-cobalt transition-transform duration-[1800ms] ease-[var(--ease-brush)] lg:hidden"
            style={{ transform: `scaleY(${inView ? 1 : 0})` }}
          />

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="relative pl-20 lg:pl-0"
                style={{
                  opacity: inView ? 1 : 0.25,
                  transition: `opacity .8s ease ${0.25 + i * 0.35}s`,
                }}
              >
                <span
                  className="absolute top-0 left-0 grid size-[3.3rem] place-items-center rounded-full bg-white font-display text-2xl text-cobalt shadow-[0_0_0_6px_var(--color-wash),0_12px_24px_-12px_rgb(13_31_77/0.5)] lg:relative"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="t-h3 text-ink lg:mt-8">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-3 max-w-xs text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
