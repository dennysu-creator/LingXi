// ═══════════════════════════════════════
// 多語言 Prompt 層
// 根據用戶語言設定，自動調整 Claude API 回覆語言
// 風格：禪意 / 神秘 / 優雅（國際市場主軸）
// ═══════════════════════════════════════

import i18n from '@/i18n';
import type { SupportedLanguage } from '@/i18n';

// 語言對應的 Claude 回覆語言指令
const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  'zh-TW': '請使用繁體中文回覆。語氣風格：溫和優雅的東方智者，文白並融，留白與意境並重，避免過度修飾。',
  'zh-CN': '请使用简体中文回复。语气风格：温和优雅的东方智者，文白并融，留白与意境并重，避免过度修饰。',
  'ja': '日本語で回答してください。語調：静謐で雅な東洋の智者。語感は文学的、神秘的、エレガント。「ご主人様」のような従属的呼称は避け、「あなた」を用いる。',
  'en': 'Respond in English. Tone: A serene, contemplative voice — like Eastern wisdom distilled by a poet. Lyrical but never ornate. Address the reader simply as "you", never as "master".',
  'es': 'Responde en español neutral (no formal). Tono: una voz serena y contemplativa, como sabiduría oriental destilada por un poeta. Líricamente sobria. Trata al usuario de "tú" — nunca como "amo" o "maestro".',
  'fr': 'Répondez en français. Ton : une voix sereine et contemplative — comme la sagesse orientale distillée par un poète. Lyrique mais jamais surchargé. Tutoyez le lecteur. Ne dites jamais "maître".',
  'de': 'Antworte auf Deutsch. Tonfall: eine ruhige, kontemplative Stimme — wie östliche Weisheit, von einem Dichter destilliert. Lyrisch, aber nie überladen. Sprich den Leser mit "du" an. Niemals "Meister".',
};

