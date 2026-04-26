// ═══════════════════════════════════════
// 音效控制器 — 背景音樂 + SFX(expo-audio)
// ─────────────────────────────────────────
// 設計重點
//  - 懶載入 music players(第一次播放才 require + 建立 player)
//  - SFX 也是懶載入,但 cache 起來,省 RAM 同時保證觸發即時
//  - playMusic 實作 crossfade(舊軌淡出 + 新軌淡入)
//  - 全域 muted/volume 變動時即時套用到所有目前的 player
//  - AppState background → music pause; foreground → resume
// ═══════════════════════════════════════

import { AppState, type AppStateStatus, Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useAudioStore } from '@/stores/audio-store';

// ─── Music keys → asset map ───
export type MusicKey =
  | 'pet-idle'
  | 'fortune-reveal'
  | 'face-reading'
  | 'fengshui'
  | 'divination'
  | 'hexagram-reveal'
  | 'meditation'
  | 'paywall'
  | 'loading'
  | 'night-mode';

const MUSIC_FILES: Record<MusicKey, number> = {
  'pet-idle':         require('@/assets/audio/music/music-01-pet-idle.mp3'),
  'fortune-reveal':   require('@/assets/audio/music/music-02-fortune-reveal.mp3'),
  'face-reading':     require('@/assets/audio/music/music-03-face-reading-eye.mp3'),
  'fengshui':         require('@/assets/audio/music/music-04-fengshui-heart.mp3'),
  'divination':       require('@/assets/audio/music/music-05-divination-oracle.mp3'),
  'hexagram-reveal':  require('@/assets/audio/music/music-06-hexagram-reveal.mp3'),
  'meditation':       require('@/assets/audio/music/music-07-meditation-chat.mp3'),
  'paywall':          require('@/assets/audio/music/music-08-paywall-ascend.mp3'),
  'loading':          require('@/assets/audio/music/music-09-loading-thinking.mp3'),
  'night-mode':       require('@/assets/audio/music/music-10-night-mode.mp3'),
};

// ─── SFX keys → asset map ───
export type SfxKey =
  | 'app-launch'
  | 'pet-tap'
  | 'category-select'
  | 'jiao-yes'
  | 'jiao-maybe'
  | 'jiao-no'
  | 'hexagram-reveal'
  | 'camera-capture'
  | 'compass-spin'
  | 'result-fortune'
  | 'level-up'
  | 'evolution'
  | 'quota-warning'
  | 'subscription-success'
  | 'achievement'
  | 'error'
  | 'notification';

const SFX_FILES: Record<SfxKey, number> = {
  'app-launch':           require('@/assets/audio/sfx/sfx-11-app-launch.mp3'),
  'pet-tap':              require('@/assets/audio/sfx/sfx-12-pet-tap.mp3'),
  'category-select':      require('@/assets/audio/sfx/sfx-13-category-select.mp3'),
  'jiao-yes':             require('@/assets/audio/sfx/sfx-14-jiao-sheng-yes.mp3'),
  'jiao-maybe':           require('@/assets/audio/sfx/sfx-15-jiao-xiao-maybe.mp3'),
  'jiao-no':              require('@/assets/audio/sfx/sfx-16-jiao-nu-no.mp3'),
  'hexagram-reveal':      require('@/assets/audio/sfx/sfx-17-hexagram-reveal.mp3'),
  'camera-capture':       require('@/assets/audio/sfx/sfx-18-camera-capture.mp3'),
  'compass-spin':         require('@/assets/audio/sfx/sfx-19-compass-spin.mp3'),
  'result-fortune':       require('@/assets/audio/sfx/sfx-20-result-fortune.mp3'),
  'level-up':             require('@/assets/audio/sfx/sfx-21-level-up.mp3'),
  'evolution':            require('@/assets/audio/sfx/sfx-22-pet-evolution.mp3'),
  'quota-warning':        require('@/assets/audio/sfx/sfx-23-quota-warning.mp3'),
  'subscription-success': require('@/assets/audio/sfx/sfx-24-subscription-success.mp3'),
  'achievement':          require('@/assets/audio/sfx/sfx-25-achievement-unlock.mp3'),
  'error':                require('@/assets/audio/sfx/sfx-26-error-soft.mp3'),
  'notification':         require('@/assets/audio/sfx/sfx-27-notification.mp3'),
};

// ─── Internals ───
const musicCache: Partial<Record<MusicKey, AudioPlayer>> = {};
const sfxCache: Partial<Record<SfxKey, AudioPlayer>> = {};

