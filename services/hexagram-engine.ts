// ═══════════════════════════════════════
// 易經六十四卦占卜引擎
// 取代原 60 籤系統，引入行天宮 64 卦象
// 含變卦機制、五類問事解讀
// ═══════════════════════════════════════

import type { FortuneLevel } from './divination-engine';

// ─── 型別定義 ───

export type DivinationCategory = 'career' | 'love' | 'family' | 'health' | 'study';

export type HexagramVerdict = '大宜' | '宜' | '中' | '不宜' | '大忌';

export interface HexagramInterpretation {
  verdict: HexagramVerdict;
  guidance: string;
  timing: string;
}

export interface Hexagram {
  id: number;              // 1-64（文王序）
  name: string;            // 乾、坤、屯...
  symbol: string;          // ䷀ ䷁ ䷂... (Unicode)
  upperTrigram: string;    // 上卦名
  lowerTrigram: string;    // 下卦名
  oracle: string;          // 卦辭
  mysticalLine: string;    // 詩意句
  interpretations: Record<DivinationCategory, HexagramInterpretation>;
  fortuneLevel: FortuneLevel;
  element: string;         // 卦屬五行
}

export interface HexagramResult {
  hexagram: Hexagram;                  // 本卦
  changingLines: number[];             // 變爻位置 (0-5)
  changedHexagram: Hexagram | null;    // 變卦（若有變爻）
  category: DivinationCategory;        // 問事類別
  question?: string;
  timestamp: number;
}

// ─── 64 卦資料（文王序） ───

