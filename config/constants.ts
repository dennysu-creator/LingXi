// ═══════════════════════════════════════
// 靈犀 — 玄學常數定義
// ═══════════════════════════════════════

// 天干
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 地支
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// 五行
export const FIVE_ELEMENTS = ['金', '木', '水', '火', '土'] as const;

// 天干對應五行
export const STEM_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支對應五行
export const BRANCH_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 地支對應生肖
export const BRANCH_ZODIAC: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龍', '巳': '蛇', '午': '馬', '未': '羊',
  '申': '猴', '酉': '雞', '戌': '狗', '亥': '豬',
};

// 時辰對照
export const SHICHEN = [
  { name: '子時', branch: '子', hours: '23:00-01:00' },
  { name: '丑時', branch: '丑', hours: '01:00-03:00' },
  { name: '寅時', branch: '寅', hours: '03:00-05:00' },
  { name: '卯時', branch: '卯', hours: '05:00-07:00' },
  { name: '辰時', branch: '辰', hours: '07:00-09:00' },
  { name: '巳時', branch: '巳', hours: '09:00-11:00' },
  { name: '午時', branch: '午', hours: '11:00-13:00' },
  { name: '未時', branch: '未', hours: '13:00-15:00' },
  { name: '申時', branch: '申', hours: '15:00-17:00' },
  { name: '酉時', branch: '酉', hours: '17:00-19:00' },
  { name: '戌時', branch: '戌', hours: '19:00-21:00' },
  { name: '亥時', branch: '亥', hours: '21:00-23:00' },
] as const;

// 五行生剋關係
export const ELEMENT_RELATIONS = {
  generates: { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }, // 相生
  overcomes: { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }, // 相剋
} as const;

// 五行對應顏色
export const ELEMENT_COLORS: Record<string, string[]> = {
  '金': ['白色', '金色', '銀色'],
  '木': ['綠色', '青色', '翠色'],
  '水': ['黑色', '藍色', '深藍'],
  '火': ['紅色', '橙色', '紫色'],
  '土': ['黃色', '棕色', '米色'],
};

// 八門
export const EIGHT_GATES = ['休門', '生門', '傷門', '杜門', '景門', '死門', '驚門', '開門'] as const;

// 九星
export const NINE_STARS = ['天蓬', '天任', '天衝', '天輔', '天禽', '天心', '天柱', '天芮', '天英'] as const;

// 九宮方位
export const NINE_PALACES = [
  { position: 4, direction: '東南', trigram: '巽' },
  { position: 9, direction: '正南', trigram: '離' },
  { position: 2, direction: '西南', trigram: '坤' },
  { position: 3, direction: '正東', trigram: '震' },
  { position: 5, direction: '中宮', trigram: '中' },
  { position: 7, direction: '正西', trigram: '兌' },
  { position: 8, direction: '東北', trigram: '艮' },
  { position: 1, direction: '正北', trigram: '坎' },
  { position: 6, direction: '西北', trigram: '乾' },
] as const;

// ═══════════════════════════════════════
// 紫微斗數常數
// ═══════════════════════════════════════

// 紫微斗數 14 主星
export const ZIWEI_MAIN_STARS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府',
  '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
] as const;

// 12 宮位
export const ZIWEI_PALACES = [
  '命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮',
  '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮',
] as const;

// 主星性質
export const STAR_PROPERTIES: Record<string, {
  element: string;
  nature: 'benefic' | 'malefic' | 'neutral';
  domain: string;
}> = {
  '紫微': { element: '土', nature: 'benefic', domain: '帝王星，主尊貴領導' },
  '天機': { element: '木', nature: 'benefic', domain: '智慧星，主聰明謀略' },
  '太陽': { element: '火', nature: 'benefic', domain: '光明星，主事業名聲' },
  '武曲': { element: '金', nature: 'benefic', domain: '財星，主財運魄力' },
  '天同': { element: '水', nature: 'benefic', domain: '福星，主安逸享福' },
  '廉貞': { element: '火', nature: 'malefic', domain: '次桃花星，主感情變動' },
  '天府': { element: '土', nature: 'benefic', domain: '財庫星，主守財穩重' },
  '太陰': { element: '水', nature: 'benefic', domain: '財星，主房產財帛' },
  '貪狼': { element: '木', nature: 'neutral', domain: '桃花星，主慾望才藝' },
  '巨門': { element: '水', nature: 'malefic', domain: '暗星，主口舌是非' },
  '天相': { element: '水', nature: 'benefic', domain: '印星，主貴人輔助' },
  '天梁': { element: '土', nature: 'benefic', domain: '蔭星，主化解厄運' },
  '七殺': { element: '金', nature: 'malefic', domain: '將星，主衝勁開創' },
  '破軍': { element: '水', nature: 'malefic', domain: '耗星，主變動破壞再建' },
};

// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 八卦（易經基礎）
// ═══════════════════════════════════════

export const EIGHT_TRIGRAMS = {
  '乾': { symbol: '☰', element: '金', nature: '天' },
  '坤': { symbol: '☷', element: '土', nature: '地' },
  '震': { symbol: '☳', element: '木', nature: '雷' },
  '巽': { symbol: '☴', element: '木', nature: '風' },
  '坎': { symbol: '☵', element: '水', nature: '水' },
  '離': { symbol: '☲', element: '火', nature: '火' },
  '艮': { symbol: '☶', element: '土', nature: '山' },
  '兌': { symbol: '☱', element: '金', nature: '澤' },
} as const;

// ═══════════════════════════════════════
// 西洋占星常數
// ═══════════════════════════════════════

export interface ZodiacSign {
  id: string;
  nameChinese: string;
  emoji: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  wuxing: string;         // 對應五行
  modality: 'cardinal' | 'fixed' | 'mutable';
  rulingPlanet: string;
  rulingPlanetChinese: string;
  polarity: 'yang' | 'yin';
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export const WESTERN_ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries', nameChinese: '牡羊座', emoji: '♈', element: 'fire', wuxing: '火', modality: 'cardinal', rulingPlanet: 'Mars', rulingPlanetChinese: '火星', polarity: 'yang', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { id: 'taurus', nameChinese: '金牛座', emoji: '♉', element: 'earth', wuxing: '土', modality: 'fixed', rulingPlanet: 'Venus', rulingPlanetChinese: '金星', polarity: 'yin', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { id: 'gemini', nameChinese: '雙子座', emoji: '♊', element: 'air', wuxing: '金', modality: 'mutable', rulingPlanet: 'Mercury', rulingPlanetChinese: '水星', polarity: 'yang', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { id: 'cancer', nameChinese: '巨蟹座', emoji: '♋', element: 'water', wuxing: '水', modality: 'cardinal', rulingPlanet: 'Moon', rulingPlanetChinese: '月亮', polarity: 'yin', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { id: 'leo', nameChinese: '獅子座', emoji: '♌', element: 'fire', wuxing: '火', modality: 'fixed', rulingPlanet: 'Sun', rulingPlanetChinese: '太陽', polarity: 'yang', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { id: 'virgo', nameChinese: '處女座', emoji: '♍', element: 'earth', wuxing: '土', modality: 'mutable', rulingPlanet: 'Mercury', rulingPlanetChinese: '水星', polarity: 'yin', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { id: 'libra', nameChinese: '天秤座', emoji: '♎', element: 'air', wuxing: '金', modality: 'cardinal', rulingPlanet: 'Venus', rulingPlanetChinese: '金星', polarity: 'yang', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { id: 'scorpio', nameChinese: '天蠍座', emoji: '♏', element: 'water', wuxing: '水', modality: 'fixed', rulingPlanet: 'Pluto', rulingPlanetChinese: '冥王星', polarity: 'yin', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { id: 'sagittarius', nameChinese: '射手座', emoji: '♐', element: 'fire', wuxing: '火', modality: 'mutable', rulingPlanet: 'Jupiter', rulingPlanetChinese: '木星', polarity: 'yang', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { id: 'capricorn', nameChinese: '摩羯座', emoji: '♑', element: 'earth', wuxing: '土', modality: 'cardinal', rulingPlanet: 'Saturn', rulingPlanetChinese: '土星', polarity: 'yin', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { id: 'aquarius', nameChinese: '水瓶座', emoji: '♒', element: 'air', wuxing: '金', modality: 'fixed', rulingPlanet: 'Uranus', rulingPlanetChinese: '天王星', polarity: 'yang', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { id: 'pisces', nameChinese: '雙魚座', emoji: '♓', element: 'water', wuxing: '水', modality: 'mutable', rulingPlanet: 'Neptune', rulingPlanetChinese: '海王星', polarity: 'yin', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
] as const;

// 西方四元素 → 中文名稱
export const WESTERN_ELEMENTS: Record<string, string> = {
  fire: '火', earth: '土', air: '風', water: '水',
};

// ═══════════════════════════════════════

// ═══════════════════════════════════════
// 二十四節氣靈寵系統
// ═══════════════════════════════════════

export interface SpiritPet {
  id: string;           // 資料夾名稱
  solarTerm: string;    // 節氣名
  name: string;         // 靈寵名
  creature: string;     // 靈獸原型
  emoji: string;
  element: string;      // 五行屬性
  season: '春' | '夏' | '秋' | '冬';
  zodiac: string;       // 對應西方星座
  startMonth: number;   // 節氣起始月
  startDay: number;     // 節氣起始日
  endMonth: number;     // 節氣結束月
  endDay: number;       // 節氣結束日
  personality: string;  // 靈寵個性（影響對話語氣）
}

