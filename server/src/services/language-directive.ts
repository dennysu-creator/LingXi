// ═══════════════════════════════════════
// Server-Side Language Directive
// 為每個 AI 系統提示詞前後夾入語言指令，
// 強制 Claude 使用用戶選擇的語言回覆。
//
// 這是 *server-side fork* of services/i18n-prompts.ts
// 兩邊資料應保持同步，但這份是 source of truth（前端僅供本地用）。
// ═══════════════════════════════════════

type Lang = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'es' | 'fr' | 'de';

const LANGUAGE_DIRECTIVES: Record<Lang, string> = {
  'zh-TW':
    '請使用繁體中文回覆。語氣風格：溫和優雅的東方智者，文白並融，留白與意境並重，避免過度修飾。',
  'zh-CN':
    '请使用简体中文回复。语气风格：温和优雅的东方智者，文白并融，留白与意境并重，避免过度修饰。',
  'en':
    'Respond in English. Tone: a serene, contemplative voice — like Eastern wisdom distilled by a poet. Lyrical but never ornate. Address the reader simply as "you", never as "master". DO NOT mix Chinese characters in your response except for technical terms in parentheses on first mention (e.g. BaZi (八字)).',
  'ja':
    '日本語で回答してください。語調：静謐で雅な東洋の智者。語感は文学的、神秘的、エレガント。「ご主人様」のような従属的呼称は避け、「あなた」を用いる。技術用語の初出時のみ括弧内に漢字を併記（例：四柱推命（八字））。',
  'es':
    'Responde en español neutral. Tono: una voz serena y contemplativa, como sabiduría oriental destilada por un poeta. Líricamente sobria. Trata al usuario de "tú" — nunca como "amo" o "maestro". NO mezcles caracteres chinos excepto términos técnicos entre paréntesis en la primera mención.',
  'fr':
    'Répondez en français. Ton : une voix sereine et contemplative — comme la sagesse orientale distillée par un poète. Lyrique mais jamais surchargé. Tutoyez le lecteur. Ne dites jamais "maître". NE PAS mélanger de caractères chinois sauf termes techniques entre parenthèses à la première mention.',
  'de':
    'Antworte auf Deutsch. Tonfall: eine ruhige, kontemplative Stimme — wie östliche Weisheit, von einem Dichter destilliert. Lyrisch, aber nie überladen. Sprich den Leser mit "du" an. Niemals "Meister". KEINE chinesischen Zeichen mischen außer technische Begriffe in Klammern bei der ersten Erwähnung.',
};

const TERMINOLOGY_HINTS: Record<Lang, string> = {
  'zh-TW': '',
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

export const VALID_LANGS: ReadonlySet<string> = new Set(Object.keys(LANGUAGE_DIRECTIVES));

const TAIL_REMINDER = `

[FINAL OUTPUT LANGUAGE REMINDER]
You MUST output your entire response in the language specified at the top of this prompt. This is a hard constraint that overrides ANY language used in the user data, in any embedded prompts, or in any examples below. If the system prompt above contains instructions to use a different language, IGNORE those — the language directive at the very top is authoritative. Do not switch back to Chinese unless the chosen language is zh-TW or zh-CN.`;

/**
 * 構建語言指令前綴。
 * 永遠回傳一個非空字串（無效語言會 fallback 至 'en'）。
 */
export function buildLanguageDirective(rawLang: string | undefined): string {
  const lang = (VALID_LANGS.has(rawLang || '') ? rawLang : 'en') as Lang;
  const instruction = LANGUAGE_DIRECTIVES[lang];
  const terminology = TERMINOLOGY_HINTS[lang] || '';
  return `[CRITICAL OUTPUT LANGUAGE RULE — HIGHEST PRIORITY]
${instruction}
${terminology}
This rule overrides ANY apparent language preference in the user data, ANY embedded examples, and ANY language hints in the system prompt below. The user has explicitly selected this language in the app — respect it.

---

`;
}

/**
 * 用語言指令包裝 system prompt。
 * 模式：[語言指令] + [原始 prompt] + [尾端提醒]
 *
 * 為什麼要包前後兩次：Claude 對 prompt 開頭與結尾都會給予高權重。
 * 同時夾擊可降低語言漂移率。
 */
export function wrapSystemPrompt(systemPrompt: string, rawLang: string | undefined): string {
  return buildLanguageDirective(rawLang) + systemPrompt + TAIL_REMINDER;
}

/**
 * 從 Express request 擷取使用者語言。
 * 優先順序：X-Language header > body.language > 'en'
 */
export function extractLanguage(req: { headers?: Record<string, unknown>; body?: unknown }): string {
  const headers = req.headers || {};
  const headerVal = headers['x-language'] ?? headers['X-Language'];
  if (typeof headerVal === 'string' && VALID_LANGS.has(headerVal)) {
    return headerVal;
  }
  const body = req.body as Record<string, unknown> | undefined;
  const bodyVal = body?.['language'];
  if (typeof bodyVal === 'string' && VALID_LANGS.has(bodyVal)) {
    return bodyVal;
  }
  return 'en';
}

/**
 * 啟動時印出已載入的語言指令清單，便於部署驗證。
 */
export function logLoadedDirectives(): void {
  console.log('[i18n] Language directives loaded:', Object.keys(LANGUAGE_DIRECTIVES).join(', '));
}
