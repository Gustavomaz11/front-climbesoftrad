import { useState, type MouseEvent } from 'react'

interface MagnifiableImageProps {
  src: string
  alt: string
  zoom: number
  magnifierActive: boolean
}

interface LensPosition {
  left: number
  top: number
  backgroundX: number
  backgroundY: number
  backgroundWidth: number
  backgroundHeight: number
}

const lensSize = 210
const lensZoom = 2.5

export const MagnifiableImage = ({ src, alt, zoom, magnifierActive }: MagnifiableImageProps) => {
  const [baseWidth, setBaseWidth] = useState<number | null>(null)
  const [lens, setLens] = useState<LensPosition | null>(null)

  const moveLens = (event: MouseEvent<HTMLImageElement>) => {
    if (!magnifierActive) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height))
    setLens({
      left: x - lensSize / 2,
      top: y - lensSize / 2,
      backgroundX: lensSize / 2 - x * lensZoom,
      backgroundY: lensSize / 2 - y * lensZoom,
      backgroundWidth: rect.width * lensZoom,
      backgroundHeight: rect.height * lensZoom,
    })
  }

  const renderedWidth = baseWidth ? baseWidth * zoom : undefined

  return (
    <div className="flex min-h-full min-w-full items-start justify-center p-6">
      <div className="relative shrink-0" style={{ width: renderedWidth }}>
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`block h-auto w-full select-none shadow-2xl ${magnifierActive ? 'cursor-zoom-in' : ''}`}
          onLoad={(event) => {
            const availableWidth = Math.max(320, window.innerWidth - 160)
            setBaseWidth(Math.min(event.currentTarget.naturalWidth, availableWidth))
          }}
          onMouseMove={moveLens}
          onMouseLeave={() => setLens(null)}
        />
        {magnifierActive && lens ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-10 rounded-full border-2 border-cyan-400 bg-no-repeat shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            style={{
              width: lensSize,
              height: lensSize,
              left: lens.left,
              top: lens.top,
              backgroundImage: `url(${JSON.stringify(src)})`,
              backgroundPosition: `${lens.backgroundX}px ${lens.backgroundY}px`,
              backgroundSize: `${lens.backgroundWidth}px ${lens.backgroundHeight}px`,
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
