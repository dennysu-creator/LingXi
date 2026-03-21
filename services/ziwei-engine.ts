// ═══════════════════════════════════════
// 紫微斗數引擎 v2 — 基於 lunar-javascript 精確計算
// 五行局定紫微、14 主星排盤、12 宮位、四化
// ═══════════════════════════════════════

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZIWEI_MAIN_STARS,
  ZIWEI_PALACES,
  STAR_PROPERTIES,
} from '@/config/constants';
import {
  TIAN_GAN, DI_ZHI, GAN_WUXING,
} from './lunar-calendar';
import type { BaziResult } from './bazi-engine';

// ─── 型別定義 ───

export interface ZiweiStar {
  name: string;
  element: string;
  nature: 'benefic' | 'malefic' | 'neutral';
  domain: string;
}

export interface SiHua {
  lu: string;    // 化祿
  quan: string;  // 化權
  ke: string;    // 化科
  ji: string;    // 化忌
}

export interface ZiweiPalace {
  name: string;       // 宮位名稱
  branch: string;     // 地支
  mainStars: ZiweiStar[];
  siHua?: string[];   // 該宮內星耀的四化標記
}

export interface ZiweiChart {
  palaces: ZiweiPalace[];
  mingGong: ZiweiPalace;        // 命宮
  shenGong: string;             // 身宮位置名稱
  mingZhu: string;              // 命主星
  shenZhu: string;              // 身主星
  wuxingJu: string;             // 五行局名稱
  wuxingJuNum: number;          // 五行局數
  siHua: SiHua;                 // 四化
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

// ─── 四化對照表（依年干） ───
// 化祿、化權、化科、化忌
const SI_HUA_TABLE: Record<string, [string, string, string, string]> = {
  '甲': ['廉貞', '破軍', '武曲', '太陽'],
  '乙': ['天機', '天梁', '紫微', '太陰'],
  '丙': ['天同', '天機', '文昌', '廉貞'],
  '丁': ['太陰', '天同', '天機', '巨門'],
  '戊': ['貪狼', '太陰', '太陽', '天機'],
  '己': ['武曲', '貪狼', '天梁', '文曲'],
  '庚': ['太陽', '武曲', '太陰', '天同'],
  '辛': ['巨門', '太陽', '文曲', '文昌'],
  '壬': ['天梁', '紫微', '天府', '武曲'],
  '癸': ['破軍', '巨門', '太陰', '貪狼'],
};

// ─── 納音五行局：由命宮天干+地支查表 ───
// 五行局: 水二局=2, 木三局=3, 金四局=4, 土五局=5, 火六局=6
// 納音五行 = f(命宮天干, 命宮地支)
// 60 甲子納音 → 五行局數對照（標準排法）

/**
 * 根據命宮天干地支的納音五行計算五行局數
 * 納音口訣簡化查表法
 */
function getNayinJu(gan: string, zhi: string): { name: string; num: number } {
  // 天干索引（甲=0 ... 癸=9）
  const ganIdx = TIAN_GAN.indexOf(gan);
  // 地支索引（子=0 ... 亥=11）
  const zhiIdx = DI_ZHI.indexOf(zhi);

  // 納音五行速算：
  // 步驟1: 天干配數 = floor(ganIdx/2)  → 甲乙=0, 丙丁=1, 戊己=2, 庚辛=3, 壬癸=4
  // 步驟2: 地支配數 = floor(zhiIdx/2) % 3 → 子丑=0, 寅卯=1, 辰巳=2, 午未=0, 申酉=1, 戌亥=2
  // 步驟3: 納音五行 = (ganPair * 2 + zhiPair) % 5
  //   0=金四局, 1=火六局, 2=木三局, 3=水二局, 4=土五局
  const ganPair = Math.floor(ganIdx / 2);
  const zhiPair = Math.floor(zhiIdx / 2) % 3;
  const nayinIdx = (ganPair + zhiPair) % 5;

  const JU_MAP: { name: string; num: number }[] = [
    { name: '金四局', num: 4 },
    { name: '火六局', num: 6 },
    { name: '木三局', num: 3 },
    { name: '水二局', num: 2 },
    { name: '土五局', num: 5 },
  ];

  return JU_MAP[nayinIdx];
}

/**
 * 用五鼠遁年法，由年干推算命宮天干
 * 命宮地支已知(mingGongZhi)，需要搭配正確天干
 */
function getMingGongGan(yearGan: string, mingGongZhi: string): string {
  // 五虎遁：年干 → 寅月起始天干
  const yearStart: Record<string, number> = {
    '甲': 2, '己': 2,  // 甲己之年丙作首（寅=丙）
    '乙': 4, '庚': 4,  // 乙庚之歲戊為頭（寅=戊）
    '丙': 6, '辛': 6,  // 丙辛之歲庚為頭（寅=庚）
    '丁': 8, '壬': 8,  // 丁壬壬寅順水流（寅=壬）
    '戊': 0, '癸': 0,  // 戊癸之歲甲為頭（寅=甲）
  };

  const startGanIdx = yearStart[yearGan] ?? 0;
  const zhiIdx = DI_ZHI.indexOf(mingGongZhi);
  // 從寅(idx=2)開始算
  const offset = (zhiIdx - 2 + 12) % 12;
  const ganIdx = (startGanIdx + offset) % 10;
  return TIAN_GAN[ganIdx];
}

// ─── 紫微星定位：五行局數 + 農曆日 → 紫微所在宮位 ───
/**
 * 正統紫微星安星法
 * 紫微星宮位 = f(五行局數, 農曆生日)
 *
 * 算法：
 * 1. 以農曆日數除以五行局數（進位取整）得商數
 * 2. 商數即為紫微星在十二宮中的位置（從寅宮起算）
 * 3. 奇數商直接定位，偶數商需退一位
 *
 * 簡化為查表法（標準紫微斗數排盤規則）
 */
function getZiweiPosition(lunarDay: number, juNum: number): number {
  // 標準算法: 求紫微星在哪一宮（以寅=0 的索引計算，最終轉為地支索引）
  // 紫微安星口訣：局數除日數，得商看奇偶
  // 商奇 → 商數位; 商偶 → 商數位-1 再補正

  // 正統做法：逐步加局數直到 >= lunarDay
  let pos = 0;
  let accumulated = 0;

  while (accumulated < lunarDay) {
    accumulated += juNum;
    pos++;

    // 偶數位需要前進；奇數位不動（這是紫微安星的奇偶進退規則）
    if (accumulated >= lunarDay) break;

    // 如果剛好整除，且 pos 為偶數，需要再前進一位
    if (accumulated === lunarDay) break;
  }

  // pos 表示從寅宮起算的位置（1-based）
  // 紫微在第 pos 個宮位，轉換為地支索引（寅=2）
  const zhiIndex = (2 + pos - 1) % 12;
  return zhiIndex;
}

// 更精確的紫微安星：使用標準紫微斗數排盤的安紫微訣
function getZiweiPositionStandard(lunarDay: number, juNum: number): number {
  // 標準算法：日數 / 局數 = 商 ... 餘
  // 餘數為 0 → 紫微在「商」對應的宮位
  // 餘數為奇數 → 商 + 餘數 對應宮位
  // 餘數為偶數 → 商 + 餘數 + 1 對應宮位（偶進奇不進）
  //
  // 完整查表法（最可靠）
  // 以下是直接計算法，等效查表

  let q = Math.floor(lunarDay / juNum);
  let r = lunarDay % juNum;

  if (r === 0) {
    // 整除：紫微在第 q 宮（1-based from 寅）
    // 但要看 q 的奇偶
    // 整除時 q 直接就是位置
  } else {
    // 有餘數
    q += 1; // 進位
    // 餘數偶數要再前進，奇數不動
    if (r % 2 === 0) {
      q += 1;
    }
  }

  // q 是以寅宮為第 1 宮的 1-based 索引
  // 轉換為地支索引：寅=2
  const zhiIndex = (2 + q - 1) % 12;
  return zhiIndex;
}


/**
 * 根據紫微星位置順序排列紫微星系（逆時針排列）
 * 紫微、天機、(空)、太陽、武曲、天同、(空)(空)(空)、廉貞
 */
function placeZiweiGroup(ziweiPos: number): Map<number, string> {
  const stars = new Map<number, string>();
  // 紫微星系從紫微逆時針排列（位置遞減）
  const offsets = [
    { star: '紫微', offset: 0 },
    { star: '天機', offset: -1 },
    // -2 空
    { star: '太陽', offset: -3 },
    { star: '武曲', offset: -4 },
    { star: '天同', offset: -5 },
    // -6, -7, -8 空（後三位由天府星系補）
    { star: '廉貞', offset: -8 },
  ];
  for (const { star, offset } of offsets) {
    const pos = ((ziweiPos + offset) % 12 + 12) % 12;
    stars.set(pos, star);
  }
  return stars;
}

/**
 * 根據紫微星位置計算天府星位置，然後順時針排列天府星系
 * 天府位置 = 以寅-辰軸為中心，紫微的對稱位置
 */
function placeTianfuGroup(ziweiPos: number): Map<number, string> {
  // 天府星位置：紫微與天府以「寅-辰」為軸對稱
  // 公式：天府 = (4 - ziweiPos + 12) % 12  (辰=4 為鏡軸)
  // 更精確的鏡像公式：天府索引 = (4 - (ziweiPos - 2) + 2 + 12) % 12
  //                           = (8 - ziweiPos + 12) % 12
  // 但傳統上是以「辰宮」為鏡像軸：
  // 天府 = ((2 + 4) - ziweiPos + 12) % 12 = (6 - ziweiPos + 12) % 12
  //
  // 標準鏡像: 紫微在寅(2)→天府在辰(4); 紫微在卯(3)→天府在卯(3)
  // 紫微在辰(4)→天府在寅(2); 紫微在子(0)→天府在午(6)
  // 規律: 天府 = (2+4 - ziweiPos) mod 12 = (6 - ziweiPos + 12) % 12
  // 驗證: 紫微寅(2)→天府=(6-2)=4辰 ✓
  //       紫微卯(3)→天府=(6-3)=3卯 ✓
  //       紫微子(0)→天府=(6-0)=6午 ✓

  const tianfuPos = (6 - ziweiPos + 12) % 12;

  const stars = new Map<number, string>();
  const offsets = [
    { star: '天府', offset: 0 },
    { star: '太陰', offset: 1 },
    { star: '貪狼', offset: 2 },
    { star: '巨門', offset: 3 },
    { star: '天相', offset: 4 },
    { star: '天梁', offset: 5 },
    { star: '七殺', offset: 6 },
    // +7, +8, +9 空
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
 * 口訣：以月數加時辰，從寅宮逆算
 * 命宮 = 寅 + (月-1) - (時辰索引)
 */
function getMingGongIndex(lunarMonth: number, hourBranchIndex: number): number {
  return ((2 + lunarMonth - 1) - hourBranchIndex + 24) % 12;
}

/**
 * 計算身宮位置
 * 身宮 = 寅 + (月-1) + (時辰索引)
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
  const yearGan = bazi.year.stem;
  const yearZhi = bazi.year.branch;

  // 1. 計算命宮和身宮位置
  const hourBranchIndex = (EARTHLY_BRANCHES as readonly string[]).indexOf(bazi.hour.branch);
  const mingGongIdx = getMingGongIndex(lunarMonth, hourBranchIndex >= 0 ? hourBranchIndex : 0);
  const shenGongIdx = getShenGongIndex(lunarMonth, hourBranchIndex >= 0 ? hourBranchIndex : 0);

  // 2. 計算命宮天干（五虎遁），用於納音五行局
  const mingGongZhi = EARTHLY_BRANCHES[mingGongIdx];
  const mingGongGan = getMingGongGan(yearGan, mingGongZhi as string);

  // 3. 以命宮干支查納音 → 五行局
  const { name: wuxingJuName, num: juNum } = getNayinJu(mingGongGan, mingGongZhi as string);

  // 4. 以五行局數 + 農曆日定紫微星位置
  const dayIndex = Math.max(1, Math.min(30, lunarDay));
  const ziweiPos = getZiweiPositionStandard(dayIndex, juNum);

  // 5. 排列紫微星系和天府星系
  const ziweiGroup = placeZiweiGroup(ziweiPos);
  const tianfuGroup = placeTianfuGroup(ziweiPos);

  // 6. 計算四化
  const siHuaStars = SI_HUA_TABLE[yearGan] || SI_HUA_TABLE['甲'];
  const siHua: SiHua = {
    lu: siHuaStars[0],
    quan: siHuaStars[1],
    ke: siHuaStars[2],
    ji: siHuaStars[3],
  };

  // 建立星名 → 四化標記 的映射
  const siHuaMap = new Map<string, string>();
  siHuaMap.set(siHua.lu, '化祿');
  siHuaMap.set(siHua.quan, '化權');
  siHuaMap.set(siHua.ke, '化科');
  siHuaMap.set(siHua.ji, '化忌');

  // 7. 將宮位名稱按命宮起始排列
  const palaces: ZiweiPalace[] = [];
  for (let i = 0; i < 12; i++) {
    const palaceIdx = (mingGongIdx + i) % 12;
    const branch = EARTHLY_BRANCHES[palaceIdx];
    const stars: ZiweiStar[] = [];
    const huaLabels: string[] = [];

    // 檢查紫微星系
    const zStar = ziweiGroup.get(palaceIdx);
    if (zStar && STAR_PROPERTIES[zStar]) {
      stars.push({ name: zStar, ...STAR_PROPERTIES[zStar] });
      const hua = siHuaMap.get(zStar);
      if (hua) huaLabels.push(`${zStar}${hua}`);
    }

    // 檢查天府星系
    const tStar = tianfuGroup.get(palaceIdx);
    if (tStar && STAR_PROPERTIES[tStar]) {
      stars.push({ name: tStar, ...STAR_PROPERTIES[tStar] });
      const hua = siHuaMap.get(tStar);
      if (hua) huaLabels.push(`${tStar}${hua}`);
    }

    palaces.push({
      name: ZIWEI_PALACES[i],
      branch: branch as string,
      mainStars: stars,
      siHua: huaLabels.length > 0 ? huaLabels : undefined,
    });
  }

  // 8. 命宮和身宮
  const mingGong = palaces[0]; // 第一個就是命宮
  const shenGongPalace = ZIWEI_PALACES[((shenGongIdx - mingGongIdx + 12) % 12)];

  // 9. 命主星和身主星
  const yearBranch = yearZhi;
  const mingZhu = MING_ZHU[yearBranch] || '貪狼';
  const shenZhu = SHEN_ZHU[yearBranch] || '天相';

  // 10. 命盤主要五行
  const elementCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  for (const palace of palaces) {
    for (const star of palace.mainStars) {
      elementCount[star.element] = (elementCount[star.element] || 0) + 1;
    }
  }
  const dominantElement = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])[0][0];

  // 11. 性格、事業、感情分析
  const personality = getPersonality(mingGong.mainStars.map(s => s.name));
  const careerPalace = palaces[8]; // 官祿宮（第 9 宮）
  const careerAptitude = getCareerAptitude(careerPalace.mainStars.map(s => s.name));
  const lovePalace = palaces[2]; // 夫妻宮（第 3 宮）
  const loveStyle = getLoveStyle(lovePalace.mainStars.map(s => s.name));

  // 12. 四化描述
  const siHuaDesc = `化祿:${siHua.lu}、化權:${siHua.quan}、化科:${siHua.ke}、化忌:${siHua.ji}`;

  // 13. 完整命盤描述（給 Claude API 用）
  const palaceDescriptions = palaces.map(p => {
    const starNames = p.mainStars.map(s => s.name).join('、') || '空宮';
    const huaStr = p.siHua ? `(${p.siHua.join('、')})` : '';
    return `${p.name}(${p.branch})：${starNames}${huaStr}`;
  }).join('；');

  const fullChartString = `紫微斗數命盤：${wuxingJuName}，命主星${mingZhu}，身主星${shenZhu}。`
    + `四化：${siHuaDesc}。`
    + `${palaceDescriptions}。`
    + `性格：${personality}。事業：${careerAptitude}。`;

  return {
    palaces,
    mingGong,
    shenGong: shenGongPalace as string,
    mingZhu,
    shenZhu,
    wuxingJu: wuxingJuName,
    wuxingJuNum: juNum,
    siHua,
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
