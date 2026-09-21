import { useCallback, useEffect, useRef, useState } from 'react'
import { collectExposedData } from '../utils/exposedData'

// Awareness demo opened with Alt+K. A full-screen terminal blurs the page and
// types out what the visitor's browser handed over just by loading it, then
// turns that into the point: be careful what you click. Nothing is stored or
// sent. Deliberately always dark, whatever the site theme is doing.

const CHAR_MS = 16
// How long a piece holds the screen before the next one takes over. Paced
// for a slow reader, not a skimmer.
const BEAT_MS = 5000
const OPENING_PAUSE_MS = 400
// Short beat before the visitor's own line lands, so the indicator reads.
const YOU_BEAT_MS = 800
// How long each harvested value holds before the next replaces it.
const ROW_MS = 2500
const reducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

// Opens on nothing but the prompt. The whole demo is withheld until the
// visitor asks for it.
const OPENING = [{ text: 'ask about myself.', fast: true }]

// Whatever gets asked, the reply is the same: the haul, re-listed, and a
// shrug. The refusal is the punchline.
const PREFACE =
  'before i answer your question — these are the details i got on you the moment you clicked that link and your browser handed them over:'
const SIGNOFF =
  "to answer your question: hire me so i can tell you about myself personally — and so i don't need to waste a token."

// The actual point of the demo. Shown after the first haul only, so repeat
// questions stay a terse shrug.
const LESSON = [
  'no exploit. no permission prompt. you opened a page, and every site you open reads the same things, silently, in under a second.',
  'now picture the link in your inbox that says "your package could not be delivered." same reading. but that page keeps going.',
]

// Shown while the next piece is on its way — for the stranger, and for the
// visitor's own line, so both sides of the exchange behave the same.
const Dots = ({ label }) => (
  <div className="flex animate-fade-in items-center gap-2.5">
    {/* Graded trail, brightest leading clockwise, spun by the container */}
    <span className="grid animate-dot-spin grid-cols-2 gap-[3px] motion-reduce:animate-none">
      {[1, 0.65, 0.15, 0.35].map((opacity, i) => (
        <span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-white"
          style={{ opacity }}
        />
      ))}
    </span>
    {/* A light sweeps across the word for as long as it is thinking */}
    <span className="animate-shimmer bg-[linear-gradient(90deg,rgba(255,255,255,.3)_0%,rgba(255,255,255,.3)_35%,rgba(255,255,255,.95)_50%,rgba(255,255,255,.3)_65%,rgba(255,255,255,.3)_100%)] bg-[length:200%_100%] bg-clip-text font-mono text-[0.95rem] tracking-[0.02em] text-transparent motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-white/45 sm:text-[1.05rem]">
      {label}...
    </span>
  </div>
)

// Sits with the closing line. Drawn rather than imported so the demo stays
// asset-free and inherits the overlay's colour.
const Cat = () => (
  <svg
    viewBox="0 0 64 72"
    aria-hidden="true"
    className="h-[72px] w-16 flex-shrink-0 animate-float text-white/55 motion-reduce:animate-none"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 16 L16 3 L31 10 Z" />
    <path d="M45 16 L48 3 L33 10 Z" />
    <circle cx="32" cy="22" r="15" />
    <circle cx="26.5" cy="21" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="37.5" cy="21" r="1.6" fill="currentColor" stroke="none" />
    <path d="M29.5 25.5 h5 L32 28 Z" fill="currentColor" stroke="none" />
    <path d="M32 28 q-3 3.5 -6 1" />
    <path d="M32 28 q3 3.5 6 1" />
    <path d="M17 22 L6 19M16.5 26 L5 26M17 30 L6 33" />
    <path d="M47 22 L58 19M47.5 26 L59 26M47 30 L58 33" />
    <path d="M20 34 q-4 14 -1 24 q1 6 13 6 q12 0 13 -6 q3 -10 -1 -24" />
    <path d="M45 61 q14 3 12 -12 q-1 -6 -6 -4" />
    <ellipse cx="26" cy="63" rx="4.5" ry="3" />
    <ellipse cx="38" cy="63" rx="4.5" ry="3" />
  </svg>
)

