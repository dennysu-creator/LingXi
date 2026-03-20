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
  const feed = usePetStore(s => s.feed);
  const play = usePetStore(s => s.play);
  const meditate = usePetStore(s => s.meditate);
  const initPet = usePetStore(s => s.initPet);

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
    switch (action) {
      case 'feed':
      case 'play':
      case 'meditate':
        handleNurture(action);
        break;
      case 'eye':
      case 'heart':
      case 'pearl': {
        if (activeFeature === action) {
          setActiveFeature(null);
          return;
        }
        const quotaKey = action === 'pearl' ? 'soul' : action;
        const remaining = useUserStore.getState().getRemainingUses(quotaKey, petLevel);
        if (remaining <= 0) {
          setShowUpgrade(true);
          return;
        }
        setActiveFeature(action);
        break;
      }
    }
  }, [activeFeature, planType, petLevel, petName, t, addMessage, feed, play, meditate, canLevelUp]);

  const handleNurture = (action: 'feed' | 'play' | 'meditate') => {
    const atCap = !canLevelUp(planType);
    if (atCap) {
      setShowUpgrade(true);
      return;
    }

    const prevLevel = usePetStore.getState().level;
    const prevEvo = usePetStore.getState().evolution;

    if (action === 'feed') feed(planType);
    else if (action === 'play') play(planType);
    else meditate(planType);

    const newLevel = usePetStore.getState().level;
    const newEvo = usePetStore.getState().evolution;
    const expGain = action === 'feed' ? 50 : action === 'play' ? 30 : 20;

    const responses: Record<string, string> = {
      feed: t('chat.feedResponse', { petName, defaultValue: `好好吃～謝謝主人！${petName}元氣滿滿！` }),
      play: t('chat.playResponse', { petName, defaultValue: `好開心！和主人一起玩最快樂了～` }),
      meditate: t('chat.meditateResponse', { petName, defaultValue: `嗯...感受到靈氣在流動...${petName}悟性提升了！` }),
    };

    addMessage({ type: action, text: responses[action], data: { exp: expGain } });

    if (newLevel > prevLevel) {
      addMessage({
        type: 'levelup',
        text: t('chat.levelUp', { petName, level: newLevel, defaultValue: `✨ ${petName}升到 Lv.${newLevel} 了！感覺更強大了！` }),
        data: { level: newLevel },
      });
    }

    if (newEvo > prevEvo) {
      addMessage({
        type: 'evolve',
        text: t('chat.evolve', { petName, evolution: newEvo, defaultValue: `🌟 ${petName}進化了！第${newEvo}階段形態！` }),
        data: { evolution: newEvo },
      });
    }
  };

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
      } catch {
        addMessage({ type: 'fortune', text: `${petName}感應到了${catLabel}的氣息...但靈力尚不穩定，請稍後再試～`, data: { category: catKey } });
      }
    }, 2000);
  }, [divinationLoading, bazi, ziwei, astrology, addMessage, spinAnim, glowAnim, petInfo, petName]);

  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  const [chatLoading, setChatLoading] = useState(false);

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

      {/* ═══ 浮動運勢結果文字 ═══ */}
      {latestMessage && !activeFeature && !divinationLoading && (
        <View style={styles.floatingText}>
          <GlassView intensity={30} style={styles.floatingBlur}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.floatingScroll}>
              <Text style={styles.floatingContent}>{latestMessage.text}</Text>
            </ScrollView>
          </GlassView>
        </View>
      )}

      {/* ═══ 底部互動區（毛玻璃面板） ═══ */}
      <GlassView intensity={50} style={styles.bottomArea}>
        <View style={styles.bottomInner}>
          {/* 名牌 */}
          <View style={styles.nameplate}>
            <Text style={styles.petName}>{petName}</Text>
            <View style={styles.lvBadge}><Text style={styles.lvText}>Lv.{petLevel}</Text></View>
            <View style={styles.elementTag}><Text style={styles.elementTagText}>✦ {petElement}</Text></View>
            <Text style={styles.lunarText}>{lunarStr}</Text>
          </View>

          {/* 運勢類別 */}
          {!activeFeature && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat.key}
                  style={({ pressed }) => [styles.categoryChip, pressed && styles.chipPressed]}
                  onPress={() => handleCategoryPress(cat.key)}
                  disabled={divinationLoading}
                >
                  <Image source={cat.icon} style={styles.categoryIcon} resizeMode="cover" />
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* 靈眼 / 靈心 功能按鈕 */}
          {!activeFeature && (
            <View style={styles.featureBtnRow}>
              <Pressable
                style={({ pressed }) => [styles.featureBtn, { borderColor: 'rgba(255,193,7,0.35)' }, pressed && styles.chipPressed]}
                onPress={() => handleAction('eye')}
              >
                <Image source={UI_ICONS.buttons.eye} style={styles.featureBtnIcon} resizeMode="contain" />
                <Text style={[styles.featureBtnLabel, { color: '#FFC107' }]}>靈眼面相</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.featureBtn, { borderColor: compassActive ? 'rgba(74,222,128,0.6)' : 'rgba(74,222,128,0.35)' }, compassActive && { backgroundColor: 'rgba(74,222,128,0.12)' }, pressed && styles.chipPressed]}
                onPress={handleHeartPress}
              >
                <Image source={UI_ICONS.buttons.heart} style={styles.featureBtnIcon} resizeMode="contain" />
                <Text style={[styles.featureBtnLabel, { color: '#4ADE80' }]}>{compassActive ? '感應中...' : '靈心風水'}</Text>
              </Pressable>
            </View>
          )}

          {/* 輸入框 */}
          {!activeFeature && (
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder={chatLoading ? '靈寵思考中...' : '向靈寵問卦...'}
                  placeholderTextColor="rgba(232,197,71,0.3)"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendMessage}
                  returnKeyType="send"
                  editable={!chatLoading}
                />
              </View>
              <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.6 }, chatLoading && { opacity: 0.3 }]}
                onPress={handleSendMessage}
                disabled={chatLoading}
              >
                {chatLoading ? <Text style={styles.sendBtnText}>⏳</Text> : <Image source={UI_ICONS.buttons.send} style={styles.sendBtnIcon} resizeMode="contain" />}
              </Pressable>
            </View>
          )}
        </View>
      </GlassView>

      {/* ═══ 占卜動畫 ═══ */}
      {divinationLoading && (
        <GlassView intensity={60} style={styles.divinationOverlay}>
          <Animated.View style={[styles.divinationSpinner, { transform: [{ rotate: spinRotate }] }]}>
            <Text style={styles.divinationSymbol}>☰</Text>
          </Animated.View>
          <Animated.Text style={[styles.divinationText, { opacity: glowOpacity }]}>
            靈寵正在感應中...
          </Animated.Text>
        </GlassView>
      )}

      {/* ═══ 功能面板（只有靈眼需要，靈心/靈魂已整合到主畫面） ═══ */}
      {activeFeature === 'eye' && (
        <GlassView intensity={80} style={styles.featureOverlay}>
          <View style={styles.overlayHandle} />
          <FeaturePanel
            activeFeature={activeFeature}
            onClose={closeFeature}
            onEyeResult={handleEyeResult}
            onHeartResult={handleHeartResult}
            onPearlResult={handlePearlResult}
            onQuotaExhausted={handleQuotaExhausted}
          />
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
  container: { flex: 1, backgroundColor: Colors.background },
  petFullscreen: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  // ─── 右上角設定（毛玻璃圓鈕） ───
  settingsBtn: {
    position: 'absolute',
    top: 54,
    right: Spacing.md,
    zIndex: 30,
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.15)',
  },
  settingsBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 17 },
  settingsIconImg: { width: 24, height: 24 },

  // ─── 浮動運勢結果（毛玻璃，底部互動區上方） ───
  floatingText: {
    position: 'absolute',
    bottom: 240,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 8,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.10)',
  },
  floatingBlur: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  floatingScroll: { maxHeight: 180 },
  floatingContent: {
    fontSize: 15,
    color: '#F0E6D0',
    fontFamily: Fonts.serif,
    lineHeight: 28,
    letterSpacing: 0.5,
  },

  // ─── 底部毛玻璃面板 ───
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(232,197,71,0.12)',
  },
  bottomInner: {
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  // ─── 名牌 ───
  nameplate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  petName: {
    fontSize: FontSize.xxl,
    color: '#fff',
    fontFamily: Fonts.brush,
    letterSpacing: 4,
  },
  lvBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(232,197,71,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.35)',
  },
  lvText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  elementTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(232,197,71,0.08)',
  },
  elementTagText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  lunarText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.25)',
    fontFamily: Fonts.serif,
    marginLeft: 'auto',
    letterSpacing: 1,
  },

  // ─── 類別捲軸 ───
  categoryScroll: { marginBottom: Spacing.sm },
  categoryContent: { gap: Spacing.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.15)',
  },
  chipPressed: { opacity: 0.5, transform: [{ scale: 0.95 }] },
  categoryIcon: { width: 28, height: 28, borderRadius: 6 },
  categoryLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Fonts.serif,
    fontWeight: '500',
    letterSpacing: 1,
  },

  // ─── 靈眼/靈心功能按鈕 ───
  featureBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  featureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
  },
  featureBtnIcon: { width: 32, height: 32, borderRadius: 8 },
  featureBtnLabel: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.serif,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // ─── 輸入框 ───
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(232,197,71,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.12)',
    justifyContent: 'center',
  },
  textInput: {
    height: 42,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: '#fff',
    fontFamily: Fonts.serif,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(232,197,71,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    ...GlowShadow.gold,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sendBtnText: { fontSize: 18, color: Colors.primary },
  sendBtnIcon: { width: 22, height: 22 },

  // ─── 羅盤浮層 ───
  compassOverlay: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    zIndex: 15,
    alignItems: 'center',
  },
  compassRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.5)',
    backgroundColor: 'rgba(8,8,15,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  compassDir: {
    fontSize: 14,
    color: '#4ADE80',
    fontFamily: Fonts.serif,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  compassNeedle: {
    width: 4,
    height: 80,
    alignItems: 'center',
  },
  needleN: {
    width: 4,
    height: 40,
    backgroundColor: '#4ADE80',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  needleS: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  compassLocText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: '#4ADE80',
    fontFamily: Fonts.serif,
    letterSpacing: 1,
  },
  compassHint: {
    marginTop: 4,
    fontSize: FontSize.xs,
    color: 'rgba(74,222,128,0.5)',
    fontFamily: Fonts.serif,
  },

  // ─── 占卜動畫（毛玻璃全螢幕） ───
  divinationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divinationSpinner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.08)',
    ...GlowShadow.purple,
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  divinationSymbol: { fontSize: 44, color: '#A78BFA' },
  divinationText: {
    marginTop: Spacing.xl,
    fontSize: FontSize.lg,
    color: '#C4B5FD',
    fontFamily: Fonts.serif,
    letterSpacing: 4,
  },

  // ─── 功能面板（毛玻璃） ───
  featureOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '30%',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
    zIndex: 25,
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.10)',
  },
  overlayHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232,197,71,0.25)',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
});
