import { useCallback, useEffect, useRef, useState } from 'react'
import { asset } from '../lib/asset.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

/** Drag-to-compare before/after image. Mouse, touch and keyboard (arrow keys). */
/**
 * before / after: { src, small?, alt, w, h }
 * label: what's being compared (used for the accessible name)
 */
export default function CompareSlider({ before, after, label, demo = false, onDemoEnd, sizes = '(min-width: 1024px) 40rem, 100vw', className = '', children }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const reduced = useReducedMotion()
  const demoRaf = useRef(0)
  const touched = useRef(false)
  const [touchedState, setTouchedState] = useState(false)

  const fromClientX = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  const stopDemo = () => {
    if (!touched.current) onDemoEnd?.()
    touched.current = true
    setTouchedState(true)
    cancelAnimationFrame(demoRaf.current)
  }

  // A single gentle sweep the first time it's shown, to hint that it moves.
  useEffect(() => {
    if (!demo || reduced || touched.current) return
    const keys = [50, 80, 22, 50]
    const dur = 2600
    let t0 = 0
    const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2
    const tick = (now) => {
      if (!t0) t0 = now
      const p = Math.min(1, (now - t0) / dur)
      const seg = Math.min(keys.length - 2, Math.floor(p * (keys.length - 1)))
      const local = p * (keys.length - 1) - seg
      setPos(keys[seg] + (keys[seg + 1] - keys[seg]) * ease(local))
      if (p < 1 && !touched.current) demoRaf.current = requestAnimationFrame(tick)
      else if (p >= 1) onDemoEnd?.()
    }
    const id = setTimeout(() => (demoRaf.current = requestAnimationFrame(tick)), 350)
    return () => {
      clearTimeout(id)
      cancelAnimationFrame(demoRaf.current)
    }
  }, [demo, reduced])

  // Mouse/pen drag immediately. Touch waits for a clearly horizontal swipe,
  // so scrolling the page past the gallery never moves the slider.
  const gesture = useRef(null)
  const beginDrag = (e) => {
    stopDemo()
    setDragging(true)
    ref.current.setPointerCapture?.(e.pointerId)
    fromClientX(e.clientX)
  }
  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') {
      gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
      return
    }
    beginDrag(e)
  }
  const onPointerMove = (e) => {
    if (dragging) return fromClientX(e.clientX)
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    const dx = Math.abs(e.clientX - g.x)
    const dy = Math.abs(e.clientY - g.y)
    if (dy > 10 && dy > dx) gesture.current = null // a scroll — let it go
    else if (dx > 6 && dx > dy) {
      gesture.current = null
      beginDrag(e)
    }
  }
  const onPointerUp = (e) => {
    const g = gesture.current
    // a tap (no real movement) jumps the handle to that spot
    if (g && g.id === e.pointerId && Math.abs(e.clientX - g.x) < 6 && Math.abs(e.clientY - g.y) < 6) {
      stopDemo()
      fromClientX(e.clientX)
    }
    gesture.current = null
    setDragging(false)
  }

  const srcset = (p) => (p.small ? `${asset(p.small)} 800w, ${asset(p.src)} ${p.w}w` : undefined)

  return (
    <div
      ref={ref}
      className={`compare ${dragging ? 'is-dragging' : ''} ${className}`}
      style={{ '--pos': `${pos}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={asset(before.small || before.src)}
        srcSet={srcset(before)}
        sizes={sizes}
        alt={before.alt}
        width={before.w}
        height={before.h}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
      <div className="compare-after absolute inset-0">
        <img
          src={asset(after.small || after.src)}
          srcSet={srcset(after)}
          sizes={sizes}
          alt={after.alt}
          width={after.w}
          height={after.h}
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      </div>

      <span className="tape top-4 left-4 md:top-5 md:left-5" style={{ opacity: pos > 12 ? 1 : 0, transition: 'opacity .3s' }}>
        Before
      </span>
      <span
        className="tape top-4 right-4 md:top-5 md:right-5"
        style={{ '--tape-rot': '2.5deg', opacity: pos < 88 ? 1 : 0, transition: 'opacity .3s' }}
      >
        After
      </span>

      <span className="compare-line" aria-hidden="true" />
      <span className="compare-grip" aria-hidden="true">
        <span className="grip-disc">
          <svg width="26" height="18" viewBox="0 0 26 18">
            <path d="M8 2 1.5 9 8 16M18 2l6.5 7L18 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className={`grip-hint ${touchedState ? 'is-gone' : ''}`}>Drag</span>
      </span>

      {children}

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={Math.round(pos)}
        onChange={(e) => {
          stopDemo()
          setPos(Number(e.target.value))
        }}
        className="compare-range"
        aria-label={`Compare before and after: ${label}`}
        aria-valuetext={`${Math.round(100 - pos)}% after image shown`}
      />
    </div>
  )
}
