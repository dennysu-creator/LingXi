// ═══════════════════════════════════════
// 靈寵中心 V4 — Pet-First Immersive
// 全螢幕靈寵 + 頂部 chip + 右側浮鈕 + 可收合 PetBubble + 透明 5-tab 分類列
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, GlowShadow, V4 } from '@/config/theme';

import { UI_ICONS } from '@/assets/images';
import { usePetStore } from '@/stores/pet-store';
import { useUserStore } from '@/stores/user-store';
import { useChatStore, type FortuneData } from '@/stores/chat-store';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';
import { calculateUnifiedFortune, type UnifiedFortuneResult } from '@/services/unified-fortune-engine';
import { getCurrentShichen } from '@/services/bazi-engine';
import { getLocalDateKey } from '@/services/date-utils';
import { generateQimenChart } from '@/services/qimen-engine';

import PetAvatar, { type ActiveFeature } from '@/components/PetAvatar';
import UpgradeModal from '@/components/UpgradeModal';

// 羅盤浮層（靈心用）
import * as Location from 'expo-location';
let Magnetometer: any = null;
if (Platform.OS !== 'web') {
  try { Magnetometer = require('expo-sensors').Magnetometer; } catch {}
}

// ─── 毛玻璃 wrapper(BlurView + 半透明覆蓋色) ───
const Glass = ({ intensity = 40, tint = 'dark' as 'dark' | 'light' | 'default', children, style }: {
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  children?: React.ReactNode;
  style?: any;
}) => (
  <BlurView intensity={intensity} tint={tint} style={[{ backgroundColor: V4.glass.base }, style]}>
    {children}
  </BlurView>
);

// ─── 時段判斷(用於頂部三顆進度點) ───
function getTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

