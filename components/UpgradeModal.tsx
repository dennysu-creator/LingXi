// ═══════════════════════════════════════════════════════════════
// 升級方案彈窗 — 月/年兩個產品、單一 paid entitlement
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts } from '@/config/theme';
import {
  purchasePlan,
  restorePurchases,
  PAID_PRODUCTS,
} from '@/services/subscription-service';
import { api } from '@/services/api-client';
import { usePetStore } from '@/stores/pet-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import {
  PRODUCT_ID_MONTHLY,
  PRODUCT_ID_YEARLY,
  type PlanType,
  type SubscriptionStatus,
} from '@/types/shared';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

// Soft server sync after any purchase/restore so DB reflects RC reality
// even before the webhook arrives.
async function syncServerSubscription(): Promise<void> {
  try {
    const result = await api.post<{
      subscriptionStatus: SubscriptionStatus;
      subscriptionProductId: string | null;
    }>('/api/subscription/sync');
    useUserStore
      .getState()
      .setPremium(
        result.subscriptionStatus === 'active' || result.subscriptionStatus === 'in_grace'
          ? 'paid'
          : 'free',
        result.subscriptionStatus,
      );
  } catch (err) {
    console.warn('[UpgradeModal] syncServerSubscription failed:', err);
  }
}

export default function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const { t } = useTranslation();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const petEmoji = usePetStore((s) => s.emoji) || '🐉';
  const petName = usePetStore((s) => s.name) || '靈寵';

  const trialUsed = useUserStore((s) => s.trialUsed);
  const trialLimit = useUserStore((s) => s.trialLimit);

  const monthly = PAID_PRODUCTS.find((p) => p.id === PRODUCT_ID_MONTHLY);
  const yearly = PAID_PRODUCTS.find((p) => p.id === PRODUCT_ID_YEARLY);

  const handlePurchase = async (productId: string) => {
    setIsPurchasing(true);
    try {
      const result = await purchasePlan(productId);
      if (result.cancelled) return;
      if (result.planType === 'paid') {
        useAuthStore.getState().updatePlan('paid' as PlanType);
        await syncServerSubscription();
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '購買失敗';
      Alert.alert(t('upgrade.purchaseFailed', { defaultValue: '購買失敗' }), msg);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await restorePurchases();
      await syncServerSubscription();
      if (result.planType === 'paid') {
        useAuthStore.getState().updatePlan('paid' as PlanType);
        Alert.alert(t('upgrade.restoreSuccess', { defaultValue: '已恢復訂閱' }));
        onClose();
      } else {
        Alert.alert(
          t('upgrade.restoreNothing', { defaultValue: '未找到有效訂閱' }),
          t('upgrade.restoreNothingDesc', {
            defaultValue: '您的 Apple ID 尚未購買靈犀訂閱',
          }),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '恢復失敗';
      Alert.alert(t('upgrade.restoreFailed', { defaultValue: '恢復失敗' }), msg);
    } finally {
      setIsRestoring(false);
    }
  };

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
                defaultValue: `主人，${petName}想陪你探索更多天機，訂閱後能為你無限次解讀～`,
              })}
            </Text>
          </View>

          {/* Trial progress (only shows if free) */}
          {trialLimit > 0 && trialUsed < trialLimit && (
            <Text style={s.trialInfo}>
              {t('upgrade.trialRemaining', {
                remaining: trialLimit - trialUsed,
                total: trialLimit,
                defaultValue: `免費體驗剩餘 ${trialLimit - trialUsed}/${trialLimit} 次`,
              })}
            </Text>
          )}

          {/* Feature bullets (shared across both plans) */}
          <View style={s.featureBlock}>
            <Text style={s.featureItem}>· {t('upgrade.featDaily', { defaultValue: '每日最多 100 次 AI 解讀' })}</Text>
            <Text style={s.featureItem}>· {t('upgrade.featAi', { defaultValue: 'AI 深度命理解讀' })}</Text>
            <Text style={s.featureItem}>· {t('upgrade.featPet', { defaultValue: '靈寵成長無上限' })}</Text>
            <Text style={s.featureItem}>· {t('upgrade.featShare', { defaultValue: '專屬靈寵分享卡' })}</Text>
          </View>

          {/* Yearly plan (highlighted) */}
          {yearly && (
            <Pressable
              style={({ pressed }) => [s.planCard, s.planCardYearly, pressed && { opacity: 0.85 }]}
              onPress={() => handlePurchase(yearly.id)}
              disabled={isPurchasing || isRestoring}
            >
              <View style={s.badgeWrap}>
                <Text style={s.badgeText}>
                  {t('subscription.savingsBadge', { defaultValue: '省 16%' })}
                </Text>
              </View>
              <View style={s.planHeader}>
                <Text style={s.planName}>
                  {t('subscription.yearly', { defaultValue: '年付方案' })}
                </Text>
                <View style={s.priceBadgeYearly}>
                  <Text style={s.planPriceYearly}>{yearly.priceDisplay}</Text>
                  <Text style={s.priceUnitYearly}>
                    {t('subscription.perYear', { defaultValue: '/年' })}
                  </Text>
                </View>
              </View>
              <Text style={s.planSubtext}>
                {t('subscription.yearlyEquiv', {
                  monthly: Math.round(1999 / 12),
                  defaultValue: `約 NT$${Math.round(1999 / 12)}/月，最划算`,
                })}
              </Text>
              <View style={s.upgradeBtnYearly}>
                <Text style={s.upgradeBtnTextYearly}>
                  {t('upgrade.subscribeYearly', { defaultValue: '訂閱年付' })}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Monthly plan */}
          {monthly && (
            <Pressable
              style={({ pressed }) => [s.planCard, pressed && { opacity: 0.85 }]}
              onPress={() => handlePurchase(monthly.id)}
              disabled={isPurchasing || isRestoring}
            >
              <View style={s.planHeader}>
                <Text style={s.planName}>
                  {t('subscription.monthly', { defaultValue: '月付方案' })}
                </Text>
                <View style={s.priceBadge}>
                  <Text style={s.planPrice}>{monthly.priceDisplay}</Text>
                  <Text style={s.priceUnit}>
                    {t('subscription.perMonth', { defaultValue: '/月' })}
                  </Text>
                </View>
              </View>
              <View style={s.upgradeBtn}>
                <Text style={s.upgradeBtnText}>
                  {t('upgrade.subscribeMonthly', { defaultValue: '訂閱月付' })}
                </Text>
              </View>
            </Pressable>
          )}

          {(isPurchasing || isRestoring) && (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 8 }} />
          )}

          {/* Restore + dismiss */}
          <View style={s.footerRow}>
            <Pressable
              style={({ pressed }) => [s.footerBtn, pressed && { opacity: 0.6 }]}
              onPress={handleRestore}
              disabled={isPurchasing || isRestoring}
            >
              <Text style={s.footerText}>
                {t('upgrade.restore', { defaultValue: '恢復購買' })}
              </Text>
            </Pressable>
            <Text style={s.footerDot}>·</Text>
            <Pressable
              style={({ pressed }) => [s.footerBtn, pressed && { opacity: 0.6 }]}
              onPress={onClose}
              disabled={isPurchasing || isRestoring}
            >
              <Text style={s.footerText}>
                {t('upgrade.laterBtn', { defaultValue: '稍後再說' })}
              </Text>
            </Pressable>
          </View>

          {/* Legal disclosure — required by Apple 3.1.2 */}
          <Text style={s.legal}>
            {t('upgrade.legal', {
              defaultValue:
                '訂閱會自動續訂，可隨時於 App Store 管理。退款由 Apple 處理，取消後不會恢復免費體驗次數。',
            })}
          </Text>
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
    width: '88%',
    padding: 22,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.18)',
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  petVoice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  petEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232,197,71,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: { fontSize: 28 },
  petText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.serif,
    lineHeight: 22,
  },
  trialInfo: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.85,
    fontFamily: Fonts.serif,
    textAlign: 'center',
    marginBottom: 10,
  },
  featureBlock: {
    gap: 4,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    fontFamily: Fonts.serif,
  },

  planCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.18)',
  },
  planCardYearly: {
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderColor: 'rgba(74,222,128,0.30)',
    borderWidth: 1.5,
  },
  badgeWrap: {
    position: 'absolute',
    top: -10,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#4ADE80',
  },
  badgeText: {
    fontSize: 11,
    color: '#08080f',
    fontWeight: '800',
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: Fonts.brush,
    letterSpacing: 2,
  },
  planSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
    fontFamily: Fonts.serif,
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
  priceBadgeYearly: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.30)',
  },
  planPrice: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
  planPriceYearly: {
    fontSize: 18,
    color: '#4ADE80',
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 10,
    color: Colors.primary,
    opacity: 0.7,
  },
  priceUnitYearly: {
    fontSize: 10,
    color: '#4ADE80',
    opacity: 0.85,
  },
  upgradeBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.22)',
  },
  upgradeBtnYearly: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
  },
  upgradeBtnText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  upgradeBtnTextYearly: {
    fontSize: 15,
    color: '#4ADE80',
    fontWeight: '700',
    letterSpacing: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  footerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textDarkest,
    fontFamily: Fonts.serif,
  },
  footerDot: {
    color: Colors.textDarkest,
    marginHorizontal: 2,
  },
  legal: {
    fontSize: 10,
    color: Colors.textDarkest,
    opacity: 0.6,
    marginTop: 4,
    lineHeight: 15,
    textAlign: 'center',
    fontFamily: Fonts.serif,
  },
});
