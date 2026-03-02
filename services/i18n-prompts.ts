// ═══════════════════════════════════════
// 多語言 Prompt 層
// 根據用戶語言設定，自動調整 Claude API 回覆語言
// ═══════════════════════════════════════

import i18n from '@/i18n';
import type { SupportedLanguage } from '@/i18n';

// 語言對應的 Claude 回覆語言指令
const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  'zh-TW': '請使用繁體中文回覆。語氣風格：溫和專業的命理大師，適當使用文言用語增添神秘感。',
  'zh-CN': '请使用简体中文回复。语气风格：温和专业的命理大师，适当使用文言用语增添神秘感。',
  'ja': '日本語で回答してください。語調：丁寧で神秘的な占い師のように、敬語を使い、東洋的な雰囲気を保ってください。',
  'en': 'Respond in English. Tone: A warm, wise Eastern mysticism advisor. Use evocative language that conveys ancient wisdom while being accessible.',
  'de': 'Antworte auf Deutsch. Tonfall: Ein weiser, warmherziger Berater für östliche Mystik. Verwende eine geheimnisvolle aber zugängliche Sprache.',
  'fr': 'Répondez en français. Ton : Un conseiller sage et bienveillant en mysticisme oriental. Utilisez un langage évocateur qui transmet la sagesse ancienne.',
};

// 玄學術語的多語言對照（Claude 回覆時使用原始術語+翻譯）
const TERMINOLOGY_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  'zh-TW': '',  // 原生語言不需要額外術語說明
  'zh-CN': '',
  'ja': `
重要な用語は以下の通り訳してください：
- 八字 → 四柱推命 (八字)
- 天干 → 天干
- 地支 → 地支
- 五行 → 五行 (金木水火土)
- 奇門遁甲 → 奇門遁甲
- 開門/休門/生門... → 開門/休門/生門...（原語を維持）
- 面相 → 人相・面相
方位は日本語で表記：北、南、東、西、北東、南東、南西、北西`,

  'en': `
Keep original Chinese terms in parentheses for key concepts:
- BaZi (八字) — Eight Characters birth chart
- Heavenly Stems (天干) and Earthly Branches (地支)
- Five Elements (五行): Metal, Wood, Water, Fire, Earth
- Qi Men Dun Jia (奇門遁甲)
- Gates: Open Gate (開門), Rest Gate (休門), Life Gate (生門), Hurt Gate (傷門), Block Gate (杜門), View Gate (景門), Death Gate (死門), Shock Gate (驚門)
- Face Reading (面相)
Use cardinal directions: North, South, East, West, etc.`,

  'de': `
Behalten Sie die chinesischen Originalbegriffe in Klammern bei:
- BaZi (八字) — Acht-Zeichen-Horoskop
- Himmlische Stämme (天干) und Irdische Zweige (地支)
- Fünf Elemente (五行): Metall, Holz, Wasser, Feuer, Erde
- Qi Men Dun Jia (奇門遁甲)
- Tore: Öffnungstor (開門), Ruhetor (休門), Lebenstor (生門), usw.
- Gesichtslesen (面相)
Verwenden Sie Himmelsrichtungen: Norden, Süden, Osten, Westen, usw.`,

  'fr': `
Conservez les termes chinois originaux entre parenthèses :
- BaZi (八字) — Thème astral des Huit Caractères
- Troncs Célestes (天干) et Branches Terrestres (地支)
- Cinq Éléments (五行) : Métal, Bois, Eau, Feu, Terre
- Qi Men Dun Jia (奇門遁甲)
- Portes : Porte ouverte (開門), Porte de repos (休門), Porte de vie (生門), etc.
- Physiognomonie (面相)
Utilisez les points cardinaux : Nord, Sud, Est, Ouest, etc.`,
};

/**
 * 取得當前語言的 Claude 回覆語言指令
 * 附加在每個 System Prompt 的最前面
 */
export function getLanguageDirective(): string {
  const lang = i18n.language as SupportedLanguage;
  const instruction = LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS['en'];
  const terminology = TERMINOLOGY_INSTRUCTIONS[lang] || TERMINOLOGY_INSTRUCTIONS['en'];

  return `[語言/Language Setting]
${instruction}
${terminology}
---
`;
}

/**
 * 包裝 System Prompt，自動加上語言指令
 */
export function wrapSystemPrompt(originalPrompt: string): string {
  return getLanguageDirective() + originalPrompt;
}

/**
 * 取得靈寵說話風格（依語言不同）
 */
export function getPetSpeechStyle(): string {
  const lang = i18n.language as SupportedLanguage;

  const styles: Record<SupportedLanguage, string> = {
    'zh-TW': '用可愛的口吻稱用戶為「主人」，加入顏文字和 emoji。',
    'zh-CN': '用可爱的口吻称用户为「主人」，加入颜文字和 emoji。',
    'ja': 'ユーザーを「ご主人様」と呼び、可愛らしい口調で話してください。顔文字や絵文字を使ってください。',
    'en': 'Call the user "Master" in a cute, playful tone. Use emojis naturally.',
    'de': 'Nenne den Benutzer "Meister" in einem niedlichen, verspielten Ton. Verwende Emojis natürlich.',
    'fr': 'Appelez l\'utilisateur "Maître" sur un ton mignon et enjoué. Utilisez des emojis naturellement.',
  };

  return styles[lang] || styles['en'];
}

/**
 * 取得運勢等級翻譯（Claude API 回覆用）
 */
export function getFortuneLabels(): Record<string, string> {
  const lang = i18n.language as SupportedLanguage;

  const labels: Record<SupportedLanguage, Record<string, string>> = {
    'zh-TW': { great: '大吉', good: '中吉', small: '小吉', neutral: '平', bad: '小凶' },
    'zh-CN': { great: '大吉', good: '中吉', small: '小吉', neutral: '平', bad: '小凶' },
    'ja':    { great: '大吉', good: '中吉', small: '小吉', neutral: '平', bad: '小凶' },
    'en':    { great: 'Excellent', good: 'Good', small: 'Fair', neutral: 'Neutral', bad: 'Caution' },
    'de':    { great: 'Hervorragend', good: 'Gut', small: 'Ordentlich', neutral: 'Neutral', bad: 'Vorsicht' },
    'fr':    { great: 'Excellent', good: 'Bon', small: 'Correct', neutral: 'Neutre', bad: 'Prudence' },
  };

  return labels[lang] || labels['en'];
}