// ─── HH:mm formatter ───
function formatHHmm(t: number | string | Date | undefined): string {
  if (!t) return '';
  const d = t instanceof Date ? t : new Date(t);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ─── PetBubble 標題(依訊息 type) ───
function getBubbleTitle(msgType: string | undefined): string {
  switch (msgType) {
    case 'evolve':     return '靈寵進化';
    case 'levelup':    return '靈寵升級';
    case 'face':       return '靈眼觀相';
    case 'fengshui':   return '靈心風水';
    case 'divination': return '靈寵卜卦';
    case 'chat':       return '靈寵回應';
    case 'user':       return '主人問';
    case 'system':     return '系統訊息';
    case 'fortune':
    default:           return '今日靈寵奇語';
  }
}

// ─── 高亮關鍵字渲染(吉凶 / 方位 / 吉時) ───
const HIGHLIGHT_PATTERN = /大吉|中吉|小吉|需留意|上相|中相|平相|凶險|凶|東南方|東北方|西南方|西北方|正東方|正南方|正西方|正北方|東方|南方|西方|北方|吉時|吉方位|避方位/g;

function renderHighlightedBody(body: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  HIGHLIGHT_PATTERN.lastIndex = 0;
  while ((match = HIGHLIGHT_PATTERN.exec(body)) !== null) {
    if (match.index > lastIdx) parts.push(body.slice(lastIdx, match.index));
    parts.push(
      <Text key={`h${match.index}`} style={{ color: V4.text.accent, fontWeight: '600' }}>
        {match[0]}
      </Text>
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < body.length) parts.push(body.slice(lastIdx));
  return parts;
}

export default function PetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ─── State ───
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const fortuneGenRef = useRef(false);

  // ─── Store selectors ───
  const petId = usePetStore(s => s.petId);
  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petCreature = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);
  const incrementUsage = usePetStore(s => s.incrementUsage);
  const initPet = usePetStore(s => s.initPet);
  const usageCount = usePetStore(s => s.usageCount);

  const planType = useUserStore(s => s.planType);
  const birthMonth = useUserStore(s => s.birthMonth);
  const birthDay = useUserStore(s => s.birthDay);
  const bazi = useUserStore(s => s.bazi);

  // ─── Auto-fix: 如果 petId 為空但有生日資料，自動初始化靈寵 ───
  useEffect(() => {
    if (!petId && birthMonth && birthDay) {
      initPet(birthMonth, birthDay);
    }
  }, [petId, birthMonth, birthDay, initPet]);
  const ziwei = useUserStore(s => s.ziwei);
  const astrology = useUserStore(s => s.astrology);
  const canLevelUp = usePetStore(s => s.canLevelUp);

  const addMessage = useChatStore(s => s.addMessage);
  const messages = useChatStore(s => s.messages);
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };

  // ─── Bubble 收合動畫 ───
  const [bubbleCollapsed, setBubbleCollapsed] = useState(false);
  const bubbleAnim = useRef(new Animated.Value(1)).current; // 1 = expanded, 0 = collapsed

  // 新訊息到 → 自動展開
  const msgTimestamp = latestMessage?.time ?? latestMessage?.text?.length ?? 0;
  useEffect(() => { setBubbleCollapsed(false); }, [msgTimestamp, messages.length]);

  // 收合 / 展開 spring
  useEffect(() => {
    Animated.spring(bubbleAnim, {
      toValue: bubbleCollapsed ? 0 : 1,
      tension: V4.motion.bubbleSpring.tension,
      friction: V4.motion.bubbleSpring.friction,
      useNativeDriver: true,
    }).start();
  }, [bubbleCollapsed, bubbleAnim]);

  // ─── Generate daily fortune on mount ───
  useEffect(() => {
    if (fortuneGenRef.current) return;
    if (!bazi || !ziwei || !astrology) return;

    const today = getLocalDateKey(new Date());
    const slot = getTimeSlot();
    const alreadyGenerated = messages.some(
      m => m.type === 'fortune' && getLocalDateKey(m.time) === today && (m.data as FortuneData | undefined)?.slot === slot
    );

    if (alreadyGenerated) {
      fortuneGenRef.current = true;
      return;
    }
    fortuneGenRef.current = true;

    try {
      const qimenChart = generateQimenChart(new Date());
      const fortuneResult = calculateUnifiedFortune(bazi, ziwei, qimenChart, astrology);

      const narration = generateLocalPetNarration({
        feature: 'fortune',
        pet: petInfo,
        data: {
          level: fortuneResult.overallLevel,
          topDimension: getTopDimension(fortuneResult),
          topDirection: fortuneResult.luckyDirections?.[0] || '東南',
        },
      });

      addMessage({
        type: 'fortune',
        text: narration.spokenText,
        classicQuote: getFortuneQuote(fortuneResult),
        data: {
          slot,
          scores: fortuneResult.scores,
          overallScore: fortuneResult.overallScore,
          overallLevel: fortuneResult.overallLevel,
          luckyDirection: fortuneResult.luckyDirections?.[0],
          luckyColor: fortuneResult.luckyColors?.[0],
          luckyNumber: fortuneResult.luckyNumbers?.[0],
          luckyElement: fortuneResult.luckyElement,
        },
      });
    } catch {
      const narration = generateLocalPetNarration({ feature: 'fortune', pet: petInfo, data: {} });
      addMessage({ type: 'fortune', text: narration.spokenText, data: { slot } });
    }
  }, [bazi, ziwei, astrology]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuotaExhausted = useCallback(() => { setShowUpgrade(true); }, []);
  const closeFeature = useCallback(() => { setActiveFeature(null); }, []);

  const [inputText, setInputText] = useState('');
  const [divinationLoading, setDivinationLoading] = useState(false);

  // 占卜動畫
  const spinAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const CATEGORIES = [
    { key: 'career', label: '事業', icon: UI_ICONS.category.career },
    { key: 'love',   label: '桃花', icon: UI_ICONS.category.love },
    { key: 'family', label: '家庭', icon: UI_ICONS.category.family },
    { key: 'health', label: '健康', icon: UI_ICONS.category.health },
    { key: 'study',  label: '學業', icon: UI_ICONS.category.study },
  ];

  // 按類別直接算命 → 動畫 → 結果輸出到對話框
  const handleCategoryPress = useCallback((catKey: string) => {
    if (divinationLoading) return;
    if (!bazi || !ziwei || !astrology) return;
    // F4: 檢查每日額度
    const canUse = useUserStore.getState().useFeature('soul', petLevel);
    if (!canUse) { setShowUpgrade(true); return; }
    setDivinationLoading(true);

    const catLabel = CATEGORIES.find(c => c.key === catKey)?.label || '';

    // 啟動旋轉 + 脈衝動畫
    spinAnim.setValue(0);
    glowAnim.setValue(0);
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true }),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    spinLoop.start();
    glowLoop.start();

    // 2 秒後停止動畫，計算結果輸出
    setTimeout(() => {
      spinLoop.stop();
      glowLoop.stop();
      setDivinationLoading(false);

      try {
        const qimenChart = generateQimenChart(new Date());
        const fortuneResult = calculateUnifiedFortune(bazi, ziwei, qimenChart, astrology);

        // 取該類別的分數
        const scoreMap: Record<string, number> = {
          career: fortuneResult.scores.career,
          love:   fortuneResult.scores.love,
          family: fortuneResult.scores.health, // 家庭歸健康
          health: fortuneResult.scores.health,
          study:  fortuneResult.scores.study,
        };
        const score = scoreMap[catKey] ?? fortuneResult.overallScore;
        const level = score >= 80 ? '大吉' : score >= 60 ? '中吉' : score >= 40 ? '小吉' : '需留意';

        const narration = generateLocalPetNarration({
          feature: 'fortune',
          pet: petInfo,
          data: {
            level,
            topDimension: catLabel,
            topDirection: fortuneResult.luckyDirections?.[0] || '東南',
          },
        });

        // 組合完整結果文字
        const resultText = `【${catLabel}運勢 — ${level}】\n\n` +
          `${narration.spokenText}\n\n` +
          `✦ ${catLabel}指數：${score}/100\n` +
          (fortuneResult.luckyDirections?.[0] ? `✦ 幸運方位：${fortuneResult.luckyDirections[0]}\n` : '') +
          (fortuneResult.luckyColors?.[0]     ? `✦ 幸運色：${fortuneResult.luckyColors[0]}\n`   : '') +
          (fortuneResult.luckyNumbers?.[0]    ? `✦ 幸運數字：${fortuneResult.luckyNumbers[0]}` : '');

        addMessage({
          type: 'fortune',
          text: resultText,
          classicQuote: getFortuneQuote(fortuneResult),
          data: {
            slot: getTimeSlot(),
            category: catKey,
            scores: fortuneResult.scores,
            overallScore: score,
            overallLevel: level,
            luckyDirection: fortuneResult.luckyDirections?.[0],
            luckyColor: fortuneResult.luckyColors?.[0],
            luckyNumber: fortuneResult.luckyNumbers?.[0],
          },
        });
        // 使用次數 +1（升級/進化）
        const result = incrementUsage();
        if (result.evolved) {
          setTimeout(() => addMessage({ type: 'evolve', text: `🌟 ${petName}進化了！第${result.newEvolution}階段！`, data: { evolution: result.newEvolution } }), 500);
        } else if (result.leveledUp) {
          setTimeout(() => addMessage({ type: 'levelup', text: `✨ ${petName}升到 Lv.${result.newLevel} 了！`, data: { level: result.newLevel } }), 500);
        }
      } catch {
        addMessage({ type: 'fortune', text: `${petName}感應到了${catLabel}的氣息...但靈力尚不穩定，請稍後再試～`, data: { category: catKey } });
      }
    }, 2000);
  }, [divinationLoading, bazi, ziwei, astrology, addMessage, spinAnim, glowAnim, petInfo, petName, incrementUsage]);

  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  const [chatLoading, setChatLoading] = useState(false);
  const [eyeLoading, setEyeLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<any>(null);

  // ─── 靈心羅盤狀態 ───
  const [compassActive, setCompassActive] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  const [compassLocation, setCompassLocation] = useState<string>('');
  const compassAnim = useRef(new Animated.Value(0)).current;

  // 羅盤啟動
  useEffect(() => {
    if (!compassActive || !Magnetometer) return;
    const sub = Magnetometer.addListener((data: { x: number; y: number }) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      setCompassHeading((angle + 360) % 360);
    });
    Magnetometer.setUpdateInterval(200);

    // GPS
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [addr] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (addr) setCompassLocation(addr.city || addr.district || addr.name || '');
      }
    })();

    // 出現動畫
    Animated.spring(compassAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();

    return () => { sub.remove(); };
  }, [compassActive]);

  // 靈眼：開相機 → 拍照 → 動畫 → 分析結果
  const handleEyePress = useCallback(async () => {
    if (eyeLoading || cameraOpen) return;
    // F4: 檢查每日額度
    const canUse = useUserStore.getState().useFeature('eye', petLevel);
    if (!canUse) { setShowUpgrade(true); return; }
    // 請求相機權限
    if (Platform.OS !== 'web') {
      try {
        const { Camera } = require('expo-camera');
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          addMessage({ type: 'system', text: '需要相機權限才能使用靈眼面相功能', data: {} });
          return;
        }
      } catch {}
    }
    setCameraOpen(true);
  }, [eyeLoading, cameraOpen, addMessage]);

  // 拍照後分析
  const handleCameraCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      setCameraOpen(false);
      if (!photo?.base64) return;

      // 啟動分析動畫
      setEyeLoading(true);
      spinAnim.setValue(0);
      glowAnim.setValue(0);
      const s1 = Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true }));
      const g1 = Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]));
      s1.start(); g1.start();

      // 呼叫 API 分析面相
      try {
        const { analyzeFace } = await import('@/services/claude-api');
        const baziStr = bazi ? `${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}` : '';
        const data = await analyzeFace(photo.base64, baziStr, '', '');

        s1.stop(); g1.stop(); setEyeLoading(false);

        const score = data.overall_score || 75;
        const level = data.fortune_level || (score >= 80 ? '上相' : score >= 60 ? '中相' : '平相');
        const reading = (data as any).petMessage || data.ai_reading || '';

        const resultText = `【靈眼面相 — ${level}】\n\n` +
          (reading ? `${reading}\n\n` : `${petName}凝視了主人的面相...\n\n`) +
          `✦ 整體面相：${score}/100\n` +
          (data.features?.forehead ? `✦ 天庭：${data.features.forehead.score}/100\n` : '') +
          (data.features?.eyes     ? `✦ 眼相：${data.features.eyes.score}/100\n`     : '') +
          (data.lucky_direction    ? `✦ 吉方位：${data.lucky_direction}\n`             : '') +
          (data.lucky_item         ? `✦ 開運物：${data.lucky_item}`                    : '');

        addMessage({ type: 'face', text: resultText, data: { score, level, ...data } });
        incrementUsage();
      } catch {
        s1.stop(); g1.stop(); setEyeLoading(false);
        const score = Math.floor(60 + Math.random() * 30);
        const level = score >= 80 ? '上相' : score >= 60 ? '中相' : '平相';
        addMessage({ type: 'face', text: `【靈眼面相 — ${level}】\n\n${petName}凝視了主人的氣色...\n\n✦ 整體面相：${score}/100\n✦ ${score >= 70 ? '今日氣色不錯，適合社交！' : '建議多休息養氣。'}`, data: { score, level } });
        incrementUsage();
      }
    } catch {
      setCameraOpen(false);
      addMessage({ type: 'system', text: '拍照失敗，請重試', data: {} });
    }
  }, [bazi, petName, addMessage, spinAnim, glowAnim]);

  const handleHeartPress = useCallback(() => {
    if (compassActive || !bazi) return;
    // F4: 檢查每日額度
    const canUse = useUserStore.getState().useFeature('heart', petLevel);
    if (!canUse) { setShowUpgrade(true); return; }
    setCompassActive(true);

    // 2.5 秒後關閉羅盤，直接輸出風水結果到對話
    setTimeout(() => {
      Animated.timing(compassAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setCompassActive(false);

        try {
          const qimenChart = generateQimenChart(new Date());
          const fortuneResult = calculateUnifiedFortune(bazi, ziwei!, qimenChart, astrology!);
          const luckyDir = fortuneResult.luckyDirections?.[0] || '東南';
          const avoidDir = '西';
          const locStr = compassLocation || '目前位置';

          const resultText = `【靈心風水 — ${locStr}】\n\n` +
            `${petName}感應到此地的靈氣流向...\n\n` +
            `✦ 吉方位：${luckyDir}\n` +
            `✦ 避方位：${avoidDir}\n` +
            `✦ 綜合氣場：${fortuneResult.overallScore}/100\n\n` +
            `💡 建議面朝${luckyDir}方，有助於提升今日運勢。` +
            (fortuneResult.luckyColors?.[0] ? `\n🎨 幸運色：${fortuneResult.luckyColors[0]}` : '');

          addMessage({ type: 'fengshui', text: resultText, data: { luckyDir, avoidDir, location: locStr } });
          incrementUsage();
        } catch {
          addMessage({ type: 'fengshui', text: `${petName}正在感應周圍的風水氣場...但靈力尚不穩定，請稍後再試～`, data: {} });
        }
      });
    }, 2500);
  }, [compassActive, bazi, ziwei, astrology, compassLocation, petName, addMessage, compassAnim]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || chatLoading) return;
    // F4: 檢查聊天額度（使用 soul 類別）
    const remaining = useUserStore.getState().getRemainingUses('soul', petLevel);
    if (remaining <= 0) { setShowUpgrade(true); return; }
    const question = inputText.trim();
    addMessage({ type: 'user', text: question, data: {} });
    setInputText('');
    Keyboard.dismiss();
    setChatLoading(true);

    try {
      const { apiRequest } = await import('@/services/api-client');
      const resp = await apiRequest<{ data: { reply: string }; remaining: number }>('/ai/pet-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: question,
          petName,
          petElement,
          petPersonality: usePetStore.getState().personality,
          creature: petCreature,
          solarTerm: usePetStore.getState().solarTerm,
          zodiac: usePetStore.getState().zodiac,
          bazi: bazi ? JSON.stringify(bazi) : '',
        }),
      });
      addMessage({ type: 'chat', text: resp.data.reply, data: { question } });
    } catch {
      // API 失敗時用本地回覆
      const narration = generateLocalPetNarration({ feature: 'fortune', pet: petInfo, data: { level: '中吉', topDimension: '綜合', topDirection: '東南' } });
      addMessage({ type: 'chat', text: narration.spokenText, data: { question } });
    } finally {
      setChatLoading(false);
    }
  };

  // ─── 頂部三顆進度點 active index(早:0、午:1、晚:2)───
  const slot = getTimeSlot();
  const activeDotIdx = slot === 'morning' ? 0 : slot === 'afternoon' ? 1 : 2;

  // ─── 最近一次運勢分類(底部 tab active 態)───
  const lastCatKey = (latestMessage?.data as any)?.category as string | undefined;

  // ─── Bubble translateY 與 opacity ───
  const bubbleTranslateY = bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [320, 0] });
  const bubbleOpacity = bubbleAnim;

  const showBubble = !!latestMessage && !divinationLoading && !eyeLoading && !compassActive;
  const showCollapsedHandle = showBubble && bubbleCollapsed;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* ═══ Layer 0: 全螢幕靈寵 ═══ */}
      <View style={styles.petFullscreen}>
        <PetAvatar activeFeature={activeFeature} compact={false} fullscreen />
      </View>

      {/* ═══ Layer 1: 頂部漸層遮罩 ═══ */}
      <LinearGradient
        colors={['rgba(10,10,14,0.7)', 'rgba(10,10,14,0)']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* ═══ Layer 2: 底部漸層遮罩(讓 tab 與 bubble 可讀) ═══ */}
      <LinearGradient
        colors={['rgba(10,10,14,0)', 'rgba(10,10,14,0.85)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* ═══ 羅盤浮層(靈心啟動時) ═══ */}
      {compassActive && (
        <Animated.View style={[styles.compassOverlay, { opacity: compassAnim, transform: [{ scale: compassAnim }] }]}>
          <Animated.View style={[styles.compassRing, { transform: [{ rotate: `${-compassHeading}deg` }] }]}>
            {['北', '東', '南', '西'].map((dir, i) => (
              <Text key={dir} style={[styles.compassDir, {
                position: 'absolute',
                top: i === 0 ? 0 : i === 2 ? 140 : 65,
                left: i === 3 ? 0 : i === 1 ? 140 : 65,
              }]}>{dir}</Text>
            ))}
            <View style={styles.compassNeedle}>
              <View style={styles.needleN} />
              <View style={styles.needleS} />
            </View>
          </Animated.View>
          {compassLocation ? (
            <Text style={styles.compassLocText}>📍 {compassLocation}</Text>
          ) : (
            <Text style={styles.compassLocText}>📍 定位中...</Text>
          )}
          <Text style={styles.compassHint}>靈心感應風水氣場中...</Text>
        </Animated.View>
      )}

      {/* ═══ Layer 3: 頂部 chip(暱稱 + Lv + 三顆進度點 + 八卦徽章) ═══ */}
      <View style={[styles.headerWrap, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.navigate('/(tabs)/profile')} style={styles.headerChipPressable}>
          <Glass intensity={40} style={styles.headerChip}>
            <Text style={styles.headerName} numberOfLines={1}>{petName}</Text>
            <View style={styles.headerLvBadge}>
              <Text style={styles.headerLvText}>Lv.{petLevel}</Text>
            </View>
            <View style={styles.headerDots}>
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={[
                    styles.headerDot,
                    i < activeDotIdx && styles.headerDotPast,
                    i === activeDotIdx && styles.headerDotActive,
                  ]}
                />
              ))}
            </View>
          </Glass>
        </Pressable>

        {/* 八卦徽章 — 純視覺,長按 placeholder */}
        <Pressable
          onPress={() => {}}
          onLongPress={() => { /* placeholder for future action */ }}
          style={styles.headerBaguaPressable}
        >
          <Glass intensity={40} style={styles.headerBagua}>
            <Text style={styles.headerBaguaIcon}>☯</Text>
          </Glass>
        </Pressable>
      </View>

      {/* ═══ 相機浮層(靈眼拍照) ═══ */}
      {cameraOpen && Platform.OS !== 'web' && (() => {
        const CameraView = require('expo-camera').CameraView;
        return (
          <View style={styles.cameraOverlay}>
            <CameraView ref={cameraRef} style={styles.cameraView} facing="front" />
            <View style={styles.cameraUI}>
              <Text style={styles.cameraHint}>將臉部對準畫面中央</Text>
              <View style={styles.cameraBtnRow}>
                <Pressable style={styles.cameraCancelBtn} onPress={() => setCameraOpen(false)}>
                  <Text style={styles.cameraCancelText}>取消</Text>
                </Pressable>
                <Pressable style={styles.cameraShutterBtn} onPress={handleCameraCapture}>
                  <View style={styles.cameraShutterInner} />
                </Pressable>
                <View style={{ width: 60 }} />
              </View>
            </View>
          </View>
        );
      })()}

      {/* ═══ Layer 4: 右側浮鈕(44×44) ═══ */}
      <View style={styles.sideBtns} pointerEvents="box-none">
        <Pressable style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]} onPress={handleEyePress}>
          <Glass intensity={50} style={styles.sideBtnGlass}>
            <Image source={UI_ICONS.buttons.eye} style={styles.sideBtnIcon} resizeMode="contain" />
          </Glass>
          {planType === 'free' && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
        </Pressable>
        <Pressable style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]} onPress={handleHeartPress}>
          <Glass intensity={50} style={styles.sideBtnGlass}>
            <Image source={UI_ICONS.buttons.heart} style={styles.sideBtnIcon} resizeMode="contain" />
          </Glass>
          {planType === 'free' && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>🔒</Text></View>}
        </Pressable>
      </View>

      {/* ═══ Layer 5: PetBubble(可收合的訊息卡) ═══ */}
      {showBubble && (
        <Animated.View
          pointerEvents={bubbleCollapsed ? 'none' : 'box-none'}
          style={[
            styles.bubbleWrap,
            { transform: [{ translateY: bubbleTranslateY }], opacity: bubbleOpacity },
          ]}
        >
          <Glass intensity={50} style={styles.bubbleCard}>
            {/* 把手列(可點收合) */}
            <Pressable onPress={() => setBubbleCollapsed(true)} style={styles.bubbleHandleArea}>
              <View style={styles.bubbleHandleBar} />
            </Pressable>
            {/* 標題列 */}
            <View style={styles.bubbleHeader}>
              <View style={styles.bubbleTitleRow}>
                <View style={styles.bubbleTitleDot} />
                <Text style={styles.bubbleTitle} numberOfLines={1}>
                  {getBubbleTitle(latestMessage?.type)}
                </Text>
              </View>
              <View style={styles.bubbleHeaderRight}>
                <Text style={styles.bubbleTime}>{formatHHmm(latestMessage?.time)}</Text>
                <Pressable onPress={() => setBubbleCollapsed(true)} style={styles.bubbleCloseBtn}>
                  <Text style={styles.bubbleCloseText}>✕</Text>
                </Pressable>
              </View>
            </View>
            {/* 內文(高亮) */}
            <Text style={styles.bubbleBody} numberOfLines={6}>
              {renderHighlightedBody(latestMessage?.text || '')}
            </Text>
            {/* 分享 */}
            <Pressable
              onPress={() => { import('@/services/share-service').then(s => s.shareResult('靈犀運勢', latestMessage?.text || '')); }}
              style={styles.bubbleShareBtn}
            >
              <Text style={styles.bubbleShareText}>分享 ↗</Text>
            </Pressable>
          </Glass>
        </Animated.View>
      )}

      {/* ═══ 收合狀態的 8px 把手(讓使用者重新展開) ═══ */}
      {showCollapsedHandle && (
        <Pressable onPress={() => setBubbleCollapsed(false)} style={styles.collapsedHandleWrap} hitSlop={12}>
          <View style={styles.collapsedHandleBar} />
        </Pressable>
      )}

      {/* ═══ Layer 6: 輸入框(只在展開時顯示) ═══ */}
      {!bubbleCollapsed && (
        <View style={styles.composerWrap}>
          <Glass intensity={50} style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder={chatLoading ? '靈寵思考中...' : '向靈寵問卦...'}
              placeholderTextColor={V4.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              editable={!chatLoading}
            />
            <Pressable
              style={({ pressed }) => [styles.composerSendBtn, pressed && { opacity: 0.6 }, chatLoading && { opacity: 0.3 }]}
              onPress={handleSendMessage}
              disabled={chatLoading}
            >
              {chatLoading
                ? <Text style={styles.composerSendText}>⏳</Text>
                : <Image source={UI_ICONS.buttons.send} style={styles.composerSendIcon} resizeMode="contain" />}
            </Pressable>
          </Glass>
        </View>
      )}

      {/* ═══ Layer 7: 底部 5 顆透明 tab(分類重設計) ═══ */}
      <View style={[styles.tabRow, { paddingBottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
        {/* 今日剩餘次數 — 小字置右 */}
        <Text style={styles.tabRemainingText}>
          今日剩餘 {useUserStore.getState().getRemainingUses('soul', petLevel)} 次
        </Text>
        <View style={styles.tabRowInner}>
          {CATEGORIES.map(cat => {
            const isActive = lastCatKey === cat.key;
            return (
              <Pressable
                key={cat.key}
                style={({ pressed }) => [styles.tabBtn, pressed && { opacity: 0.55 }]}
                onPress={() => handleCategoryPress(cat.key)}
                disabled={divinationLoading}
              >
                <View style={[styles.tabIconCircle, isActive && styles.tabIconCircleActive]}>
                  <Image source={cat.icon} style={styles.tabIconImg} resizeMode="cover" />
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ═══ 占卜/靈眼動畫 ═══ */}
      {(divinationLoading || eyeLoading) && (
        <Glass intensity={60} style={styles.animOverlay}>
          <Animated.View style={[styles.animSpinner, { transform: [{ rotate: spinRotate }] }]}>
            <Text style={styles.animSymbol}>{eyeLoading ? '👁' : '☰'}</Text>
          </Animated.View>
          <Animated.Text style={[styles.animText, { opacity: glowOpacity }]}>
            {eyeLoading ? '靈眼正在觀相中...' : '靈寵正在感應中...'}
          </Animated.Text>
        </Glass>
      )}

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </KeyboardAvoidingView>
  );
}

// ─── Helpers ───
function getTopDimension(result: UnifiedFortuneResult): string {
  const { scores } = result;
  const dims = [
    { key: '財運', val: scores.wealth }, { key: '桃花', val: scores.love },
    { key: '事業', val: scores.career }, { key: '健康', val: scores.health },
    { key: '學業', val: scores.study },
  ];
  dims.sort((a, b) => b.val - a.val);
  return dims[0].key;
}

function getFortuneQuote(result: UnifiedFortuneResult): string | undefined {
  if (result.baziHighlight) return result.baziHighlight;
  if (result.ziweiHighlight) return result.ziweiHighlight;
  return undefined;
}

// ─── 版面常數(供 absolute 排層使用) ───
const TAB_ROW_TOTAL_H = 90; // icon 圓 42 + label + paddings
const COMPOSER_H = 50;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V4.ink },
  petFullscreen: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  // ─── 頂部 / 底部漸層 ───
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, zIndex: 1,
  },

  // ─── 頂部 chip(name + Lv + dots)+ 八卦徽章 ───
  headerWrap: {
    position: 'absolute', left: 0, right: 0, zIndex: 30,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: V4.space.md,
  },
  headerChipPressable: {
    flexShrink: 1,
    borderRadius: V4.radius.pill, overflow: 'hidden',
    borderWidth: 1, borderColor: V4.glass.border,
  },
  headerChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    gap: 10,
  },
  headerName: {
    fontSize: 15, color: V4.text.primary, fontFamily: Fonts.brush,
    letterSpacing: 2, maxWidth: 110,
  },
  headerLvBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: V4.radius.pill,
    backgroundColor: V4.gold,
  },
  headerLvText: {
    fontSize: 11, color: V4.ink, fontWeight: '700', letterSpacing: 0.5,
  },
  headerDots: {
    flexDirection: 'row', gap: 5, alignItems: 'center', marginLeft: 4,
  },
  headerDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: 'rgba(245,241,232,0.25)',
  },
  headerDotPast: {
    backgroundColor: V4.goldDim,
  },
  headerDotActive: {
    backgroundColor: V4.gold,
    width: 7, height: 7, borderRadius: 3.5,
  },
  headerBaguaPressable: {
    width: 38, height: 38, borderRadius: 19, overflow: 'hidden',
    borderWidth: 1, borderColor: V4.glass.border,
    marginLeft: V4.space.sm,
  },
  headerBagua: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerBaguaIcon: {
    fontSize: 18, color: V4.gold,
  },

  // ─── 右側浮鈕(44×44) ───
  sideBtns: {
    position: 'absolute', right: V4.space.md, top: '38%', zIndex: 5,
    gap: V4.space.md, alignItems: 'center',
  },
  sideBtn: {
    width: 44, height: 44, borderRadius: 22, overflow: 'visible',
  },
  sideBtnGlass: {
    flex: 1, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: V4.glass.border,
    alignItems: 'center', justifyContent: 'center',
  },
  sideBtnPressed: { opacity: 0.5, transform: [{ scale: 0.9 }] },
  sideBtnIcon: { width: 26, height: 26, borderRadius: 6 },

  lockOverlay: {
    position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: V4.glass.borderStrong,
  },
  lockIcon: { fontSize: 9 },

  // ─── PetBubble ───
  bubbleWrap: {
    position: 'absolute',
    left: V4.space.md, right: V4.space.md, zIndex: 8,
    bottom: TAB_ROW_TOTAL_H + COMPOSER_H + V4.space.lg,
  },
  bubbleCard: {
    borderRadius: V4.radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: V4.glass.border,
    paddingHorizontal: V4.space.lg,
    paddingTop: 8, paddingBottom: V4.space.md,
    ...V4.glow.soft,
  },
  bubbleHandleArea: {
    alignItems: 'center', paddingVertical: 4,
  },
  bubbleHandleBar: {
    width: 36, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(245,241,232,0.30)',
  },
  bubbleHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 4, marginBottom: V4.space.sm,
  },
  bubbleTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1,
  },
  bubbleTitleDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: V4.gold,
  },
  bubbleTitle: {
    fontSize: 14, color: V4.text.primary, fontWeight: '700',
    letterSpacing: 1, flexShrink: 1,
  },
  bubbleHeaderRight: {
    flexDirection: 'row', alignItems: 'center', gap: V4.space.sm,
  },
  bubbleTime: {
    fontSize: 12, color: V4.text.tertiary, fontWeight: '500', letterSpacing: 0.5,
  },
  bubbleCloseBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  bubbleCloseText: { fontSize: 11, color: V4.text.tertiary },
  bubbleBody: {
    fontSize: 14, color: V4.text.primary, fontFamily: Fonts.serif,
    lineHeight: 24, letterSpacing: 0.3,
  },
  bubbleShareBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: V4.space.md, paddingVertical: V4.space.xs,
    borderRadius: V4.radius.pill,
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: V4.glass.borderStrong,
    marginTop: V4.space.sm,
  },
  bubbleShareText: { fontSize: 11, color: V4.gold, fontWeight: '600', letterSpacing: 0.5 },

  collapsedHandleWrap: {
    position: 'absolute', left: 0, right: 0,
    bottom: TAB_ROW_TOTAL_H + 4,
    alignItems: 'center', paddingVertical: 6, zIndex: 8,
  },
  collapsedHandleBar: {
    width: 48, height: 4, borderRadius: 2,
    backgroundColor: V4.goldDim,
  },

  // ─── Composer(輸入列) ───
  composerWrap: {
    position: 'absolute', left: V4.space.md, right: V4.space.md, zIndex: 6,
    bottom: TAB_ROW_TOTAL_H + V4.space.sm,
  },
  composer: {
    flexDirection: 'row', alignItems: 'center',
    height: COMPOSER_H,
    borderRadius: V4.radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: V4.glass.border,
    paddingLeft: V4.space.md, paddingRight: 6,
  },
  composerInput: {
    flex: 1, height: COMPOSER_H,
    fontSize: 14, color: V4.text.primary, fontFamily: Fonts.serif, letterSpacing: 0.5,
  },
  composerSendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: V4.gold,
    alignItems: 'center', justifyContent: 'center',
    ...GlowShadow.gold,
  },
  composerSendIcon: { width: 20, height: 20, tintColor: V4.ink },
  composerSendText: { fontSize: 16, color: V4.ink },

  // ─── 底部 5 顆 tab(原分類 chip 重設計) ───
  tabRow: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
    paddingTop: V4.space.sm,
  },
  tabRemainingText: {
    fontSize: 10, color: V4.goldDim, fontFamily: Fonts.serif,
    textAlign: 'right', marginRight: V4.space.lg, marginBottom: 4,
    letterSpacing: 1, opacity: 0.8,
  },
  tabRowInner: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around',
    paddingHorizontal: V4.space.sm,
  },
  tabBtn: {
    alignItems: 'center', gap: 4,
    paddingHorizontal: 4, paddingVertical: 2,
    flex: 1,
  },
  tabIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1, borderColor: 'rgba(245,241,232,0.20)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(10,10,14,0.35)',
    overflow: 'hidden',
  },
  tabIconCircleActive: {
    borderColor: V4.gold,
    backgroundColor: 'rgba(232,197,71,0.18)',
    ...GlowShadow.gold,
  },
  tabIconImg: { width: 30, height: 30, borderRadius: 15 },
  tabLabel: {
    fontSize: 11, color: V4.text.secondary, fontFamily: Fonts.serif,
    letterSpacing: 1,
  },
  tabLabelActive: { color: V4.gold, fontWeight: '700' },

  // ─── 相機浮層 ───
  cameraOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 40, backgroundColor: '#000' },
  cameraView: { flex: 1 },
  cameraUI: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingTop: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cameraHint: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontFamily: Fonts.serif, marginBottom: 20, letterSpacing: 3 },
  cameraBtnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', paddingHorizontal: 40 },
  cameraCancelBtn: { width: 60, alignItems: 'center' },
  cameraCancelText: { fontSize: 16, color: '#fff', fontFamily: Fonts.serif },
  cameraShutterBtn: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: V4.gold,
    alignItems: 'center', justifyContent: 'center',
    ...GlowShadow.goldStrong,
  },
  cameraShutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(232,197,71,0.25)' },

  // ─── 占卜/靈眼動畫 ───
  animOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 50,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(5,5,8,0.7)',
  },
  animSpinner: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#A78BFA',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167,139,250,0.06)',
    shadowColor: '#A78BFA', shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  animSymbol: { fontSize: 44, color: '#A78BFA' },
  animText: { marginTop: 24, fontSize: 17, color: '#C4B5FD', fontFamily: Fonts.serif, letterSpacing: 5 },

  // ─── 羅盤 ───
  compassOverlay: { position: 'absolute', top: '22%', alignSelf: 'center', zIndex: 15, alignItems: 'center' },
  compassRing: {
    width: 170, height: 170, borderRadius: 85, borderWidth: 2.5, borderColor: 'rgba(74,222,128,0.5)',
    backgroundColor: 'rgba(8,8,15,0.55)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4ADE80', shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 0 },
  },
  compassDir: { fontSize: 15, color: '#4ADE80', fontFamily: Fonts.serif, fontWeight: '700', width: 20, textAlign: 'center' },
  compassNeedle: { width: 4, height: 84, alignItems: 'center' },
  needleN: { width: 4, height: 42, backgroundColor: '#4ADE80', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  needleS: { width: 4, height: 42, backgroundColor: 'rgba(255,255,255,0.15)', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  compassLocText: { marginTop: 10, fontSize: 13, color: '#4ADE80', fontFamily: Fonts.serif, letterSpacing: 2 },
  compassHint: { marginTop: 4, fontSize: 11, color: 'rgba(74,222,128,0.45)', fontFamily: Fonts.serif },
});
