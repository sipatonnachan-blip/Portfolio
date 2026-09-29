import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  BUG_AX,
  BUG_AY,
  BUG_BOX,
  BUG_H,
  BUG_W,
  FACING_VIEWER,
  FireflyFront,
  FireflySide,
  LAMP_POSE,
  circlePoints,
  cubicPoints,
  flightKeyframes,
  hoverKeyframes,
} from './firefly'
import { TECH_LOGOS, LOGO_SKILLS } from '../data/techLogos'
import { PORTFOLIO_TECH } from '../data/techStack'
import { useLampReady } from '../hooks/fireflyStore'

const MAX_PULL = 56

// One curl of smoke: an S-shaped stroke that fades toward its tip. The
// stroke flows upward along its own curve (dash offset) while the whole wisp
// rises, sways and spreads out, which reads as real curling smoke. `mirror`
// flips the S so neighbouring wisps don't curl in lockstep.
function SmokeWisp({ width, height, delay = 0, duration = 3, mirror = false, className = '', style }) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 24 64"
      width={width}
      height={height}
      className={`smoke-wisp overflow-visible ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s`, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="30%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={mirror ? 'translate(24 0) scale(-1 1)' : undefined}>
        <path
          className="smoke-curl"
          d="M12 64 C4 54 4 46 12 38 C20 30 20 22 12 14 C7 9 8 4 11 0"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
        />
        <path
          className="smoke-curl"
          d="M13 60 C19 52 18 45 12 38 C6 31 7 24 13 17"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
          style={{ animationDelay: `${delay + duration * 0.35}s`, animationDuration: `${duration}s` }}
        />
      </g>
    </svg>
  )
}

// Landed beside the spill, facing the puddle (to its right)
const LANDED_POSE = { rot: 0, flip: 1 }
// Where the firefly lands, as a fraction of the puddle's box: just past the
// puddle's left edge on dry desk (hot coffee would be the end of it)
const LAND_AT = { x: -0.18, y: 0.5 }
const PUDDLE = { width: 150, height: 14, bottom: 3 }

