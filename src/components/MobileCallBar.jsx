import { useEffect, useState } from 'react'
import { business } from '../data/site.js'
import { PhoneIcon } from './Icons.jsx'

/** Thumb-reach call bar on phones, shown once the hero has scrolled away. */
export default function MobileCallBar({ inert = false }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById('contact')
      const nearContact = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.6
      setShow(window.scrollY > window.innerHeight * 0.7 && !nearContact)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 grid grid-cols-[1.25fr_1fr] gap-2 rounded-full bg-white/92 p-1.5 shadow-[0_18px_40px_-14px_rgb(13_31_77/0.55)] ring-1 ring-ink/10 backdrop-blur-xl transition duration-500 md:hidden ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[130%] opacity-0'
      }`}
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      aria-hidden={!show}
      inert={inert || !show}
    >
      <a href={business.phoneHref} className="btn btn-primary min-h-12 py-2" tabIndex={show ? 0 : -1}>
        <PhoneIcon /> Call now
      </a>
      <a href="#contact" className="btn btn-ink-ghost min-h-12 py-2" tabIndex={show ? 0 : -1}>
        Free quote
      </a>
    </div>
  )
}
