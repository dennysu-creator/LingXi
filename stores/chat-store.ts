// ═══════════════════════════════════════
// 對話紀錄管理（Zustand + AsyncStorage）
// ═══════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMessageType =
  | 'fortune' | 'outfit' | 'face' | 'fengshui' | 'divination'
  | 'feed' | 'play' | 'meditate' | 'levelup' | 'evolve';

export interface ChatMessage {
  id: string;
  time: string;           // ISO string
  type: ChatMessageType;
  text: string;
  classicQuote?: string;  // 古籍引用
  data?: any;             // fortune scores, compass data, hexagram, face scores, etc.
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'time'>) => void;
  clearOldMessages: (keepDays: number) => void;
  getMessagesByDate: (dateStr: string) => ChatMessage[];
  resetState: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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
