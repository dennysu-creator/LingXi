// ═══════════════════════════════════════
// 靈寵中心 Hub — 養成 + 靈眼 + 靈心 + 靈魂
// 四大模式整合於此 Tab
// ═══════════════════════════════════════

import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { usePetStore, LEVEL_UNLOCKS, getUnlockedFeatures, getNextUnlock } from '@/stores/pet-store';
import { useUserStore } from '@/stores/user-store';
import { purchasePlan, SUBSCRIPTION_PLANS } from '@/services/subscription-service';
import PetEyeMode from '@/components/features/PetEyeMode';
import PetHeartMode from '@/components/features/PetHeartMode';
import PetPearlMode from '@/components/features/PetPearlMode';

export type PetMode = 'nurture' | 'eye' | 'heart' | 'pearl';

// ─── 模式定義 ───
const MODES: { key: PetMode; emoji: string; labelKey: string }[] = [
  { key: 'nurture', emoji: '🐾', labelKey: 'pet.modeNurture' },
  { key: 'eye', emoji: '👁', labelKey: 'pet.modeEye' },
  { key: 'heart', emoji: '🌍', labelKey: 'pet.modeHeart' },
  { key: 'pearl', emoji: '🏮', labelKey: 'pet.modePearl' },
];

// ─── 分數條 ───
function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── 等級解鎖圖示 ───
const UNLOCK_ICONS: Record<number, string> = {
  1: '💬', 3: '🔔', 5: '👔', 8: '🧭', 10: '✨', 15: '🔮', 20: '🌟', 25: '📡', 30: '👑',
};

