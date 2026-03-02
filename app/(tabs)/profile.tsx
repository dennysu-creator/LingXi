// ═══════════════════════════════════════
// 我的設定 — 個人資料、訂閱、語言、命盤
// ═══════════════════════════════════════

import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { useUserStore } from '@/stores/user-store';
import { usePetStore } from '@/stores/pet-store';
import { useAuthStore } from '@/stores/auth-store';
import { restorePurchases } from '@/services/subscription-service';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [isRestoring, setIsRestoring] = useState(false);
  const logout = useAuthStore(s => s.logout);

  const userName = useUserStore(s => s.userName);
  const birthYear = useUserStore(s => s.birthYear);
  const birthMonth = useUserStore(s => s.birthMonth);
  const birthDay = useUserStore(s => s.birthDay);
  const bazi = useUserStore(s => s.bazi);
  const ziwei = useUserStore(s => s.ziwei);
  const astrology = useUserStore(s => s.astrology);
  const planType = useUserStore(s => s.planType);

  const petName = usePetStore(s => s.name) || '靈寵';
  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petLevel = usePetStore(s => s.level);
  const solarTerm = usePetStore(s => s.solarTerm) || '';
  const element = usePetStore(s => s.element) || '';

  const planLabel = planType === 'supreme' ? t('profile.supreme')
    : planType === 'member' ? t('profile.member')
    : t('profile.free');

  const baziText = bazi
    ? `${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}`
    : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profile.title')}</Text>

      {/* ═══ 使用者資訊 ═══ */}
      <View style={styles.userCard}>
        <Text style={styles.userEmoji}>{petEmoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{userName || t('profile.guest')}</Text>
          <Text style={styles.userSub}>
            Lv.{petLevel} {petName} · {element}{t('pet.element')} · {solarTerm}
          </Text>
        </View>
        <View style={[styles.planBadge, planType === 'supreme' && styles.planBadgeSupreme]}>
          <Text style={[styles.planBadgeText, planType === 'supreme' && { color: '#a78bfa' }]}>
            {planLabel}
          </Text>
        </View>
      </View>

      {/* ═══ 訂閱狀態 ═══ */}
      {planType === 'free' && (
        <Pressable style={styles.upgradeCard}>
          <Text style={styles.upgradeText}>⭐ {t('profile.upgradeCta')}</Text>
        </Pressable>
      )}

      {/* ═══ 語言設定 ═══ */}
      <Text style={styles.sectionLabel}>{t('profile.language')}</Text>
      <View style={styles.sectionCard}>
        <LanguageSelector />
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

      {/* ═══ 其他 ═══ */}
      <Text style={styles.sectionLabel}>{t('profile.other')}</Text>
      <View style={styles.sectionCard}>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.notifications')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.privacy')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.terms')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>{t('profile.about')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.menuItem}
          onPress={async () => {
            setIsRestoring(true);
            try {
              const planType = await restorePurchases();
              useUserStore.getState().setPremium(planType);
              Alert.alert(t('profile.restoreSuccess', { defaultValue: '恢復購買成功' }));
            } catch {
              Alert.alert(t('profile.restoreFailed', { defaultValue: '恢復購買失敗' }));
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
          onPress={() => {
            Alert.alert(
              t('profile.logoutConfirm', { defaultValue: '確定要登出嗎？' }),
              '',
              [
                { text: t('common.cancel', { defaultValue: '取消' }), style: 'cancel' },
                { text: t('profile.logout'), style: 'destructive', onPress: () => logout() },
              ]
            );
          }}
        >
          <Text style={[styles.menuText, { color: Colors.danger }]}>{t('profile.logout')}</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingTop: 62, paddingBottom: 100 },
  title: { fontFamily: Fonts.brush, fontSize: 28, color: Colors.primary, marginBottom: 16 },

  // User card
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 16,
  },
  userEmoji: { fontSize: 36 },
  userName: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.serifBold },
  userSub: { fontSize: 11, color: Colors.textDark, marginTop: 2 },
  planBadge: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  planBadgeSupreme: {
    backgroundColor: 'rgba(160,100,255,0.12)',
  },
  planBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },

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
    fontSize: 12, color: Colors.textMuted, letterSpacing: 2,
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
  dataLabel: { fontSize: 12, color: Colors.textDark },
  dataValue: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.serif },

  // Menu items
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  menuText: { fontSize: 14, color: Colors.textSecondary },
  menuArrow: { fontSize: 18, color: Colors.textDarkest },
});
