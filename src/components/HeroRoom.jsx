import { useEffect, useRef, useState } from 'react'
import Brush from './Brush.jsx'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import { BRUSH_VIEW } from '../lib/brushGeometry.js'
import {
  FORESHORTEN,
  bezier,
  brushParts,
  ease,
  makeBristles,
  paintSegment,
  poseBrush,
  primerPattern,
} from '../lib/paintEngine.js'

/**
 * The hero's centrepiece: a real project photo seen through an arched doorway.
 * The arch starts as freshly primed white; after the page reveal the Rose brush
 * paints the photograph into view in three passes. It reveals the real photo —
 * it does not fake a before/after.
 */
export default function HeroRoom({ photo, start, reduced }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const brushRef = useRef(null)
  const startedRef = useRef(false)
  const [phase, setPhase] = useState(reduced ? 'done' : 'primed') // primed | painting | done
  // On phones the arch sits below the fold: paint it when it's actually seen.
  const [viewRef, seen] = useInView({ threshold: 0.4, rootMargin: '0px' })
  const go = start && seen

  useEffect(() => {
    if (reduced) setPhase('done')
  }, [reduced])

  // Prime the arch: a white, lightly textured surface over the photo.
  const prime = () => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return null
    const W = wrap.clientWidth
    const H = wrap.clientHeight
    const ctx = canvas.getContext('2d')
    if (!ctx || !W || !H) return null
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.75)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#f4f7fd'
    ctx.fillRect(0, 0, W, H)
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, 'rgba(255,255,255,.9)')
    g.addColorStop(1, 'rgba(191,211,247,.35)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.5
    ctx.fillStyle = primerPattern(ctx, 9)
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
    return { ctx, W, H }
  }

  useEffect(() => {
    if (reduced) return
    const ok = prime()
    if (!ok) setPhase('done')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(() => {
    if (!go || startedRef.current || reduced) return
    startedRef.current = true
    let raf = 0
    let cancelled = false

    const run = () => {
      if (cancelled) return
      const ok = prime()
      if (!ok) return setPhase('done')
      const { ctx, W, H } = ok
      setPhase('painting')

      const band = H * 0.42
      const k = (band * 0.75) / BRUSH_VIEW.face
      const len = (BRUSH_VIEW.w - BRUSH_VIEW.tipX) * FORESHORTEN * k + 30
      const strokes = [0.2, 0.52, 0.84].map((y, i) => {
        const fwd = i % 2 === 0
        const a = [fwd ? -len * 0.35 : W + len, H * (y + (fwd ? 0.02 : -0.01))]
        const b = [fwd ? W + len : -len, H * (y - (fwd ? 0.03 : -0.02))]
        const mid = (t) => a[0] + (b[0] - a[0]) * t
        return {
          point: bezier(a, [mid(0.33), a[1] - H * 0.03], [mid(0.66), b[1] + H * 0.03], b),
          band: () => band,
          pressure: (e) => (i === 0 && e < 0.15 ? 0.4 + 0.6 * ease.outCubic(e / 0.15) : 1),
        }
      })
      const sets = strokes.map((_, i) => makeBristles(31 + i * 17, 80))
      const lastE = strokes.map(() => 0)
      const parts = brushParts(brushRef.current)
      const dur = 640
      let t0 = 0

      const frame = (now) => {
        if (cancelled) return
        if (!t0) t0 = now
        const t = now - t0
        const idx = Math.min(strokes.length - 1, Math.floor(t / dur))
        for (let i = 0; i <= idx; i++) {
          const e = ease.inOutSine(Math.min(1, (t - i * dur) / dur))
          if (e > lastE[i]) {
            paintSegment(ctx, strokes[i], sets[i], lastE[i], e)
            lastE[i] = e
          }
          if (i === idx) {
            const [x, y] = strokes[i].point(e)
            const [x2, y2] = strokes[i].point(Math.min(1, e + 0.01))
            const ang = Math.atan2(y2 - y, x2 - x)
            poseBrush(parts, { x, y, angle: ang - 0.06 * Math.sign(Math.cos(ang) || 1), scale: k, press: 0.88, flex: Math.sin(e * 12) * 3 })
          }
        }
        if (t >= strokes.length * dur) {
          ctx.clearRect(0, 0, W, H)
          setPhase('done')
          return
        }
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    // Wait for the photo itself so the paint reveals a real image, not a gap.
    const img = new Image()
    img.src = wrapRef.current?.querySelector('img')?.currentSrc || asset(photo.small)
    const delay = setTimeout(
      () => (img.decode ? img.decode().then(run, run) : run()),
      window.scrollY > 40 ? 250 : 1500,
    )
    return () => {
      cancelled = true
      clearTimeout(delay)
      cancelAnimationFrame(raf)
      startedRef.current = false
    }
  }, [go, photo, reduced])

  const done = phase === 'done'

  return (
    <div ref={viewRef} className="relative h-full">
      <div className="arch relative h-full overflow-hidden bg-ink">
        <div ref={wrapRef} className="arch-depth absolute -inset-[7%]">
          <img
            src={asset(photo.small)}
            srcSet={`${asset(photo.small)} 800w, ${asset(photo.src)} ${photo.w}w`}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt={photo.alt}
            width={photo.w}
            height={photo.h}
            fetchPriority="high"
            className={`absolute inset-0 size-full object-cover ${done ? 'room-drift' : ''}`}
            style={{ background: photo.tone }}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full"
            style={{ visibility: done ? 'hidden' : 'visible' }}
          />
          <Brush
            ref={brushRef}
            id="room-brush"
            className="pointer-events-none absolute top-0 left-0"
            style={{
              transformOrigin: '0 0',
              width: 520,
              height: 180,
              opacity: phase === 'painting' ? 1 : 0,
              transition: 'opacity .3s',
              filter: 'drop-shadow(0 24px 24px rgb(5 14 45 / .45))',
            }}
          />
        </div>

        <span
          className="absolute right-1/2 bottom-[clamp(2.6rem,5vw,4.5rem)] translate-x-1/2 rounded-full bg-ink/70 px-4 py-1.5 text-[0.85rem] font-medium whitespace-nowrap text-white backdrop-blur-sm"
          style={{ opacity: done ? 1 : 0, transition: 'opacity .6s ease .2s' }}
        >
          Finished project photo
        </span>
      </div>
    </div>
  )
}
