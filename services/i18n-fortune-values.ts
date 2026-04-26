// ═══════════════════════════════════════════════════════════════
// 靈犀 — Fortune Value Localizer
// 將命理引擎輸出的 zh-TW 標準字串（例如「綠色」「東南方」）
// 轉為當前語系顯示文字。引擎輸出不變，僅在呈現層本地化。
// ═══════════════════════════════════════════════════════════════

import i18n from '@/i18n';

// zh-TW 標準值 → i18n key suffix (colors.*)
const COLOR_MAP: Record<string, string> = {
  '白色': 'white',
  '金色': 'gold',
  '銀色': 'silver',
  '綠色': 'green',
  '青色': 'azure',
  '翠色': 'emerald',
  '黑色': 'black',
  '藍色': 'blue',
  '深藍': 'deepblue',
  '紅色': 'red',
  '橙色': 'orange',
  '紫色': 'purple',
  '黃色': 'yellow',
  '棕色': 'brown',
  '米色': 'beige',
};

// zh-TW 標準值 → i18n key suffix (directions.*)
const DIRECTION_MAP: Record<string, string> = {
  '正東': 'east',
  '正南': 'south',
  '正西': 'west',
  '正北': 'north',
  '東南': 'southeast',
  '東北': 'northeast',
  '西南': 'southwest',
  '西北': 'northwest',
  '中宮': 'center',
  // 常見變體（含「方」字）
  '東南方': 'southeast',
  '東北方': 'northeast',
  '西南方': 'southwest',
  '西北方': 'northwest',
  '正東方': 'east',
  '正南方': 'south',
  '正西方': 'west',
  '正北方': 'north',
  '東方': 'east',
  '南方': 'south',
  '西方': 'west',
  '北方': 'north',
  // 單字（部分引擎輸出）
  '東': 'east',
  '南': 'south',
  '西': 'west',
  '北': 'north',
};

// zh-TW 五行 → i18n key suffix (elements.*)
const ELEMENT_MAP: Record<string, string> = {
  '金': 'metal',
  '木': 'wood',
  '水': 'water',
  '火': 'fire',
  '土': 'earth',
};

export function localizeColor(zh: string | undefined): string {
  if (!zh) return '';
  const key = COLOR_MAP[zh];
  if (!key) return zh; // 未知值 — 原樣回傳
  return i18n.t(`colors.${key}`, { defaultValue: zh });
}

export function localizeColors(arr: string[] | undefined): string[] {
  return (arr || []).map(localizeColor);
}

export function localizeDirection(zh: string | undefined): string {
  if (!zh) return '';
  const key = DIRECTION_MAP[zh];
  if (!key) return zh;
  return i18n.t(`directions.${key}`, { defaultValue: zh });
}

export function localizeDirections(arr: string[] | undefined): string[] {
  return (arr || []).map(localizeDirection);
}

export function localizeElement(zh: string | undefined): string {
  if (!zh) return '';
  const key = ELEMENT_MAP[zh];
  if (!key) return zh;
  return i18n.t(`elements.${key}`, { defaultValue: zh });
}

export function localizeElements(arr: string[] | undefined): string[] {
  return (arr || []).map(localizeElement);
}

/**
 * 依語系選擇陣列分隔符：CJK 用「、」，其他用 ", "
 */
export function localeJoin(arr: string[] | undefined): string {
  if (!arr || arr.length === 0) return '';
  const lang = i18n.language || '';
  const sep = lang.startsWith('zh') || lang === 'ja' ? '、' : ', ';
  return arr.join(sep);
}
