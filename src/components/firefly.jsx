import { useId } from 'react'

// Shared firefly: the drawings (side and front views) and the flight maths
// used by both the Tech Stack lamp scene and the site-wide companion.

// Firefly in side view, facing right, feet on local y=0: slim dark body,
// orange head shield, dark wing covers with pale edges and a lantern tail.
// `glowing` lights the lantern (only while the lamp is off); `dim` darkens
// the body in the dark without dimming the glow. Open, the wing cover lifts
// from its front hinge and the wings flutter. `flying` skips the wake-up
// delay the lamp-side firefly has.
export function FireflySide({ open, flying = false, glowing = false, dim = false }) {
  const glowId = useId()
  return (
    <g className={`firefly ${open ? 'is-open' : ''} ${flying ? 'is-flying' : ''}`}>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="#f7ffb0" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#d9f99d" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow around the lantern, only in the dark */}
      <circle
        className={glowing ? 'firefly-glow' : ''}
        cx="-5.5"
        cy="-2.4"
        r="12"
        fill={`url(#${glowId})`}
        style={{ opacity: glowing ? 1 : 0, transition: 'opacity 0.4s' }}
      />

      <g style={{ opacity: dim ? 0.8 : 1, transition: 'opacity 0.7s' }}>
        {/* Legs */}
        <g stroke="#15140f" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M-1.8 -1.6 L-2.9 -0.9 L-3.3 0" />
          <path d="M0.6 -1.6 L0.3 -0.8 L0.5 0" />
          <path d="M2.6 -1.8 L3.5 -0.9 L4 0" />
        </g>

        {/* Abdomen with segment lines */}
        <ellipse cx="-2.4" cy="-2.5" rx="3.7" ry="1.35" fill="#2a281c" />
        <path d="M-1.2 -3.6 L-1.2 -1.4 M0.4 -3.6 L0.4 -1.5" stroke="#3f3b28" strokeWidth="0.3" />

        {/* Head, eye and long antennae */}
        <path d="M5.5 -3.1 Q7.1 -4.9 8.7 -5.8" stroke="#1a1912" strokeWidth="0.35" fill="none" strokeLinecap="round" />
        <path d="M5.2 -3.2 Q6.3 -5.2 7.4 -6.4" stroke="#1a1912" strokeWidth="0.3" fill="none" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="5" cy="-2.4" rx="1.2" ry="1.05" fill="#141410" />
        <circle cx="5.5" cy="-2.6" r="0.4" fill="#e7e5e4" />

        {/* Orange head shield with its dark spot */}
        <path d="M2 -3.1 C2.4 -5 5 -5.3 6 -3.6 C5.3 -3 3.6 -2.8 2 -3.1 Z" fill={dim ? '#9a6412' : '#f59e0b'} />
        <ellipse cx="3.9" cy="-4" rx="0.8" ry="0.45" fill="#7c2d12" />
      </g>

      {/* Lantern tail: pale in the lamplight, glowing in the dark */}
      <ellipse
        className={glowing ? 'firefly-glow' : ''}
        cx="-5.4"
        cy="-2.4"
        rx="1.9"
        ry="1.25"
        fill={glowing ? '#ecfccb' : '#8a8660'}
        style={{ transition: 'fill 0.4s' }}
      />

      {/* Wings, folded under the wing cover until it opens */}
      <ellipse className="firefly-wing firefly-wing-far" cx="-1.8" cy="-4.9" rx="5.4" ry="1.3" fill="rgba(236,252,203,0.28)" />
      <ellipse className="firefly-wing" cx="-2.2" cy="-4.4" rx="5.8" ry="1.5" fill="rgba(236,252,203,0.45)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.25" />

      {/* Wing cover: dark, pale-edged */}
      <g className="firefly-shell" style={{ opacity: dim ? 0.85 : 1, transition: 'opacity 0.7s' }}>
        <path d="M-5.2 -3.1 C-4.6 -5.3 0.8 -5.7 2.4 -4.3 L2.3 -3.2 C-0.3 -3 -3.2 -2.9 -5.2 -3.1 Z" fill="#1d1c16" stroke="#caa53d" strokeWidth="0.35" />
        <path d="M-3.8 -4.2 C-2 -4.9 0 -5.1 1.6 -4.8" stroke="rgba(255,255,255,0.3)" strokeWidth="0.35" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}

// ── Firefly flight ──────────────────────────────────────────────────────────
// A flying firefly is an absolutely/fixed positioned SVG moved with the Web
// Animations API. Paths are built from real on-screen positions, sampled into
// points, and turned into keyframes that travel at an even speed and face the
// direction of travel. The feet sit at (BUG_AX, BUG_AY) inside the box.
export const BUG_SCALE = 1.3
export const BUG_BOX = { x: -7, y: -8, w: 16, h: 8.6 }
export const BUG_W = BUG_BOX.w * BUG_SCALE
export const BUG_H = BUG_BOX.h * BUG_SCALE
export const BUG_AX = -BUG_BOX.x * BUG_SCALE
export const BUG_AY = -BUG_BOX.y * BUG_SCALE
export const LAMP_POSE = { rot: -28, flip: 1 }

const normalizeAngle = (a) => ((((a + 180) % 360) + 360) % 360) - 180
const nearestTurn = (a, ref) => a + 360 * Math.round((ref - a) / 360)

export function cubicPoints(p0, p1, p2, p3, n) {
  const pts = []
  for (let i = 0; i <= n; i += 1) {
    const t = i / n
    const u = 1 - t
    pts.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    })
  }
  return pts
}

