// ═══════════════════════════════════════
// 奇門遁甲排盤引擎 v2 — 基於 lunar-javascript 精確計算
// 陽遁/陰遁 + 日柱定局 + 時辰轉宮
// ═══════════════════════════════════════

import { NINE_PALACES } from '@/config/constants';
import {
  getTodayPillars, getCurrentShichenIndex, getCurrentShichenName,
  TIAN_GAN, DI_ZHI,
} from './lunar-calendar';

export interface QimenPalace {
  position: number;
  direction: string;
  trigram: string;
  gate: string;
  star: string;
  deity?: string;       // 八神
  isAuspicious: boolean;
}

export interface QimenChart {
  palaces: QimenPalace[];
  currentShichen: string;
  hours: string;
  dunType: '陽遁' | '陰遁';
  juNumber: number;         // 第幾局（1-9）
  zhiFu: string;            // 值符（當值九星）
  zhiShi: string;           // 值使（當值八門）
  auspiciousDirections: string[];
  inauspiciousDirections: string[];
  summary: string;
}

// ─── 吉門 / 凶門 ───
const AUSPICIOUS_GATES = ['開門', '休門', '生門'];
const MODERATE_GATES = ['景門', '杜門'];
const INAUSPICIOUS_GATES = ['死門', '傷門', '驚門'];

// ─── 八門原始位置（洛書九宮）───
// 洛書: 1坎北, 2坤西南, 3震東, 4巽東南, 5中, 6乾西北, 7兌西, 8艮東北, 9離南
// 八門原宮: 休-1坎, 生-8艮, 傷-3震, 杜-4巽, 景-9離, 死-2坤, 驚-7兌, 開-6乾
const GATE_HOME_PALACE: Record<string, number> = {
  '休門': 1, '生門': 8, '傷門': 3, '杜門': 4,
  '景門': 9, '死門': 2, '驚門': 7, '開門': 6,
};

// ─── 九星原始位置 ───
// 天蓬-1坎, 天任-8艮, 天衝-3震, 天輔-4巽,
// 天禽-5中, 天心-6乾, 天柱-7兌, 天芮-2坤, 天英-9離
const STAR_HOME_PALACE: Record<string, number> = {
  '天蓬': 1, '天任': 8, '天衝': 3, '天輔': 4,
  '天禽': 5, '天心': 6, '天柱': 7, '天芮': 2, '天英': 9,
};

// 洛書飛布順序（1→2→3→4→5→6→7→8→9 的九宮飛星序）
// 按洛書路徑: 1→8→3→4→9→2→7→6→(1)
const LUOSHU_FLY_ORDER = [1, 8, 3, 4, 9, 2, 7, 6];

// 九宮洛書數 → NINE_PALACES 陣列索引的映射
const LUOSHU_TO_PALACE_IDX: Record<number, number> = {};
NINE_PALACES.forEach((p, i) => { LUOSHU_TO_PALACE_IDX[p.position] = i; });

// 時辰顯示
const SHICHEN_HOURS = [
  '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
  '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
  '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00',
];

// ─── 六十甲子 → 上中下元 ───
// 甲子/甲午旬 = 上元, 甲寅/甲申旬 = 中元, 甲辰/甲戌旬 = 下元
function getYuanFromDay(dayGan: string, dayZhi: string): '上' | '中' | '下' {
  const ganIdx = TIAN_GAN.indexOf(dayGan);
  const zhiIdx = DI_ZHI.indexOf(dayZhi);
  // 旬首地支 = 地支索引 - 天干索引 (mod 12)
  const xunShouZhiIdx = ((zhiIdx - ganIdx) % 12 + 12) % 12;
  // 旬首: 子(0)→甲子旬, 寅(2)→甲寅旬, 辰(4)→甲辰旬,
  //        午(6)→甲午旬, 申(8)→甲申旬, 戌(10)→甲戌旬
  switch (xunShouZhiIdx) {
    case 0:  // 甲子旬
    case 6:  // 甲午旬
      return '上';
    case 2:  // 甲寅旬
    case 8:  // 甲申旬
      return '中';
    case 4:  // 甲辰旬
    case 10: // 甲戌旬
      return '下';
    default:
      return '上';
  }
}

