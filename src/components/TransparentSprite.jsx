import { useEffect, useState } from 'react'

export default function TransparentSprite({ src, alt, size = 120, glowColor = '#d000ff' }) {
  const [processedSrc, setProcessedSrc] = useState(null)

  useEffect(() => {
    if (!src) return

    const isRemote = src.startsWith('http://') || src.startsWith('https://')
    const finalSrc = isRemote 
      ? `/api/proxy-image?url=${encodeURIComponent(src)}` 
      : src

    const img = new Image()
    // Do not set crossOrigin for same-origin or data URLs to avoid canvas CORS errors
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data
        const W = canvas.width
        const H = canvas.height
        
        // 6% outer border thresh to completely clear hard border frames
        const borderThreshX = W * 0.06
        const borderThreshY = H * 0.06
        
        // 28% margin zone for relaxed black/purple/grey keying
        const marginX = W * 0.28
        const marginY = H * 0.28

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4
            const r = data[idx]
            const g = data[idx+1]
            const b = data[idx+2]

            // 1. Force outer 6% edge transparent to erase any border boxes
            if (x < borderThreshX || x > (W - borderThreshX) || y < borderThreshY || y > (H - borderThreshY)) {
              data[idx+3] = 0
              continue
            }

            const isBorderZone = x < marginX || x > (W - marginX) || y < marginY || y > (H - marginY)

            if (isBorderZone) {
              // Key out black background, purple/pink frames, or grey frames
              const isBlack = r < 55 && g < 55 && b < 55
              const isPurple = (r > 30 && b > 30 && g < 100 && Math.abs(r - b) < 80)
              const isGrey = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r < 80
              if (isBlack || isPurple || isGrey) {
                data[idx+3] = 0 // transparent
              }
            } else {
              // Center zone: only key out black background
              const isBlack = r < 25 && g < 25 && b < 25
              if (isBlack) {
                data[idx+3] = 0 // transparent
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0)
        setProcessedSrc(canvas.toDataURL())
      } catch (err) {
        console.error('Canvas processing error for sprite:', err)
        setProcessedSrc(src)
      }
    }
    img.onerror = (err) => {
      console.error('Image load error for sprite:', err)
      setProcessedSrc(src)
    }
    img.src = finalSrc
  }, [src])

  const displaySrc = processedSrc || src
  const isFallback = displaySrc === src

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', filter: isFallback ? 'none' : `drop-shadow(0 0 10px ${glowColor})`, flexShrink: 0 }}>
      {displaySrc && (
        <img 
          src={displaySrc} 
          alt={alt} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            mixBlendMode: isFallback ? 'screen' : 'normal',
            clipPath: isFallback ? 'inset(5%)' : 'none'
          }} 
        />
      )}
    </div>
  )
}
