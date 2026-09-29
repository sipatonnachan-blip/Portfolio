import { useCallback, useEffect, useRef, useState } from 'react'
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
  bugTransform,
  cubicPoints,
  flightKeyframes,
  hoverKeyframes,
} from './firefly'
import { fireflyStore } from '../hooks/fireflyStore'

// A firefly that follows the visitor around the site. On most pages it perches
// on the page's big heading, on top of the first letter of the heading's last
// word, and its lantern glows in dark mode. Changing page, it flies from where
// it is to the new page's perch. On Tech Stack it flies to the lamp and hands
// over to the scene's own firefly (via fireflyStore); leaving Tech Stack, it
// takes off from wherever that firefly is at the time.
//
// With `intro`, the first visit opens with a little show over a cover screen:
// it flies in, grows up close, turns to face the viewer and says "Wazup
// dawg!", then flies down to its perch while the page is revealed.

const TECH_PAGE = 'tech stack'
// Time for the old page to fade out, the new one to mount, scroll to the top
// and rise in, before the new perch is measured. The firefly lifts off and
// drifts during this time rather than waiting still.
const SETTLE_MS = 700
const PERCH_POSE = { rot: 0, flip: -1 }

// Top of the first letter of the heading's last word, in viewport coords
function headingPerch() {
  const h1 = document.querySelector('#main-content h1')
  if (!h1) return null
  const chars = []
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (let i = 0; i < node.data.length; i += 1) chars.push({ node, i, ch: node.data[i] })
  }
  const isLetter = (c) => /\p{L}/u.test(c.ch)
  let end = chars.length - 1
  while (end >= 0 && !isLetter(chars[end])) end -= 1
  if (end < 0) return null
  let first = end
  while (first > 0 && isLetter(chars[first - 1])) first -= 1

  const { node, i } = chars[first]
  const range = document.createRange()
  range.setStart(node, i)
  range.setEnd(node, i + 1)
  const rect = range.getBoundingClientRect()
  const fontSize = parseFloat(getComputedStyle(h1).fontSize) || 48
  return { x: rect.left + rect.width / 2, y: rect.top + fontSize * 0.26 }
}

