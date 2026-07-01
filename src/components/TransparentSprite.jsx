import { useEffect, useState } from 'react'

export default function TransparentSprite({ src, alt, size = 120, width, height, glowColor = '#d000ff', upperBodyOnly = false, fill = false }) {
  const [processedSrc, setProcessedSrc] = useState(null)

  useEffect(() => {
    if (!src) return

    const isRemote = src.startsWith('http://') || src.startsWith('https://')
    const apiBase = import.meta.env.VITE_API_URL || ''
    const finalSrc = isRemote 
      ? `${apiBase}/api/proxy-image?url=${encodeURIComponent(src)}` 
      : src

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
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
        
        // 0. Clean up green screen background (chroma key) globally first
        for (let i = 0; i < W * H; i++) {
          const r = data[i * 4]
          const g = data[i * 4 + 1]
          const b = data[i * 4 + 2]
          const isGreenBg = g > 55 && g > r + 15 && g > b + 15 && r < 190 && b < 190
          if (isGreenBg) {
            data[i * 4 + 3] = 0 // force transparent
          }
        }

        // Check if the image already has transparent pixels (e.g., PNG with transparency)
        let hasTransparency = false
        for (let i = 0; i < W * H; i++) {
          if (data[i * 4 + 3] < 150) {
            hasTransparency = true
            break
          }
        }

        const borderThreshX = Math.floor(W * 0.06)
        const borderThreshY = Math.floor(H * 0.06)

        // 1. Force outer 6% edge transparent only if the source has no transparency
        if (!hasTransparency) {
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              if (x < borderThreshX || x > (W - borderThreshX) || y < borderThreshY || y > (H - borderThreshY)) {
                const idx = (y * W + x) * 4
                data[idx + 3] = 0 // force transparent
              }
            }
          }
        }

        // 2. Queue-based Flood Fill (BFS) to remove background - always run this to clean any black boxes!
        const queue = []
        const visited = new Uint8Array(W * H)
        
        const pushPixel = (x, y) => {
          if (x < 0 || x >= W || y < 0 || y >= H) return
          const idx = y * W + x
          if (!visited[idx]) {
            visited[idx] = 1
            queue.push(idx)
          }
        }
        
        // Seed queue from the 4 outer borders
        for (let x = 0; x < W; x++) {
          pushPixel(x, 0)
          pushPixel(x, H - 1)
        }
        for (let y = 0; y < H; y++) {
          pushPixel(0, y)
          pushPixel(W - 1, y)
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
          const a = data[pixelIdx+3]
          
          // Check if this pixel is background (black background, green chroma key, or white background)
          // We use a threshold of 55 for dark/black pixels to completely clear card frame backgrounds
          const isBlackBg = a === 0 || (r < 55 && g < 55 && b < 55)
          const isGreenBg = g > 60 && g > r + 20 && g > b + 20 && r < 180 && b < 180
          const isWhiteBg = r > 220 && g > 220 && b > 220
          
          if (isBlackBg || isGreenBg || isWhiteBg) {
            data[pixelIdx + 3] = 0 // transparent
            
            // Push 4 neighbors
            if (x - 1 >= 0) pushPixel(x - 1, y)
            if (x + 1 < W) pushPixel(x + 1, y)
            if (y - 1 >= 0) pushPixel(x, y - 1)
            if (y + 1 < H) pushPixel(x, y + 1)
          }
        }

        // 3. Find bounding box of non-transparent pixels *before* drawing the outline
        let minX = W, minY = H, maxX = 0, maxY = 0
        let foundAny = false
        const boundStartX = 0
        const boundEndX = W
        const boundStartY = 0
        const boundEndY = H

        for (let y = boundStartY; y < boundEndY; y++) {
          for (let x = boundStartX; x < boundEndX; x++) {
            const idx = (y * W + x) * 4
            const alpha = data[idx + 3]
            if (alpha > 10) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
              foundAny = true
            }
          }
        }

        if (foundAny) {
          const padding = 4
          const leftCutoff = minX <= boundStartX
          const rightCutoff = maxX >= boundEndX - 1
          const topCutoff = minY <= boundStartY
          
          // Compute vertical crop: if upperBodyOnly is true, crop height to top 42% of pilot's bounding box
          const fullHeight = maxY - minY + 1
          const targetMaxY = upperBodyOnly
            ? Math.min(maxY, minY + Math.floor(fullHeight * 0.42))
            : maxY

          // Treat the bottom edge as a cutoff if we are only rendering upper body, to avoid drawing outline there
          const bottomCutoff = upperBodyOnly || (targetMaxY >= boundEndY - 1)

          const cropMinX = leftCutoff ? minX : Math.max(0, minX - padding)
          const cropMaxX = rightCutoff ? maxX : Math.min(W - 1, maxX + padding)
          const cropMinY = topCutoff ? minY : Math.max(0, minY - padding)
          const cropMaxY = bottomCutoff ? targetMaxY : Math.min(H - 1, targetMaxY + padding)

          const cropW = cropMaxX - cropMinX + 1
          const cropH = cropMaxY - cropMinY + 1

          // Create cropped canvas
          const cropCanvas = document.createElement('canvas')
          cropCanvas.width = cropW
          cropCanvas.height = cropH
          const cropCtx = cropCanvas.getContext('2d')

          // Put processed data back onto original canvas temporarily to crop from it
          ctx.putImageData(imgData, 0, 0)
          cropCtx.drawImage(canvas, cropMinX, cropMinY, cropW, cropH, 0, 0, cropW, cropH)

          // Now draw the 2px solid black outline on the cropped canvas
          const cropImgData = cropCtx.getImageData(0, 0, cropW, cropH)
          const cropData = cropImgData.data
          const cropAlpha = new Uint8Array(cropW * cropH)
          for (let i = 0; i < cropW * cropH; i++) {
            cropAlpha[i] = cropData[i * 4 + 3]
          }

          const outlineWidth = 2
          for (let y = 0; y < cropH; y++) {
            for (let x = 0; x < cropW; x++) {
              const idx = y * cropW + x
              if (cropAlpha[idx] === 0) {
                // Do NOT draw outline on cutoff edges of the original image
                if (leftCutoff && x <= outlineWidth) continue
                if (rightCutoff && x >= cropW - 1 - outlineWidth) continue
                if (topCutoff && y <= outlineWidth) continue
                if (bottomCutoff && y >= cropH - 1 - outlineWidth) continue

                let hasSolidNeighbor = false
                for (let dy = -outlineWidth; dy <= outlineWidth; dy++) {
                  for (let dx = -outlineWidth; dx <= outlineWidth; dx++) {
                    const nx = x + dx
                    const ny = y + dy
                    if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
                      const nIdx = ny * cropW + nx
                      if (cropAlpha[nIdx] > 0) {
                        hasSolidNeighbor = true
                        break
                      }
                    }
                  }
                  if (hasSolidNeighbor) break
                }

                if (hasSolidNeighbor) {
                  const pixelIdx = idx * 4
                  cropData[pixelIdx] = 0     // R
                  cropData[pixelIdx + 1] = 0 // G
                  cropData[pixelIdx + 2] = 0 // B
                  cropData[pixelIdx + 3] = 255 // A
                }
              }
            }
          }

          cropCtx.putImageData(cropImgData, 0, 0)
          setProcessedSrc(cropCanvas.toDataURL())
        } else {
          ctx.putImageData(imgData, 0, 0)
          setProcessedSrc(canvas.toDataURL())
        }
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

  if (fill) {
    const fillH = height || 150
    return (
      <div style={{ width: width || size, height: fillH, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {displaySrc && (
          <img
            src={displaySrc}
            alt={alt}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              height: fillH * 2,
              width: 'auto',
              maxWidth: 'none',
              maxHeight: 'none',
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div style={{ width: width || size, height: height || size, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', filter: 'none', flexShrink: 0 }}>
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
