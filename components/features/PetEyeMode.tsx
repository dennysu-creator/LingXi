// ═══════════════════════════════════════
// 靈眼模式 — 面相分析（拍照 → Claude Vision）
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Platform, Modal, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

// expo-camera is native-only; guard for web
let CameraView: any = null;
let useCameraPermissions: any = () => [null, () => {}];
if (Platform.OS !== 'web') {
  try {
    const cam = require('expo-camera');
    CameraView = cam.CameraView;
    useCameraPermissions = cam.useCameraPermissions;
  } catch { /* not available */ }
}
import { Colors, Fonts, Spacing } from '@/config/theme';
import { usePetStore } from '@/stores/pet-store';
import { useUserStore } from '@/stores/user-store';
import { FEATURE_PANEL, getPetImage } from '@/assets/images';
import { ApiError } from '@/services/api-client';
import { analyzeFace, type FaceReadingResult } from '@/services/claude-api';
import { getLocalDateKey } from '@/services/date-utils';
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
  visible?: boolean;
  onClose?: () => void;
  onResult?: (text: string, data: any) => void;
  onQuotaExhausted: () => void;
}

export default function PetEyeMode({ visible, onClose, onResult, onQuotaExhausted }: PetEyeModeProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<FaceReadingResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const petName = usePetStore(s => s.name) || '靈寵';
  const petId = usePetStore(s => s.petId) || '';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petCreature = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const bazi = useUserStore(s => s.bazi);
  const useFeature = useUserStore(s => s.useFeature);

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };
  const petAvatarImg = getPetImage(petId, 'avatar');

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (photo?.base64) {
        setCapturedImage(photo.base64);
        // 跳過 preview 確認，直接進入分析
        setPhase('analyzing');
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
      const today = getLocalDateKey(new Date());

      const data = await analyzeFace(capturedImage, baziStr, '', today);
      clearInterval(interval);
      setProgress(100);
      setResult(data);

      // Send result to parent (chat bubble)
      if (onResult) {
        const resultNarration = generateLocalPetNarration({
          feature: 'face',
          pet: petInfo,
          data: { overallScore: data.overall_score, topFeature: '天庭' },
        });
        const resultText = (data as any).petMessage || data.ai_reading || resultNarration.spokenText;
        onResult(resultText, {
          ...data,
          stars: (data as any).stars,
          luckyItems: (data as any).luckyItems,
        });
        // Close modal after result is sent
        setTimeout(() => { onClose?.(); setPhase('idle'); setProgress(0); setResult(null); setCapturedImage(null); }, 300);
        return;
      }

      setTimeout(() => setPhase('result'), 300);
    } catch (err) {
      clearInterval(interval);
      setPhase('preview');
      let msg = t('eye.analysisFailed', { defaultValue: '分析失敗，請重試' });
      if (err instanceof ApiError) {
        if (err.status === 401) msg = '請先登入';
        else if (err.status === 408) msg = '請求逾時，請重試';
        else if (err.status === 0) msg = '網路連線失敗';
        else msg = err.message || msg;
      }
      Alert.alert(msg);
    }
  }, [capturedImage, useFeature, petLevel, onQuotaExhausted, onResult, onClose, bazi, t, petName, petCreature, petElement, petEmoji]);

  // 請求相機權限
  useEffect(() => {
    if (visible === false) return;
    if (permission === null) return;
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission, visible]);

  // 拍照後自動啟動分析
  useEffect(() => {
    if (phase === 'analyzing' && capturedImage) {
      startAnalysis();
    }
  }, [phase, capturedImage]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusText =
    progress < 30 ? t('eye.scanning') :
    progress < 60 ? t('eye.locating') :
    progress < 85 ? t('eye.analyzing') : t('eye.generating');

  const features = result?.features ? [
    { label: t('eye.forehead'), score: result.features.forehead?.score ?? 0, desc: result.features.forehead?.description ?? '' },
    { label: t('eye.eyebrows'), score: result.features.eyebrows?.score ?? 0, desc: result.features.eyebrows?.description ?? '' },
    { label: t('eye.eyes'), score: result.features.eyes?.score ?? 0, desc: result.features.eyes?.description ?? '' },
    { label: t('eye.nose'), score: result.features.nose?.score ?? 0, desc: result.features.nose?.description ?? '' },
    { label: t('eye.mouth'), score: result.features.mouth?.score ?? 0, desc: result.features.mouth?.description ?? '' },
  ] : [];

  const avgScore = result?.overall_score || 0;
  const overallText = result?.fortune_level || '';

  const narration = generateLocalPetNarration({
    feature: 'face',
    pet: petInfo,
    data: { overallScore: avgScore, topFeature: '天庭' },
  });

  const content = (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Close button when in modal */}
        {onClose && (
          <Pressable style={styles.closeBtn} onPress={() => { onClose(); setPhase('idle'); setProgress(0); setResult(null); setCapturedImage(null); }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        )}

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
                  <Image
                    source={FEATURE_PANEL.eye.stepFace}
                    style={styles.faceGuideOverlay}
                    resizeMode="contain"
                  />
                </CameraView>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Image
                  source={FEATURE_PANEL.eye.stepFace}
                  style={styles.faceGuidePlaceholder}
                  resizeMode="contain"
                />
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
              {petAvatarImg ? (
                <Image source={petAvatarImg} style={styles.petHintAvatar} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
              )}
              <Text style={styles.petHintText}>
                {t('eye.petWatching', { petName })}
              </Text>
            </View>
          </View>
        )}

        {/* ─── 預覽：確認照片 ─── */}
        {phase === 'preview' && (
          <View>
            <View style={styles.previewContainer}>
              {capturedImage ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.previewText}>{t('eye.photoTaken', { defaultValue: '照片已拍攝' })}</Text>
              )}
            </View>
          </View>
        )}

        {/* ─── 分析中 ─── */}
        {phase === 'analyzing' && (
          <View style={styles.analyzingBox}>
            {/* Captured photo as watermark background */}
            <View style={styles.scanFrame}>
              {capturedImage && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
                  style={styles.analyzingPhoto}
                  resizeMode="cover"
                />
              )}
              <View style={styles.analyzingOverlay}>
                <Image
                  source={FEATURE_PANEL.eye.progressAnalyzing}
                  style={styles.analyzingArt}
                  resizeMode="contain"
                />
              </View>
              {progress > 40 && (
                <View style={styles.detectionDots}>
                  {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
                    <View key={i} style={[styles.dot, { opacity: Math.min(1, (progress - 40) / 30) }]} />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.petNarrateBox}>
              {petAvatarImg ? (
                <Image source={petAvatarImg} style={styles.petNarrateAvatar} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 20 }}>{petEmoji}</Text>
              )}
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
                {petAvatarImg ? (
                  <Image source={petAvatarImg} style={styles.petReadingAvatar} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
                )}
                <Text style={styles.petReadingLabel}>{t('eye.petReading')}</Text>
              </View>
              <Text style={styles.petReadingText}>
                {(result as any).petMessage || result.ai_reading || narration.spokenText}
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

      {/* ═══ Fixed bottom buttons ═══ */}
      {phase === 'idle' && (
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [styles.captureButton, pressed && { opacity: 0.7 }]}
            onPress={takePicture}
            disabled={!permission?.granted}
          >
            <Image source={FEATURE_PANEL.eye.btnCamera} style={styles.captureIcon} resizeMode="contain" />
            <Text style={styles.captureText}>{t('eye.startAnalysis')}</Text>
          </Pressable>
        </View>
      )}
      {phase === 'preview' && (
        <View style={styles.bottomBar}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
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
    </View>
  );

  // If visible prop is provided, wrap in Modal
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
  outerContainer: { flex: 1 },
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 8 },
  bottomBar: { paddingHorizontal: Spacing.lg, paddingBottom: 8 },

  petHintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 16,
  },
  petHintText: { fontSize: 14, color: Colors.pet, flex: 1, fontFamily: Fonts.serif },

  cameraContainer: {
    aspectRatio: 3 / 4, borderRadius: 20, overflow: 'hidden',
    marginBottom: 12,
  },
  camera: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  cameraPlaceholder: {
    alignItems: 'center', justifyContent: 'center',
    aspectRatio: 3 / 4, borderRadius: 20,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    marginBottom: 16,
  },
  faceGuideOverlay: {
    width: 180, height: 240, opacity: 0.35,
  },
  faceGuidePlaceholder: {
    width: 160, height: 220, opacity: 0.4,
  },
  cameraHint: { fontSize: 13, color: Colors.textDark, marginTop: 16, letterSpacing: 2 },
  permissionBtn: {
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  permissionBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  captureButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 60, borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.25)',
    marginBottom: 16,
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  captureIcon: { width: 56, height: 56 },
  petHintAvatar: { width: 52, height: 52, borderRadius: 26 },
  petNarrateAvatar: { width: 32, height: 32, borderRadius: 16 },
  petReadingAvatar: { width: 36, height: 36, borderRadius: 18 },
  captureText: { fontSize: 16, color: Colors.primary, fontFamily: Fonts.serifBold, letterSpacing: 2 },
  noteText: { fontSize: 13, color: Colors.textDarkest, textAlign: 'center', fontStyle: 'italic' },

  previewContainer: {
    aspectRatio: 3 / 4, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  previewText: { fontSize: 16, color: Colors.primary, fontFamily: Fonts.serifBold },

  analyzingBox: { alignItems: 'center', paddingVertical: 20 },
  scanFrame: {
    width: '80%', aspectRatio: 3 / 4, borderRadius: 24,
    borderWidth: 2, borderColor: 'rgba(232,197,71,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, position: 'relative',
    overflow: 'hidden',
  },
  analyzingPhoto: {
    position: 'absolute', width: '100%', height: '100%', opacity: 0.25,
  },
  analyzingOverlay: {
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  analyzingArt: {
    width: 160, height: 160,
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
  petNarrateText: { fontSize: 14, color: Colors.pet, fontFamily: Fonts.serif },
  progressText: { fontSize: 28, color: Colors.primary, fontFamily: Fonts.brush, marginBottom: 8 },
  statusText: { fontSize: 14, color: Colors.textMuted, letterSpacing: 2, marginBottom: 16 },
  progressTrack: {
    width: '90%', height: 8, borderRadius: 4,
    backgroundColor: 'rgba(232,197,71,0.1)',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary },

  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultLevel: {
    fontSize: 36, fontFamily: Fonts.brush, color: Colors.primary,
    textShadowColor: 'rgba(232,197,71,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
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
  petReadingLabel: { fontSize: 14, color: Colors.pet, fontWeight: '600', letterSpacing: 2 },
  petReadingText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  sectionLabel: { fontSize: 14, color: Colors.textMuted, letterSpacing: 2, marginBottom: 14, fontFamily: Fonts.serif },

  featuresCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
    marginBottom: 16,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  featureLabel: { fontSize: 14, color: Colors.textMuted, width: 40, textAlign: 'right', fontFamily: Fonts.serif },
  featureTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  featureFill: { height: '100%', borderRadius: 3 },
  featureScore: { fontSize: 14, width: 32, fontWeight: '700', textAlign: 'right' },
  featureDesc: { fontSize: 13, color: Colors.textDark, width: 60, fontFamily: Fonts.serif },

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
  luckyDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 6 },
  luckyMeta: { flexDirection: 'row', gap: 12 },
  luckyMetaText: { fontSize: 13, color: Colors.textDark },

  retryButton: {
    padding: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },
  retryText: { fontSize: 14, color: Colors.textSecondary },

  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  closeBtnText: { fontSize: 18, color: Colors.textSecondary },
});