function lampPerch() {
  const anchor = document.querySelector('[data-bug-anchor]')
  if (!anchor) return null
  const r = anchor.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

// Where the Tech Stack scene's firefly is right now (lamp, in the air, or
// landed beside the coffee), so the companion can take off from there.
function sceneFireflyPoint() {
  const el = document.querySelector('[data-firefly-now]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (el.hasAttribute('data-bug-anchor')) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  return { x: r.left + r.width * (BUG_AX / BUG_W), y: r.top + r.height * (BUG_AY / BUG_H) }
}

const onScreen = (p) =>
  p && p.x > -40 && p.x < window.innerWidth + 40 && p.y > (window.innerWidth < 1024 ? 64 : 0) && p.y < window.innerHeight

const INTRO_LINE = 'Wazup dawg! 🤙'

export default function FireflyCompanion({ activePage, theme, intro = false, skipIntro = false, onIntroReveal }) {
  const flyRef = useRef(null)
  // 'perched' | 'flying' | 'handed-off' (the lamp scene has it)
  const [mode, setMode] = useState('flying')
  const modeRef = useRef(mode)
  modeRef.current = mode
  const lastPoint = useRef(null)
  const lastPose = useRef(PERCH_POSE)
  const glowing = theme === 'dark'
  // Intro: 'pending' → 'in' (flying in) → 'hi' (saying hello) → 'to-perch' → 'done'
  const introStage = useRef(intro ? 'pending' : 'done')
  const onIntroRevealRef = useRef(onIntroReveal)
  onIntroRevealRef.current = onIntroReveal
  const [facingViewer, setFacingViewer] = useState(false)
  const [bubble, setBubble] = useState(null)

  // End of the intro: reveal the page and fly from `start` (at `size`) down to
  // the heading, shrinking to normal size on the way.
  const introToPerch = useCallback((start, size) => {
    const fly = flyRef.current
    introStage.current = 'to-perch'
    // Measure before revealing: the page is laid out (just invisible) now,
    // and its final position is where the firefly should land.
    const to = headingPerch()
    setBubble(null)
    setFacingViewer(false)
    onIntroRevealRef.current?.()
    fly.getAnimations().forEach((a) => a.cancel())
    if (!to) {
      fly.style.opacity = '0'
      introStage.current = 'done'
      setMode('perched')
      return
    }
    const endPose = { rot: 0, flip: to.x < start.x ? -1 : 1 }
    const path = cubicPoints(
      start,
      { x: start.x + (to.x - start.x) * 0.3, y: start.y - 70 },
      { x: to.x + (start.x - to.x) * 0.15, y: to.y - 80 },
      to,
      60
    )
    const flight = flightKeyframes([{ pts: path, loop: false, scale: [size, 1] }], {
      start: { rot: 0, flip: endPose.flip },
      end: endPose,
    })
    const anim = fly.animate(flight.keyframes, { duration: 1500, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'forwards' })
    anim.onfinish = () => {
      lastPoint.current = to
      lastPose.current = endPose
      fly.getAnimations().forEach((a) => a.cancel())
      fly.style.transform = bugTransform(to, endPose)
      introStage.current = 'done'
      setMode('perched')
    }
  }, [])

  // The intro show: fly in from the top-right, growing, then hover facing the
  // viewer with a speech bubble, then head for the perch.
  useEffect(() => {
    if (introStage.current !== 'pending') return undefined
    const fly = flyRef.current
    const W = window.innerWidth
    const H = window.innerHeight
    const big = W < 640 ? 3.5 : 5.5
    const center = { x: W / 2, y: H * 0.52 }
    const from = { x: W + 40, y: H * 0.15 }

    introStage.current = 'in'
    fly.style.transform = bugTransform(from, { rot: 0, flip: -1 })
    fly.style.opacity = '1'
    setMode('flying')

    const path = cubicPoints(from, { x: W * 0.8, y: H * 0.02 }, { x: W * 0.28, y: H * 0.32 }, center, 56)
    const flyIn = flightKeyframes([{ pts: path, loop: false, scale: [1, big] }], { end: FACING_VIEWER })
    const inAnim = fly.animate(flyIn.keyframes, { duration: 1600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' })
    let hover
    inAnim.onfinish = () => {
      if (introStage.current !== 'in') return
      introStage.current = 'hi'
      setFacingViewer(true)
      setBubble({ x: center.x, y: center.y - BUG_AY * big - 16 })
      fly.getAnimations().forEach((a) => a.cancel())
      hover = fly.animate(hoverKeyframes(center, big), { duration: 2400, easing: 'ease-in-out', fill: 'forwards' })
      hover.onfinish = () => {
        if (introStage.current === 'hi') introToPerch(center, big)
      }
    }

    return () => {
      // Restart-safe (React StrictMode runs effects twice in development)
      inAnim.onfinish = null
      if (hover) hover.onfinish = null
      if (introStage.current === 'in' || introStage.current === 'hi') {
        fly.getAnimations().forEach((a) => a.cancel())
        introStage.current = 'pending'
        setBubble(null)
        setFacingViewer(false)
      }
    }
  }, [introToPerch])

  // Skipped: head straight for the perch from wherever it is.
  useEffect(() => {
    if (!skipIntro || (introStage.current !== 'in' && introStage.current !== 'hi')) return
    const r = flyRef.current.getBoundingClientRect()
    const size = Math.max(1, Math.min(r.width / BUG_W, 6))
    introToPerch({ x: r.left + r.width * (BUG_AX / BUG_W), y: r.top + r.height * (BUG_AY / BUG_H) }, size)
  }, [skipIntro, introToPerch])

  // While perched, stick to the heading every frame (it scrolls and animates).
  // While the scene has it, keep note of where the scene's firefly is.
  useEffect(() => {
    let frame
    const tick = () => {
      const fly = flyRef.current
      if (fly && modeRef.current === 'perched') {
        const p = headingPerch()
        if (p) {
          lastPoint.current = p
          fly.style.transform = bugTransform(p, lastPose.current)
          fly.style.opacity = onScreen(p) ? '1' : '0'
        } else {
          fly.style.opacity = '0'
        }
      } else if (modeRef.current === 'handed-off') {
        const p = sceneFireflyPoint()
        if (p) lastPoint.current = p
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Every page change: take off from where we are and fly to the new perch.
  // (The first page's arrival is handled by the intro when there is one.)
  useEffect(() => {
    const fly = flyRef.current
    if (!fly || introStage.current !== 'done') return undefined
    const toTech = activePage === TECH_PAGE
    const leavingScene = modeRef.current === 'handed-off'
    fireflyStore.setLampReady(false)

    // Starting point: wherever it is now (mid-flight, perched, or the scene's)
    let from = lastPoint.current
    let fromPose = leavingScene ? LAMP_POSE : lastPose.current
    const running = fly.getAnimations()
    if (running.length) {
      const r = fly.getBoundingClientRect()
      from = { x: r.left + r.width * (BUG_AX / BUG_W), y: r.top + r.height * (BUG_AY / BUG_H) }
      fromPose = { rot: 0, flip: lastPose.current.flip }
      running.forEach((a) => a.cancel())
    }
    // First visit: fly in from the top-right corner
    if (!from) from = { x: window.innerWidth + 30, y: 40 }

    fly.style.transform = bugTransform(from, fromPose)
    fly.style.opacity = '1'
    setMode('flying')
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    // Lift off right away: a slow drift up and back while the pages swap
    const hoverPose = { rot: 0, flip: fromPose.flip }
    // (kept on screen: headings near the top leave little room above)
    const lifted = { x: from.x - 10 * fromPose.flip, y: Math.max(from.y - 46, 28) }
    if (!reduceMotion) {
      const liftPath = cubicPoints(from, { x: from.x, y: from.y - 20 }, { x: lifted.x, y: lifted.y + 14 }, lifted, 20)
      const lift = flightKeyframes([{ pts: liftPath, loop: false }], { start: fromPose, end: hoverPose })
      fly.animate(lift.keyframes, { duration: SETTLE_MS, easing: 'cubic-bezier(0.3, 0, 0.3, 1)', fill: 'forwards' })
    }

    let anim
    const timer = window.setTimeout(() => {
      const start = reduceMotion ? from : lifted
      const to = toTech ? lampPerch() : headingPerch()
      if (!to) {
        fly.style.opacity = '0'
        setMode('perched')
        return
      }
      const endPose = toTech ? LAMP_POSE : { rot: 0, flip: to.x < start.x ? -1 : 1 }
      const land = () => {
        lastPoint.current = to
        lastPose.current = endPose
        fly.getAnimations().forEach((a) => a.cancel())
        fly.style.transform = bugTransform(to, endPose)
        if (toTech) {
          fly.style.opacity = '0'
          fireflyStore.setLampReady(true)
          setMode('handed-off')
        } else {
          setMode('perched')
        }
      }

      if (reduceMotion) {
        land()
        return
      }

      // One smooth arc from the hover point, easing into a soft landing
      const top = Math.max(Math.min(start.y, to.y) - 120, 24)
      const path = cubicPoints(
        start,
        { x: start.x + (to.x - start.x) * 0.25, y: top },
        { x: start.x + (to.x - start.x) * 0.75, y: Math.min(top + 30, to.y - 40) },
        to,
        60
      )
      const { keyframes, duration } = flightKeyframes([{ pts: path, loop: false }], { start: hoverPose, end: endPose })
      fly.getAnimations().forEach((a) => a.cancel())
      anim = fly.animate(keyframes, {
        duration: Math.min(Math.max(duration, 900), 2200),
        easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
        fill: 'forwards',
      })
      anim.onfinish = land
    }, SETTLE_MS)

    return () => {
      window.clearTimeout(timer)
      if (anim) anim.onfinish = null
    }
  }, [activePage])

  return (
    <>
      <div
        ref={flyRef}
        data-firefly-companion=""
        className="pointer-events-none fixed left-0 top-0 z-[60] transition-opacity duration-300"
        style={{ width: BUG_W, height: BUG_H, transformOrigin: `${BUG_AX}px ${BUG_AY}px`, opacity: 0 }}
        aria-hidden="true"
      >
        <svg viewBox={`${BUG_BOX.x} ${BUG_BOX.y} ${BUG_BOX.w} ${BUG_BOX.h}`} width={BUG_W} height={BUG_H} className="overflow-visible">
          <g className="transition-opacity duration-200" style={{ opacity: facingViewer ? 0 : 1 }}>
            <FireflySide open={mode === 'flying'} flying glowing={glowing} />
          </g>
          <g className="transition-opacity duration-200" style={{ opacity: facingViewer ? 1 : 0 }}>
            <FireflyFront glowing={glowing} />
          </g>
        </svg>
      </div>

      {/* Intro speech bubble, above the firefly while it hovers up close */}
      {bubble && (
        <div
          className="bug-greeting pointer-events-none fixed z-[61] -translate-x-1/2 -translate-y-full"
          style={{ left: bubble.x, top: bubble.y }}
          role="status"
        >
          <div className="relative whitespace-nowrap rounded-2xl bg-white px-5 py-2.5 font-sans text-lg font-extrabold text-[#0f1b3d] shadow-[0_12px_36px_rgba(0,0,0,0.45)] sm:text-2xl">
            {INTRO_LINE}
            <span className="absolute left-1/2 top-full h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
          </div>
        </div>
      )}
    </>
  )
}
