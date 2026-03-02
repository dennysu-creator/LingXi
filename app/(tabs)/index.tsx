// ═══════════════════════════════════════
// 首頁 — 運勢總覽 + 靈寵 + 奇門盤 + 紫微
// ═══════════════════════════════════════

import { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing, BorderRadius } from '@/config/theme';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '@/config/constants';
import { useUserStore } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
import { generateQimenChart, type QimenChart } from '@/services/qimen-engine';
import { getCurrentShichen } from '@/services/bazi-engine';
import { calculateUnifiedFortune, type UnifiedFortuneResult } from '@/services/unified-fortune-engine';
import { generateLocalPetNarration, type PetInfo } from '@/services/pet-narrator';
import LanguageSelector from '@/components/LanguageSelector';

// ─── 農曆日期工具（簡化版，正式版應使用 lunar-javascript） ───
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '臘'] as const;
const LUNAR_DAYS_PREFIX = ['', '初', '初', '初', '初', '初', '初', '初', '初', '初', '初', '十', '十', '十', '十', '十', '十', '十', '十', '十', '十', '廿', '廿', '廿', '廿', '廿', '廿', '廿', '廿', '廿', '三'] as const;
const LUNAR_DAYS_SUFFIX = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const;

function getLunarDateText(date: Date): string {
  const year = date.getFullYear();
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const yearGanZhi = `${HEAVENLY_STEMS[stemIndex]}${EARTHLY_BRANCHES[branchIndex]}`;
  const month = date.getMonth();
  const day = date.getDate();
  const monthStr = `${LUNAR_MONTHS[month]}月`;
  const dayStr = day <= 10
    ? `${LUNAR_DAYS_PREFIX[day]}${LUNAR_DAYS_SUFFIX[day]}`
    : day === 20 ? '二十'
    : day === 30 ? '三十'
    : `${LUNAR_DAYS_PREFIX[day]}${LUNAR_DAYS_SUFFIX[day]}`;
  return `${yearGanZhi}年${monthStr}${dayStr}`;
}

// ─── 分數條 ───
function ScoreBar({
  label,
  score,
  color = Colors.primary,
}: {
  label: string;
  score: number;
  color?: string;
}) {
  return (
    <View style={scoreStyles.row}>
      <Text style={scoreStyles.label}>{label}</Text>
      <View style={scoreStyles.track}>
        <View style={[scoreStyles.fill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[scoreStyles.value, { color }]}>{score}</Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 9, color: '#5a6a7a', width: 28, textAlign: 'right' },
  track: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  value: { fontSize: 9, width: 22 },
});

// ─── 奇門遁甲九宮格 ───
function QimenGrid({ chart, pulseStyle }: { chart: QimenChart; pulseStyle?: any }) {
  return (
    <View style={gridStyles.container}>
      {chart.palaces.map((palace, i) => {
        const isActive = palace.isAuspicious && palace.gate !== '—';
        return (
          <View key={i} style={[gridStyles.cell, isActive && gridStyles.cellActive]}>
            {isActive && pulseStyle ? (
              <Reanimated.View style={[gridStyles.activeDot, pulseStyle]} />
            ) : isActive ? (
              <View style={gridStyles.activeDot} />
            ) : null}
            <Text style={[gridStyles.direction, isActive && gridStyles.directionActive]}>
              {palace.direction}
            </Text>
            <Text style={[gridStyles.gate, isActive && gridStyles.gateActive]}>
              {palace.gate}
            </Text>
            <Text style={gridStyles.star}>{palace.star}</Text>
          </View>
        );
      })}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: 'rgba(232,197,71,0.03)', borderRadius: 14,
    padding: 8, borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)', gap: 4,
  },
  cell: {
    width: '31%', flexGrow: 1, paddingVertical: 8, paddingHorizontal: 4,
    borderRadius: 8, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)',
    position: 'relative',
  },
  cellActive: {
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderColor: 'rgba(232,197,71,0.25)',
  },
  activeDot: {
    position: 'absolute', top: 4, right: 4,
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  direction: { fontSize: 10, color: '#5a5040', fontWeight: '600' },
  directionActive: { color: Colors.primary },
  gate: { fontSize: 13, color: '#8b7d5e', fontWeight: '700', marginVertical: 2 },
  gateActive: { color: Colors.primary },
  star: { fontSize: 9, color: '#5a5040' },
});

