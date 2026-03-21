// ═══════════════════════════════════════
// 統一運勢引擎 v2 — 基於真實命理計算
// 八字日運 + 紫微流日 + 奇門方位 + 西洋占星
// 每個維度由實際命理邏輯驅動
// ═══════════════════════════════════════

import { ELEMENT_COLORS } from '@/config/constants';
import {
  getTodayPillars, solarToLunar, getWuxingRelation,
  GAN_WUXING, WUXING_SHENG, WUXING_KE,
} from './lunar-calendar';
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

// ─── 五行對應幸運數字 ───
const ELEMENT_LUCKY_NUMBERS: Record<string, number[]> = {
  '金': [4, 9],
  '木': [3, 8],
  '水': [1, 6],
  '火': [2, 7],
  '土': [5, 10],
};

// ─── 十神關係 ───
// 日主 vs 他柱天干的關係
function getTenGodRelation(dayMasterEl: string, otherEl: string): string {
  if (dayMasterEl === otherEl) return '比劫';
  if (WUXING_SHENG[dayMasterEl] === otherEl) return '食傷'; // 我生
  if (WUXING_KE[dayMasterEl] === otherEl) return '財星';    // 我剋
  if (WUXING_SHENG[otherEl] === dayMasterEl) return '印星'; // 生我
  if (WUXING_KE[otherEl] === dayMasterEl) return '官殺';    // 剋我
  return '比劫';
}

// ─── 判斷星耀是否為桃花星 ───
function isPeachBlossomStar(starName: string): boolean {
  return ['貪狼', '廉貞', '太陰', '天同'].includes(starName);
}

// ─── 判斷星耀是否為文昌類 ───
function isAcademicStar(starName: string): boolean {
  return ['天機', '天梁', '文昌', '文曲'].includes(starName);
}

// ─── 判斷星耀是否利於財運 ───
function isWealthStar(starName: string): boolean {
  return ['武曲', '太陰', '天府', '祿存'].includes(starName);
}

// ─── 判斷星耀是否利於事業 ───
function isCareerStar(starName: string): boolean {
  return ['紫微', '太陽', '天府', '天相', '天梁'].includes(starName);
}

// ═══════════════════════════════════════
// 子引擎：八字日運分析（權重 35%）
// ═══════════════════════════════════════

