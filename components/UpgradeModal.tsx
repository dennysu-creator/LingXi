// ═══════════════════════════════════════
// 升級方案彈窗 — 靈寵語音 + RevenueCat
// ═══════════════════════════════════════

import { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
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
    } catch {
      // silently fail — RevenueCat shows its own error UI
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
            <Text style={s.petEmoji}>{petEmoji}</Text>
            <Text style={s.petText}>
              {t('upgrade.petVoice', {
                petName,
                defaultValue: `主人，今天的次數用完了...升級之後${petName}可以為你做更多事喔！`,
              })}
            </Text>
          </View>

          {/* Member plan */}
          {memberPlan && (
            <Pressable
              style={({ pressed }) => [s.planCard, pressed && { opacity: 0.7 }]}
              onPress={() => handlePurchase(memberPlan.id)}
              disabled={isPurchasing}
            >
              <View style={s.planHeader}>
                <Text style={s.planName}>⭐ {t('subscription.member')}</Text>
                <Text style={s.planPrice}>${memberPlan.priceMonthly}{t('subscription.perMonth')}</Text>
              </View>
              <Text style={s.planFeature}>{t('upgrade.memberF1', { defaultValue: '· 靈眼/靈心/靈魂 5次/日' })}</Text>
              <Text style={s.planFeature}>{t('upgrade.memberF2', { defaultValue: '· 靈寵等級上限 Lv.20' })}</Text>
              <Text style={s.planFeature}>{t('upgrade.memberF3', { defaultValue: '· AI 深度解讀（Sonnet）' })}</Text>
              <View style={s.upgradeBtn}>
                <Text style={s.upgradeBtnText}>{t('upgrade.upgradeBtn', { defaultValue: '立即升級' })}</Text>
              </View>
            </Pressable>
          )}

          {/* Supreme plan */}
          {supremePlan && (
            <Pressable
              style={({ pressed }) => [s.planCard, s.planCardSupreme, pressed && { opacity: 0.7 }]}
              onPress={() => handlePurchase(supremePlan.id)}
              disabled={isPurchasing}
            >
              <View style={s.planHeader}>
                <Text style={[s.planName, { color: '#a78bfa' }]}>👑 {t('subscription.supreme')}</Text>
                <Text style={[s.planPrice, { color: '#a78bfa' }]}>${supremePlan.priceMonthly}{t('subscription.perMonth')}</Text>
              </View>
              <Text style={s.planFeature}>{t('upgrade.supremeF1', { defaultValue: '· 全功能無限使用' })}</Text>
              <Text style={s.planFeature}>{t('upgrade.supremeF2', { defaultValue: '· 靈寵等級無上限' })}</Text>
              <Text style={s.planFeature}>{t('upgrade.supremeF3', { defaultValue: '· 專屬進化 + 皮膚' })}</Text>
              <View style={[s.upgradeBtn, { backgroundColor: 'rgba(160,100,255,0.12)' }]}>
                <Text style={[s.upgradeBtnText, { color: '#a78bfa' }]}>{t('upgrade.upgradeBtn', { defaultValue: '立即升級' })}</Text>
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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    width: '85%', padding: 24, borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },

  petVoice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginBottom: 20,
  },
  petEmoji: { fontSize: 32 },
  petText: {
    flex: 1, fontSize: 14, color: Colors.textSecondary,
    fontFamily: Fonts.serif, lineHeight: 22,
  },

  planCard: {
    padding: 16, borderRadius: 14, marginBottom: 10,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },
  planCardSupreme: {
    backgroundColor: 'rgba(160,100,255,0.06)',
    borderColor: 'rgba(160,100,255,0.15)',
  },
  planHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  planName: { fontSize: 16, color: Colors.primary, fontFamily: Fonts.serifBold },
  planPrice: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  planFeature: { fontSize: 12, color: Colors.textDark, lineHeight: 20, marginBottom: 2 },
  upgradeBtn: {
    marginTop: 10, paddingVertical: 10, borderRadius: 10, alignItems: 'center' as const,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  upgradeBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' as const },

  dismissBtn: {
    alignItems: 'center', paddingVertical: 14, marginTop: 6,
  },
  dismissText: { fontSize: 14, color: Colors.textDarkest },
});
