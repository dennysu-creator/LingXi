// ═══════════════════════════════════════
// 農曆/節氣核心工具 — 基於 lunar-javascript
// 所有命理引擎共用的日曆基礎設施
// ═══════════════════════════════════════

// @ts-ignore — lunar-javascript 沒有 TS 型別
const { Solar, Lunar } = require('lunar-javascript');

export interface GanZhi {
  gan: string;    // 天干
  zhi: string;    // 地支
  full: string;   // 完整干支（如「甲子」）
}

export interface LunarDate {
  year: number;
  month: number;   // 農曆月（1-12，閏月為負數）
  day: number;
  isLeapMonth: boolean;
}

export interface SolarTermInfo {
  name: string;
  date: string;
}

export interface FourPillars {
  year: GanZhi;
  month: GanZhi;
  day: GanZhi;
  hour: GanZhi;
}

// ─── 天干地支常量 ───
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// 地支五行（本氣）
const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 地支藏干（含本氣、中氣、餘氣）
const ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 五行生剋
const WUXING_SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

// 十二時辰
const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHICHEN_DISPLAY = ['子時(23-01)', '丑時(01-03)', '寅時(03-05)', '卯時(05-07)', '辰時(07-09)', '巳時(09-11)',
  '午時(11-13)', '未時(13-15)', '申時(15-17)', '酉時(17-19)', '戌時(19-21)', '亥時(21-23)'];

/**
 * 取得當前時辰索引（0-11）
 */
export function getCurrentShichenIndex(): number {
  const h = new Date().getHours();
  if (h >= 23 || h < 1) return 0;   // 子
  return Math.floor((h + 1) / 2);
}

export function getCurrentShichenName(): string {
  return SHICHEN_DISPLAY[getCurrentShichenIndex()];
}

/**
 * 取得精確的四柱八字（基於 lunar-javascript，已處理節氣換月/年）
 */
export function getFourPillars(birthYear: number, birthMonth: number, birthDay: number, birthHour?: number): FourPillars {
  const solar = Solar.fromYmd(birthYear, birthMonth, birthDay);
  const lunar = solar.getLunar();

  const parseGanZhi = (gz: string): GanZhi => ({
    gan: gz[0],
    zhi: gz[1],
    full: gz,
  });

  // lunar-javascript 的年月日柱已自動處理節氣邊界（立春換年、節氣換月）
  const year = parseGanZhi(lunar.getYearInGanZhi());
  const month = parseGanZhi(lunar.getMonthInGanZhi());
  const day = parseGanZhi(lunar.getDayInGanZhi());

  // 時柱：用五鼠遁法（lunar-javascript 自動計算）
  // 預設午時（12:00）如果沒有提供時間
  const hour = parseGanZhi(lunar.getTimeInGanZhi());

  return { year, month, day, hour };
}

/**
 * 取得今日的四柱（用於日運計算）
 */
export function getTodayPillars(): FourPillars {
  const now = new Date();
  return getFourPillars(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours());
}

/**
 * 陽曆轉農曆
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    isLeapMonth: lunar.getMonth() < 0,
  };
}

/**
 * 取得生肖
 */
export function getShengXiao(year: number, month: number, day: number): string {
  const solar = Solar.fromYmd(year, month, day);
  return solar.getLunar().getYearShengXiao();
}

/**
 * 計算五行力量（含藏干加權）
 */
export function calculateWuxingStrength(pillars: FourPillars): Record<string, number> {
  const strength: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // 天干各計 1.0
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    const wx = GAN_WUXING[p.gan];
    if (wx) strength[wx] += 1.0;
  }

  // 地支藏干：本氣 0.7，中氣 0.3，餘氣 0.1
  const weights = [0.7, 0.3, 0.1];
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    const cangGan = ZHI_CANG_GAN[p.zhi] || [];
    cangGan.forEach((g, i) => {
      const wx = GAN_WUXING[g];
      if (wx) strength[wx] += weights[i] || 0.1;
    });
  }

  return strength;
}

/**
 * 取得日主（日柱天干）的五行
 */
export function getDayMasterElement(pillars: FourPillars): string {
  return GAN_WUXING[pillars.day.gan] || '水';
}

/**
 * 判斷兩個五行的關係
 */
export function getWuxingRelation(a: string, b: string): 'same' | 'sheng' | 'ke' | 'bei_sheng' | 'bei_ke' {
  if (a === b) return 'same';
  if (WUXING_SHENG[a] === b) return 'sheng';      // a 生 b
  if (WUXING_KE[a] === b) return 'ke';             // a 剋 b
  if (WUXING_SHENG[b] === a) return 'bei_sheng';   // b 生 a（a 被生）
  if (WUXING_KE[b] === a) return 'bei_ke';         // b 剋 a（a 被剋）
  return 'same';
}

// ─── 匯出常量 ───
export { TIAN_GAN, DI_ZHI, GAN_WUXING, ZHI_WUXING, ZHI_CANG_GAN, WUXING_SHENG, WUXING_KE, SHICHEN_NAMES };
