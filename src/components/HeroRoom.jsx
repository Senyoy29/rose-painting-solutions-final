import { useEffect, useRef, useState } from 'react'
import Brush from './Brush.jsx'
import { asset } from '../lib/asset.js'
import { useInView } from '../hooks/useInView.js'
import { BRUSH_VIEW } from '../lib/brushGeometry.js'
import {
  FORESHORTEN,
  bezier,
  brushParts,
  drawCover,
  ease,
  makeBristles,
  paintSegment,
  poseBrush,
} from '../lib/paintEngine.js'

/**
 * The hero's centrepiece: a room seen through an arched doorway.
 * After the page reveal, the Rose brush paints the room in three passes,
 * turning the "before" photo into the "after" photo where it travels.
 * Visitors can flip back to the before view at any time.
 */
export default function HeroRoom({ project, start, reduced }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const brushRef = useRef(null)
  const [phase, setPhase] = useState(reduced ? 'done' : 'waiting') // waiting | painting | done
  const [showBefore, setShowBefore] = useState(false)
  const startedRef = useRef(false)
  const beforeRef = useRef(null)
  // Switching on reduced motion mid-visit finishes the room immediately.
  useEffect(() => {
    if (reduced) setPhase('done')
  }, [reduced])
  // On phones the room sits below the fold: paint it when it's actually seen.
  const [viewRef, seen] = useInView({ threshold: 0.4, rootMargin: '0px' })
  const go = start && seen

  // Paint the transformation once the hero has been revealed.
  useEffect(() => {
    if (!go || startedRef.current || reduced) return
    startedRef.current = true
    let raf = 0
    let cancelled = false
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    // Use exactly the file the browser already chose for the "before" overlay.
    const img = new Image()
    img.decoding = 'async'
    img.src = beforeRef.current?.currentSrc || asset(project.beforeSmall || project.before)

    const run = () => {
      if (cancelled) return
      const W = wrap.clientWidth
      const H = wrap.clientHeight
      const ctx = canvas.getContext('2d')
      if (!ctx || !W || !H) return setPhase('done')
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawCover(ctx, img, W, H)
      setPhase('painting')

      const band = H * 0.42
      const k = (band * 0.75) / BRUSH_VIEW.face
      const len = (BRUSH_VIEW.w - BRUSH_VIEW.tipX) * FORESHORTEN * k + 30
      const rows = [0.2, 0.52, 0.84]
      const strokes = rows.map((y, i) => {
        const fwd = i % 2 === 0
        const a = [fwd ? -len * 0.35 : W + len, H * (y + (fwd ? 0.02 : -0.01))]
        const b = [fwd ? W + len : -len, H * (y - (fwd ? 0.03 : -0.02))]
        return {
          point: bezier(a, [lerpN(a[0], b[0], 0.33), a[1] - H * 0.03], [lerpN(a[0], b[0], 0.66), b[1] + H * 0.03], b),
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

    const delay = setTimeout(() => {
      img.decode ? img.decode().then(run, () => setPhase('done')) : (img.onload = run)
    }, window.scrollY > 40 ? 250 : 1500)
    return () => {
      cancelled = true
      clearTimeout(delay)
      cancelAnimationFrame(raf)
      // StrictMode/dev remounts: allow a clean restart, and never leave the room unpainted
      startedRef.current = false
    }
  }, [go, project, reduced])

  const srcset = (s, b) => `${asset(s)} 800w, ${asset(b)} 1600w`
  const done = phase === 'done'

  return (
    <div ref={viewRef} className="relative h-full">
      {/* The arch window */}
      <div className="arch relative h-full overflow-hidden bg-ink">
        <div ref={wrapRef} className="arch-depth absolute -inset-[7%]">
          <img
            src={asset(project.afterSmall)}
            srcSet={srcset(project.afterSmall, project.after)}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt={project.afterAlt}
            width="1600"
            height="1000"
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full"
            style={{ visibility: phase === 'painting' ? 'visible' : 'hidden' }}
          />
          {/* Before overlay — the "before" image covers the room until painted */}
          <img
            ref={beforeRef}
            src={asset(project.beforeSmall)}
            srcSet={srcset(project.beforeSmall, project.before)}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt=""
            aria-hidden="true"
            width="1600"
            height="1000"
            className={`paint-mask absolute inset-0 size-full object-cover ${phase === 'waiting' || (done && showBefore) ? 'is-shown' : ''}`}
            style={done ? undefined : { transition: 'none' }}
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
          className="tape top-[22%] left-5"
          style={{ opacity: phase === 'waiting' || (done && showBefore) ? 1 : 0, transition: 'opacity .4s' }}
        >
          Before
        </span>
        <span
          className="tape top-[22%] right-5"
          style={{ '--tape-rot': '3deg', opacity: done && !showBefore ? 1 : 0, transition: 'opacity .5s ease .2s' }}
        >
          After
        </span>
        {project.sample && (
          <span className="absolute top-[calc(22%+2.6rem)] right-5 rounded-full bg-ink/70 px-3 py-1 text-[0.75rem] font-medium text-white/90 backdrop-blur-sm">
            Sample illustration
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label={showBefore ? 'Show the room after painting' : 'Show the room before painting'}
        disabled={!done}
        onClick={() => setShowBefore((v) => !v)}
        className="room-toggle absolute bottom-[clamp(2.6rem,5vw,4.5rem)] left-1/2 z-10 -translate-x-1/2 disabled:opacity-0"
      >
        <span aria-hidden="true" className={showBefore ? '' : 'is-active'}>After</span>
        <span aria-hidden="true" className={showBefore ? 'is-active' : ''}>Before</span>
      </button>
    </div>
  )
}

function lerpN(a, b, t) {
  return a + (b - a) * t
}
