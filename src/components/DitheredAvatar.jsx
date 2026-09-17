import { useEffect, useRef } from 'react'

export default function DitheredAvatar({
  src,
  hoverSrc,
  alt = 'Profile',
  width = 280,
  height = 320,
  className = '',
}) {
  const canvasRef = useRef(null)
  const hoverCanvasRef = useRef(null)

  const renderDither = (canvas, imageSrc) => {
    if (!canvas || !imageSrc) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageSrc

    img.onload = () => {
      // Internal rendering resolution (crisp dot-pitch)
      const renderW = Math.round(width * 0.95)
      const renderH = Math.round(height * 0.95)

      canvas.width = renderW
      canvas.height = renderH

      // Cover crop math
      const nw = img.naturalWidth || renderW
      const nh = img.naturalHeight || renderH
      const imgAspect = nw / nh
      const targetAspect = renderW / renderH

      let sx = 0, sy = 0, sw = nw, sh = nh
      if (imgAspect > targetAspect) {
        sw = nh * targetAspect
        sx = (nw - sw) / 2
      } else {
        sh = nw / targetAspect
        sy = (nh - sh) * 0.15 // Slight top bias to frame the head & shoulders
      }

      ctx.clearRect(0, 0, renderW, renderH)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, renderW, renderH)

      const imgData = ctx.getImageData(0, 0, renderW, renderH)
      const data = imgData.data
      const buffer = new Float32Array(renderW * renderH)

      // Convert to luminance with dark thresholding
      for (let i = 0; i < renderW * renderH; i++) {
        const r = data[i * 4]
        const g = data[i * 4 + 1]
        const b = data[i * 4 + 2]
        const luma = 0.299 * r + 0.587 * g + 0.114 * b
        // Drop dark background studio gradient into black
        const contrast = Math.max(0, (luma - 38) * 1.3)
        buffer[i] = Math.min(255, contrast)
      }

      // Floyd-Steinberg error diffusion
      for (let y = 0; y < renderH; y++) {
        for (let x = 0; x < renderW; x++) {
          const idx = y * renderW + x
          const oldVal = buffer[idx]
          const newVal = oldVal < 128 ? 0 : 255
          const err = oldVal - newVal

          if (x + 1 < renderW) buffer[idx + 1] += err * (7 / 16)
          if (x - 1 >= 0 && y + 1 < renderH) buffer[(y + 1) * renderW + (x - 1)] += err * (3 / 16)
          if (y + 1 < renderH) buffer[(y + 1) * renderW + x] += err * (5 / 16)
          if (x + 1 < renderW && y + 1 < renderH) buffer[(y + 1) * renderW + (x + 1)] += err * (1 / 16)

          const outIdx = idx * 4
          if (newVal === 0) {
            // Transparent background
            data[outIdx] = 0
            data[outIdx + 1] = 0
            data[outIdx + 2] = 0
            data[outIdx + 3] = 0
          } else {
            // Crisp 1-bit monochrome pixel
            data[outIdx] = 242
            data[outIdx + 1] = 242
            data[outIdx + 2] = 247
            data[outIdx + 3] = 255
          }
        }
      }

      ctx.putImageData(imgData, 0, 0)
    }
  }

  useEffect(() => {
    renderDither(canvasRef.current, src)
    if (hoverSrc) {
      renderDither(hoverCanvasRef.current, hoverSrc)
    }
  }, [src, hoverSrc, width, height])

  return (
    <div
      className={`group relative select-none [image-rendering:pixelated] ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <canvas
        ref={canvasRef}
        aria-label={alt}
        role="img"
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300 group-hover:opacity-0"
      />
      {hoverSrc && (
        <canvas
          ref={hoverCanvasRef}
          aria-label={`${alt} (hover)`}
          role="img"
          className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </div>
  )
}
