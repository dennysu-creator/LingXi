// ═══════════════════════════════════════
// 靈心模式 — GPS + 羅盤 + 風水分析（真實裝置感測器）
// ═══════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Alert, Modal, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { FEATURE_PANEL, EFFECTS, getPetImage } from '@/assets/images';

// Magnetometer is native-only; guard for web
let Magnetometer: any = null;
if (Platform.OS !== 'web') {
  try {
    Magnetometer = require('expo-sensors').Magnetometer;
  } catch { /* not available */ }
}
import { Colors, Fonts, Spacing } from '@/config/theme';
import { ApiError } from '@/services/api-client';
import { useUserStore } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
import { generateQimenChart } from '@/services/qimen-engine';
import { getCurrentShichen } from '@/services/bazi-engine';
import { analyzeFengShui, type FengShuiResult } from '@/services/claude-api';
import { formatCoordinate } from '@/services/date-utils';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';

const DIRECTIONS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'] as const;
const DIR_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const DIR_I18N: Record<string, string> = {
  '北': 'directions.north', '東北': 'directions.northeast',
  '東': 'directions.east', '東南': 'directions.southeast',
  '南': 'directions.south', '西南': 'directions.southwest',
  '西': 'directions.west', '西北': 'directions.northwest',
};

interface PetHeartModeProps {
  visible?: boolean;
  onClose?: () => void;
  onResult?: (text: string, data: any) => void;
  onQuotaExhausted: () => void;
}

