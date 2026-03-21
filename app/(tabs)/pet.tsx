// ═══════════════════════════════════════
// 靈寵中心 — 全螢幕靈寵 + 漫畫對白泡泡
// StatusBar(⚙️+Logo+Date+Lv) → MangaBubble → PetAvatar → ActionBar
// 三大功能以內嵌面板呈現，歷史對話移至設定頁
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSize, Spacing, BorderRadius, GlowShadow } from '@/config/theme';

// GlassView 需要 native rebuild，改用半透明 View 模擬
const GlassView = ({ intensity, children, style }: { intensity?: number; tint?: string; children: React.ReactNode; style?: any }) => (
  <View style={[{ backgroundColor: `rgba(8,8,15,${Math.min(0.95, (intensity || 50) / 100 + 0.4)})` }, style]}>{children}</View>
);
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
import { type ActionType } from '@/components/ActionBar';
import FeaturePanel from '@/components/FeaturePanel';
import UpgradeModal from '@/components/UpgradeModal';

// 羅盤浮層（靈心用）
import * as Location from 'expo-location';
let Magnetometer: any = null;
if (Platform.OS !== 'web') {
  try { Magnetometer = require('expo-sensors').Magnetometer; } catch {}
}

// ─── 農曆日期工具（簡化） ───
function getLunarDateStr(): string {
  const now = new Date();
  const shichen = getCurrentShichen();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return `${m}月${d}日 · ${shichen.name}時`;
}