function calculateBaziDailyScores(bazi: BaziResult): {
  scores: FortuneScores;
  highlight: string;
  luckyElement: string;
  avoidElement: string;
} {
  const todayPillars = getTodayPillars();
  const dayMasterEl = bazi.dayMasterElement;
  const todayDayEl = GAN_WUXING[todayPillars.day.gan] || '土';
  const todayMonthEl = GAN_WUXING[todayPillars.month.gan] || '土';

  // 日主 vs 今日天干的十神關係
  const tenGod = getTenGodRelation(dayMasterEl, todayDayEl);

  // 基礎分 — 根據十神吉凶
  const tenGodBase: Record<string, number> = {
    '印星': 72,   // 貴人相助
    '比劫': 65,   // 同氣互助
    '食傷': 60,   // 才華洩秀
    '財星': 58,   // 求財需費力
    '官殺': 48,   // 壓力日
  };
  const baseScore = tenGodBase[tenGod] || 60;

  // ── 財運: 日主剋者為偏財，今日天干為財星 → 利財 ──
  const wealthEl = WUXING_KE[dayMasterEl] || '土'; // 我剋者
  const wealthRelation = getWuxingRelation(todayDayEl, wealthEl);
  let wealthScore = baseScore;
  if (tenGod === '財星') wealthScore += 15;               // 今天就是財星日
  if (wealthRelation === 'same') wealthScore += 8;         // 今日天干五行 = 財星五行
  if (bazi.favorableElement === wealthEl) wealthScore += 5; // 財星為喜用
  if (bazi.unfavorableElement === wealthEl) wealthScore -= 8;

  // ── 感情: 桃花位（日支看桃花） ──
  // 桃花地支: 子午卯酉
  const peachBranches = ['子', '午', '卯', '酉'];
  let loveScore = baseScore;
  if (peachBranches.includes(todayPillars.day.zhi)) loveScore += 12;  // 桃花日
  if (tenGod === '食傷') loveScore += 8;   // 食傷日表達慾強
  if (tenGod === '官殺') loveScore -= 5;   // 壓力日不利桃花

  // ── 事業: 剋我者為正官 ──
  const careerEl = WUXING_KE[todayDayEl] === dayMasterEl ? todayDayEl : '';
  let careerScore = baseScore;
  if (tenGod === '官殺') careerScore += 10;    // 官殺日有工作壓力但利仕途
  if (tenGod === '印星') careerScore += 12;    // 印星日利考核升遷
  if (tenGod === '比劫') careerScore += 3;     // 同氣合作
  if (bazi.favorableElement === todayDayEl) careerScore += 6;

  // ── 健康: 五行平衡 ──
  const wuxingValues = Object.values(bazi.wuxingCount);
  const maxWx = Math.max(...wuxingValues);
  const minWx = Math.min(...wuxingValues);
  const balance = maxWx - minWx;
  let healthScore = baseScore;
  if (balance <= 2) healthScore += 12;          // 五行平衡
  else if (balance <= 3.5) healthScore += 4;
  else healthScore -= 8;                        // 嚴重失衡
  if (tenGod === '官殺') healthScore -= 6;      // 壓力傷身
  if (tenGod === '印星') healthScore += 5;      // 印星護身

  // ── 學業: 生我者為印星 ──
  const studyEl = WUXING_SHENG[todayDayEl] === dayMasterEl ? todayDayEl : '';
  let studyScore = baseScore;
  if (tenGod === '印星') studyScore += 15;      // 印星日大利學習
  if (tenGod === '食傷') studyScore += 8;       // 食傷日利創意表達
  if (tenGod === '官殺') studyScore -= 3;

  // 喜用神加成
  if (todayDayEl === bazi.favorableElement) {
    wealthScore += 5; loveScore += 3; careerScore += 5;
    healthScore += 3; studyScore += 5;
  } else if (todayDayEl === bazi.unfavorableElement) {
    wealthScore -= 4; loveScore -= 2; careerScore -= 4;
    healthScore -= 3; studyScore -= 4;
  }

  const scores: FortuneScores = {
    wealth: clamp(wealthScore),
    love: clamp(loveScore),
    career: clamp(careerScore),
    health: clamp(healthScore),
    study: clamp(studyScore),
  };

  const highlight = `日主${dayMasterEl}，今日${todayDayEl}氣（${tenGod}日）`;

  return {
    scores,
    highlight,
    luckyElement: bazi.favorableElement,
    avoidElement: bazi.unfavorableElement,
  };
}

// ═══════════════════════════════════════
// 子引擎：紫微流日分析（權重 30%）
// ═══════════════════════════════════════