export default function PetHeartMode({ visible, onClose, onResult, onQuotaExhausted }: PetHeartModeProps) {
  const { t } = useTranslation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [aiResult, setAiResult] = useState<FengShuiResult | null>(null);
  const [heading, setHeading] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationError, setLocationError] = useState(false);

  const bazi = useUserStore(s => s.bazi);
  const useFeature = useUserStore(s => s.useFeature);

  const petName = usePetStore(s => s.name) || '靈寵';
  const petId = usePetStore(s => s.petId) || '';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petCreature = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };
  const petAvatarImg = getPetImage(petId, 'avatar');

  const shichen = useMemo(() => getCurrentShichen(), []);
  const chart = useMemo(() => generateQimenChart(new Date()), []);

  const luckyDirs = useMemo(() => {
    return chart.palaces
      .filter(p => p.isAuspicious && p.gate !== '—')
      .map(p => p.direction);
  }, [chart]);

  const dangerDirs = useMemo(() => {
    return chart.palaces
      .filter(p => !p.isAuspicious && p.gate !== '—')
      .map(p => p.direction);
  }, [chart]);

  const narration = generateLocalPetNarration({
    feature: 'fengshui',
    pet: petInfo,
    data: {
      luckyDirection: luckyDirs[0] || '東南',
      dangerDirection: dangerDirs[0] || '西',
    },
  });

  const tDir = (d: string) => DIR_I18N[d] ? t(DIR_I18N[d]) : d;

  // 取得 GPS 位置 — 只在 visible 時啟動
  useEffect(() => {
    if (visible === false) return;
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(true);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted) return;
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });

        // 反向地理編碼取得地名
        const [addr] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (addr && mounted) {
          setLocationName(addr.city || addr.district || addr.name || '');
        }
      } catch {
        if (mounted) setLocationError(true);
      }
    })();
    return () => { mounted = false; };
  }, [visible]);

  // 磁力計羅盤 — 只在 visible 時訂閱（native only）
  useEffect(() => {
    if (visible === false || !Magnetometer) return;
    const sub = Magnetometer.addListener((data: { x: number; y: number }) => {
      const { x, y } = data;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      setHeading((angle + 360) % 360);
    });
    Magnetometer.setUpdateInterval(200);
    return () => sub.remove();
  }, [visible]);

  const startAnalysis = useCallback(async () => {
    const canUse = useFeature('heart', petLevel);
    if (!canUse) {
      onQuotaExhausted();
      return;
    }

    if (!location) {
      Alert.alert(t('heart.noGps', { defaultValue: 'GPS 定位中，請稍候' }));
      return;
    }

    setIsAnalyzing(true);
    try {
      const baziStr = bazi
        ? `${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}`
        : '';

      const data = await analyzeFengShui(
        location.lat,
        location.lng,
        heading,
        locationName,
        baziStr,
        '',
      );
      setAiResult(data);
      setShowResult(true);

      // Send result to parent (chat bubble)
      if (onResult) {
        const resultText = (data as any).petMessage || data.location_analysis || narration.spokenText;
        onResult(resultText, {
          ...data,
          stars: (data as any).stars,
          luckyItems: (data as any).luckyItems,
          palaces: chart.palaces,
          luckyDirections: luckyDirs,
          dangerDirections: dangerDirs,
        });
        setTimeout(() => { onClose?.(); setShowResult(false); setAiResult(null); }, 300);
        return;
      }
    } catch (err) {
      let msg = t('heart.analysisFailed', { defaultValue: '分析失敗，請重試' });
      if (err instanceof ApiError) {
        if (err.status === 401) msg = '請先登入';
        else if (err.status === 408) msg = '請求逾時，請重試';
        else if (err.status === 0) msg = '網路連線失敗';
        else msg = err.message || msg;
      }
      Alert.alert(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }, [useFeature, petLevel, onQuotaExhausted, onResult, onClose, location, heading, locationName, bazi, t, narration, chart, luckyDirs, dangerDirs]);

  const coordText = location
    ? `${formatCoordinate(location.lat, 'N', 'S')} ${formatCoordinate(location.lng, 'E', 'W')}`
    : t('heart.locating', { defaultValue: '定位中...' });

  const content = (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Close button when in modal */}
        {onClose && (
          <Pressable style={styles.closeBtn} onPress={() => { onClose(); setShowResult(false); setAiResult(null); }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        )}

        {/* ═══ GPS + 靈寵感應 (merged single row) ═══ */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsHeader}>
            <View style={[styles.gpsDot, !location && { backgroundColor: Colors.textDarkest }]} />
            <Text style={styles.gpsText}>
              {location ? coordText : locationError ? t('heart.gpsError', { defaultValue: 'GPS 無法使用' }) : t('heart.locating', { defaultValue: '定位中...' })}
            </Text>
            {locationName !== '' && <Text style={styles.locationNameInline}>{locationName}</Text>}
          </View>
          <View style={styles.petSenseInline}>
            {petAvatarImg ? (
              <Image source={petAvatarImg} style={styles.petSenseAvatar} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 16 }}>{petEmoji}</Text>
            )}
            <Text style={styles.petSenseTextSmall}>{t('heart.petSensing', { petName })}</Text>
          </View>
        </View>

        {/* ═══ 羅盤 — AI art compass ═══ */}
        <View style={styles.compassCard}>
          <View style={styles.compassContainer}>
            {/* Rotating compass body (background + direction labels) */}
            <View style={[styles.compass, { transform: [{ rotate: `${-heading}deg` }] }]}>
              <Image source={FEATURE_PANEL.heart.compassBg} style={styles.compassBgImage} resizeMode="contain" />

              {DIRECTIONS.map((dir, i) => {
                const isLucky = luckyDirs.includes(dir);
                const isDanger = dangerDirs.includes(dir);
                const angle = DIR_ANGLES[i];
                const radius = 70;
                const rad = (angle - 90) * (Math.PI / 180);
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                return (
                  <View
                    key={dir}
                    style={[
                      styles.dirLabel,
                      { transform: [{ translateX: x }, { translateY: y }] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dirText,
                        isLucky && styles.dirLucky,
                        isDanger && styles.dirDanger,
                      ]}
                    >
                      {tDir(dir)}
                    </Text>
                    {isLucky && <Text style={styles.dirDot}>●</Text>}
                  </View>
                );
              })}
            </View>

            {/* Needle overlays compass center, does NOT rotate with compass */}
            <Image source={EFFECTS.compassNeedle} style={styles.needleImage} resizeMode="contain" />
          </View>

          <Text style={styles.compassNote}>
            {t('heart.compassTitle')} · {shichen.name} · {Math.round(heading)}°
          </Text>
        </View>

        {/* ═══ 吉凶方位 ═══ */}
        <View style={styles.dirSummary}>
          <View style={styles.dirBox}>
            <Text style={styles.dirBoxTitle}>{t('heart.luckyDir')}</Text>
            {luckyDirs.length > 0 ? (
              <Text style={styles.dirBoxLucky}>{luckyDirs.map(d => tDir(d)).join(', ')}</Text>
            ) : (
              <Text style={styles.dirBoxText}>{t('heart.calculating')}</Text>
            )}
          </View>
          <View style={styles.dirBox}>
            <Text style={styles.dirBoxTitle}>{t('heart.dangerDir')}</Text>
            {dangerDirs.length > 0 ? (
              <Text style={styles.dirBoxDanger}>{dangerDirs.slice(0, 2).map(d => tDir(d)).join(', ')}</Text>
            ) : (
              <Text style={styles.dirBoxText}>{t('heart.calculating')}</Text>
            )}
          </View>
        </View>

        {/* ═══ 分析結果 ═══ */}
        {showResult && (
          <View>
            <View style={styles.petReadingCard}>
              <View style={styles.petReadingHeader}>
                {petAvatarImg ? (
                  <Image source={petAvatarImg} style={styles.petReadingAvatar} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
                )}
                <Text style={styles.petReadingLabel}>{t('heart.locationAnalysis')}</Text>
              </View>
              <Text style={styles.petReadingText}>
                {(aiResult as any)?.petMessage || aiResult?.location_analysis || narration.spokenText}
              </Text>
            </View>

            {/* New format: luckyItems pills */}
            {(aiResult as any)?.luckyItems && (aiResult as any).luckyItems.length > 0 && (
              <View style={styles.tipsCard}>
                {(aiResult as any).luckyItems.map((item: any, i: number) => (
                  <View key={i} style={styles.tipItem}>
                    <Text style={styles.tipIcon}>{item.emoji}</Text>
                    <Text style={styles.tipText}>{item.label}：{item.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Old format fallback: tips array */}
            {!(aiResult as any)?.luckyItems && aiResult?.tips && aiResult.tips.length > 0 && (
              <View style={styles.tipsCard}>
                <Text style={styles.sectionLabel}>{t('heart.tips')}</Text>
                {aiResult.tips.map((tip, i) => (
                  <View key={i} style={styles.tipItem}>
                    <Text style={styles.tipIcon}>{tip.icon}</Text>
                    <Text style={styles.tipText}>{tip.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {aiResult?.seat_advice && (
              <View style={styles.resultCard}>
                <Text style={styles.sectionLabel}>{t('heart.seatAdvice', { defaultValue: '座位建議' })}</Text>
                <Text style={styles.resultText}>{aiResult.seat_advice}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ═══ Fixed bottom analyze button ═══ */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.analyzeButton,
            isAnalyzing && styles.analyzeButtonLoading,
            pressed && { opacity: 0.85 },
          ]}
          onPress={startAnalysis}
          disabled={isAnalyzing}
        >
          {!isAnalyzing && <Image source={FEATURE_PANEL.heart.btnAnalyze} style={styles.analyzeBtnIcon} resizeMode="contain" />}
          <Text style={styles.analyzeText}>
            {isAnalyzing ? t('heart.analyzing') : t('heart.analyzeButton')}
          </Text>
        </Pressable>
      </View>
    </View>
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
  outerContainer: { flex: 1 },
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 8 },
  bottomBar: { paddingHorizontal: Spacing.lg, paddingBottom: 8 },

  gpsCard: {
    padding: 10, borderRadius: 12,
    backgroundColor: 'rgba(100,200,120,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,200,120,0.12)',
    marginBottom: 10,
  },
  gpsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  gpsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.fengshui },
  gpsText: { fontSize: 13, color: Colors.fengshui },
  locationNameInline: { fontSize: 13, color: Colors.textMuted, marginLeft: 'auto' },
  petSenseInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  petSenseTextSmall: { fontSize: 13, color: Colors.pet, fontFamily: Fonts.serif },

  compassCard: { alignItems: 'center', marginBottom: 12 },
  compassContainer: {
    width: 200, height: 200,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  compass: {
    width: 200, height: 200,
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute',
  },
  compassBgImage: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
  },
  dirLabel: { position: 'absolute', alignItems: 'center' },
  dirText: { fontSize: 14, color: Colors.textDark, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  dirLucky: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  dirDanger: { color: Colors.danger },
  dirDot: { fontSize: 6, color: Colors.primary, marginTop: -2 },
  needleImage: {
    width: 32, height: 80,
    position: 'absolute',
  },
  petSenseAvatar: { width: 40, height: 40, borderRadius: 20 },
  petReadingAvatar: { width: 36, height: 36, borderRadius: 18 },
  analyzeBtnIcon: { width: 48, height: 48 },
  compassNote: { fontSize: 13, color: Colors.textDarkest, marginTop: 8 },

  dirSummary: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  dirBox: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.16)',
    alignItems: 'center',
  },
  dirBoxTitle: { fontSize: 13, color: Colors.textDark, marginBottom: 6, fontFamily: Fonts.serif },
  dirBoxText: { fontSize: 13, color: Colors.textMuted },
  dirBoxLucky: { fontSize: 15, color: Colors.primary, fontFamily: Fonts.serifBold },
  dirBoxDanger: { fontSize: 15, color: Colors.danger, fontFamily: Fonts.serifBold },

  analyzeButton: {
    flexDirection: 'row', gap: 10,
    padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.30)',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  analyzeButtonLoading: { opacity: 0.6 },
  analyzeText: { fontSize: 16, color: '#4ADE80', fontWeight: '700', letterSpacing: 1 },

  petReadingCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 16,
  },
  petReadingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  petReadingLabel: { fontSize: 14, color: Colors.pet, fontWeight: '600', letterSpacing: 2 },
  petReadingText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  sectionLabel: { fontSize: 14, color: Colors.textMuted, letterSpacing: 2, marginBottom: 12, fontFamily: Fonts.serif },
  resultCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 14,
  },
  resultText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  tipsCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.14)',
    marginBottom: 14,
  },
  tipItem: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  tipIcon: { fontSize: 16 },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, flex: 1 },

  noteText: { fontSize: 13, color: Colors.textDarkest, textAlign: 'center', fontStyle: 'italic' },

  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  closeBtnText: { fontSize: 18, color: Colors.textSecondary },
});
