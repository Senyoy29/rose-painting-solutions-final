import { business } from '../data/site.js'
import {
  BRISTLE_PATH_FLAT,
  MARK_BRUSH_TRANSFORM,
  MARK_FERRULE,
  MARK_HANDLE_PATH,
  SWOOSH_PATH,
} from '../lib/brushGeometry.js'

const TONES = {
  // On white / primer backgrounds
  light: { handle: '#0D1F4D', ferrule: '#8A97B8', ridge: '#0D1F4D', bristle: '#BFD3F7', tip: '#2348D6', swoosh: '#2348D6', text: '#0D1F4D', sub: '#2348D6' },
  // On cobalt or navy backgrounds
  dark: { handle: '#FFFFFF', ferrule: '#BFD3F7', ridge: '#0D1F4D', bristle: '#FFFFFF', tip: '#8FB0FF', swoosh: '#8FB0FF', text: '#FFFFFF', sub: 'rgba(255,255,255,.78)' },
  // Navy tile (favicon, app icon, small square uses)
  tile: { handle: '#FFFFFF', ferrule: '#BFD3F7', ridge: '#0D1F4D', bristle: '#FFFFFF', tip: '#3D6BFF', swoosh: '#3D6BFF', bg: '#0D1F4D' },
}

/** The paintbrush mark on its own. `tone`: light | dark | tile */
export function BrushMark({ tone = 'light', size = 40, className = '', title }) {
  const t = TONES[tone]
  const clip = `mk-${tone}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {t.bg && <rect width="64" height="64" rx="15" fill={t.bg} />}
      <defs>
        <clipPath id={clip}>
          <path d={BRISTLE_PATH_FLAT} />
        </clipPath>
      </defs>
      <path d={SWOOSH_PATH} fill={t.swoosh} />
      <g transform={MARK_BRUSH_TRANSFORM}>
        <path d={MARK_HANDLE_PATH} fill={t.handle} />
        <circle cx="494" cy="90" r="9" fill={t.bg || (tone === 'light' ? '#FBFCFE' : '#2348D6')} opacity={tone === 'dark' ? 0 : 1} />
        <rect x={MARK_FERRULE.x} y={MARK_FERRULE.y} width={MARK_FERRULE.w} height={MARK_FERRULE.h} rx={MARK_FERRULE.rx} fill={t.ferrule} />
        <rect x="226" y={MARK_FERRULE.y} width="10" height={MARK_FERRULE.h} fill={t.ridge} opacity=".35" />
        <path d={BRISTLE_PATH_FLAT} fill={t.bristle} />
        <rect x="0" y="0" width="74" height="180" fill={t.tip} clipPath={`url(#${clip})`} />
      </g>
    </svg>
  )
}

/**
 * Logo lockups.
 *  layout: 'inline' (navigation) | 'stacked' (footer, intro)
 *  tone:   'light' (on white) | 'dark' (on blue)
 */
export default function Logo({ tone = 'light', layout = 'inline', size, className = '' }) {
  const t = TONES[tone]
  if (layout === 'stacked') {
    return (
      <span className={`inline-flex flex-col items-start ${className}`}>
        <BrushMark tone={tone} size={size || 72} />
        <span className="mt-3 font-display text-[2.4rem] leading-none tracking-[-0.015em]" style={{ color: t.text }}>
          {business.shortName}
        </span>
        <span className="mt-2 text-[0.8rem] font-semibold tracking-[0.12em]" style={{ color: t.sub }}>
          Painting Solutions
        </span>
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrushMark tone={tone} size={size || 44} className="-my-1 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.6rem] tracking-[-0.01em]" style={{ color: t.text }}>
          {business.shortName}
        </span>
        <span className="mt-1 whitespace-nowrap text-[0.72rem] font-semibold tracking-[0.08em]" style={{ color: t.sub }}>
          Painting Solutions
        </span>
      </span>
    </span>
  )
}
