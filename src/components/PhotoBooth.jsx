import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'grayscale', label: 'B&W', css: 'grayscale(100%)' },
  { id: 'sepia', label: 'Sepia', css: 'sepia(80%)' },
  { id: 'warm', label: 'Warm', css: 'saturate(1.3) hue-rotate(-10deg) brightness(1.05)' },
  { id: 'cool', label: 'Cool', css: 'saturate(0.9) hue-rotate(15deg) brightness(1.05)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(40%) contrast(1.1) brightness(0.95) saturate(1.2)' },
  { id: 'contrast', label: 'Contrast', css: 'contrast(1.4) brightness(1.05)' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.08) contrast(0.95) saturate(0.9)' },
]

const C = {
  dark: '#0a0a0a', surface: '#161616', accent: '#f97316',
  light: '#a3a3a3', white: '#ffffff',
}
const FONT = 'Inter, system-ui, sans-serif'
const MONO = '"JetBrains Mono", monospace'

function dateStamp() {
  const d = new Date()
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${d.getFullYear()}`
}

const CUSTOM_W = 800
const CUSTOM_H = 600

const SERIF = 'Georgia, "Times New Roman", serif'

function drawNoise(ctx, w, h, count = 4000, maxAlpha = 0.07) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * maxAlpha
    ctx.fillStyle = `rgba(80,50,10,${a})`
    ctx.fillRect(Math.random() * w | 0, Math.random() * h | 0, 1, 1)
  }
}

function drawSignature(ctx, w, h) {
  ctx.save()
  ctx.globalAlpha = 0.55
  // Small pill badge bottom-center
  const label = '© Christian Delapos'
  ctx.font = `600 8px ${MONO}`
  const tw = ctx.measureText(label).width
  const px = 10, bw = tw + px * 2, bh = 16
  const bx = (w - bw) / 2, by = h - bh - 8
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 8) : (ctx.rect(bx, by, bw, bh))
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(label, w / 2, by + 10.5)
  ctx.restore()
}

const WANTED_NAME_FONT = '"Times New Roman", "Times", serif'
const WANTED_BOUNTY_FONT = '"Book Antiqua", "Palatino Linotype", "Palatino", serif'

function drawWantedText(ctx, name, bounty, namePos, bountyPos) {
  ctx.fillStyle = '#1a0800'
  ctx.textAlign = 'center'

  const displayName = name.trim() ? name.toUpperCase() : 'UNKNOWN'
  let fs = 38
  ctx.font = `bold condensed ${fs}px ${WANTED_NAME_FONT}`
  while (ctx.measureText(displayName).width > 440 && fs > 14) {
    fs--; ctx.font = `bold condensed ${fs}px ${WANTED_NAME_FONT}`
  }
  ctx.fillText(displayName, namePos.x, namePos.y)

  const displayBounty = bounty.trim() ? bounty : '0'
  ctx.font = `bold 28px ${WANTED_BOUNTY_FONT}`
  ctx.fillText(`฿  ${displayBounty}-`, bountyPos.x, bountyPos.y)
}

// ── Wanted interactive preview ──
const WANTED_POSTER_W = 520
// Default: photo at slot top-left, taller than slot (face shows at top, excess clipped below)
const WANTED_PHOTO_DEFAULT = () => ({ x: 46, y: 113, w: 428, h: 308 })
const WANTED_NAME_DEFAULT = () => ({ x: 260, y: 538 })
const WANTED_BOUNTY_DEFAULT = () => ({ x: 260, y: 590 })

function WantedInteractivePreview({ photo, name, bounty, photoRect, setPhotoRect, namePos, setNamePos, bountyPos, setBountyPos }) {
  const containerRef = useRef(null)
  const [ds, setDs] = useState(1) // displayScale: poster-space → screen pixels

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setDs(el.offsetWidth / WANTED_POSTER_W)
    update()
    const ro = window.ResizeObserver ? new ResizeObserver(update) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  // Generic drag for text labels
  const startLabelDrag = (e, current, setter) => {
    if ('button' in e && e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const isTouch = !!e.touches
    const cx0 = isTouch ? e.touches[0].clientX : e.clientX
    const cy0 = isTouch ? e.touches[0].clientY : e.clientY
    const { x: x0, y: y0 } = current
    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY
      setter({ x: x0 + (cx - cx0) / ds, y: y0 + (cy - cy0) / ds })
    }
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', cleanup)
      window.removeEventListener('touchend', cleanup)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', cleanup)
    window.addEventListener('touchend', cleanup)
  }

  // Move photo (drag anywhere inside visible slot area)
  const startMove = (e) => {
    if ('button' in e && e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const isTouch = !!e.touches
    const cx0 = isTouch ? e.touches[0].clientX : e.clientX
    const cy0 = isTouch ? e.touches[0].clientY : e.clientY
    const { x, y, w, h } = photoRect
    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY
      setPhotoRect({ x: x + (cx - cx0) / ds, y: y + (cy - cy0) / ds, w, h })
    }
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', cleanup)
      window.removeEventListener('touchend', cleanup)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', cleanup)
    window.addEventListener('touchend', cleanup)
  }

  // Resize photo by corner
  const startResize = (e, corner) => {
    if ('button' in e && e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const isTouch = !!e.touches
    const cx0 = isTouch ? e.touches[0].clientX : e.clientX
    const cy0 = isTouch ? e.touches[0].clientY : e.clientY
    const { x, y, w, h } = photoRect
    const MIN = 60
    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY
      const dx = (cx - cx0) / ds, dy = (cy - cy0) / ds
      let nx = x, ny = y, nw = w, nh = h
      if (corner === 'br') { nw = Math.max(MIN, w + dx); nh = Math.max(MIN, h + dy) }
      else if (corner === 'bl') { nx = x + dx; nw = Math.max(MIN, w - dx); nh = Math.max(MIN, h + dy) }
      else if (corner === 'tr') { ny = y + dy; nw = Math.max(MIN, w + dx); nh = Math.max(MIN, h - dy) }
      else if (corner === 'tl') { nx = x + dx; ny = y + dy; nw = Math.max(MIN, w - dx); nh = Math.max(MIN, h - dy) }
      setPhotoRect({ x: nx, y: ny, w: nw, h: nh })
    }
    const cleanup = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', cleanup)
      window.removeEventListener('touchend', cleanup)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', cleanup)
    window.addEventListener('touchend', cleanup)
  }

  const displayName = name.trim() ? name.toUpperCase() : 'UNKNOWN'
  const displayBounty = bounty.trim() ? bounty : '0'
  const { x: rx, y: ry, w: rw, h: rh } = photoRect

  const textStyle = (pos, fontSize, fontFamily, stretch = 'condensed') => ({
    position: 'absolute',
    left: `${pos.x * ds}px`,
    top: `${pos.y * ds}px`,
    transform: 'translate(-50%, -50%)',
    cursor: 'grab',
    userSelect: 'none',
    fontFamily,
    fontWeight: 'bold',
    fontStretch: stretch,
    fontSize: `${fontSize * ds}px`,
    color: '#1a0800',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    zIndex: 3,
  })

  const CORNER_HANDLES = [
    { corner: 'tl', cx: rx,      cy: ry,      cursor: 'nwse-resize' },
    { corner: 'tr', cx: rx + rw, cy: ry,      cursor: 'nesw-resize' },
    { corner: 'bl', cx: rx,      cy: ry + rh, cursor: 'nesw-resize' },
    { corner: 'br', cx: rx + rw, cy: ry + rh, cursor: 'nwse-resize' },
  ]

  return (
    <div ref={containerRef} style={{ position: 'relative', lineHeight: 0, width: '100%', maxWidth: `${WANTED_POSTER_W}px` }}>
      {/* Poster background */}
      <img src="/wanted-bg.png" alt="" style={{ width: '100%', display: 'block', pointerEvents: 'none', userSelect: 'none' }} />

      {photo && (<>
        {/* Photo — free floating on top of poster, no clip */}
        <img
          src={photo} alt="" draggable={false}
          style={{
            position: 'absolute',
            left: `${rx * ds}px`, top: `${ry * ds}px`,
            width: `${rw * ds}px`, height: `${rh * ds}px`,
            pointerEvents: 'none', zIndex: 1,
          }}
        />

        {/* Drag-move overlay (full photo rect) */}
        <div
          title="Drag to move"
          onMouseDown={startMove}
          onTouchStart={startMove}
          style={{
            position: 'absolute',
            left: `${rx * ds}px`, top: `${ry * ds}px`,
            width: `${rw * ds}px`, height: `${rh * ds}px`,
            cursor: 'move', zIndex: 2,
          }}
        />

        {/* Corner resize handles at photo rect corners (outside slot clip) */}
        {CORNER_HANDLES.map(({ corner, cx, cy, cursor }) => (
          <div
            key={corner}
            title="Drag to resize"
            onMouseDown={(e) => startResize(e, corner)}
            onTouchStart={(e) => startResize(e, corner)}
            style={{
              position: 'absolute',
              left: `${cx * ds}px`, top: `${cy * ds}px`,
              width: `${12 * ds}px`, height: `${12 * ds}px`,
              transform: 'translate(-50%, -50%)',
              background: '#f97316',
              border: `${2 * ds}px solid #fff`,
              borderRadius: '50%',
              cursor, zIndex: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          />
        ))}
      </>)}

      {/* Draggable name */}
      <div
        title="Drag to reposition name"
        style={textStyle(namePos, 38, WANTED_NAME_FONT)}
        onMouseDown={(e) => startLabelDrag(e, namePos, setNamePos)}
        onTouchStart={(e) => startLabelDrag(e, namePos, setNamePos)}
      >
        {displayName}
      </div>

      {/* Draggable bounty */}
      <div
        title="Drag to reposition bounty"
        style={textStyle(bountyPos, 28, WANTED_BOUNTY_FONT, 'normal')}
        onMouseDown={(e) => startLabelDrag(e, bountyPos, setBountyPos)}
        onTouchStart={(e) => startLabelDrag(e, bountyPos, setBountyPos)}
      >
        ฿&nbsp;{displayBounty}-
      </div>

      {/* Hint bar */}
      <div style={{
        position: 'absolute', bottom: `${6 * ds}px`, left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: `${8 * ds}px`, padding: `${2 * ds}px ${6 * ds}px`,
        borderRadius: `${4 * ds}px`, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20,
      }}>
        Move photo · orange dots to resize · drag name &amp; bounty
      </div>
    </div>
  )
}

