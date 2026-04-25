// ═══════════════════════════════════════
// 登入 / 註冊頁面
// Apple Sign-In + Email/Password
// ═══════════════════════════════════════

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '@/stores/auth-store';
import { Colors, Fonts } from '@/config/theme';
import { LOGO } from '@/assets/images';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { t } = useTranslation();

  // ─── Auth store ───
  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const loginWithApple = useAuthStore(s => s.loginWithApple);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  // ─── Local state ───
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // ─── 導航邏輯 ───
  const navigateAfterAuth = useCallback((isNewUser?: boolean) => {
    if (isNewUser) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/pet');
    }
  }, []);

  // ─── Email 登入 ───
  const handleEmailAuth = useCallback(async () => {
    if (!email.trim() || !password.trim()) return;
    if (mode === 'register' && !name.trim()) return;

    clearError();

    try {
      let result: { isNewUser?: boolean };

      if (mode === 'register') {
        result = await register(email.trim(), password, name.trim());
      } else {
        result = await login(email.trim(), password);
      }

      navigateAfterAuth(result.isNewUser);
    } catch {
      // 錯誤已由 store 處理並設置 error state
    }
  }, [email, password, name, mode, login, register, clearError, navigateAfterAuth]);

  // ─── Apple Sign-In ───
  const handleAppleSignIn = useCallback(async () => {
    clearError();

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return;
      }

      const result = await loginWithApple(credential.identityToken);
      navigateAfterAuth(result.isNewUser);
    } catch (err: unknown) {
      // 用戶取消 Apple Sign-In 不視為錯誤
      if (err instanceof Error && 'code' in err && (err as Error & { code: string }).code === 'ERR_REQUEST_CANCELED') return;
      // 其他錯誤已由 store 處理
    }
  }, [loginWithApple, clearError, navigateAfterAuth]);

  // ─── 切換模式 ───
  const toggleMode = useCallback(() => {
    clearError();
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
  }, [clearError]);

  // ─── 表單驗證 ───
  const isFormValid =
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    (mode === 'login' || name.trim().length > 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ Logo 區域 ═══ */}
        <View style={styles.logoSection}>
          <Image source={LOGO.splash} style={styles.logoImage} />
          <Image source={LOGO.splashText} style={styles.logoTextImage} />
          <Text style={styles.logoTagline}>{t('app.tagline', { defaultValue: '東方智慧 · AI 靈寵' })}</Text>
        </View>

        {/* ═══ Apple Sign-In（iOS 優先顯示）═══ */}
        {Platform.OS === 'ios' && (
          <View style={styles.appleSection}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={14}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />

            {/* 分隔線 */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or', { defaultValue: '或' })}</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        )}

        {/* ═══ 錯誤提示 ═══ */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ═══ 表單區域 ═══ */}
        <View style={styles.formSection}>
          {/* 模式標題 */}
          <Text style={styles.formTitle}>
            {mode === 'login'
              ? t('auth.loginTitle', { defaultValue: '登入帳號' })
              : t('auth.registerTitle', { defaultValue: '註冊帳號' })}
          </Text>

          {/* 姓名（註冊模式） */}
          {mode === 'register' && (
            <>
              <Text style={styles.inputLabel}>
                {t('auth.nameLabel', { defaultValue: '姓名' })}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('auth.namePlaceholder', { defaultValue: '請輸入你的名字' })}
                placeholderTextColor={Colors.textDarkest}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={30}
                editable={!isLoading}
              />
            </>
          )}

          {/* Email */}
          <Text style={styles.inputLabel}>
            {t('auth.emailLabel', { defaultValue: '電子郵件' })}
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('auth.emailPlaceholder', { defaultValue: 'your@email.com' })}
            placeholderTextColor={Colors.textDarkest}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
            editable={!isLoading}
          />

          {/* 密碼 */}
          <Text style={styles.inputLabel}>
            {t('auth.passwordLabel', { defaultValue: '密碼' })}
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('auth.passwordPlaceholder', { defaultValue: '請輸入密碼' })}
            placeholderTextColor={Colors.textDarkest}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            maxLength={64}
            editable={!isLoading}
          />

          {/* 登入 / 註冊按鈕 */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              (!isFormValid || isLoading) && styles.disabledBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleEmailAuth}
            disabled={!isFormValid || isLoading}
          >
            <LinearGradient
              colors={['rgba(232,197,71,0.20)', 'rgba(232,197,71,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'login'
                    ? t('auth.loginButton', { defaultValue: '登入' })
                    : t('auth.registerButton', { defaultValue: '註冊' })}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* 切換模式 */}
          <Pressable
            style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.6 }]}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.switchText}>
              {mode === 'login'
                ? t('auth.switchToRegister', { defaultValue: '沒有帳號？註冊' })
                : t('auth.switchToLogin', { defaultValue: '已有帳號？登入' })}
            </Text>
          </Pressable>
        </View>


        {/* ═══ 底部間距 ═══ */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ═══ 全螢幕 Loading 遮罩 ═══ */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>
            {t('auth.authenticating', { defaultValue: '認證中...' })}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ═══════════════════════════════════════
// 樣式
// ═══════════════════════════════════════

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 30,
    paddingTop: 80,
    paddingBottom: 60,
    minHeight: '100%',
  },

  // ─── Logo ───
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  logoTextImage: {
    width: 200,
    height: 70,
    resizeMode: 'contain',
    marginTop: 4,
  },
  logoTagline: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    color: Colors.primary,
    opacity: 0.6,
    marginTop: 8,
    letterSpacing: 4,
  },

  // ─── Apple Sign-In ───
  appleSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textDarkest,
    marginHorizontal: 16,
    fontFamily: Fonts.serif,
  },

  // ─── 錯誤提示 ───
  errorBox: {
    backgroundColor: 'rgba(196,64,64,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196,64,64,0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontFamily: Fonts.serif,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ─── 表單 ───
  formSection: {
    width: '100%',
  },
  formTitle: {
    fontFamily: Fonts.brush,
    fontSize: 24,
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textDark,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.15)',
    color: Colors.primary,
    fontSize: 17,
    fontFamily: Fonts.serif,
  },

  // ─── 按鈕 ───
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.35)',
    marginTop: 24,
    minHeight: 56,
  },
  primaryBtnGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  primaryBtnText: {
    color: Colors.primary,
    fontSize: 18,
    fontFamily: Fonts.serifBold,
    letterSpacing: 4,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  switchBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.serif,
  },

  // ─── Loading 遮罩 ───
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,15,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: Fonts.serif,
    marginTop: 16,
    letterSpacing: 2,
  },

  // ─── 底部間距 ───
  bottomSpacer: {
    height: 40,
  },
});
