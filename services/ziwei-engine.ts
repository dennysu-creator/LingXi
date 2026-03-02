// ═══════════════════════════════════════
// 紫微斗數簡化引擎
// 14 主星排盤 + 12 宮位 + 性格/事業分析
// ═══════════════════════════════════════

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZIWEI_MAIN_STARS,
  ZIWEI_PALACES,
  STAR_PROPERTIES,
} from '@/config/constants';
import type { BaziResult } from './bazi-engine';

// ─── 型別定義 ───

export interface ZiweiStar {
  name: string;
  element: string;
  nature: 'benefic' | 'malefic' | 'neutral';
  domain: string;
}

export interface ZiweiPalace {
  name: string;       // 宮位名稱
  branch: string;     // 地支
  mainStars: ZiweiStar[];
}

export interface ZiweiChart {
  palaces: ZiweiPalace[];
  mingGong: ZiweiPalace;        // 命宮
  shenGong: string;             // 身宮位置名稱
  mingZhu: string;              // 命主星
  shenZhu: string;              // 身主星
  dominantElement: string;      // 命盤主要五行
  personality: string;          // 性格概述
  careerAptitude: string;       // 事業方向
  loveStyle: string;            // 感情風格
  fullChartString: string;      // 給 Claude API 用的完整命盤描述
}

// ─── 命主星對照（依年支） ───
const MING_ZHU: Record<string, string> = {
  '子': '貪狼', '丑': '巨門', '寅': '祿存', '卯': '文曲',
  '辰': '廉貞', '巳': '武曲', '午': '破軍', '未': '武曲',
  '申': '廉貞', '酉': '文曲', '戌': '祿存', '亥': '巨門',
};

// ─── 身主星對照（依年支） ───
const SHEN_ZHU: Record<string, string> = {
  '子': '鈴星', '丑': '天相', '寅': '天梁', '卯': '天同',
  '辰': '文昌', '巳': '天機', '午': '火星', '未': '天相',
  '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天機',
};

// ─── 紫微星系定位表（依農曆日數 → 紫微星所在宮位索引） ───
const ZIWEI_POSITION: number[] = [
  // 日數 1-30 對應紫微星的宮位索引 (0-11)
  1, 2, 2, 3, 3, 4, 4, 5, 5, 6,  // 1-10
  6, 7, 7, 8, 8, 9, 9, 10, 10, 11, // 11-20
  11, 0, 0, 1, 1, 2, 2, 3, 3, 4,  // 21-30
];

// ─── 天府星系（與紫微星系相對排列） ───
// 紫微星系：紫微、天機、（空）、太陽、武曲、天同、（空）、廉貞
// 天府星系：天府、太陰、貪狼、巨門、天相、天梁、七殺、（空）、（空）、（空）、（空）、破軍

/**
 * 根據紫微星位置順序排列紫微星系（逆時針）
 */
function placeZiweiGroup(ziweiPos: number): Map<number, string> {
  const stars = new Map<number, string>();
  const offsets = [
    { star: '紫微', offset: 0 },
    { star: '天機', offset: -1 },
    { star: '太陽', offset: -3 },
    { star: '武曲', offset: -4 },
    { star: '天同', offset: -5 },
    { star: '廉貞', offset: -8 },
  ];
  for (const { star, offset } of offsets) {
    const pos = ((ziweiPos + offset) % 12 + 12) % 12;
    stars.set(pos, star);
  }
  return stars;
}

/**
 * 根據天府星位置順序排列天府星系（順時針）
 */
function placeTianfuGroup(ziweiPos: number): Map<number, string> {
  // 天府星位置 = 紫微星的鏡像位置
  const tianfuPos = (12 - ziweiPos + 2 * 2) % 12; // 簡化公式
  const stars = new Map<number, string>();
  const offsets = [
    { star: '天府', offset: 0 },
    { star: '太陰', offset: 1 },
    { star: '貪狼', offset: 2 },
    { star: '巨門', offset: 3 },
    { star: '天相', offset: 4 },
    { star: '天梁', offset: 5 },
    { star: '七殺', offset: 6 },
    { star: '破軍', offset: 10 },
  ];
  for (const { star, offset } of offsets) {
    const pos = (tianfuPos + offset) % 12;
    stars.set(pos, star);
  }
  return stars;
}

/**
 * 計算命宮位置（根據農曆月份和出生時辰）
 */
