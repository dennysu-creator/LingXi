// ═══════════════════════════════════════
// 八字命理計算引擎
// 根據出生年月日時計算天干地支、五行比例
// ═══════════════════════════════════════

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  BRANCH_ZODIAC,
  FIVE_ELEMENTS,
  SHICHEN,
} from '@/config/constants';

export interface BaziResult {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
  zodiac: string;
  dayMaster: string;          // 日主（日柱天干）
  dayMasterElement: string;   // 日主五行
  fiveElements: Record<string, number>;  // 五行計數
  dominantElement: string;    // 最旺的五行
  deficientElement: string;   // 最弱的五行
  fullBaziString: string;     // 完整八字字串
}

/**
 * 計算年柱
 */
function getYearPillar(year: number) {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
  };
}

/**
 * 計算月柱（簡化版，精確版需要節氣判斷）
 */
function getMonthPillar(year: number, month: number) {
  // 月柱地支固定：正月=寅，二月=卯...
  const branchIndex = (month + 1) % 12;
  // 月柱天干根據年干推算（五虎遁）
  const yearStemIndex = (year - 4) % 10;
  const monthStemStart = (yearStemIndex % 5) * 2;
  const stemIndex = (monthStemStart + month - 1) % 10;
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
  };
}

/**
 * 計算日柱（簡化版，使用公式近似）
 */
function getDayPillar(year: number, month: number, day: number) {
  // 日柱計算需要萬年曆，這裡用簡化公式
  // 正式版建議使用 lunar-javascript 套件
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000);
  const stemIndex = (diffDays + 10) % 10;
  const branchIndex = (diffDays) % 12;
  return {
    stem: HEAVENLY_STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    branch: EARTHLY_BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
  };
}

/**
 * 計算時柱
 */
function getHourPillar(dayStem: string, hour: number) {
  // 時辰地支
  let branchIndex: number;
  if (hour === 23 || hour === 0) branchIndex = 0;       // 子時
  else branchIndex = Math.floor((hour + 1) / 2);

  // 時柱天干根據日干推算（五鼠遁）
  const dayStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(dayStem);
  const hourStemStart = (dayStemIndex % 5) * 2;
  const stemIndex = (hourStemStart + branchIndex) % 10;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
  };
}

/**
 * 計算五行比例
 */
function calculateFiveElements(
  yearPillar: { stem: string; branch: string },
  monthPillar: { stem: string; branch: string },
  dayPillar: { stem: string; branch: string },
  hourPillar: { stem: string; branch: string }
): Record<string, number> {
  const counts: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

  [yearPillar, monthPillar, dayPillar, hourPillar].forEach(pillar => {
    counts[STEM_ELEMENT[pillar.stem]]++;
    counts[BRANCH_ELEMENT[pillar.branch]]++;
  });

  return counts;
}

/**
 * 取得當前時辰
 */
export function getCurrentShichen(): typeof SHICHEN[number] {
  const hour = new Date().getHours();
  if (hour === 23 || hour === 0) return SHICHEN[0];
  return SHICHEN[Math.floor((hour + 1) / 2)];
}

/**
 * 主函式：計算完整八字
 */
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number
): BaziResult {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(dayPillar.stem, hour);

  const fiveElements = calculateFiveElements(yearPillar, monthPillar, dayPillar, hourPillar);

  // 找出最旺和最弱的五行
  const sorted = Object.entries(fiveElements).sort((a, b) => b[1] - a[1]);
  const dominantElement = sorted[0][0];
  const deficientElement = sorted[sorted.length - 1][0];

  const zodiac = BRANCH_ZODIAC[yearPillar.branch];
  const dayMaster = dayPillar.stem;
  const dayMasterElement = STEM_ELEMENT[dayMaster];

  const fullBaziString = `${yearPillar.stem}${yearPillar.branch}年 ${monthPillar.stem}${monthPillar.branch}月 ${dayPillar.stem}${dayPillar.branch}日 ${hourPillar.stem}${hourPillar.branch}時`;

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    zodiac,
    dayMaster,
    dayMasterElement,
    fiveElements,
    dominantElement,
    deficientElement,
    fullBaziString,
  };
}

/**
 * 根據八字決定靈寵屬性
 */
export function determinePetElement(bazi: BaziResult): string {
  // 靈寵五行 = 用戶最缺的五行（補足不足）
  return bazi.deficientElement;
}
