// ═══════════════════════════════════════
// 靈寵中心 — 全螢幕靈寵 + 漫畫對白泡泡
// StatusBar(⚙️+Logo+Date+Lv) → MangaBubble → PetAvatar → ActionBar
// 三大功能以內嵌面板呈現，歷史對話移至設定頁
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, ImageBackground, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, scale, FontSize } from '@/config/theme';
import { LOGO, EFFECTS } from '@/assets/images';
import { usePetStore } from '@/stores/pet-store';
import { useUserStore } from '@/stores/user-store';
import { useChatStore, type FortuneData } from '@/stores/chat-store';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';
import { calculateUnifiedFortune, type UnifiedFortuneResult } from '@/services/unified-fortune-engine';
import { getCurrentShichen } from '@/services/bazi-engine';
import { getLocalDateKey } from '@/services/date-utils';
import { generateQimenChart } from '@/services/qimen-engine';

import PetAvatar, { type ActiveFeature } from '@/components/PetAvatar';
import ActionBar, { type ActionType } from '@/components/ActionBar';
import FeaturePanel from '@/components/FeaturePanel';
import UpgradeModal from '@/components/UpgradeModal';

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
  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petCreature = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);
  const feed = usePetStore(s => s.feed);
  const play = usePetStore(s => s.play);
  const meditate = usePetStore(s => s.meditate);

  const planType = useUserStore(s => s.planType);
  const bazi = useUserStore(s => s.bazi);
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

  return (
    <ImageBackground source={EFFECTS.panelBgPattern} style={styles.container} imageStyle={styles.bgPattern} resizeMode="repeat">
      {/* ═══ Status Bar ═══ */}
      <View style={styles.statusBar}>
        <Pressable style={styles.profileBtn} onPress={() => router.navigate('/(tabs)/profile')}>
          <Text style={styles.profileBtnIcon}>⚙️</Text>
        </Pressable>
        <Image source={LOGO.statusBar} style={styles.appLogo} resizeMode="contain" />
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{lunarStr}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{petLevel}</Text>
          <View style={styles.levelDot} />
          <Text style={styles.levelName}>{petName}</Text>
        </View>
      </View>
      <View style={styles.statusLine} />

      {/* ═══ Main Stage: Pet ALWAYS full-screen ═══ */}
      <View style={styles.mainStage}>
        {/* Pet Avatar — always full screen behind everything */}
        <View style={styles.petHeroFull}>
          <PetAvatar activeFeature={activeFeature} compact={false} />
        </View>

        {/* Manga speech bubble — hidden when feature active */}
        {!activeFeature && latestMessage && (
          <View style={styles.mangaBubble}>
            <ScrollView style={styles.mangaBubbleScroll} bounces={false} showsVerticalScrollIndicator={false}>
              <Text style={styles.mangaBubbleText}>
                {latestMessage.text}
              </Text>
            </ScrollView>
            <View style={styles.mangaBubbleTail} />
          </View>
        )}

        {/* Feature overlay — semi-transparent panel over bottom portion */}
        {activeFeature && (
          <View style={styles.featureOverlay}>
            {/* Grab handle */}
            <View style={styles.overlayHandle} />
            <FeaturePanel
              activeFeature={activeFeature}
              onClose={closeFeature}
              onEyeResult={handleEyeResult}
              onHeartResult={handleHeartResult}
              onPearlResult={handlePearlResult}
              onQuotaExhausted={handleQuotaExhausted}
            />
          </View>
        )}

        {/* Floating Action Bar — always visible */}
        <ActionBar onAction={handleAction} activeFeature={activeFeature} />
      </View>

      {/* ═══ Upgrade Modal ═══ */}
      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ImageBackground>
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
  bgPattern: { opacity: 0.08 },

  // ─── StatusBar ───
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(8,8,15,0.96)',
    gap: 8,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.15)',
  },
  profileBtnIcon: {
    fontSize: 18,
  },
  appLogo: {
    width: scale(120),
    height: scale(44),
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontFamily: Fonts.serif,
    letterSpacing: 1,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.12)',
  },
  levelText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  levelDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
    opacity: 0.5,
  },
  levelName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Fonts.serif,
  },
  statusLine: {
    height: 1.5,
    backgroundColor: 'rgba(232,197,71,0.08)',
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // ─── Main Stage ───
  mainStage: {
    flex: 1,
  },
  petHeroFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Feature Overlay (semi-transparent, bottom portion) ───
  featureOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '28%',
    backgroundColor: 'rgba(8,8,15,0.82)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 5,
  },
  overlayHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232,197,71,0.25)',
    marginTop: 10,
    marginBottom: 4,
  },

  // ─── Manga Speech Bubble ───
  mangaBubble: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 72,
    maxHeight: '45%',
    zIndex: 10,
    backgroundColor: 'rgba(255,252,245,0.95)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(60,50,30,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  mangaBubbleScroll: {
    flexGrow: 0,
  },
  mangaBubbleText: {
    fontSize: 15,
    color: '#1a1a2e',
    fontFamily: Fonts.serif,
    lineHeight: 24,
  },
  mangaBubbleTail: {
    position: 'absolute',
    bottom: -11,
    left: '30%',
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,252,245,0.95)',
  },
});
