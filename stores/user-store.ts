// ═══════════════════════════════════════
// 用戶狀態管理（Zustand）
// ═══════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBazi, type BaziResult } from '@/services/bazi-engine';
import { calculateZiweiChart, type ZiweiChart } from '@/services/ziwei-engine';
import { calculateAstrology, type AstrologyResult } from '@/services/astrology-engine';
import type { CalendarType, FeatureType, PlanType } from '@/types/shared';

// Re-export for backward compatibility
export type { CalendarType, FeatureType, PlanType } from '@/types/shared';

interface DestinyData {
  onboarded?: boolean;
  [key: string]: unknown;
}

/** 取得本地日期字串 (YYYY-MM-DD)，避免 UTC 時區偏移 */
function getLocalDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 每功能每日額度
interface DailyUsage {
  heart: number;   // 靈心（GPS 風水）
  eye: number;    // 靈寵之眼（面相穿搭）
  soul: number;   // 靈寵之魂（64 卦占卜）
}

interface UserState {
  // 基本資料
  isOnboarded: boolean;
  userName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  calendarType: CalendarType;
  gender: 'male' | 'female';

  // 八字命盤
  bazi: BaziResult | null;

  // 紫微斗數命盤
  ziwei: ZiweiChart | null;

  // 西洋占星
  astrology: AstrologyResult | null;

  // 訂閱狀態
  isPremium: boolean;
  planType: PlanType;

  // 每功能每日額度
  dailyUsage: DailyUsage;
  lastUsageDate: string;

  // Actions
  setOnboarding: (data: {
    name: string;
    year: number; month: number; day: number;
    hour: number; gender: 'male' | 'female';
    calendarType: CalendarType;
  }) => void;
  syncProfile: (data: {
    name: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour?: number;
    gender?: 'male' | 'female';
    calendarType?: CalendarType;
    planType: PlanType;
    destinyData?: DestinyData | null;
  }) => void;
  setPremium: (planType: PlanType) => void;
  useFeature: (feature: FeatureType, petLevel?: number) => boolean;
  getRemainingUses: (feature: FeatureType, petLevel?: number) => number;
  getAge: () => number;
  resetState: () => void;
}

// 每功能基礎額度
// TODO: 上線前恢復正式限制 → free: 1, member: 5, supreme: 999
const FEATURE_LIMITS: Record<PlanType, number> = { free: 9999, member: 9999, supreme: 9999 };

function getInitialUserState() {
  return {
    isOnboarded: false,
    userName: '',
    birthYear: 0,
    birthMonth: 0,
    birthDay: 0,
    birthHour: 0,
    calendarType: 'solar' as CalendarType,
    gender: 'male' as const,
    bazi: null as BaziResult | null,
    ziwei: null as ZiweiChart | null,
    astrology: null as AstrologyResult | null,
    isPremium: false,
    planType: 'free' as PlanType,
    dailyUsage: { heart: 0, eye: 0, soul: 0 },
    lastUsageDate: '',
  };
}

function buildDerivedCharts(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female',
  calendarType: CalendarType,
) {
  const bazi = calculateBazi(year, month, day, hour);

  let lunarMonth = month;
  let lunarDay = day;
  if (calendarType === 'solar') {
    const approxLunarMonth = month <= 1 ? 12 + month - 1 : month - 1;
    const approxLunarDay = day <= 20 ? day + 10 : day - 20;
    lunarMonth = approxLunarMonth === 0 ? 12 : approxLunarMonth;
    lunarDay = Math.max(1, Math.min(30, approxLunarDay));
  }

  return {
    bazi,
    ziwei: calculateZiweiChart(bazi, lunarMonth, lunarDay, gender),
    astrology: calculateAstrology(month, day),
  };
}

/**
 * 根據靈寵等級計算額外額度加成
 * Lv.10+ → +1, Lv.20+ → +2
 */
function getPetBonus(petLevel: number, planType: PlanType): number {
  if (planType === 'supreme') return 0; // 至尊版不需要加成
  let bonus = 0;
  if (petLevel >= 10) bonus += 1;
  if (petLevel >= 20) bonus += 1;
  return bonus;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
  ...getInitialUserState(),

  setOnboarding: (data) => {
    const { bazi, ziwei, astrology } = buildDerivedCharts(
      data.year,
      data.month,
      data.day,
      data.hour,
      data.gender,
      data.calendarType,
    );

    set({
      isOnboarded: true,
      userName: data.name,
      birthYear: data.year,
      birthMonth: data.month,
      birthDay: data.day,
      birthHour: data.hour,
      calendarType: data.calendarType,
      gender: data.gender,
      bazi,
      ziwei,
      astrology,
    });
  },

  syncProfile: (data) => {
    const hour = data.birthHour ?? 11;
    const gender = data.gender ?? 'male';
    const calendarType = data.calendarType ?? 'solar';
    const destinyData = data.destinyData ?? undefined;

    const hasOnboardingFlag = typeof destinyData?.onboarded === 'boolean';
    const looksLikeCompletedLegacyProfile =
      Boolean(data.birthYear && data.birthMonth && data.birthDay) &&
      !(
        data.birthYear === 2000 &&
        data.birthMonth === 1 &&
        data.birthDay === 1 &&
        hour === 11 &&
        gender === 'male' &&
        calendarType === 'solar'
      );
    const isOnboarded = hasOnboardingFlag
      ? destinyData?.onboarded === true
      : looksLikeCompletedLegacyProfile;

    if (!isOnboarded) {
      set({
        isOnboarded: false,
        userName: data.name,
        birthYear: 0,
        birthMonth: 0,
        birthDay: 0,
        birthHour: 0,
        calendarType,
        gender,
        bazi: null,
        ziwei: null,
        astrology: null,
        isPremium: data.planType !== 'free',
        planType: data.planType,
      });
      return;
    }

    const { bazi, ziwei, astrology } = buildDerivedCharts(
      data.birthYear,
      data.birthMonth,
      data.birthDay,
      hour,
      gender,
      calendarType,
    );

    set({
      isOnboarded: true,
      userName: data.name,
      birthYear: data.birthYear,
      birthMonth: data.birthMonth,
      birthDay: data.birthDay,
      birthHour: hour,
      calendarType,
      gender,
      bazi,
      ziwei,
      astrology,
      isPremium: data.planType !== 'free',
      planType: data.planType,
    });
  },

  setPremium: (planType) => {
    set({ isPremium: planType !== 'free', planType });
  },

  useFeature: (feature, petLevel = 0) => {
    const state = get();
    const today = getLocalDateStr();

    let usage = { ...state.dailyUsage };
    if (state.lastUsageDate !== today) {
      usage = { heart: 0, eye: 0, soul: 0 };
    }

    const limit = FEATURE_LIMITS[state.planType] + getPetBonus(petLevel, state.planType);

    if (usage[feature] >= limit) return false;

    usage[feature]++;
    set({ dailyUsage: usage, lastUsageDate: today });
    return true;
  },

  getRemainingUses: (feature, petLevel = 0) => {
    const state = get();
    const today = getLocalDateStr();

    const used = state.lastUsageDate === today ? state.dailyUsage[feature] : 0;
    const limit = FEATURE_LIMITS[state.planType] + getPetBonus(petLevel, state.planType);

    return Math.max(0, limit - used);
  },

  getAge: () => {
    const state = get();
    if (!state.birthYear) return 0;
    const now = new Date();
    return now.getFullYear() - state.birthYear;
  },

  resetState: () => {
    set(getInitialUserState());
  },
}),
    {
      name: 'lingxi-user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
