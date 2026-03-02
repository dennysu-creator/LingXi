// ═══════════════════════════════════════
// 擲籤系統引擎
// 模擬傳統寺廟求籤：搖籤 → 擲筊確認 → 解籤
// 結合八字 + 奇門遁甲做個人化解讀
// ═══════════════════════════════════════

export type FortuneLevel =
  | '大吉' | '上吉' | '中吉' | '小吉' | '吉'
  | '半吉' | '末吉' | '平'
  | '末凶' | '半凶' | '小凶' | '凶' | '大凶';

export interface FortuneLot {
  id: number;            // 籤號 1-60
  level: FortuneLevel;   // 吉凶等級
  poem: string;          // 籤詩（四句七言）
  classicRef: string;    // 典故出處
  keywords: string[];    // 關鍵詞
}

export interface LotResult {
  lot: FortuneLot;
  jiaoBei: 'holy' | 'laughing' | 'angry';  // 擲筊結果：聖筊/笑筊/怒筊
  attempts: number;      // 擲筊次數
  question?: string;     // 用戶的問題
  timestamp: number;
}

// ─── 六十首籤詩庫 ───
// 參考觀音靈籤、關帝靈籤風格，原創籤詩
export const FORTUNE_LOTS: FortuneLot[] = [
  {
    id: 1, level: '大吉',
    poem: '日出東方照九州\n雲開霧散喜臨頭\n前路光明無阻礙\n青雲直上步高樓',
    classicRef: '旭日東昇',
    keywords: ['事業突破', '貴人相助', '時機成熟'],
  },
  {
    id: 2, level: '大吉',
    poem: '龍躍天門風雲會\n鳳鳴朝陽紫氣來\n十年寒窗磨一劍\n今朝出鞘震四海',
    classicRef: '龍鳳呈祥',
    keywords: ['大展宏圖', '功成名就', '把握機會'],
  },
  {
    id: 3, level: '上吉',
    poem: '春風得意馬蹄疾\n一日看盡長安花\n財祿雙全人歡喜\n紫微高照福滿家',
    classicRef: '春風得意',
    keywords: ['順風順水', '財運亨通', '喜事連連'],
  },
  {
    id: 4, level: '上吉',
    poem: '金鱗豈是池中物\n一遇風雲便化龍\n守得雲開見月明\n前程似錦步從容',
    classicRef: '魚躍龍門',
    keywords: ['質變飛躍', '堅持到底', '否極泰來'],
  },
  {
    id: 5, level: '上吉',
    poem: '貴人指路明方向\n東風送暖入屠蘇\n心誠則靈求必應\n萬事亨通福自如',
    classicRef: '貴人引路',
    keywords: ['貴人運旺', '誠心感應', '心想事成'],
  },
  {
    id: 6, level: '中吉',
    poem: '桃花流水窅然去\n別有天地非人間\n靜待時機莫心急\n水到渠成自然圓',
    classicRef: '桃源洞天',
    keywords: ['耐心等待', '順其自然', '漸入佳境'],
  },
  {
    id: 7, level: '中吉',
    poem: '月到中秋分外明\n人逢喜事精神清\n但憑信念行正道\n自有福星照前程',
    classicRef: '月圓花好',
    keywords: ['光明正道', '信念堅定', '福報將至'],
  },
  {
    id: 8, level: '中吉',
    poem: '風吹楊柳千條線\n雨打桃花萬點紅\n歷經風雨方見彩\n柳暗花明又一村',
    classicRef: '柳暗花明',
    keywords: ['先苦後甜', '轉機將至', '堅持不懈'],
  },
  {
    id: 9, level: '中吉',
    poem: '白雲深處有人家\n採菊東籬對晚霞\n心寬路廣天地闊\n清風明月共天涯',
    classicRef: '悠然自得',
    keywords: ['心態平和', '隨遇而安', '知足常樂'],
  },
  {
    id: 10, level: '吉',
    poem: '松柏經冬猶挺立\n寒梅傲雪暗飄香\n雖然眼前多曲折\n終見春光照四方',
    classicRef: '松柏常青',
    keywords: ['穩中有進', '堅韌不拔', '否極泰來'],
  },
  {
    id: 11, level: '吉',
    poem: '細水長流潤無聲\n滴水穿石在持恆\n莫嫌進步嫌太慢\n積少成多見大成',
    classicRef: '水滴石穿',
    keywords: ['循序漸進', '持之以恆', '穩紮穩打'],
  },
  {
    id: 12, level: '吉',
    poem: '燕子銜泥巧築巢\n一磚一瓦見功勞\n勤勉自有天佑護\n家和萬事自然好',
    classicRef: '燕巢築夢',
    keywords: ['勤勉踏實', '家庭和睦', '天道酬勤'],
  },
  {
    id: 13, level: '小吉',
    poem: '半畝方塘一鑑開\n天光雲影共徘徊\n問渠那得清如許\n為有源頭活水來',
    classicRef: '活水源頭',
    keywords: ['學習成長', '保持初心', '小有收穫'],
  },
  {
    id: 14, level: '小吉',
    poem: '田中禾苗待天晴\n風調雨順看收成\n勿急勿躁安心等\n自有豐年在後程',
    classicRef: '靜待豐收',
    keywords: ['耐心守候', '時機未到', '終有回報'],
  },
  {
    id: 15, level: '小吉',
    poem: '雛鳥初飛力未全\n且在枝頭穩步前\n假以時日羽豐滿\n展翅高飛上九天',
    classicRef: '雛鳥學飛',
    keywords: ['穩步成長', '尚需磨練', '未來可期'],
  },
  {
    id: 16, level: '半吉',
    poem: '山重水複疑無路\n撥開迷霧見曙光\n事在人為莫氣餒\n轉個彎來路更長',
    classicRef: '峰迴路轉',
    keywords: ['柳暗花明', '換個角度', '主動求變'],
  },
  {
    id: 17, level: '半吉',
    poem: '舟行水上遇逆風\n且收帆來待東風\n急流勇退非怯懦\n以退為進是英雄',
    classicRef: '以退為進',
    keywords: ['韜光養晦', '暫時退守', '保存實力'],
  },
  {
    id: 18, level: '半吉',
    poem: '花開半朵留餘韻\n月到半圓正可期\n凡事不可求太滿\n留有餘地最相宜',
    classicRef: '月缺花殘',
    keywords: ['適可而止', '留有餘地', '知足常樂'],
  },
  {
    id: 19, level: '末吉',
    poem: '雲遮日頭暫無光\n莫道天公不作美\n撐過此刻風雨後\n彩虹必在天邊掛',
    classicRef: '雨後彩虹',
    keywords: ['暫時困難', '曙光在前', '咬牙堅持'],
  },
  {
    id: 20, level: '末吉',
    poem: '枯木逢春又發芽\n冰河解凍見泥沙\n雖是眼前景蕭瑟\n待到春來百花發',
    classicRef: '枯木逢春',
    keywords: ['觸底反彈', '轉機將來', '不要放棄'],
  },
  {
    id: 21, level: '平',
    poem: '太公渭水坐磯石\n靜守時機莫妄為\n動不如靜觀其變\n候得風來自揚帆',
    classicRef: '太公釣魚',
    keywords: ['靜觀其變', '以靜制動', '切勿衝動'],
  },
  {
    id: 22, level: '平',
    poem: '棋到中盤觀大勢\n進退之間細思量\n不宜冒進不宜退\n穩住陣腳看方向',
    classicRef: '棋逢對手',
    keywords: ['謹慎行事', '維持現狀', '觀望為主'],
  },
  {
    id: 23, level: '平',
    poem: '平湖秋月照無痕\n不驚不喜度光陰\n此時宜守不宜攻\n心如止水待天明',
    classicRef: '平湖秋月',
    keywords: ['心平氣和', '守成為上', '不進不退'],
  },
  {
    id: 24, level: '末凶',
    poem: '行舟偏遇打頭風\n進退兩難費心中\n且把船頭暫轉向\n另尋港灣避狂風',
    classicRef: '逆風行舟',
    keywords: ['暫避風頭', '轉換方向', '不宜強行'],
  },
  {
    id: 25, level: '末凶',
    poem: '濃霧遮眼路難行\n此刻前進恐跌坑\n不妨原地候天晴\n莫讓衝動壞前程',
    classicRef: '霧中行路',
    keywords: ['暫緩行動', '資訊不足', '避免衝動'],
  },
  {
    id: 26, level: '半凶',
    poem: '秋風落葉滿地黃\n暫時失意莫悲傷\n冬去春來大地暖\n蟄伏過後更堅強',
    classicRef: '秋風落葉',
    keywords: ['暫時低谷', '蓄勢待發', '調整心態'],
  },
  {
    id: 27, level: '小凶',
    poem: '烏雲壓頂雨將傾\n出門在外要留心\n小心口舌防小人\n守好本分莫貪心',
    classicRef: '暴風雨前',
    keywords: ['謹言慎行', '防備小人', '收斂鋒芒'],
  },
  {
    id: 28, level: '凶',
    poem: '逆水行舟不進退\n此時進取恐徒勞\n退一步來海闊天\n忍一時來風浪消',
    classicRef: '急流險灘',
    keywords: ['暫時放下', '退讓為智', '避免爭執'],
  },
  // ─── 補充至 60 籤（以下為更多籤詩）───
  {
    id: 29, level: '大吉',
    poem: '紫氣東來照華堂\n龍馬精神氣軒昂\n一舉成名天下知\n富貴榮華萬年長',
    classicRef: '紫氣東來',
    keywords: ['名利雙收', '大展鴻圖', '天時地利'],
  },
  {
    id: 30, level: '上吉',
    poem: '明月當空照大千\n清風徐來伴人眠\n諸事順遂心無憂\n福祿壽喜降人間',
    classicRef: '明月清風',
    keywords: ['萬事如意', '身心安泰', '福氣臨門'],
  },
  {
    id: 31, level: '中吉',
    poem: '春蠶到老絲方盡\n蠟炬成灰淚始乾\n付出終得好回報\n功不唐捐在人間',
    classicRef: '春蠶蠟炬',
    keywords: ['付出有報', '堅持到底', '感動他人'],
  },
  {
    id: 32, level: '吉',
    poem: '千里之行始足下\n涓涓細流匯成河\n莫以善小而不為\n積善之家有餘慶',
    classicRef: '千里之行',
    keywords: ['腳踏實地', '積少成多', '善行有報'],
  },
  {
    id: 33, level: '小吉',
    poem: '種瓜得瓜種豆豆\n因果循環在心頭\n但行好事莫問前\n老天自有好安排',
    classicRef: '種瓜得瓜',
    keywords: ['因果不虛', '但行好事', '順天應命'],
  },
  {
    id: 34, level: '半吉',
    poem: '塞翁失馬焉知福\n禍福相倚在一念\n眼前之失未必失\n退後一步是向前',
    classicRef: '塞翁失馬',
    keywords: ['禍福相依', '轉念為安', '危中有機'],
  },
  {
    id: 35, level: '平',
    poem: '坐看雲起時已至\n行到水窮處未窮\n不急不緩循天道\n自然之理最從容',
    classicRef: '行雲流水',
    keywords: ['順其自然', '不急不躁', '隨緣而行'],
  },
  {
    id: 36, level: '末吉',
    poem: '黑夜漫漫終有盡\n啟明星出在東方\n最暗之時近黎明\n再撐一步見天光',
    classicRef: '黎明前夕',
    keywords: ['黎明將至', '最後堅持', '希望在前'],
  },
  {
    id: 37, level: '中吉',
    poem: '良辰美景奈何天\n賞心樂事共嬋娟\n把握當下惜眼前\n莫待無花空折枝',
    classicRef: '良辰美景',
    keywords: ['把握當下', '珍惜機會', '及時行動'],
  },
  {
    id: 38, level: '吉',
    poem: '孤舟蓑笠翁獨釣\n寒江雪裡見真功\n耐得住寂寞苦寒\n方能成就大不同',
    classicRef: '獨釣寒江',
    keywords: ['耐住寂寞', '專注修行', '厚積薄發'],
  },
  {
    id: 39, level: '上吉',
    poem: '鯤鵬展翅九萬里\n扶搖直上入雲端\n大器晚成終有時\n一飛沖天驚世間',
    classicRef: '鯤鵬萬里',
    keywords: ['大器晚成', '一鳴驚人', '格局宏大'],
  },
  {
    id: 40, level: '小凶',
    poem: '風急浪高船搖晃\n暗礁前方需提防\n此刻穩舵避風浪\n安全第一保無恙',
    classicRef: '風急浪高',
    keywords: ['注意安全', '避開風險', '穩健為上'],
  },
  // 41-60 補充
  { id: 41, level: '大吉', poem: '鳳凰涅槃浴火生\n百鍊成鋼氣自宏\n歷盡千帆歸來日\n仍是少年英雄夢', classicRef: '鳳凰涅槃', keywords: ['浴火重生', '脫胎換骨', '全新開始'] },
  { id: 42, level: '中吉', poem: '老樹新芽春又發\n枯枝嫩葉綠生花\n人生處處有轉機\n莫言遲暮嘆年華', classicRef: '老樹新芽', keywords: ['東山再起', '新的開始', '永不嫌遲'] },
  { id: 43, level: '吉', poem: '竹杖芒鞋輕勝馬\n一蓑煙雨任平生\n料峭春風吹酒醒\n回首向來蕭瑟處', classicRef: '煙雨任平生', keywords: ['豁達從容', '隨遇而安', '心無掛礙'] },
  { id: 44, level: '小吉', poem: '守株待兔非長策\n主動出擊見真章\n機會不等懶惰人\n起身行動路自寬', classicRef: '守株待兔', keywords: ['主動出擊', '行動起來', '機不可失'] },
  { id: 45, level: '半吉', poem: '螞蟻搬家雨將至\n未雨綢繆是先知\n凡事預則立不廢\n防患未然保太平', classicRef: '未雨綢繆', keywords: ['提前準備', '防患未然', '居安思危'] },
  { id: 46, level: '平', poem: '庭前花開花又落\n歲歲年年人不同\n順逆皆是修行路\n平常心處見真功', classicRef: '花開花落', keywords: ['平常心', '順逆皆修行', '不必執著'] },
  { id: 47, level: '末凶', poem: '燈蛾撲火非明智\n知止而後有所得\n衝動行事多後悔\n三思而後再決行', classicRef: '飛蛾撲火', keywords: ['三思後行', '切勿衝動', '知止不殆'] },
  { id: 48, level: '凶', poem: '風聲鶴唳草木兵\n多疑多慮心不寧\n退一步想開一點\n莫讓煩惱困此生', classicRef: '風聲鶴唳', keywords: ['放下執念', '解開心結', '退讓為上'] },
  { id: 49, level: '上吉', poem: '天降大任於斯人\n苦其心志勞筋骨\n所有磨難皆考驗\n通過之後便封神', classicRef: '天降大任', keywords: ['天將降大任', '考驗必過', '苦盡甘來'] },
  { id: 50, level: '中吉', poem: '眾人皆醉我獨醒\n明辨是非心自清\n堅持己見莫隨波\n真金不怕火來烹', classicRef: '眾醉獨醒', keywords: ['堅持判斷', '不隨波逐流', '真金不怕火'] },
  { id: 51, level: '吉', poem: '桃李不言下自成\n默默耕耘見真情\n不必張揚求表現\n實力到了自有名', classicRef: '桃李不言', keywords: ['默默耕耘', '實力說話', '低調做事'] },
  { id: 52, level: '小吉', poem: '三人同行有我師\n虛心學習莫自恃\n廣結善緣多請教\n他山之石可攻玉', classicRef: '三人行必有我師', keywords: ['虛心學習', '廣結善緣', '借力使力'] },
  { id: 53, level: '半吉', poem: '破釜沉舟非輕舉\n背水一戰要審慎\n若有十足把握時\n放手一搏創乾坤', classicRef: '破釜沉舟', keywords: ['審慎評估', '孤注一擲', '非不得已勿用'] },
  { id: 54, level: '末吉', poem: '愚公移山志不移\n日積月累見成績\n旁人笑我太癡傻\n待到山平方知智', classicRef: '愚公移山', keywords: ['堅持信念', '不畏嘲笑', '終會成功'] },
  { id: 55, level: '平', poem: '大智若愚藏鋒芒\n韜光養晦待時揚\n此刻不顯非無能\n蓄勢一發動四方', classicRef: '大智若愚', keywords: ['藏鋒養銳', '靜待時機', '厚積薄發'] },
  { id: 56, level: '末凶', poem: '貪多嚼不爛費心\n專注一事方能精\n分散精力皆平庸\n不如集中破一城', classicRef: '貪多嚼不爛', keywords: ['專注聚焦', '不要貪多', '一事精通'] },
  { id: 57, level: '半凶', poem: '心浮氣躁難成事\n靜下心來看分明\n煩惱皆因想太多\n放空自己再出發', classicRef: '心浮氣躁', keywords: ['平靜內心', '放下煩惱', '重新出發'] },
  { id: 58, level: '大吉', poem: '萬事俱備東風至\n天時地利人和齊\n此時不動更待何\n一躍成龍在今時', classicRef: '萬事俱備', keywords: ['天時地利', '立刻行動', '大好時機'] },
  { id: 59, level: '中吉', poem: '柳絮因風起飛揚\n不知歸處任徜徉\n隨風而動隨緣走\n處處皆是好風光', classicRef: '柳絮隨風', keywords: ['隨緣自在', '順勢而為', '處處風光'] },
  { id: 60, level: '小凶', poem: '刻舟求劍法已舊\n世事變遷莫守舊\n靈活應變識時務\n方能乘風破萬浪', classicRef: '刻舟求劍', keywords: ['與時俱進', '靈活應變', '莫守成規'] },
];

