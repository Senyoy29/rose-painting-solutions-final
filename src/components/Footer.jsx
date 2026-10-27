import { business, nav } from '../data/site.js'
import Logo from './Logo.jsx'

export default function Footer({ onReplayIntro, inert = false }) {
  const year = new Date().getFullYear()
  return (
    <footer id="site-footer" inert={inert} className="bg-ink pt-20 pb-28 text-white md:pb-12">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo tone="dark" layout="stacked" size={64} />
            <p className="mt-6 max-w-sm text-white/70">
              Careful prep, clean lines and rooms that feel new again. Thank you for considering us for your home.
            </p>
          </div>
          <nav aria-label="Footer">
            <h2 className="font-sans text-[0.95rem] font-semibold text-sky">Explore</h2>
            <ul className="mt-3 grid gap-0.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="inline-block py-1.5 text-white/80 transition hover:text-white">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="font-sans text-[0.95rem] font-semibold text-sky">Get in touch</h2>
            <a href={business.phoneHref} className="mt-4 block font-display text-3xl hover:text-sky">
              {business.phoneDisplay}
            </a>
            <p className="mt-3 text-white/70">
              {business.hours.days}
              <br />
              {business.hours.time}
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-[0.9rem] text-white/55 sm:flex-row sm:justify-between">
          <p>
            © {year} {business.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {onReplayIntro && (
              <button type="button" onClick={onReplayIntro} className="inline-block py-2 hover:text-white">
                Replay intro
              </button>
            )}
            <a href="#top" className="inline-block py-2 hover:text-white">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
