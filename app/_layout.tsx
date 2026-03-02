// ═══════════════════════════════════════
// 靈犀 App 根佈局
// ═══════════════════════════════════════

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  NotoSerifTC_400Regular,
  NotoSerifTC_700Bold,
} from '@expo-google-fonts/noto-serif-tc';
import { MaShanZheng_400Regular } from '@expo-google-fonts/ma-shan-zheng';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from '@/stores/user-store';
import { useAuthStore } from '@/stores/auth-store';
import { initSubscriptionService, identifyUser } from '@/services/subscription-service';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/i18n'; // 初始化多語言系統

// 防止 Splash Screen 自動隱藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSerifTC_400Regular,
    NotoSerifTC_700Bold,
    MaShanZheng_400Regular,
  });

  const [authChecked, setAuthChecked] = useState(false);

  const isOnboarded = useUserStore(s => s.isOnboarded);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const authUser = useAuthStore(s => s.user);
  const checkAuth = useAuthStore(s => s.checkAuth);

  const router = useRouter();
  const segments = useSegments();

  // 初始化：檢查認證狀態 + 訂閱服務
  useEffect(() => {
    async function init() {
      try {
        await checkAuth();
        await initSubscriptionService();
      } catch {
        // 認證檢查失敗 → 當作未登入
      } finally {
        setAuthChecked(true);
      }
    }
    init();
  }, []);

  // 認證成功後設定 RevenueCat 用戶 ID
  useEffect(() => {
    if (isAuthenticated && authUser?.id) {
      identifyUser(authUser.id).catch(() => {});
    }
  }, [isAuthenticated, authUser?.id]);

  // 隱藏 Splash Screen
  useEffect(() => {
    if (fontsLoaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authChecked]);

  // 根據認證 + onboarding 狀態導航
  useEffect(() => {
    if (!fontsLoaded || !authChecked) return;

    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      // 未登入 → 導向認證頁
      if (!inAuth) {
        router.replace('/auth');
      }
    } else if (!isOnboarded) {
      // 已登入但未完成 onboarding → 導向 onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // 已登入且已完成 onboarding → 導向首頁
      if (inAuth || inOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [fontsLoaded, authChecked, isAuthenticated, isOnboarded, segments, router]);

  if (!fontsLoaded || !authChecked) return null;

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#08080f' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ErrorBoundary>
  );
}
