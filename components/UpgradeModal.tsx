// ═══════════════════════════════════════
// 升級方案彈窗 — 靈寵語音 + RevenueCat
// ═══════════════════════════════════════

import { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts } from '@/config/theme';
import { purchasePlan, SUBSCRIPTION_PLANS } from '@/services/subscription-service';
import { usePetStore } from '@/stores/pet-store';
import { useAuthStore } from '@/stores/auth-store';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const { t } = useTranslation();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const petEmoji = usePetStore(s => s.emoji) || '🐉';
  const petName = usePetStore(s => s.name) || '靈寵';

  const handlePurchase = async (planId: string) => {
    setIsPurchasing(true);
    try {
      const result = await purchasePlan(planId);
      if (result) {
        useAuthStore.getState().updatePlan(result);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '購買失敗';
      Alert.alert(t('upgrade.purchaseFailed', { defaultValue: '購買失敗' }), msg);
    } finally {
      setIsPurchasing(false);
    }
  };

  const memberPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'lingxi_member_monthly');
  const supremePlan = SUBSCRIPTION_PLANS.find(p => p.id === 'lingxi_supreme_monthly');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Pet voice header */}
          <View style={s.petVoice}>
            <View style={s.petEmojiWrap}>
              <Text style={s.petEmoji}>{petEmoji}</Text>
            </View>
            <Text style={s.petText}>
              {t('upgrade.petVoice', {
                petName,
                defaultValue: `主人，今天的次數用完了...升級之後${petName}可以為你做更多事喔！`,
              })}
            </Text>
          </View>

          {/* ─── Member plan ─── */}
          {memberPlan && (
            <Pressable
              style={({ pressed }) => [s.planCard, pressed && { opacity: 0.7 }]}
              onPress={() => handlePurchase(memberPlan.id)}
              disabled={isPurchasing}
            >
              <View style={s.planHeader}>
                <View style={s.planNameRow}>
                  <Text style={s.planIcon}>⭐</Text>
                  <Text style={s.planName}>{t('subscription.member')}</Text>
                </View>
                <View style={s.priceBadge}>
                  <Text style={s.planPrice}>${memberPlan.priceMonthly}</Text>
                  <Text style={s.priceUnit}>{t('subscription.perMonth')}</Text>
                </View>
              </View>
              <View style={s.featureList}>
                <Text style={s.planFeature}>· 靈眼/靈心/靈魂 5次/日</Text>
                <Text style={s.planFeature}>· 靈寵等級上限 Lv.20</Text>
                <Text style={s.planFeature}>· AI 深度解讀（Sonnet）</Text>
              </View>
              <View style={s.upgradeBtn}>
                <Text style={s.upgradeBtnText}>{t('upgrade.upgradeBtn', { defaultValue: '立即升級' })}</Text>
              </View>
            </Pressable>
          )}

          {/* ─── Supreme plan ─── */}
          {supremePlan && (
            <Pressable
              style={({ pressed }) => [s.planCard, s.planCardSupreme, pressed && { opacity: 0.7 }]}
              onPress={() => handlePurchase(supremePlan.id)}
              disabled={isPurchasing}
            >
              <View style={s.planHeader}>
                <View style={s.planNameRow}>
                  <Text style={s.planIcon}>👑</Text>
                  <Text style={[s.planName, { color: '#A78BFA' }]}>{t('subscription.supreme')}</Text>
                </View>
                <View style={[s.priceBadge, { backgroundColor: 'rgba(167,139,250,0.12)', borderColor: 'rgba(167,139,250,0.25)' }]}>
                  <Text style={[s.planPrice, { color: '#A78BFA' }]}>${supremePlan.priceMonthly}</Text>
                  <Text style={[s.priceUnit, { color: '#A78BFA' }]}>{t('subscription.perMonth')}</Text>
                </View>
              </View>
              <View style={s.featureList}>
                <Text style={s.planFeature}>· 全功能無限使用</Text>
                <Text style={s.planFeature}>· 靈寵等級無上限</Text>
                <Text style={s.planFeature}>· 專屬進化 + 皮膚</Text>
              </View>
              <View style={[s.upgradeBtn, { backgroundColor: 'rgba(167,139,250,0.12)', borderColor: 'rgba(167,139,250,0.25)' }]}>
                <Text style={[s.upgradeBtnText, { color: '#A78BFA' }]}>{t('upgrade.upgradeBtn', { defaultValue: '立即升級' })}</Text>
              </View>
            </Pressable>
          )}

          {isPurchasing && (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 8 }} />
          )}

          {/* Dismiss */}
          <Pressable
            style={({ pressed }) => [s.dismissBtn, pressed && { opacity: 0.6 }]}
            onPress={onClose}
            disabled={isPurchasing}
          >
            <Text style={s.dismissText}>
              {t('upgrade.laterBtn', { defaultValue: '明天再來' })}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '85%',
    padding: 24,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.18)',
    // Subtle golden glow
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  // ─── Pet voice ───
  petVoice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  petEmojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(232,197,71,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: { fontSize: 30 },
  petText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.serif,
    lineHeight: 22,
  },

  // ─── Plan cards ───
  planCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.18)',
  },
  planCardSupreme: {
    backgroundColor: 'rgba(167,139,250,0.06)',
    borderColor: 'rgba(167,139,250,0.18)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planIcon: { fontSize: 24 },
  planName: {
    fontSize: 20,
    color: Colors.primary,
    fontFamily: Fonts.brush,
    letterSpacing: 2,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.20)',
  },
  planPrice: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 10,
    color: Colors.primary,
    opacity: 0.7,
  },
  featureList: {
    gap: 4,
    marginBottom: 12,
  },
  planFeature: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 20,
    fontFamily: Fonts.serif,
  },
  upgradeBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.22)',
  },
  upgradeBtnText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },

  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 6,
  },
  dismissText: {
    fontSize: 16,
    color: Colors.textDarkest,
    fontFamily: Fonts.serif,
  },
});
