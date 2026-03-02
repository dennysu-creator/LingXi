// ═══════════════════════════════════════
// 統一運勢引擎
// 結合八字 + 紫微斗數 + 奇門遁甲 + 西洋占星
// 輸出每日綜合運勢
// ═══════════════════════════════════════

import { ELEMENT_RELATIONS, ELEMENT_COLORS, STEM_ELEMENT } from '@/config/constants';
import type { BaziResult } from './bazi-engine';
import type { ZiweiChart } from './ziwei-engine';
import type { QimenChart } from './qimen-engine';
import type { AstrologyResult } from './astrology-engine';

// ─── 型別定義 ───

export interface FortuneScores {
  wealth: number;    // 財運 0-100
  love: number;      // 感情 0-100
  career: number;    // 事業 0-100
  health: number;    // 健康 0-100
  study: number;     // 學業 0-100
}

export type FortuneGrade = '大吉' | '中吉' | '小吉' | '平' | '凶';

export interface UnifiedFortuneResult {
  scores: FortuneScores;
  overallScore: number;
  overallLevel: FortuneGrade;

  luckyDirections: string[];
  luckyColors: string[];
  luckyNumbers: number[];
  luckyElement: string;       // 有利五行
  avoidElement: string;       // 不利五行

  // 各系統貢獻摘要（首頁顯示用）
  baziHighlight: string;
  ziweiHighlight: string;
  qimenHighlight: string;
  astrologyHighlight: string;
}

// ─── 權重配比 ───

const WEIGHTS = {
  bazi: 0.35,
  ziwei: 0.30,
  qimen: 0.25,
  astrology: 0.10,
} as const;

// ─── 日運計算核心 ───

/**
 * 八字日運分析（權重 35%）
 * 根據日主五行與當日天干地支的生剋關係
 */
function calculateBaziDailyScore(bazi: BaziResult): {
  scores: FortuneScores;
  highlight: string;
  luckyElement: string;
  avoidElement: string;
} {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const seed = dayOfYear + today.getFullYear();

  const dayMasterEl = bazi.dayMasterElement;
  const generates = ELEMENT_RELATIONS.generates as Record<string, string>;
  const overcomes = ELEMENT_RELATIONS.overcomes as Record<string, string>;

  // 根據日主五行推算各項運勢基底
  const baseScore = 50 + seededRandom(seed, -15, 20);

  // 財運：我剋者為財
  const wealthElement = overcomes[dayMasterEl];
  const wealthMod = bazi.fiveElements[wealthElement] > 1 ? 10 : -5;

  // 事業：剋我者為官
  const careerElement = Object.keys(overcomes).find(k => overcomes[k] === dayMasterEl) || '金';
  const careerMod = bazi.fiveElements[careerElement] > 0 ? 8 : -3;

  // 感情：日柱天干五行的相生方
  const loveMod = seededRandom(seed + 1, -10, 15);

  // 健康：五行平衡度
  const elementValues = Object.values(bazi.fiveElements);
  const balance = Math.max(...elementValues) - Math.min(...elementValues);
  const healthMod = balance <= 2 ? 12 : balance <= 4 ? 0 : -8;

  // 學業：生我者為印
  const studyElement = Object.keys(generates).find(k => generates[k] === dayMasterEl) || '水';
  const studyMod = bazi.fiveElements[studyElement] > 0 ? 10 : -3;

  const scores: FortuneScores = {
    wealth: clamp(baseScore + wealthMod + seededRandom(seed + 10, -5, 5)),
    love: clamp(baseScore + loveMod),
    career: clamp(baseScore + careerMod + seededRandom(seed + 20, -5, 5)),
    health: clamp(baseScore + healthMod),
    study: clamp(baseScore + studyMod + seededRandom(seed + 30, -5, 5)),
  };

  // 有利五行 = 日主所需（生我者 or 同我者）
  const luckyElement = studyElement;
  // 不利五行 = 剋我者過旺
  const avoidElement = careerElement;

  const highlight = `日主${dayMasterEl}，今日${bazi.dominantElement}氣旺盛`;

  return { scores, highlight, luckyElement, avoidElement };
}

/**
 * 紫微斗數日運分析（權重 30%）
 * 根據命宮主星和今日流轉
 */