function getMingGongIndex(lunarMonth: number, hourBranchIndex: number): number {
  // 命宮 = 寅位(index 2) + 月數 - 時辰索引
  return ((2 + lunarMonth - 1) - hourBranchIndex + 24) % 12;
}

/**
 * 計算身宮位置
 */
function getShenGongIndex(lunarMonth: number, hourBranchIndex: number): number {
  return ((2 + lunarMonth - 1) + hourBranchIndex) % 12;
}

/**
 * 根據命宮主星生成性格描述
 */
function getPersonality(mainStars: string[]): string {
  if (mainStars.length === 0) return '命宮無主星，借對宮星力，性格多變適應力強';

  const traits: Record<string, string> = {
    '紫微': '天生領袖氣質，有主見有魄力，適合管理決策',
    '天機': '聰慧機敏善變通，思維活躍直覺強，適合策劃謀略',
    '太陽': '光明磊落重義氣，熱心助人有擔當，外向社交力強',
    '武曲': '剛毅果決重實際，財運天賦高，做事乾脆利落',
    '天同': '溫和福氣善享受，心地善良隨遇而安，晚年特別旺',
    '廉貞': '才華洋溢有個性，感情豐富多變化，桃花旺盛',
    '天府': '穩重大氣守財有方，生活品味高，值得信賴',
    '太陰': '細膩敏感重感情，財運佳尤其不動產，內斂含蓄',
    '貪狼': '多才多藝慾望強，社交能力出眾，充滿魅力',
    '巨門': '口才佳善分析，適合研究學術，但需注意口舌是非',
    '天相': '正直穩重有貴人緣，適合輔佐要職，人緣好',
    '天梁': '化煞為權逢凶化吉，長輩緣佳，適合公職教育',
    '七殺': '衝勁十足開創力強，不服輸有野心，適合創業',
    '破軍': '大膽革新不怕變動，先破後立，適合改革創新',
  };

  return mainStars.map(s => traits[s] || '').filter(Boolean).join('；');
}

/**
 * 根據官祿宮主星生成事業方向
 */
function getCareerAptitude(mainStars: string[]): string {
  if (mainStars.length === 0) return '事業多元發展，借助貴人運可在各行業成功';

  const careers: Record<string, string> = {
    '紫微': '適合高階管理、政界、大企業領導',
    '天機': '適合策劃顧問、科技研發、教育培訓',
    '太陽': '適合公關外交、媒體傳播、公職政治',
    '武曲': '適合金融理財、商業貿易、軍警法律',
    '天同': '適合文化藝術、社會福利、餐飲休閒',
    '廉貞': '適合公關行銷、演藝娛樂、法律訴訟',
    '天府': '適合財務管理、房地產、穩健投資',
    '太陰': '適合財務會計、房地產、文化創意',
    '貪狼': '適合業務銷售、演藝娛樂、外交社交',
    '巨門': '適合律師法官、教授學者、媒體評論',
    '天相': '適合人事管理、行政秘書、醫療護理',
    '天梁': '適合教育學術、醫療保健、宗教慈善',
    '七殺': '適合創業投資、軍事安保、運動競技',
    '破軍': '適合改革創新、冒險投資、自由職業',
  };

  return mainStars.map(s => careers[s] || '').filter(Boolean).join('；');
}

/**
 * 根據夫妻宮主星生成感情風格
 */
function getLoveStyle(mainStars: string[]): string {
  if (mainStars.length === 0) return '感情隨緣，適合晚婚或自由戀愛';

  const styles: Record<string, string> = {
    '紫微': '理想型伴侶，對感情有要求，配偶能力強',
    '天機': '感情多變需要新鮮感，配偶聰明善變',
    '太陽': '熱情主動，感情光明正大，配偶事業心強',
    '武曲': '重實際不浪漫，婚後重家庭責任',
    '天同': '溫柔體貼享受甜蜜，感情和諧幸福',
    '廉貞': '桃花旺盛感情豐富，需注意感情波動',
    '天府': '穩定幸福型婚姻，配偶持家有方',
    '太陰': '浪漫多情重感覺，配偶溫柔細膩',
    '貪狼': '桃花最旺，感情經歷豐富，需把持定力',
    '巨門': '感情中需多溝通，避免口舌誤會',
    '天相': '有助配偶事業，感情穩定和諧',
    '天梁': '年齡差距姻緣，配偶成熟穩重',
    '七殺': '感情波折但深刻，配偶個性強烈',
    '破軍': '感情多變動，需要包容和彈性',
  };

  return mainStars.map(s => styles[s] || '').filter(Boolean).join('；');
}

