// ═══════════════════════════════════════
// 音效設定 Store — 靜音 / 音量持久化
// ═══════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioState {
  /** 全域靜音(同時影響 music + SFX) */
  muted: boolean;
  /** 背景音樂音量 0..1 */
  musicVolume: number;
  /** SFX 音量 0..1 */
  sfxVolume: number;

  toggleMuted: () => void;
  setMuted: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      muted: false,
      musicVolume: 0.55,
      sfxVolume: 0.85,

      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setMuted: (v) => set({ muted: v }),
      setMusicVolume: (v) => set({ musicVolume: clamp(v) }),
      setSfxVolume: (v) => set({ sfxVolume: clamp(v) }),
    }),
    {
      name: 'lingxi-audio-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
