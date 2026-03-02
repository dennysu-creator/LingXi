// ═══════════════════════════════════════
// 西洋占星引擎
// 根據出生月日計算太陽星座與對應屬性
// ═══════════════════════════════════════

import { WESTERN_ZODIAC_SIGNS, type ZodiacSign } from '@/config/constants';

export interface AstrologyResult {
  sunSign: string;           // 'libra'
  signChinese: string;       // '天秤座'
  signEmoji: string;         // '♎'
  westElement: string;       // 'air'
  wuxingElement: string;     // '金'（對應五行）
  modality: string;          // 'cardinal' | 'fixed' | 'mutable'
  rulingPlanet: string;      // 'Venus'
  rulingPlanetChinese: string; // '金星'
  polarity: 'yang' | 'yin';
  personality: string;       // 性格描述
  strength: string;          // 優勢
  weakness: string;          // 弱點
}

// 星座性格描述
const SIGN_PERSONALITIES: Record<string, { personality: string; strength: string; weakness: string }> = {
  aries:       { personality: '充滿活力的開拓者，行動力強，熱情似火', strength: '勇敢果斷、領導力強', weakness: '衝動急躁、缺乏耐心' },
  taurus:      { personality: '穩健務實的守護者，重視安全感與物質享受', strength: '堅韌可靠、品味出眾', weakness: '固執保守、佔有欲強' },
  gemini:      { personality: '靈動善變的溝通者，思維敏捷，好奇心強', strength: '口才便給、適應力強', weakness: '三心二意、表面浮躁' },
  cancer:      { personality: '溫柔細膩的守護者，重情重義，直覺敏銳', strength: '體貼入微、想像力豐', weakness: '情緒化、過度敏感' },
  leo:         { personality: '光芒四射的王者，自信大方，天生舞台焦點', strength: '慷慨大度、領袖魅力', weakness: '自尊心過強、好面子' },
  virgo:       { personality: '精密細緻的分析者，追求完美，邏輯清晰', strength: '細心周到、分析能力', weakness: '吹毛求疵、過度焦慮' },
  libra:       { personality: '優雅和諧的平衡者，追求公正，審美出眾', strength: '社交魅力、品味高雅', weakness: '猶豫不決、依賴他人' },
  scorpio:     { personality: '深邃神秘的洞察者，意志堅定，直覺超凡', strength: '洞察力強、意志堅韌', weakness: '猜疑心重、報復心強' },
  sagittarius: { personality: '自由奔放的探索者，樂觀開朗，追求真理', strength: '視野開闊、哲學思辨', weakness: '粗心大意、承諾薄弱' },
  capricorn:   { personality: '沉穩務實的攀登者，目標明確，堅忍不拔', strength: '責任心強、組織能力', weakness: '過度嚴肅、壓抑情感' },
  aquarius:    { personality: '前衛獨立的革新者，思想超前，人道主義', strength: '創新思維、博愛精神', weakness: '叛逆疏離、過度理想' },
  pisces:      { personality: '夢幻感性的藝術家，同理心強，靈感豐沛', strength: '直覺敏銳、藝術天賦', weakness: '逃避現實、過度感傷' },
};

/**
 * 根據月日判斷太陽星座
 */
function findSunSign(month: number, day: number): ZodiacSign {
  for (const sign of WESTERN_ZODIAC_SIGNS) {
    // 處理跨年星座（摩羯座 12/22 - 1/19）
    if (sign.startMonth > sign.endMonth) {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return sign;
      }
    } else {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay) ||
        (month > sign.startMonth && month < sign.endMonth)
      ) {
        return sign;
      }
    }
  }
  // fallback（不應該發生）
  return WESTERN_ZODIAC_SIGNS[0];
}

/**
 * 主函式：計算西洋占星結果
 */
export function calculateAstrology(month: number, day: number): AstrologyResult {
  const sign = findSunSign(month, day);
  const desc = SIGN_PERSONALITIES[sign.id] || SIGN_PERSONALITIES['aries'];

  return {
    sunSign: sign.id,
    signChinese: sign.nameChinese,
    signEmoji: sign.emoji,
    westElement: sign.element,
    wuxingElement: sign.wuxing,
    modality: sign.modality,
    rulingPlanet: sign.rulingPlanet,
    rulingPlanetChinese: sign.rulingPlanetChinese,
    polarity: sign.polarity,
    personality: desc.personality,
    strength: desc.strength,
    weakness: desc.weakness,
  };
}

/**
 * 取得占星描述字串（給 Claude API 用）
 */
export function getAstrologyDescription(result: AstrologyResult): string {
  return `西洋占星：${result.signChinese}${result.signEmoji}，${result.westElement}象星座（五行屬${result.wuxingElement}），`
    + `${result.modality}宮，守護星${result.rulingPlanetChinese}，${result.polarity === 'yang' ? '陽性' : '陰性'}星座。`
    + `性格：${result.personality}。優勢：${result.strength}。`;
}

/**
 * 根據星座元素和五行的相互作用給出每日運勢修正
 * 返回 -15 到 +15 的分數修正值
 */
export function getDailyAstrologyModifier(
  sunSign: string,
  dayElement: string,
): number {
  const sign = WESTERN_ZODIAC_SIGNS.find(s => s.id === sunSign);
  if (!sign) return 0;

  // 星座五行與日五行的相生相剋關係
  const generates: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
  const overcomes: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

  const signWuxing = sign.wuxing;

  if (generates[signWuxing] === dayElement) return 10;   // 星座生日 → 吉
  if (generates[dayElement] === signWuxing) return 5;    // 日生星座 → 小吉
  if (overcomes[signWuxing] === dayElement) return -5;   // 星座剋日 → 小凶
  if (overcomes[dayElement] === signWuxing) return -10;  // 日剋星座 → 凶
  if (signWuxing === dayElement) return 8;               // 同元素 → 和

  return 0;
}