let currentMusic: { key: MusicKey; player: AudioPlayer } | null = null;
let initialized = false;
let unsubscribeStore: (() => void) | null = null;
let appStateSub: { remove: () => void } | null = null;
let pausedDueToBackground = false;

// ─── Helpers ───
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function effectiveMusicVolume(): number {
  const s = useAudioStore.getState();
  return s.muted ? 0 : clamp01(s.musicVolume);
}

function effectiveSfxVolume(): number {
  const s = useAudioStore.getState();
  return s.muted ? 0 : clamp01(s.sfxVolume);
}

function safeSetVolume(p: AudioPlayer | undefined | null, v: number) {
  if (!p) return;
  try {
    p.volume = clamp01(v);
  } catch {
    /* player may be released */
  }
}

function safePause(p: AudioPlayer | undefined | null) {
  if (!p) return;
  try {
    p.pause();
  } catch {
    /* noop */
  }
}

function safeRemove(p: AudioPlayer | undefined | null) {
  if (!p) return;
  try {
    p.remove();
  } catch {
    /* noop */
  }
}

function getOrCreateMusicPlayer(key: MusicKey): AudioPlayer {
  let p = musicCache[key];
  if (!p) {
    p = createAudioPlayer(MUSIC_FILES[key]);
    p.loop = true;
    p.volume = effectiveMusicVolume();
    musicCache[key] = p;
  }
  return p;
}

function getOrCreateSfxPlayer(key: SfxKey): AudioPlayer {
  let p = sfxCache[key];
  if (!p) {
    p = createAudioPlayer(SFX_FILES[key]);
    p.loop = false;
    p.volume = effectiveSfxVolume();
    sfxCache[key] = p;
  }
  return p;
}

// 線性 fade,~10 步,duration 預設 400ms
async function fadeTo(p: AudioPlayer, target: number, durationMs = 400): Promise<void> {
  const steps = 10;
  const start = (() => {
    try { return clamp01(p.volume); } catch { return 0; }
  })();
  const delta = clamp01(target) - start;
  const stepMs = Math.max(20, Math.floor(durationMs / steps));
  for (let i = 1; i <= steps; i++) {
    const v = start + (delta * i) / steps;
    safeSetVolume(p, v);
    await new Promise<void>((r) => setTimeout(r, stepMs));
  }
  safeSetVolume(p, target);
}

// ─── Public API ───
export interface PlayMusicOptions {
  /** 淡出/淡入時間(ms),預設 400 */
  fadeMs?: number;
  /** 是否強制重啟(同 key 也重新從 0 秒開始) */
  restart?: boolean;
  /** 自訂目標音量倍率(0..1),預設 1.0 = 用 store 設定值 */
  volumeFactor?: number;
}

/** 啟動或切換背景音樂(crossfade) */
export async function playMusic(key: MusicKey, options: PlayMusicOptions = {}): Promise<void> {
  await ensureInitialized();
  const fadeMs = options.fadeMs ?? 400;
  const factor = options.volumeFactor ?? 1.0;
  const targetVol = clamp01(effectiveMusicVolume() * factor);

  // 同 key 已在播 → 不需切換,但確保正在播
  if (currentMusic?.key === key && !options.restart) {
    const p = currentMusic.player;
    try {
      if (!p.playing) p.play();
    } catch { /* noop */ }
    safeSetVolume(p, targetVol);
    return;
  }

  // 取得新 player
  const next = getOrCreateMusicPlayer(key);
  // 重啟 → seek 0
  if (options.restart) {
    try { await next.seekTo(0); } catch { /* noop */ }
  }
  safeSetVolume(next, 0);
  try { next.play(); } catch { /* noop */ }

  // 舊軌淡出
  const prev = currentMusic;
  currentMusic = { key, player: next };

  const fades: Promise<void>[] = [];
  if (prev && prev.player !== next) {
    fades.push(
      fadeTo(prev.player, 0, fadeMs).then(() => {
        safePause(prev.player);
      }),
    );
  }
  fades.push(fadeTo(next, targetVol, fadeMs));
  await Promise.all(fades);
}

/** 停止背景音樂(淡出) */
export async function stopMusic(fadeMs = 300): Promise<void> {
  if (!currentMusic) return;
  const { player } = currentMusic;
  currentMusic = null;
  await fadeTo(player, 0, fadeMs);
  safePause(player);
}

