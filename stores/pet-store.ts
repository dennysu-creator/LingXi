// ═══════════════════════════════════════
// 靈寵狀態管理（Zustand）— 使用次數制升級
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

// ─── 非線性升級門檻表（累計使用次數） ───
// level N 需要 USAGE_THRESHOLDS[N] 累計次數才能達到
// 設計：每級需要 10 + 2*(level-1) 次增量，但不超過 30 次/級
function getUsageThreshold(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.min(30, 10 + 2 * (i - 1)); // 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 30...
  }
  return total;
}

// 預算表（供 UI 顯示用）：
// Lv1→2: 10次, Lv2→3: 12次, Lv3→4: 14次, ..., Lv15→16: 30次, 之後都是30次
// 累計到 Lv10: 10+12+14+16+18+20+22+24+26+28 = 190 次 → 第一次進化
// 累計到 Lv20: 190 + 30*10 = 490 次 → 第二次進化
// 累計到 Lv30: 490 + 30*10 = 790 次 → 最終進化

const MAX_LEVEL = 30;
const EVOLUTION_LEVELS = [10, 20, 30]; // 進化觸發等級

interface PetState {
  // 靈寵基本資料
  petId: string;
  name: string;
  creature: string;
  element: string;
  solarTerm: string;
  season: string;
  zodiac: string;
  personality: string;
  emoji: string;

  // 等級系統
  level: number;
  evolution: number;      // 進化階段 1-4 (1=基礎, 2=第一進化, 3=第二進化, 4=最終)
  usageCount: number;     // 累計使用次數（永不重置，收費依據）

  // 舊欄位保留相容
  exp: number;
  expToNext: number;
  power: number;
  affinity: number;
  wisdom: number;
  mood: 'happy' | 'excited' | 'sleepy' | 'worried' | 'energetic';

  // Actions
  initPet: (month: number, day: number) => void;
  incrementUsage: () => { leveledUp: boolean; evolved: boolean; newLevel: number; newEvolution: number };
  feed: (planType?: PlanType) => void;
  play: (planType?: PlanType) => void;
  meditate: (planType?: PlanType) => void;
  addExp: (amount: number, planType?: PlanType) => void;
  canLevelUp: (planType: PlanType) => boolean;
  getLevelCap: (planType: PlanType) => number;
  getUsagesUntilNextLevel: () => number;
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
    evolution: 1,
    usageCount: 0,
    exp: 0,
    expToNext: 100,
    power: 50,
    affinity: 50,
    wisdom: 50,
    mood: 'happy' as const,
  };
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
      evolution: 1,
      usageCount: 0,
      exp: 0,
      expToNext: 100,
      power: 50,
      affinity: 50,
      wisdom: 50,
      mood: 'happy',
    });
  },

  // ─── 核心：每次使用功能 +1 ───
  incrementUsage: () => {
    const state = get();
    const newCount = state.usageCount + 1;
    let level = state.level;
    let evolution = state.evolution;
    let leveledUp = false;
    let evolved = false;

    // 檢查是否升級
    while (level < MAX_LEVEL) {
      const nextThreshold = getUsageThreshold(level + 1);
      if (newCount >= nextThreshold) {
        level++;
        leveledUp = true;
        // 檢查是否進化
        if (EVOLUTION_LEVELS.includes(level)) {
          evolution = Math.min(evolution + 1, 4);
          evolved = true;
        }
      } else {
        break;
      }
    }

    set({ usageCount: newCount, level, evolution });
    return { leveledUp, evolved, newLevel: level, newEvolution: evolution };
  },

  // 保留舊 API 相容（內部轉發到 incrementUsage）
  feed: () => { get().incrementUsage(); },
  play: () => { get().incrementUsage(); },
  meditate: () => { get().incrementUsage(); },
  addExp: () => { get().incrementUsage(); },

  canLevelUp: () => {
    return get().level < MAX_LEVEL;
  },

  getLevelCap: () => MAX_LEVEL,

  getUsagesUntilNextLevel: () => {
    const state = get();
    if (state.level >= MAX_LEVEL) return 0;
    const nextThreshold = getUsageThreshold(state.level + 1);
    return Math.max(0, nextThreshold - state.usageCount);
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
