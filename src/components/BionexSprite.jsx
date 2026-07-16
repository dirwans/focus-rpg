import React from 'react'
import { TieredSpriteImg } from './PilotSprites'

export default function BionexSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, gender = 'male', style: extraStyle }) {
  const guardianJobs = ['guardian', 'centurion', 'protector', 'imperator'];
  const marksmanJobs = ['marksman', 'revenant', 'deadeye', 'predator'];
  const engineerJobs = ['engineer', 'mechanist', 'techmaster', 'overseer'];
  const psionJobs = ['psion', 'esper', 'ascendant', 'transcendent'];

  let img = null;
  const isFemale = gender === 'female';

  if (guardianJobs.includes(job)) {
    if (job === 'imperator' || job === 'protector') img = "/assets/bionex/bionex_titan_pilot.png";
    else img = isFemale ? "/assets/bionex/bionex_guardian_female.png" : "/assets/bionex/bionex_guardian_male.png";
  } else if (marksmanJobs.includes(job)) {
    if (job === 'predator' || job === 'deadeye') img = "/assets/bionex/bionex_railgun_elite.png";
    else img = isFemale ? "/assets/bionex/bionex_marksman_female.png" : "/assets/bionex/bionex_marksman_male.png";
  } else if (engineerJobs.includes(job)) {
    if (job === 'overseer' || job === 'techmaster') img = "/assets/bionex/bionex_war_engineer.png";
    else if (job === 'mechanist') img = "/assets/bionex/bionex_mechanist.png";
    else img = isFemale ? "/assets/bionex/bionex_engineer_female.png" : "/assets/bionex/bionex_engineer_male.png";
  } else if (psionJobs.includes(job)) {
    img = isFemale ? "/assets/bionex/bionex_pilot_v3.png" : "/assets/bionex/bionex_pilot.png";
  }

  if (!img) {
    if (fill) img = "/assets/bionex/bionex_pilot_portrait.png";
    else img = gender === 'female' ? "/assets/bionex/bionex_pilot_v3.png" : "/assets/bionex/bionex_pilot.png";
  }

  const glow = '#39ff14'

  return <TieredSpriteImg src={img} alt={`Bionex ${job || 'pilot'}`} size={size} width={width} height={height} glow={glow} extraStyle={extraStyle} />
}