// ─── 時段判斷 ───
function getTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export default function PetScreen() {
  const { t } = useTranslation();

  const router = useRouter();

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

  // 新訊息進來時自動顯示（用 latestMessage 的時間戳判斷，而非 length）
  const msgTimestamp = latestMessage?.time?.getTime?.() ?? latestMessage?.text?.length ?? 0;
  useEffect(() => { setHideMessage(false); }, [msgTimestamp, messages.length]);

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };

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

  // ─── Action handlers ───
  const handleAction = useCallback((action: ActionType) => {
    if (action === 'eye') {
      handleEyePress();
    } else if (action === 'heart') {
      handleHeartPress();
    }
  }, [handleEyePress, handleHeartPress]);

  // ─── Feature result handlers ───
  const handleEyeResult = useCallback((text: string, data: any) => {
    addMessage({
      type: 'face', text,
      data: {
        features: data.features, overall_score: data.overall_score,
        fortune_level: data.fortune_level, lucky_item: data.lucky_item,
        lucky_direction: data.lucky_direction, lucky_number: data.lucky_number,
        stars: data.stars, luckyItems: data.luckyItems, mood: data.mood,
      },
    });
  }, [addMessage]);

  const handleHeartResult = useCallback((text: string, data: any) => {
    addMessage({
      type: 'fengshui', text,
      data: {
        palaces: data.palaces, luckyDirections: data.luckyDirections,
        dangerDirections: data.dangerDirections, location_analysis: data.location_analysis,
        tips: data.tips, seat_advice: data.seat_advice,
        stars: data.stars, luckyItems: data.luckyItems, mood: data.mood,
        luckyDirection: data.luckyDirection, avoidDirection: data.avoidDirection,
      },
    });
  }, [addMessage]);

  const handlePearlResult = useCallback((text: string, data: any) => {
    addMessage({
      type: 'divination', text,
      data: {
        hexagram: data.hexagram, category: data.category,
        changedHexagram: data.changedHexagram, changingLines: data.changingLines,
        interpretation: data.interpretation, directAnswer: data.directAnswer,
        stars: data.stars, luckyItems: data.luckyItems, mood: data.mood,
      },
    });
  }, [addMessage]);

  const handleQuotaExhausted = useCallback(() => { setShowUpgrade(true); }, []);
  const closeFeature = useCallback(() => { setActiveFeature(null); }, []);

  const lunarStr = getLunarDateStr();
  const [showActions, setShowActions] = useState(false);
  const [inputText, setInputText] = useState('');
  const [divinationLoading, setDivinationLoading] = useState(false);

  // 占卜動畫
  const spinAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const CATEGORIES = [
    { key: 'career', label: '事業', icon: UI_ICONS.category.career },
    { key: 'love', label: '桃花', icon: UI_ICONS.category.love },
    { key: 'family', label: '家庭', icon: UI_ICONS.category.family },
    { key: 'health', label: '健康', icon: UI_ICONS.category.health },
    { key: 'study', label: '學業', icon: UI_ICONS.category.study },
  ];

  // 按類別直接算命 → 動畫 → 結果輸出到對話框
  const handleCategoryPress = useCallback((catKey: string) => {
    if (divinationLoading) return;
    if (!bazi || !ziwei || !astrology) return;
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
          love: fortuneResult.scores.love,
          family: fortuneResult.scores.health, // 家庭歸健康
          health: fortuneResult.scores.health,
          study: fortuneResult.scores.study,
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
          (fortuneResult.luckyColors?.[0] ? `✦ 幸運色：${fortuneResult.luckyColors[0]}\n` : '') +
          (fortuneResult.luckyNumbers?.[0] ? `✦ 幸運數字：${fortuneResult.luckyNumbers[0]}` : '');

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
  const [hideMessage, setHideMessage] = useState(false);
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
          (data.features?.eyes ? `✦ 眼相：${data.features.eyes.score}/100\n` : '') +
          (data.lucky_direction ? `✦ 吉方位：${data.lucky_direction}\n` : '') +
          (data.lucky_item ? `✦ 開運物：${data.lucky_item}` : '');

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
    setCompassActive(true);

    // 2.5 秒後關閉羅盤，直接輸出風水結果到對話
    setTimeout(() => {
      Animated.timing(compassAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setCompassActive(false);

        try {
          const qimenChart = generateQimenChart(new Date());
          const fortuneResult = calculateUnifiedFortune(bazi, ziwei, qimenChart, astrology);
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* ═══ Layer 0: 全螢幕靈寵 ═══ */}
      <View style={styles.petFullscreen}>
        <PetAvatar activeFeature={activeFeature} compact={false} fullscreen />
      </View>

      {/* ═══ 羅盤浮層（靈心啟動時） ═══ */}
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

      {/* ═══ 右上角設定（毛玻璃） ═══ */}
      <GlassView intensity={40} style={styles.settingsBtn}>
        <Pressable style={styles.settingsBtnInner} onPress={() => router.navigate('/(tabs)/profile')}>
          <Image source={UI_ICONS.buttons.settings} style={styles.settingsIconImg} resizeMode="contain" />
        </Pressable>
      </GlassView>

      {/* ═══ 浮動結果（完整顯示 + X 關閉） ═══ */}
      {latestMessage && !divinationLoading && !eyeLoading && !compassActive && !hideMessage && (
        <View style={styles.floatingText}>
          <GlassView intensity={30} style={styles.floatingBlur}>
            <Pressable style={styles.floatingClose} onPress={() => setHideMessage(true)}>
              <Text style={styles.floatingCloseText}>✕</Text>
            </Pressable>
            <Text style={styles.floatingContent}>{latestMessage.text}</Text>
          </GlassView>
        </View>
      )}

      {/* ═══ 左下名牌 ═══ */}
      <View style={styles.nameplate}>
        <Text style={styles.petName}>{petName}</Text>
        <View style={styles.nameBadges}>
          <View style={styles.lvBadge}><Text style={styles.lvText}>Lv.{petLevel}</Text></View>
          <View style={styles.elementTag}><Text style={styles.elementTagText}>✦ {petElement}</Text></View>
        </View>
      </View>

      {/* ═══ 相機浮層（靈眼拍照） ═══ */}
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

      {/* ═══ 右側功能鈕 ═══ */}
      <View style={styles.sideBtns}>
        <Pressable style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]} onPress={handleEyePress}>
          <Image source={UI_ICONS.buttons.eye} style={styles.sideBtnIcon} resizeMode="contain" />
        </Pressable>
        <Pressable style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]} onPress={handleHeartPress}>
          <Image source={UI_ICONS.buttons.heart} style={styles.sideBtnIcon} resizeMode="contain" />
        </Pressable>
      </View>

      {/* ═══ 底部：類別 + 輸入（無底框） ═══ */}
      <View style={styles.bottomFloat}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat.key} style={({ pressed }) => [styles.catChip, pressed && styles.sideBtnPressed]} onPress={() => handleCategoryPress(cat.key)} disabled={divinationLoading}>
              <Image source={cat.icon} style={styles.catIcon} resizeMode="cover" />
              <Text style={styles.catLabel}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.textInput} placeholder={chatLoading ? '靈寵思考中...' : '向靈寵問卦...'} placeholderTextColor="rgba(232,197,71,0.25)" value={inputText} onChangeText={setInputText} onSubmitEditing={handleSendMessage} returnKeyType="send" editable={!chatLoading} />
          </View>
          <Pressable style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.6 }, chatLoading && { opacity: 0.3 }]} onPress={handleSendMessage} disabled={chatLoading}>
            {chatLoading ? <Text style={styles.sendBtnText}>⏳</Text> : <Image source={UI_ICONS.buttons.send} style={styles.sendBtnIcon} resizeMode="contain" />}
          </Pressable>
        </View>
      </View>

      {/* ═══ 占卜/靈眼動畫 ═══ */}
      {(divinationLoading || eyeLoading) && (
        <GlassView intensity={60} style={styles.animOverlay}>
          <Animated.View style={[styles.animSpinner, { transform: [{ rotate: spinRotate }] }]}>
            <Text style={styles.animSymbol}>{eyeLoading ? '👁' : '☰'}</Text>
          </Animated.View>
          <Animated.Text style={[styles.animText, { opacity: glowOpacity }]}>
            {eyeLoading ? '靈眼正在觀相中...' : '靈寵正在感應中...'}
          </Animated.Text>
        </GlassView>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  petFullscreen: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  settingsBtn: {
    position: 'absolute', top: 54, right: 14, zIndex: 30,
    width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.20)',
    backgroundColor: 'rgba(8,8,15,0.5)',
  },
  settingsBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 17 },
  settingsIconImg: { width: 24, height: 24, opacity: 0.8 },

  floatingText: {
    position: 'absolute', bottom: 140, left: 16, right: 16, zIndex: 8,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.12)',
    backgroundColor: 'rgba(8,8,15,0.75)',
  },
  floatingBlur: { paddingHorizontal: 20, paddingVertical: 16, paddingTop: 36 },
  floatingClose: {
    position: 'absolute', top: 8, right: 10, zIndex: 5,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingCloseText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  floatingContent: {
    fontSize: 15, color: '#EDE4D0', fontFamily: Fonts.serif,
    lineHeight: 26, letterSpacing: 0.3,
  },

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
    width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#E8C547',
    alignItems: 'center', justifyContent: 'center',
    ...GlowShadow.goldStrong,
  },
  cameraShutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(232,197,71,0.25)' },

  nameplate: { position: 'absolute', bottom: 128, left: 20, zIndex: 5 },
  petName: {
    fontSize: 30, color: '#fff', fontFamily: Fonts.brush, letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.95)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12,
  },
  nameBadges: { flexDirection: 'row', gap: 8, marginTop: 6 },
  lvBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(232,197,71,0.15)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.35)',
  },
  lvText: { fontSize: 12, color: Colors.primary, fontWeight: '800', letterSpacing: 1 },
  elementTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  elementTagText: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500', letterSpacing: 1 },

  sideBtns: { position: 'absolute', right: 14, bottom: 170, zIndex: 5, gap: 14, alignItems: 'center' },
  sideBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(8,8,15,0.5)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.18)',
    shadowColor: '#E8C547', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  sideBtnPressed: { opacity: 0.4, transform: [{ scale: 0.88 }] },
  sideBtnIcon: { width: 32, height: 32, borderRadius: 8 },

  bottomFloat: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 28 : 10,
    left: 0, right: 0, zIndex: 5, paddingHorizontal: 14,
  },
  catRow: { gap: 12, marginBottom: 10, paddingHorizontal: 6 },
  catChip: { alignItems: 'center', gap: 4, paddingHorizontal: 2 },
  catIcon: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.15)',
    shadowColor: '#E8C547', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
  catLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: Fonts.serif, letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputWrapper: {
    flex: 1, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(8,8,15,0.55)', borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.12)',
    justifyContent: 'center',
  },
  textInput: { height: 44, paddingHorizontal: 18, fontSize: 14, color: '#EDE4D0', fontFamily: Fonts.serif, letterSpacing: 0.5 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(232,197,71,0.15)', borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.30)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#E8C547', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  sendBtnText: { fontSize: 16, color: Colors.primary },
  sendBtnIcon: { width: 22, height: 22, opacity: 0.9 },

  animOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 50,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,5,8,0.7)',
  },
  animSpinner: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#A78BFA',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167,139,250,0.06)',
    shadowColor: '#A78BFA', shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  animSymbol: { fontSize: 44, color: '#A78BFA' },
  animText: { marginTop: 24, fontSize: 17, color: '#C4B5FD', fontFamily: Fonts.serif, letterSpacing: 5 },

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

  divinationOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, alignItems: 'center', justifyContent: 'center' },
  divinationSpinner: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#A78BFA', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167,139,250,0.08)' },
  divinationSymbol: { fontSize: 44, color: '#A78BFA' },
  divinationText: { marginTop: 20, fontSize: 16, color: '#C4B5FD', fontFamily: Fonts.serif, letterSpacing: 4 },
  featureOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: '30%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', zIndex: 25, borderWidth: 1, borderColor: 'rgba(232,197,71,0.10)' },
  overlayHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(232,197,71,0.25)', marginTop: 8, marginBottom: 4 },
});
