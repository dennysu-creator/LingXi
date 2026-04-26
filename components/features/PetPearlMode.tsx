// ═══════════════════════════════════════
// 靈魂模式 — 六十四卦占卜（嵌入靈寵中心 Tab）
// ═══════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, TextInput,
  ScrollView, StyleSheet, Vibration, Pressable, Modal, Platform,
  Animated, Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { usePetStore } from '@/stores/pet-store';
import { useUserStore } from '@/stores/user-store';
import {
  performHexagramDivination,
  getHexagramColor,
  getCategoryEmoji,
  type HexagramResult,
  type DivinationCategory,
} from '@/services/hexagram-engine';
import { CATEGORY_IMAGES, FEATURE_PANEL, PET_FRAME, getPetImage } from '@/assets/images';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';
import api, { ApiError } from '@/services/api-client';
import { playMusic, playSfx } from '@/services/audio-controller';

type Phase = 'idle' | 'shaking' | 'analyzing' | 'result';

const CATEGORIES: DivinationCategory[] = ['career', 'love', 'family', 'health', 'study'];

interface PetPearlModeProps {
  visible?: boolean;
  onClose?: () => void;
  onResult?: (text: string, data: any) => void;
  onQuotaExhausted: () => void;
}

export default function PetPearlMode({ visible, onClose, onResult, onQuotaExhausted }: PetPearlModeProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DivinationCategory | null>(null);
  const [result, setResult] = useState<HexagramResult | null>(null);

  const petName = usePetStore(s => s.name) || '靈寵';
  const petId = usePetStore(s => s.petId) || '';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petType = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const useFeature = useUserStore(s => s.useFeature);

  const petInfo: PetInfo = { name: petName, type: petType, element: petElement, emoji: petEmoji, level: petLevel };
  const petAvatarImg = getPetImage(petId, 'avatar');

  // Spinning animation for bagua ring during shaking & analyzing phases
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase === 'shaking' || phase === 'analyzing') {
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [phase]);
  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const startDivination = () => {
    if (!selectedCategory) return;

    const canUse = useFeature('soul', petLevel);
    if (!canUse) {
      playSfx('quota-warning');
      onQuotaExhausted();
      return;
    }

    setPhase('shaking');
    playSfx('compass-spin');
    void playMusic('divination');
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 80, 60, 80, 60, 80, 60, 150]);
    }

    setTimeout(async () => {
      const hexResult = performHexagramDivination(selectedCategory, question || undefined);
      setResult(hexResult);

      const interp = hexResult.hexagram.interpretations[hexResult.category];

      // 擲筊音效:依 verdict 對應 yes/maybe/no
      const verdict = (interp.verdict || '').toString();
      if (/吉|宜|可|順|利/.test(verdict)) {
        playSfx('jiao-yes');
      } else if (/凶|忌|不利|阻/.test(verdict)) {
        playSfx('jiao-no');
      } else {
        playSfx('jiao-maybe');
      }
      // 卦象揭示音效 + 切換配樂
      playSfx('hexagram-reveal');
      void playMusic('hexagram-reveal');

      // Local narration as fallback
      const localNarr = generateLocalPetNarration({
        feature: 'divination',
        pet: petInfo,
        data: { level: hexResult.hexagram.fortuneLevel, directAnswer: interp.guidance },
      });

      // Send result to parent (chat bubble) — call AI backend first
      if (onResult) {
        setPhase('analyzing'); // Show "靈寵正在感應..." status

        let chatText = localNarr.spokenText;
        let chatData: any = {
          category: hexResult.category,
          hexagram: { name: hexResult.hexagram.name, symbol: hexResult.hexagram.symbol },
        };

        try {
          const aiResponse = await api.post<{ data: any; remaining?: number }>('/ai/divination', {
            type: 'hexagram',
            hexagramName: hexResult.hexagram.name,
            hexagramOracle: hexResult.hexagram.oracle,
            category: selectedCategory,
            question: question || undefined,
            changedHexagram: hexResult.changedHexagram?.name,
            changingLines: hexResult.changingLines,
          }, { idempotent: true });

          const aiData = aiResponse.data;
          // Use AI petMessage as chat text, fallback to local narration
          chatText = aiData.petMessage || aiData.interpretation || localNarr.spokenText;
          chatData = {
            ...chatData,
            stars: aiData.stars,
            luckyItems: aiData.luckyItems,
            directAnswer: aiData.directAnswer || interp.guidance,
          };
        } catch (err) {
          // AI call failed — fall back to local narration (already set above)
          console.warn('[PetPearlMode] AI divination failed, using local narration:', err);
        }

        onResult(chatText, chatData);
        setTimeout(() => { onClose?.(); reset(); }, 300);
        return;
      }

      setPhase('result');
    }, 1500);
  };

  const reset = () => {
    setPhase('idle');
    setResult(null);
    setQuestion('');
    setSelectedCategory(null);
  };

  const content = (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Close button when in modal */}
      {onClose && (
        <Pressable style={styles.closeBtn} onPress={() => { onClose(); reset(); }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      )}

      {/* ═══ 閒置：選擇類別 + 問題 + 啟動 ═══ */}
      {phase === 'idle' && (
        <View>
          <View style={styles.petHintCard}>
            {petAvatarImg ? (
              <Image source={petAvatarImg} style={styles.petHintAvatar} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
            )}
            <Text style={styles.petHintText}>
              {t('pearl.petHint', { name: petName })}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>{t('pearl.selectCategory')}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              const isLastOdd = CATEGORIES.length % 2 === 1 && idx === CATEGORIES.length - 1;
              return (
                <View
                  key={cat}
                  style={[
                    styles.categoryCardWrapper,
                    isLastOdd && styles.categoryCardCentered,
                  ]}
                >
                  <Pressable
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    {CATEGORY_IMAGES[cat] ? (
                      <Image
                        source={CATEGORY_IMAGES[cat]}
                        style={[styles.categoryImage, isSelected && styles.categoryImageActive]}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat)}</Text>
                    )}
                    <Text style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelActive,
                    ]}>
                      {t(`pearl.cat_${cat}`)}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>{t('pearl.inputQuestion')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('pearl.placeholder')}
            placeholderTextColor="#5a5040"
            value={question}
            onChangeText={setQuestion}
            multiline
            maxLength={100}
          />

          <Pressable
            style={[
              styles.startButton,
              !selectedCategory && styles.startButtonDisabled,
            ]}
            onPress={startDivination}
            disabled={!selectedCategory}
          >
            <View style={styles.startIconWrapper}>
              <Image source={FEATURE_PANEL.pearl.btnDivinate} style={styles.startIcon} resizeMode="contain" />
            </View>
            <Text style={styles.startText}>{t('pearl.startSoul')}</Text>
          </Pressable>
        </View>
      )}

      {/* ═══ 搖卦中 ═══ */}
      {phase === 'shaking' && (
        <View style={styles.centerBox}>
          <Animated.Image
            source={PET_FRAME.baguaRing}
            style={[
              styles.baguaRingImage,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
            resizeMode="contain"
          />
          <Text style={styles.shakingText}>{t('pearl.shaking')}</Text>
          <View style={styles.petNarrateBox}>
            {petAvatarImg ? (
              <Image source={petAvatarImg} style={styles.petNarrateAvatar} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 20 }}>{petEmoji}</Text>
            )}
            <Text style={styles.petNarrateText}>
              {t('pearl.petChanneling', { petName })}
            </Text>
          </View>
        </View>
      )}

      {/* ═══ AI 感應中 ═══ */}
      {phase === 'analyzing' && (
        <View style={styles.centerBox}>
          <Animated.Image
            source={PET_FRAME.baguaRing}
            style={[
              styles.baguaRingImage,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
            resizeMode="contain"
          />
          <Text style={styles.shakingText}>{t('pearl.analyzing', { defaultValue: '靈寵正在感應...' })}</Text>
          <View style={styles.petNarrateBox}>
            {petAvatarImg ? (
              <Image source={petAvatarImg} style={styles.petNarrateAvatar} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 20 }}>{petEmoji}</Text>
            )}
            <Text style={styles.petNarrateText}>
              {t('pearl.petAnalyzing', { petName, defaultValue: `${petName} 正在解讀卦象...` })}
            </Text>
          </View>
        </View>
      )}

      {/* ═══ 結果 ═══ */}
      {phase === 'result' && result && (() => {
        const h = result.hexagram;
        const interp = h.interpretations[result.category];
        const verdictColor = getHexagramColor(interp.verdict);

        const narration = generateLocalPetNarration({
          feature: 'divination',
          pet: petInfo,
          data: {
            level: h.fortuneLevel,
            directAnswer: interp.guidance,
          },
        });

        return (
          <View>
            <View style={styles.hexagramCard}>
              <Text style={styles.hexagramSymbol}>{h.symbol}</Text>
              <Text style={styles.hexagramTitle}>
                {t('pearl.hexagramNum', { n: h.id })} · {h.name}
              </Text>

              <View style={styles.oracleBox}>
                <Text style={styles.oracleText}>「{h.oracle}」</Text>
              </View>

              <Text style={styles.mysticalLine}>{h.mysticalLine}</Text>

              <View style={[styles.interpBox, { borderColor: `${verdictColor}30` }]}>
                <View style={styles.interpHeader}>
                  <Text style={styles.interpCatEmoji}>{getCategoryEmoji(result.category)}</Text>
                  <Text style={styles.interpCatLabel}>{t(`pearl.cat_${result.category}`)}</Text>
                  <View style={[styles.verdictBadge, { backgroundColor: `${verdictColor}20` }]}>
                    <Text style={[styles.verdictText, { color: verdictColor }]}>{interp.verdict}</Text>
                  </View>
                </View>
                <Text style={styles.interpGuidance}>{interp.guidance}</Text>
                <Text style={styles.interpTiming}>{interp.timing}</Text>
              </View>

              <View style={styles.trigramRow}>
                <View style={styles.trigramItem}>
                  <Text style={styles.trigramLabel}>{t('pearl.upperTrigram')}</Text>
                  <Text style={styles.trigramValue}>{h.upperTrigram}</Text>
                </View>
                <View style={styles.trigramItem}>
                  <Text style={styles.trigramLabel}>{t('pearl.lowerTrigram')}</Text>
                  <Text style={styles.trigramValue}>{h.lowerTrigram}</Text>
                </View>
                <View style={styles.trigramItem}>
                  <Text style={styles.trigramLabel}>{t('pearl.element')}</Text>
                  <Text style={styles.trigramValue}>{h.element}</Text>
                </View>
                <View style={styles.trigramItem}>
                  <Text style={styles.trigramLabel}>{t('pearl.fortune')}</Text>
                  <Text style={[styles.trigramValue, { color: getHexagramColor(interp.verdict) }]}>{h.fortuneLevel}</Text>
                </View>
              </View>
            </View>

            {result.changedHexagram && (
              <View style={styles.changedCard}>
                <Text style={styles.changedLabel}>── {t('pearl.changedHexagram')} ──</Text>
                <Text style={styles.changedSymbol}>{result.changedHexagram.symbol}</Text>
                <Text style={styles.changedName}>
                  {result.changedHexagram.name}
                </Text>
                <Text style={styles.changedOracle}>{result.changedHexagram.mysticalLine}</Text>
                <Text style={styles.changedLines}>
                  {t('pearl.changingLines')}: {result.changingLines.map(l => l + 1).join('、')}
                </Text>
              </View>
            )}

            <View style={styles.petReadingCard}>
              <View style={styles.petReadingHeader}>
                {petAvatarImg ? (
                  <Image source={petAvatarImg} style={styles.petReadingAvatar} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
                )}
                <Text style={styles.petReadingLabel}>{t('pearl.petInterpretation')}</Text>
              </View>
              <Text style={styles.petReadingText}>{narration.spokenText}</Text>
            </View>

            {question ? (
              <View style={styles.questionRecap}>
                <Text style={styles.questionRecapLabel}>❓</Text>
                <Text style={styles.questionRecapText}>{question}</Text>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable style={styles.shareButton}>
                <Text style={styles.shareText}>{t('pearl.share')}</Text>
              </Pressable>
              <Pressable style={styles.redrawButton} onPress={reset}>
                <Text style={styles.redrawText}>{t('pearl.drawAgain')}</Text>
              </Pressable>
            </View>
          </View>
        );
      })()}

    </ScrollView>
  );

  if (visible !== undefined) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        {content}
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  // ── Pet hint card (idle top) ──
  petHintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 20,
  },
  petHintAvatar: { width: 40, height: 40, borderRadius: 20 },
  petHintText: { fontSize: 14, color: Colors.pet, flex: 1, fontFamily: Fonts.serif },

  // ── Category grid (2-column, last one centered) ──
  sectionLabel: { fontSize: 14, color: Colors.textDark, letterSpacing: 2, marginBottom: 10 },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: -6, marginBottom: 20,
  },
  categoryCardWrapper: {
    width: '50%', paddingHorizontal: 6, marginBottom: 12,
  },
  categoryCardCentered: {
    width: '50%',
    marginLeft: '25%',
  },
  categoryCard: {
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 16, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1.5, borderColor: 'rgba(232,197,71,0.10)',
  },
  categoryCardActive: {
    backgroundColor: 'rgba(232,197,71,0.10)',
    borderColor: '#e8c547',
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  categoryImage: { width: 88, height: 88, marginBottom: 6 },
  categoryImageActive: {
    transform: [{ scale: 1.08 }],
  },
  categoryEmoji: { fontSize: 40, marginBottom: 6 },
  categoryLabel: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.serif },
  categoryLabelActive: { color: Colors.primary, fontWeight: '700' },

  // ── Question input ──
  input: {
    padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    color: Colors.textSecondary, fontSize: 14,
    fontFamily: Fonts.serif,
    minHeight: 50, textAlignVertical: 'top',
    marginBottom: 16,
  },

  // ── Start (divinate) button — mystical purple ──
  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.35)',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  startButtonDisabled: { opacity: 0.3 },
  startIconWrapper: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(167,139,250,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  startIcon: { width: 52, height: 52 },
  startText: {
    fontSize: 17, color: '#c4b0fa', fontFamily: Fonts.serifBold, letterSpacing: 3,
  },

  // ── Shaking phase ──
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  baguaRingImage: { width: 180, height: 180, marginBottom: 20, opacity: 0.85 },
  shakingText: { fontSize: 16, color: Colors.textSecondary, fontFamily: Fonts.serif, marginBottom: 12 },
  petNarrateBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(100,180,255,0.06)',
    marginTop: 8,
  },
  petNarrateAvatar: { width: 44, height: 44, borderRadius: 22 },
  petNarrateText: { fontSize: 14, color: Colors.pet, fontFamily: Fonts.serif },

  // ── Result phase ──
  hexagramCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.12)',
    alignItems: 'center',
    marginBottom: 14,
  },
  hexagramSymbol: { fontSize: 56, marginBottom: 6 },
  hexagramTitle: { fontSize: 20, color: Colors.primary, fontFamily: Fonts.serifBold, letterSpacing: 3, marginBottom: 12 },

  oracleBox: {
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
    marginBottom: 14,
  },
  oracleText: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.serif, letterSpacing: 3, textAlign: 'center' },

  mysticalLine: {
    fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.serif,
    lineHeight: 22, textAlign: 'center', marginBottom: 20,
    fontStyle: 'italic',
  },

  interpBox: {
    width: '100%', padding: 16, borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
    marginBottom: 16,
  },
  interpHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  interpCatEmoji: { fontSize: 18 },
  interpCatLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  verdictBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginLeft: 'auto' },
  verdictText: { fontSize: 14, fontFamily: Fonts.serifBold },
  interpGuidance: { fontSize: 15, color: Colors.textSecondary, fontFamily: Fonts.serif, lineHeight: 24, marginBottom: 8 },
  interpTiming: { fontSize: 13, color: Colors.textDark, fontFamily: Fonts.serif },

  trigramRow: { flexDirection: 'row', width: '100%', gap: 8 },
  trigramItem: {
    flex: 1, padding: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.10)',
  },
  trigramLabel: { fontSize: 11, color: Colors.textDark, marginBottom: 4, letterSpacing: 1 },
  trigramValue: { fontSize: 15, color: Colors.textSecondary, fontFamily: Fonts.serifBold },

  changedCard: {
    padding: 20, borderRadius: 16, alignItems: 'center',
    backgroundColor: 'rgba(160,100,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(160,100,255,0.12)',
    marginBottom: 14,
  },
  changedLabel: { fontSize: 14, color: Colors.textDark, letterSpacing: 4, marginBottom: 12 },
  changedSymbol: { fontSize: 48, marginBottom: 6 },
  changedName: { fontSize: 16, color: '#a78bfa', fontFamily: Fonts.serifBold, letterSpacing: 3, marginBottom: 8 },
  changedOracle: { fontSize: 15, color: '#b0a0c8', fontFamily: Fonts.serif, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  changedLines: { fontSize: 13, color: Colors.textDark },

  petReadingCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 14,
  },
  petReadingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  petReadingAvatar: { width: 36, height: 36, borderRadius: 18 },
  petReadingLabel: { fontSize: 14, color: Colors.pet, fontWeight: '600', letterSpacing: 2 },
  petReadingText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  questionRecap: {
    padding: 12, borderRadius: 10,
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 14,
  },
  questionRecapLabel: { fontSize: 13, color: '#64b4ff', marginBottom: 4 },
  questionRecapText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  actionRow: { flexDirection: 'row', gap: 10 },
  shareButton: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.12)',
  },
  shareText: { fontSize: 14, color: Colors.textSecondary },
  redrawButton: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.25)',
  },
  redrawText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  closeBtnText: { fontSize: 18, color: Colors.textSecondary },
});
