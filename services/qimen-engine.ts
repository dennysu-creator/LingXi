// ═══════════════════════════════════════
// 奇門遁甲排盤引擎（簡化版）
// 每 2 小時一個時盤
// ═══════════════════════════════════════

import { EIGHT_GATES, NINE_STARS, NINE_PALACES } from '@/config/constants';
import { getCurrentShichen } from './bazi-engine';
import { getDayOfYear } from './date-utils';

export interface QimenPalace {
  position: number;
  direction: string;
  trigram: string;
  gate: string;
  star: string;
  isAuspicious: boolean;
}

export interface QimenChart {
  palaces: QimenPalace[];
  currentShichen: string;
  hours: string;
  auspiciousDirections: string[];
  inauspiciousDirections: string[];
  summary: string;
}

// 吉門
const AUSPICIOUS_GATES = ['開門', '休門', '生門', '景門'];
// 凶門
const INAUSPICIOUS_GATES = ['死門', '傷門', '驚門', '杜門'];

/**
 * 根據時辰生成奇門遁甲盤（簡化版）
 * 
 * 注意：這是簡化的演算法，用於 MVP。
 * 正式版應接入完整的奇門遁甲排盤庫，考慮：
 * - 陰遁/陽遁
 * - 上中下三元
 * - 值符值使
 * - 旬首
 * 
 * 建議正式版使用的開源庫：
 * - qimen-dunjia-js (npm)
 * - 或自行根據《奇門遁甲統宗》實現
 */
export function generateQimenChart(date: Date = new Date()): QimenChart {
  const shichen = getCurrentShichen(date);
  const dayOfYear = getDayOfYear(date);
  const hourIndex = getShichenIndex(date.getHours());

  // 簡化排盤：根據日期和時辰的組合來分配門和星
  const seed = (dayOfYear * 12 + hourIndex) % 72;

  const gateOrder = shuffleWithSeed([...EIGHT_GATES], seed);
  const starOrder = shuffleWithSeed([...NINE_STARS], seed + 37);

  const palaces: QimenPalace[] = NINE_PALACES.map((palace, i) => {
    const gate = i === 4 ? '—' : gateOrder[i > 4 ? i - 1 : i]; // 中宮無門
    const star = starOrder[i];
    const isAuspicious = AUSPICIOUS_GATES.includes(gate);

    return {
      position: palace.position,
      direction: palace.direction,
      trigram: palace.trigram,
      gate,
      star,
      isAuspicious,
    };
  });

  const auspiciousDirections = palaces
    .filter(p => p.isAuspicious && p.direction !== '中宮')
    .map(p => p.direction);

  const inauspiciousDirections = palaces
    .filter(p => !p.isAuspicious && p.direction !== '中宮' && p.gate !== '—')
    .map(p => p.direction);

  // 生成摘要
  const openGatePalace = palaces.find(p => p.gate === '開門');
  const lifeGatePalace = palaces.find(p => p.gate === '生門');
  const viewGatePalace = palaces.find(p => p.gate === '景門');

  const summaryParts: string[] = [];
  if (openGatePalace) summaryParts.push(`開門落${openGatePalace.direction}，適合出行談判`);
  if (lifeGatePalace) summaryParts.push(`生門落${lifeGatePalace.direction}，利於理財投資`);
  if (viewGatePalace) summaryParts.push(`景門落${viewGatePalace.direction}，社交運旺盛`);

  return {
    palaces,
    currentShichen: shichen.name,
    hours: shichen.hours,
    auspiciousDirections,
    inauspiciousDirections,
    summary: summaryParts.join('\n'),
  };
}

/**
 * 取得奇門盤的字串描述（給 Claude API 用）
 */
export function getQimenDescription(chart: QimenChart): string {
  const palaceDesc = chart.palaces
    .filter(p => p.gate !== '—')
    .map(p => `${p.direction}：${p.gate}(${p.star})${p.isAuspicious ? '吉' : '凶'}`)
    .join('；');

  return `${chart.currentShichen}(${chart.hours})奇門盤：${palaceDesc}。吉方：${chart.auspiciousDirections.join('、')}。凶方：${chart.inauspiciousDirections.join('、')}。`;
}

// ─── 工具函式 ───

function getShichenIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
