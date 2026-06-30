const API_BASE = import.meta.env.VITE_API_URL || ''

export default function TransparentSprite({ src, alt, size = 120, width, height, upperBodyOnly = false, fill = false }) {
  if (!src) return null

  const isRemote = src.startsWith('http://') || src.startsWith('https://')
  const displaySrc = isRemote ? `${API_BASE}/api/proxy-image?url=${encodeURIComponent(src)}` : src

  if (fill) {
    const fillH = height || 150
    return (
      <div style={{ width: width || size, height: fillH, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img src={displaySrc} alt={alt} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: fillH * 2, width: 'auto', maxWidth: 'none', maxHeight: 'none' }} />
      </div>
    )
  }

  return (
    <div style={{ width: width || size, height: height || size, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', flexShrink: 0 }}>
      <img src={displaySrc} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}