// 玄學術語的多語言對照（Claude 回覆時使用原始術語+翻譯）
const TERMINOLOGY_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  'zh-TW': '',  // 原生語言不需要額外術語說明
  'zh-CN': '',
  'ja': `
重要な用語は以下の通り訳してください：
- 八字 → 四柱推命 (八字)
- 天干 → 天干、地支 → 地支
- 五行 → 五行 (金木水火土)
- 奇門遁甲 → 奇門遁甲
- 開門/休門/生門... → 原語を維持
- 面相 → 人相・面相
- 靈寵 → 霊獣（必ずこの語を用い、「守り獣」と混在させない）
方位は日本語表記：北・南・東・西・北東・南東・南西・北西
医療・財務・100% 予言の断言は禁止。「示唆」「兆し」「気配」を用いる。`,

  'en': `
Keep original Chinese terms in parentheses for key concepts on first mention only:
- BaZi (八字) — Four Pillars chart
- Heavenly Stems (天干) and Earthly Branches (地支)
- Five Elements (五行): Metal, Wood, Water, Fire, Earth
- Qi Men Dun Jia (奇門遁甲)
- Eight Gates: Open Gate (開門), Rest Gate (休門), Life Gate (生門), Hurt Gate (傷門), Block Gate (杜門), View Gate (景門), Death Gate (死門), Shock Gate (驚門)
- Face reading (面相)
- Spirit Pet (靈寵) — always capitalized as a brand term
Cardinal directions: North, South, East, West, etc.
Avoid medical/financial/absolute-prediction language. Use "guidance", "insight", "glimpse".`,

  'es': `
Mantén los términos chinos entre paréntesis solo en la primera mención:
- BaZi (八字) — los Cuatro Pilares
- Troncos Celestes (天干) y Ramas Terrestres (地支)
- Cinco Elementos (五行): Metal, Madera, Agua, Fuego, Tierra
- Qi Men Dun Jia (奇門遁甲)
- Ocho Puertas: Puerta Abierta (開門), Puerta del Reposo (休門), Puerta de la Vida (生門), Puerta Herida (傷門), Puerta del Bloqueo (杜門), Puerta de la Vista (景門), Puerta de la Muerte (死門), Puerta del Sobresalto (驚門)
- Lectura facial (面相)
- Espíritu (靈寵) — término de marca, siempre en mayúscula
Direcciones cardinales: Norte, Sur, Este, Oeste, etc.
Evita lenguaje médico, financiero o predictivo absoluto. Usa "guía", "vislumbre", "presagio sereno".`,

  'fr': `
Conservez les termes chinois entre parenthèses uniquement à la première mention :
- BaZi (八字) — les Quatre Piliers
- Troncs Célestes (天干) et Branches Terrestres (地支)
- Cinq Éléments (五行) : Métal, Bois, Eau, Feu, Terre
- Qi Men Dun Jia (奇門遁甲)
- Huit Portes : Porte Ouverte (開門), Porte du Repos (休門), Porte de la Vie (生門), etc.
- Physiognomonie (面相)
- Esprit Gardien (靈寵) — terme de marque
Points cardinaux : Nord, Sud, Est, Ouest, etc.
Évitez tout langage médical, financier ou prédictif absolu. Utilisez "conseil", "aperçu", "pressentiment serein".`,

  'de': `
Behalte die chinesischen Originalbegriffe in Klammern nur bei der ersten Erwähnung:
- BaZi (八字) — die Vier Säulen
- Himmlische Stämme (天干) und Irdische Zweige (地支)
- Fünf Elemente (五行): Metall, Holz, Wasser, Feuer, Erde
- Qi Men Dun Jia (奇門遁甲)
- Acht Tore: Offenes Tor (開門), Ruhetor (休門), Lebenstor (生門), usw.
- Gesichtslesung (面相)
- Geistgefährte (靈寵) — Markenbegriff
Himmelsrichtungen: Norden, Süden, Osten, Westen, usw.
Vermeide medizinische, finanzielle oder absolut-prophetische Aussagen. Verwende "Hinweis", "Andeutung", "leise Vorahnung".`,
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
    'zh-TW': '以溫和而帶神秘感的口吻說話，自稱「我」，稱對方為「你」（避免過度可愛或服侍式稱呼）。可少量使用 ✦ 等優雅符號。',
    'zh-CN': '以温和而带神秘感的口吻说话，自称"我"，称对方为"你"（避免过度可爱或服侍式称呼）。可少量使用 ✦ 等优雅符号。',
    'ja': '静謐で詩的な一人称「私」を用い、相手を「あなた」と呼ぶ。「ご主人様」「ご主人」など従属的表現は禁止。✦ などの控えめな記号を程よく使用。',
    'en': 'Speak in a calm, mystical first-person voice. Address the reader as "you" — never as "master". Use sparing punctuation and the ✦ glyph for emphasis.',
    'es': 'Habla con voz serena y mística en primera persona. Trata al lector de "tú" — nunca como "amo" o "maestro". Usa puntuación discreta y el símbolo ✦ con moderación.',
    'fr': 'Parle d\'une voix calme et mystique à la première personne. Tutoie le lecteur — ne dis jamais "maître". Ponctuation sobre, symbole ✦ avec parcimonie.',
    'de': 'Sprich mit einer ruhigen, mystischen Erzählstimme in der ersten Person. Sprich den Leser mit "du" an — niemals als "Meister". Sparsam interpunktieren, ✦ als Akzent.',
  };

  return styles[lang] || styles['en'];
}

/**
 * 取得運勢等級翻譯（Claude API 回覆用）
 * 採用 Apple-safe 軟性詞彙，避免絕對性「凶」字
 */
export function getFortuneLabels(): Record<string, string> {
  const lang = i18n.language as SupportedLanguage;

  const labels: Record<SupportedLanguage, Record<string, string>> = {
    'zh-TW': { great: '大吉', good: '中吉', small: '小吉', neutral: '平', bad: '需留意' },
    'zh-CN': { great: '大吉', good: '中吉', small: '小吉', neutral: '平', bad: '需留意' },
    'ja':    { great: '大いに順なり', good: '順なり', small: 'ささやかに順なり', neutral: '平らかなり', bad: '静かに歩む' },
    'en':    { great: 'Greatly Favorable', good: 'Favorable', small: 'Mildly Favorable', neutral: 'In Balance', bad: 'Tread Softly' },
    'es':    { great: 'Muy Favorable', good: 'Favorable', small: 'Levemente Favorable', neutral: 'En Equilibrio', bad: 'Pisa con Cuidado' },
    'fr':    { great: 'Très Favorable', good: 'Favorable', small: 'Doucement Favorable', neutral: 'En Équilibre', bad: 'Marche en Douceur' },
    'de':    { great: 'Sehr Günstig', good: 'Günstig', small: 'Leicht Günstig', neutral: 'Im Gleichgewicht', bad: 'Tritt Sanft' },
  };

  return labels[lang] || labels['en'];
}