const HEXAGRAMS: Hexagram[] = [
  {
    id: 1, name: '乾', symbol: '䷀', upperTrigram: '乾', lowerTrigram: '乾',
    oracle: '元亨利貞', mysticalLine: '天行健，君子以自強不息',
    fortuneLevel: '大吉', element: '金',
    interpretations: {
      career: { verdict: '大宜', guidance: '天道運行不息，奮力可成大事，宜主動出擊', timing: '七日內宜行動' },
      love: { verdict: '宜', guidance: '剛健之氣盈滿，宜以誠意打動，切忌傲慢', timing: '近期有佳緣顯現' },
      family: { verdict: '宜', guidance: '家主有力，以德服眾，家運昌盛', timing: '本月家事順遂' },
      health: { verdict: '宜', guidance: '陽氣充足，精力旺盛，宜運動養生', timing: '持續保持即可' },
      study: { verdict: '大宜', guidance: '才智過人，努力必有大成，宜勇猛精進', timing: '近期考試大利' },
    },
  },
  {
    id: 2, name: '坤', symbol: '䷁', upperTrigram: '坤', lowerTrigram: '坤',
    oracle: '元亨，利牝馬之貞', mysticalLine: '地勢坤，君子以厚德載物',
    fortuneLevel: '上吉', element: '土',
    interpretations: {
      career: { verdict: '宜', guidance: '以柔克剛，順勢而行，輔佐貴人可成', timing: '宜徐圖不宜急進' },
      love: { verdict: '大宜', guidance: '溫柔包容，真情動人，良緣天定', timing: '靜待佳人自來' },
      family: { verdict: '大宜', guidance: '坤母之德，家庭和美，包容萬物', timing: '家運長久順和' },
      health: { verdict: '宜', guidance: '脾胃為本，宜溫養調理，忌寒涼', timing: '秋冬注意保養' },
      study: { verdict: '宜', guidance: '厚積薄發，基礎扎實方可遠行', timing: '長期努力見效' },
    },
  },
  {
    id: 3, name: '屯', symbol: '䷂', upperTrigram: '坎', lowerTrigram: '震',
    oracle: '元亨利貞，勿用有攸往', mysticalLine: '雲雷屯，君子以經綸',
    fortuneLevel: '半吉', element: '水',
    interpretations: {
      career: { verdict: '中', guidance: '萬事起頭難，宜籌謀規劃，不宜貿然行動', timing: '三月後漸見分曉' },
      love: { verdict: '中', guidance: '感情初始多波折，耐心經營方可成', timing: '急不得，緩緩圖之' },
      family: { verdict: '中', guidance: '新局面需要磨合，以耐心化解衝突', timing: '半年內逐步改善' },
      health: { verdict: '不宜', guidance: '腎水不調，宜多休息，避免過度操勞', timing: '近期注意泌尿系統' },
      study: { verdict: '中', guidance: '學業初始艱難，但根基打穩後飛速進步', timing: '三個月見成效' },
    },
  },
  {
    id: 4, name: '蒙', symbol: '䷃', upperTrigram: '艮', lowerTrigram: '坎',
    oracle: '亨，匪我求童蒙，童蒙求我', mysticalLine: '山下出泉，蒙；君子以果行育德',
    fortuneLevel: '小吉', element: '土',
    interpretations: {
      career: { verdict: '中', guidance: '智慧未開，宜虛心求教，拜訪名師', timing: '學成後方可大展' },
      love: { verdict: '中', guidance: '感情尚在萌芽，勿急於表白，靜觀其變', timing: '時候未到，耐心等' },
      family: { verdict: '宜', guidance: '教育子女之卦，以身作則效果最佳', timing: '長期投入見回報' },
      health: { verdict: '中', guidance: '身體欠佳因不自知，宜做體檢', timing: '儘早檢查為上' },
      study: { verdict: '大宜', guidance: '啟蒙之卦，正是學習好時機，虛心受教', timing: '此刻正宜求學' },
    },
  },
  {
    id: 5, name: '需', symbol: '䷄', upperTrigram: '坎', lowerTrigram: '乾',
    oracle: '有孚，光亨，貞吉，利涉大川', mysticalLine: '雲上於天，需；君子以飲食宴樂',
    fortuneLevel: '中吉', element: '水',
    interpretations: {
      career: { verdict: '宜', guidance: '時機將至但未至，做好準備靜待天時', timing: '耐心等候，時機自來' },
      love: { verdict: '宜', guidance: '誠心等待，良人自會出現，切勿心急', timing: '緣分將至，勿強求' },
      family: { verdict: '宜', guidance: '家中需要耐心溝通，以和為貴', timing: '漸入佳境' },
      health: { verdict: '宜', guidance: '飲食調養為主，宜滋補養身', timing: '注意腸胃保養' },
      study: { verdict: '宜', guidance: '學業需要時間沉澱，厚積薄發', timing: '長期堅持必有成' },
    },
  },
  {
    id: 6, name: '訟', symbol: '䷅', upperTrigram: '乾', lowerTrigram: '坎',
    oracle: '有孚窒惕，中吉，終凶', mysticalLine: '天與水違行，訟；君子以作事謀始',
    fortuneLevel: '末凶', element: '金',
    interpretations: {
      career: { verdict: '不宜', guidance: '是非口舌之象，宜退讓妥協，不宜爭強', timing: '近期避免衝突' },
      love: { verdict: '不宜', guidance: '感情中多爭執，宜退一步海闊天空', timing: '冷靜期後再談' },
      family: { verdict: '不宜', guidance: '家中恐有爭端，以和解代替對抗', timing: '及早化解免擴大' },
      health: { verdict: '中', guidance: '肝火旺盛，宜靜心修養，戒怒戒躁', timing: '注意血壓與情緒' },
      study: { verdict: '中', guidance: '學業中有阻礙，換個方法試試', timing: '調整策略後再進' },
    },
  },
  {
    id: 7, name: '師', symbol: '䷆', upperTrigram: '坤', lowerTrigram: '坎',
    oracle: '貞，丈人吉，無咎', mysticalLine: '地中有水，師；君子以容民畜眾',
    fortuneLevel: '中吉', element: '土',
    interpretations: {
      career: { verdict: '宜', guidance: '眾志成城，宜團隊合作，可成大事', timing: '近期帶領團隊有利' },
      love: { verdict: '中', guidance: '感情中需要紀律與責任感', timing: '穩定交往可行' },
      family: { verdict: '宜', guidance: '家族團結一心，長輩領導有方', timing: '家運興旺' },
      health: { verdict: '中', guidance: '注意規律作息，紀律養生', timing: '堅持運動為佳' },
      study: { verdict: '宜', guidance: '有組織地學習，加入讀書會效果佳', timing: '團體學習更有效' },
    },
  },
  {
    id: 8, name: '比', symbol: '䷇', upperTrigram: '坎', lowerTrigram: '坤',
    oracle: '吉，原筮元永貞，無咎', mysticalLine: '地上有水，比；先王以建萬國，親諸侯',
    fortuneLevel: '吉', element: '水',
    interpretations: {
      career: { verdict: '宜', guidance: '親近賢能，結盟合作，互利共贏', timing: '此時結交貴人大利' },
      love: { verdict: '大宜', guidance: '親密無間之象，感情和諧美滿', timing: '近期適合深入交往' },
      family: { verdict: '大宜', guidance: '家人相親相愛，和睦團圓', timing: '家庭關係最佳時期' },
      health: { verdict: '宜', guidance: '身心和諧，社交活動有益健康', timing: '保持良好人際' },
      study: { verdict: '宜', guidance: '向學長請教，師生互動良好', timing: '近期求教有得' },
    },
  },
  {
    id: 9, name: '小畜', symbol: '䷈', upperTrigram: '巽', lowerTrigram: '乾',
    oracle: '亨，密雲不雨，自我西郊', mysticalLine: '風行天上，小畜；君子以懿文德',
    fortuneLevel: '小吉', element: '木',
    interpretations: {
      career: { verdict: '中', guidance: '小有積蓄但力量不足，宜蓄勢待發', timing: '尚需積累，不宜大動' },
      love: { verdict: '中', guidance: '感情有小進展，但尚未成熟', timing: '慢慢培養感情' },
      family: { verdict: '宜', guidance: '家庭小有積蓄，節儉持家為上', timing: '穩步積累家產' },
      health: { verdict: '中', guidance: '小病小痛不可忽視，及時調理', timing: '注意呼吸系統' },
      study: { verdict: '宜', guidance: '學問漸進，一步一腳印', timing: '穩紮穩打為佳' },
    },
  },
  {
    id: 10, name: '履', symbol: '䷉', upperTrigram: '乾', lowerTrigram: '兌',
    oracle: '履虎尾，不咥人，亨', mysticalLine: '上天下澤，履；君子以辨上下，定民志',
    fortuneLevel: '中吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '謹慎行事如履虎尾，小心則無險', timing: '步步為營方可成' },
      love: { verdict: '中', guidance: '感情中需注意分寸禮節，勿逾越', timing: '循序漸進為宜' },
      family: { verdict: '宜', guidance: '長幼有序，禮節周到，家風正', timing: '以禮相待家和' },
      health: { verdict: '宜', guidance: '行走運動有益，但注意安全', timing: '適度運動為佳' },
      study: { verdict: '宜', guidance: '學習如履薄冰，嚴謹治學方成', timing: '踏實努力見效' },
    },
  },
  {
    id: 11, name: '泰', symbol: '䷊', upperTrigram: '坤', lowerTrigram: '乾',
    oracle: '小往大來，吉亨', mysticalLine: '天地交泰，后以財成天地之道',
    fortuneLevel: '大吉', element: '土',
    interpretations: {
      career: { verdict: '大宜', guidance: '天地交泰，萬事亨通，正是大展身手之時', timing: '當下即是最佳時機' },
      love: { verdict: '大宜', guidance: '陰陽和合，佳偶天成，大利姻緣', timing: '近期桃花運極旺' },
      family: { verdict: '大宜', guidance: '家運昌隆，上下和睦，萬事皆宜', timing: '家庭黃金時期' },
      health: { verdict: '大宜', guidance: '身心泰然，精力充沛，健康無虞', timing: '保持現狀即可' },
      study: { verdict: '大宜', guidance: '學業大順，金榜題名可期', timing: '近期考運極佳' },
    },
  },
  {
    id: 12, name: '否', symbol: '䷋', upperTrigram: '乾', lowerTrigram: '坤',
    oracle: '否之匪人，不利君子貞', mysticalLine: '天地不交，否；君子以儉德辟難',
    fortuneLevel: '凶', element: '金',
    interpretations: {
      career: { verdict: '大忌', guidance: '天地閉塞，諸事不利，宜韜光養晦', timing: '靜待否極泰來' },
      love: { verdict: '不宜', guidance: '感情阻塞不通，暫時保持距離', timing: '此時不宜追求' },
      family: { verdict: '不宜', guidance: '家中氣氛沉悶，宜靜不宜動', timing: '耐心等待轉機' },
      health: { verdict: '不宜', guidance: '氣血不暢，宜疏通調理', timing: '及時就醫為上' },
      study: { verdict: '不宜', guidance: '學業受阻，宜暫時放下另尋方向', timing: '換個方法再試' },
    },
  },
  {
    id: 13, name: '同人', symbol: '䷌', upperTrigram: '乾', lowerTrigram: '離',
    oracle: '同人于野，亨，利涉大川', mysticalLine: '天與火，同人；君子以類族辨物',
    fortuneLevel: '吉', element: '火',
    interpretations: {
      career: { verdict: '大宜', guidance: '志同道合，合作共贏，宜廣結善緣', timing: '近期合作運極強' },
      love: { verdict: '宜', guidance: '心靈相通，知己難求，珍惜眼前人', timing: '近期遇到知心人' },
      family: { verdict: '宜', guidance: '家人同心協力，其利斷金', timing: '齊心辦事大吉' },
      health: { verdict: '宜', guidance: '心臟宜保養，多社交活動有益', timing: '群體運動為佳' },
      study: { verdict: '宜', guidance: '同儕互助學習，效果倍增', timing: '組隊學習最有利' },
    },
  },
  {
    id: 14, name: '大有', symbol: '䷍', upperTrigram: '離', lowerTrigram: '乾',
    oracle: '元亨', mysticalLine: '火在天上，大有；君子以遏惡揚善',
    fortuneLevel: '大吉', element: '火',
    interpretations: {
      career: { verdict: '大宜', guidance: '大有所獲之象，事業鼎盛，功成名就', timing: '當下大利進取' },
      love: { verdict: '宜', guidance: '感情豐收，桃花燦爛，宜把握機會', timing: '近期姻緣到位' },
      family: { verdict: '大宜', guidance: '家財豐厚，闔家歡樂', timing: '家運鼎盛時期' },
      health: { verdict: '宜', guidance: '精力旺盛，但需節制慾望', timing: '注意肝火過旺' },
      study: { verdict: '大宜', guidance: '學業大成，才華橫溢，名列前茅', timing: '金榜題名之象' },
    },
  },
  {
    id: 15, name: '謙', symbol: '䷎', upperTrigram: '坤', lowerTrigram: '艮',
    oracle: '亨，君子有終', mysticalLine: '地中有山，謙；君子以裒多益寡',
    fortuneLevel: '吉', element: '土',
    interpretations: {
      career: { verdict: '宜', guidance: '謙受益滿招損，低調做事高調做人', timing: '穩步上升中' },
      love: { verdict: '宜', guidance: '謙和待人，感情自然和諧', timing: '以真心換真心' },
      family: { verdict: '大宜', guidance: '謙恭持家，德行感化家人', timing: '家風淳厚長久' },
      health: { verdict: '宜', guidance: '不過度消耗，適可而止', timing: '保持平衡為佳' },
      study: { verdict: '宜', guidance: '虛心向學，謙遜求教，必有所得', timing: '持續精進即可' },
    },
  },
  {
    id: 16, name: '豫', symbol: '䷏', upperTrigram: '震', lowerTrigram: '坤',
    oracle: '利建侯行師', mysticalLine: '雷出地奮，豫；先王以作樂崇德',
    fortuneLevel: '中吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '歡愉振奮之時，宜展開新計畫', timing: '此時行動大吉' },
      love: { verdict: '大宜', guidance: '歡樂交流，感情升溫，宜表白', timing: '近期適合約會' },
      family: { verdict: '宜', guidance: '家庭歡樂氣氛濃厚，宜聚會', timing: '近期家族活動大利' },
      health: { verdict: '宜', guidance: '心情愉悅百病消，多保持正能量', timing: '身心俱佳' },
      study: { verdict: '宜', guidance: '興趣驅動學習，效率最高', timing: '找到興趣點突破' },
    },
  },
  {
    id: 17, name: '隨', symbol: '䷐', upperTrigram: '兌', lowerTrigram: '震',
    oracle: '元亨利貞，無咎', mysticalLine: '澤中有雷，隨；君子以嚮晦入宴息',
    fortuneLevel: '吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '隨時而動，順勢而為，跟隨大勢', timing: '順勢而行可成' },
      love: { verdict: '宜', guidance: '隨緣而遇，感情自然發展', timing: '順其自然最好' },
      family: { verdict: '宜', guidance: '隨和處世，家人之間多包容', timing: '和諧相處即可' },
      health: { verdict: '宜', guidance: '順應自然節律，早睡早起', timing: '調整作息為上' },
      study: { verdict: '中', guidance: '跟隨良師，按部就班學習', timing: '循序漸進有效' },
    },
  },
  {
    id: 18, name: '蠱', symbol: '䷑', upperTrigram: '艮', lowerTrigram: '巽',
    oracle: '元亨，利涉大川', mysticalLine: '山下有風，蠱；君子以振民育德',
    fortuneLevel: '半吉', element: '土',
    interpretations: {
      career: { verdict: '中', guidance: '積弊需要整頓，勇於改革方能新生', timing: '著手整頓，三月見效' },
      love: { verdict: '中', guidance: '感情中有隱患，宜坦誠面對問題', timing: '及時溝通化解' },
      family: { verdict: '中', guidance: '家中陋習需改正，革故鼎新', timing: '痛下決心可轉好' },
      health: { verdict: '不宜', guidance: '舊疾可能復發，宜全面檢查', timing: '儘快就醫調理' },
      study: { verdict: '中', guidance: '學習方法需調整，去除壞習慣', timing: '改正後進步飛快' },
    },
  },
  {
    id: 19, name: '臨', symbol: '䷒', upperTrigram: '坤', lowerTrigram: '兌',
    oracle: '元亨利貞，至于八月有凶', mysticalLine: '澤上有地，臨；君子以教思無窮',
    fortuneLevel: '上吉', element: '土',
    interpretations: {
      career: { verdict: '大宜', guidance: '好運將臨，居高臨下，掌控全局', timing: '近期機會極多' },
      love: { verdict: '宜', guidance: '貴人降臨，姻緣將至', timing: '近期桃花旺盛' },
      family: { verdict: '宜', guidance: '家運將升，好事將臨', timing: '近期有喜事' },
      health: { verdict: '宜', guidance: '身體康復之象，精神漸佳', timing: '健康持續好轉' },
      study: { verdict: '大宜', guidance: '學業高峰將至，全力以赴', timing: '把握此刻衝刺' },
    },
  },
  {
    id: 20, name: '觀', symbol: '䷓', upperTrigram: '巽', lowerTrigram: '坤',
    oracle: '盥而不薦，有孚顒若', mysticalLine: '風行地上，觀；先王以省方觀民設教',
    fortuneLevel: '小吉', element: '木',
    interpretations: {
      career: { verdict: '中', guidance: '宜觀察學習，不宜貿然行動', timing: '觀察期，靜待時機' },
      love: { verdict: '中', guidance: '先觀察對方品行，不急於投入', timing: '觀察後再決定' },
      family: { verdict: '宜', guidance: '觀察家人需求，體貼照顧', timing: '用心觀察即可' },
      health: { verdict: '中', guidance: '留意身體信號，定期體檢', timing: '預防勝於治療' },
      study: { verdict: '宜', guidance: '觀摩學習，博覽群書，開闊視野', timing: '廣泛涉獵為佳' },
    },
  },
  // 21-30
  {
    id: 21, name: '噬嗑', symbol: '䷔', upperTrigram: '離', lowerTrigram: '震',
    oracle: '亨，利用獄', mysticalLine: '雷電噬嗑；先王以明罰敕法',
    fortuneLevel: '中吉', element: '火',
    interpretations: {
      career: { verdict: '宜', guidance: '障礙需果斷排除，雷厲風行可成', timing: '立即行動消除阻礙' },
      love: { verdict: '中', guidance: '感情中有誤會需解開，直接溝通', timing: '儘快攤牌釐清' },
      family: { verdict: '中', guidance: '家規需要嚴明，賞罰分明', timing: '立規矩見成效' },
      health: { verdict: '中', guidance: '注意口腔和消化問題', timing: '近期注意飲食' },
      study: { verdict: '宜', guidance: '攻克難題，咬牙堅持必突破', timing: '集中精力攻關' },
    },
  },
  {
    id: 22, name: '賁', symbol: '䷕', upperTrigram: '艮', lowerTrigram: '離',
    oracle: '亨，小利有攸往', mysticalLine: '山下有火，賁；君子以明庶政',
    fortuneLevel: '小吉', element: '火',
    interpretations: {
      career: { verdict: '中', guidance: '注重外在修飾，形象包裝有助事業', timing: '適合品牌建設期' },
      love: { verdict: '宜', guidance: '注重外表打扮，提升魅力吸引良緣', timing: '近期注意形象' },
      family: { verdict: '宜', guidance: '美化家居環境，提升家庭品質', timing: '布置居家大吉' },
      health: { verdict: '中', guidance: '外表光鮮但需注意內在保養', timing: '內外兼修為上' },
      study: { verdict: '中', guidance: '學問需要文飾，表達能力待提升', timing: '加強寫作表達' },
    },
  },
  {
    id: 23, name: '剝', symbol: '䷖', upperTrigram: '艮', lowerTrigram: '坤',
    oracle: '不利有攸往', mysticalLine: '山附於地，剝；上以厚下安宅',
    fortuneLevel: '凶', element: '土',
    interpretations: {
      career: { verdict: '大忌', guidance: '運勢剝落，宜守不宜攻，暫時蟄伏', timing: '靜待轉機勿妄動' },
      love: { verdict: '不宜', guidance: '感情面臨剝離，宜放手或冷靜', timing: '此時不宜強求' },
      family: { verdict: '不宜', guidance: '家運衰退之兆，宜節儉守成', timing: '減少開支為上' },
      health: { verdict: '不宜', guidance: '元氣大傷，宜靜養恢復', timing: '充分休息為要' },
      study: { verdict: '不宜', guidance: '學業受挫，暫時放鬆調整', timing: '休整後再出發' },
    },
  },
  {
    id: 24, name: '復', symbol: '䷗', upperTrigram: '坤', lowerTrigram: '震',
    oracle: '亨，出入無疾，朋來無咎', mysticalLine: '雷在地中，復；先王以至日閉關',
    fortuneLevel: '吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '否極泰來，一陽復始，新的開始', timing: '轉運之兆，把握機會' },
      love: { verdict: '宜', guidance: '舊情復燃或新緣出現，生機重現', timing: '近期感情回暖' },
      family: { verdict: '宜', guidance: '家運重新振作，生機蓬勃', timing: '好運正在回來' },
      health: { verdict: '宜', guidance: '病後復原之象，元氣漸復', timing: '穩步恢復中' },
      study: { verdict: '宜', guidance: '學業否極泰來，重新出發', timing: '重拾信心再戰' },
    },
  },
  {
    id: 25, name: '無妄', symbol: '䷘', upperTrigram: '乾', lowerTrigram: '震',
    oracle: '元亨利貞', mysticalLine: '天下雷行，物與無妄',
    fortuneLevel: '吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '真誠無妄，順天行事，自然亨通', timing: '誠實行事必有報' },
      love: { verdict: '宜', guidance: '真心對待，不虛偽不做作', timing: '以誠心打動對方' },
      family: { verdict: '宜', guidance: '家中需要真誠相待，不藏私心', timing: '坦誠相見最和諧' },
      health: { verdict: '宜', guidance: '順應自然規律，不妄加補品', timing: '自然養生最好' },
      study: { verdict: '宜', guidance: '踏實學習，不走捷徑', timing: '實實在在用功' },
    },
  },
  {
    id: 26, name: '大畜', symbol: '䷙', upperTrigram: '艮', lowerTrigram: '乾',
    oracle: '利貞，不家食吉，利涉大川', mysticalLine: '天在山中，大畜；君子以多識前言往行',
    fortuneLevel: '上吉', element: '土',
    interpretations: {
      career: { verdict: '大宜', guidance: '大有積蓄，厚積薄發，可成大業', timing: '蓄勢已足，宜出擊' },
      love: { verdict: '宜', guidance: '感情深厚，穩定交往，可談婚論嫁', timing: '感情成熟之時' },
      family: { verdict: '大宜', guidance: '家族底蘊深厚，財富積累豐盛', timing: '家產豐厚時期' },
      health: { verdict: '大宜', guidance: '身體能量充沛，精力十足', timing: '健康狀態極佳' },
      study: { verdict: '大宜', guidance: '學識淵博之象，大器可成', timing: '正是收穫之時' },
    },
  },
  {
    id: 27, name: '頤', symbol: '䷚', upperTrigram: '艮', lowerTrigram: '震',
    oracle: '貞吉，觀頤，自求口實', mysticalLine: '山下有雷，頤；君子以慎言語，節飲食',
    fortuneLevel: '小吉', element: '土',
    interpretations: {
      career: { verdict: '中', guidance: '注意言行舉止，謹慎發言', timing: '慎言方可避禍' },
      love: { verdict: '中', guidance: '感情需要經營滋養，用心呵護', timing: '細心照料感情' },
      family: { verdict: '宜', guidance: '注意家人飲食健康，頤養天年', timing: '養生保健為重' },
      health: { verdict: '宜', guidance: '注意飲食營養，節制為上', timing: '調理脾胃為要' },
      study: { verdict: '中', guidance: '吸收知識如進食，需要消化', timing: '不貪多求精' },
    },
  },
  {
    id: 28, name: '大過', symbol: '䷛', upperTrigram: '兌', lowerTrigram: '巽',
    oracle: '棟橈，利有攸往，亨', mysticalLine: '澤滅木，大過；君子以獨立不懼',
    fortuneLevel: '半凶', element: '金',
    interpretations: {
      career: { verdict: '不宜', guidance: '壓力過大，棟樑將折，宜減壓卸重', timing: '及時減負避免崩潰' },
      love: { verdict: '不宜', guidance: '感情負擔過重，需要喘息空間', timing: '暫時保持距離' },
      family: { verdict: '不宜', guidance: '家庭負擔沉重，宜量力而行', timing: '減輕不必要開支' },
      health: { verdict: '不宜', guidance: '身體超負荷，必須休息', timing: '立即減壓休養' },
      study: { verdict: '中', guidance: '學業壓力過大，適度放鬆', timing: '勞逸結合為上' },
    },
  },
  {
    id: 29, name: '坎', symbol: '䷜', upperTrigram: '坎', lowerTrigram: '坎',
    oracle: '習坎，有孚，維心亨', mysticalLine: '水洊至，習坎；君子以常德行，習教事',
    fortuneLevel: '凶', element: '水',
    interpretations: {
      career: { verdict: '大忌', guidance: '重重險阻，如陷深淵，宜堅守信念', timing: '靜待脫困時機' },
      love: { verdict: '不宜', guidance: '感情陷入困境，需要堅定信心', timing: '艱難時期會過去' },
      family: { verdict: '不宜', guidance: '家中困難重重，齊心方可渡過', timing: '共患難見真情' },
      health: { verdict: '大忌', guidance: '腎水之疾，泌尿或血液循環問題', timing: '立即就醫檢查' },
      study: { verdict: '不宜', guidance: '學業困難重重，需要堅持不放棄', timing: '咬牙撐過即可' },
    },
  },
  {
    id: 30, name: '離', symbol: '䷝', upperTrigram: '離', lowerTrigram: '離',
    oracle: '利貞，亨，畜牝牛吉', mysticalLine: '明兩作，離；大人以繼明照于四方',
    fortuneLevel: '中吉', element: '火',
    interpretations: {
      career: { verdict: '宜', guidance: '光明燦爛，才華展露，宜展現自我', timing: '此時曝光度最佳' },
      love: { verdict: '宜', guidance: '感情熱烈如火，但需注意持久', timing: '近期桃花旺但要穩' },
      family: { verdict: '宜', guidance: '家中光明溫暖，氣氛和樂', timing: '家庭幸福時期' },
      health: { verdict: '中', guidance: '心火旺盛，注意眼睛和心臟', timing: '注意降火清心' },
      study: { verdict: '宜', guidance: '思路清晰明亮，學習效率極高', timing: '把握此時用功' },
    },
  },
  // 31-40
  {
    id: 31, name: '咸', symbol: '䷞', upperTrigram: '兌', lowerTrigram: '艮',
    oracle: '亨，利貞，取女吉', mysticalLine: '山上有澤，咸；君子以虛受人',
    fortuneLevel: '上吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '感應相通，人脈暢達，合作有利', timing: '近期人緣極佳' },
      love: { verdict: '大宜', guidance: '心心相印，天作之合，大利姻緣', timing: '此時表白大吉' },
      family: { verdict: '大宜', guidance: '家人心意相通，默契十足', timing: '家庭最和諧時期' },
      health: { verdict: '宜', guidance: '身心感應良好，直覺敏銳', timing: '信任身體信號' },
      study: { verdict: '宜', guidance: '觸類旁通，舉一反三，學習順暢', timing: '理解力最強時期' },
    },
  },
  {
    id: 32, name: '恆', symbol: '䷟', upperTrigram: '震', lowerTrigram: '巽',
    oracle: '亨，無咎，利貞', mysticalLine: '雷風恆；君子以立不易方',
    fortuneLevel: '吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '持之以恆，堅守崗位，穩定發展', timing: '長期堅持必見成效' },
      love: { verdict: '宜', guidance: '感情持久穩定，細水長流', timing: '長久相伴最可貴' },
      family: { verdict: '大宜', guidance: '家風傳承，恆久不變的愛', timing: '家庭穩固長久' },
      health: { verdict: '宜', guidance: '持續保健養生，恆心為要', timing: '堅持運動見效' },
      study: { verdict: '大宜', guidance: '持之以恆，鐵杵磨成針', timing: '每日堅持積累' },
    },
  },
  {
    id: 33, name: '遯', symbol: '䷠', upperTrigram: '乾', lowerTrigram: '艮',
    oracle: '亨，小利貞', mysticalLine: '天下有山，遯；君子以遠小人',
    fortuneLevel: '平', element: '金',
    interpretations: {
      career: { verdict: '中', guidance: '適時退避，遠離小人，保全實力', timing: '暫時退守為上' },
      love: { verdict: '中', guidance: '感情中宜保持距離，給彼此空間', timing: '適當冷靜一下' },
      family: { verdict: '中', guidance: '家中宜低調處事，避開紛爭', timing: '少管閒事為妙' },
      health: { verdict: '中', guidance: '遠離不良環境，注意呼吸道', timing: '換個環境有益' },
      study: { verdict: '中', guidance: '暫時離開讓思緒清晰，休息後再戰', timing: '適當休息更有效' },
    },
  },
  {
    id: 34, name: '大壯', symbol: '䷡', upperTrigram: '震', lowerTrigram: '乾',
    oracle: '利貞', mysticalLine: '雷在天上，大壯；君子以非禮弗履',
    fortuneLevel: '上吉', element: '木',
    interpretations: {
      career: { verdict: '大宜', guidance: '氣勢如虹，勢不可擋，宜乘勝追擊', timing: '當下即是最佳時機' },
      love: { verdict: '宜', guidance: '感情充滿力量，主動出擊可成', timing: '近期宜積極表白' },
      family: { verdict: '宜', guidance: '家族興旺壯大，事事順心', timing: '家運正隆' },
      health: { verdict: '大宜', guidance: '精力充沛，體能極佳', timing: '適合挑戰運動' },
      study: { verdict: '宜', guidance: '學習動力十足，挑戰難題', timing: '趁勢攻克難關' },
    },
  },
  {
    id: 35, name: '晉', symbol: '䷢', upperTrigram: '離', lowerTrigram: '坤',
    oracle: '康侯用錫馬蕃庶，晝日三接', mysticalLine: '明出地上，晉；君子以自昭明德',
    fortuneLevel: '上吉', element: '火',
    interpretations: {
      career: { verdict: '大宜', guidance: '升遷晉升之象，光明前進，不可擋', timing: '近期有升遷機會' },
      love: { verdict: '宜', guidance: '感情關係更進一步，順利升級', timing: '近期可深入交往' },
      family: { verdict: '宜', guidance: '家運上升，社會地位提升', timing: '家族榮耀時期' },
      health: { verdict: '宜', guidance: '健康日漸好轉，精神煥發', timing: '健康持續改善' },
      study: { verdict: '大宜', guidance: '學業進步神速，晉升有望', timing: '考試升學大利' },
    },
  },
  {
    id: 36, name: '明夷', symbol: '䷣', upperTrigram: '坤', lowerTrigram: '離',
    oracle: '利艱貞', mysticalLine: '明入地中，明夷；君子以蒞眾用晦而明',
    fortuneLevel: '小凶', element: '火',
    interpretations: {
      career: { verdict: '不宜', guidance: '光明被掩，才華受壓，宜忍耐蟄伏', timing: '暗中蓄力，等待天明' },
      love: { verdict: '不宜', guidance: '感情受傷或被誤解，宜隱忍', timing: '此時不宜追求' },
      family: { verdict: '中', guidance: '家中有隱憂，需暗中處理', timing: '低調處理家事' },
      health: { verdict: '不宜', guidance: '眼睛和心臟需注意保護', timing: '及時做眼科檢查' },
      study: { verdict: '中', guidance: '才華被埋沒，換個環境試試', timing: '保持學習不放棄' },
    },
  },
  {
    id: 37, name: '家人', symbol: '䷤', upperTrigram: '巽', lowerTrigram: '離',
    oracle: '利女貞', mysticalLine: '風自火出，家人；君子以言有物而行有恆',
    fortuneLevel: '吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '家和萬事興，以家為本穩健發展', timing: '家庭支持事業順' },
      love: { verdict: '大宜', guidance: '宜成家立業，感情穩定美滿', timing: '近期婚姻運極佳' },
      family: { verdict: '大宜', guidance: '家庭和樂，上慈下孝，美滿之象', timing: '最佳家庭時期' },
      health: { verdict: '宜', guidance: '家庭氛圍好有助健康', timing: '親情療癒身心' },
      study: { verdict: '宜', guidance: '家庭提供良好學習環境', timing: '在家學習效果佳' },
    },
  },
  {
    id: 38, name: '睽', symbol: '䷥', upperTrigram: '離', lowerTrigram: '兌',
    oracle: '小事吉', mysticalLine: '上火下澤，睽；君子以同而異',
    fortuneLevel: '末吉', element: '火',
    interpretations: {
      career: { verdict: '中', guidance: '意見分歧，求同存異，小事可成', timing: '大事暫緩，小事先行' },
      love: { verdict: '中', guidance: '觀點不同但不影響感情，相互理解', timing: '磨合期需要耐心' },
      family: { verdict: '中', guidance: '家人各有想法，尊重差異', timing: '求同存異為上策' },
      health: { verdict: '中', guidance: '注意上火症狀，寒熱失調', timing: '調和寒熱為要' },
      study: { verdict: '中', guidance: '學科之間要融會貫通', timing: '跨領域學習有益' },
    },
  },
  {
    id: 39, name: '蹇', symbol: '䷦', upperTrigram: '坎', lowerTrigram: '艮',
    oracle: '利西南，不利東北', mysticalLine: '山上有水，蹇；君子以反身修德',
    fortuneLevel: '小凶', element: '水',
    interpretations: {
      career: { verdict: '不宜', guidance: '前路艱險，寸步難行，宜反省修身', timing: '暫時止步修正方向' },
      love: { verdict: '不宜', guidance: '感情道路坎坷，需要耐心克服', timing: '此時不宜強求' },
      family: { verdict: '中', guidance: '家中遇到困難，團結可渡過', timing: '攜手共度難關' },
      health: { verdict: '不宜', guidance: '腿腳和關節需注意保護', timing: '避免劇烈運動' },
      study: { verdict: '中', guidance: '學業遇阻，換條路可能更順', timing: '調整學習方向' },
    },
  },
  {
    id: 40, name: '解', symbol: '䷧', upperTrigram: '震', lowerTrigram: '坎',
    oracle: '利西南，無所往', mysticalLine: '雷雨作，解；君子以赦過宥罪',
    fortuneLevel: '中吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '困境解除，壓力釋放，宜把握良機', timing: '阻礙消除，立即行動' },
      love: { verdict: '宜', guidance: '感情中的誤會冰釋，重歸於好', timing: '近期破冰有望' },
      family: { verdict: '宜', guidance: '家中矛盾化解，和平到來', timing: '寬恕帶來和諧' },
      health: { verdict: '宜', guidance: '病痛解除，康復之兆', timing: '身體好轉明顯' },
      study: { verdict: '宜', guidance: '學業瓶頸突破，豁然開朗', timing: '頓悟之後飛速進步' },
    },
  },
  // 41-50
  {
    id: 41, name: '損', symbol: '䷨', upperTrigram: '艮', lowerTrigram: '兌',
    oracle: '有孚，元吉，無咎', mysticalLine: '山下有澤，損；君子以懲忿窒慾',
    fortuneLevel: '半吉', element: '土',
    interpretations: {
      career: { verdict: '中', guidance: '有所損失方有所得，適當犧牲換取大局', timing: '捨小得大的時機' },
      love: { verdict: '中', guidance: '感情中需要付出犧牲，真心才能感動', timing: '付出終有回報' },
      family: { verdict: '中', guidance: '家庭中適當讓步，犧牲小我成就大我', timing: '以退為進' },
      health: { verdict: '中', guidance: '節制慾望，減少不良嗜好', timing: '自律帶來健康' },
      study: { verdict: '宜', guidance: '減少不必要活動，專心學業', timing: '專注一事必成' },
    },
  },
  {
    id: 42, name: '益', symbol: '䷩', upperTrigram: '巽', lowerTrigram: '震',
    oracle: '利有攸往，利涉大川', mysticalLine: '風雷益；君子以見善則遷，有過則改',
    fortuneLevel: '大吉', element: '木',
    interpretations: {
      career: { verdict: '大宜', guidance: '利益增長，事業大進，宜拓展版圖', timing: '當下最宜擴張' },
      love: { verdict: '大宜', guidance: '感情增益，關係更進一步', timing: '近期感情大進展' },
      family: { verdict: '大宜', guidance: '家運增益，好事連連', timing: '家庭收穫期' },
      health: { verdict: '大宜', guidance: '身體機能提升，活力四射', timing: '健康狀態最佳' },
      study: { verdict: '大宜', guidance: '學業大有進益，收穫豐碩', timing: '成績飛躍提升' },
    },
  },
  {
    id: 43, name: '夬', symbol: '䷪', upperTrigram: '兌', lowerTrigram: '乾',
    oracle: '揚于王庭，孚號有厲', mysticalLine: '澤上於天，夬；君子以施祿及下',
    fortuneLevel: '中吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '果斷決策，排除障礙，宜當機立斷', timing: '此刻需要決斷' },
      love: { verdict: '宜', guidance: '感情需要決斷，拖延無益', timing: '是時候做決定了' },
      family: { verdict: '中', guidance: '家事需要明斷，不可優柔寡斷', timing: '果斷處理家務' },
      health: { verdict: '中', guidance: '果斷改掉壞習慣，有益健康', timing: '下定決心改變' },
      study: { verdict: '宜', guidance: '學習要有決斷力，選定方向全力以赴', timing: '確定目標衝刺' },
    },
  },
  {
    id: 44, name: '姤', symbol: '䷫', upperTrigram: '乾', lowerTrigram: '巽',
    oracle: '女壯，勿用取女', mysticalLine: '天下有風，姤；后以施命誥四方',
    fortuneLevel: '平', element: '金',
    interpretations: {
      career: { verdict: '中', guidance: '偶然相遇帶來機會，但需審慎分辨', timing: '機會雖來但需辨別' },
      love: { verdict: '中', guidance: '邂逅之緣，但切勿一見鍾情太快投入', timing: '冷靜觀察為上' },
      family: { verdict: '中', guidance: '家中可能來訪客，以禮相待', timing: '接待貴客有益' },
      health: { verdict: '中', guidance: '注意風邪入體，預防感冒', timing: '注意保暖防風' },
      study: { verdict: '中', guidance: '偶然接觸新領域，可能打開新視野', timing: '保持好奇心' },
    },
  },
  {
    id: 45, name: '萃', symbol: '䷬', upperTrigram: '兌', lowerTrigram: '坤',
    oracle: '亨，王假有廟', mysticalLine: '澤上於地，萃；君子以除戎器，戒不虞',
    fortuneLevel: '吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '人才匯聚，團結力量大，宜召集眾人', timing: '近期適合團隊合作' },
      love: { verdict: '宜', guidance: '社交場合遇良緣，聚會中有桃花', timing: '參加聚會有緣分' },
      family: { verdict: '大宜', guidance: '家族聚會，闔家團圓之象', timing: '近期宜家族聚會' },
      health: { verdict: '宜', guidance: '社交活動帶來活力', timing: '多與人交流有益' },
      study: { verdict: '宜', guidance: '集體學習效果極佳，相互切磋', timing: '加入學習社群' },
    },
  },
  {
    id: 46, name: '升', symbol: '䷭', upperTrigram: '坤', lowerTrigram: '巽',
    oracle: '元亨，用見大人', mysticalLine: '地中生木，升；君子以順德，積小以高大',
    fortuneLevel: '上吉', element: '木',
    interpretations: {
      career: { verdict: '大宜', guidance: '步步高升，如木破土而出，勢不可擋', timing: '正是上升期' },
      love: { verdict: '宜', guidance: '感情穩步上升，逐漸加深', timing: '近期關係升溫' },
      family: { verdict: '宜', guidance: '家運蒸蒸日上，越來越好', timing: '家運上升中' },
      health: { verdict: '宜', guidance: '健康狀態持續改善', timing: '身體越來越好' },
      study: { verdict: '大宜', guidance: '學業穩步提升，成績節節高', timing: '上升趨勢明顯' },
    },
  },
  {
    id: 47, name: '困', symbol: '䷮', upperTrigram: '兌', lowerTrigram: '坎',
    oracle: '亨，貞，大人吉', mysticalLine: '澤無水，困；君子以致命遂志',
    fortuneLevel: '小凶', element: '金',
    interpretations: {
      career: { verdict: '不宜', guidance: '處境艱困，資源匱乏，宜守不宜攻', timing: '靜待援助到來' },
      love: { verdict: '不宜', guidance: '感情處於困境，暫時無法突破', timing: '耐心等待轉機' },
      family: { verdict: '不宜', guidance: '家庭經濟困難，宜節儉度日', timing: '共同節約渡難關' },
      health: { verdict: '不宜', guidance: '體力透支，需要補充能量', timing: '好好休息恢復' },
      study: { verdict: '中', guidance: '學業遇瓶頸，困而學之', timing: '困境中成長最快' },
    },
  },
  {
    id: 48, name: '井', symbol: '䷯', upperTrigram: '坎', lowerTrigram: '巽',
    oracle: '改邑不改井', mysticalLine: '木上有水，井；君子以勞民勸相',
    fortuneLevel: '吉', element: '水',
    interpretations: {
      career: { verdict: '宜', guidance: '取之不盡用之不竭，基礎穩固', timing: '深耕本業見成效' },
      love: { verdict: '宜', guidance: '感情如井水般深沉持久', timing: '用心經營可長久' },
      family: { verdict: '宜', guidance: '家庭根基穩固，世代傳承', timing: '家風正則家運旺' },
      health: { verdict: '宜', guidance: '生命之水需要滋養，多喝水養腎', timing: '注意補水養生' },
      study: { verdict: '宜', guidance: '學問如井水，越挖越深越清', timing: '深入研究有成' },
    },
  },
  {
    id: 49, name: '革', symbol: '䷰', upperTrigram: '兌', lowerTrigram: '離',
    oracle: '巳日乃孚，元亨利貞', mysticalLine: '澤中有火，革；君子以治曆明時',
    fortuneLevel: '中吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '變革之時已到，除舊布新，勇於改革', timing: '此時變革最有利' },
      love: { verdict: '中', guidance: '感情需要轉變，舊模式需打破', timing: '改變相處方式' },
      family: { verdict: '中', guidance: '家庭需要改革，打破舊習慣', timing: '勇於改變家風' },
      health: { verdict: '中', guidance: '改變不良生活習慣，煥然一新', timing: '徹底改變生活方式' },
      study: { verdict: '宜', guidance: '學習方法需要革新，嘗試新方式', timing: '創新學習最有效' },
    },
  },
  {
    id: 50, name: '鼎', symbol: '䷱', upperTrigram: '離', lowerTrigram: '巽',
    oracle: '元吉，亨', mysticalLine: '木上有火，鼎；君子以正位凝命',
    fortuneLevel: '大吉', element: '火',
    interpretations: {
      career: { verdict: '大宜', guidance: '鼎新之象，大事可成，問鼎天下', timing: '當下鑄就大業' },
      love: { verdict: '宜', guidance: '感情穩固如鼎，三足鼎立', timing: '穩定且有力量' },
      family: { verdict: '大宜', guidance: '家族鼎盛，傳承有序', timing: '家運最旺時期' },
      health: { verdict: '宜', guidance: '營養豐富，身體康泰', timing: '健康飲食為本' },
      study: { verdict: '大宜', guidance: '學業鼎盛，成就輝煌', timing: '大器已成之象' },
    },
  },
  // 51-64
  {
    id: 51, name: '震', symbol: '䷲', upperTrigram: '震', lowerTrigram: '震',
    oracle: '亨，震來虩虩，笑言啞啞', mysticalLine: '洊雷震；君子以恐懼修省',
    fortuneLevel: '半吉', element: '木',
    interpretations: {
      career: { verdict: '中', guidance: '震動之象，意外之變，需沉著應對', timing: '突發狀況要冷靜' },
      love: { verdict: '中', guidance: '感情可能有驚喜或震動', timing: '意外發展別慌張' },
      family: { verdict: '中', guidance: '家中可能有突變，沉著應對', timing: '做好心理準備' },
      health: { verdict: '中', guidance: '注意驚嚇對心臟影響', timing: '保持心態平穩' },
      study: { verdict: '中', guidance: '學業可能有意外變化，適應為上', timing: '靈活應變' },
    },
  },
  {
    id: 52, name: '艮', symbol: '䷳', upperTrigram: '艮', lowerTrigram: '艮',
    oracle: '艮其背，不獲其身', mysticalLine: '兼山，艮；君子以思不出其位',
    fortuneLevel: '平', element: '土',
    interpretations: {
      career: { verdict: '中', guidance: '止步之象，此時宜靜不宜動', timing: '暫停一切大動作' },
      love: { verdict: '中', guidance: '感情暫時停滯，不進不退', timing: '靜觀其變為上' },
      family: { verdict: '中', guidance: '家事暫擱一旁，各安其位', timing: '穩定現狀即可' },
      health: { verdict: '中', guidance: '背部和脊椎需保養', timing: '注意姿勢端正' },
      study: { verdict: '宜', guidance: '靜心冥想，定下心來深思', timing: '靜坐沉思有大得' },
    },
  },
  {
    id: 53, name: '漸', symbol: '䷴', upperTrigram: '巽', lowerTrigram: '艮',
    oracle: '女歸吉，利貞', mysticalLine: '山上有木，漸；君子以居賢德善俗',
    fortuneLevel: '吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '循序漸進，穩步發展，不可急躁', timing: '一步一步來最好' },
      love: { verdict: '宜', guidance: '感情漸入佳境，緩慢但穩固', timing: '漸漸走近對方心' },
      family: { verdict: '宜', guidance: '家運漸佳，慢慢變好', timing: '耐心等候好結果' },
      health: { verdict: '宜', guidance: '身體慢慢恢復，不要操之過急', timing: '漸進式康復' },
      study: { verdict: '宜', guidance: '學業穩定進步，不求速成', timing: '每天進步一點點' },
    },
  },
  {
    id: 54, name: '歸妹', symbol: '䷵', upperTrigram: '震', lowerTrigram: '兌',
    oracle: '征凶，無攸利', mysticalLine: '澤上有雷，歸妹；君子以永終知敝',
    fortuneLevel: '末凶', element: '金',
    interpretations: {
      career: { verdict: '不宜', guidance: '行事不當之象，宜謹慎反省', timing: '暫緩前進重新評估' },
      love: { verdict: '中', guidance: '感情中位置不對等，需要調整', timing: '重新審視關係定位' },
      family: { verdict: '中', guidance: '家中關係需要重新定位', timing: '明確各自角色' },
      health: { verdict: '中', guidance: '注意婦科或泌尿問題', timing: '定期檢查為上' },
      study: { verdict: '不宜', guidance: '學業方向可能走偏，需要糾正', timing: '及時調整方向' },
    },
  },
  {
    id: 55, name: '豐', symbol: '䷶', upperTrigram: '震', lowerTrigram: '離',
    oracle: '亨，王假之', mysticalLine: '雷電皆至，豐；君子以折獄致刑',
    fortuneLevel: '上吉', element: '火',
    interpretations: {
      career: { verdict: '大宜', guidance: '豐收之象，事業巔峰，盡情收穫', timing: '巔峰時期把握機會' },
      love: { verdict: '大宜', guidance: '感情豐碩，甜蜜圓滿', timing: '感情最甜蜜時期' },
      family: { verdict: '大宜', guidance: '家運豐盈，物質精神雙豐收', timing: '家庭黃金時期' },
      health: { verdict: '宜', guidance: '精力旺盛，但注意頂峰後的調理', timing: '盛極之後宜保養' },
      study: { verdict: '大宜', guidance: '學業豐收，成果豐碩', timing: '收穫成果的時刻' },
    },
  },
  {
    id: 56, name: '旅', symbol: '䷷', upperTrigram: '離', lowerTrigram: '艮',
    oracle: '小亨，旅貞吉', mysticalLine: '山上有火，旅；君子以明慎用刑',
    fortuneLevel: '小吉', element: '火',
    interpretations: {
      career: { verdict: '中', guidance: '漂泊不定之象，宜靈活應變', timing: '外出發展有小利' },
      love: { verdict: '中', guidance: '感情如旅途，充滿未知但也有驚喜', timing: '異地戀或旅途戀情' },
      family: { verdict: '中', guidance: '家人分散各地，但心繫彼此', timing: '遠方思念不減' },
      health: { verdict: '中', guidance: '出行注意安全和水土不服', timing: '外出需備常用藥' },
      study: { verdict: '宜', guidance: '遊學之象，讀萬卷書行萬里路', timing: '出外學習有益' },
    },
  },
  {
    id: 57, name: '巽', symbol: '䷸', upperTrigram: '巽', lowerTrigram: '巽',
    oracle: '小亨，利有攸往', mysticalLine: '隨風巽；君子以申命行事',
    fortuneLevel: '小吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '溫和漸進，以柔克剛，順勢而為', timing: '柔性策略最有效' },
      love: { verdict: '宜', guidance: '溫柔體貼打動對方心', timing: '以柔情感化為上' },
      family: { verdict: '宜', guidance: '家庭溝通宜溫和，春風化雨', timing: '和聲細語效果佳' },
      health: { verdict: '中', guidance: '注意風邪和呼吸道', timing: '防風保暖為要' },
      study: { verdict: '宜', guidance: '學習如風般深入滲透，融會貫通', timing: '潛移默化中進步' },
    },
  },
  {
    id: 58, name: '兌', symbol: '䷹', upperTrigram: '兌', lowerTrigram: '兌',
    oracle: '亨，利貞', mysticalLine: '麗澤兌；君子以朋友講習',
    fortuneLevel: '吉', element: '金',
    interpretations: {
      career: { verdict: '宜', guidance: '喜悅和諧，社交順暢，利於談判', timing: '近期社交運極佳' },
      love: { verdict: '大宜', guidance: '歡喜冤家，感情甜蜜愉悅', timing: '最甜蜜的相處時光' },
      family: { verdict: '宜', guidance: '家庭歡笑不斷，樂融融', timing: '歡聚時光' },
      health: { verdict: '宜', guidance: '笑口常開百病消', timing: '保持好心情' },
      study: { verdict: '宜', guidance: '師友共學，教學相長', timing: '交流討論效果佳' },
    },
  },
  {
    id: 59, name: '渙', symbol: '䷺', upperTrigram: '巽', lowerTrigram: '坎',
    oracle: '亨，王假有廟', mysticalLine: '風行水上，渙；先王以享于帝立廟',
    fortuneLevel: '半吉', element: '水',
    interpretations: {
      career: { verdict: '中', guidance: '渙散之象，宜重新凝聚力量', timing: '集中精力整合資源' },
      love: { verdict: '中', guidance: '感情有散的趨勢，需要用心維繫', timing: '多花時間在對方身上' },
      family: { verdict: '中', guidance: '家人各忙各的，需要創造團聚機會', timing: '安排家庭聚會' },
      health: { verdict: '中', guidance: '注意精神渙散，集中注意力', timing: '冥想有助集中' },
      study: { verdict: '中', guidance: '注意力分散，需要收心', timing: '減少干擾源' },
    },
  },
  {
    id: 60, name: '節', symbol: '䷻', upperTrigram: '坎', lowerTrigram: '兌',
    oracle: '亨，苦節不可貞', mysticalLine: '澤上有水，節；君子以制數度，議德行',
    fortuneLevel: '小吉', element: '水',
    interpretations: {
      career: { verdict: '宜', guidance: '適度節制，量入為出，穩健經營', timing: '控制節奏為上策' },
      love: { verdict: '中', guidance: '感情需要適度節制，不過度依賴', timing: '保持適當距離感' },
      family: { verdict: '宜', guidance: '家庭開支需節制，量力而行', timing: '適度節儉有益' },
      health: { verdict: '宜', guidance: '節制飲食和作息，規律生活', timing: '自律帶來健康' },
      study: { verdict: '宜', guidance: '有節奏地學習，勞逸結合', timing: '合理安排時間表' },
    },
  },
  {
    id: 61, name: '中孚', symbol: '䷼', upperTrigram: '巽', lowerTrigram: '兌',
    oracle: '豚魚吉，利涉大川', mysticalLine: '澤上有風，中孚；君子以議獄緩死',
    fortuneLevel: '吉', element: '木',
    interpretations: {
      career: { verdict: '宜', guidance: '誠信為本，以真心感動他人', timing: '以誠心打動客戶' },
      love: { verdict: '大宜', guidance: '心心相印，誠信相待，感情深厚', timing: '真心換真心' },
      family: { verdict: '大宜', guidance: '家人之間信任深厚，坦誠相待', timing: '信任是家庭基石' },
      health: { verdict: '宜', guidance: '心態平和，身心自然健康', timing: '內心安定百病消' },
      study: { verdict: '宜', guidance: '誠心學習，觸類旁通', timing: '用心則無所不能' },
    },
  },
  {
    id: 62, name: '小過', symbol: '䷽', upperTrigram: '震', lowerTrigram: '艮',
    oracle: '亨，利貞，可小事，不可大事', mysticalLine: '山上有雷，小過；君子以行過乎恭',
    fortuneLevel: '末吉', element: '木',
    interpretations: {
      career: { verdict: '中', guidance: '小事可成大事不宜，宜低調行事', timing: '做好小事積累信譽' },
      love: { verdict: '中', guidance: '感情中注意小細節，小動作打動人心', timing: '細節決定成敗' },
      family: { verdict: '中', guidance: '家事從小處著手，積少成多', timing: '處理好日常小事' },
      health: { verdict: '中', guidance: '小病不可忽視，及時處理', timing: '別輕忽小症狀' },
      study: { verdict: '中', guidance: '注重基礎知識，不好高騖遠', timing: '打好基本功' },
    },
  },
  {
    id: 63, name: '既濟', symbol: '䷾', upperTrigram: '坎', lowerTrigram: '離',
    oracle: '亨小，利貞，初吉終亂', mysticalLine: '水在火上，既濟；君子以思患而豫防之',
    fortuneLevel: '中吉', element: '水',
    interpretations: {
      career: { verdict: '宜', guidance: '事業已成，宜守成不宜冒進', timing: '鞏固現有成果為上' },
      love: { verdict: '宜', guidance: '感情圓滿完成，珍惜當下', timing: '好好珍惜眼前人' },
      family: { verdict: '宜', guidance: '家事安定，但需防微杜漸', timing: '居安思危為上' },
      health: { verdict: '宜', guidance: '身體狀態良好，但需持續保養', timing: '別因健康好就放鬆' },
      study: { verdict: '宜', guidance: '學業有成，但需持續精進', timing: '完成階段性目標' },
    },
  },
  {
    id: 64, name: '未濟', symbol: '䷿', upperTrigram: '離', lowerTrigram: '坎',
    oracle: '亨，小狐汔濟，濡其尾', mysticalLine: '火在水上，未濟；君子以慎辨物居方',
    fortuneLevel: '半吉', element: '火',
    interpretations: {
      career: { verdict: '中', guidance: '事業未竟，仍需努力，勝利在望', timing: '最後一步不可鬆懈' },
      love: { verdict: '中', guidance: '感情尚未圓滿，還需要更多努力', timing: '繼續努力就快了' },
      family: { verdict: '中', guidance: '家事尚有未了之事，需要收尾', timing: '把未完成的做完' },
      health: { verdict: '中', guidance: '康復過程中，尚未完全恢復', timing: '繼續調養莫放棄' },
      study: { verdict: '宜', guidance: '學無止境，永遠有新的高峰等待攀登', timing: '終身學習之象' },
    },
  },
];