export const SPIRIT_PETS: SpiritPet[] = [
  // ─── 春季 ───
  { id: '01-lichun',    solarTerm: '立春', name: '青芽鹿',   creature: '鹿',     emoji: '🦌', element: '木', season: '春', zodiac: '水瓶座', startMonth: 2,  startDay: 4,  endMonth: 2,  endDay: 18, personality: '充滿希望、溫柔鼓勵，總是看見新的可能' },
  { id: '02-yushui',    solarTerm: '雨水', name: '潤澤蛙',   creature: '蛙',     emoji: '🐸', element: '水', season: '春', zodiac: '雙魚座', startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 4,  personality: '滋潤療癒、細膩體貼，善於化解煩憂' },
  { id: '03-jingzhe',   solarTerm: '驚蟄', name: '雷蟲龍',   creature: '龍蟲',   emoji: '🐲', element: '木', season: '春', zodiac: '雙魚座', startMonth: 3,  startDay: 5,  endMonth: 3,  endDay: 19, personality: '衝勁十足、直言不諱，擅長喚醒沉睡的潛能' },
  { id: '04-chunfen',   solarTerm: '春分', name: '衡翼蝶',   creature: '蝴蝶',   emoji: '🦋', element: '木', season: '春', zodiac: '牡羊座', startMonth: 3,  startDay: 20, endMonth: 4,  endDay: 3,  personality: '追求平衡、優雅從容，引導陰陽調和' },
  { id: '05-qingming',  solarTerm: '清明', name: '清風鶴',   creature: '鶴',     emoji: '🦢', element: '木', season: '春', zodiac: '牡羊座', startMonth: 4,  startDay: 4,  endMonth: 4,  endDay: 19, personality: '清明通透、超然淡泊，洞察本質' },
  { id: '06-guyu',      solarTerm: '穀雨', name: '穀靈兔',   creature: '兔',     emoji: '🐰', element: '土', season: '春', zodiac: '金牛座', startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 4,  personality: '踏實溫暖、耐心守護，帶來豐收的祝福' },
  // ─── 夏季 ───
  { id: '07-lixia',     solarTerm: '立夏', name: '炎蟬精',   creature: '蟬',     emoji: '🪲', element: '火', season: '夏', zodiac: '金牛座', startMonth: 5,  startDay: 5,  endMonth: 5,  endDay: 20, personality: '熱情高亢、聲如洪鐘，鼓舞士氣的啦啦隊' },
  { id: '08-xiaoman',   solarTerm: '小滿', name: '金穗狐',   creature: '狐',     emoji: '🦊', element: '火', season: '夏', zodiac: '雙子座', startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 4,  personality: '聰慧機敏、甜言蜜語，善於發現隱藏的機會' },
  { id: '09-mangzhong', solarTerm: '芒種', name: '芒鳳雀',   creature: '雀鳳',   emoji: '🐦', element: '火', season: '夏', zodiac: '雙子座', startMonth: 6,  startDay: 5,  endMonth: 6,  endDay: 20, personality: '勤勞進取、播種希望，激勵付諸行動' },
  { id: '10-xiazhi',    solarTerm: '夏至', name: '日輪獅',   creature: '獅',     emoji: '🦁', element: '火', season: '夏', zodiac: '巨蟹座', startMonth: 6,  startDay: 21, endMonth: 7,  endDay: 6,  personality: '王者霸氣、正氣凜然，給予最強大的信心' },
  { id: '11-xiaoshu',   solarTerm: '小暑', name: '螢火靈',   creature: '螢火蟲', emoji: '✨', element: '火', season: '夏', zodiac: '巨蟹座', startMonth: 7,  startDay: 7,  endMonth: 7,  endDay: 21, personality: '溫柔微光、暗夜引路，在迷茫中指引方向' },
  { id: '12-dashu',     solarTerm: '大暑', name: '烈陽鷹',   creature: '鷹',     emoji: '🦅', element: '土', season: '夏', zodiac: '獅子座', startMonth: 7,  startDay: 22, endMonth: 8,  endDay: 6,  personality: '銳利果斷、高瞻遠矚，助你突破瓶頸' },
  // ─── 秋季 ───
  { id: '13-liqiu',     solarTerm: '立秋', name: '金風虎',   creature: '虎',     emoji: '🐯', element: '金', season: '秋', zodiac: '獅子座', startMonth: 8,  startDay: 7,  endMonth: 8,  endDay: 22, personality: '威嚴剛毅、秋風掃落葉，果斷推動改變' },
  { id: '14-chushu',    solarTerm: '處暑', name: '涼蟬仙',   creature: '蟬',     emoji: '🪲', element: '金', season: '秋', zodiac: '處女座', startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 6,  personality: '沉靜內斂、冷靜分析，幫助理清思緒' },
  { id: '15-bailu',     solarTerm: '白露', name: '露珠蛇',   creature: '蛇',     emoji: '🐍', element: '金', season: '秋', zodiac: '處女座', startMonth: 9,  startDay: 7,  endMonth: 9,  endDay: 22, personality: '神秘智慧、洞若觀火，揭示隱藏的真相' },
  { id: '16-qiufen',    solarTerm: '秋分', name: '月衡鶴',   creature: '鶴',     emoji: '🦢', element: '金', season: '秋', zodiac: '天秤座', startMonth: 9,  startDay: 23, endMonth: 10, endDay: 7,  personality: '公正平衡、月下沉思，引導做出正確抉擇' },
  { id: '17-hanlu',     solarTerm: '寒露', name: '霜菊貓',   creature: '貓',     emoji: '🐱', element: '水', season: '秋', zodiac: '天秤座', startMonth: 10, startDay: 8,  endMonth: 10, endDay: 22, personality: '慵懶睿智、不動聲色，以柔克剛的高手' },
  { id: '18-shuangjiang', solarTerm: '霜降', name: '霜狼靈', creature: '狼',     emoji: '🐺', element: '水', season: '秋', zodiac: '天蠍座', startMonth: 10, startDay: 23, endMonth: 11, endDay: 6,  personality: '堅韌孤傲、忠誠守護，陪你度過寒冬前的考驗' },
  // ─── 冬季 ───
  { id: '19-lidong',    solarTerm: '立冬', name: '冬眠熊',   creature: '熊',     emoji: '🐻', element: '水', season: '冬', zodiac: '天蠍座', startMonth: 11, startDay: 7,  endMonth: 11, endDay: 21, personality: '沉穩厚重、蓄能待發，教你在等待中積蓄力量' },
  { id: '20-xiaoxue',   solarTerm: '小雪', name: '雪兔仙',   creature: '兔',     emoji: '🐇', element: '水', season: '冬', zodiac: '射手座', startMonth: 11, startDay: 22, endMonth: 12, endDay: 6,  personality: '輕盈靈動、樂觀豁達，在寒冬中帶來歡笑' },
  { id: '21-daxue',     solarTerm: '大雪', name: '雪鴞靈',   creature: '貓頭鷹', emoji: '🦉', element: '水', season: '冬', zodiac: '射手座', startMonth: 12, startDay: 7,  endMonth: 12, endDay: 21, personality: '深邃安靜、夜間守望，在最深的黑暗中看見光' },
  { id: '22-dongzhi',   solarTerm: '冬至', name: '玄冰龍',   creature: '龍',     emoji: '🐉', element: '水', season: '冬', zodiac: '摩羯座', startMonth: 12, startDay: 22, endMonth: 1,  endDay: 4,  personality: '至尊威嚴、冰中藏火，冬至轉陽的重生力量' },
  { id: '23-xiaohan',   solarTerm: '小寒', name: '寒星鯨',   creature: '鯨',     emoji: '🐋', element: '水', season: '冬', zodiac: '摩羯座', startMonth: 1,  startDay: 5,  endMonth: 1,  endDay: 19, personality: '深沉遼闊、星辰指引，帶你穿越迷霧' },
  { id: '24-dahan',     solarTerm: '大寒', name: '極光鳳',   creature: '鳳凰',   emoji: '🔥', element: '土', season: '冬', zodiac: '水瓶座', startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 3,  personality: '浴火重生、極寒綻放，預告春天即將到來' },
];

/**
 * 根據出生月日取得對應的節氣靈寵
 */
export function getSpiritPetByDate(month: number, day: number): SpiritPet {
  for (const pet of SPIRIT_PETS) {
    if (pet.startMonth === pet.endMonth) {
      // 同月份
      if (month === pet.startMonth && day >= pet.startDay && day <= pet.endDay) return pet;
    } else if (pet.startMonth < pet.endMonth) {
      // 跨月（如 12/22 – 1/4 不適用此分支）
      if (
        (month === pet.startMonth && day >= pet.startDay) ||
        (month === pet.endMonth && day <= pet.endDay)
      ) return pet;
    } else {
      // 跨年（startMonth > endMonth，如冬至 12/22 – 1/4）
      if (
        (month === pet.startMonth && day >= pet.startDay) ||
        (month === pet.endMonth && day <= pet.endDay)
      ) return pet;
    }
  }
  // fallback: 回傳第一隻
  return SPIRIT_PETS[0];
}
