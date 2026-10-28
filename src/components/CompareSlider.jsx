import { useCallback, useEffect, useRef, useState } from 'react'
import { asset } from '../lib/asset.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { BrushMark } from './Logo.jsx'

/**
 * Drag-to-compare: the BEFORE photo sits underneath and the AFTER photo is
 * revealed from the right as the handle moves. Mouse, pen, trackpad, touch
 * and keyboard (arrow keys, Page Up/Down, Home/End via the range input).
 *
 * before / after: { src, small?, smallW?, alt, w, h, focus?, focusM? }
 *   focus / focusM set the crop position (desktop / phone). Photos are
 *   cropped with object-fit: cover, never stretched.
 * label: what's being compared (used for the accessible name)
 * demo:  play one gentle sweep to show that it moves
 */
export default function CompareSlider({
  before,
  after,
  label,
  demo = false,
  onDemoEnd,
  sizes = '(min-width: 1024px) 52rem, 92vw',
  className = '',
  children,
}) {
  const ref = useRef(null)
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const reduced = useReducedMotion()
  const demoRaf = useRef(0)
  const touched = useRef(false)
  const [hintGone, setHintGone] = useState(false)

  const fromClientX = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }, [])

  const stopDemo = () => {
    if (!touched.current) onDemoEnd?.()
    touched.current = true
    setHintGone(true)
    cancelAnimationFrame(demoRaf.current)
  }

  // One gentle sweep the first time the slider is shown, to show that it moves.
  useEffect(() => {
    if (!demo || reduced || touched.current) return
    const keys = [50, 76, 26, 50]
    const dur = 2400
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
    const id = setTimeout(() => (demoRaf.current = requestAnimationFrame(tick)), 900)
    return () => {
      clearTimeout(id)
      cancelAnimationFrame(demoRaf.current)
    }
  }, [demo, reduced])

  // Mouse/pen/trackpad drag immediately. Touch waits for a clearly horizontal
  // swipe, so scrolling the page past the photos never moves the slider.
  const gesture = useRef(null)
  const beginDrag = (e) => {
    stopDemo()
    setDragging(true)
    ref.current.setPointerCapture?.(e.pointerId)
    fromClientX(e.clientX)
  }
  const onPointerDown = (e) => {
    if (e.button > 0) return
    if (e.pointerType === 'touch') {
      gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
      return
    }
    e.preventDefault() // no text selection or image drag while dragging
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
    // A tap (no real movement) moves the handle to that spot.
    if (g && g.id === e.pointerId && Math.abs(e.clientX - g.x) < 6 && Math.abs(e.clientY - g.y) < 6) {
      stopDemo()
      fromClientX(e.clientX)
    }
    gesture.current = null
    setDragging(false)
  }

  const srcset = (p) => (p.small ? `${asset(p.small)} ${p.smallW || 800}w, ${asset(p.src)} ${p.w}w` : undefined)
  const focus = (p) => ({ '--f': p.focus || '50% 50%', '--fm': p.focusM || p.focus || '50% 50%' })
  const shownAfter = Math.round(100 - pos)

  return (
    <div
      ref={ref}
      className={`compare ${dragging ? 'is-dragging' : ''} ${className}`}
      style={{ '--pos': `${pos}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-pos={Math.round(pos)}
    >
      <img
        src={asset(before.small || before.src)}
        srcSet={srcset(before)}
        sizes={sizes}
        alt={before.alt}
        width={before.w}
        height={before.h}
        style={focus(before)}
        loading="lazy"
        decoding="async"
        draggable="false"
        data-side="before"
      />
      <div className="compare-after">
        <img
          src={asset(after.small || after.src)}
          srcSet={srcset(after)}
          sizes={sizes}
          alt={after.alt}
          width={after.w}
          height={after.h}
          style={focus(after)}
          loading="lazy"
          decoding="async"
          draggable="false"
          data-side="after"
        />
      </div>

      <span className="tape compare-tape top-4 left-4 md:top-5 md:left-5" data-hidden={pos < 14} aria-hidden="true">
        Before
      </span>
      <span
        className="tape compare-tape top-4 right-4 md:top-5 md:right-5"
        style={{ '--tape-rot': '2.5deg' }}
        data-hidden={pos > 86}
        aria-hidden="true"
      >
        After
      </span>

      <span className="compare-line" aria-hidden="true" />
      <span className="compare-grip" aria-hidden="true">
        <svg className="grip-arrow grip-l" width="12" height="20" viewBox="0 0 12 20">
          <path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="grip-disc">
          <BrushMark tone="dark" size={34} />
        </span>
        <svg className="grip-arrow grip-r" width="12" height="20" viewBox="0 0 12 20">
          <path d="m2 2 8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={`grip-hint ${hintGone ? 'is-gone' : ''}`}>Drag to compare</span>
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
        aria-label={`Compare before and after: ${label}. Move left to show more of the after photo.`}
        aria-valuetext={`${shownAfter}% of the after photo shown`}
      />
    </div>
  )
}
