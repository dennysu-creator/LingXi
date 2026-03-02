// ═══════════════════════════════════════
// 開機引導頁 — 語言選擇、輸入生辰、召喚靈寵
// Step 0: 語言選擇
// Step 1: 歡迎
// Step 2: 姓名
// Step 3: 出生資料（滾輪選擇器）+ 性別 + 時辰
// Step 4: 靈寵召喚結果
// ═══════════════════════════════════════

import { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore, type CalendarType } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
// determinePetElement 已棄用，改用節氣配對
import { Colors, Fonts, Spacing } from '@/config/theme';
import { SHICHEN } from '@/config/constants';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import WheelPicker from '@/components/WheelPicker';

// 時辰選項
const SHICHEN_OPTIONS = SHICHEN.map(s => ({
  name: s.name,
  hours: s.hours,
  hourValue: parseInt(s.hours.split(':')[0]) || parseInt(s.hours.split('-')[0]) || 0,
}));

// 年份範圍
const YEAR_START = 1930;
const YEAR_END = 2026;
const YEARS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => (YEAR_START + i).toString());
const DEFAULT_YEAR_INDEX = 1992 - YEAR_START; // 預設 1992

// 月份
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

// 日期（需根據月份動態調整）
function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [yearIndex, setYearIndex] = useState(DEFAULT_YEAR_INDEX);
  const [monthIndex, setMonthIndex] = useState(5); // 預設六月
  const [dayIndex, setDayIndex] = useState(14);     // 預設15日
  const [selectedShichen, setSelectedShichen] = useState(-1); // -1 = 不知道

  const setOnboarding = useUserStore(s => s.setOnboarding);
  const initPet = usePetStore(s => s.initPet);

  const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code: code as SupportedLanguage,
    ...info,
  }));

  const switchLanguage = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
  };

  // 動態計算當月天數
  const selectedYear = YEAR_START + yearIndex;
  const selectedMonth = monthIndex + 1;
  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  );
  const DAYS = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
    [daysInMonth],
  );

  // 確保 dayIndex 不超過當月天數
  const safeDayIndex = Math.min(dayIndex, daysInMonth - 1);

  const handleSubmit = () => {
    const y = selectedYear;
    const m = selectedMonth;
    const d = safeDayIndex + 1;
    if (!userName.trim()) return;

    // 不知道時辰 → 午時（11 點）
    const hourValue = selectedShichen >= 0
      ? SHICHEN_OPTIONS[selectedShichen]?.hourValue ?? 11
      : 11;

    setOnboarding({
      name: userName.trim(),
      year: y, month: m, day: d,
      hour: hourValue,
      gender,
      calendarType,
    });

    // 依出生月日配對節氣靈寵
    initPet(m, d);

    setStep(4);
  };

  const goHome = () => router.replace('/(tabs)');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ═══ Step 0: 選擇語言 ═══ */}
      {step === 0 && (
        <View style={styles.centerBox}>
          <Text style={styles.bigEmoji}>🌐</Text>
          <Text style={styles.stepTitle}>{t('onboarding.selectLanguage')}</Text>
          <Text style={styles.stepDesc}>{t('onboarding.selectLanguageDesc')}</Text>

          <View style={styles.langList}>
            {languages.map(lang => (
              <Pressable
                key={lang.code}
                style={[
                  styles.langItem,
                  i18n.language === lang.code && styles.langItemActive,
                ]}
                onPress={() => switchLanguage(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.langLabel,
                  i18n.language === lang.code && styles.langLabelActive,
                ]}>
                  {lang.nativeLabel}
                </Text>
                {i18n.language === lang.code && (
                  <Text style={styles.langCheck}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.primaryBtnText}>{t('onboarding.next')}</Text>
          </Pressable>
        </View>
      )}

      {/* ═══ Step 1: 歡迎 ═══ */}
      {step === 1 && (
        <View style={styles.centerBox}>
          <Text style={styles.bigEmoji}>🐉</Text>
          <Text style={styles.logoTitle}>{t('app.name')}</Text>
          <Text style={styles.logoSubtitle}>LING XI</Text>
          <Text style={styles.description}>
            {t('app.subtitle')}
            {'\n'}
            <Text style={styles.highlight}>— {t('app.slogan')} —</Text>
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.primaryBtnText}>{t('onboarding.welcome')}</Text>
          </Pressable>
        </View>
      )}

      {/* ═══ Step 2: 姓名 ═══ */}
      {step === 2 && (
        <View style={styles.stepBox}>
          <Text style={styles.stepTitle}>{t('onboarding.whoAreYou')}</Text>
          <Text style={styles.stepDesc}>{t('onboarding.whoDesc')}</Text>

          <Text style={styles.inputLabel}>{t('onboarding.nameLabel')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('onboarding.namePlaceholder')}
            placeholderTextColor={Colors.textDarkest}
            value={userName}
            onChangeText={setUserName}
            maxLength={20}
          />

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              !userName.trim() && styles.disabledBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => userName.trim() && setStep(3)}
            disabled={!userName.trim()}
          >
            <Text style={styles.primaryBtnText}>{t('onboarding.next')}</Text>
          </Pressable>
        </View>
      )}

      {/* ═══ Step 3: 出生資料（滾輪選擇器）+ 性別 + 時辰 ═══ */}
      {step === 3 && (
        <View style={styles.stepBox}>
          <Text style={styles.stepTitle}>{t('onboarding.birthTitle')}</Text>
          <Text style={styles.stepDesc}>{t('onboarding.birthDesc')}</Text>

          {/* 曆法切換 */}
          <Text style={styles.inputLabel}>{t('onboarding.calendarLabel')}</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, calendarType === 'solar' && styles.toggleActive]}
              onPress={() => setCalendarType('solar')}
            >
              <Text style={[styles.toggleText, calendarType === 'solar' && styles.toggleTextActive]}>
                {t('onboarding.solar')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, calendarType === 'lunar' && styles.toggleActive]}
              onPress={() => setCalendarType('lunar')}
            >
              <Text style={[styles.toggleText, calendarType === 'lunar' && styles.toggleTextActive]}>
                {t('onboarding.lunar')}
              </Text>
            </Pressable>
          </View>

          {/* 滾輪日期選擇器 */}
          <Text style={styles.inputLabel}>{t('onboarding.dateLabel')}</Text>
          <View style={styles.wheelRow}>
            <View style={styles.wheelCol}>
              <Text style={styles.wheelLabel}>{t('onboarding.year')}</Text>
              <WheelPicker
                items={YEARS}
                selectedIndex={yearIndex}
                onValueChange={setYearIndex}
                width={80}
              />
            </View>
            <View style={styles.wheelCol}>
              <Text style={styles.wheelLabel}>{t('onboarding.month')}</Text>
              <WheelPicker
                items={MONTHS}
                selectedIndex={monthIndex}
                onValueChange={setMonthIndex}
                width={60}
              />
            </View>
            <View style={styles.wheelCol}>
              <Text style={styles.wheelLabel}>{t('onboarding.day')}</Text>
              <WheelPicker
                items={DAYS}
                selectedIndex={safeDayIndex}
                onValueChange={setDayIndex}
                width={60}
              />
            </View>
          </View>

          {/* 時辰選擇 */}
          <Text style={styles.inputLabel}>{t('onboarding.hourLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shichenScroll}>
            <View style={styles.shichenRow}>
              {SHICHEN_OPTIONS.map((s, i) => (
                <Pressable
                  key={i}
                  style={[styles.shichenBtn, selectedShichen === i && styles.shichenActive]}
                  onPress={() => setSelectedShichen(i)}
                >
                  <Text style={[styles.shichenName, selectedShichen === i && styles.shichenNameActive]}>
                    {s.name}
                  </Text>
                  <Text style={styles.shichenHours}>{s.hours}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Pressable
            style={[styles.unknownBtn, selectedShichen === -1 && styles.unknownBtnActive]}
            onPress={() => setSelectedShichen(-1)}
          >
            <Text style={[styles.unknownText, selectedShichen === -1 && styles.unknownTextActive]}>
              {t('onboarding.unknownHour')}
            </Text>
          </Pressable>

          {/* 性別 */}
          <Text style={styles.inputLabel}>{t('onboarding.genderLabel')}</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, gender === 'male' && styles.toggleActive]}
              onPress={() => setGender('male')}
            >
              <Text style={styles.toggleEmoji}>♂</Text>
              <Text style={[styles.toggleText, gender === 'male' && styles.toggleTextActive]}>
                {t('onboarding.male')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, gender === 'female' && styles.toggleActive]}
              onPress={() => setGender('female')}
            >
              <Text style={styles.toggleEmoji}>♀</Text>
              <Text style={[styles.toggleText, gender === 'female' && styles.toggleTextActive]}>
                {t('onboarding.female')}
              </Text>
            </Pressable>
          </View>

          {/* 按鈕 */}
          <View style={styles.btnRow}>
            <Pressable style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>{t('onboarding.back')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn, { flex: 1 },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryBtnText}>{t('onboarding.summon')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ═══ Step 4: 靈寵召喚成功 ═══ */}
      {step === 4 && (() => {
        const petState = usePetStore.getState();
        const userState = useUserStore.getState();
        const petNameResult = petState.name || '靈寵';
        const petEmojiResult = petState.emoji || '🐉';
        const ziweiResult = userState.ziwei;
        const astrologyResult = userState.astrology;

        return (
          <View style={styles.centerBox}>
            <Text style={styles.summonEmoji}>{petEmojiResult}</Text>
            <Text style={styles.summonTitle}>{t('onboarding.petArrived')}</Text>
            <Text style={styles.summonName}>
              {t('onboarding.petBond', { petName: petNameResult })}
            </Text>
            <Text style={styles.summonDesc}>
              {t('onboarding.petWillHelp', { name: userName })}
            </Text>

            {/* 紫微命盤摘要 */}
            {ziweiResult && (
              <View style={styles.ziweiSummary}>
                <Text style={styles.ziweiTitle}>{t('pet.ziweiTitle')}</Text>
                <View style={styles.ziweiRow}>
                  <View style={styles.ziweiItem}>
                    <Text style={styles.ziweiItemLabel}>{t('ziwei.mingGong')}</Text>
                    <Text style={styles.ziweiItemValue}>{ziweiResult.mingGong.mainStars[0]?.name || '—'}</Text>
                  </View>
                  <View style={styles.ziweiItem}>
                    <Text style={styles.ziweiItemLabel}>{t('ziwei.personality')}</Text>
                    <Text style={styles.ziweiItemDesc} numberOfLines={2}>{ziweiResult.personality}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 西洋占星摘要 */}
            {astrologyResult && (
              <View style={styles.astrologySummary}>
                <Text style={styles.astrologyTitle}>{t('astrology.title')}</Text>
                <View style={styles.astrologyRow}>
                  <Text style={styles.astrologyEmoji}>{astrologyResult.signEmoji}</Text>
                  <View style={styles.astrologyInfo}>
                    <Text style={styles.astrologySign}>{astrologyResult.signChinese}</Text>
                    <Text style={styles.astrologyDetail}>
                      {t('astrology.element')}: {astrologyResult.wuxingElement} | {t('astrology.planet')}: {astrologyResult.rulingPlanetChinese}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.unlockList}>
              {[
                { lv: 1, icon: '💬', text: t('pet.basicChat') },
                { lv: 3, icon: '🔔', text: t('pet.basicChat') },
                { lv: 5, icon: '👔', text: t('home.outfitCard') },
                { lv: 8, icon: '🧭', text: t('heart.analyzeButton') },
                { lv: 10, icon: '✨', text: t('pet.evolution') },
              ].map((item, i) => (
                <View key={i} style={styles.unlockItem}>
                  <Text style={styles.unlockLv}>{t('pet.level')}{item.lv}</Text>
                  <Text style={styles.unlockIcon}>{item.icon}</Text>
                  <Text style={styles.unlockText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tierInfo}>
              <View style={styles.tierRow}>
                <Text style={styles.tierBadgeFree}>{t('onboarding.free')}</Text>
                <Text style={styles.tierDesc}>{t('onboarding.freeDesc')}</Text>
              </View>
              <View style={styles.tierRow}>
                <Text style={styles.tierBadgeMember}>{t('onboarding.member')}</Text>
                <Text style={styles.tierDesc}>{t('onboarding.memberDesc')}</Text>
              </View>
              <View style={styles.tierRow}>
                <Text style={styles.tierBadgeSupreme}>{t('onboarding.supreme')}</Text>
                <Text style={styles.tierDesc}>{t('onboarding.supremeDesc')}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.7 }]}
              onPress={goHome}
            >
              <Text style={styles.primaryBtnText}>{t('onboarding.enterApp')}</Text>
            </Pressable>
          </View>
        );
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 30, paddingTop: 80, paddingBottom: 60, minHeight: '100%' },
  centerBox: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  stepBox: { flex: 1 },

  bigEmoji: { fontSize: 72, marginBottom: 16 },
  logoTitle: {
    fontFamily: Fonts.brush, fontSize: 48, color: Colors.primary, letterSpacing: 8,
    textShadowColor: 'rgba(232,197,71,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 40,
  },
  logoSubtitle: { fontSize: 12, color: 'rgba(232,197,71,0.5)', letterSpacing: 6, marginBottom: 24 },
  description: { fontFamily: Fonts.serif, fontSize: 14, color: Colors.textMuted, lineHeight: 24, textAlign: 'center', marginBottom: 32 },
  highlight: { color: Colors.textSecondary },

  stepTitle: { fontFamily: Fonts.brush, fontSize: 28, color: Colors.primary, marginBottom: 8 },
  stepDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 16 },

  inputLabel: { fontSize: 11, color: Colors.textDark, letterSpacing: 2, marginBottom: 8, marginTop: 16 },
  textInput: {
    padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.06)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
    color: Colors.primary, fontSize: 16, fontFamily: Fonts.serif,
  },

  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.04)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
  },
  toggleActive: { backgroundColor: 'rgba(232,197,71,0.12)', borderColor: 'rgba(232,197,71,0.4)' },
  toggleEmoji: { fontSize: 18, marginBottom: 2 },
  toggleText: { fontSize: 13, color: Colors.textMuted },
  toggleTextActive: { color: Colors.primary, fontWeight: '600' },

  // Wheel picker row
  wheelRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 4,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
    padding: 10,
  },
  wheelCol: { alignItems: 'center' },
  wheelLabel: { fontSize: 10, color: Colors.textDark, marginBottom: 4, letterSpacing: 1 },

  shichenScroll: { marginBottom: 4 },
  shichenRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  shichenBtn: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', minWidth: 60,
    backgroundColor: 'rgba(232,197,71,0.04)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
  },
  shichenActive: { backgroundColor: 'rgba(232,197,71,0.15)', borderColor: 'rgba(232,197,71,0.4)' },
  shichenName: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  shichenNameActive: { color: Colors.primary },
  shichenHours: { fontSize: 9, color: Colors.textDarkest, marginTop: 2 },

  unknownBtn: {
    paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.04)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
  },
  unknownBtnActive: { backgroundColor: 'rgba(232,197,71,0.12)', borderColor: 'rgba(232,197,71,0.4)' },
  unknownText: { fontSize: 13, color: Colors.textMuted },
  unknownTextActive: { color: Colors.primary, fontWeight: '600' },

  primaryBtn: {
    width: '100%', padding: 16, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.15)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.35)', marginTop: 24,
  },
  primaryBtnText: { color: Colors.primary, fontSize: 16, fontFamily: Fonts.serifBold, letterSpacing: 4 },
  disabledBtn: { opacity: 0.3 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  backBtn: { padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)' },
  backBtnText: { color: Colors.textMuted, fontSize: 14 },

  // Language selection
  langList: { width: '100%', gap: 8, marginTop: 16 },
  langItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
  },
  langItemActive: {
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderColor: 'rgba(232,197,71,0.4)',
  },
  langFlag: { fontSize: 22 },
  langLabel: { flex: 1, fontSize: 15, color: Colors.textMuted, fontFamily: Fonts.serif },
  langLabelActive: { color: Colors.primary, fontWeight: '600' },
  langCheck: { fontSize: 18, color: Colors.primary, fontWeight: '700' },

  // Pet result
  summonEmoji: { fontSize: 80, marginBottom: 16 },
  summonTitle: { fontFamily: Fonts.brush, fontSize: 32, color: Colors.primary, marginBottom: 8 },
  summonName: { fontSize: 16, color: Colors.pet, fontFamily: Fonts.serifBold, marginBottom: 16 },
  summonDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 22, textAlign: 'center', marginBottom: 16 },

  // Ziwei summary
  ziweiSummary: {
    width: '100%', padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(160,100,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(160,100,255,0.1)',
    marginBottom: 12,
  },
  ziweiTitle: { fontSize: 12, color: Colors.textMuted, letterSpacing: 2, marginBottom: 10, fontFamily: Fonts.serif },
  ziweiRow: { flexDirection: 'row', gap: 10 },
  ziweiItem: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(160,100,255,0.06)',
  },
  ziweiItemLabel: { fontSize: 10, color: Colors.textDark, marginBottom: 4 },
  ziweiItemValue: { fontSize: 15, color: '#a78bfa', fontFamily: Fonts.serifBold },
  ziweiItemDesc: { fontSize: 10, color: '#b0a0c8', textAlign: 'center', lineHeight: 14 },

  // Astrology summary
  astrologySummary: {
    width: '100%', padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.1)',
    marginBottom: 16,
  },
  astrologyTitle: { fontSize: 12, color: Colors.textMuted, letterSpacing: 2, marginBottom: 10, fontFamily: Fonts.serif },
  astrologyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  astrologyEmoji: { fontSize: 36 },
  astrologyInfo: { flex: 1 },
  astrologySign: { fontSize: 16, color: '#64b4ff', fontFamily: Fonts.serifBold, marginBottom: 4 },
  astrologyDetail: { fontSize: 11, color: Colors.textMuted, lineHeight: 16 },

  unlockList: {
    width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16,
  },
  unlockItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  unlockLv: { fontSize: 9, color: Colors.textDarkest },
  unlockIcon: { fontSize: 12 },
  unlockText: { fontSize: 11, color: Colors.textSecondary },

  tierInfo: { width: '100%', padding: 14, borderRadius: 14, backgroundColor: 'rgba(232,197,71,0.04)', borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)', gap: 8 },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tierBadgeFree: { fontSize: 10, color: Colors.textMuted, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, overflow: 'hidden', width: 52, textAlign: 'center' },
  tierBadgeMember: { fontSize: 10, color: Colors.primary, backgroundColor: 'rgba(232,197,71,0.1)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, overflow: 'hidden', width: 52, textAlign: 'center' },
  tierBadgeSupreme: { fontSize: 10, color: '#a78bfa', backgroundColor: 'rgba(160,100,255,0.1)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, overflow: 'hidden', width: 52, textAlign: 'center' },
  tierDesc: { fontSize: 12, color: Colors.textMuted, flex: 1 },
});
