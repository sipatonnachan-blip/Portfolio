import { useEffect, useRef } from 'react'

export default function PixelAvatar({
  src,
  alt,
  width = 120,
  height = 120,
  pixelSize = 3,
  className = '',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !src) return

    let isMounted = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    const render = () => {
      if (!isMounted || !canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = width
      canvas.height = height

      const w = Math.max(1, Math.floor(width / pixelSize))
      const h = Math.max(1, Math.floor(height / pixelSize))

      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return

      // Cover crop math (matches CSS object-cover)
      const naturalWidth = img.naturalWidth || width
      const naturalHeight = img.naturalHeight || height
      const imgAspect = naturalWidth / naturalHeight
      const targetAspect = width / height

      let sx = 0
      let sy = 0
      let sWidth = naturalWidth
      let sHeight = naturalHeight

      if (imgAspect > targetAspect) {
        sWidth = naturalHeight * targetAspect
        sx = (naturalWidth - sWidth) / 2
      } else {
        sHeight = naturalWidth / targetAspect
        sy = (naturalHeight - sHeight) / 2
      }

      // Step 1: Draw downsampled image into offscreen canvas
      offCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h)

      // Step 2: Draw back to visible canvas with nearest-neighbor interpolation
      ctx.imageSmoothingEnabled = false
      ctx.mozImageSmoothingEnabled = false
      ctx.webkitImageSmoothingEnabled = false
      ctx.msImageSmoothingEnabled = false

      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(offscreen, 0, 0, w, h, 0, 0, width, height)
    }

    if (img.complete) {
      render()
    } else {
      img.onload = render
    }

    return () => {
      isMounted = false
    }
  }, [src, width, height, pixelSize])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-label={alt}
      role="img"
      className={`block [image-rendering:pixelated] ${className}`}
    />
  )
}