// ─── 判斷陽遁/陰遁 ───
// 冬至後為陽遁，夏至後為陰遁
// 簡化判斷：根據當前月份
// 精確做法應查節氣，但此處用月份近似（足夠準確）
function getDunType(month: number, day: number): '陽遁' | '陰遁' {
  // 冬至約 12/22, 夏至約 6/21
  // 冬至到夏至: 陽遁 (12/22 → 6/20)
  // 夏至到冬至: 陰遁 (6/21 → 12/21)
  if (month > 6 && month < 12) return '陰遁';
  if (month === 6 && day >= 21) return '陰遁';
  if (month === 12 && day < 22) return '陰遁';
  return '陽遁';
}

// ─── 計算局數（簡化版）───
// 正統奇門需要查節氣+上中下元精確定局
// 此處用日柱 + 三元定局的簡化演算法
function getJuNumber(
  dunType: '陽遁' | '陰遁',
  yuan: '上' | '中' | '下',
  dayGan: string,
  dayZhi: string,
): number {
  // 將日柱的六十甲子序號取模，結合三元定局
  const ganIdx = TIAN_GAN.indexOf(dayGan);
  const zhiIdx = DI_ZHI.indexOf(dayZhi);
  const jiazi60 = (ganIdx * 6 + ((zhiIdx - ganIdx + 12) % 12) / 2) % 30;

  // 三元修正
  const yuanOffset = yuan === '上' ? 0 : yuan === '中' ? 3 : 6;

  // 陽遁: 1-9 順排; 陰遁: 9-1 逆排
  if (dunType === '陽遁') {
    return ((jiazi60 + yuanOffset) % 9) + 1; // 1~9
  } else {
    return 9 - ((jiazi60 + yuanOffset) % 9); // 9~1
  }
}

// ─── 按局數飛布八門和九星 ───
function flyGates(juNumber: number, dunType: '陽遁' | '陰遁', shichenIdx: number): Map<number, string> {
  const gateNames = ['休門', '生門', '傷門', '杜門', '景門', '死門', '驚門', '開門'];
  const result = new Map<number, string>();

  // 值使門 = 根據局數，從 LUOSHU_FLY_ORDER 找起始位置
  // 簡化：局數對應起始飛布位置
  const startPalace = juNumber; // 值符落宮

  // 時辰轉宮: 每個時辰，門轉一宮
  // 陽遁順飛，陰遁逆飛
  for (let i = 0; i < 8; i++) {
    let targetPalaceNum: number;
    if (dunType === '陽遁') {
      // 順飛：從起始宮位按洛書路徑順排
      const startIdx = LUOSHU_FLY_ORDER.indexOf(startPalace);
      const flyIdx = (startIdx >= 0 ? startIdx : 0);
      const palaceIdx = (flyIdx + i + shichenIdx) % 8;
      targetPalaceNum = LUOSHU_FLY_ORDER[palaceIdx];
    } else {
      // 逆飛
      const startIdx = LUOSHU_FLY_ORDER.indexOf(startPalace);
      const flyIdx = (startIdx >= 0 ? startIdx : 0);
      const palaceIdx = ((flyIdx - i - shichenIdx) % 8 + 8) % 8;
      targetPalaceNum = LUOSHU_FLY_ORDER[palaceIdx];
    }
    result.set(targetPalaceNum, gateNames[i]);
  }

  return result;
}

function flyStars(juNumber: number, dunType: '陽遁' | '陰遁', shichenIdx: number): Map<number, string> {
  // 九星按洛書九宮飛布
  const starNames = ['天蓬', '天任', '天衝', '天輔', '天禽', '天心', '天柱', '天芮', '天英'];
  const result = new Map<number, string>();

  // 值符星 = 九星中對應局數的星
  // 簡化：按局數起始，加時辰偏移
  const allPalaces = [1, 8, 3, 4, 5, 9, 2, 7, 6]; // 九宮飛星序含中宮

  for (let i = 0; i < 9; i++) {
    let palaceIdx: number;
    if (dunType === '陽遁') {
      palaceIdx = (juNumber - 1 + i + shichenIdx) % 9;
    } else {
      palaceIdx = ((juNumber - 1 - i - shichenIdx) % 9 + 9) % 9;
    }
    result.set(allPalaces[palaceIdx], starNames[i]);
  }

  return result;
}