export function circlePoints(c, r, from, to, n) {
  const pts = []
  for (let i = 0; i <= n; i += 1) {
    const a = from + ((to - from) * i) / n
    pts.push({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) })
  }
  return pts
}

export const bugTransform = (p, pose, size = 1) =>
  `translate(${p.x - BUG_AX}px, ${p.y - BUG_AY}px) rotate(${pose.rot}deg) scale(${pose.flip * size}, ${size})`

// segments: [{ pts, loop, scale: [from, to] }]. Loop segments rotate freely
// (the bug goes upside down through a loop-the-loop); elsewhere it stays
// upright and flips to face left or right. `scale` grows or shrinks the bug
// along the segment (it "flies toward the viewer").
export function flightKeyframes(segments, { start, end } = {}) {
  const pts = []
  const loop = []
  const sizes = []
  segments.forEach((seg, si) => {
    const [from, to] = seg.scale ?? [1, 1]
    seg.pts.forEach((pt, i) => {
      if (si > 0 && i === 0) return
      pts.push(pt)
      loop.push(seg.loop)
      sizes.push(from + ((to - from) * i) / Math.max(seg.pts.length - 1, 1))
    })
  })
  const last = pts.length - 1
  const dist = [0]
  for (let i = 1; i <= last; i += 1) {
    dist.push(dist[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  }
  const total = dist[last] || 1

  const poses = pts.map((_, i) => {
    const a = pts[Math.max(i - 1, 0)]
    const b = pts[Math.min(i + 1, last)]
    return { rot: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, flip: 1 }
  })
  poses.forEach((pose, i) => {
    if (loop[i]) {
      if (i > 0 && loop[i - 1]) pose.rot = nearestTurn(pose.rot, poses[i - 1].rot)
      return
    }
    let a = normalizeAngle(pose.rot)
    if (Math.abs(a) > 90) {
      pose.flip = -1
      a = normalizeAngle(a - 180)
    }
    pose.rot = a
  })
  // Line the loop's accumulated rotation up with whatever comes after it
  const lastLoop = loop.lastIndexOf(true)
  if (lastLoop >= 0 && lastLoop < last) {
    const shift = nearestTurn(poses[lastLoop].rot, poses[lastLoop + 1].rot) - poses[lastLoop].rot
    poses.forEach((pose, i) => {
      if (loop[i]) pose.rot += shift
    })
  }
  if (start) poses[0] = { rot: nearestTurn(start.rot, poses[Math.min(1, last)].rot), flip: start.flip }
  if (end) poses[last] = { rot: nearestTurn(end.rot, poses[Math.max(last - 1, 0)].rot), flip: end.flip }

  return {
    keyframes: pts.map((pt, i) => ({ offset: dist[i] / total, transform: bugTransform(pt, poses[i], sizes[i]) })),
    duration: Math.min(4200, Math.max(1400, (total / 230) * 1000)),
  }
}

// Hovering in front of the viewer: a gentle bob and wobble in place.
export function hoverKeyframes(at, size) {
  const bob = [0, -7, 0, -7, 0]
  const tilt = [0, -5, 0, 5, 0]
  return bob.map((dy, i) => ({
    offset: i / (bob.length - 1),
    transform: bugTransform({ x: at.x, y: at.y + dy }, { rot: tilt[i], flip: 1 }, size),
  }))
}

export const FACING_VIEWER = { rot: 0, flip: 1 }

// Firefly seen from the front, looking at the viewer while it says hi: big
// shiny eyes and a smile, antennae up, wing covers raised and both wings
// buzzing. Drawn in the side view's box (centred on x=1, feet on y=0) so the
// two can swap in place.
export function FireflyFront({ glowing = false }) {
  const glowId = useId()
  return (
    <g className="firefly-front">
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="#f7ffb0" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#d9f99d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        className={glowing ? 'firefly-glow' : ''}
        cx="1"
        cy="-1"
        r="9"
        fill={`url(#${glowId})`}
        style={{ opacity: glowing ? 1 : 0, transition: 'opacity 0.4s' }}
      />

      {/* Buzzing wings on both sides */}
      <ellipse className="firefly-front-wing firefly-front-wing-l" cx="-2.6" cy="-4.4" rx="3.8" ry="1.5" fill="rgba(236,252,203,0.45)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.2" />
      <ellipse className="firefly-front-wing firefly-front-wing-r" cx="4.6" cy="-4.4" rx="3.8" ry="1.5" fill="rgba(236,252,203,0.45)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.2" />

      {/* Wing covers raised out to the sides */}
      <ellipse cx="-1.1" cy="-5.2" rx="2.3" ry="0.95" transform="rotate(-32 -1.1 -5.2)" fill="#1d1c16" stroke="#caa53d" strokeWidth="0.3" />
      <ellipse cx="3.1" cy="-5.2" rx="2.3" ry="0.95" transform="rotate(32 3.1 -5.2)" fill="#1d1c16" stroke="#caa53d" strokeWidth="0.3" />

      {/* Dangling legs */}
      <g stroke="#15140f" strokeWidth="0.4" strokeLinecap="round" fill="none">
        <path d="M0.3 -1.6 L-0.6 -0.7 L-0.8 0" />
        <path d="M1.7 -1.6 L2.6 -0.7 L2.8 0" />
        <path d="M0.6 -1.3 L0.4 -0.2 M1.4 -1.3 L1.6 -0.2" />
      </g>

      {/* Body, with the lantern peeking out below */}
      <ellipse cx="1" cy="-2.2" rx="1.5" ry="1.4" fill="#2a281c" />
      <ellipse
        className={glowing ? 'firefly-glow' : ''}
        cx="1"
        cy="-1"
        rx="1"
        ry="0.6"
        fill={glowing ? '#ecfccb' : '#8a8660'}
        style={{ transition: 'fill 0.4s' }}
      />

      {/* Antennae */}
      <path d="M0.3 -5.6 Q-0.6 -7.4 -1.8 -8.4" stroke="#1a1912" strokeWidth="0.3" fill="none" strokeLinecap="round" />
      <path d="M1.7 -5.6 Q2.6 -7.4 3.8 -8.4" stroke="#1a1912" strokeWidth="0.3" fill="none" strokeLinecap="round" />

      {/* Orange head shield with its dark spot */}
      <path d="M-1.4 -5.2 C-1.2 -6.9 3.2 -6.9 3.4 -5.2 C2.4 -4.8 -0.4 -4.8 -1.4 -5.2 Z" fill="#f59e0b" />
      <ellipse cx="1" cy="-5.9" rx="0.8" ry="0.4" fill="#7c2d12" />

      {/* Face: big eyes looking at you, and a smile */}
      <circle cx="1" cy="-3.7" r="1.7" fill="#141410" />
      <circle cx="0.25" cy="-3.95" r="0.62" fill="#f5f5f4" />
      <circle cx="1.75" cy="-3.95" r="0.62" fill="#f5f5f4" />
      <circle cx="0.3" cy="-3.85" r="0.32" fill="#0b0b0d" />
      <circle cx="1.7" cy="-3.85" r="0.32" fill="#0b0b0d" />
      <circle cx="0.18" cy="-4.08" r="0.12" fill="#fff" />
      <circle cx="1.58" cy="-4.08" r="0.12" fill="#fff" />
      <path d="M0.45 -2.95 Q1 -2.5 1.55 -2.95" stroke="#f5f5f4" strokeWidth="0.22" fill="none" strokeLinecap="round" />
    </g>
  )
}