// ═══════════════════════════════════════
// 主函式：計算紫微斗數命盤
// ═══════════════════════════════════════

export function calculateZiweiChart(
  bazi: BaziResult,
  lunarMonth: number,
  lunarDay: number,
  gender: 'male' | 'female',
): ZiweiChart {
  // 1. 確定農曆日對應的紫微星位置
  const dayIndex = Math.max(1, Math.min(30, lunarDay));
  const ziweiPos = ZIWEI_POSITION[dayIndex - 1];

  // 2. 排列紫微星系和天府星系
  const ziweiGroup = placeZiweiGroup(ziweiPos);
  const tianfuGroup = placeTianfuGroup(ziweiPos);

  // 3. 計算命宮和身宮位置
  const hourBranchIndex = (EARTHLY_BRANCHES as readonly string[]).indexOf(bazi.hour.branch);
  const mingGongIdx = getMingGongIndex(lunarMonth, hourBranchIndex >= 0 ? hourBranchIndex : 0);
  const shenGongIdx = getShenGongIndex(lunarMonth, hourBranchIndex >= 0 ? hourBranchIndex : 0);

  // 4. 將宮位名稱按命宮起始排列（命宮所在地支為起點）
  const palaces: ZiweiPalace[] = [];
  for (let i = 0; i < 12; i++) {
    const palaceIdx = (mingGongIdx + i) % 12;
    const branch = EARTHLY_BRANCHES[palaceIdx];
    const stars: ZiweiStar[] = [];

    // 檢查紫微星系
    const zStar = ziweiGroup.get(palaceIdx);
    if (zStar && STAR_PROPERTIES[zStar]) {
      stars.push({ name: zStar, ...STAR_PROPERTIES[zStar] });
    }

    // 檢查天府星系
    const tStar = tianfuGroup.get(palaceIdx);
    if (tStar && STAR_PROPERTIES[tStar]) {
      stars.push({ name: tStar, ...STAR_PROPERTIES[tStar] });
    }

    palaces.push({
      name: ZIWEI_PALACES[i],
      branch,
      mainStars: stars,
    });
  }

  // 5. 命宮和身宮
  const mingGong = palaces[0]; // 第一個就是命宮
  const shenGongPalace = ZIWEI_PALACES[((shenGongIdx - mingGongIdx + 12) % 12)];

  // 6. 命主星和身主星
  const yearBranch = bazi.year.branch;
  const mingZhu = MING_ZHU[yearBranch] || '貪狼';
  const shenZhu = SHEN_ZHU[yearBranch] || '天相';

  // 7. 命盤主要五行
  const elementCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  for (const palace of palaces) {
    for (const star of palace.mainStars) {
      elementCount[star.element] = (elementCount[star.element] || 0) + 1;
    }
  }
  const dominantElement = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])[0][0];

  // 8. 性格、事業、感情分析
  const personality = getPersonality(mingGong.mainStars.map(s => s.name));
  const careerPalace = palaces[8]; // 官祿宮
  const careerAptitude = getCareerAptitude(careerPalace.mainStars.map(s => s.name));
  const lovePalace = palaces[2]; // 夫妻宮
  const loveStyle = getLoveStyle(lovePalace.mainStars.map(s => s.name));

  // 9. 完整命盤描述（給 Claude API 用）
  const palaceDescriptions = palaces.map(p => {
    const starNames = p.mainStars.map(s => s.name).join('、') || '空宮';
    return `${p.name}(${p.branch})：${starNames}`;
  }).join('；');

  const fullChartString = `紫微斗數命盤：命主星${mingZhu}，身主星${shenZhu}。${palaceDescriptions}。性格：${personality}。事業：${careerAptitude}。`;

  return {
    palaces,
    mingGong,
    shenGong: shenGongPalace,
    mingZhu,
    shenZhu,
    dominantElement,
    personality,
    careerAptitude,
    loveStyle,
    fullChartString,
  };
}

/**
 * 取得紫微命盤的字串描述（給 Claude API 用）
 */
export function getZiweiDescription(chart: ZiweiChart): string {
  return chart.fullChartString;
}
