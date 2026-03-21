// ═══════════════════════════════════════
// 八字命理引擎 v2 — 基於 lunar-javascript 精確計算
// 正確處理：節氣換月/年、日柱精確、地支藏干、喜用神
// ═══════════════════════════════════════

import {
  getFourPillars, getTodayPillars, calculateWuxingStrength,
  getDayMasterElement, getWuxingRelation, getShengXiao,
  GAN_WUXING, SHICHEN_NAMES,
  type FourPillars, type GanZhi,
} from './lunar-calendar';

export interface BaziResult {
  year: { stem: string; branch: string; full: string };
  month: { stem: string; branch: string; full: string };
  day: { stem: string; branch: string; full: string };
  hour: { stem: string; branch: string; full: string };
  zodiac: string;
  dayMaster: string;
  dayMasterElement: string;
  wuxingCount: Record<string, number>;
  strongestElement: string;
  weakestElement: string;
  favorableElement: string;
  unfavorableElement: string;
}

const SHENG_MAP: Record<string, string> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
const KE_MAP: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

/**
 * 計算八字命盤（精確版）
 */
export function calculateBazi(year: number, month: number, day: number, hour?: number): BaziResult {
  const pillars = getFourPillars(year, month, day, hour);
  const wuxingCount = calculateWuxingStrength(pillars);
  const dayMasterElement = getDayMasterElement(pillars);
  const zodiac = getShengXiao(year, month, day);

  const sorted = Object.entries(wuxingCount).sort((a, b) => b[1] - a[1]);
  const strongestElement = sorted[0][0];
  const weakestElement = sorted[sorted.length - 1][0];

  const avg = Object.values(wuxingCount).reduce((a, b) => a + b, 0) / 5;
  const dayMasterStrength = wuxingCount[dayMasterElement] || 0;

  const favorableElement = dayMasterStrength < avg ? SHENG_MAP[dayMasterElement] : KE_MAP[dayMasterElement];
  const unfavorableElement = dayMasterStrength < avg ? KE_MAP[dayMasterElement] : SHENG_MAP[dayMasterElement];

  const toResult = (gz: GanZhi) => ({ stem: gz.gan, branch: gz.zhi, full: gz.full });

  return {
    year: toResult(pillars.year),
    month: toResult(pillars.month),
    day: toResult(pillars.day),
    hour: toResult(pillars.hour),
    zodiac,
    dayMaster: pillars.day.gan,
    dayMasterElement,
    wuxingCount,
    strongestElement,
    weakestElement,
    favorableElement,
    unfavorableElement,
  };
}

/**
 * 計算日運（日主 vs 今日日柱生剋）
 */
export function calculateDailyBaziScore(bazi: BaziResult): { score: number; relation: string; advice: string } {
  const todayPillars = getTodayPillars();
  const todayElement = GAN_WUXING[todayPillars.day.gan] || '土';
  const relation = getWuxingRelation(bazi.dayMasterElement, todayElement);

  let score: number;
  let advice: string;

  switch (relation) {
    case 'same':
      score = 75; advice = '今日與日主同氣，比肩之日，適合合作與社交。'; break;
    case 'sheng':
      score = 60; advice = '今日為食傷之日，靈感充沛，適合創作，但注意體力。'; break;
    case 'ke':
      score = 65; advice = '今日為偏財之日，有利理財，但不宜冒進。'; break;
    case 'bei_sheng':
      score = 85; advice = '今日為印星之日，貴人運旺，學習工作效率極高！'; break;
    case 'bei_ke':
      score = 45; advice = '今日為七殺之日，壓力較大，宜低調行事。'; break;
    default:
      score = 70; advice = '今日運勢平穩。';
  }

  if (todayElement === bazi.favorableElement) {
    score += 10;
    advice += '\n✦ 今日五行利喜用神，運勢提升。';
  } else if (todayElement === bazi.unfavorableElement) {
    score -= 8;
    advice += '\n⚠ 今日五行沖忌神，需謹慎。';
  }

  return { score: Math.max(20, Math.min(95, score)), relation, advice };
}

export function getCurrentShichen(): { name: string; index: number; display: string } {
  const h = new Date().getHours();
  const index = h >= 23 || h < 1 ? 0 : Math.floor((h + 1) / 2);
  const names = ['子時', '丑時', '寅時', '卯時', '辰時', '巳時', '午時', '未時', '申時', '酉時', '戌時', '亥時'];
  return { name: names[index], index, display: SHICHEN_NAMES[index] };
}
