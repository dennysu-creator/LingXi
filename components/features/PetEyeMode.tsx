// ═══════════════════════════════════════
// 靈眼模式 — 面相分析（拍照 → Claude Vision）
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { usePetStore } from '@/stores/pet-store';
import { useUserStore } from '@/stores/user-store';
import { analyzeFace, type FaceReadingResult } from '@/services/claude-api';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';

type Phase = 'idle' | 'preview' | 'analyzing' | 'result';

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

interface PetEyeModeProps {
  onQuotaExhausted: () => void;
}

export default function PetEyeMode({ onQuotaExhausted }: PetEyeModeProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petCreature = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const bazi = useUserStore(s => s.bazi);
  const useFeature = useUserStore(s => s.useFeature);

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (photo?.base64) {
        setCapturedImage(photo.base64);
        setPhase('preview');
      }
    } catch {
      Alert.alert(t('eye.cameraError', { defaultValue: '拍照失敗' }));
    }
  }, [t]);

  const startAnalysis = useCallback(async () => {
    const canUse = useFeature('eye', petLevel);
    if (!canUse) {
      onQuotaExhausted();
      return;
    }

    if (!capturedImage) return;

    setPhase('analyzing');
    setProgress(0);

    // 模擬進度
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 3;
      });
    }, 100);

    try {
      const baziStr = bazi
        ? `${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}`
        : '';
      const today = new Date().toISOString().slice(0, 10);

      const data = await analyzeFace(capturedImage, baziStr, '', today);
      clearInterval(interval);
      setProgress(100);
      setResult(data);
      setTimeout(() => setPhase('result'), 300);
    } catch {
      clearInterval(interval);
      setPhase('preview');
      Alert.alert(t('eye.analysisFailed', { defaultValue: '分析失敗，請重試' }));
    }
  }, [capturedImage, useFeature, petLevel, onQuotaExhausted, bazi, t]);

  // 請求相機權限
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const statusText =
    progress < 30 ? t('eye.scanning') :
    progress < 60 ? t('eye.locating') :
    progress < 85 ? t('eye.analyzing') : t('eye.generating');

  const features = result ? [
    { label: t('eye.forehead'), score: result.features.forehead.score, desc: result.features.forehead.description },
    { label: t('eye.eyebrows'), score: result.features.eyebrows.score, desc: result.features.eyebrows.description },
    { label: t('eye.eyes'), score: result.features.eyes.score, desc: result.features.eyes.description },
    { label: t('eye.nose'), score: result.features.nose.score, desc: result.features.nose.description },
    { label: t('eye.mouth'), score: result.features.mouth.score, desc: result.features.mouth.description },
  ] : [];

  const avgScore = result?.overall_score || 0;
  const overallText = result?.fortune_level || '';

  const narration = generateLocalPetNarration({
    feature: 'face',
    pet: petInfo,
    data: { overallScore: avgScore, topFeature: '天庭' },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ─── 閒置：相機拍照 ─── */}
      {phase === 'idle' && (
        <View>
          {permission?.granted ? (
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
              >
                <View style={styles.faceFrame}>
                  <Text style={styles.faceFrameEmoji}>👤</Text>
                </View>
              </CameraView>
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <View style={styles.faceFrame}>
                <Text style={styles.faceFrameEmoji}>👤</Text>
              </View>
              <Text style={styles.cameraHint}>{t('eye.cameraPermission', { defaultValue: '需要相機權限' })}</Text>
              <Pressable
                style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.7 }]}
                onPress={requestPermission}
              >
                <Text style={styles.permissionBtnText}>{t('eye.grantPermission', { defaultValue: '授權相機' })}</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.petHintCard}>
            <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
            <Text style={styles.petHintText}>
              {t('eye.petWatching', { petName })}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.captureButton, pressed && { opacity: 0.7 }]}
            onPress={takePicture}
            disabled={!permission?.granted}
          >
            <Text style={styles.captureEmoji}>👁</Text>
            <Text style={styles.captureText}>{t('eye.startAnalysis')}</Text>
          </Pressable>

          <Text style={styles.noteText}>{t('common.note')}</Text>
        </View>
      )}

      {/* ─── 預覽：確認照片 ─── */}
      {phase === 'preview' && (
        <View>
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>{t('eye.photoTaken', { defaultValue: '照片已拍攝' })}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <Pressable
              style={({ pressed }) => [styles.retryButton, { flex: 1 }, pressed && { opacity: 0.7 }]}
              onPress={() => { setCapturedImage(null); setPhase('idle'); }}
            >
              <Text style={styles.retryText}>{t('eye.retake', { defaultValue: '重拍' })}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.captureButton, { flex: 1 }, pressed && { opacity: 0.7 }]}
              onPress={startAnalysis}
            >
              <Text style={styles.captureText}>{t('eye.confirm', { defaultValue: '開始分析' })}</Text>
            </Pressable>
          </View>
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
      {phase === 'result' && result && (
        <View>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLevel}>{overallText}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={[styles.star, i > Math.round(avgScore / 20) && { opacity: 0.2 }]}>⭐</Text>
              ))}
            </View>
          </View>

          <View style={styles.petReadingCard}>
            <View style={styles.petReadingHeader}>
              <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
              <Text style={styles.petReadingLabel}>{t('eye.petReading')}</Text>
            </View>
            <Text style={styles.petReadingText}>
              {result.ai_reading || narration.spokenText}
            </Text>
          </View>

          <View style={styles.featuresCard}>
            <Text style={styles.sectionLabel}>{t('eye.featureAnalysis')}</Text>
            {features.map((f, i) => (
              <ScoreBar key={i} label={f.label} score={f.score} desc={f.desc} />
            ))}
          </View>

          {result.lucky_item && (
            <View style={styles.luckyCard}>
              <Text style={styles.sectionLabel}>{t('eye.luckyItem')}</Text>
              <View style={styles.luckyContent}>
                <View style={[styles.luckyIcon, { backgroundColor: 'rgba(100,180,255,0.1)' }]}>
                  <Text style={{ fontSize: 32 }}>{result.lucky_item.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.luckyName, { color: '#64b4ff' }]}>{result.lucky_item.name}</Text>
                  <Text style={styles.luckyDesc}>{result.lucky_item.reason}</Text>
                  <View style={styles.luckyMeta}>
                    <Text style={styles.luckyMetaText}>🧭 {result.lucky_direction}</Text>
                    <Text style={styles.luckyMetaText}>🔢 {result.lucky_number}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
            onPress={() => { setPhase('idle'); setProgress(0); setResult(null); setCapturedImage(null); }}
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
  content: { padding: Spacing.lg, paddingBottom: 100 },

  petHintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 16,
  },
  petHintText: { fontSize: 13, color: Colors.pet, flex: 1, fontFamily: Fonts.serif },

  cameraContainer: {
    height: 320, borderRadius: 20, overflow: 'hidden',
    marginBottom: 16,
  },
  camera: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
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
  permissionBtn: {
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  permissionBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
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

  previewContainer: {
    height: 200, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
    marginBottom: 16,
  },
  previewText: { fontSize: 16, color: Colors.primary, fontFamily: Fonts.serifBold },

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

  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultLevel: {
    fontSize: 46, fontFamily: Fonts.brush, color: Colors.primary,
    textShadowColor: 'rgba(232,197,71,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30,
  },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  star: { fontSize: 16 },

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

  retryButton: {
    padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },
  retryText: { fontSize: 14, color: Colors.textSecondary },
});
