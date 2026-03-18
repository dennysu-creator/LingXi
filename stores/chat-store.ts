// ═══════════════════════════════════════
// 對話紀錄管理（Zustand + AsyncStorage）
// ═══════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMessageType =
  | 'fortune' | 'outfit' | 'face' | 'fengshui' | 'divination'
  | 'feed' | 'play' | 'meditate' | 'levelup' | 'evolve';

// ─── Per-type data shapes ───

export interface FortuneData {
  slot?: string;
  scores?: { wealth: number; love: number; career: number; health: number; study: number };
  overallScore?: number;
  overallLevel?: string;
  luckyDirection?: string;
  luckyColor?: string;
  luckyNumber?: number;
  luckyElement?: string;
}

export interface FaceData {
  features?: Record<string, { score: number; description: string }>;
  overall_score?: number;
  fortune_level?: string;
  lucky_item?: { emoji: string; name: string; reason: string };
  lucky_direction?: string;
  lucky_number?: number;
}

export interface FengshuiData {
  palaces?: Array<{ direction: string; isAuspicious: boolean; gate?: string }>;
  luckyDirections?: string[];
  dangerDirections?: string[];
  location_analysis?: string;
  tips?: Array<{ icon: string; text: string }>;
  seat_advice?: string;
}

export interface DivinationData {
  hexagram?: {
    id: number;
    name: string;
    symbol: string;
    oracle: string;
    upperTrigram: string;
    lowerTrigram: string;
    element: string;
    fortuneLevel: string;
    mysticalLine: string;
    interpretations: Record<string, { verdict: string; guidance: string; timing: string }>;
  };
  category?: string;
  changedHexagram?: { id: number; name: string; symbol: string; mysticalLine: string };
  changingLines?: number[];
  interpretation?: { verdict: string; guidance: string; timing: string };
}

export interface PetActionData {
  exp?: number;
}

export interface LevelUpData {
  level?: number;
}

export interface EvolveData {
  evolution?: number;
}

export type ChatMessageData =
  | FortuneData
  | FaceData
  | FengshuiData
  | DivinationData
  | PetActionData
  | LevelUpData
  | EvolveData;

export interface ChatMessage {
  id: string;
  time: string;           // ISO string
  type: ChatMessageType;
  text: string;
  classicQuote?: string;  // 古籍引用
  data?: ChatMessageData;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'time'>) => void;
  clearOldMessages: (keepDays: number) => void;
  getMessagesByDate: (dateStr: string) => ChatMessage[];
  resetState: () => void;
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const r1 = Math.random().toString(36).slice(2, 8);
  const r2 = Math.random().toString(36).slice(2, 6);
  return `${ts}-${r1}${r2}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: generateId(),
          time: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, newMsg].slice(-200), // keep last 200
        }));
      },

      clearOldMessages: (keepDays) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - keepDays);
        const cutoffStr = cutoff.toISOString();
        set((state) => ({
          messages: state.messages.filter((m) => m.time >= cutoffStr),
        }));
      },

      getMessagesByDate: (dateStr) => {
        return get().messages.filter((m) => m.time.startsWith(dateStr));
      },

      resetState: () => {
        set({ messages: [] });
      },
    }),
    {
      name: 'lingxi-chat-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
