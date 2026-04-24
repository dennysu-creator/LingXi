// ═══════════════════════════════════════════════════════════════
// Stable device identifier for trial-abuse analytics (weak signal).
// Not a security boundary — real enforcement is via server attestation.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'lingxi-device-id';

export interface DeviceIdState {
  deviceId: string | null;
  platform: 'ios' | 'android' | 'web' | 'other';
  loading: boolean;
}

let cachedDeviceId: string | null = null;

export async function getDeviceIdAsync(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  // 1) AsyncStorage is the stickiest — survives IDFV rotation across reinstalls
  //    ONLY IF the user has other app data; otherwise also cleared.
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  // 2) Native vendor ID.
  let nativeId: string | null = null;
  try {
    if (Platform.OS === 'ios') {
      nativeId = await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === 'android') {
      nativeId = Application.getAndroidId();
    }
  } catch {
    // ignore
  }

  // 3) Fallback UUID v4.
  const finalId = nativeId || Crypto.randomUUID();
  await AsyncStorage.setItem(STORAGE_KEY, finalId);
  cachedDeviceId = finalId;
  return finalId;
}

export function getPlatformTag(): 'ios' | 'android' | 'web' | 'other' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'web') return 'web';
  return 'other';
}

export function useDeviceId(): DeviceIdState {
  const [state, setState] = useState<DeviceIdState>({
    deviceId: cachedDeviceId,
    platform: getPlatformTag(),
    loading: !cachedDeviceId,
  });

  useEffect(() => {
    if (cachedDeviceId) return;
    let cancelled = false;
    (async () => {
      const id = await getDeviceIdAsync();
      if (!cancelled) {
        setState({ deviceId: id, platform: getPlatformTag(), loading: false });
      }
    })().catch((e) => {
      console.warn('[useDeviceId] failed:', e);
      if (!cancelled) setState((s) => ({ ...s, loading: false }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