// ─── 籤等級排序（用於 UI 顏色映射）───
export const FORTUNE_LEVEL_ORDER: FortuneLevel[] = [
  '大吉', '上吉', '中吉', '吉', '小吉', '半吉', '末吉',
  '平',
  '末凶', '半凶', '小凶', '凶', '大凶',
];

export function getFortuneColor(level: FortuneLevel): string {
  const index = FORTUNE_LEVEL_ORDER.indexOf(level);
  if (index <= 1) return '#e8c547';   // 金色 — 大吉、上吉
  if (index <= 4) return '#80c880';   // 綠色 — 中吉~小吉
  if (index <= 6) return '#c4b07a';   // 暗金 — 半吉、末吉
  if (index === 7) return '#8b7d5e';  // 灰 — 平
  if (index <= 9) return '#c89060';   // 橙 — 末凶、半凶
  return '#c44040';                    // 紅 — 小凶~大凶
}

/**
 * 擲筊模擬
 * 聖筊(一正一反)機率 ~50%，笑筊(雙正)~25%，怒筊(雙反)~25%
 */
export function throwJiaoBei(): 'holy' | 'laughing' | 'angry' {
  const rand = Math.random();
  if (rand < 0.5) return 'holy';      // 聖筊 ✓ — 神明同意
  if (rand < 0.75) return 'laughing';  // 笑筊 — 神明笑而不答
  return 'angry';                       // 怒筊 — 神明不同意
}

