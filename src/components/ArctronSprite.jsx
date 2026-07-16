import React from 'react'
import { getJobLane, TieredSpriteImg } from './PilotSprites'

export default function ArctronSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false, clipHead = false, style: extraStyle }) {
  const lane = getJobLane(job)
  let img = isBattle ? "/assets/arctron/arctron_warrior_battle.png" : "/assets/arctron/arctron_warrior.png"
  if (lane === 'ranger') img = "/assets/arctron/arctron_ranger.png"
  else if (lane === 'specialist') img = "/assets/arctron/arctron_technician.png"

  const glow = '#00e5ff'

  return (
    <TieredSpriteImg 
      src={img} 
      alt={`Arctron ${lane}`} 
      size={size} 
      width={width} 
      height={height} 
      glow={glow} 
      extraStyle={{
        ...extraStyle,
        ...(clipHead && lane === 'warrior' ? { clipPath: 'inset(0% 36% 84% 36%)', zIndex: 4 } : {})
      }} 
    />
  )
}
