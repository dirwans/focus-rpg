import React from 'react'

export default function BionexGearOverlay({ children, style }) {
  // Bionex doesn't have active mecha gear overlays in production yet. Render the base sprite directly.
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      {children}
    </div>
  )
}
