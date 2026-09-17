import { useEffect } from 'react'

export default function ImageModal({ image, alt, onClose }) {
  const isOpen = Boolean(image)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        aria-label="Close image"
        className="absolute top-5 right-8 flex h-11 w-11 items-center justify-center rounded-full text-4xl leading-none text-white transition-all duration-200 hover:scale-110 hover:bg-white/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 max-[768px]:top-4 max-[768px]:right-5 max-[768px]:text-3xl"
        onClick={onClose}
      >
        &times;
      </button>
      {image && (
        <img
          src={image}
          alt={alt}
          className={`max-h-[80vh] max-w-[90%] object-contain shadow-2xl transition-transform duration-300 max-[768px]:max-h-[75vh] max-[768px]:max-w-[95%] ${
            isOpen ? 'scale-100' : 'scale-95'
          }`}
        />
      )}
    </div>
  )
}