const Caret = () => (
  <span className="ml-0.5 inline-block w-[0.55em] animate-caret bg-white/70 align-baseline">
    &nbsp;
  </span>
)

// Shows the haul one value at a time, each replacing the last, so the
// visitor reads every line instead of skimming a wall of them.
function LiveScan({ rows, loading }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (loading || rows.length < 2) return
    const id = setInterval(
      () => setIndex((n) => Math.min(n + 1, rows.length - 1)),
      ROW_MS
    )
    return () => clearInterval(id)
  }, [loading, rows.length])

  const row = rows[Math.min(index, rows.length - 1)]

  return (
    <div className="my-2 min-h-[8rem] border-l border-emerald-400/40 pl-4 sm:pl-5">
      <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400/80">
        {loading || !row
          ? 'reading browser…'
          : `reading browser · ${index + 1} of ${rows.length} · 0 permissions asked`}
      </p>

      {row && (
        <div key={row.label} className="animate-fade-in">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/35">
            {row.label}
          </p>
          <p className="mt-1 font-mono text-xl leading-snug text-white/90 sm:text-2xl">
            {row.value}
          </p>
          {row.note && (
            <p className="mt-1.5 font-mono text-[0.78rem] text-white/30">{row.note}</p>
          )}
        </div>
      )}
    </div>
  )
}

// What is left in the transcript once the ticker has run its course.
function ScanReceipt({ rows }) {
  return (
    <p className="my-2 border-l border-emerald-400/40 pl-4 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400/80 sm:pl-5">
      {rows.length} values read · 0 permissions asked
    </p>
  )
}