export default function PetScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ mode?: string }>();

  // 若從首頁快速入口帶入 mode 參數
  const initialMode = (params.mode as PetMode) || 'nurture';
  const [mode, setMode] = useState<PetMode>(initialMode);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = useCallback(async (planId: string) => {
    setIsPurchasing(true);
    try {
      const result = await purchasePlan(planId);
      if (result) {
        useUserStore.getState().setPremium(result);
        setShowUpgradeModal(false);
      }
    } catch {
      Alert.alert(t('upgrade.purchaseFailed', { defaultValue: '購買失敗，請稍後再試' }));
    } finally {
      setIsPurchasing(false);
    }
  }, [t]);

  const name = usePetStore(s => s.name) || '小玄';
  const emoji = usePetStore(s => s.emoji) || '🐉';
  const creature = usePetStore(s => s.creature) || '水龍';
  const element = usePetStore(s => s.element) || '水';
  const level = usePetStore(s => s.level);
  const exp = usePetStore(s => s.exp);
  const expToNext = usePetStore(s => s.expToNext);
  const evolution = usePetStore(s => s.evolution);
  const power = usePetStore(s => s.power);
  const affinity = usePetStore(s => s.affinity);
  const wisdom = usePetStore(s => s.wisdom);
  const feed = usePetStore(s => s.feed);
  const play = usePetStore(s => s.play);
  const meditate = usePetStore(s => s.meditate);
  const messages = usePetStore(s => s.messages);

  const planType = useUserStore(s => s.planType);
  const ziwei = useUserStore(s => s.ziwei);

  const [actionFeedback, setActionFeedback] = useState('');

  const DEFAULT_MESSAGES = [
    { time: '08:00', message: t('pet.defaultMsg1'), mood: '😊' },
    { time: '12:30', message: t('pet.defaultMsg2'), mood: '🤔' },
    { time: '18:00', message: t('pet.defaultMsg3'), mood: '😴' },
  ];

  const canLevelUp = usePetStore(s => s.canLevelUp);
  const atLevelCap = !canLevelUp(planType);

  const unlockedFeatures = useMemo(() => getUnlockedFeatures(level), [level]);
  const nextUnlock = useMemo(() => getNextUnlock(level), [level]);

  const doAction = (action: (...args: any[]) => void, feedback: string) => {
    if (atLevelCap) {
      setShowUpgradeModal(true);
      return;
    }
    action(planType);
    setActionFeedback(feedback);
    setTimeout(() => setActionFeedback(''), 1500);
  };

  const displayMessages = messages.length > 0
    ? messages.slice(0, 3).map(m => ({ time: m.time, message: m.message, mood: m.mood }))
    : DEFAULT_MESSAGES;

  const expPercent = expToNext > 0 ? Math.round((exp / expToNext) * 100) : 0;

  const handleQuotaExhausted = useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  return (
    <View style={styles.container}>

      {/* ═══ 模式切換列 ═══ */}
      <View style={styles.modeBarContainer}>
        <View style={styles.modeBar}>
          {MODES.map(m => (
            <Pressable
              key={m.key}
              style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
              onPress={() => setMode(m.key)}
            >
              <Text style={styles.modeBtnEmoji}>{m.emoji}</Text>
              <Text style={[styles.modeBtnLabel, mode === m.key && styles.modeBtnLabelActive]}>
                {t(m.labelKey)}
              </Text>
              {mode === m.key && <View style={styles.modeIndicator} />}
            </Pressable>
          ))}
        </View>
      </View>

      {/* ═══ 模式內容 ═══ */}
      {mode === 'nurture' && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
          {/* ═══ 靈寵卡片 ═══ */}
          <View style={styles.petCard}>
            <View style={styles.petCardGlow} />
            <Text style={styles.petEmoji}>{emoji}</Text>
            <Text style={styles.petName}>{name} · {creature}</Text>

            <View style={styles.tagsRow}>
              <View style={[styles.tag, { backgroundColor: 'rgba(100,180,255,0.12)' }]}>
                <Text style={[styles.tagText, { color: Colors.pet }]}>{t('pet.level')}{level}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: 'rgba(232,197,71,0.12)' }]}>
                <Text style={[styles.tagText, { color: Colors.primary }]}>{element} {t('pet.element')}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: 'rgba(160,100,255,0.12)' }]}>
                <Text style={[styles.tagText, { color: Colors.outfit }]}>{t('pet.evolution')} {evolution}/5</Text>
              </View>
            </View>

            <View style={styles.expSection}>
              <View style={styles.expTrack}>
                <View style={[styles.expFill, { width: `${expPercent}%` }]} />
              </View>
              <Text style={styles.expText}>{exp.toLocaleString()} / {expToNext.toLocaleString()} {t('pet.exp')}</Text>
            </View>

            <View style={styles.statsSection}>
              <StatBar label={t('pet.power')} value={power} color={Colors.pet} />
              <StatBar label={t('pet.affinity')} value={affinity} color={Colors.love} />
              <StatBar label={t('pet.wisdom')} value={wisdom} color={Colors.outfit} />
            </View>
          </View>

          {/* ═══ 紫微命盤摘要 ═══ */}
          {ziwei && (
            <View style={styles.ziweiCard}>
              <Text style={styles.sectionLabel}>{t('pet.ziweiTitle')}</Text>
              <View style={styles.ziweiContent}>
                <View style={styles.ziweiItem}>
                  <Text style={styles.ziweiItemLabel}>{t('ziwei.mingGong')}</Text>
                  <Text style={styles.ziweiItemValue}>{ziwei.mingGong.mainStars[0]?.name || '—'}</Text>
                </View>
                <View style={styles.ziweiItem}>
                  <Text style={styles.ziweiItemLabel}>{t('ziwei.mingZhu')}</Text>
                  <Text style={styles.ziweiItemValue}>{ziwei.mingZhu}</Text>
                </View>
                <View style={styles.ziweiItem}>
                  <Text style={styles.ziweiItemLabel}>{t('ziwei.shenZhu')}</Text>
                  <Text style={styles.ziweiItemValue}>{ziwei.shenZhu}</Text>
                </View>
              </View>
              {ziwei.personality && (
                <Text style={styles.ziweiDesc}>{ziwei.personality}</Text>
              )}
            </View>
          )}

          {/* ═══ 互動按鈕 ═══ */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
              onPress={() => doAction(feed, '🍖 +50 EXP')}
            >
              <Text style={styles.actionEmoji}>🍖</Text>
              <Text style={styles.actionLabel}>{t('pet.feed')}</Text>
              <Text style={styles.actionSub}>+50 EXP</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
              onPress={() => doAction(play, '🎮 +15')}
            >
              <Text style={styles.actionEmoji}>🎮</Text>
              <Text style={styles.actionLabel}>{t('pet.play')}</Text>
              <Text style={styles.actionSub}>+15 {t('pet.affinity')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
              onPress={() => doAction(meditate, '📿 +10')}
            >
              <Text style={styles.actionEmoji}>📿</Text>
              <Text style={styles.actionLabel}>{t('pet.meditate')}</Text>
              <Text style={styles.actionSub}>+10 {t('pet.wisdom')}</Text>
            </Pressable>
          </View>

          {actionFeedback !== '' && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{actionFeedback}</Text>
            </View>
          )}

          {/* ═══ 等級解鎖進度 ═══ */}
          <Text style={styles.sectionLabel}>{t('pet.unlockTitle')}</Text>
          <View style={styles.unlockCard}>
            {Object.entries(LEVEL_UNLOCKS).map(([lvl, info]) => {
              const lvNum = parseInt(lvl);
              const isUnlocked = level >= lvNum;
              const icon = UNLOCK_ICONS[lvNum] || '🔓';
              return (
                <View key={lvl} style={[styles.unlockItem, isUnlocked && styles.unlockItemActive]}>
                  <View style={[styles.unlockIconBox, isUnlocked && styles.unlockIconBoxActive]}>
                    <Text style={styles.unlockIcon}>{isUnlocked ? icon : '🔒'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.unlockFeature, isUnlocked && styles.unlockFeatureActive]}>
                      {t(info.feature)}
                    </Text>
                    <Text style={styles.unlockDesc}>{t(info.desc)}</Text>
                  </View>
                  <Text style={[styles.unlockLv, isUnlocked && styles.unlockLvActive]}>
                    {t('pet.level')}{lvl}
                  </Text>
                </View>
              );
            })}

            {nextUnlock && (
              <View style={styles.nextUnlockHint}>
                <Text style={styles.nextUnlockText}>
                  {t('pet.nextUnlock', { feature: t(nextUnlock.feature), levels: nextUnlock.level - level })}
                </Text>
              </View>
            )}
          </View>

          {/* ═══ 靈寵訊息 ═══ */}
          <Text style={styles.sectionLabel}>{t('pet.messages')}</Text>
          {displayMessages.map((msg, i) => (
            <View key={i} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={{ fontSize: 16 }}>{emoji}</Text>
                <Text style={styles.messageName}>{name}</Text>
                <Text style={styles.messageTime}>{msg.time}</Text>
                <Text style={{ fontSize: 14 }}>{msg.mood}</Text>
              </View>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {mode === 'eye' && <PetEyeMode onQuotaExhausted={handleQuotaExhausted} />}
      {mode === 'heart' && <PetHeartMode onQuotaExhausted={handleQuotaExhausted} />}
      {mode === 'pearl' && <PetPearlMode onQuotaExhausted={handleQuotaExhausted} />}

      {/* ═══ 付費升級 Modal ═══ */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔮 {t('upgrade.quotaExhausted')}</Text>
            <Text style={styles.modalSubtitle}>{t('upgrade.subtitle')}</Text>

            {/* 會員版 */}
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>⭐ {t('upgrade.memberTitle')}</Text>
              <Text style={styles.planPrice}>NT$149/{t('upgrade.month')}</Text>
              <Text style={styles.planFeature}>· {t('upgrade.memberFeature1')}</Text>
              <Text style={styles.planFeature}>· {t('upgrade.memberFeature2')}</Text>
              <Text style={styles.planFeature}>· {t('upgrade.memberFeature3')}</Text>
              <Pressable
                style={[styles.planBtn, isPurchasing && { opacity: 0.5 }]}
                disabled={isPurchasing}
                onPress={() => handlePurchase('lingxi_member_monthly')}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.planBtnText}>{t('upgrade.upgradeNow')}</Text>
                )}
              </Pressable>
            </View>

            {/* 至尊版 */}
            <View style={[styles.planCard, styles.planCardSupreme]}>
              <Text style={[styles.planTitle, { color: '#a78bfa' }]}>👑 {t('upgrade.supremeTitle')}</Text>
              <Text style={[styles.planPrice, { color: '#a78bfa' }]}>NT$399/{t('upgrade.month')}</Text>
              <Text style={styles.planFeature}>· {t('upgrade.supremeFeature1')}</Text>
              <Text style={styles.planFeature}>· {t('upgrade.supremeFeature2')}</Text>
              <Text style={styles.planFeature}>· {t('upgrade.supremeFeature3')}</Text>
              <Pressable
                style={[styles.planBtn, styles.planBtnSupreme, isPurchasing && { opacity: 0.5 }]}
                disabled={isPurchasing}
                onPress={() => handlePurchase('lingxi_supreme_monthly')}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color="#a78bfa" />
                ) : (
                  <Text style={[styles.planBtnText, { color: '#a78bfa' }]}>{t('upgrade.upgradeNow')}</Text>
                )}
              </Pressable>
            </View>

            <Pressable
              style={styles.modalClose}
              onPress={() => setShowUpgradeModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('upgrade.tryTomorrow')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContainer: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  // Mode bar
  modeBarContainer: {
    paddingTop: 54,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 8,
    backgroundColor: 'rgba(8,8,15,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,197,71,0.06)',
  },
  modeBar: {
    flexDirection: 'row',
    gap: 4,
  },
  modeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 12, position: 'relative',
  },
  modeBtnActive: {
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  modeBtnEmoji: { fontSize: 18, marginBottom: 2 },
  modeBtnLabel: { fontSize: 10, color: Colors.textDarkest, fontFamily: Fonts.serif },
  modeBtnLabelActive: { color: Colors.primary, fontWeight: '600' },
  modeIndicator: {
    position: 'absolute', bottom: 2,
    width: 16, height: 2, borderRadius: 1,
    backgroundColor: Colors.primary,
  },

  // Pet Card
  petCard: {
    padding: 24, borderRadius: 20, alignItems: 'center',
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
    marginBottom: 16, position: 'relative', overflow: 'hidden',
  },
  petCardGlow: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(100,180,255,0.08)',
  },
  petEmoji: { fontSize: 64, marginBottom: 8 },
  petName: { fontSize: 24, fontFamily: Fonts.brush, color: Colors.primary, marginBottom: 12 },

  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: '600' },

  expSection: { width: '100%', marginBottom: 16 },
  expTrack: {
    height: 6, borderRadius: 3,
    backgroundColor: 'rgba(100,180,255,0.1)',
    overflow: 'hidden',
  },
  expFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.pet },
  expText: { fontSize: 10, color: Colors.textDark, textAlign: 'right', marginTop: 4 },

  statsSection: { width: '100%', gap: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { fontSize: 11, color: Colors.textDark, width: 32, textAlign: 'right' },
  statTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  statFill: { height: '100%', borderRadius: 2 },
  statValue: { fontSize: 11, width: 24, fontWeight: '700' },

  // Ziwei card
  ziweiCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(160,100,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(160,100,255,0.1)',
    marginBottom: 16,
  },
  ziweiContent: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  ziweiItem: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(160,100,255,0.06)',
  },
  ziweiItemLabel: { fontSize: 10, color: Colors.textDark, marginBottom: 4 },
  ziweiItemValue: { fontSize: 15, color: '#a78bfa', fontFamily: Fonts.serifBold },
  ziweiDesc: { fontSize: 12, color: '#b0a0c8', lineHeight: 20, fontFamily: Fonts.serif },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(100,180,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.12)',
  },
  actionEmoji: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 12, color: Colors.pet, fontWeight: '600' },
  actionSub: { fontSize: 9, color: Colors.textDarkest, marginTop: 2 },

  // Feedback
  feedbackBox: {
    padding: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.08)',
    marginBottom: 16,
  },
  feedbackText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  // Unlock
  sectionLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 2, marginBottom: 12, fontFamily: Fonts.serif },
  unlockCard: {
    padding: 14, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.03)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.08)',
    marginBottom: 16, gap: 8,
  },
  unlockItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: 0.45,
  },
  unlockItemActive: { opacity: 1, backgroundColor: 'rgba(232,197,71,0.06)' },
  unlockIconBox: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  unlockIconBoxActive: { backgroundColor: 'rgba(232,197,71,0.1)' },
  unlockIcon: { fontSize: 16 },
  unlockFeature: { fontSize: 13, color: Colors.textDark, fontFamily: Fonts.serifBold },
  unlockFeatureActive: { color: Colors.primary },
  unlockDesc: { fontSize: 10, color: Colors.textDarkest, marginTop: 1 },
  unlockLv: { fontSize: 10, color: Colors.textDarkest },
  unlockLvActive: { color: Colors.primary },
  nextUnlockHint: {
    padding: 10, borderRadius: 8,
    backgroundColor: 'rgba(100,180,255,0.06)',
    marginTop: 4,
  },
  nextUnlockText: { fontSize: 11, color: Colors.pet, textAlign: 'center' },

  // Messages
  messageCard: {
    padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.08)',
    marginBottom: 10,
  },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  messageName: { fontSize: 11, color: Colors.pet, fontWeight: '600' },
  messageTime: { fontSize: 10, color: Colors.textDarkest, flex: 1, textAlign: 'right' },
  messageText: { fontSize: 13, color: '#a0b8d0', lineHeight: 22, fontFamily: Fonts.serif },

  // Upgrade Modal
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 24,
  },
  modalCard: {
    width: '100%', padding: 24, borderRadius: 24,
    backgroundColor: '#111118',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.15)',
  },
  modalTitle: {
    fontSize: 22, fontFamily: Fonts.brush, color: Colors.primary,
    textAlign: 'center', marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 20,
  },
  planCard: {
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.12)',
    marginBottom: 12,
  },
  planCardSupreme: {
    backgroundColor: 'rgba(160,100,255,0.04)',
    borderColor: 'rgba(160,100,255,0.12)',
  },
  planTitle: { fontSize: 16, color: Colors.primary, fontWeight: '700', marginBottom: 4 },
  planPrice: { fontSize: 20, color: Colors.primary, fontFamily: Fonts.serifBold, marginBottom: 8 },
  planFeature: { fontSize: 13, color: Colors.textSecondary, lineHeight: 22 },
  planBtn: {
    marginTop: 12, padding: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.3)',
  },
  planBtnSupreme: {
    backgroundColor: 'rgba(160,100,255,0.12)',
    borderColor: 'rgba(160,100,255,0.3)',
  },
  planBtnText: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  modalClose: {
    marginTop: 8, padding: 14, alignItems: 'center',
  },
  modalCloseText: { fontSize: 14, color: Colors.textDarkest },
});
