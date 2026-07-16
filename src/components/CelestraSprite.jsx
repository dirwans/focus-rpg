import React from 'react'
import { getJobLane, TieredSpriteImg } from './PilotSprites'

export default function CelestraSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, gender = 'female', style: extraStyle }) {
  const lane = getJobLane(job)
  let srcImg = gender === 'female' ? "/assets/celestra/celestra_pilot_v2.png" : "/assets/celestra/celestra_pilot.png"
  
  if (job) {
    if (lane === 'warrior') {
      srcImg = gender === 'female' ? "/assets/celestra/celestra_warrior_female.png" : "/assets/celestra/celestra_warrior_male.png"
    } else if (lane === 'ranger') {
      srcImg = gender === 'female' ? (fill ? "/assets/celestra/celestra_ranger_portrait.png" : "/assets/celestra/celestra_ranger_female.png") : "/assets/celestra/celestra_ranger_male.png"
    } else if (lane === 'specialist') {
      srcImg = gender === 'female' ? (fill ? "/assets/celestra/celestra_specialist_portrait.png" : "/assets/celestra/celestra_specialist_female.png") : "/assets/celestra/celestra_specialist_male.png"
    } else if (lane === 'mystic') {
      srcImg = gender === 'female' ? (fill ? "/assets/celestra/celestra_mystic_portrait.png" : "/assets/celestra/celestra_mystic_female.png") : "/assets/celestra/celestra_mystic_male.png"
    }
  }
  
  const glow = '#a855f7'

  return <TieredSpriteImg src={srcImg} alt={`Celestra ${lane}`} size={size} width={width} height={height} glow={glow} extraStyle={extraStyle} />
}
