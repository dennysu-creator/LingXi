// ═══════════════════════════════════════════════════════════════
// 用戶狀態管理（Zustand）
// ═══════════════════════════════════════════════════════════════
// Post-refactor:
//   - Removed per-feature daily quotas (server-enforced via trial ledger).
//   - Added trialUsed / trialLimit / subscriptionStatus mirrors.
//   - Single access gate: canUseFeature() reads the mirror.
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBazi, type BaziResult } from '@/services/bazi-engine';
import { calculateZiweiChart, type ZiweiChart } from '@/services/ziwei-engine';
import { calculateAstrology, type AstrologyResult } from '@/services/astrology-engine';
import { solarToLunar } from '@/services/lunar-calendar';
import {
  type CalendarType,
  type FeatureType,
  type PlanType,
  type SubscriptionStatus,
  normalizePlan,
  hasActiveSubscription,
} from '@/types/shared';

// Re-export for backward compatibility
export type { CalendarType, FeatureType, PlanType } from '@/types/shared';

interface DestinyData {
  onboarded?: boolean;
  [key: string]: unknown;
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

  // 訂閱狀態（rolls up from server subscription_status + legacy plan_type）
  isPremium: boolean;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;

  // Trial mirror (server is source of truth; updated on each /user/profile pull
  // and optimistically decremented by AI call success)
  trialUsed: number;
  trialLimit: number;

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
    subscriptionStatus?: SubscriptionStatus;
    trialUsed?: number;
    trialLimit?: number;
    destinyData?: DestinyData | null;
  }) => void;
  setPremium: (planType: PlanType, subscriptionStatus?: SubscriptionStatus) => void;
  setTrialState: (trialUsed: number, trialLimit: number) => void;
  optimisticConsumeTrial: () => void; // +1 to trialUsed after a successful AI call
  canUseFeature: () => boolean;
  getRemainingUses: (_feature?: FeatureType, _petLevel?: number) => number;
  // Legacy: accepts (feature, petLevel) but ignores them — trial is plan-wide now.
  // Returns true if allowed AND optimistically consumes trial for free users.
  useFeature: (_feature?: FeatureType, _petLevel?: number) => boolean;
  getAge: () => number;
  resetState: () => void;
}

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
    subscriptionStatus: 'free' as SubscriptionStatus,
    trialUsed: 0,
    trialLimit: 3,
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
    const lunar = solarToLunar(year, month, day);
    lunarMonth = Math.abs(lunar.month);
    lunarDay = lunar.day;
  }

  return {
    bazi,
    ziwei: calculateZiweiChart(bazi, lunarMonth, lunarDay, gender),
    astrology: calculateAstrology(month, day),
  };
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

        const normalizedPlan = normalizePlan(data.planType);
        const serverSubStatus =
          data.subscriptionStatus ?? (normalizedPlan === 'paid' ? 'active' : 'free');

        const trialPatch = {
          trialUsed: data.trialUsed ?? get().trialUsed,
          trialLimit: data.trialLimit ?? get().trialLimit ?? 3,
        };

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
            isPremium: normalizedPlan === 'paid',
            planType: normalizedPlan,
            subscriptionStatus: serverSubStatus,
            ...trialPatch,
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
          isPremium: normalizedPlan === 'paid',
          planType: normalizedPlan,
          subscriptionStatus: serverSubStatus,
          ...trialPatch,
        });
      },

      setPremium: (planType, subscriptionStatus) => {
        const normalized = normalizePlan(planType);
        set({
          isPremium: normalized === 'paid',
          planType: normalized,
          subscriptionStatus:
            subscriptionStatus ?? (normalized === 'paid' ? 'active' : 'free'),
        });
      },

      setTrialState: (trialUsed, trialLimit) => {
        set({ trialUsed, trialLimit });
      },

      optimisticConsumeTrial: () => {
        const state = get();
        if (hasActiveSubscription(state.subscriptionStatus)) return;
        if (state.trialUsed >= state.trialLimit) return;
        set({ trialUsed: state.trialUsed + 1 });
      },

      canUseFeature: () => {
        const state = get();
        if (hasActiveSubscription(state.subscriptionStatus)) return true;
        return state.trialUsed < state.trialLimit;
      },

      // Legacy wrapper: checks whether the feature is allowed.
      // IMPORTANT: does NOT decrement locally. Server is source of truth and
      // the mirror is updated from /user/profile + optimistic sync after a
      // successful AI response (via trialUsed/trialLimit in the response).
      // Prior optimistic-decrement had a bug: if camera permission /
      // GPS fetch / AI call failed, local count had already decremented
      // without the server doing so.
      useFeature: (_feature, _petLevel) => {
        const state = get();
        if (hasActiveSubscription(state.subscriptionStatus)) return true;
        return state.trialUsed < state.trialLimit;
      },

      getRemainingUses: (_feature, _petLevel) => {
        const state = get();
        if (hasActiveSubscription(state.subscriptionStatus)) return -1;
        return Math.max(0, state.trialLimit - state.trialUsed);
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
      version: 2, // bumped to purge legacy dailyUsage / lastUsageDate
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: any, fromVersion) => {
        if (!persisted) return persisted;
        if (fromVersion < 2) {
          // Strip obsolete fields; trial state will be hydrated from /user/profile.
          const { dailyUsage: _du, lastUsageDate: _lud, ...rest } = persisted;
          return {
            ...rest,
            subscriptionStatus: rest.subscriptionStatus || (rest.planType && rest.planType !== 'free' ? 'active' : 'free'),
            trialUsed: rest.trialUsed ?? 0,
            trialLimit: rest.trialLimit ?? 3,
          };
        }
        return persisted;
      },
    },
  ),
);