// ─── 卦象工具函式 ───

/**
 * 根據上下卦名查找卦象
 */
function findHexagramByTrigrams(upper: string, lower: string): Hexagram | null {
  return HEXAGRAMS.find(h => h.upperTrigram === upper && h.lowerTrigram === lower) || null;
}

/**
 * 將六爻 (0=陰, 1=陽) 轉換為上下卦名
 */
function linesToTrigrams(lines: number[]): { upper: string; lower: string } {
  const trigramPatterns: Record<string, string> = {
    '111': '乾', '000': '坤', '100': '震', '011': '巽',
    '010': '坎', '101': '離', '001': '艮', '110': '兌',
  };

  const lowerPattern = lines.slice(0, 3).join('');
  const upperPattern = lines.slice(3, 6).join('');

  return {
    upper: trigramPatterns[upperPattern] || '乾',
    lower: trigramPatterns[lowerPattern] || '坤',
  };
}

/**
 * 搖卦：生成六爻
 * 使用三枚銅錢法模擬
 * 每爻結果：6=老陰(變), 7=少陽, 8=少陰, 9=老陽(變)
 */
function generateLines(): { lines: number[]; changingLines: number[] } {
  const lines: number[] = [];
  const changingLines: number[] = [];

  for (let i = 0; i < 6; i++) {
    // 三枚銅錢：正(3)反(2)
    const coin1 = Math.random() < 0.5 ? 3 : 2;
    const coin2 = Math.random() < 0.5 ? 3 : 2;
    const coin3 = Math.random() < 0.5 ? 3 : 2;
    const sum = coin1 + coin2 + coin3; // 6, 7, 8, 9

    if (sum === 6) { // 老陰 → 變爻（陰變陽）
      lines.push(0);
      changingLines.push(i);
    } else if (sum === 9) { // 老陽 → 變爻（陽變陰）
      lines.push(1);
      changingLines.push(i);
    } else if (sum === 7) { // 少陽
      lines.push(1);
    } else { // sum === 8, 少陰
      lines.push(0);
    }
  }

  return { lines, changingLines };
}