function drawWrappedText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y)
      y += lineH
      line = word
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
}

const TEMPLATES = [
  {
    id: 'single', label: 'Single', photos: 1, width: 640, height: 530, gap: 0,
    slots() { return [{ x: 24, y: 24, w: 592, h: 440 }] },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.accent; ctx.fillRect(0, 0, w, 3)
      ctx.font = `800 10px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = C.accent
      ctx.fillText('PB', 24, h - 14)
      ctx.fillStyle = '#d4d4d4'; ctx.font = `500 8px ${FONT}`; ctx.fillText('PHOTO BOOTH', 42, h - 14)
      ctx.fillStyle = C.light; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'
      ctx.fillText(dateStamp(), w - 24, h - 14)
    },
  },
  {
    id: 'duo', label: 'Duo', photos: 2, width: 680, height: 540, gap: 14,
    slots() {
      const py = 56, px = 24, g = 14, ph = 540 - 56 - 42, pw = (680 - px * 2 - g) / 2
      return [{ x: px, y: py, w: pw, h: ph }, { x: px + pw + g, y: py, w: pw, h: ph }]
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.accent; ctx.fillRect(0, 0, w, 2)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `700 10px ${FONT}`; ctx.textAlign = 'left'
      ctx.fillText('PHOTO BOOTH', 24, 36)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'
      ctx.fillText(dateStamp(), w - 24, 36)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.textAlign = 'center'
      ctx.fillText('capture the moment', w / 2, h - 12)
    },
  },
  {
    id: 'strip3', label: '3-Strip', photos: 3, width: 320, height: 1040, gap: 14,
    slots() {
      const px = 20, top = 64, bot = 44, g = 14, zone = 1040 - top - bot - 12
      const ph = (zone - g * 2) / 3, pw = 320 - px * 2
      return Array.from({ length: 3 }, (_, i) => ({ x: px, y: top + 6 + i * (ph + g), w: pw, h: ph }))
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.surface; ctx.fillRect(0, 0, w, 56)
      ctx.fillStyle = C.accent; ctx.font = `900 18px ${FONT}`; ctx.textAlign = 'center'
      ctx.fillText('PHOTO', w / 2, 24); ctx.fillText('BOOTH', w / 2, 44)
      ctx.fillRect(0, 54, w, 2)
      ctx.fillStyle = C.surface; ctx.fillRect(0, h - 36, w, 36)
      ctx.fillStyle = C.accent; ctx.font = `700 8px ${MONO}`; ctx.textAlign = 'left'; ctx.fillText('PB', 16, h - 14)
      ctx.fillStyle = C.light; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText(dateStamp(), w - 16, h - 14)
    },
  },
  {
    id: 'strip4', label: '4-Strip', photos: 4, width: 320, height: 1320, gap: 14,
    slots() {
      const px = 20, top = 64, bot = 44, g = 14, zone = 1320 - top - bot - 12
      const ph = (zone - g * 3) / 4, pw = 320 - px * 2
      return Array.from({ length: 4 }, (_, i) => ({ x: px, y: top + 6 + i * (ph + g), w: pw, h: ph }))
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, 52)
      ctx.fillStyle = C.white; ctx.font = `800 14px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('PHOTO BOOTH', w / 2, 32)
      ctx.fillStyle = C.dark; ctx.fillRect(0, h - 36, w, 36)
      ctx.fillStyle = C.accent; ctx.font = `700 8px ${MONO}`; ctx.textAlign = 'left'; ctx.fillText('PB', 16, h - 14)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText(dateStamp(), w - 16, h - 14)
    },
  },
  {
    id: 'classic', label: 'Classic', photos: 3, width: 680, height: 720, gap: 12,
    slots() {
      const px = 22, top = 52, bot = 40, g = 12, zone = 720 - top - bot
      const topH = (zone - g) * 0.6, botH = zone - topH - g, pw = 680 - px * 2, half = (pw - g) / 2
      return [
        { x: px, y: top, w: pw, h: topH },
        { x: px, y: top + topH + g, w: half, h: botH },
        { x: px + half + g, y: top + topH + g, w: half, h: botH },
      ]
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.accent; ctx.fillRect(0, 0, w, 3)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `700 11px ${FONT}`; ctx.textAlign = 'left'
      ctx.fillText('PHOTO BOOTH', 22, 32)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'
      ctx.fillText(dateStamp(), w - 22, 32)
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.textAlign = 'center'; ctx.fillText('capture the moment', w / 2, h - 12)
    },
  },
  {
    id: 'grid', label: '2×2', photos: 4, width: 680, height: 740, gap: 12,
    slots() {
      const px = 22, top = 56, bot = 44, g = 12, zone = 740 - top - bot
      const pw = (680 - px * 2 - g) / 2, ph = (zone - g) / 2
      return [
        { x: px, y: top, w: pw, h: ph }, { x: px + pw + g, y: top, w: pw, h: ph },
        { x: px, y: top + ph + g, w: pw, h: ph }, { x: px + pw + g, y: top + ph + g, w: pw, h: ph },
      ]
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, 46)
      ctx.fillStyle = C.accent; ctx.font = `800 12px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('PB', 22, 29)
      ctx.fillStyle = C.white; ctx.font = `600 11px ${FONT}`; ctx.fillText('PHOTO BOOTH', 44, 29)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'
      ctx.fillText(dateStamp(), w - 22, 29)
      ctx.fillStyle = '#d4d4d4'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'center'
      ctx.fillText('capture the moment', w / 2, h - 14)
    },
  },
  {
    id: 'feature', label: '1+3', photos: 4, width: 720, height: 720, gap: 12,
    slots() {
      const px = 22, top = 52, bot = 40, g = 12, zone = 720 - top - bot
      const leftW = (720 - px * 2 - g) * 0.55, rightW = 720 - px * 2 - g - leftW, rh = (zone - g * 2) / 3
      return [
        { x: px, y: top, w: leftW, h: zone },
        { x: px + leftW + g, y: top, w: rightW, h: rh },
        { x: px + leftW + g, y: top + rh + g, w: rightW, h: rh },
        { x: px + leftW + g, y: top + rh * 2 + g * 2, w: rightW, h: rh },
      ]
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.accent; ctx.fillRect(0, 0, w, 3)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `700 11px ${FONT}`; ctx.textAlign = 'left'
      ctx.fillText('PHOTO BOOTH', 22, 30)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'
      ctx.fillText('1.0', w - 22, 30)
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillText(dateStamp(), w - 22, h - 12)
    },
  },
  {
    id: 'triptych', label: 'Triptych', photos: 3, width: 760, height: 480, gap: 12,
    slots() {
      const px = 22, top = 50, bot = 40, g = 12, zone = 480 - top - bot
      const pw = (760 - px * 2 - g * 2) / 3
      return Array.from({ length: 3 }, (_, i) => ({ x: px + i * (pw + g), y: top, w: pw, h: zone }))
    },
    decorate(ctx, w, h) {
      ctx.fillStyle = C.dark; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = C.surface; ctx.fillRect(0, 0, w, 42)
      ctx.fillStyle = C.accent; ctx.font = `800 11px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('PB', 20, 26)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `600 11px ${FONT}`; ctx.fillText('PHOTO BOOTH', 42, 26)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText('1.0', w - 16, 26)
      ctx.fillStyle = C.surface; ctx.fillRect(0, h - 30, w, 30)
      ctx.fillStyle = C.accent; ctx.fillRect(0, h - 30, w, 2)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'center'
      ctx.fillText('capture the moment', w / 2, h - 10)
      ctx.textAlign = 'right'; ctx.fillText(dateStamp(), w - 16, h - 10)
    },
  },
  
  {
    // Image-backed template — decorate() returns a Promise
    id: 'wanted', label: 'Wanted', photos: 1, width: 520, height: 736, gap: 0,
    // Black area in original 1754×2481 image: ~x155,y380 → x1595,y1420
    // Mapped to 520×736 canvas:
    slots() { return [{ x: 46, y: 113, w: 428, h: 308 }] },
    decorate(ctx, w, h) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => { ctx.drawImage(img, 0, 0, w, h); resolve() }
        img.onerror = () => {
          // Fallback parchment if image fails to load
          ctx.fillStyle = '#c9b890'; ctx.fillRect(0, 0, w, h); resolve()
        }
        img.src = '/wanted-bg.png'
      })
    },
  },
  {
    id: 'newspaper', label: 'News', photos: 1, width: 680, height: 880, gap: 0,
    slots() { return [{ x: 30, y: 176, w: 620, h: 400 }] },
    decorate(ctx, w, h) {
      // Aged paper
      ctx.fillStyle = '#ede0bc'; ctx.fillRect(0, 0, w, h)
      const pg = ctx.createLinearGradient(0, 0, w, h)
      pg.addColorStop(0, 'rgba(200,150,50,0.1)'); pg.addColorStop(1, 'rgba(100,60,10,0.15)')
      ctx.fillStyle = pg; ctx.fillRect(0, 0, w, h)
      drawNoise(ctx, w, h, 6000, 0.05)
      // Edge burn
      const eg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h))
      eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(80,45,5,0.22)')
      ctx.fillStyle = eg; ctx.fillRect(0, 0, w, h)
      // Masthead box
      ctx.fillStyle = '#1a0d00'; ctx.fillRect(0, 0, w, 28)
      ctx.fillStyle = '#ede0bc'; ctx.font = `bold 11px ${SERIF}`; ctx.textAlign = 'left'
      ctx.fillText(`VOL. I  ·  NO. 1`, 16, 19)
      ctx.textAlign = 'right'
      ctx.fillText(`ESTABLISHED ${new Date().getFullYear()}  ·  SPECIAL EDITION`, w - 16, 19)
      // Paper name
      ctx.fillStyle = '#1a0d00'
      ctx.font = `bold 54px ${SERIF}`; ctx.textAlign = 'center'
      ctx.fillText('THE DAILY SNAP', w / 2, 85)
      // Rule lines
      ctx.strokeStyle = '#1a0d00'
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(16, 94); ctx.lineTo(w - 16, 94); ctx.stroke()
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(16, 100); ctx.lineTo(w - 16, 100); ctx.stroke()
      // Date + tagline row
      ctx.fillStyle = '#1a0d00'; ctx.font = `500 10px ${SERIF}`; ctx.textAlign = 'left'
      ctx.fillText(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 16, 116)
      ctx.textAlign = 'right'; ctx.fillText('"All the News That\'s Fit to Snap"', w - 16, 116)
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16, 122); ctx.lineTo(w - 16, 122); ctx.stroke()
      // Headline
      ctx.fillStyle = '#1a0d00'; ctx.font = `bold 30px ${SERIF}`; ctx.textAlign = 'center'
      ctx.fillText('CAPTURED: SENSATIONAL PHOTO SURFACES', w / 2, 152)
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16, 160); ctx.lineTo(w - 16, 160); ctx.stroke()
      // Photo caption row (below photo slot at y=176+400=576)
      const photoBottom = 576
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(16, photoBottom + 8); ctx.lineTo(w - 16, photoBottom + 8); ctx.stroke()
      // Caption
      ctx.fillStyle = '#1a0d00'; ctx.font = `italic 10px ${SERIF}`; ctx.textAlign = 'center'
      ctx.fillText('PHOTO: Our photographer on the scene captured this remarkable image.', w / 2, photoBottom + 22)
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16, photoBottom + 28); ctx.lineTo(w - 16, photoBottom + 28); ctx.stroke()
      // Column divider
      const colX = w / 2
      ctx.lineWidth = 0.75
      ctx.beginPath(); ctx.moveTo(colX, photoBottom + 36); ctx.lineTo(colX, h - 28); ctx.stroke()
      // Article text — left column
      ctx.fillStyle = '#1a0d00'; ctx.font = `500 9.5px ${SERIF}`; ctx.textAlign = 'left'
      const leftText = 'Sources close to the scene confirm this extraordinary photograph has captured the attention of readers worldwide. Witnesses gathered from all corners to observe what many are calling a once-in-a-lifetime moment. The photographer, who wishes to remain anonymous, stated the lighting was simply perfect. Our editors have since verified the authenticity of the image and stand behind its publication in full.'
      drawWrappedText(ctx, leftText, 20, photoBottom + 50, colX - 30, 14)
      // Article text — right column
      const rightText = 'City officials have yet to issue a formal statement regarding the photograph, though rumours suggest a press conference is forthcoming. Local residents continue to share their reactions, with many describing the scene as nothing short of iconic. The Daily Snap will continue to follow this story as it develops. Further details are expected to emerge in the days ahead as more witnesses come forward with their accounts.'
      drawWrappedText(ctx, rightText, colX + 10, photoBottom + 50, colX - 30, 14)
      // Footer rule
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16, h - 24); ctx.lineTo(w - 16, h - 24); ctx.stroke()
      ctx.fillStyle = '#1a0d00'; ctx.font = `bold 9px ${SERIF}`; ctx.textAlign = 'center'
      ctx.fillText('THE DAILY SNAP  ·  PUBLISHED DAILY  ·  ALL RIGHTS RESERVED', w / 2, h - 10)
    },
  },
  {
    id: 'custom', label: 'Custom', photos: 999, width: CUSTOM_W, height: CUSTOM_H, gap: 0,
    slots() {
      return [
        { x: 20, y: 20, w: 370, h: 260 },
        { x: 410, y: 60, w: 200, h: 140 },
        { x: 60, y: 320, w: 280, h: 180 },
      ]
    },
    decorate() {},
  },
]

