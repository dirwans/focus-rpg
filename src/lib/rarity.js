import weaponRarities from '../data/weaponRarities.json'

export function getWeaponRarityBonus(rarityGrade) {
  const grade = (rarityGrade || 'normal').toLowerCase()
  return weaponRarities[grade]?.bonusPercent || 0
}

export function getWeaponRarityColor(rarityGrade) {
  const grade = (rarityGrade || 'normal').toLowerCase()
  return weaponRarities[grade]?.color || '#ffffff'
}

export function getWeaponRarityDisplayName(rarityGrade) {
  const grade = (rarityGrade || 'normal').toLowerCase()
  const r = weaponRarities[grade]
  return r ? `${r.name} (${r.displayName})` : 'Normal'
}

export { weaponRarities }
