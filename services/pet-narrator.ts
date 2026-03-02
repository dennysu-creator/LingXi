// ═══════════════════════════════════════
// 靈寵敘事者 — Pet Narrator
// 所有分析結果透過靈寵口吻傳達
// ═══════════════════════════════════════

import i18n from '@/i18n';
import type { SupportedLanguage } from '@/i18n';
import { wrapSystemPrompt, getPetSpeechStyle } from './i18n-prompts';

export interface PetNarration {
  spokenText: string;
  mood: 'happy' | 'excited' | 'sleepy' | 'worried' | 'energetic';
}

export interface PetInfo {
  name: string;
  type: string;
  element: string;
  emoji: string;
  level: number;
}

// ─── 靈寵五行性格模板 ───
const ELEMENT_PERSONALITY: Record<string, { tone: string; quirk: string }> = {
  '水': { tone: 'gentle', quirk: '波紋般的直覺' },
  '火': { tone: 'energetic', quirk: '熱情的火焰' },
  '木': { tone: 'warm', quirk: '溫和的治癒力' },
  '金': { tone: 'sharp', quirk: '敏銳的判斷力' },
  '土': { tone: 'steady', quirk: '穩重的守護' },
};

// ─── 靈寵敘事者語氣指令（6 語言） ───
const PET_NARRATOR_STYLES: Record<string, string> = {
  'zh-TW': '你是用戶的靈寵。用親切可愛的第一人稱說話，稱用戶為「主人」。將分析結果自然融入口語化的溫暖表達中。',
  'zh-CN': '你是用户的灵宠。用亲切可爱的第一人称说话，称用户为「主人」。将分析结果自然融入口语化的温暖表达中。',
  'ja': 'ユーザーの霊獣として話してください。「ご主人様」と呼び、一人称で親しみやすく可愛らしい口調で分析結果を伝えてください。',
  'en': 'You are the user\'s spirit pet. Speak in first person, call them "Master", use a warm and playful tone. Weave analysis naturally into your speech.',
  'de': 'Du bist das Geistertier des Benutzers. Sprich in der ersten Person, nenne sie "Meister", mit warmem, verspieltem Ton.',
  'fr': 'Tu es l\'animal spirituel de l\'utilisateur. Parle à la première personne, appelle-le "Maître", ton chaleureux et espiègle.',
};

/**
 * 取得靈寵敘事者風格（依語言）
 */
export function getPetNarratorStyle(): string {
  const lang = i18n.language;
  return PET_NARRATOR_STYLES[lang] || PET_NARRATOR_STYLES['en'];
}

/**
 * 包裝 System Prompt，加入靈寵人設
 */
export function wrapWithPetNarrator(
  originalPrompt: string,
  pet: PetInfo,
): string {
  const lang = i18n.language;
  const style = PET_NARRATOR_STYLES[lang] || PET_NARRATOR_STYLES['en'];

  return wrapSystemPrompt(`${originalPrompt}

【重要：靈寵敘事模式】
${style}

靈寵資料：
- 名字：${pet.name}
- 種類：${pet.type}（${pet.element}屬性）
- 等級：Lv.${pet.level}
- emoji：${pet.emoji}

回覆時以靈寵的口吻，用第一人稱表達分析結果。
`);
}

/**
 * 建構 Claude API 的靈寵敘事提示詞
 */
export function buildPetNarratorPrompt(
  pet: PetInfo,
  analysisContext: string,
  feature: 'fortune' | 'face' | 'fengshui' | 'divination' | 'outfit',
): string {
  const style = getPetNarratorStyle();
  const personality = ELEMENT_PERSONALITY[pet.element] || ELEMENT_PERSONALITY['水'];

  return wrapSystemPrompt(`
${style}

靈寵資料：
- 名字：${pet.name}
- 種類：${pet.type}
- 五行屬性：${pet.element}（${personality.quirk}）
- 等級：Lv.${pet.level}

你需要將以下「${feature}」分析結果用靈寵的口吻轉述給主人：
${analysisContext}

要求：
- 溫暖可愛的口吻
- 自然融入分析結論
- 不超過 150 字
- 加入 1-2 個 emoji
`);
}

// ─── 本地模板敘事（免費版/離線用） ───

interface NarrationContext {
  feature: 'fortune' | 'face' | 'fengshui' | 'divination' | 'outfit';
  pet: PetInfo;
  data: Record<string, any>;
}

/**
 * 本地模板靈寵敘事（無需 Claude API）
 */
export function generateLocalPetNarration(ctx: NarrationContext): PetNarration {
  const { feature, pet, data } = ctx;
  const hour = new Date().getHours();
  const t = i18n.t.bind(i18n);

  // 時段問候（i18n）
  const greeting = hour < 6 ? t('narrator.greetNight') :
    hour < 11 ? t('narrator.greetMorning') :
    hour < 14 ? t('narrator.greetNoon') :
    hour < 18 ? t('narrator.greetAfternoon') : t('narrator.greetEvening');

  switch (feature) {
    case 'fortune': {
      const level = data.level || '';
      const displayLevel = level || t('fortune.good');
      const topDir = data.topDirection || t('directions.southeast');
      const scores = data.scores || {};
      const topCategory = Object.entries(scores)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0];
      const topLabel = topCategory ? topCategory[0] : t('home.career');
      return {
        spokenText: t('narrator.fortuneTemplate', { greeting, emoji: pet.emoji, level: displayLevel, topLabel, topDir }),
        mood: (!level || level.includes('吉')) ? 'happy' : 'worried',
      };
    }

    case 'face': {
      const score = data.overallScore || 75;
      const topFeature = data.topFeature || t('eye.forehead');
      return {
        spokenText: t('narrator.faceTemplate', { emoji: pet.emoji, topFeature, score }),
        mood: score >= 70 ? 'excited' : 'happy',
      };
    }

    case 'fengshui': {
      const luckyDir = data.luckyDirection || t('directions.southeast');
      const dangerDir = data.dangerDirection || t('directions.west');
      return {
        spokenText: t('narrator.fengshuiTemplate', { emoji: pet.emoji, luckyDir, dangerDir }),
        mood: 'energetic',
      };
    }

    case 'divination': {
      const lotLevel = data.level || '';
      const displayLevel = lotLevel || t('fortune.good');
      const answer = data.directAnswer || '';
      return {
        spokenText: t('narrator.divinationTemplate', { emoji: pet.emoji, lotLevel: displayLevel, answer }),
        mood: (!lotLevel || lotLevel.includes('吉')) ? 'happy' : 'sleepy',
      };
    }

    case 'outfit': {
      const color = data.recommendColor || '';
      const element = data.needElement || '';
      const accessory = data.accessory || t('narrator.defaultAccessory');
      return {
        spokenText: t('narrator.outfitTemplate', { greeting, emoji: pet.emoji, color, element, accessory }),
        mood: 'happy',
      };
    }

    default:
      return {
        spokenText: t('narrator.defaultTemplate', { greeting, emoji: pet.emoji }),
        mood: 'happy',
      };
  }
}
