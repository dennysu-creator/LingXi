// ═══════════════════════════════════════
// 靈寵之魂 — 六十四卦占卜
// 選類別 → 搖卦 → 卦象 + 變卦 → 靈寵解讀
// ═══════════════════════════════════════

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Vibration, Pressable,
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
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';

type Phase = 'idle' | 'shaking' | 'result';

const CATEGORIES: DivinationCategory[] = ['career', 'love', 'family', 'health', 'study'];

export default function PearlScreen() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DivinationCategory | null>(null);
  const [result, setResult] = useState<HexagramResult | null>(null);

  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petType = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const useFeature = useUserStore(s => s.useFeature);
  const getRemainingUses = useUserStore(s => s.getRemainingUses);

  const petInfo: PetInfo = { name: petName, type: petType, element: petElement, emoji: petEmoji, level: petLevel };
  const remaining = getRemainingUses('soul', petLevel);

  // ─── 啟動靈寵之魂 ───
  const startDivination = () => {
    if (!selectedCategory) return;

    const canUse = useFeature('soul', petLevel);
    if (!canUse) return; // 額度用完

    setPhase('shaking');
    Vibration.vibrate([0, 80, 60, 80, 60, 80, 60, 150]);

    setTimeout(() => {
      const hexResult = performHexagramDivination(selectedCategory, question || undefined);
      setResult(hexResult);
      setPhase('result');
    }, 1500);
  };

  // ─── 重新求卦 ───
  const reset = () => {
    setPhase('idle');
    setResult(null);
    setQuestion('');
    setSelectedCategory(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ─── 標題 ─── */}
      <Text style={styles.title}>{t('pearl.title')}</Text>
      <Text style={styles.subtitle}>{t('pearl.subtitle')}</Text>

      {/* ═══ 閒置：選擇類別 + 問題 + 啟動 ═══ */}
      {phase === 'idle' && (
        <View>
          {/* 靈寵提示 */}
          <View style={styles.petHintCard}>
            <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
            <Text style={styles.petHintText}>
              {t('pearl.petHint', { name: petName })}
            </Text>
          </View>

          {/* 類別選擇 */}
          <Text style={styles.sectionLabel}>{t('pearl.selectCategory')}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat && styles.categoryBtnActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat)}</Text>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory === cat && styles.categoryLabelActive,
                ]}>
                  {t(`pearl.cat_${cat}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 問題輸入（選填） */}
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

          {/* 額度提示 */}
          {remaining <= 0 && (
            <View style={styles.quotaWarning}>
              <Text style={styles.quotaWarningText}>{t('pearl.quotaEmpty')}</Text>
              <Text style={styles.quotaUpgradeText}>{t('pearl.quotaUpgrade')}</Text>
            </View>
          )}

          {/* 啟動按鈕 */}
          <TouchableOpacity
            style={[
              styles.startButton,
              (!selectedCategory || remaining <= 0) && styles.startButtonDisabled,
            ]}
            onPress={startDivination}
            disabled={!selectedCategory || remaining <= 0}
          >
            <Text style={styles.startEmoji}>🏮</Text>
            <Text style={styles.startText}>{t('pearl.startSoul')}</Text>
          </TouchableOpacity>

          <Text style={styles.remainingText}>
            {t('pearl.remaining', { n: remaining })}
          </Text>
        </View>
      )}

      {/* ═══ 搖卦中 ═══ */}
      {phase === 'shaking' && (
        <View style={styles.centerBox}>
          <Text style={styles.shakingSymbol}>☰☷☳☴☵☲☶☱</Text>
          <Text style={styles.shakingText}>{t('pearl.shaking')}</Text>
          <View style={styles.petNarrateBox}>
            <Text style={{ fontSize: 20 }}>{petEmoji}</Text>
            <Text style={styles.petNarrateText}>
              {t('pearl.petChanneling', { name: petName })}
            </Text>
          </View>
        </View>
      )}

      {/* ═══ 結果 ═══ */}
      {phase === 'result' && result && (() => {
        const h = result.hexagram;
        const interp = h.interpretations[result.category];
        const verdictColor = getHexagramColor(interp.verdict);

        // 靈寵解讀
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
            {/* 本卦 */}
            <View style={styles.hexagramCard}>
              <Text style={styles.hexagramSymbol}>{h.symbol}</Text>
              <Text style={styles.hexagramTitle}>
                {t('pearl.hexagramNum', { n: h.id })} · {h.name}
              </Text>

              {/* 卦辭 */}
              <View style={styles.oracleBox}>
                <Text style={styles.oracleText}>「{h.oracle}」</Text>
              </View>

              {/* 詩意句 */}
              <Text style={styles.mysticalLine}>{h.mysticalLine}</Text>

              {/* 問事解讀 */}
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

              {/* 卦象資訊 */}
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

            {/* 變卦（若有） */}
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

            {/* 靈寵解讀 */}
            <View style={styles.petReadingCard}>
              <View style={styles.petReadingHeader}>
                <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
                <Text style={styles.petReadingLabel}>{t('pearl.petInterpretation')}</Text>
              </View>
              <Text style={styles.petReadingText}>{narration.spokenText}</Text>
            </View>

            {/* 問題回顧 */}
            {question ? (
              <View style={styles.questionRecap}>
                <Text style={styles.questionRecapLabel}>❓</Text>
                <Text style={styles.questionRecapText}>{question}</Text>
              </View>
            ) : null}

            {/* 操作按鈕 */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareText}>{t('pearl.share')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.redrawButton} onPress={reset}>
                <Text style={styles.redrawText}>{t('pearl.drawAgain')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })()}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: 62, paddingBottom: 100 },
  title: { fontFamily: Fonts.brush, fontSize: 28, color: Colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 12, color: Colors.textDark, marginBottom: 20 },

  // Pet hint
  petHintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 20,
  },
  petHintText: { fontSize: 13, color: Colors.pet, flex: 1, fontFamily: Fonts.serif },

  // Category selection
  sectionLabel: { fontSize: 12, color: Colors.textDark, letterSpacing: 2, marginBottom: 10 },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  categoryBtn: {
    flex: 1, minWidth: 90, paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
  },
  categoryBtnActive: {
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderColor: 'rgba(232,197,71,0.4)',
  },
  categoryEmoji: { fontSize: 22, marginBottom: 4 },
  categoryLabel: { fontSize: 12, color: Colors.textMuted },
  categoryLabelActive: { color: Colors.primary, fontWeight: '600' },

  // Input
  input: {
    padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    color: Colors.textSecondary, fontSize: 14,
    fontFamily: Fonts.serif,
    minHeight: 50, textAlignVertical: 'top',
    marginBottom: 16,
  },

  // Quota warning
  quotaWarning: {
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(200,80,80,0.08)',
    borderWidth: 1, borderColor: 'rgba(200,80,80,0.15)',
    marginBottom: 16,
  },
  quotaWarningText: { fontSize: 13, color: '#c44040', marginBottom: 4 },
  quotaUpgradeText: { fontSize: 11, color: Colors.textMuted },

  // Start button
  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 18, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.3)',
  },
  startButtonDisabled: { opacity: 0.3 },
  startEmoji: { fontSize: 28 },
  startText: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.serifBold, letterSpacing: 4 },
  remainingText: { fontSize: 11, color: Colors.textDark, textAlign: 'center', marginTop: 8 },

  // Shaking
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  shakingSymbol: { fontSize: 28, color: Colors.primary, letterSpacing: 8, marginBottom: 16, opacity: 0.6 },
  shakingText: { fontSize: 16, color: Colors.textSecondary, fontFamily: Fonts.serif, marginBottom: 12 },
  petNarrateBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(100,180,255,0.06)',
    marginTop: 8,
  },
  petNarrateText: { fontSize: 12, color: Colors.pet, fontFamily: Fonts.serif },

  // Hexagram card
  hexagramCard: {
    padding: 24, borderRadius: 20,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.12)',
    alignItems: 'center',
    marginBottom: 14,
  },
  hexagramSymbol: { fontSize: 64, marginBottom: 8 },
  hexagramTitle: { fontSize: 20, color: Colors.primary, fontFamily: Fonts.serifBold, letterSpacing: 4, marginBottom: 16 },

  oracleBox: {
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.06)',
    marginBottom: 12,
  },
  oracleText: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.serif, letterSpacing: 4, textAlign: 'center' },

  mysticalLine: {
    fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.serif,
    lineHeight: 22, textAlign: 'center', marginBottom: 20,
    fontStyle: 'italic',
  },

  // Interpretation
  interpBox: {
    width: '100%', padding: 16, borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1,
    marginBottom: 16,
  },
  interpHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  interpCatEmoji: { fontSize: 18 },
  interpCatLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  verdictBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginLeft: 'auto' },
  verdictText: { fontSize: 14, fontFamily: Fonts.serifBold },
  interpGuidance: { fontSize: 15, color: Colors.textSecondary, fontFamily: Fonts.serif, lineHeight: 24, marginBottom: 8 },
  interpTiming: { fontSize: 12, color: Colors.textDark, fontFamily: Fonts.serif },

  // Trigram info
  trigramRow: { flexDirection: 'row', width: '100%', gap: 8 },
  trigramItem: {
    flex: 1, padding: 8, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.04)',
  },
  trigramLabel: { fontSize: 9, color: Colors.textDark, marginBottom: 4, letterSpacing: 1 },
  trigramValue: { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.serifBold },

  // Changed hexagram
  changedCard: {
    padding: 20, borderRadius: 16, alignItems: 'center',
    backgroundColor: 'rgba(160,100,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(160,100,255,0.12)',
    marginBottom: 14,
  },
  changedLabel: { fontSize: 12, color: Colors.textDark, letterSpacing: 4, marginBottom: 12 },
  changedSymbol: { fontSize: 40, marginBottom: 6 },
  changedName: { fontSize: 16, color: '#a78bfa', fontFamily: Fonts.serifBold, letterSpacing: 3, marginBottom: 8 },
  changedOracle: { fontSize: 13, color: '#b0a0c8', fontFamily: Fonts.serif, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  changedLines: { fontSize: 11, color: Colors.textDark },

  // Pet reading
  petReadingCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 14,
  },
  petReadingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  petReadingLabel: { fontSize: 12, color: Colors.pet, fontWeight: '600', letterSpacing: 2 },
  petReadingText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  // Question recap
  questionRecap: {
    padding: 12, borderRadius: 10,
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 14,
  },
  questionRecapLabel: { fontSize: 11, color: '#64b4ff', marginBottom: 4 },
  questionRecapText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  // Actions
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
});