export default function SecurityDemoChat({ open, onClose }) {
  const [shown, setShown] = useState([])
  const [queue, setQueue] = useState([])
  const [typing, setTyping] = useState('')
  const [rows, setRows] = useState([])
  const [scanning, setScanning] = useState(true)
  const [draft, setDraft] = useState('')
  const [taught, setTaught] = useState(false)
  const [scanLive, setScanLive] = useState(false)

  const inputRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const rowsRef = useRef([])

  rowsRef.current = rows

  const say = useCallback((items) => setQueue((q) => [...q, ...items]), [])

  // Preface, the haul, shrug — plus the lesson the first time through.
  const respond = useCallback(() => {
    say([
      { text: PREFACE },
      { kind: 'scan' },
      ...(taught ? [] : LESSON.map((text) => ({ text }))),
      { text: SIGNOFF, tone: 'sign' },
    ])
    setTaught(true)
  }, [say, taught])

  // Replay the script from the top each time the overlay is opened.
  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement
    setShown([])
    setQueue(OPENING)
    setTyping('')
    setDraft('')
    setTaught(false)
    setScanLive(false)
    setRows([])
    setScanning(true)

    let cancelled = false
    collectExposedData()
      .then((collected) => {
        if (cancelled) return
        setRows(collected)
        setScanning(false)
      })
      .catch(() => !cancelled && setScanning(false))

    return () => {
      cancelled = true
      restoreFocusRef.current?.focus?.()
    }
  }, [open])

  // Drains the queue one item at a time, typing text out character by
  // character. Each piece waits a full beat first, so the reply arrives in
  // separate hits rather than all at once.
  useEffect(() => {
    if (!open || !queue.length) return
    const [item, ...rest] = queue
    const advance = () => {
      setTyping('')
      setShown((s) => [...s, item])
      setQueue(rest)
    }

    // The visitor's own line gets the same treatment, just briefer.
    if (item.from === 'you') {
      const t = setTimeout(advance, YOU_BEAT_MS)
      return () => clearTimeout(t)
    }

    // Hold the scan until the values are in, then let the previous line have
    // its full beat before the ticker takes the stage.
    if (item.kind === 'scan') {
      if (scanning) return
      const ticker = Math.max(rowsRef.current.length, 1) * ROW_MS
      const begin = setTimeout(() => setScanLive(true), BEAT_MS)
      const done = setTimeout(() => {
        setScanLive(false)
        advance()
      }, BEAT_MS + ticker + 400)
      return () => {
        clearTimeout(begin)
        clearTimeout(done)
      }
    }

    const pause = item.fast ? OPENING_PAUSE_MS : BEAT_MS

    if (reducedMotion()) {
      const t = setTimeout(advance, pause)
      return () => clearTimeout(t)
    }

    let interval
    const step = item.text.length > 90 ? 2 : 1
    const start = setTimeout(() => {
      let i = 0
      interval = setInterval(() => {
        i += step
        if (i >= item.text.length) {
          clearInterval(interval)
          advance()
        } else {
          setTyping(item.text.slice(0, i))
        }
      }, CHAR_MS)
    }, pause)

    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [open, queue, scanning])

  // Escape closes; focus lands in the composer once the overlay is up.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 120)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      clearTimeout(focusTimer)
    }
  }, [open, onClose])

  const send = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    say([{ from: 'you', text }])
    respond()
  }

  if (!open) return null


  // Keyed by the item's eventual position, so a piece does not remount when
  // it finishes typing — only when the next piece takes over.
  const renderItem = (item, key, isTyping) => {
    if (item.kind === 'scan') return <ScanReceipt key={key} rows={rows} />

    if (item.from === 'you')
      return (
        <p
          key={key}
          className="animate-fade-in font-mono text-[1.25rem] leading-[1.7] tracking-[0.02em] text-white/40 sm:text-[1.55rem]"
        >
          <span className="text-white/25">&gt; </span>
          {item.text}
        </p>
      )

    const body = (
      <p
        className={`font-mono text-[1.25rem] leading-[1.7] tracking-[0.02em] sm:text-[1.65rem] ${
          item.tone === 'sign' ? 'text-white/45' : 'text-white/85'
        }`}
      >
        {isTyping ? typing : item.text}
        {isTyping && <Caret />}
      </p>
    )

    if (item.tone !== 'sign') {
      return (
        <div key={key} className="animate-fade-in">
          {body}
        </div>
      )
    }

    return (
      <div
        key={key}
        className="flex animate-fade-in flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6"
      >
        <Cat />
        {body}
      </div>
    )
  }

  const head = queue[0]
  const landed = shown[shown.length - 1]
  const ticking = head?.kind === 'scan' && scanLive
  // Something is queued but not yet on screen: show it thinking.
  const waiting = Boolean(head) && !typing && !ticking
  const stage = ticking ? (
    <LiveScan rows={rows} loading={scanning} />
  ) : typing && head ? (
    renderItem(head, `item-${shown.length}`, true)
  ) : landed ? (
    renderItem(landed, `item-${shown.length - 1}`, false)
  ) : null

  return (
    <div
      className="fixed inset-0 z-[1100] animate-fade-in bg-[#08080a]/85 backdrop-blur-xl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Simulation label — this must never read as a real intrusion */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 bg-gradient-to-b from-[#08080a] to-transparent px-6 pb-8 pt-5 sm:px-10">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.25em] text-amber-400/70">
          simulation · security awareness demo · nothing is stored or sent
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the demo"
          className="pointer-events-auto shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/80 focus-visible:text-white focus-visible:outline-none"
        >
          esc ✕
        </button>
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Security awareness demo"
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-24 sm:px-10 sm:py-28">
          {/* Exactly one piece on screen — each replaces the one before it */}
          <div className="flex min-h-[11rem] flex-col justify-center gap-5">
            {stage}
            {waiting && <Dots label={head.from === 'you' ? 'sending' : 'thinking'} />}
          </div>

          {/* Composer — no chrome, just a caret on the next line */}
          <form onSubmit={send} className="mt-1">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Ask about myself"
              autoComplete="off"
              className="w-full bg-transparent font-mono text-[1.25rem] leading-[1.7] tracking-[0.02em] text-white/85 caret-white focus:outline-none sm:text-[1.65rem]"
            />
          </form>

          <p className="mt-10 font-mono text-[0.68rem] uppercase tracking-[0.25em] text-white/20">
            alt + k to reopen · esc to close
          </p>
        </div>
      </div>
    </div>
  )
}
