// ═══════════════════════════════════════
// 用戶狀態管理（Zustand）
// ═══════════════════════════════════════

import { create } from 'zustand';
import { calculateBazi, type BaziResult } from '@/services/bazi-engine';
import { calculateZiweiChart, type ZiweiChart } from '@/services/ziwei-engine';
import { calculateAstrology, type AstrologyResult } from '@/services/astrology-engine';

export type CalendarType = 'solar' | 'lunar';
export type FeatureType = 'body' | 'eye' | 'soul';
export type PlanType = 'free' | 'member' | 'supreme';

// 每功能每日額度
interface DailyUsage {
  body: number;   // 靈寵之身（GPS 風水）
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
  setPremium: (planType: PlanType) => void;
  useFeature: (feature: FeatureType, petLevel?: number) => boolean;
  getRemainingUses: (feature: FeatureType, petLevel?: number) => number;
  getAge: () => number;
}

// 每功能基礎額度
const FEATURE_LIMITS: Record<PlanType, number> = {
  free: 1,
  member: 5,
  supreme: 999,
};

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

export const useUserStore = create<UserState>((set, get) => ({
  isOnboarded: false,
  userName: '',
  birthYear: 0,
  birthMonth: 0,
  birthDay: 0,
  birthHour: 0,
  calendarType: 'solar',
  gender: 'male',
  bazi: null,
  ziwei: null,
  astrology: null,
  isPremium: false,
  planType: 'free',
  dailyUsage: { body: 0, eye: 0, soul: 0 },
  lastUsageDate: '',

  setOnboarding: (data) => {
    const bazi = calculateBazi(data.year, data.month, data.day, data.hour);

    // 計算紫微斗數命盤
    // 簡化：若為國曆，月日直接當農曆用（正式版需要真正農曆轉換）
    const lunarMonth = data.month;
    const lunarDay = data.day;
    const ziwei = calculateZiweiChart(bazi, lunarMonth, lunarDay, data.gender);

    // 計算西洋占星
    const astrology = calculateAstrology(data.month, data.day);

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

  setPremium: (planType) => {
    set({ isPremium: planType !== 'free', planType });
  },

  useFeature: (feature, petLevel = 0) => {
    const state = get();
    const today = new Date().toISOString().slice(0, 10);

    let usage = { ...state.dailyUsage };
    if (state.lastUsageDate !== today) {
      usage = { body: 0, eye: 0, soul: 0 };
    }

    const limit = FEATURE_LIMITS[state.planType] + getPetBonus(petLevel, state.planType);

    if (usage[feature] >= limit) return false;

    usage[feature]++;
    set({ dailyUsage: usage, lastUsageDate: today });
    return true;
  },

  getRemainingUses: (feature, petLevel = 0) => {
    const state = get();
    const today = new Date().toISOString().slice(0, 10);

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
}));
