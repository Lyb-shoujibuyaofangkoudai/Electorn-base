/**
 * 召唤师头像的图片 URL
 * @param iconId
 */
export function profileIconUri(iconId: number) {
  if (!iconId) return;
  return `/lol-game-data/assets/v1/profile-icons/${iconId}.jpg`;
}

/**
 * 英雄图标的图片 URL
 * @param champId
 */
export function championIconUri(champId: number) {
  if (!champId) return;
  return `/lol-game-data/assets/v1/champion-icons/${champId}.png`;
}

/**
 * 符文图标的图片 URL
 * @param styleId 符文主系的 ID（例如 8000 表示精密系，8100 表示主宰系等）。
 * @param perkId 具体符文的 ID。
 */
export function getStylesIconUri(styleId: number, perkId: number) {
  if (!styleId) return;
  return `/lol-game-data/assets/v1/perk-images/styles/${styleId}/${perkId}.png`;
}

export function isRenderer() {
  return typeof window !== "undefined";
}



export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryString = url.split('?')[1]; // 获取查询字符串部分

  if (!queryString) return params;

  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });

  return params;
}