// Old-fashioned banker's desk lamp: brass stand, green glass shade. Drawn as
// SVG so it scales cleanly; the pull chain is a separate button on top.
function DeskLamp({ on }) {
  return (
    <svg
      viewBox="0 0 200 210"
      className="absolute inset-0 h-full w-full overflow-visible transition-[filter] duration-700"
      style={{ filter: on ? 'none' : 'brightness(0.45) saturate(0.6)' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lamp-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d48a" />
          <stop offset="55%" stopColor="#b8893a" />
          <stop offset="100%" stopColor="#6e5020" />
        </linearGradient>
        <linearGradient id="lamp-brass-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a5a24" />
          <stop offset="45%" stopColor="#f0d48a" />
          <stop offset="100%" stopColor="#7a5a24" />
        </linearGradient>
        <linearGradient id="lamp-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3fa46a" />
          <stop offset="45%" stopColor="#1c6a43" />
          <stop offset="100%" stopColor="#0c3a25" />
        </linearGradient>
        <linearGradient id="lamp-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,222,160,0.55)" />
          <stop offset="100%" stopColor="rgba(255,200,120,0)" />
        </linearGradient>
      </defs>

      {/* Light cone falling onto the desk */}
      <path
        d="M30 100 L170 100 L222 210 L-22 210 Z"
        fill="url(#lamp-cone)"
        className={`transition-opacity duration-700 ${on ? 'tech-lamp-flicker opacity-100' : 'opacity-0'}`}
      />

      {/* Base */}
      <ellipse cx="100" cy="206" rx="52" ry="5" fill="#3d2c10" />
      <path d="M50 206 Q52 188 100 184 Q148 188 150 206 Z" fill="url(#lamp-brass)" />
      <path d="M66 198 Q80 190 100 189" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Stem + collar */}
      <rect x="97" y="96" width="6" height="92" fill="url(#lamp-brass-side)" />
      <rect x="91" y="150" width="18" height="6" rx="2" fill="url(#lamp-brass)" />
      <rect x="93" y="90" width="14" height="9" rx="2" fill="url(#lamp-brass)" />

      {/* Green glass shade */}
      <path d="M24 97 C28 62 58 46 100 46 C142 46 172 62 176 97 Z" fill="url(#lamp-shade)" />
      <path d="M42 86 C50 66 70 56 100 55" stroke="rgba(255,255,255,0.28)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path
        d="M24 97 C28 62 58 46 100 46 C142 46 172 62 176 97 Z"
        fill="rgba(140,255,190,0.18)"
        className={`transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-0'}`}
      />
      <rect x="20" y="94" width="160" height="6" rx="3" fill="url(#lamp-brass)" />
      <circle cx="100" cy="44" r="4.5" fill="url(#lamp-brass)" />

      {/* Bulb glow under the rim */}
      <ellipse
        cx="100"
        cy="101"
        rx="64"
        ry="4"
        fill="#fff4cf"
        className={`transition-opacity duration-500 ${on ? 'tech-lamp-flicker opacity-100' : 'opacity-0'}`}
      />
    </svg>
  )
}

// Cartoon of Christian in his graduation gown, sitting on the desk edge with
// his legs over the front. Sleepy in the dark; eyes open, a smile and a shy
// blush once the lamp is on. The seat line (y=110 in the viewBox) sits on the
// desk top, same as the scene expects.
function DeskMe({ on }) {
  return (
    <svg viewBox="0 0 100 150" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="me-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3c6a1" />
          <stop offset="100%" stopColor="#e2a57e" />
        </linearGradient>
        <linearGradient id="me-gown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26262d" />
          <stop offset="100%" stopColor="#101014" />
        </linearGradient>
        <linearGradient id="me-medal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b8862b" />
        </linearGradient>
      </defs>

      {/* Shadow on the desk, then knees and shins hanging over the edge */}
      <ellipse cx="50" cy="111" rx="34" ry="3.5" fill="rgba(0,0,0,0.35)" />
      <rect x="35.5" y="112" width="11" height="24" rx="5" fill="#1b1b22" />
      <rect x="53.5" y="112" width="11" height="24" rx="5" fill="#1b1b22" />
      <ellipse cx="41" cy="110" rx="8" ry="5" fill="#23232b" />
      <ellipse cx="59" cy="110" rx="8" ry="5" fill="#23232b" />
      <ellipse cx="40" cy="138" rx="9" ry="5" fill="#0b0b0e" />
      <ellipse cx="60" cy="138" rx="9" ry="5" fill="#0b0b0e" />
      <ellipse cx="37" cy="136.5" rx="3" ry="1.2" fill="rgba(255,255,255,0.25)" />
      <ellipse cx="57" cy="136.5" rx="3" ry="1.2" fill="rgba(255,255,255,0.25)" />

      <g className={on ? 'buddy-idle' : ''}>
        {/* Gown */}
        <path d="M24 110 C22 90 26 74 38 69 L62 69 C74 74 78 90 76 110 Z" fill="url(#me-gown)" />
        {/* Sleeves with hands resting on the desk */}
        <path d="M27 76 C18 82 15 96 17 108 L26 108 C26 98 28 88 32 80 Z" fill="#18181d" />
        <path d="M73 76 C82 82 85 96 83 108 L74 108 C74 98 72 88 68 80 Z" fill="#18181d" />
        <ellipse cx="21" cy="109" rx="5" ry="3.5" fill="url(#me-skin)" />
        <ellipse cx="79" cy="109" rx="5" ry="3.5" fill="url(#me-skin)" />
        {/* Grey hood forming the V */}
        <path d="M34 70 L50 94 L66 70 L60 69 L50 84 L40 69 Z" fill="#a3a9b4" />
        {/* White collar + black tie */}
        <path d="M42 68 L50 80 L58 68 L54 66 L50 72 L46 66 Z" fill="#f5f5f4" />
        <path d="M48.5 72 L51.5 72 L52.5 82 L50 85 L47.5 82 Z" fill="#111114" />
        {/* Medal on its ribbon */}
        <line x1="50" y1="85" x2="50" y2="96" stroke="#2a2a33" strokeWidth="1" />
        <circle cx="50" cy="99" r="4.2" fill="url(#me-medal)" />
        <circle cx="50" cy="99" r="2.2" fill="#3b82f6" opacity="0.85" />

        {/* Neck */}
        <rect x="45" y="60" width="10" height="9" rx="3" fill="#dfa079" />

        {/* Ears */}
        <ellipse cx="27.5" cy="44" rx="4" ry="5.5" fill="#e2a57e" />
        <ellipse cx="72.5" cy="44" rx="4" ry="5.5" fill="#e2a57e" />
        {/* Face */}
        <ellipse cx="50" cy="43" rx="22" ry="21" fill="url(#me-skin)" />

        {/* Hair: full on top with a thick side-swept fringe */}
        <path
          d="M25 47 C20 24 32 8 50 8 C69 8 81 22 76 47 C75 42 73 39 71 37 L67 40.5 L64.5 35.5 L60 39.5 L57 34.5 L51.5 39 L48 34 L43 39 L40 34.5 L35.5 40 L32 37.5 C29 40 26.5 43 25 47 Z"
          fill="#15151a"
        />
        <path d="M35 15 C42 10.5 53 10 61 13" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Brows */}
        <path d="M36 40.5 L43 39.8" stroke="#15151a" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M57 39.8 L64 40.5" stroke="#15151a" strokeWidth="1.8" strokeLinecap="round" />

        {/* Eyes: sleepy arcs in the dark, open with a shine when lit */}
        {on ? (
          <g className="buddy-blink" style={{ transformOrigin: '50px 44px' }}>
            <ellipse cx="40" cy="44" rx="2.8" ry="3.4" fill="#1b1410" />
            <ellipse cx="60" cy="44" rx="2.8" ry="3.4" fill="#1b1410" />
            <circle cx="41" cy="42.8" r="1" fill="#fff" />
            <circle cx="61" cy="42.8" r="1" fill="#fff" />
          </g>
        ) : (
          <g>
            <path d="M36.5 44.5 Q40 46.5 43.5 44.5" stroke="#1b1410" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M56.5 44.5 Q60 46.5 63.5 44.5" stroke="#1b1410" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Cheeks: a shy blush when the light comes on */}
        <ellipse cx="34" cy="51" rx="4.5" ry="2.6" fill="#f472b6" opacity={on ? 0.45 : 0.15} style={{ transition: 'opacity 0.6s' }} />
        <ellipse cx="66" cy="51" rx="4.5" ry="2.6" fill="#f472b6" opacity={on ? 0.45 : 0.15} style={{ transition: 'opacity 0.6s' }} />

        {/* Nose + mouth */}
        <path d="M50 46 Q51.5 49.5 49.5 50.5" stroke="#c98763" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path
          d={on ? 'M44 54 Q50 59 56 54' : 'M46.5 55 Q50 56 53.5 55'}
          stroke="#8a4a3a"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

// A dark room with an old desk lamp and a little cartoon me on a desk. Pulling the
// lamp's chain (drag it down, click it, or press Enter/Space on it) switches
// the light on, and the tech logos fan out into a slowly spinning 3D ring
// above my head, like I'm thinking them. Pull again to switch off.
export default function TechLampScene() {
  const [on, setOn] = useState(false)
  const [pull, setPull] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [spilled, setSpilled] = useState(false)
  // Where the firefly is: on the lamp, in the air, or landed beside the coffee
  const [bugPhase, setBugPhase] = useState('lamp')
  // The site-wide companion firefly flies in and lands on the lamp first; the
  // scene's own lamp firefly only appears (and starts its story) after that.
  const lampReady = useLampReady()
  // Scene position of the "Hi there!" bubble while the bug says hello
  const [greeting, setGreeting] = useState(null)
  // The flying firefly turns to face the viewer while it says hi
  const [facingViewer, setFacingViewer] = useState(false)
  const [radius, setRadius] = useState(320)
  const sceneRef = useRef(null)
  const tiltRef = useRef(null)
  const dragRef = useRef(null)
  const flyRef = useRef(null)
  const mugRef = useRef(null)
  const puddleRef = useRef(null)
  const spilledRef = useRef(spilled)
  const bugPhaseRef = useRef(bugPhase)
  spilledRef.current = spilled
  bugPhaseRef.current = bugPhase

  // Scene-relative point on an element (fractions of its box)
  const pointOn = useCallback((el, fx = 0.5, fy = 0.5) => {
    const scene = sceneRef.current.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return { x: r.left - scene.left + r.width * fx, y: r.top - scene.top + r.height * fy }
  }, [])

  const runFlight = useCallback((segments, poses, onDone) => {
    const fly = flyRef.current
    const { keyframes, duration } = flightKeyframes(segments, poses)
    fly.getAnimations().forEach((a) => a.cancel())
    setBugPhase('flying')
    const anim = fly.animate(keyframes, { duration, easing: 'ease-in-out', fill: 'forwards' })
    anim.onfinish = onDone
    return anim
  }, [])

  // Light on: take off from the lamp, loop-the-loop, zoom up to the viewer and
  // say hi, then fly off, knock the mug over and land beside the spill.
  const startFlight = useCallback(() => {
    const scene = sceneRef.current
    const anchor = scene?.querySelector('[data-bug-anchor]')
    if (!anchor || !mugRef.current || !puddleRef.current || !flyRef.current) return

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setSpilled(true)
      setBugPhase('landed')
      return
    }

    const box = scene.getBoundingClientRect()
    const start = pointOn(anchor)
    const faceAt = { x: box.width / 2, y: box.height * 0.45 }
    const big = box.width < 640 ? 3.5 : 5.5

    const r = 26
    const center = { x: start.x - 20, y: start.y - 62 }
    const loopTop = { x: center.x + r, y: center.y }
    const takeOff = cubicPoints(start, { x: start.x, y: start.y - 25 }, { x: loopTop.x, y: loopTop.y + 25 }, loopTop, 14)
    const loopTheLoop = circlePoints(center, r, 0, -Math.PI * 2, 32)
    const towardViewer = cubicPoints(
      loopTop,
      { x: loopTop.x, y: loopTop.y - 60 },
      { x: faceAt.x - 140, y: faceAt.y - 50 },
      faceAt,
      36
    )

    const flyToMug = () => {
      setGreeting(null)
      setFacingViewer(false)
      // Re-measure: the mug/puddle may have moved if the window resized
      const mug = pointOn(mugRef.current, 0, 0.4)
      const puddle = pointOn(puddleRef.current, LAND_AT.x, LAND_AT.y)
      const alreadySpilled = spilledRef.current
      const target = alreadySpilled ? puddle : mug
      const away = cubicPoints(
        faceAt,
        { x: faceAt.x + 70, y: faceAt.y - 70 },
        { x: target.x - 100, y: target.y - 90 },
        target,
        40
      )
      runFlight(
        [{ pts: away, loop: false, scale: [big, 1] }],
        { start: FACING_VIEWER, end: alreadySpilled ? LANDED_POSE : undefined },
        () => {
          if (alreadySpilled) {
            setBugPhase('landed')
            return
          }
          // Bump! The mug goes over, and the bug bounces off and lands beside the spill.
          setSpilled(true)
          const land = pointOn(puddleRef.current, LAND_AT.x, LAND_AT.y)
          // Arcs back past the landing spot and comes in toward the puddle, so it
          // touches down already facing the coffee
          const bounce = cubicPoints(mug, { x: mug.x - 40, y: mug.y - 70 }, { x: land.x - 60, y: land.y - 45 }, land, 34)
          runFlight([{ pts: bounce, loop: false }], { end: LANDED_POSE }, () => setBugPhase('landed'))
        }
      )
    }

    runFlight(
      [
        { pts: takeOff, loop: true },
        { pts: loopTheLoop, loop: true },
        { pts: towardViewer, loop: false, scale: [1, big] },
      ],
      { start: LAMP_POSE, end: FACING_VIEWER },
      () => {
        // Hovering right up close: "Hi there!"
        const fly = flyRef.current
        setGreeting({ x: faceAt.x, y: faceAt.y - BUG_AY * big - 14 })
        setFacingViewer(true)
        fly.getAnimations().forEach((a) => a.cancel())
        const hover = fly.animate(hoverKeyframes(faceAt, big), { duration: 2000, easing: 'ease-in-out', fill: 'forwards' })
        hover.onfinish = flyToMug
      }
    )
  }, [pointOn, runFlight])

  // Mug picked back up: the bug flies home to the lamp.
  const flyHome = useCallback(() => {
    const anchor = sceneRef.current?.querySelector('[data-bug-anchor]')
    if (!anchor || !puddleRef.current || !flyRef.current) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setBugPhase('lamp')
      return
    }
    const from = pointOn(puddleRef.current, LAND_AT.x, LAND_AT.y)
    const home = pointOn(anchor)
    const path = cubicPoints(from, { x: from.x - 40, y: from.y - 140 }, { x: home.x - 70, y: home.y - 60 }, home, 40)
    runFlight([{ pts: path, loop: false }], { start: LANDED_POSE, end: LAMP_POSE }, () => setBugPhase('lamp'))
  }, [pointOn, runFlight])

  // A beat after the light comes on (once its wings are open), off it goes.
  useEffect(() => {
    if (!on || !lampReady || bugPhaseRef.current !== 'lamp') return undefined
    const timer = window.setTimeout(startFlight, 1500)
    return () => window.clearTimeout(timer)
  }, [on, lampReady, startFlight])

  useEffect(() => {
    if (bugPhase === 'landed' && !spilled) flyHome()
  }, [bugPhase, spilled, flyHome])

  // Clear the flying bug's animations once it's parked, and on unmount
  useEffect(() => {
    const fly = flyRef.current
    if (bugPhase !== 'flying') fly?.getAnimations().forEach((a) => a.cancel())
  }, [bugPhase])
  useEffect(() => () => flyRef.current?.getAnimations().forEach((a) => a.cancel()), [])

  // Size the ring to the scene so it never spills out on narrow screens.
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return undefined
    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect
      setRadius(Math.round(Math.min(320, Math.max(110, width * 0.3))))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Tilt the ring toward the cursor. Written straight to the DOM so moving
  // the mouse doesn't re-render every card.
  const handleScenePointerMove = (e) => {
    const el = sceneRef.current
    const tilt = tiltRef.current
    if (!el || !tilt) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    tilt.style.transform = `rotateX(${-10 - y * 12}deg) rotateZ(${x * -4}deg)`
  }

  const handleSceneLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(-10deg) rotateZ(0deg)'
  }

  // The chain stretches while dragged; the toggle itself happens on click,
  // which fires for mouse, touch and keyboard alike.
  const handleCordDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    dragRef.current = e.clientY
    setDragging(true)
  }

  const handleCordMove = (e) => {
    if (dragRef.current === null) return
    setPull(Math.max(0, Math.min(MAX_PULL, e.clientY - dragRef.current)))
  }

  const handleCordUp = () => {
    dragRef.current = null
    setDragging(false)
    setPull(0)
  }

  const handleCordClick = () => {
    setOn((prev) => !prev)
    // Give keyboard/click toggles the same little tug a drag gets.
    setPull(18)
    window.setTimeout(() => setPull(0), 140)
  }

  const count = LOGO_SKILLS.length
  const cardW = Math.round(radius * 0.27)
  const cardH = Math.round(cardW * 1.3)
  // The label needs ~90px; on small rings the cards are too narrow for it.
  const showLabels = cardW >= 60

  return (
    <section
      ref={sceneRef}
      onPointerMove={handleScenePointerMove}
      onPointerLeave={handleSceneLeave}
      className="relative h-[520px] w-full overflow-hidden rounded-[28px] border border-white/5 bg-[#07090f] sm:h-[600px]"
      aria-label="Interactive tech stack desk lamp"
    >
      {/* Room ambience: cold when off, warm spill from the lamp when on */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#141a2b_0%,#07090f_70%)]" />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${on ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            'radial-gradient(ellipse at 16% 66%, rgba(255,196,128,0.5) 0%, rgba(160,110,60,0.3) 28%, rgba(60,42,26,0.2) 55%, transparent 80%)',
        }}
      />

      {/* ── Desk ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] transition-[filter] duration-1000"
        style={{ filter: on ? 'brightness(0.95)' : 'brightness(0.35) saturate(0.7)' }}
      >
        {/* Top surface */}
        <div
          className="absolute inset-x-0 top-0 h-[22%] border-t border-[#a8764a]/40"
          style={{ background: 'linear-gradient(180deg, #7a5030 0%, #5a3a21 100%)' }}
        />
        {/* Front panel with wood grain */}
        <div
          className="absolute inset-x-0 bottom-0 top-[22%]"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 2px, transparent 2px 46px), linear-gradient(180deg, #3f2717 0%, #26170c 100%)',
          }}
        >
          {/* Drawer */}
          <div className="absolute left-[46%] top-[18%] h-[46%] w-[24%] rounded-sm border border-black/40 bg-[#4a2f1b] shadow-[inset_0_1px_0_rgba(255,220,180,0.12)]">
            <span className="absolute left-1/2 top-1/2 h-2 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8893a]" />
          </div>
        </div>
        {/* Pool of lamplight on the desk */}
        <div
          className={`absolute left-[-4%] top-[-30%] h-[70%] w-[48%] rounded-[50%] transition-opacity duration-700 sm:w-[34%] ${
            on ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'radial-gradient(ellipse, rgba(255,214,150,0.55) 0%, transparent 70%)' }}
        />
      </div>

      {/* Spilled coffee: a puddle spreading over the desk top, dripping off the
          front edge. Anchored on the desk's front edge line. */}
      <div
        className="pointer-events-none absolute bottom-[21.8%] right-[calc(7%+44px)] z-10 transition-[filter] duration-1000"
        style={{ filter: on ? 'brightness(0.9)' : 'brightness(0.4)' }}
        aria-hidden="true"
      >
        <div
          ref={puddleRef}
          className={`coffee-puddle absolute bottom-[3px] right-0 h-[14px] w-[150px] origin-right rounded-[50%] transition-opacity duration-700 ${
            spilled ? 'is-spilled opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.22) 0%, transparent 25%), radial-gradient(ellipse, #4a2a14 0%, #3b2010 60%, #2c170b 100%)',
          }}
        />
        {spilled && (
          <>
            {[
              { right: 18, delay: 0.9, dur: 2.6 },
              { right: 48, delay: 1.4, dur: 3.1 },
              { right: 78, delay: 1.1, dur: 2.8 },
              { right: 108, delay: 1.7, dur: 3.3 },
              { right: 132, delay: 1.25, dur: 2.9 },
            ].map((puff) => (
              <SmokeWisp
                key={puff.right}
                width={16}
                height={52}
                delay={puff.delay}
                duration={puff.dur + 0.6}
                mirror={puff.right % 60 === 18 || puff.right === 78}
                className="absolute bottom-[8px] blur-[0.8px]"
                style={{ right: puff.right }}
              />
            ))}
            <span className="coffee-drip absolute right-[92px] top-0 w-[6px] rounded-b-full bg-[#3b2010]" />
            <span className="coffee-drop absolute right-[92.5px] top-[20px] h-[5px] w-[5px] rounded-full bg-[#3b2010]" />
          </>
        )}
      </div>

      {/* The firefly once it has landed beside the coffee, facing the puddle. Same
          anchor as the puddle, but outside its darkening so the lantern can glow. */}
      {bugPhase === 'landed' && (
        <div className="pointer-events-none absolute bottom-[21.8%] right-[calc(7%+44px)] z-10" aria-hidden="true">
          <svg
            data-firefly-now=""
            viewBox={`${BUG_BOX.x} ${BUG_BOX.y} ${BUG_BOX.w} ${BUG_BOX.h}`}
            width={BUG_W}
            height={BUG_H}
            className="absolute overflow-visible"
            style={{
              left: -PUDDLE.width * (1 - LAND_AT.x) - BUG_AX,
              top: -(PUDDLE.bottom + PUDDLE.height * (1 - LAND_AT.y)) - BUG_AY,
            }}
          >
            <FireflySide open={false} glowing={!on} dim={!on} />
          </svg>
        </div>
      )}

      {/* Coffee mug at the far end of the desk: steams, and tips over when clicked */}
      <div
        className="absolute bottom-[26%] right-[7%] z-20 transition-[filter] duration-1000"
        style={{ filter: on ? 'brightness(0.9)' : 'brightness(0.35)' }}
      >
        {!spilled && (
          <div className="pointer-events-none absolute bottom-full left-1/2 flex -translate-x-1/2 gap-1 pb-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <SmokeWisp
                key={i}
                width={10}
                height={30}
                delay={i * 0.8}
                duration={2.6}
                mirror={i === 1}
                className="-mx-0.5 blur-[0.6px]"
              />
            ))}
          </div>
        )}
        <button
          ref={mugRef}
          type="button"
          onClick={() => setSpilled((prev) => !prev)}
          aria-label={spilled ? 'Pick the coffee mug back up' : 'Knock over the coffee mug'}
          title={spilled ? 'Pick it back up' : 'Careful…'}
          className={`mug relative block h-9 w-8 cursor-pointer rounded-b-lg rounded-t-sm bg-gradient-to-r from-[#d8d2c4] to-[#a9a293] outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
            spilled ? 'is-tipped' : 'hover:-rotate-6'
          }`}
        >
          <span className="absolute -right-3 top-1.5 h-5 w-4 rounded-r-full border-[3px] border-l-0 border-[#bdb6a7]" />
          {/* Coffee surface; once tipped it becomes the mug's empty open mouth */}
          <span
            className={`absolute inset-x-1 top-0.5 h-1.5 rounded-full transition-colors duration-300 ${
              spilled ? 'bg-[#141010] ring-1 ring-[#8f887a]' : 'bg-[#3b2414]'
            }`}
          />
        </button>
      </div>

      {/* ── Lamp on the desk ── */}
      <div className="absolute bottom-[25%] left-[3%] z-20 h-[210px] w-[200px] origin-bottom-left scale-[0.8] sm:left-[7%] sm:scale-100">
        <DeskLamp on={on} />

        {/* Firefly on the shade, in the lamp's coordinates but outside its
            darkening so the lantern can glow. At (51.8, 56) on the shade curve,
            turned -28deg to match its slope, facing up toward the knob. */}
        <svg viewBox="0 0 200 210" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <g transform="translate(51.8 56) rotate(-28) scale(1.3)" style={{ opacity: bugPhase === 'lamp' && lampReady ? 1 : 0 }}>
            <FireflySide open={on} glowing={!on} dim={!on} />
            {/* Marks the feet so the flight can start exactly where it sits */}
            <circle data-bug-anchor data-firefly-now={bugPhase === 'lamp' ? '' : undefined} cx="0" cy="0" r="0.01" fill="none" />
          </g>
        </svg>

        {/* Pull chain hanging from the shade */}
        <button
          type="button"
          onPointerDown={handleCordDown}
          onPointerMove={handleCordMove}
          onPointerUp={handleCordUp}
          onPointerCancel={handleCordUp}
          onClick={handleCordClick}
          aria-pressed={on}
          aria-label={on ? 'Pull the chain to switch the lamp off' : 'Pull the chain to switch the lamp on'}
          className="group absolute left-[140px] top-[99px] flex w-5 cursor-grab touch-none flex-col items-center outline-none transition-[filter] duration-700 active:cursor-grabbing"
          style={{ filter: on ? 'none' : 'brightness(0.45) saturate(0.6)' }}
        >
          <span
            className="w-1"
            style={{
              height: `${44 + pull}px`,
              background: 'radial-gradient(circle, #e6c577 45%, transparent 52%) center top / 4px 6px repeat-y',
              transition: dragging ? 'none' : 'height 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
          <span
            className={`h-4 w-3 rounded-full bg-gradient-to-b from-[#f0d48a] to-[#8a6424] transition-transform duration-300 group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-orange-300 ${
              on ? 'shadow-[0_0_10px_rgba(255,200,120,0.8)]' : ''
            }`}
          />
        </button>
      </div>

      {/* Hint on the desk front */}
      <p
        className={`pointer-events-none absolute bottom-[7%] left-[3%] z-20 w-[160px] text-center font-sans text-[11px] leading-snug transition-colors duration-700 sm:left-[7%] sm:w-[200px] ${
          on ? 'text-orange-100/70' : 'text-white/35'
        }`}
      >
        {on ? 'Pull the chain again to switch off' : 'Pull the chain to switch on'}
      </p>

      {/* ── Me sitting on the desk, with a thought bubble ── */}
      <div className="absolute bottom-[calc(22.5%-40px)] left-[74%] z-20 h-[150px] w-[100px] -translate-x-1/2 origin-bottom scale-75 sm:left-[62%] sm:scale-100">
        <div
          className="h-full w-full transition-[filter] duration-700"
          style={{ filter: on ? 'none' : 'brightness(0.5) saturate(0.6)' }}
        >
          <DeskMe on={on} />
        </div>

        {/* Thought trail rising from the head */}
        {[
          { size: 6, x: 58, y: -10 },
          { size: 10, x: 66, y: -26 },
          { size: 14, x: 58, y: -46 },
        ].map((dot, idx) => (
          <span
            key={idx}
            className={`absolute rounded-full border transition-all duration-700 ${
              on ? 'border-orange-300/50 bg-orange-300/20 shadow-[0_0_8px_rgba(251,146,60,0.5)]' : 'border-white/20 bg-white/10'
            }`}
            style={{ width: dot.size, height: dot.size, left: dot.x, top: dot.y, transitionDelay: `${idx * 80}ms` }}
          />
        ))}

        {/* Thought bubble: the dark-room hint, dissolving as the ring appears */}
        <div
          className={`pointer-events-none absolute bottom-[calc(100%+52px)] left-1/2 w-56 -translate-x-1/4 rounded-[28px] border border-white/15 bg-white/[0.06] px-5 py-3.5 text-center shadow-lg transition-all duration-500 ${
            on ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <p className="font-sans text-[11px] leading-relaxed text-white/55 sm:text-xs">
            It&apos;s a little dark in here…
            <br />
            Pull the lamp&apos;s chain to light up my stack.
          </p>
        </div>
      </div>

      {/* ── Tech ring ── */}
      <div
        className="absolute left-1/2 top-0 bottom-[calc(24%+170px)] flex w-0 items-center justify-center sm:left-[62%]"
        style={{ perspective: '1100px' }}
      >
        <div
          ref={tiltRef}
          className="transition-transform duration-500 ease-out"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-10deg) rotateZ(0deg)' }}
        >
          <div className={`tech-ring relative ${on ? '' : 'is-off'}`} style={{ transformStyle: 'preserve-3d' }}>
            {LOGO_SKILLS.map((skill, i) => {
              const [Logo, color] = TECH_LOGOS[skill]
              const tint = color ?? '#cbd5e1'
              const angle = (360 / count) * i
              return (
                <div
                  key={skill}
                  className="absolute"
                  style={{
                    width: cardW,
                    height: cardH,
                    left: -cardW / 2,
                    top: -cardH / 2,
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${angle}deg) translateZ(${on ? radius : 0}px) scale(${on ? 1 : 0.2})`,
                    opacity: on ? 1 : 0,
                    transition: `transform 1.1s cubic-bezier(0.16,1,0.3,1) ${on ? 250 + i * 55 : 0}ms, opacity 0.7s ease ${on ? 250 + i * 55 : 0}ms`,
                  }}
                >
                  <div
                    title={PORTFOLIO_TECH.has(skill) ? `${skill} — used to build this portfolio` : skill}
                    className="relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border transition-transform duration-300 hover:scale-110"
                    style={{
                      background: `linear-gradient(160deg, ${tint}40 0%, ${tint}1a 100%)`,
                      borderColor: `${tint}66`,
                      boxShadow: `0 0 28px ${tint}40, inset 0 0 18px ${tint}26`,
                    }}
                  >
                    {showLabels && PORTFOLIO_TECH.has(skill) && (
                      // Tag tied to the card's top edge by a short string
                      <span
                        className="tech-tag pointer-events-none absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center"
                        style={{ animationDelay: `${i * -0.35}s` }}
                      >
                        <span
                          className="flex items-center gap-1 whitespace-nowrap rounded-md border bg-black/85 px-2 py-1 font-sans text-[8px] font-semibold uppercase tracking-wide text-white shadow-md"
                          style={{ borderColor: `${tint}99`, boxShadow: `0 0 12px ${tint}40` }}
                        >
                          <span className="h-1 w-1 rounded-full" style={{ background: tint }} />
                          Used in this site
                        </span>
                        <span className="h-5 w-px" style={{ background: `${tint}b3` }} />
                        <span className="-mb-[3px] h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
                      </span>
                    )}
                    <Logo style={{ color: color ?? '#f1f5f9', fontSize: cardW * 0.42 }} aria-hidden="true" />
                    <span className="px-1 text-center font-sans text-[10px] font-semibold leading-tight text-white/80">
                      {skill}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* The firefly's hello, above it while it hovers in front of the viewer */}
      {greeting && (
        <div
          className="bug-greeting pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full"
          style={{ left: greeting.x, top: greeting.y }}
          role="status"
        >
          <div className="relative whitespace-nowrap rounded-2xl bg-white px-4 py-2 font-sans text-base font-extrabold text-[#0f1b3d] shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:text-lg">
            Hi there! 👋
            <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
          </div>
        </div>
      )}

      {/* The firefly while it's in the air */}
      <div
        ref={flyRef}
        data-firefly-now={bugPhase === 'flying' ? '' : undefined}
        className="pointer-events-none absolute left-0 top-0 z-30"
        style={{
          width: BUG_W,
          height: BUG_H,
          transformOrigin: `${BUG_AX}px ${BUG_AY}px`,
          visibility: bugPhase === 'flying' ? 'visible' : 'hidden',
        }}
        aria-hidden="true"
      >
        <svg
          viewBox={`${BUG_BOX.x} ${BUG_BOX.y} ${BUG_BOX.w} ${BUG_BOX.h}`}
          width={BUG_W}
          height={BUG_H}
          className="overflow-visible"
        >
          <g className="transition-opacity duration-200" style={{ opacity: facingViewer ? 0 : 1 }}>
            <FireflySide open flying glowing={!on} />
          </g>
          <g className="transition-opacity duration-200" style={{ opacity: facingViewer ? 1 : 0 }}>
            <FireflyFront glowing={!on} />
          </g>
        </svg>
      </div>

      {/* Screen-reader summary of what the ring shows */}
      <p className="sr-only" aria-live="polite">
        {on
          ? `Lamp on. Showing ${count} technologies: ${LOGO_SKILLS.join(', ')}. Used to build this portfolio: ${LOGO_SKILLS.filter((s) => PORTFOLIO_TECH.has(s)).join(', ')}.`
          : 'Lamp off.'}
      </p>
    </section>
  )
}