function calculateZiweiDailyScores(ziwei: ZiweiChart): {
  scores: FortuneScores;
  highlight: string;
} {
  // 流日宮位: 用農曆日 % 12 定流日所臨宮位
  const now = new Date();
  const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const flowDayIdx = ((Math.abs(lunar.day) - 1) % 12); // 0-11

  // 流日所臨宮位
  const flowPalace = ziwei.palaces[flowDayIdx];
  const flowStars = flowPalace?.mainStars || [];
  const hasBenefic = flowStars.some(s => s.nature === 'benefic');
  const hasMalefic = flowStars.some(s => s.nature === 'malefic');

  // 命宮吉凶基底
  const mingStars = ziwei.mingGong.mainStars;
  const mingBenefic = mingStars.some(s => s.nature === 'benefic');
  const baseMod = mingBenefic ? 5 : 0;

  // 流日吉凶
  const flowMod = hasBenefic ? 10 : hasMalefic ? -8 : 0;
  const base = 55 + baseMod + flowMod;

  // ── 財運: 流日宮是否為財帛宮(idx=4) + 武曲/太陰/天府 ──
  const isFlowWealth = flowDayIdx === 4; // 財帛宮
  const hasWealthStar = flowStars.some(s => isWealthStar(s.name));
  // 也看本命財帛宮
  const natalWealthPalace = ziwei.palaces[4]; // 財帛宮
  const natalWealthBenefic = natalWealthPalace?.mainStars.some(s => s.nature === 'benefic') ? 5 : 0;
  let wealthScore = base + natalWealthBenefic;
  if (isFlowWealth) wealthScore += 10;
  if (hasWealthStar) wealthScore += 8;
  // 四化影響
  if (ziwei.siHua && flowStars.some(s => s.name === ziwei.siHua.lu)) wealthScore += 10;
  if (ziwei.siHua && flowStars.some(s => s.name === ziwei.siHua.ji)) wealthScore -= 8;

  // ── 感情: 夫妻宮(idx=2) + 桃花星 ──
  const isFlowLove = flowDayIdx === 2;
  const hasPeachStar = flowStars.some(s => isPeachBlossomStar(s.name));
  const natalLovePalace = ziwei.palaces[2];
  const natalLoveBenefic = natalLovePalace?.mainStars.some(s => s.nature === 'benefic') ? 5 : 0;
  let loveScore = base + natalLoveBenefic;
  if (isFlowLove) loveScore += 10;
  if (hasPeachStar) loveScore += 8;

  // ── 事業: 官祿宮(idx=8) + 紫微/太陽/天府 ──
  const isFlowCareer = flowDayIdx === 8;
  const hasCareerStar_ = flowStars.some(s => isCareerStar(s.name));
  const natalCareerPalace = ziwei.palaces[8];
  const natalCareerBenefic = natalCareerPalace?.mainStars.some(s => s.nature === 'benefic') ? 5 : 0;
  let careerScore = base + natalCareerBenefic;
  if (isFlowCareer) careerScore += 10;
  if (hasCareerStar_) careerScore += 8;
  if (ziwei.siHua && flowStars.some(s => s.name === ziwei.siHua.quan)) careerScore += 8;

  // ── 健康: 疾厄宮(idx=5) ──
  const isFlowHealth = flowDayIdx === 5;
  const natalHealthPalace = ziwei.palaces[5];
  const natalHealthMalefic = natalHealthPalace?.mainStars.some(s => s.nature === 'malefic');
  let healthScore = base + (natalHealthMalefic ? -5 : 3);
  if (isFlowHealth && hasMalefic) healthScore -= 10;
  if (isFlowHealth && hasBenefic) healthScore += 5;

  // ── 學業: 文昌/天機 ──
  const hasAcademic = flowStars.some(s => isAcademicStar(s.name));
  let studyScore = base;
  if (hasAcademic) studyScore += 10;
  if (ziwei.siHua && flowStars.some(s => s.name === ziwei.siHua.ke)) studyScore += 8;

  const scores: FortuneScores = {
    wealth: clamp(wealthScore),
    love: clamp(loveScore),
    career: clamp(careerScore),
    health: clamp(healthScore),
    study: clamp(studyScore),
  };

  const flowStarNames = flowStars.map(s => s.name).join('、') || '空宮';
  const highlight = `流日臨${flowPalace?.name || '命宮'}（${flowStarNames}）`;

  return { scores, highlight };
}

// ═══════════════════════════════════════
// 子引擎：奇門遁甲日運分析（權重 25%）
// ═══════════════════════════════════════

