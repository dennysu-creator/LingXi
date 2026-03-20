// ═══════════════════════════════════════
// 靈寵狀態管理（Zustand）
// ═══════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSpiritPetByDate, type SpiritPet } from '@/config/constants';
import type { PlanType } from '@/types/shared';

// ─── 等級解鎖功能 ───
export const LEVEL_UNLOCKS = {
  1:  { feature: 'petUnlock.basicChat', desc: 'petUnlock.basicChatDesc' },
  3:  { feature: 'petUnlock.fortuneReminder', desc: 'petUnlock.fortuneReminderDesc' },
  5:  { feature: 'petUnlock.outfitAdvice', desc: 'petUnlock.outfitAdviceDesc' },
  8:  { feature: 'petUnlock.directionNav', desc: 'petUnlock.directionNavDesc' },
  10: { feature: 'petUnlock.firstEvo', desc: 'petUnlock.firstEvoDesc' },
  15: { feature: 'petUnlock.deepReading', desc: 'petUnlock.deepReadingDesc' },
  20: { feature: 'petUnlock.secondEvo', desc: 'petUnlock.secondEvoDesc' },
  25: { feature: 'petUnlock.prediction', desc: 'petUnlock.predictionDesc' },
  30: { feature: 'petUnlock.ultimateEvo', desc: 'petUnlock.ultimateEvoDesc' },
} as const;

export function getUnlockedFeatures(level: number): string[] {
  return Object.entries(LEVEL_UNLOCKS)
    .filter(([lvl]) => level >= parseInt(lvl))
    .map(([, info]) => info.feature);
}

export function getNextUnlock(level: number): { level: number; feature: string; desc: string } | null {
  const next = Object.entries(LEVEL_UNLOCKS)
    .find(([lvl]) => parseInt(lvl) > level);
  if (!next) return null;
  return { level: parseInt(next[0]), ...next[1] };
}

// ─── 等級上限（依方案） ───

// TODO: 上線前恢復正式限制 → free: 10, member: 20, supreme: 999
const LEVEL_CAPS: Record<PlanType, number> = { free: 999, member: 999, supreme: 999 };

// TODO: 上線前恢復正式限制 → free: 1, member: 2, supreme: 5
const EVOLUTION_CAPS: Record<PlanType, number> = { free: 5, member: 5, supreme: 5 };

interface PetState {
  // 靈寵基本資料
  petId: string;       // 節氣 ID（如 '01-lichun'）
  name: string;
  creature: string;    // 靈獸原型
  element: string;     // 五行
  solarTerm: string;   // 節氣名
  season: string;      // 季節
  zodiac: string;      // 對應星座
  personality: string; // 個性描述
  emoji: string;
  level: number;
  exp: number;
  expToNext: number;
  evolution: number;   // 進化階段 1-5

  // 屬性值
  power: number;       // 靈力 0-100
  affinity: number;    // 親密度 0-100
  wisdom: number;      // 悟性 0-100
  mood: 'happy' | 'excited' | 'sleepy' | 'worried' | 'energetic';

  // Actions
  initPet: (month: number, day: number) => void;
  feed: (planType?: PlanType) => void;
  play: (planType?: PlanType) => void;
  meditate: (planType?: PlanType) => void;
  addExp: (amount: number, planType?: PlanType) => void;
  canLevelUp: (planType: PlanType) => boolean;
  getLevelCap: (planType: PlanType) => number;
  resetState: () => void;
}

function getInitialPetState() {
  return {
    petId: '',
    name: '',
    creature: '',
    element: '',
    solarTerm: '',
    season: '',
    zodiac: '',
    personality: '',
    emoji: '',
    level: 1,
    exp: 0,
    expToNext: 100,
    evolution: 1,
    power: 50,
    affinity: 50,
    wisdom: 50,
    mood: 'happy' as const,
  };
}

/**
 * 嘗試升級（帶等級上限檢查，支援連續升級）
 */
function tryLevelUp(
  state: { level: number; exp: number; expToNext: number; evolution: number },
  newExp: number,
  planType: PlanType,
): { level: number; exp: number; expToNext: number; evolution: number } | null {
  if (newExp < state.expToNext) return null;

  const levelCap = LEVEL_CAPS[planType];
  const evoCap = EVOLUTION_CAPS[planType];

  if (state.level >= levelCap) {
    return { level: state.level, exp: state.expToNext - 1, expToNext: state.expToNext, evolution: state.evolution };
  }

  // 連續升級：處理溢出 EXP
  let level = state.level;
  let exp = newExp;
  let expToNext = state.expToNext;
  let evolution = state.evolution;

  while (exp >= expToNext && level < levelCap) {
    level += 1;
    exp -= expToNext;
    expToNext = Math.floor(100 * Math.pow(1.15, level - 1));
    if (level % 10 === 0) {
      evolution = Math.min(evolution + 1, evoCap);
    }
  }

  // 若升級後又超過上限，卡住
  if (level >= levelCap) {
    exp = Math.min(exp, expToNext - 1);
  }

  return { level, exp, expToNext, evolution };
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
  ...getInitialPetState(),

  initPet: (month, day) => {
    const pet = getSpiritPetByDate(month, day);
    set({
      petId: pet.id,
      name: pet.name,
      creature: pet.creature,
      element: pet.element,
      solarTerm: pet.solarTerm,
      season: pet.season,
      zodiac: pet.zodiac,
      personality: pet.personality,
      emoji: pet.emoji,
      level: 1,
      exp: 0,
      expToNext: 100,
      evolution: 1,
      power: 50,
      affinity: 50,
      wisdom: 50,
      mood: 'happy',
    });
  },

  feed: (planType = 'free') => {
    const state = get();
    const newExp = state.exp + 50;
    const levelResult = tryLevelUp(state, newExp, planType);

    if (levelResult) {
      set({ ...levelResult, power: Math.min(state.power + 10, 100), mood: 'happy' });
    } else {
      set({ exp: newExp, power: Math.min(state.power + 10, 100), mood: 'happy' });
    }
  },

  play: (planType = 'free') => {
    const state = get();
    const newExp = state.exp + 30;
    const levelResult = tryLevelUp(state, newExp, planType);

    if (levelResult) {
      set({ ...levelResult, affinity: Math.min(state.affinity + 15, 100), mood: 'excited' });
    } else {
      set({ exp: newExp, affinity: Math.min(state.affinity + 15, 100), mood: 'excited' });
    }
  },

  meditate: (planType = 'free') => {
    const state = get();
    const newExp = state.exp + 20;
    const levelResult = tryLevelUp(state, newExp, planType);

    if (levelResult) {
      set({
        ...levelResult,
        wisdom: Math.min(state.wisdom + 10, 100),
        power: Math.min(state.power + 5, 100),
        mood: 'energetic',
      });
    } else {
      set({
        exp: newExp,
        wisdom: Math.min(state.wisdom + 10, 100),
        power: Math.min(state.power + 5, 100),
        mood: 'energetic',
      });
    }
  },

  addExp: (amount, planType = 'free') => {
    const state = get();
    const newExp = state.exp + amount;
    const levelResult = tryLevelUp(state, newExp, planType);

    if (levelResult) {
      set(levelResult);
    } else {
      set({ exp: newExp });
    }
  },

  canLevelUp: (planType) => {
    const state = get();
    return state.level < LEVEL_CAPS[planType];
  },

  getLevelCap: (planType) => {
    return LEVEL_CAPS[planType];
  },

  resetState: () => {
    set(getInitialPetState());
  },
}),
    {
      name: 'lingxi-pet-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
