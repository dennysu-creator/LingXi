// ═══════════════════════════════════════
// 我的設定 — 個人資料、訂閱、語言、命盤
// ═══════════════════════════════════════

import { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator, Platform, Linking, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { useUserStore } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { useAudioStore } from '@/stores/audio-store';
import { restorePurchases } from '@/services/subscription-service';
import { playSfx, setMuted as setAudioMuted, setMusicVolume, setSfxVolume } from '@/services/audio-controller';
import { getPetImage } from '@/assets/images';
import LanguageSelector from '@/components/LanguageSelector';
import PetChat from '@/components/PetChat';
import UpgradeModal from '@/components/UpgradeModal';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const logout = useAuthStore(s => s.logout);
  const hasMessages = useChatStore(s => s.messages.length > 0);

  const userName = useUserStore(s => s.userName);
  const birthYear = useUserStore(s => s.birthYear);
  const birthMonth = useUserStore(s => s.birthMonth);
  const birthDay = useUserStore(s => s.birthDay);
  const bazi = useUserStore(s => s.bazi);
  const ziwei = useUserStore(s => s.ziwei);
  const astrology = useUserStore(s => s.astrology);
  const planType = useUserStore(s => s.planType);

  // 音效設定
  const audioMuted = useAudioStore(s => s.muted);
  const musicVolume = useAudioStore(s => s.musicVolume);
  const sfxVolume = useAudioStore(s => s.sfxVolume);

  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petLevel = usePetStore(s => s.level);
  const solarTerm = usePetStore(s => s.solarTerm) || '';
  const element = usePetStore(s => s.element) || '';
  const petId = usePetStore(s => s.petId) || '01-lichun';

  const isPaid = planType === 'paid' || planType === 'member' || planType === 'supreme';
  const planLabel = isPaid
    ? t('profile.paid', { defaultValue: '靈犀訂閱' })
    : t('profile.free');

  const baziText = bazi
    ? `${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}`
    : '—';
  const webBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';

  const showMessage = (message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(message);
      return;
    }
    Alert.alert(message);
  };

  const confirmLogout = () => {
    const message = t('profile.logoutConfirm', { defaultValue: '確定要登出嗎？' });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(message)) {
        void logout();
      }
      return;
    }

    Alert.alert(
      message,
      '',
      [
        { text: t('common.cancel', { defaultValue: '取消' }), style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const openPolicyPage = async (path: 'privacy-policy.html' | 'terms-of-service.html') => {
    if (!webBaseUrl) {
      showMessage(t('common.error', { defaultValue: '發生錯誤' }));
      return;
    }

    try {
      await Linking.openURL(`${webBaseUrl}/${path}`);
    } catch {
      showMessage(t('common.error', { defaultValue: '發生錯誤' }));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.navigate('/(tabs)/pet')}>
        <Text style={styles.backBtnText}>← {t('tabs.pet', { defaultValue: '靈寵' })}</Text>
      </Pressable>
      <Text style={styles.title}>{t('profile.title')}</Text>

      {/* ═══ 使用者資訊 ═══ */}
      <View style={styles.userCard}>
        {(() => {
          const petImage = getPetImage(petId, 'avatar');
          return petImage
            ? <Image source={petImage} style={styles.userAvatar} />
            : <Text style={styles.userEmoji}>{petEmoji}</Text>;
        })()}
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{userName || t('profile.guest')}</Text>
          <Text style={styles.userSub}>
            Lv.{petLevel} {petName} · {element}{t('pet.element')} · {solarTerm}
          </Text>
        </View>
        <View style={[
          styles.planBadge,
          isPaid && styles.planBadgePaid,
          !isPaid && styles.planBadgeFree,
        ]}>
          <Text style={[
            styles.planBadgeText,
            !isPaid && { color: Colors.textDark },
          ]}>
            {planLabel}
          </Text>
        </View>
      </View>

      {/* ═══ 訂閱狀態 ═══ */}
      {planType === 'free' && (
        <Pressable style={styles.upgradeCard} onPress={() => setShowUpgrade(true)}>
          <Text style={styles.upgradeText}>⭐ {t('profile.upgradeCta', { defaultValue: '升級會員解鎖更多功能' })}</Text>
        </Pressable>
      )}

      {/* ═══ 語言設定 ═══ */}
      <Text style={styles.sectionLabel}>{t('profile.language')}</Text>
      <View style={styles.sectionCard}>
        <LanguageSelector />
      </View>

      {/* ═══ 聲音設定 ═══ */}
      <Text style={styles.sectionLabel}>{t('audio.title', { defaultValue: '聲音' })}</Text>
      <View style={styles.sectionCard}>
        {/* 靜音 toggle */}
        <View style={styles.audioRow}>
          <Text style={styles.dataLabel}>{t('audio.muted', { defaultValue: '靜音' })}</Text>
          <Switch
            value={audioMuted}
            onValueChange={(v) => setAudioMuted(v)}
            trackColor={{ false: 'rgba(255,255,255,0.18)', true: 'rgba(232,197,71,0.6)' }}
            thumbColor={audioMuted ? '#e8c547' : '#ccc'}
          />
        </View>
        {/* 背景音樂音量 */}
        <View style={styles.audioColumn}>
          <View style={styles.audioRow}>
            <Text style={styles.dataLabel}>{t('audio.musicVolume', { defaultValue: '背景音樂音量' })}</Text>
            <Text style={styles.dataValue}>{Math.round(musicVolume * 100)}%</Text>
          </View>
          <View style={styles.audioStepRow}>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <Pressable
                key={v}
                onPress={() => setMusicVolume(v)}
                style={({ pressed }) => [
                  styles.audioStep,
                  Math.abs(musicVolume - v) < 0.01 && styles.audioStepActive,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.audioStepText}>{Math.round(v * 100)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {/* SFX 音量 */}
        <View style={styles.audioColumn}>
          <View style={styles.audioRow}>
            <Text style={styles.dataLabel}>{t('audio.sfxVolume', { defaultValue: '音效音量' })}</Text>
            <Text style={styles.dataValue}>{Math.round(sfxVolume * 100)}%</Text>
          </View>
          <View style={styles.audioStepRow}>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <Pressable
                key={v}
                onPress={() => { setSfxVolume(v); playSfx('notification'); }}
                style={({ pressed }) => [
                  styles.audioStep,
                  Math.abs(sfxVolume - v) < 0.01 && styles.audioStepActive,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.audioStepText}>{Math.round(v * 100)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {/* 試聽 */}
        <Pressable
          style={({ pressed }) => [styles.audioPreviewBtn, pressed && { opacity: 0.7 }]}
          onPress={() => playSfx('achievement')}
        >
          <Text style={styles.audioPreviewText}>{t('audio.testSfx', { defaultValue: '試聽音效' })}</Text>
        </Pressable>
      </View>

      {/* ═══ 命盤資料 ═══ */}
      <Text style={styles.sectionLabel}>{t('profile.destinyData')}</Text>
      <View style={styles.sectionCard}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>{t('profile.bazi')}</Text>
          <Text style={styles.dataValue}>{baziText}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>{t('profile.ziweiMain')}</Text>
          <Text style={styles.dataValue}>
            {ziwei?.mingGong.mainStars[0]?.name || '—'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>{t('profile.zodiac')}</Text>
          <Text style={styles.dataValue}>
            {astrology?.signChinese || '—'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>{t('profile.solarTermPet')}</Text>
          <Text style={styles.dataValue}>
            {petEmoji} {petName}（{solarTerm}）
          </Text>
        </View>
      </View>

      {/* ═══ 歷史回覆 ═══ */}
      {hasMessages && (
        <>
          <Text style={styles.sectionLabel}>{t('profile.chatHistory', { defaultValue: '歷史回覆' })}</Text>
          <Pressable
            style={styles.sectionCard}
            onPress={() => setShowHistory(!showHistory)}
          >
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>
                {showHistory
                  ? t('profile.hideHistory', { defaultValue: '收起對話記錄' })
                  : t('profile.showHistory', { defaultValue: '查看對話記錄' })}
              </Text>
              <Text style={styles.menuArrow}>{showHistory ? '▲' : '▼'}</Text>
            </View>
          </Pressable>
          {showHistory && (
            <View style={styles.chatHistoryContainer}>
              <PetChat petEmoji={petEmoji} petName={petName} isLoading={false} />
            </View>
          )}
        </>
      )}

      {/* ═══ 其他 ═══ */}
      <Text style={styles.sectionLabel}>{t('profile.other')}</Text>
      <View style={styles.sectionCard}>
        <Pressable
          style={styles.menuItem}
          onPress={() => showMessage(t('profile.notifications', { defaultValue: '推播通知' }))}
        >
          <Text style={styles.menuText}>{t('profile.notifications')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => openPolicyPage('privacy-policy.html')}>
          <Text style={styles.menuText}>{t('profile.privacy')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => openPolicyPage('terms-of-service.html')}>
          <Text style={styles.menuText}>{t('profile.terms')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.menuItem}
          onPress={() => showMessage(`${t('app.name', { defaultValue: '靈犀' })} v1.0.0`)}
        >
          <Text style={styles.menuText}>{t('profile.about')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.menuItem}
          onPress={async () => {
            setIsRestoring(true);
            try {
              const result = await restorePurchases();
              useAuthStore.getState().updatePlan(result.planType);
              // Server sync — webhook may not have arrived yet.
              try {
                const { api } = await import('@/services/api-client');
                await api.post('/api/subscription/sync');
                // Re-pull profile to refresh trial + subscription mirror.
                await useAuthStore.getState().checkAuth();
              } catch (err) {
                console.warn('[profile] restore sync failed:', err);
              }
              showMessage(t('profile.restoreSuccess', { defaultValue: '恢復購買成功' }));
            } catch {
              showMessage(t('profile.restoreFailed', { defaultValue: '恢復購買失敗' }));
            } finally {
              setIsRestoring(false);
            }
          }}
        >
          <Text style={styles.menuText}>
            {isRestoring ? '...' : t('profile.restorePurchases', { defaultValue: '恢復購買' })}
          </Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={confirmLogout}
        >
          <Text style={[styles.menuText, { color: Colors.danger }]}>{t('profile.logout')}</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 100 },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  backBtnText: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: Fonts.serif,
  },
  title: { fontFamily: Fonts.brush, fontSize: 28, color: Colors.primary, marginBottom: 16 },

  // User card
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 16,
  },
  userAvatar: { width: 70, height: 70, borderRadius: 35 },
  userEmoji: { fontSize: 36 },
  userName: { fontSize: 20, color: Colors.primary, fontFamily: Fonts.brush },
  userSub: { fontSize: 13, color: Colors.textDark, marginTop: 2 },
  planBadge: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.15)',
  },
  planBadgeFree: {
    backgroundColor: 'rgba(150,150,150,0.15)',
  },
  planBadgePaid: {
    backgroundColor: 'rgba(232,197,71,0.15)',
  },
  planBadgeText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  // Upgrade CTA
  upgradeCard: {
    padding: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.2)',
    marginBottom: 20,
  },
  upgradeText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  // Section
  sectionLabel: {
    fontSize: 13, color: Colors.textMuted, letterSpacing: 2,
    marginBottom: 10, fontFamily: Fonts.serif,
  },
  sectionCard: {
    padding: 14, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.08)',
    marginBottom: 20,
  },

  // Data rows
  dataRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  dataLabel: { fontSize: 13, color: Colors.textDark },
  dataValue: { fontSize: 15, color: Colors.textSecondary, fontFamily: Fonts.serif },

  // Menu items
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  menuText: { fontSize: 16, color: Colors.textSecondary },
  menuArrow: { fontSize: 18, color: Colors.textDarkest },

  // Chat history
  chatHistoryContainer: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,8,15,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.08)',
    marginBottom: 20,
  },

  // 音效設定
  audioRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
  },
  audioColumn: {
    paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
  },
  audioStepRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 6,
  },
  audioStep: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  audioStepActive: {
    backgroundColor: 'rgba(232,197,71,0.15)',
    borderColor: 'rgba(232,197,71,0.45)',
  },
  audioStepText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.serif },
  audioPreviewBtn: {
    marginTop: 12, paddingVertical: 10, alignItems: 'center', borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.10)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.20)',
  },
  audioPreviewText: { fontSize: 13, color: Colors.primary, fontWeight: '600', letterSpacing: 1 },
});
