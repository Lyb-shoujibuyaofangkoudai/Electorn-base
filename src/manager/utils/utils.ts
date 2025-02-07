/**
 * 包装图标地址
 * @param iconId
 */
export function profileIconUri(iconId: number) {
  return `/lol-game-data/assets/v1/profile-icons/${iconId}.jpg`
}

export function championIconUri(champId: number) {
  return `/lol-game-data/assets/v1/champion-icons/${champId}.png`
}
