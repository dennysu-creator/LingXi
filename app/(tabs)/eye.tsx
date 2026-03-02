// ═══════════════════════════════════════
// 靈寵之眼 — 面相分析（靈寵視界）
// ═══════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { usePetStore } from '@/stores/pet-store';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';

type Phase = 'idle' | 'analyzing' | 'result';

// ─── 模擬分析結果 ───
const MOCK_FEATURES = [
  { labelKey: 'eye.forehead', score: 88, descKey: 'eye.descForehead' },
  { labelKey: 'eye.eyebrows', score: 72, descKey: 'eye.descEyebrows' },
  { labelKey: 'eye.eyes', score: 91, descKey: 'eye.descEyes' },
  { labelKey: 'eye.nose', score: 65, descKey: 'eye.descNose' },
  { labelKey: 'eye.mouth', score: 80, descKey: 'eye.descMouth' },
];

const LUCKY_ITEM = {
  icon: '🧿',
  nameKey: 'eye.luckyItemName',
  descKey: 'eye.luckyItemDesc',
  color: '#64b4ff',
  directionKey: 'eye.luckyItemDir',
  numbersKey: 'eye.luckyItemNumbers',
};

function ScoreBar({ label, score, desc }: { label: string; score: number; desc: string }) {
  const barColor = score >= 85 ? Colors.primary : score >= 70 ? Colors.textSecondary : Colors.textMuted;
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureLabel}>{label}</Text>
      <View style={styles.featureTrack}>
        <View style={[styles.featureFill, { width: `${score}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.featureScore, { color: barColor }]}>{score}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

export default function EyeScreen() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);

  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petType = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const petInfo: PetInfo = { name: petName, type: petType, element: petElement, emoji: petEmoji, level: petLevel };

  const startAnalysis = useCallback(() => {
    setPhase('analyzing');
    setProgress(0);
  }, []);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase('result');
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  const statusText =
    progress < 30 ? t('eye.scanning') :
    progress < 60 ? t('eye.locating') :
    progress < 85 ? t('eye.analyzing') : t('eye.generating');

  const avgScore = Math.round(MOCK_FEATURES.reduce((s, f) => s + f.score, 0) / MOCK_FEATURES.length);
  const overallText = avgScore >= 85 ? t('fortune.great') : avgScore >= 75 ? t('fortune.good') : avgScore >= 65 ? t('fortune.small') : t('fortune.neutral');

  // 靈寵解讀
  const narration = generateLocalPetNarration({
    feature: 'face',
    pet: petInfo,
    data: { overallScore: avgScore, topFeature: '天庭' },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('eye.title')}</Text>
      <Text style={styles.subtitle}>{t('eye.subtitle')}</Text>

      {/* ─── 閒置：拍照入口 ─── */}
      {phase === 'idle' && (
        <View>
          <View style={styles.cameraPlaceholder}>
            <View style={styles.faceFrame}>
              <Text style={styles.faceFrameEmoji}>👤</Text>
            </View>
            <Text style={styles.cameraHint}>{t('eye.alignFace')}</Text>
          </View>

          {/* 靈寵提示 */}
          <View style={styles.petHintCard}>
            <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
            <Text style={styles.petHintText}>
              {t('eye.petWatching', { petName })}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.captureButton, pressed && { opacity: 0.7 }]}
            onPress={startAnalysis}
          >
            <Text style={styles.captureEmoji}>👁</Text>
            <Text style={styles.captureText}>{t('eye.startAnalysis')}</Text>
          </Pressable>

          <Text style={styles.noteText}>
            {t('common.note')}
          </Text>
        </View>
      )}

      {/* ─── 分析中 ─── */}
      {phase === 'analyzing' && (
        <View style={styles.analyzingBox}>
          <View style={styles.scanFrame}>
            <Text style={{ fontSize: 64 }}>🧑</Text>
            {progress > 40 && (
              <View style={styles.detectionDots}>
                {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
                  <View key={i} style={[styles.dot, { opacity: Math.min(1, (progress - 40) / 30) }]} />
                ))}
              </View>
            )}
          </View>

          {/* 靈寵旁白 */}
          <View style={styles.petNarrateBox}>
            <Text style={{ fontSize: 20 }}>{petEmoji}</Text>
            <Text style={styles.petNarrateText}>
              {progress < 50 ? t('eye.petWatching', { petName }) : t('eye.petFound', { petName })}
            </Text>
          </View>

          <Text style={styles.progressText}>{progress}%</Text>
          <Text style={styles.statusText}>{statusText}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      {/* ─── 結果 ─── */}
      {phase === 'result' && (
        <View>
          {/* 總評 */}
          <View style={styles.resultHeader}>
            <Text style={styles.resultLevel}>{overallText}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={[styles.star, i > 4 && { opacity: 0.2 }]}>⭐</Text>
              ))}
            </View>
          </View>

          {/* 靈寵解讀 */}
          <View style={styles.petReadingCard}>
            <View style={styles.petReadingHeader}>
              <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
              <Text style={styles.petReadingLabel}>{t('eye.petReading')}</Text>
            </View>
            <Text style={styles.petReadingText}>{narration.spokenText}</Text>
          </View>

          {/* 五官分數 */}
          <View style={styles.featuresCard}>
            <Text style={styles.sectionLabel}>{t('eye.featureAnalysis')}</Text>
            {MOCK_FEATURES.map((f, i) => (
              <ScoreBar key={i} label={t(f.labelKey)} score={f.score} desc={t(f.descKey)} />
            ))}
          </View>

          {/* 幸運物 */}
          <View style={styles.luckyCard}>
            <Text style={styles.sectionLabel}>{t('eye.luckyItem')}</Text>
            <View style={styles.luckyContent}>
              <View style={[styles.luckyIcon, { backgroundColor: `${LUCKY_ITEM.color}15` }]}>
                <Text style={{ fontSize: 32 }}>{LUCKY_ITEM.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.luckyName, { color: LUCKY_ITEM.color }]}>{t(LUCKY_ITEM.nameKey)}</Text>
                <Text style={styles.luckyDesc}>{t(LUCKY_ITEM.descKey)}</Text>
                <View style={styles.luckyMeta}>
                  <Text style={styles.luckyMetaText}>🧭 {t(LUCKY_ITEM.directionKey)}</Text>
                  <Text style={styles.luckyMetaText}>🔢 {t(LUCKY_ITEM.numbersKey)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 重新分析 */}
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
            onPress={() => { setPhase('idle'); setProgress(0); }}
          >
            <Text style={styles.retryText}>{t('eye.reAnalyze')}</Text>
          </Pressable>
        </View>
      )}
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
    marginBottom: 16,
  },
  petHintText: { fontSize: 13, color: Colors.pet, flex: 1, fontFamily: Fonts.serif },

  // Camera
  cameraPlaceholder: {
    alignItems: 'center', justifyContent: 'center',
    height: 280, borderRadius: 20,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    marginBottom: 16,
  },
  faceFrame: {
    width: 160, height: 200, borderRadius: 80,
    borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(232,197,71,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  faceFrameEmoji: { fontSize: 48, opacity: 0.3 },
  cameraHint: { fontSize: 12, color: Colors.textDark, marginTop: 16, letterSpacing: 2 },
  captureButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 18, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.3)',
    marginBottom: 16,
  },
  captureEmoji: { fontSize: 24 },
  captureText: { fontSize: 16, color: Colors.primary, fontFamily: Fonts.serifBold, letterSpacing: 2 },
  noteText: { fontSize: 11, color: Colors.textDarkest, textAlign: 'center', fontStyle: 'italic' },

  // Analyzing
  analyzingBox: { alignItems: 'center', paddingVertical: 30 },
  scanFrame: {
    width: 180, height: 220, borderRadius: 90,
    borderWidth: 2, borderColor: 'rgba(232,197,71,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, position: 'relative',
  },
  detectionDots: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary, margin: 4,
  },
  petNarrateBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(100,180,255,0.06)',
    marginBottom: 16,
  },
  petNarrateText: { fontSize: 12, color: Colors.pet, fontFamily: Fonts.serif },
  progressText: { fontSize: 28, color: Colors.primary, fontFamily: Fonts.brush, marginBottom: 8 },
  statusText: { fontSize: 14, color: Colors.textMuted, letterSpacing: 2, marginBottom: 16 },
  progressTrack: {
    width: '80%', height: 4, borderRadius: 2,
    backgroundColor: 'rgba(232,197,71,0.1)',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.primary },

  // Result
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultLevel: {
    fontSize: 46, fontFamily: Fonts.brush, color: Colors.primary,
    textShadowColor: 'rgba(232,197,71,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30,
  },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  star: { fontSize: 16 },

  // Pet reading
  petReadingCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 16,
  },
  petReadingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  petReadingLabel: { fontSize: 12, color: Colors.pet, fontWeight: '600', letterSpacing: 2 },
  petReadingText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  sectionLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 2, marginBottom: 14, fontFamily: Fonts.serif },

  // Features
  featuresCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    marginBottom: 16,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  featureLabel: { fontSize: 12, color: Colors.textDark, width: 32, textAlign: 'right' },
  featureTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  featureFill: { height: '100%', borderRadius: 2 },
  featureScore: { fontSize: 12, width: 24, fontWeight: '700' },
  featureDesc: { fontSize: 10, color: Colors.textDarkest, width: 56 },

  // Lucky item
  luckyCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 16,
  },
  luckyContent: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  luckyIcon: {
    width: 60, height: 60, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  luckyName: { fontSize: 16, fontFamily: Fonts.serifBold, marginBottom: 4 },
  luckyDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginBottom: 6 },
  luckyMeta: { flexDirection: 'row', gap: 12 },
  luckyMetaText: { fontSize: 11, color: Colors.textDark },

  // Retry
  retryButton: {
    padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },
  retryText: { fontSize: 14, color: Colors.textSecondary },
});
