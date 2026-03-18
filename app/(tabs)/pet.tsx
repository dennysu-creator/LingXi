// ═══════════════════════════════════════
// 靈寵中心 — 對話式介面（Chat-Based）
// StatusBar → PetAvatar → [FeaturePanel] → PetChat → ActionBar
// 三大功能（靈眼/靈心/靈魂）以內嵌面板呈現，
// 靈寵始終可見並產生對應特效，結果透過聊天氣泡輸出
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/config/theme';
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
import PetChat from '@/components/PetChat';
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

  // ─── State ───
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };

  // ─── Generate daily fortune on mount ───
  useEffect(() => {
    if (fortuneGenRef.current) return;
    // Wait for store hydration — destiny data not yet available
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

    // Generate fortune using local engines
    try {
      const qimenChart = generateQimenChart(new Date());

      const fortuneResult = calculateUnifiedFortune(
        bazi,
        ziwei,
        qimenChart,
        astrology,
      );

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
      // Fallback: simple greeting
      const narration = generateLocalPetNarration({
        feature: 'fortune',
        pet: petInfo,
        data: {},
      });
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
        // Toggle: tap again to close the same feature
        if (activeFeature === action) {
          setActiveFeature(null);
          return;
        }
        // Check quota before opening (map 'pearl' → 'soul' for quota key)
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

    // Execute action
    if (action === 'feed') feed(planType);
    else if (action === 'play') play(planType);
    else meditate(planType);

    const newLevel = usePetStore.getState().level;
    const newEvo = usePetStore.getState().evolution;
    const expGain = action === 'feed' ? 50 : action === 'play' ? 30 : 20;

    // Pet response
    const responses: Record<string, string> = {
      feed: t('chat.feedResponse', { petName, defaultValue: `好好吃～謝謝主人！${petName}元氣滿滿！` }),
      play: t('chat.playResponse', { petName, defaultValue: `好開心！和主人一起玩最快樂了～` }),
      meditate: t('chat.meditateResponse', { petName, defaultValue: `嗯...感受到靈氣在流動...${petName}悟性提升了！` }),
    };

    addMessage({
      type: action,
      text: responses[action],
      data: { exp: expGain },
    });

    // Level up announcement
    if (newLevel > prevLevel) {
      addMessage({
        type: 'levelup',
        text: t('chat.levelUp', { petName, level: newLevel, defaultValue: `✨ ${petName}升到 Lv.${newLevel} 了！感覺更強大了！` }),
        data: { level: newLevel },
      });
    }

    // Evolution announcement
    if (newEvo > prevEvo) {
      addMessage({
        type: 'evolve',
        text: t('chat.evolve', { petName, evolution: newEvo, defaultValue: `🌟 ${petName}進化了！第${newEvo}階段形態！` }),
        data: { evolution: newEvo },
      });
    }
  };

  // ─── Feature result handlers ───
  // Results are added to PetChat as bubbles. The feature component's
  // internal onClose callback handles closing the panel after a brief delay.
  const handleEyeResult = useCallback((text: string, data: any) => {
    addMessage({
      type: 'face',
      text,
      data: {
        features: data.features,
        overall_score: data.overall_score,
        fortune_level: data.fortune_level,
        lucky_item: data.lucky_item,
        lucky_direction: data.lucky_direction,
        lucky_number: data.lucky_number,
      },
    });
  }, [addMessage]);

  const handleHeartResult = useCallback((text: string, data: any) => {
    addMessage({
      type: 'fengshui',
      text,
      data: {
        palaces: data.palaces,
        luckyDirections: data.luckyDirections,
        dangerDirections: data.dangerDirections,
        location_analysis: data.location_analysis,
        tips: data.tips,
        seat_advice: data.seat_advice,
      },
    });
  }, [addMessage]);

  const handlePearlResult = useCallback((text: string, data: any) => {
    addMessage({
      type: 'divination',
      text,
      data: {
        hexagram: data.hexagram,
        category: data.category,
        changedHexagram: data.changedHexagram,
        changingLines: data.changingLines,
        interpretation: data.interpretation,
      },
    });
  }, [addMessage]);

  const handleQuotaExhausted = useCallback(() => {
    setShowUpgrade(true);
  }, []);

  const closeFeature = useCallback(() => {
    setActiveFeature(null);
  }, []);

  const lunarStr = getLunarDateStr();

  return (
    <ImageBackground source={EFFECTS.panelBgPattern} style={styles.container} imageStyle={styles.bgPattern} resizeMode="repeat">
      {/* ═══ Status Bar ═══ */}
      <View style={styles.statusBar}>
        <Image source={LOGO.statusBar} style={styles.appLogo} resizeMode="contain" />
        <Text style={styles.dateText}>{lunarStr}</Text>
        <Text style={styles.levelText}>{t('pet.level')}{petLevel} {petName} · {petElement}系</Text>
      </View>

      {/* ═══ Pet Avatar — always visible; compact when feature is active ═══ */}
      <PetAvatar activeFeature={activeFeature} compact={!!activeFeature} />

      {/* ═══ Feature Panel (takes full available space when active) ═══ */}
      {activeFeature && (
        <FeaturePanel
          activeFeature={activeFeature}
          onClose={closeFeature}
          onEyeResult={handleEyeResult}
          onHeartResult={handleHeartResult}
          onPearlResult={handlePearlResult}
          onQuotaExhausted={handleQuotaExhausted}
        />
      )}

      {/* ═══ Chat — hidden when feature is active ═══ */}
      {!activeFeature && (
        <View style={styles.chatFull}>
          <PetChat petEmoji={petEmoji} petName={petName} isLoading={isLoading} />
        </View>
      )}

      {/* ═══ Action Bar (feature buttons highlight active) ═══ */}
      <ActionBar onAction={handleAction} activeFeature={activeFeature} />

      {/* ═══ Upgrade Modal ═══ */}
      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ImageBackground>
  );
}

// ─── Helpers ───
function getTopDimension(result: UnifiedFortuneResult): string {
  const { scores } = result;
  const dims = [
    { key: '財運', val: scores.wealth },
    { key: '桃花', val: scores.love },
    { key: '事業', val: scores.career },
    { key: '健康', val: scores.health },
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
  bgPattern: { opacity: 0.03 },

  statusBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingHorizontal: 16, paddingBottom: 8,
    backgroundColor: 'rgba(8,8,15,0.98)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(232,197,71,0.06)',
    gap: 8,
  },
  appLogo: { width: 80, height: 28 },
  dateText: { fontSize: 11, color: Colors.textDark, flex: 1, textAlign: 'center' },
  levelText: { fontSize: 11, color: Colors.textMuted },

  chatFull: { flex: 1 },
});