function calculateZiweiDailyScore(ziwei: ZiweiChart): {
  scores: FortuneScores;
  highlight: string;
} {
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const seed = dayOfYear * 7 + today.getFullYear();

  const mingStars = ziwei.mingGong.mainStars;
  const hasBenefic = mingStars.some(s => s.nature === 'benefic');
  const hasMalefic = mingStars.some(s => s.nature === 'malefic');

  const baseMod = hasBenefic ? 8 : hasMalefic ? -5 : 0;

  // 根據今日流轉宮位（簡化：dayOfYear % 12 對應宮位）
  const todayPalaceIdx = dayOfYear % 12;
  const todayPalace = ziwei.palaces[todayPalaceIdx];
  const todayBenefic = todayPalace?.mainStars.some(s => s.nature === 'benefic') ? 5 : 0;

  const base = 52 + baseMod + todayBenefic;

  const scores: FortuneScores = {
    wealth: clamp(base + seededRandom(seed + 100, -8, 10)),
    love: clamp(base + seededRandom(seed + 101, -8, 10)),
    career: clamp(base + seededRandom(seed + 102, -8, 10)),
    health: clamp(base + seededRandom(seed + 103, -8, 10)),
    study: clamp(base + seededRandom(seed + 104, -8, 10)),
  };

  const starNames = mingStars.map(s => s.name).join('、') || '空宮';
  const highlight = `命宮${starNames}，今臨${todayPalace?.name || '命宮'}`;

  return { scores, highlight };
}

/**
 * 奇門遁甲日運分析（權重 25%）
 * 根據當前時盤吉凶
 */
function calculateQimenDailyScore(qimen: QimenChart): {
  scores: FortuneScores;
  highlight: string;
  luckyDirections: string[];
} {
  const auspiciousCount = qimen.palaces.filter(p => p.isAuspicious).length;
  const base = 40 + auspiciousCount * 5;

  const today = new Date();
  const seed = getDayOfYear(today) * 13;

  const scores: FortuneScores = {
    wealth: clamp(base + seededRandom(seed + 200, -5, 12)),
    love: clamp(base + seededRandom(seed + 201, -5, 12)),
    career: clamp(base + seededRandom(seed + 202, -5, 12)),
    health: clamp(base + seededRandom(seed + 203, -5, 12)),
    study: clamp(base + seededRandom(seed + 204, -5, 12)),
  };

  const highlight = `${qimen.currentShichen}，吉方${qimen.auspiciousDirections.slice(0, 2).join('、')}`;

  return { scores, highlight, luckyDirections: qimen.auspiciousDirections };
}

/**
 * 西洋占星日運分析（權重 10%）
 */
function calculateAstrologyDailyScore(astrology: AstrologyResult): {
  scores: FortuneScores;
  highlight: string;
} {
  const today = new Date();
  const seed = getDayOfYear(today) * 17 + today.getFullYear();

  // 基於星座特質給予不同偏好
  const modalityMod: Record<string, Record<keyof FortuneScores, number>> = {
    cardinal: { wealth: 3, love: 0, career: 5, health: 0, study: 2 },
    fixed: { wealth: 5, love: 3, career: 2, health: 3, study: 0 },
    mutable: { wealth: 0, love: 5, career: 0, health: 2, study: 5 },
  };

  const mod = modalityMod[astrology.modality] || modalityMod.cardinal;
  const base = 50;

  const scores: FortuneScores = {
    wealth: clamp(base + mod.wealth + seededRandom(seed + 300, -5, 8)),
    love: clamp(base + mod.love + seededRandom(seed + 301, -5, 8)),
    career: clamp(base + mod.career + seededRandom(seed + 302, -5, 8)),
    health: clamp(base + mod.health + seededRandom(seed + 303, -5, 8)),
    study: clamp(base + mod.study + seededRandom(seed + 304, -5, 8)),
  };

  const highlight = `${astrology.signChinese}${astrology.signEmoji}，守護星${astrology.rulingPlanetChinese}`;

  return { scores, highlight };
}

// ═══════════════════════════════════════
// 主函式
// ═══════════════════════════════════════

/**
 * 計算統一運勢（四引擎合一）
 */
