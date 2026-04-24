// ═══════════════════════════════════════════════════════════════
// Share Service — Branded pet-themed PNG card sharing
// ═══════════════════════════════════════════════════════════════
// Replaces the legacy text-file share. The caller mounts a hidden
// <ShareCard ref={...} data={...} /> then calls captureAndShare(ref, ...).
//
// OOM fallback chain (for low-RAM Android):
//   1) 1080x1920 PNG quality 0.95
//   2) 720x1280 PNG quality 0.9
//   3) 720x1280 JPEG quality 0.85
//   4) plain text share (legacy behavior)
// ═══════════════════════════════════════════════════════════════

import { Platform, View } from 'react-native';
import { RefObject } from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { captureRef } from 'react-native-view-shot';
import { usePetStore } from '@/stores/pet-store';
import { getPetImage } from '@/assets/images';
import type { ShareCardData } from '@/components/ShareCard';

const APP_STORE_URL = 'https://apps.apple.com/app/id6759918378';

// ─── Build typed props from current pet state ──────────────────

export function buildShareCardData(params: {
  title: string;
  content: string;
  category?: string;
}): ShareCardData {
  const pet = usePetStore.getState();
  const evolutionKey = pet.evolution >= 3 ? 'evo3' : pet.evolution === 2 ? 'evo2' : 'evo1';
  const petImage = pet.petId ? getPetImage(pet.petId, evolutionKey) : null;

  return {
    title: params.title,
    content: params.content,
    category: params.category,
    petImage,
    petName: pet.name || '靈寵',
    petLevel: pet.level || 1,
    timestamp: new Date(),
    appStoreUrl: APP_STORE_URL,
  };
}

// ─── Capture + share with OOM fallback ─────────────────────────

interface CaptureAttempt {
  format: 'png' | 'jpg';
  quality: number;
  width: number;
  height: number;
}

const CAPTURE_ATTEMPTS: CaptureAttempt[] = [
  { format: 'png', quality: 0.95, width: 1080, height: 1920 },
  { format: 'png', quality: 0.9, width: 720, height: 1280 },
  { format: 'jpg', quality: 0.85, width: 720, height: 1280 },
];

async function tryCapture(viewRef: RefObject<View | null>, attempt: CaptureAttempt): Promise<string | null> {
  try {
    if (!viewRef.current) return null;
    const uri = await captureRef(viewRef.current, {
      format: attempt.format,
      quality: attempt.quality,
      width: attempt.width,
      height: attempt.height,
      result: 'tmpfile',
    });
    return uri;
  } catch (err) {
    console.warn(
      `[share-service] capture ${attempt.width}x${attempt.height} ${attempt.format} failed:`,
      (err as Error).message
    );
    return null;
  }
}

export interface ShareOptions {
  dialogTitle?: string;
  textFallback: string;   // used if all captures fail (or on web)
}

export async function captureAndShare(
  viewRef: RefObject<View | null>,
  opts: ShareOptions
): Promise<{ shared: boolean; method: 'image' | 'text' | 'none' }> {
  if (Platform.OS === 'web') {
    return { shared: false, method: 'none' };
  }

  if (!(await Sharing.isAvailableAsync())) {
    return { shared: false, method: 'none' };
  }

  // Try each capture resolution until one succeeds.
  for (const attempt of CAPTURE_ATTEMPTS) {
    const uri = await tryCapture(viewRef, attempt);
    if (uri) {
      try {
        await Sharing.shareAsync(uri, {
          mimeType: attempt.format === 'png' ? 'image/png' : 'image/jpeg',
          UTI: attempt.format === 'png' ? 'public.png' : 'public.jpeg',
          dialogTitle: opts.dialogTitle,
        });
        return { shared: true, method: 'image' };
      } catch (err) {
        console.warn('[share-service] shareAsync failed:', (err as Error).message);
        // continue to next attempt
      }
    }
  }

  // Final fallback: share plain text via temp file.
  try {
    const fileUri = FileSystem.cacheDirectory + 'fortune-share.txt';
    await FileSystem.writeAsStringAsync(fileUri, opts.textFallback);
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: opts.dialogTitle,
    });
    return { shared: true, method: 'text' };
  } catch (err) {
    console.error('[share-service] text fallback failed:', err);
    return { shared: false, method: 'none' };
  }
}

// ─── Legacy APIs (still used by a few call sites) ──────────────

export async function shareFortuneText(text: string, petName: string): Promise<void> {
  const shareText = `${text}\n\n——————\n🔮 由「靈犀 LingXi」AI 命理靈寵分析\n📲 下載 App：${APP_STORE_URL}`;

  if (Platform.OS === 'web') return;
  if (!(await Sharing.isAvailableAsync())) return;

  const fileUri = FileSystem.cacheDirectory + 'fortune-share.txt';
  await FileSystem.writeAsStringAsync(fileUri, shareText);
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: `${petName}的命理分析`,
  });
}

export async function shareResult(title: string, message: string): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!(await Sharing.isAvailableAsync())) return;

  const fullMessage = `${title}\n\n${message}\n\n🔮 靈犀 LingXi — AI 命理靈寵\n📲 ${APP_STORE_URL}`;
  const fileUri = FileSystem.cacheDirectory + 'fortune-share.txt';
  await FileSystem.writeAsStringAsync(fileUri, fullMessage);
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: title,
  });
}