// ─── 主頁面 ───
export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const planType = useUserStore((s) => s.planType);
  const userName = useUserStore((s) => s.userName);
  const bazi = useUserStore((s) => s.bazi);
  const ziwei = useUserStore((s) => s.ziwei);
  const astrology = useUserStore((s) => s.astrology);
  const petName = usePetStore((s) => s.name) || '靈寵';
  const petEmoji = usePetStore((s) => s.emoji) || '🐉';
  const petLevel = usePetStore((s) => s.level);
  const petType = usePetStore((s) => s.creature) || '水龍';
  const petElement = usePetStore((s) => s.element) || '水';
  const petPower = usePetStore((s) => s.power);
  const petAffinity = usePetStore((s) => s.affinity);
  const petWisdom = usePetStore((s) => s.wisdom);

  const petInfo: PetInfo = { name: petName, type: petType, element: petElement, emoji: petEmoji, level: petLevel };

  // 靈寵浮動動畫
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [floatY]);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // 吉門脈動動畫
  const pulseOpacity = useSharedValue(0.5);
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 }),
      ),
      -1,
    );
  }, [pulseOpacity]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // 農曆日期
  const lunarDate = useMemo(() => getLunarDateText(new Date()), []);

  // 當前時辰
  const shichen = useMemo(() => getCurrentShichen(), []);

  // 奇門遁甲盤
  const qimenChart = useMemo(() => generateQimenChart(new Date()), []);

  // 統一運勢引擎（四引擎合一）
  const unifiedFortune = useMemo<UnifiedFortuneResult>(() => {
    if (bazi && ziwei && astrology) {
      return calculateUnifiedFortune(bazi, ziwei, qimenChart, astrology);
    }
    // 未完成 onboarding 時使用預設值
    return {
      scores: { wealth: 65, love: 60, career: 70, health: 68, study: 62 },
      overallScore: 65,
      overallLevel: '小吉',
      luckyDirections: ['東南', '正南'],
      luckyColors: ['#1a3a5c', '#4a90d9', '#87ceeb'],
      luckyNumbers: [3, 6, 8],
      luckyElement: '水',
      avoidElement: '火',
      baziHighlight: '',
      ziweiHighlight: '',
      qimenHighlight: '',
      astrologyHighlight: '',
    };
  }, [bazi, ziwei, qimenChart, astrology]);

  // 運勢分數列表
  const fortuneScores = useMemo(() => [
    { labelKey: 'home.wealth', score: unifiedFortune.scores.wealth, icon: '💰' },
    { labelKey: 'home.love', score: unifiedFortune.scores.love, icon: '🌸' },
    { labelKey: 'home.career', score: unifiedFortune.scores.career, icon: '📈' },
    { labelKey: 'home.health', score: unifiedFortune.scores.health, icon: '💚' },
    { labelKey: 'home.study', score: unifiedFortune.scores.study, icon: '📚' },
  ], [unifiedFortune]);

  // 綜合運勢等級
  const fortuneLevel = unifiedFortune.overallLevel;

  // 奇門盤摘要行
  const qimenSummaryLines = useMemo(() => {
    return qimenChart.summary.split('\n').filter(Boolean);
  }, [qimenChart]);

  // 靈寵問候
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return t('home.greeting.night');
    if (hour < 11) return t('home.greeting.morning');
    if (hour < 14) return t('home.greeting.noon');
    if (hour < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  }, [t]);

  // 靈寵運勢旁白
  const fortuneNarration = useMemo(() => {
    const scores: Record<string, number> = {};
    fortuneScores.forEach(f => {
      scores[t(f.labelKey)] = f.score;
    });
    return generateLocalPetNarration({
      feature: 'fortune',
      pet: petInfo,
      data: {
        level: fortuneLevel,
        topDirection: unifiedFortune.luckyDirections[0] || '東南',
        scores,
      },
    });
  }, [fortuneScores, fortuneLevel, unifiedFortune, petInfo, t]);

  // 會員標籤
  const memberLabel = planType === 'supreme' ? t('home.memberSupreme')
    : planType === 'member' ? t('home.memberPaid')
    : t('home.memberFree');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ═══ Header ═══ */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>{t('app.name')}</Text>
          {userName ? (
            <Text style={styles.greetText}>{userName}，{greeting}</Text>
          ) : null}
          <Text style={styles.dateText}>
            {lunarDate} · {shichen.name}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{memberLabel}</Text>
        </View>
      </View>

      {/* ═══ 語言選擇 ═══ */}
      <View style={styles.langRow}>
        <LanguageSelector />
      </View>

      {/* ═══ 靈寵卡片 ═══ */}
      <Pressable
        style={styles.petCard}
        onPress={() => router.push('/(tabs)/pet')}
      >
        <View style={styles.petCardGlow} />
        <View style={styles.petCardContent}>
          <Reanimated.Text style={[styles.petEmoji, floatStyle]}>
            {petEmoji}
          </Reanimated.Text>
          <View style={styles.petInfo}>
            <View style={styles.petNameRow}>
              <Text style={styles.petName}>{petName}</Text>
              <View style={styles.petLevelBadge}>
                <Text style={styles.petLevelText}>
                  {t('pet.level')}{petLevel} {petType}
                </Text>
              </View>
            </View>
            <Text style={styles.petMessage} numberOfLines={2}>
              {fortuneNarration.spokenText}
            </Text>
            <View style={styles.petStats}>
              <View style={styles.petStatItem}>
                <ScoreBar label={t('pet.power')} score={petPower || 78} color={Colors.pet} />
              </View>
              <View style={styles.petStatItem}>
                <ScoreBar label={t('pet.affinity')} score={petAffinity || 92} color={Colors.love} />
              </View>
              <View style={styles.petStatItem}>
                <ScoreBar label={t('pet.wisdom')} score={petWisdom || 65} color={Colors.outfit} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>

      {/* ═══ 今日綜合運勢（統一引擎） ═══ */}
      <View style={styles.fortuneCard}>
        <View style={styles.fortuneHeader}>
          <Text style={styles.sectionLabel}>{t('home.todayFortune')}</Text>
          <Text style={styles.fortuneLevel}>{fortuneLevel}</Text>
        </View>
        <View style={styles.fortuneGrid}>
          {fortuneScores.map((f, i) => (
            <View key={i} style={styles.fortuneItem}>
              <Text style={styles.fortuneIcon}>{f.icon}</Text>
              <Text style={styles.fortuneItemLabel}>{t(f.labelKey)}</Text>
              <Text style={styles.fortuneItemScore}>{f.score}</Text>
            </View>
          ))}
        </View>

        {/* 吉利資訊列 */}
        <View style={styles.luckyRow}>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>{t('home.luckyElement')}</Text>
            <Text style={styles.luckyValue}>{unifiedFortune.luckyElement}</Text>
          </View>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>{t('home.luckyDirection')}</Text>
            <Text style={styles.luckyValue}>{unifiedFortune.luckyDirections.slice(0, 2).join('·')}</Text>
          </View>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>{t('home.luckyColor')}</Text>
            <View style={styles.luckyColorRow}>
              {unifiedFortune.luckyColors.slice(0, 3).map((color, ci) => (
                <View key={ci} style={[styles.luckyColorDot, { backgroundColor: color }]} />
              ))}
            </View>
          </View>
          <View style={styles.luckyItem}>
            <Text style={styles.luckyLabel}>{t('home.luckyNumber')}</Text>
            <Text style={styles.luckyValue}>{unifiedFortune.luckyNumbers.slice(0, 3).join('·')}</Text>
          </View>
        </View>
      </View>

      {/* ═══ 西洋占星卡片 ═══ */}
      {astrology && (
        <View style={styles.astroCard}>
          <View style={styles.astroHeader}>
            <Text style={styles.sectionLabel}>{t('astrology.title')}</Text>
            <Text style={styles.astroSign}>{astrology.signEmoji} {astrology.signChinese}</Text>
          </View>
          <View style={styles.astroContent}>
            <View style={styles.astroItem}>
              <Text style={styles.astroItemLabel}>{t('astrology.element')}</Text>
              <Text style={styles.astroItemValue}>{astrology.wuxingElement}</Text>
            </View>
            <View style={styles.astroItem}>
              <Text style={styles.astroItemLabel}>{t('astrology.planet')}</Text>
              <Text style={styles.astroItemValue}>{astrology.rulingPlanet}</Text>
            </View>
            <View style={styles.astroItem}>
              <Text style={styles.astroItemLabel}>{t('astrology.modality')}</Text>
              <Text style={styles.astroItemValue}>
                {astrology.modality === 'cardinal' ? t('astrology.cardinal')
                  : astrology.modality === 'fixed' ? t('astrology.fixed')
                  : t('astrology.mutable')}
              </Text>
            </View>
          </View>
          <Text style={styles.astroHighlight}>
            ✦ {unifiedFortune.astrologyHighlight}
          </Text>
        </View>
      )}

      {/* ═══ 紫微命盤摘要 ═══ */}
      {ziwei && (
        <View style={styles.ziweiCard}>
          <View style={styles.ziweiHeader}>
            <Text style={styles.sectionLabel}>{t('home.ziweiCard')}</Text>
          </View>
          <View style={styles.ziweiContent}>
            <View style={styles.ziweiItem}>
              <Text style={styles.ziweiItemLabel}>{t('home.mingGong')}</Text>
              <Text style={styles.ziweiItemValue}>{ziwei.mingGong.mainStars[0]?.name || '—'}</Text>
            </View>
            <View style={styles.ziweiItem}>
              <Text style={styles.ziweiItemLabel}>{t('home.personality')}</Text>
              <Text style={styles.ziweiItemDesc} numberOfLines={2}>{ziwei.personality}</Text>
            </View>
            <View style={styles.ziweiItem}>
              <Text style={styles.ziweiItemLabel}>{t('home.careerDir')}</Text>
              <Text style={styles.ziweiItemDesc} numberOfLines={2}>{ziwei.careerAptitude}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ═══ 奇門遁甲九宮盤 ═══ */}
      <View style={styles.qimenCard}>
        <View style={styles.qimenHeader}>
          <Text style={styles.sectionLabel}>{t('home.qimenTitle')} · {shichen.name}</Text>
          <Text style={styles.qimenTime}>{shichen.hours}</Text>
        </View>
        <QimenGrid chart={qimenChart} pulseStyle={pulseStyle} />
        <View style={styles.qimenSummary}>
          {qimenSummaryLines.map((line, i) => (
            <Text key={i} style={styles.qimenSummaryText}>✦ {line}</Text>
          ))}
        </View>
      </View>

      {/* ═══ 今日穿搭建議（精簡版） ═══ */}
      <View style={styles.outfitCard}>
        <Text style={styles.sectionLabel}>{t('home.outfitCard')}</Text>
        <View style={styles.outfitContent}>
          <View style={styles.outfitColorRow}>
            {unifiedFortune.luckyColors.slice(0, 3).map((color, ci) => (
              <View key={ci} style={[styles.outfitColorDot, { backgroundColor: color }]} />
            ))}
          </View>
          <Text style={styles.outfitHint}>
            {t('home.outfitHint')}（{unifiedFortune.luckyElement}）
          </Text>
        </View>
      </View>

      {/* ═══ 快速功能入口 ═══ */}
      <View style={styles.quickActions}>
        {([
          {
            icon: '👁',
            labelKey: 'home.quickActions.eye',
            subKey: 'home.quickActions.eyeSub',
            color: Colors.primary,
            route: '/(tabs)/eye',
          },
          {
            icon: '🌍',
            labelKey: 'home.quickActions.body',
            subKey: 'home.quickActions.bodySub',
            color: Colors.pet,
            route: '/(tabs)/heart',
          },
          {
            icon: '🏮',
            labelKey: 'home.quickActions.soul',
            subKey: 'home.quickActions.soulSub',
            color: '#ff9b5e',
            route: '/(tabs)/pearl',
          },
        ] as const).map((action, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: `${action.color}0a`,
                borderColor: `${action.color}18`,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => router.push(action.route as any)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={[styles.actionLabel, { color: action.color }]}>
              {t(action.labelKey)}
            </Text>
            <Text style={styles.actionSub}>{t(action.subKey)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── 樣式 ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: 60 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Spacing.lg,
  },
  appTitle: { fontFamily: Fonts.brush, fontSize: 28, color: Colors.primary },
  greetText: {
    fontSize: 13, color: Colors.textSecondary,
    marginTop: 2, fontFamily: Fonts.serif,
  },
  dateText: { fontSize: 11, color: Colors.textDarkest, marginTop: 2, letterSpacing: 1 },
  badge: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },
  badgeText: { fontSize: 11, color: Colors.primary },
  langRow: { marginBottom: 12 },

  // Pet Card
  petCard: {
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    padding: Spacing.lg, marginBottom: 16,
    position: 'relative', overflow: 'hidden',
  },
  petCardGlow: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(100,180,255,0.08)',
  },
  petCardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  petEmoji: { fontSize: 52 },
  petInfo: { flex: 1 },
  petNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  petName: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.serifBold },
  petLevelBadge: {
    paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10,
    backgroundColor: 'rgba(100,180,255,0.15)',
  },
  petLevelText: { fontSize: 10, color: Colors.pet },
  petMessage: { fontSize: 12, color: '#7a9ab8', marginTop: 6, lineHeight: 18 },
  petStats: { flexDirection: 'row', gap: 12, marginTop: 8 },
  petStatItem: { flex: 1 },

  // Fortune Card
  fortuneCard: {
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    borderRadius: BorderRadius.lg, padding: 16, marginBottom: 16,
  },
  fortuneHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 2, fontFamily: Fonts.serif },
  fortuneLevel: { fontSize: 22, color: Colors.primary, fontFamily: Fonts.brush },
  fortuneGrid: { flexDirection: 'row', gap: 6 },
  fortuneItem: {
    flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    backgroundColor: 'rgba(232,197,71,0.04)', borderRadius: 10,
  },
  fortuneIcon: { fontSize: 20, marginBottom: 4 },
  fortuneItemLabel: { fontSize: 10, color: Colors.textDark },
  fortuneItemScore: {
    fontSize: 16, color: Colors.primary, fontWeight: '700', fontFamily: Fonts.serif,
  },

  // Lucky Info Row
  luckyRow: {
    flexDirection: 'row', gap: 6, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(232,197,71,0.08)',
  },
  luckyItem: { flex: 1, alignItems: 'center' },
  luckyLabel: { fontSize: 9, color: Colors.textDarkest, marginBottom: 4 },
  luckyValue: { fontSize: 11, color: Colors.primary, fontFamily: Fonts.serif },
  luckyColorRow: { flexDirection: 'row', gap: 3 },
  luckyColorDot: { width: 14, height: 14, borderRadius: 7 },

  // Astrology Card
  astroCard: {
    backgroundColor: 'rgba(100,200,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,200,255,0.1)',
    borderRadius: BorderRadius.lg, padding: 16, marginBottom: 16,
  },
  astroHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  astroSign: { fontSize: 16, color: '#7ac4e8', fontFamily: Fonts.serifBold },
  astroContent: { flexDirection: 'row', gap: 8 },
  astroItem: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(100,200,255,0.06)',
  },
  astroItemLabel: { fontSize: 10, color: Colors.textDark, marginBottom: 4 },
  astroItemValue: { fontSize: 14, color: '#7ac4e8', fontFamily: Fonts.serifBold },
  astroHighlight: {
    fontSize: 11, color: '#8ab8d4', marginTop: 10,
    lineHeight: 18, fontFamily: Fonts.serif,
  },

  // Ziwei Card
  ziweiCard: {
    backgroundColor: 'rgba(160,100,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(160,100,255,0.1)',
    borderRadius: BorderRadius.lg, padding: 16, marginBottom: 16,
  },
  ziweiHeader: { marginBottom: 10 },
  ziweiContent: { flexDirection: 'row', gap: 8 },
  ziweiItem: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(160,100,255,0.06)',
  },
  ziweiItemLabel: { fontSize: 10, color: Colors.textDark, marginBottom: 4 },
  ziweiItemValue: { fontSize: 15, color: '#a78bfa', fontFamily: Fonts.serifBold },
  ziweiItemDesc: { fontSize: 10, color: '#b0a0c8', textAlign: 'center', lineHeight: 14 },

  // Qimen Card
  qimenCard: {
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.08)',
    borderRadius: BorderRadius.lg, padding: 14, marginBottom: 16,
  },
  qimenHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  qimenTime: { fontSize: 10, color: Colors.textDarkest },
  qimenSummary: {
    marginTop: 10, padding: 10,
    backgroundColor: 'rgba(232,197,71,0.05)', borderRadius: 8,
  },
  qimenSummaryText: { fontSize: 12, color: '#a0956a', lineHeight: 20 },

  // Outfit Card
  outfitCard: {
    backgroundColor: 'rgba(160,100,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(160,100,255,0.08)',
    borderRadius: BorderRadius.lg, padding: 16, marginBottom: 16,
  },
  outfitContent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  outfitColorRow: { flexDirection: 'row', gap: 6 },
  outfitColorDot: { width: 24, height: 24, borderRadius: 12 },
  outfitHint: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.serif },

  // Quick Actions
  quickActions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1, paddingVertical: 16, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 13, fontWeight: '600', fontFamily: Fonts.serif },
  actionSub: { fontSize: 9, color: Colors.textDarkest, marginTop: 2 },
});
