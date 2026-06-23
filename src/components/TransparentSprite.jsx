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
        
        // 1. Force outer 6% edge transparent to completely erase hard border frames
        const borderThreshX = Math.floor(W * 0.06)
        const borderThreshY = Math.floor(H * 0.06)
        
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            if (x < borderThreshX || x > (W - borderThreshX) || y < borderThreshY || y > (H - borderThreshY)) {
              const idx = (y * W + x) * 4
              data[idx + 3] = 0 // force transparent
            }
          }
        }

        // 2. Queue-based Flood Fill (BFS) to remove background while keeping the body solid
        const queue = []
        const visited = new Uint8Array(W * H)
        
        const pushPixel = (x, y) => {
          if (x < borderThreshX || x >= W - borderThreshX || y < borderThreshY || y >= H - borderThreshY) return
          const idx = y * W + x
          if (!visited[idx]) {
            visited[idx] = 1
            queue.push(idx)
          }
        }
        
        // Seed the queue with all pixels along the new boundary
        for (let x = borderThreshX; x < W - borderThreshX; x++) {
          pushPixel(x, borderThreshY)
          pushPixel(x, H - borderThreshY - 1)
        }
        for (let y = borderThreshY; y < H - borderThreshY; y++) {
          pushPixel(borderThreshX, y)
          pushPixel(W - borderThreshX - 1, y)
        }

        // Run BFS
        let qHead = 0
        while (qHead < queue.length) {
          const idx = queue[qHead++]
          const x = idx % W
          const y = Math.floor(idx / W)
          
          const pixelIdx = idx * 4
          const r = data[pixelIdx]
          const g = data[pixelIdx+1]
          const b = data[pixelIdx+2]
          
          // Check if this pixel is background (black background, or green chroma key background)
          const isBlackBg = r < 20 && g < 20 && b < 20
          const isGreenBg = Math.abs(r - 71) < 15 && Math.abs(g - 112) < 15 && Math.abs(b - 76) < 15
          
          if (isBlackBg || isGreenBg) {
            data[pixelIdx + 3] = 0 // transparent
            
            // Push 4 neighbors
            if (x - 1 >= borderThreshX) pushPixel(x - 1, y)
            if (x + 1 < W - borderThreshX) pushPixel(x + 1, y)
            if (y - 1 >= borderThreshY) pushPixel(x, y - 1)
            if (y + 1 < H - borderThreshY) pushPixel(x, y + 1)
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
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', filter: 'none', flexShrink: 0 }}>
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
