// ═══════════════════════════════════════
// 靈心模式 — GPS + 羅盤 + 風水分析（真實裝置感測器）
// ═══════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { useUserStore } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
import { generateQimenChart } from '@/services/qimen-engine';
import { getCurrentShichen } from '@/services/bazi-engine';
import { analyzeFengShui, type FengShuiResult } from '@/services/claude-api';
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
  onQuotaExhausted: () => void;
}

export default function PetHeartMode({ onQuotaExhausted }: PetHeartModeProps) {
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
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petCreature = usePetStore(s => s.creature) || '水龍';
  const petElement = usePetStore(s => s.element) || '水';
  const petLevel = usePetStore(s => s.level);

  const petInfo: PetInfo = { name: petName, type: petCreature, element: petElement, emoji: petEmoji, level: petLevel };

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

  // 取得 GPS 位置
  useEffect(() => {
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
  }, []);

  // 磁力計羅盤
  useEffect(() => {
    const sub = Magnetometer.addListener(data => {
      const { x, y } = data;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      setHeading((angle + 360) % 360);
    });
    Magnetometer.setUpdateInterval(200);
    return () => sub.remove();
  }, []);

  const startAnalysis = useCallback(async () => {
    const canUse = useFeature('body', petLevel);
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
    } catch {
      Alert.alert(t('heart.analysisFailed', { defaultValue: '分析失敗，請重試' }));
    } finally {
      setIsAnalyzing(false);
    }
  }, [useFeature, petLevel, onQuotaExhausted, location, heading, locationName, bazi, t]);

  const coordText = location
    ? `${location.lat.toFixed(3)}°N ${location.lng.toFixed(3)}°E`
    : t('heart.locating', { defaultValue: '定位中...' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ═══ GPS 狀態 ═══ */}
      <View style={styles.gpsCard}>
        <View style={styles.gpsHeader}>
          <View style={[styles.gpsDot, !location && { backgroundColor: Colors.textDarkest }]} />
          <Text style={styles.gpsText}>
            {location ? t('heart.gpsActive') : locationError ? t('heart.gpsError', { defaultValue: 'GPS 無法使用' }) : t('heart.locating', { defaultValue: '定位中...' })}
          </Text>
        </View>
        <Text style={styles.gpsCoord}>{coordText}</Text>
      </View>

      {locationName !== '' && (
        <Text style={styles.locationName}>{locationName}</Text>
      )}

      {/* ═══ 靈寵感應提示 ═══ */}
      <View style={styles.petSenseCard}>
        <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
        <Text style={styles.petSenseText}>
          {t('heart.petSensing', { petName })}
        </Text>
      </View>

      {/* ═══ 羅盤 ═══ */}
      <View style={styles.compassCard}>
        <View style={[styles.compass, { transform: [{ rotate: `${-heading}deg` }] }]}>
          <View style={styles.compassRing} />

          {DIRECTIONS.map((dir, i) => {
            const isLucky = luckyDirs.includes(dir);
            const isDanger = dangerDirs.includes(dir);
            const angle = DIR_ANGLES[i];
            const radius = 65;
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

          <View style={styles.needle} />
          <View style={styles.needleCenter} />
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

      {/* ═══ 分析按鈕 ═══ */}
      <Pressable
        style={({ pressed }) => [
          styles.analyzeButton,
          isAnalyzing && styles.analyzeButtonLoading,
          pressed && { opacity: 0.7 },
        ]}
        onPress={startAnalysis}
        disabled={isAnalyzing}
      >
        <Text style={styles.analyzeText}>
          {isAnalyzing ? `🔄 ${t('heart.analyzing')}` : `🧭 ${t('heart.analyzeButton')}`}
        </Text>
      </Pressable>

      {/* ═══ 分析結果 ═══ */}
      {showResult && (
        <View>
          <View style={styles.petReadingCard}>
            <View style={styles.petReadingHeader}>
              <Text style={{ fontSize: 24 }}>{petEmoji}</Text>
              <Text style={styles.petReadingLabel}>{t('heart.locationAnalysis')}</Text>
            </View>
            <Text style={styles.petReadingText}>
              {aiResult?.location_analysis || narration.spokenText}
            </Text>
          </View>

          {aiResult?.tips && aiResult.tips.length > 0 && (
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

          <Text style={styles.noteText}>{t('heart.note')}</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  petSenseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 16,
  },
  petSenseText: { fontSize: 13, color: Colors.pet, flex: 1, fontFamily: Fonts.serif },

  gpsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(100,200,120,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,200,120,0.12)',
    marginBottom: 8,
  },
  gpsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.fengshui },
  gpsText: { fontSize: 12, color: Colors.fengshui },
  gpsCoord: { fontSize: 10, color: Colors.textDarkest },
  locationName: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginBottom: 16 },

  compassCard: { alignItems: 'center', marginBottom: 20 },
  compass: {
    width: 180, height: 180,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  compassRing: {
    position: 'absolute', width: 170, height: 170, borderRadius: 85,
    borderWidth: 2, borderColor: 'rgba(232,197,71,0.2)',
  },
  dirLabel: { position: 'absolute', alignItems: 'center' },
  dirText: { fontSize: 11, color: Colors.textDark, fontWeight: '600' },
  dirLucky: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  dirDanger: { color: Colors.danger },
  dirDot: { fontSize: 6, color: Colors.primary, marginTop: -2 },
  needle: {
    width: 3, height: 50, borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute', top: 40,
  },
  needleCenter: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
    position: 'absolute',
  },
  compassNote: { fontSize: 10, color: Colors.textDarkest, marginTop: 8 },

  dirSummary: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  dirBox: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    alignItems: 'center',
  },
  dirBoxTitle: { fontSize: 11, color: Colors.textDark, marginBottom: 6 },
  dirBoxText: { fontSize: 13, color: Colors.textMuted },
  dirBoxLucky: { fontSize: 15, color: Colors.primary, fontFamily: Fonts.serifBold },
  dirBoxDanger: { fontSize: 15, color: Colors.danger, fontFamily: Fonts.serifBold },

  analyzeButton: {
    padding: 16, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(100,200,120,0.08)',
    borderWidth: 1, borderColor: 'rgba(100,200,120,0.2)',
    marginBottom: 20,
  },
  analyzeButtonLoading: { opacity: 0.6 },
  analyzeText: { fontSize: 15, color: Colors.fengshui, fontWeight: '600', letterSpacing: 1 },

  petReadingCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 16,
  },
  petReadingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  petReadingLabel: { fontSize: 12, color: Colors.pet, fontWeight: '600', letterSpacing: 2 },
  petReadingText: { fontSize: 14, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  sectionLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 2, marginBottom: 12, fontFamily: Fonts.serif },
  resultCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 14,
  },
  resultText: { fontSize: 13, color: '#a0b8d0', lineHeight: 24, fontFamily: Fonts.serif },

  tipsCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.08)',
    marginBottom: 14,
  },
  tipItem: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  tipIcon: { fontSize: 16 },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, flex: 1 },

  noteText: { fontSize: 11, color: Colors.textDarkest, textAlign: 'center', fontStyle: 'italic' },
});