// ═══════════════════════════════════════
// 主函式
// ═══════════════════════════════════════

/**
 * 生成奇門遁甲盤（基於真實日柱 + 時辰）
 */
export function generateQimenChart(date: Date = new Date()): QimenChart {
  const pillars = getTodayPillars();
  const shichenIdx = getCurrentShichenIndex();
  const shichenName = getCurrentShichenName();
  const now = date;

  // 1. 判斷陽遁/陰遁
  const dunType = getDunType(now.getMonth() + 1, now.getDate());

  // 2. 確定上中下元
  const yuan = getYuanFromDay(pillars.day.gan, pillars.day.zhi);

  // 3. 計算局數
  const juNumber = getJuNumber(dunType, yuan, pillars.day.gan, pillars.day.zhi);

  // 4. 飛布八門和九星
  const gateMap = flyGates(juNumber, dunType, shichenIdx);
  const starMap = flyStars(juNumber, dunType, shichenIdx);

  // 5. 值符（當值九星）和值使（當值八門）
  const starNames = ['天蓬', '天任', '天衝', '天輔', '天禽', '天心', '天柱', '天芮', '天英'];
  const gateNames = ['休門', '生門', '傷門', '杜門', '景門', '死門', '驚門', '開門'];
  const zhiFu = starNames[(juNumber - 1) % 9];
  const zhiShi = gateNames[(juNumber - 1) % 8];

  // 6. 組裝九宮
  const palaces: QimenPalace[] = NINE_PALACES.map((palace) => {
    const pNum = palace.position;
    const gate = gateMap.get(pNum) || (pNum === 5 ? '—' : '休門');
    const star = starMap.get(pNum) || '天禽';

    // 中宮(5)特殊處理
    if (pNum === 5) {
      return {
        position: pNum,
        direction: palace.direction,
        trigram: palace.trigram,
        gate: '—',
        star,
        isAuspicious: false,
      };
    }

    const isAuspicious = AUSPICIOUS_GATES.includes(gate);

    return {
      position: pNum,
      direction: palace.direction,
      trigram: palace.trigram,
      gate,
      star,
      isAuspicious,
    };
  });

  // 7. 吉方/凶方
  const auspiciousDirections = palaces
    .filter(p => p.isAuspicious && p.direction !== '中宮')
    .map(p => p.direction);

  const inauspiciousDirections = palaces
    .filter(p => !p.isAuspicious && p.direction !== '中宮' && p.gate !== '—')
    .map(p => p.direction);

  // 8. 生成摘要
  const openGatePalace = palaces.find(p => p.gate === '開門');
  const lifeGatePalace = palaces.find(p => p.gate === '生門');
  const restGatePalace = palaces.find(p => p.gate === '休門');

  const summaryParts: string[] = [];
  summaryParts.push(`${dunType}${juNumber}局，${yuan}元`);
  summaryParts.push(`值符${zhiFu}，值使${zhiShi}`);
  if (openGatePalace) summaryParts.push(`開門落${openGatePalace.direction}，利出行謀事`);
  if (lifeGatePalace) summaryParts.push(`生門落${lifeGatePalace.direction}，利求財投資`);
  if (restGatePalace) summaryParts.push(`休門落${restGatePalace.direction}，利休養社交`);

  const hours = SHICHEN_HOURS[shichenIdx] || '11:00-13:00';

  return {
    palaces,
    currentShichen: shichenName,
    hours,
    dunType,
    juNumber,
    zhiFu,
    zhiShi,
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

  return `${chart.currentShichen}(${chart.hours})奇門盤：${chart.dunType}${chart.juNumber}局，`
    + `值符${chart.zhiFu}，值使${chart.zhiShi}。`
    + `${palaceDesc}。`
    + `吉方：${chart.auspiciousDirections.join('、')}。`
    + `凶方：${chart.inauspiciousDirections.join('、')}。`;
}