function coverCrop(img, rect, ctx) {
  const nw = img.naturalWidth || img.width
  const nh = img.naturalHeight || img.height
  const imgAspect = nw / nh
  const targetAspect = rect.w / rect.h
  let sx = 0, sy = 0, sw = nw, sh = nh
  if (imgAspect > targetAspect) { sw = nh * targetAspect; sx = (nw - sw) / 2 }
  else { sh = nw / targetAspect; sy = (nh - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function PhotoBooth({ open, onClose }) {
  const [stage, setStage] = useState('idle')
  const [countdown, setCountdown] = useState(3)
  const [activeFilter, setActiveFilter] = useState('none')
  const [activeTemplate, setActiveTemplate] = useState('single')
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [facingMode, setFacingMode] = useState('user')
  const [hasMultipleCams, setHasMultipleCams] = useState(false)
  const [isVirtualCam, setIsVirtualCam] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [zoom, setZoom] = useState(1)
  const [customItems, setCustomItems] = useState([])
  const [wantedName, setWantedName] = useState('')
  const [wantedBounty, setWantedBounty] = useState('500,000,000')
  const [wantedPhotoRect, setWantedPhotoRect] = useState(WANTED_PHOTO_DEFAULT)
  const [wantedNamePos, setWantedNamePos] = useState(WANTED_NAME_DEFAULT)
  const [wantedBountyPos, setWantedBountyPos] = useState(WANTED_BOUNTY_DEFAULT)

  const videoRef = useRef(null)
  const captureCanvasRef = useRef(null)
  const compositeCanvasRef = useRef(null)
  const customCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const prevOpenRef = useRef(false)

  const isCustom = activeTemplate === 'custom'
  const currentFilter = FILTERS.find((f) => f.id === activeFilter) || FILTERS[0]
  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplate) || TEMPLATES[0]
  const photosNeeded = currentTemplate.photos
  const allCaptured = capturedPhotos.length >= photosNeeded
  const showCamera = stage !== 'review' && stage !== 'custom-edit' && stage !== 'error'

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const applyNativeZoom = useCallback(async (z) => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const caps = track.getCapabilities?.()
    if (caps?.zoom) {
      const clamped = Math.min(Math.max(z, caps.zoom.min), caps.zoom.max)
      try { await track.applyConstraints({ advanced: [{ zoom: clamped }] }) } catch {}
    }
  }, [])

  const startCamera = useCallback(async (facing) => {
    stopStream()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStage('idle')
      setErrorMessage('')
      setZoom(1)

      const devices = await navigator.mediaDevices.enumerateDevices()
      setHasMultipleCams(devices.filter((d) => d.kind === 'videoinput').length > 1)

      const track = stream.getVideoTracks()[0]
      const label = (track?.label || '').toLowerCase()
      setIsVirtualCam(/iriun|virtual|obs|droidcam|epoccam|snap cam/.test(label))
    } catch (err) {
      setStage('error')
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Camera access was denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('No camera detected. Photo Booth requires a camera.')
      } else {
        setErrorMessage('Could not access the camera. Make sure you are on HTTPS.')
      }
    }
  }, [stopStream])

  const handleZoomChange = useCallback((z) => {
    setZoom(z)
    applyNativeZoom(z)
  }, [applyNativeZoom])

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStage('error')
        setErrorMessage('Photo Booth requires a modern browser with HTTPS.')
      } else {
        setCapturedPhotos([])
        setCustomItems([])
        setActiveFilter('none')
        startCamera(facingMode)
      }
    }
    if (!open && prevOpenRef.current) {
      stopStream()
      setStage('idle')
      setCapturedPhotos([])
      setCustomItems([])
      window.clearTimeout(countdownTimerRef.current)
    }
    prevOpenRef.current = open
  }, [open, facingMode, startCamera, stopStream])

  useEffect(() => () => {
    stopStream()
    window.clearTimeout(countdownTimerRef.current)
  }, [stopStream])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = captureCanvasRef.current
    if (!video || !canvas) return null
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.filter = currentFilter.css
    if (facingMode === 'user' && !isVirtualCam) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.filter = 'none'
    return canvas.toDataURL('image/png')
  }, [currentFilter, facingMode, isVirtualCam])

  const startCountdown = useCallback(() => {
    setStage('countdown')
    setCountdown(3)
    let count = 3
    const tick = () => {
      count -= 1
      if (count > 0) {
        setCountdown(count)
        countdownTimerRef.current = window.setTimeout(tick, 1000)
      } else {
        setStage('flash')
        countdownTimerRef.current = window.setTimeout(() => {
          const dataUrl = captureFrame()
          if (dataUrl) {
            if (isCustom) {
              setCustomItems((prev) => {
                const col = prev.length % 3
                const row = Math.floor(prev.length / 3)
                return [...prev, {
                  id: Date.now(), src: dataUrl,
                  x: 20 + col * 270, y: 20 + row * 200,
                  w: 250, h: 180, rotation: 0,
                }]
              })
              setStage('idle')
            } else {
              setCapturedPhotos((prev) => {
                const next = [...prev, dataUrl]
                setStage(next.length >= photosNeeded ? 'review' : 'idle')
                return next
              })
            }
          } else {
            setStage('idle')
          }
        }, 300)
      }
    }
    countdownTimerRef.current = window.setTimeout(tick, 1000)
  }, [captureFrame, photosNeeded, isCustom])

  const compositeResult = useCallback(async () => {
    const canvas = compositeCanvasRef.current
    if (!canvas || capturedPhotos.length === 0) return
    const tpl = currentTemplate
    canvas.width = tpl.width; canvas.height = tpl.height
    const ctx = canvas.getContext('2d')
    // decorate() may return a Promise (e.g. image-backed templates)
    await Promise.resolve(tpl.decorate(ctx, tpl.width, tpl.height))
    const photoSlots = tpl.slots()
    const draws = photoSlots.map((slot, i) => {
      if (!capturedPhotos[i]) return Promise.resolve()
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          ctx.save()
          if (tpl.id === 'wanted') {
            // Free-floating: draw photo at user-defined rect with no clip
            ctx.drawImage(img, wantedPhotoRect.x, wantedPhotoRect.y, wantedPhotoRect.w, wantedPhotoRect.h)
          } else {
            roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 8)
            ctx.clip()
            coverCrop(img, slot, ctx)
          }
          ctx.restore()
          resolve()
        }
        img.onerror = resolve
        img.src = capturedPhotos[i]
      })
    })
    await Promise.all(draws)
    if (tpl.id === 'wanted') drawWantedText(ctx, wantedName, wantedBounty, wantedNamePos, wantedBountyPos)
    drawSignature(ctx, tpl.width, tpl.height)
  }, [capturedPhotos, currentTemplate, wantedName, wantedBounty, wantedPhotoRect, wantedNamePos, wantedBountyPos])

  useEffect(() => {
    // Wanted uses the interactive preview — composite happens at download time
    if (stage === 'review' && allCaptured && !isCustom && currentTemplate.id !== 'wanted') compositeResult()
  }, [stage, allCaptured, compositeResult, isCustom, currentTemplate])

  const handleDownload = useCallback(async () => {
    const canvas = compositeCanvasRef.current
    if (!canvas) return
    // Wanted: composite with final user positions right before download
    if (currentTemplate.id === 'wanted') await compositeResult()
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `photobooth-${currentTemplate.id}.png`; a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [currentTemplate, compositeResult])

  const handleCustomDownload = useCallback(async () => {
    const canvas = customCanvasRef.current
    if (!canvas || customItems.length === 0) return
    canvas.width = CUSTOM_W; canvas.height = CUSTOM_H
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = C.dark; ctx.fillRect(0, 0, CUSTOM_W, CUSTOM_H)

    for (const item of customItems) {
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          ctx.save()
          ctx.translate(item.x + item.w / 2, item.y + item.h / 2)
          ctx.rotate((item.rotation * Math.PI) / 180)
          ctx.drawImage(img, -item.w / 2, -item.h / 2, item.w, item.h)
          ctx.restore()
          resolve()
        }
        img.onerror = resolve
        img.src = item.src
      })
    }

    ctx.fillStyle = C.accent; ctx.fillRect(0, 0, CUSTOM_W, 3)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `700 11px ${FONT}`; ctx.textAlign = 'left'
    ctx.fillText('PHOTO BOOTH', 20, CUSTOM_H - 14)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = `500 8px ${MONO}`; ctx.textAlign = 'right'
    ctx.fillText(dateStamp(), CUSTOM_W - 20, CUSTOM_H - 14)
    drawSignature(ctx, CUSTOM_W, CUSTOM_H)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'photobooth-custom.png'; a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [customItems])

  const handleRetake = useCallback(() => {
    setCapturedPhotos([]); setCustomItems([]); setStage('idle')
  }, [])

  const handleFlipCamera = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next); startCamera(next)
  }, [facingMode, startCamera])

  const handleTemplateChange = useCallback((id) => {
    setActiveTemplate(id); setCapturedPhotos([]); setCustomItems([])
    if (stage === 'review' || stage === 'custom-edit') setStage('idle')
  }, [stage])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Photo Booth"
    >
      <div className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-bg-card lg:h-[92dvh] lg:max-h-[800px] lg:rounded-2xl lg:border lg:border-border lg:shadow-[0_25px_80px_-12px_rgba(0,0,0,0.6)]">

        {/* Header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-gradient-to-r from-bg-card to-bg-alt px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-sm">
              <Icon name="camera-outline" className="text-lg text-white" />
            </span>
            <div>
              <h2 className="font-sans text-sm font-bold text-text">Photo Booth</h2>
              {stage === 'idle' && isCustom && customItems.length > 0 && (
                <p className="font-mono text-[10px] text-text-mid">{customItems.length} photo{customItems.length !== 1 ? 's' : ''} captured</p>
              )}
              {stage === 'idle' && !isCustom && photosNeeded > 1 && (
                <p className="font-mono text-[10px] text-text-mid">Photo {capturedPhotos.length + 1} of {photosNeeded}</p>
              )}
              {stage === 'custom-edit' && (
                <p className="font-mono text-[10px] text-text-mid">Drag · Resize · Rotate</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'custom-edit' && (
              <button
                onClick={() => setStage('idle')}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] font-semibold text-text-mid transition-all hover:bg-bg-alt hover:text-text"
              >
                <Icon name="camera-outline" className="text-xs" />
                Camera
              </button>
            )}
            {hasMultipleCams && showCamera && (
              <button onClick={handleFlipCamera}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-mid transition-all hover:bg-bg-alt hover:text-text"
                aria-label="Flip camera">
                <Icon name="camera-reverse-outline" className="text-sm" />
              </button>
            )}
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-mid transition-all hover:bg-bg-alt hover:text-text"
              aria-label="Close">
              <Icon name="close-outline" className="text-base" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

          {/* Viewfinder / Editor */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/95">
            {stage === 'error' ? (
              <div className="flex flex-col items-center gap-5 px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                  <Icon name="camera-outline" className="text-4xl text-white/30" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">Camera unavailable</p>
                  <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/50">{errorMessage}</p>
                </div>
                <button onClick={() => startCamera(facingMode)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110">
                  <Icon name="refresh-outline" className="text-sm" />
                  Try Again
                </button>
              </div>
            ) : stage === 'custom-edit' ? (
              <div className="h-full w-full p-4">
                <CustomEditor items={customItems} onChange={setCustomItems} />
              </div>
            ) : stage === 'review' && allCaptured ? (
              <>
                {/* Canvas: hidden for wanted (composited at download time), visible for all others */}
                <canvas
                  ref={compositeCanvasRef}
                  className={currentTemplate.id === 'wanted' ? 'hidden' : 'max-h-full max-w-full object-contain p-4'}
                />
                {currentTemplate.id === 'wanted' && (
                  <div className="h-full w-full flex items-center justify-center p-4 overflow-auto">
                    <WantedInteractivePreview
                      photo={capturedPhotos[0]}
                      name={wantedName}
                      bounty={wantedBounty}
                      photoRect={wantedPhotoRect}
                      setPhotoRect={setWantedPhotoRect}
                      namePos={wantedNamePos}
                      setNamePos={setWantedNamePos}
                      bountyPos={wantedBountyPos}
                      setBountyPos={setWantedBountyPos}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="h-full w-full overflow-hidden flex items-center justify-center">
                  <video
                    ref={(el) => {
                      videoRef.current = el
                      if (el && streamRef.current) el.srcObject = streamRef.current
                    }}
                    autoPlay playsInline muted
                    className="h-full w-full object-contain"
                    style={{
                      filter: currentFilter.css,
                      transform: `${facingMode === 'user' && !isVirtualCam ? 'scaleX(-1) ' : ''}scale(${zoom})`,
                      transition: 'transform 0.1s ease-out',
                    }}
                    aria-label="Camera preview"
                  />
                </div>

                {/* Preset thumbnail strip */}
                {!isCustom && photosNeeded > 1 && capturedPhotos.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {capturedPhotos.map((src, i) => (
                      <img key={i} src={src} alt={`Photo ${i + 1}`}
                        className="h-14 w-14 rounded-lg border-2 border-white/90 object-cover shadow-lg" />
                    ))}
                    {Array.from({ length: photosNeeded - capturedPhotos.length }, (_, i) => (
                      <div key={`e-${i}`}
                        className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed border-white/30 bg-white/5">
                        <span className="font-mono text-[9px] text-white/30">{capturedPhotos.length + i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom thumbnail strip */}
                {isCustom && customItems.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex gap-2 max-w-[calc(100%-2rem)] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {customItems.map((item, i) => (
                      <img key={item.id} src={item.src} alt={`Photo ${i + 1}`}
                        className="h-12 w-12 flex-shrink-0 rounded-lg border-2 border-white/70 object-cover shadow-lg" />
                    ))}
                  </div>
                )}
              </>
            )}

            {stage === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <span key={countdown} className="pb-countdown-number font-sans text-9xl font-black text-white drop-shadow-[0_4px_24px_rgba(249,115,22,0.5)]">
                  {countdown}
                </span>
              </div>
            )}
            {stage === 'flash' && <div className="pb-flash absolute inset-0 bg-white" />}
          </div>

          {/* Sidebar */}
          <div className="flex w-full flex-shrink-0 flex-col border-t border-border bg-bg-card lg:w-72 lg:border-l lg:border-t-0">
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 lg:p-5" style={{ scrollbarWidth: 'thin' }}>

              {/* Filters */}
              {stage !== 'custom-edit' && (
                <div>
                  <h3 className="mb-2.5 flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-text-mid">
                    <Icon name="color-palette-outline" className="text-xs text-brand" />
                    Filters
                  </h3>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible" style={{ scrollbarWidth: 'none' }}>
                    {FILTERS.map((f) => (
                      <button key={f.id} onClick={() => setActiveFilter(f.id)}
                        className={`flex-shrink-0 rounded-lg border px-3 py-1.5 font-mono text-[10px] font-semibold transition-all ${
                          activeFilter === f.id
                            ? 'border-brand bg-brand/10 text-brand shadow-sm shadow-brand/10'
                            : 'border-border bg-bg-alt text-text-mid hover:border-text-light hover:text-text'
                        }`}
                        aria-pressed={activeFilter === f.id}
                      >{f.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Zoom */}
              {showCamera && (
                <div>
                  <h3 className="mb-2.5 flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-text-mid">
                    <Icon name="search-outline" className="text-xs text-brand" />
                    Zoom · {zoom.toFixed(1)}×
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleZoomChange(Math.max(1, parseFloat((zoom - 0.25).toFixed(2))))}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border text-text-mid transition-all hover:bg-bg-alt hover:text-text"
                      aria-label="Zoom out"
                    >
                      <Icon name="remove-outline" className="text-xs" />
                    </button>
                    <input
                      type="range" min="1" max="4" step="0.1"
                      value={zoom}
                      onChange={(e) => handleZoomChange(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border"
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    <button
                      onClick={() => handleZoomChange(Math.min(4, parseFloat((zoom + 0.25).toFixed(2))))}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border text-text-mid transition-all hover:bg-bg-alt hover:text-text"
                      aria-label="Zoom in"
                    >
                      <Icon name="add-outline" className="text-xs" />
                    </button>
                  </div>
                </div>
              )}

              {/* Layout picker */}
              {stage !== 'custom-edit' && stage !== 'review' && (
                <div>
                  <h3 className="mb-2.5 flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-text-mid">
                    <Icon name="image-outline" className="text-xs text-brand" />
                    Layout
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-3">
                    {TEMPLATES.map((t) => (
                      <button key={t.id} onClick={() => handleTemplateChange(t.id)}
                        className={`group/tpl flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                          activeTemplate === t.id
                            ? 'border-brand bg-brand/10 shadow-sm shadow-brand/10'
                            : 'border-border bg-bg-alt hover:border-text-light'
                        }`}
                        aria-pressed={activeTemplate === t.id}
                      >
                        {t.id === 'custom' ? (
                          <div className={`flex h-9 w-9 items-center justify-center ${activeTemplate === t.id ? 'text-brand' : 'text-text-light'}`}>
                            <Icon name="grid-outline" className="text-xl" />
                          </div>
                        ) : t.id === 'wanted' ? (
                          <div className={`flex h-9 w-9 items-center justify-center rounded text-[9px] font-black leading-none ${activeTemplate === t.id ? 'text-brand' : 'text-text-light'}`}
                            style={{ fontFamily: 'Georgia,serif', letterSpacing: '-0.5px' }}>
                            WNT
                          </div>
                        ) : t.id === 'newspaper' ? (
                          <div className={`flex h-9 w-9 items-center justify-center rounded text-[9px] font-black leading-none ${activeTemplate === t.id ? 'text-brand' : 'text-text-light'}`}
                            style={{ fontFamily: 'Georgia,serif', letterSpacing: '-0.5px' }}>
                            NWS
                          </div>
                        ) : (
                          <TemplateIcon template={t} active={activeTemplate === t.id} />
                        )}
                        <span className={`font-mono text-[8px] font-bold ${activeTemplate === t.id ? 'text-brand' : 'text-text-light'}`}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {isCustom && (
                    <p className="mt-2 font-mono text-[10px] leading-relaxed text-text-light">
                      Take any number of photos then arrange them freely.
                    </p>
                  )}
                </div>
              )}

              {/* Wanted poster inputs */}
              {activeTemplate === 'wanted' && stage !== 'custom-edit' && (
                <div>
                  <h3 className="mb-2.5 flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-text-mid">
                    <Icon name="person-outline" className="text-xs text-brand" />
                    Poster Details
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="mb-1 block font-mono text-[9px] font-semibold uppercase tracking-wider text-text-light">Name</label>
                      <input
                        type="text"
                        value={wantedName}
                        onChange={(e) => setWantedName(e.target.value)}
                        placeholder="e.g. MONKEY · D · LUFFY"
                        maxLength={30}
                        className="w-full rounded-lg border border-border bg-bg-alt px-3 py-2 font-mono text-[11px] text-text placeholder:text-text-light focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[9px] font-semibold uppercase tracking-wider text-text-light">Bounty (฿)</label>
                      <input
                        type="text"
                        value={wantedBounty}
                        onChange={(e) => setWantedBounty(e.target.value)}
                        placeholder="500,000,000"
                        maxLength={20}
                        className="w-full rounded-lg border border-border bg-bg-alt px-3 py-2 font-mono text-[11px] text-text placeholder:text-text-light focus:border-brand focus:outline-none"
                      />
                    </div>
                    {stage === 'review' && (
                      <button
                        onClick={() => { setWantedPhotoRect(WANTED_PHOTO_DEFAULT); setWantedNamePos(WANTED_NAME_DEFAULT); setWantedBountyPos(WANTED_BOUNTY_DEFAULT) }}
                        className="w-full rounded-lg border border-border py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-text-light transition hover:border-brand hover:text-brand"
                      >
                        Reset positions
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Custom editor hints */}
              {stage === 'custom-edit' && (
                <div className="space-y-1.5">
                  <h3 className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-wider text-text-mid">
                    <Icon name="move-outline" className="text-xs text-brand" />
                    Edit Layout
                  </h3>
                  {[
                    ['aperture-outline', 'Drag photo to move'],
                    ['resize-outline', 'Orange corner to resize'],
                    ['refresh-outline', 'White dot to rotate'],
                    ['close-circle-outline', 'Red × to delete'],
                  ].map(([icon, label]) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon name={icon} className="text-xs text-brand" />
                      <span className="font-mono text-[10px] text-text-light">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t border-border p-4 lg:p-5">

              {stage === 'idle' && !isCustom && !allCaptured && (
                <button onClick={startCountdown}
                  className="pb-capture-ring flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] active:scale-95"
                  aria-label={photosNeeded > 1 ? `Take photo ${capturedPhotos.length + 1} of ${photosNeeded}` : 'Take photo'}
                >
                  <Icon name="aperture-outline" className="text-lg" />
                  {photosNeeded > 1 ? `Capture ${capturedPhotos.length + 1} of ${photosNeeded}` : 'Capture'}
                </button>
              )}

              {stage === 'idle' && isCustom && (
                <>
                  <button onClick={startCountdown}
                    className="pb-capture-ring flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] active:scale-95"
                  >
                    <Icon name="aperture-outline" className="text-lg" />
                    {customItems.length === 0 ? 'Take Photo' : 'Add Another'}
                  </button>
                  {customItems.length > 0 && (
                    <button onClick={() => setStage('custom-edit')}
                      className="flex items-center justify-center gap-2 rounded-full border border-brand px-5 py-2.5 font-sans text-xs font-semibold text-brand transition-all hover:bg-brand/10"
                    >
                      <Icon name="color-wand-outline" className="text-sm" />
                      Edit Layout ({customItems.length})
                    </button>
                  )}
                </>
              )}

              {stage === 'review' && allCaptured && !isCustom && (
                <>
                  <button onClick={handleDownload}
                    className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] active:scale-95"
                  >
                    <Icon name="download-outline" className="text-lg" />
                    Download
                  </button>
                  <button onClick={handleRetake}
                    className="flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 font-sans text-xs font-semibold text-text transition-all hover:bg-bg-alt"
                  >
                    <Icon name="refresh-outline" className="text-sm" />
                    Retake
                  </button>
                </>
              )}

              {stage === 'custom-edit' && (
                <>
                  <button onClick={handleCustomDownload}
                    className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 font-sans text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] active:scale-95"
                  >
                    <Icon name="download-outline" className="text-lg" />
                    Download
                  </button>
                  <button onClick={handleRetake}
                    className="flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 font-sans text-xs font-semibold text-text transition-all hover:bg-bg-alt"
                  >
                    <Icon name="refresh-outline" className="text-sm" />
                    Start Over
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <canvas ref={captureCanvasRef} className="hidden" />
        <canvas ref={customCanvasRef} className="hidden" />
      </div>
    </div>
  )
}

function CustomEditor({ items, onChange }) {
  const [selected, setSelected] = useState(null)
  const containerRef = useRef(null)

  const getScale = () =>
    containerRef.current ? containerRef.current.clientWidth / CUSTOM_W : 1

  const startInteraction = (e, id, type) => {
    e.stopPropagation()
    e.preventDefault()
    setSelected(id)

    const isTouch = !!e.touches
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    const clientY = isTouch ? e.touches[0].clientY : e.clientY
    const item = items.find((it) => it.id === id)
    if (!item) return
    const startItem = { ...item }
    const scale = getScale()
    const containerRect = containerRef.current?.getBoundingClientRect()

    const onMove = (ev) => {
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY
      const dx = (mx - clientX) / scale
      const dy = (my - clientY) / scale

      onChange((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it
          if (type === 'move') return { ...it, x: startItem.x + dx, y: startItem.y + dy }
          if (type === 'resize') return { ...it, w: Math.max(60, startItem.w + dx), h: Math.max(45, startItem.h + dy) }
          if (type === 'rotate' && containerRect) {
            const cx = containerRect.left + (startItem.x + startItem.w / 2) * scale
            const cy = containerRect.top + (startItem.y + startItem.h / 2) * scale
            const angle = Math.atan2(my - cy, mx - cx) * (180 / Math.PI) + 90
            return { ...it, rotation: angle }
          }
          return it
        })
      )
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }

  const removeItem = (e, id) => {
    e.stopPropagation()
    onChange((prev) => prev.filter((it) => it.id !== id))
    if (selected === id) setSelected(null)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl bg-[#0a0a0a]"
      style={{ aspectRatio: `${CUSTOM_W}/${CUSTOM_H}` }}
      onClick={() => setSelected(null)}
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {items.map((item) => {
        const isSelected = selected === item.id
        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: `${(item.x / CUSTOM_W) * 100}%`,
              top: `${(item.y / CUSTOM_H) * 100}%`,
              width: `${(item.w / CUSTOM_W) * 100}%`,
              height: `${(item.h / CUSTOM_H) * 100}%`,
              transform: `rotate(${item.rotation}deg)`,
              transformOrigin: 'center center',
              cursor: 'move',
              zIndex: isSelected ? 10 : 1,
            }}
            onMouseDown={(e) => startInteraction(e, item.id, 'move')}
            onTouchStart={(e) => startInteraction(e, item.id, 'move')}
            onClick={(e) => { e.stopPropagation(); setSelected(item.id) }}
          >
            <img src={item.src} className="h-full w-full rounded object-cover" draggable={false} />

            {isSelected && (
              <div className="pointer-events-none absolute inset-0 rounded ring-2 ring-brand ring-offset-1 ring-offset-black/50" />
            )}

            {isSelected && (
              <>
                {/* Delete */}
                <button
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600"
                  style={{ zIndex: 20 }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => removeItem(e, item.id)}
                >
                  <Icon name="close-outline" className="text-[9px]" />
                </button>

                {/* Resize — bottom-right */}
                <div
                  className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full bg-brand shadow-lg ring-2 ring-white/60"
                  style={{ zIndex: 20 }}
                  onMouseDown={(e) => { e.stopPropagation(); startInteraction(e, item.id, 'resize') }}
                  onTouchStart={(e) => { e.stopPropagation(); startInteraction(e, item.id, 'resize') }}
                />

                {/* Rotate — top-center */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                  style={{ top: '-26px', zIndex: 20, cursor: 'grab' }}
                  onMouseDown={(e) => { e.stopPropagation(); startInteraction(e, item.id, 'rotate') }}
                  onTouchStart={(e) => { e.stopPropagation(); startInteraction(e, item.id, 'rotate') }}
                >
                  <div className="h-4 w-4 rounded-full bg-white shadow-lg ring-2 ring-brand" />
                  <div className="h-3 w-px bg-brand/50" />
                </div>
              </>
            )}
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-xs text-white/20">No photos — go back to camera</p>
        </div>
      )}
    </div>
  )
}

function TemplateIcon({ template, active }) {
  const fg = active ? 'var(--brand)' : 'var(--text-light)'
  const bgFill = active ? 'rgba(249,115,22,0.08)' : 'rgba(128,128,128,0.06)'
  const t = template
  const slots = t.slots()
  const s = 36 / Math.max(t.width, t.height)
  const vw = Math.round(t.width * s)
  const vh = Math.round(t.height * s)
  return (
    <svg width={vw} height={vh} viewBox={`0 0 ${t.width} ${t.height}`} fill="none">
      <rect width={t.width} height={t.height} rx={16} fill={bgFill} />
      {slots.map((sl, i) => (
        <rect key={i} x={sl.x} y={sl.y} width={sl.w} height={sl.h} rx={8}
          stroke={fg} strokeWidth={t.width > 400 ? 12 : 8} fill="none" />
      ))}
    </svg>
  )
}