/**
 * 根據變爻生成變卦
 */
function getChangedHexagram(lines: number[], changingLines: number[]): Hexagram | null {
  if (changingLines.length === 0) return null;

  const changedLines = [...lines];
  for (const pos of changingLines) {
    changedLines[pos] = changedLines[pos] === 0 ? 1 : 0;
  }

  const { upper, lower } = linesToTrigrams(changedLines);
  return findHexagramByTrigrams(upper, lower);
}

// ─── 公開 API ───

/**
 * 執行六十四卦占卜
 */
export function performHexagramDivination(
  category: DivinationCategory,
  question?: string,
): HexagramResult {
  const { lines, changingLines } = generateLines();
  const { upper, lower } = linesToTrigrams(lines);

  const hexagram = findHexagramByTrigrams(upper, lower) || HEXAGRAMS[0];
  const changedHexagram = getChangedHexagram(lines, changingLines);

  return {
    hexagram,
    changingLines,
    changedHexagram,
    category,
    question,
    timestamp: Date.now(),
  };
}

/**
 * 取得卦象吉凶顏色
 */
export function getHexagramColor(verdict: HexagramVerdict): string {
  switch (verdict) {
    case '大宜': return '#e8c547';   // 金色
    case '宜':   return '#80c880';   // 綠色
    case '中':   return '#8b7d5e';   // 灰金
    case '不宜': return '#c89060';   // 橙色
    case '大忌': return '#c44040';   // 紅色
  }
}