function calculateQimenDailyScores(qimen: QimenChart): {
  scores: FortuneScores;
  highlight: string;
  luckyDirections: string[];
} {
  // 根據門的吉凶分布計算
  const auspiciousCount = qimen.palaces.filter(p => p.isAuspicious).length;

  // 找關鍵門的落宮
  const openGate = qimen.palaces.find(p => p.gate === '開門');
  const lifeGate = qimen.palaces.find(p => p.gate === '生門');
  const restGate = qimen.palaces.find(p => p.gate === '休門');
  const deathGate = qimen.palaces.find(p => p.gate === '死門');
  const hurtGate = qimen.palaces.find(p => p.gate === '傷門');
  const viewGate = qimen.palaces.find(p => p.gate === '景門');

  const base = 45 + auspiciousCount * 4;

  // ── 財運: 生門吉凶 + 開門方位 ──
  let wealthScore = base;
  if (lifeGate?.isAuspicious !== false) wealthScore += 10;
  // 生門落宮的九星也影響: 天心、天任利財
  if (lifeGate && ['天心', '天任', '天輔'].includes(lifeGate.star)) wealthScore += 6;
  if (deathGate && ['天心'].includes(deathGate.star)) wealthScore -= 5; // 死門剋天心

  // ── 感情: 休門位 + 景門位 ──
  let loveScore = base;
  if (restGate?.isAuspicious !== false) loveScore += 8;
  if (viewGate) loveScore += 5; // 景門利社交
  if (hurtGate && qimen.palaces.indexOf(hurtGate) < 4) loveScore -= 5; // 傷門在前方

  // ── 事業: 開門吉凶 + 值符九星 ──
  let careerScore = base;
  if (openGate?.isAuspicious !== false) careerScore += 12;
  if (['天心', '天輔', '天任'].includes(qimen.zhiFu)) careerScore += 6;
  if (['天芮', '天蓬'].includes(qimen.zhiFu)) careerScore -= 5;

  // ── 健康: 凶門數量 + 死門位置 ──
  let healthScore = base + 5;
  const inauspCount = qimen.palaces.filter(p =>
    !p.isAuspicious && p.gate !== '—'
  ).length;
  healthScore -= inauspCount * 2;
  if (deathGate && ['天芮'].includes(deathGate.star)) healthScore -= 6;

  // ── 學業: 杜門（靜思）+ 景門（文明） ──
  let studyScore = base;
  const hideGate = qimen.palaces.find(p => p.gate === '杜門');
  if (hideGate && ['天輔', '天任'].includes(hideGate.star)) studyScore += 8;
  if (viewGate && ['天英', '天輔'].includes(viewGate.star)) studyScore += 6;

  const scores: FortuneScores = {
    wealth: clamp(wealthScore),
    love: clamp(loveScore),
    career: clamp(careerScore),
    health: clamp(healthScore),
    study: clamp(studyScore),
  };

  const highlight = `${qimen.dunType}${qimen.juNumber}局，`
    + `吉方${qimen.auspiciousDirections.slice(0, 2).join('、') || '無'}`;

  return { scores, highlight, luckyDirections: qimen.auspiciousDirections };
}

// ═══════════════════════════════════════
// 子引擎：西洋占星日運分析（權重 10%）
// ═══════════════════════════════════════

function calculateAstrologyDailyScores(astrology: AstrologyResult): {
  scores: FortuneScores;
  highlight: string;
} {
  // 取得今日五行
  const todayPillars = getTodayPillars();
  const todayEl = GAN_WUXING[todayPillars.day.gan] || '土';
  const signWuxing = astrology.wuxingElement;

  // 星座五行 vs 今日五行
  const relation = getWuxingRelation(signWuxing, todayEl);

  // 基於五行關係計算基礎
  let baseMod = 0;
  switch (relation) {
    case 'bei_sheng': baseMod = 10; break;  // 被生，吉
    case 'same': baseMod = 8; break;         // 同氣
    case 'sheng': baseMod = 3; break;        // 我生，小耗
    case 'ke': baseMod = -3; break;          // 我剋，費力
    case 'bei_ke': baseMod = -8; break;      // 被剋，凶
  }

  const base = 52 + baseMod;

  // 星座屬性微調
  const modalityMod: Record<string, Record<keyof FortuneScores, number>> = {
    cardinal: { wealth: 3, love: 0, career: 5, health: 0, study: 2 },
    fixed:    { wealth: 5, love: 3, career: 2, health: 3, study: 0 },
    mutable:  { wealth: 0, love: 5, career: 0, health: 2, study: 5 },
  };

  const mod = modalityMod[astrology.modality] || modalityMod.cardinal;

  const scores: FortuneScores = {
    wealth: clamp(base + mod.wealth),
    love: clamp(base + mod.love),
    career: clamp(base + mod.career),
    health: clamp(base + mod.health),
    study: clamp(base + mod.study),
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
  const baziResult = calculateBaziDailyScores(bazi);
  const ziweiResult = calculateZiweiDailyScores(ziwei);
  const qimenResult = calculateQimenDailyScores(qimen);
  const astrologyResult = calculateAstrologyDailyScores(astrology);

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

  // 吉色 = 喜用神五行對應顏色
  const luckyColors = ELEMENT_COLORS[baziResult.luckyElement] || ['金色'];

  // 吉數 = 喜用神五行對應數字
  const luckyNumbers = ELEMENT_LUCKY_NUMBERS[baziResult.luckyElement] || [1, 6];

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