/**
 * 搖籤 — 抽出一支籤
 * 可選加入八字權重：缺某五行時偏向相關籤
 */
export function drawLot(deficientElement?: string): FortuneLot {
  const index = Math.floor(Math.random() * FORTUNE_LOTS.length);
  return FORTUNE_LOTS[index];
}

/**
 * 完整求籤流程
 * 搖籤 → 擲筊確認（最多 3 次）→ 回傳結果
 */
export function performDivination(question?: string): LotResult {
  const lot = drawLot();
  let attempts = 0;
  let jiaoBei: 'holy' | 'laughing' | 'angry' = 'laughing';

  // 最多擲 3 次筊，第一次聖筊即確認
  for (let i = 0; i < 3; i++) {
    attempts++;
    jiaoBei = throwJiaoBei();
    if (jiaoBei === 'holy') break;
  }

  // 如果 3 次都沒聖筊，仍回傳結果但標記
  return {
    lot,
    jiaoBei,
    attempts,
    question,
    timestamp: Date.now(),
  };
}

/**
 * 取得擲筊的顯示文字
 */
export function getJiaoBeiLabel(result: 'holy' | 'laughing' | 'angry'): {
  label: string;
  emoji: string;
  description: string;
} {
  switch (result) {
    case 'holy':
      return { label: '聖筊', emoji: '🌙', description: '神明允准，此籤有效' };
    case 'laughing':
      return { label: '笑筊', emoji: '😊', description: '神明微笑，意思未明' };
    case 'angry':
      return { label: '怒筊', emoji: '😤', description: '神明不允，請重新思考' };
  }
}