/**
 * 取得卦象的描述字串（給 Claude API 用）
 */
export function getHexagramDescription(result: HexagramResult): string {
  const h = result.hexagram;
  const interp = h.interpretations[result.category];
  let desc = `六十四卦占卜：第${h.id}卦「${h.name}」(${h.symbol})，`
    + `上${h.upperTrigram}下${h.lowerTrigram}，卦辭「${h.oracle}」。`
    + `問${getCategoryLabel(result.category)}：${interp.verdict}，${interp.guidance}。`;

  if (result.changedHexagram) {
    const ch = result.changedHexagram;
    desc += ` 變卦：第${ch.id}卦「${ch.name}」(${ch.symbol})，變爻${result.changingLines.map(l => l + 1).join('、')}。`;
  }

  return desc;
}

/**
 * 取得問事類別的中文標籤
 */
export function getCategoryLabel(category: DivinationCategory): string {
  const labels: Record<DivinationCategory, string> = {
    career: '事業', love: '感情', family: '家庭', health: '健康', study: '學業',
  };
  return labels[category];
}

/**
 * 取得問事類別的 emoji
 */
export function getCategoryEmoji(category: DivinationCategory): string {
  const emojis: Record<DivinationCategory, string> = {
    career: '💼', love: '💕', family: '🏠', health: '❤️‍🩹', study: '📖',
  };
  return emojis[category];
}

/**
 * 匯出卦象常數供外部使用
 */
export { HEXAGRAMS };