export function calculateUnifiedFortune(
  bazi: BaziResult,
  ziwei: ZiweiChart,
  qimen: QimenChart,
  astrology: AstrologyResult,
): UnifiedFortuneResult {
  const baziResult = calculateBaziDailyScore(bazi);
  const ziweiResult = calculateZiweiDailyScore(ziwei);
  const qimenResult = calculateQimenDailyScore(qimen);
  const astrologyResult = calculateAstrologyDailyScore(astrology);

  // 加權合併分數
  const scores: FortuneScores = {
    wealth: Math.round(
      baziResult.scores.wealth * WEIGHTS.bazi +
      ziweiResult.scores.wealth * WEIGHTS.ziwei +
      qimenResult.scores.wealth * WEIGHTS.qimen +
      astrologyResult.scores.wealth * WEIGHTS.astrology
    ),
    love: Math.round(
      baziResult.scores.love * WEIGHTS.bazi +
      ziweiResult.scores.love * WEIGHTS.ziwei +
      qimenResult.scores.love * WEIGHTS.qimen +
      astrologyResult.scores.love * WEIGHTS.astrology
    ),
    career: Math.round(
      baziResult.scores.career * WEIGHTS.bazi +
      ziweiResult.scores.career * WEIGHTS.ziwei +
      qimenResult.scores.career * WEIGHTS.qimen +
      astrologyResult.scores.career * WEIGHTS.astrology
    ),
    health: Math.round(
      baziResult.scores.health * WEIGHTS.bazi +
      ziweiResult.scores.health * WEIGHTS.ziwei +
      qimenResult.scores.health * WEIGHTS.qimen +
      astrologyResult.scores.health * WEIGHTS.astrology
    ),
    study: Math.round(
      baziResult.scores.study * WEIGHTS.bazi +
      ziweiResult.scores.study * WEIGHTS.ziwei +
      qimenResult.scores.study * WEIGHTS.qimen +
      astrologyResult.scores.study * WEIGHTS.astrology
    ),
  };

  const overallScore = Math.round(
    (scores.wealth + scores.love + scores.career + scores.health + scores.study) / 5
  );

  const overallLevel = getGrade(overallScore);

  // 吉色 = 有利五行對應顏色
  const luckyColors = ELEMENT_COLORS[baziResult.luckyElement] || ['金色'];

  // 吉數 = 根據日主推算
  const today = new Date();
  const seed = getDayOfYear(today);
  const luckyNumbers = [
    ((seed * 3 + 1) % 9) + 1,
    ((seed * 7 + 3) % 9) + 1,
    ((seed * 11 + 5) % 9) + 1,
  ].filter((v, i, a) => a.indexOf(v) === i); // 去重

  return {
    scores,
    overallScore,
    overallLevel,
    luckyDirections: qimenResult.luckyDirections,
    luckyColors,
    luckyNumbers,
    luckyElement: baziResult.luckyElement,
    avoidElement: baziResult.avoidElement,
    baziHighlight: baziResult.highlight,
    ziweiHighlight: ziweiResult.highlight,
    qimenHighlight: qimenResult.highlight,
    astrologyHighlight: astrologyResult.highlight,
  };
}

/**
 * 取得統一運勢描述字串（給 Claude API 用）
 */
export function getUnifiedFortuneDescription(result: UnifiedFortuneResult): string {
  return `今日綜合運勢：${result.overallLevel}(${result.overallScore}分)。`
    + `財運${result.scores.wealth}、感情${result.scores.love}、事業${result.scores.career}、`
    + `健康${result.scores.health}、學業${result.scores.study}。`
    + `有利五行：${result.luckyElement}。不利五行：${result.avoidElement}。`
    + `吉方：${result.luckyDirections.join('、')}。吉色：${result.luckyColors.join('、')}。`
    + `八字：${result.baziHighlight}。紫微：${result.ziweiHighlight}。`
    + `奇門：${result.qimenHighlight}。占星：${result.astrologyHighlight}。`;
}

// ─── 工具函式 ───

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function seededRandom(seed: number, min: number, max: number): number {
  const s = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Math.round(min + s * (max - min));
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function getGrade(score: number): FortuneGrade {
  if (score >= 80) return '大吉';
  if (score >= 65) return '中吉';
  if (score >= 50) return '小吉';
  if (score >= 35) return '平';
  return '凶';
}