/** 暫停背景音樂(不淡出) */
export function pauseMusic(): void {
  if (!currentMusic) return;
  safePause(currentMusic.player);
}

/** 從暫停恢復播放 */
export function resumeMusic(): void {
  if (!currentMusic) return;
  try {
    currentMusic.player.volume = effectiveMusicVolume();
    currentMusic.player.play();
  } catch { /* noop */ }
}

/** 取得目前播放的 music key(可用於 UpgradeModal 暫存) */
export function getCurrentMusicKey(): MusicKey | null {
  return currentMusic?.key ?? null;
}

/** 一次性播放 SFX */
export function playSfx(key: SfxKey): void {
  // SFX 不等待 init;若還沒 init 就先 fire-and-forget init
  if (!initialized) {
    void ensureInitialized();
  }
  const vol = effectiveSfxVolume();
  if (vol <= 0) return; // 靜音直接 return,省工
  const p = getOrCreateSfxPlayer(key);
  try {
    p.volume = vol;
    // SFX 短促,從頭播
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    /* noop */
  }
}

/** 全域靜音 */
export function setMuted(v: boolean): void {
  useAudioStore.getState().setMuted(v);
  // 立即套用音量(store subscribe 也會處理,但這裡保險)
  applyVolumesNow();
}

export function setMusicVolume(v: number): void {
  useAudioStore.getState().setMusicVolume(v);
  applyVolumesNow();
}

export function setSfxVolume(v: number): void {
  useAudioStore.getState().setSfxVolume(v);
  applyVolumesNow();
}

function applyVolumesNow(): void {
  const mvol = effectiveMusicVolume();
  const svol = effectiveSfxVolume();
  // 套用到目前播放的 music
  if (currentMusic) {
    safeSetVolume(currentMusic.player, mvol);
  }
  // 其他 cached music players 的 volume 也同步(下次播放就直接套)
  Object.values(musicCache).forEach((p) => safeSetVolume(p, mvol));
  // SFX cached players
  Object.values(sfxCache).forEach((p) => safeSetVolume(p, svol));
}

// ─── 初始化(設定 audio mode + AppState 監聽 + store 訂閱) ───
async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  initialized = true;

  // setAudioModeAsync 在 web 上沒有作用,native 才需要
  if (Platform.OS !== 'web') {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        // 允許其他 app 的音樂混音
        interruptionMode: 'mixWithOthers',
        shouldRouteThroughEarpiece: false,
      });
    } catch {
      /* 某些平台/版本可能不支援所有選項 */
    }
  }

  // 訂閱 audio store(toggle muted / volume 變動立即生效)
  unsubscribeStore = useAudioStore.subscribe((state, prev) => {
    if (
      state.muted !== prev.muted ||
      state.musicVolume !== prev.musicVolume ||
      state.sfxVolume !== prev.sfxVolume
    ) {
      applyVolumesNow();
    }
  });

  // AppState: background → 暫停 music; foreground → 恢復
  appStateSub = AppState.addEventListener('change', handleAppStateChange);
}

function handleAppStateChange(s: AppStateStatus): void {
  if (s === 'active') {
    if (pausedDueToBackground && currentMusic) {
      pausedDueToBackground = false;
      try {
        currentMusic.player.volume = effectiveMusicVolume();
        currentMusic.player.play();
      } catch { /* noop */ }
    }
  } else if (s === 'background' || s === 'inactive') {
    if (currentMusic) {
      try {
        if (currentMusic.player.playing) {
          pausedDueToBackground = true;
          currentMusic.player.pause();
        }
      } catch { /* noop */ }
    }
  }
}

/**
 * 顯式呼叫(非必要,playMusic / playSfx 會自動 init);提供給 root layout
 * 想在啟動時就把 audio session 設好的情境。
 */
export async function initAudio(): Promise<void> {
  await ensureInitialized();
}

/** 開發 / unmount 用的全域釋放(一般不需呼叫) */
export function disposeAudio(): void {
  unsubscribeStore?.();
  unsubscribeStore = null;
  appStateSub?.remove?.();
  appStateSub = null;
  Object.values(musicCache).forEach(safeRemove);
  Object.values(sfxCache).forEach(safeRemove);
  Object.keys(musicCache).forEach((k) => delete musicCache[k as MusicKey]);
  Object.keys(sfxCache).forEach((k) => delete sfxCache[k as SfxKey]);
  currentMusic = null;
  initialized = false;
}
