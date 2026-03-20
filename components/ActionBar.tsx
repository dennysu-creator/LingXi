// ═══════════════════════════════════════
// 動作列 — 右側垂直浮動面板
// ═══════════════════════════════════════

import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts } from '@/config/theme';
import { ACTION_BAR } from '@/assets/images';

import type { ActiveFeature } from './PetAvatar';
import type { ImageSourcePropType } from 'react-native';

export type ActionType = 'feed' | 'play' | 'meditate' | 'eye' | 'heart' | 'pearl';

interface ActionBarProps {
  onAction: (action: ActionType) => void;
  disabled?: boolean;
  activeFeature?: ActiveFeature;
}

const NURTURE_ITEMS: { key: ActionType; image: ImageSourcePropType; exp: string }[] = [
  { key: 'feed', image: ACTION_BAR.nurture.feed, exp: '+50' },
  { key: 'play', image: ACTION_BAR.nurture.play, exp: '+30' },
  { key: 'meditate', image: ACTION_BAR.nurture.meditate, exp: '+20' },
];

const ABILITY_COLORS: Record<string, { primary: string; bg: string; border: string }> = {
  eye:   { primary: '#FFC107', bg: 'rgba(255,193,7,0.10)', border: 'rgba(255,193,7,0.30)' },
  heart: { primary: '#4ADE80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.30)' },
  pearl: { primary: '#A78BFA', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.30)' },
};

const ABILITY_ITEMS: { key: ActionType; image: ImageSourcePropType; labelKey: string; colorKey: string }[] = [
  { key: 'eye', image: ACTION_BAR.ability.eye, labelKey: 'actionBar.eye', colorKey: 'eye' },
  { key: 'heart', image: ACTION_BAR.ability.heart, labelKey: 'actionBar.heart', colorKey: 'heart' },
  { key: 'pearl', image: ACTION_BAR.ability.soul, labelKey: 'actionBar.soul', colorKey: 'pearl' },
];

export default function ActionBar({ onAction, disabled, activeFeature }: ActionBarProps) {
  const { t } = useTranslation();

  return (
    <View style={s.container}>
      {/* Ability buttons */}
      {ABILITY_ITEMS.map(item => {
        const isActive = activeFeature === item.key;
        const colors = ABILITY_COLORS[item.colorKey];
        return (
          <Pressable
            key={item.key}
            style={({ pressed }) => [
              s.abilityBtn,
              isActive && {
                backgroundColor: colors.bg,
                borderColor: colors.border,
                shadowColor: colors.primary,
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 6,
              },
              pressed && s.pressed,
            ]}
            onPress={() => onAction(item.key)}
            disabled={disabled}
          >
            <Image source={item.image} style={s.abilityIcon} resizeMode="contain" />
            <Text style={[s.abilityLabel, isActive && { color: colors.primary, fontWeight: '700' }]}>
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}

      {/* Divider */}
      {!activeFeature && <View style={s.divider} />}

      {/* Nurture — compact icon buttons (hidden when feature active) */}
      {!activeFeature && NURTURE_ITEMS.map(item => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [s.nurtureBtn, pressed && s.pressed]}
          onPress={() => onAction(item.key)}
          disabled={disabled}
        >
          <Image source={item.image} style={s.nurtureIcon} resizeMode="contain" />
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    bottom: 40,
    zIndex: 20,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(8,8,15,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.12)',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },

  // ─── Ability buttons ───
  abilityBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  abilityIcon: {
    width: 36,
    height: 36,
  },
  abilityLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontFamily: Fonts.serif,
    letterSpacing: 1,
    marginTop: 2,
  },

  // ─── Divider ───
  divider: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(232,197,71,0.15)',
  },

  // ─── Nurture: compact icon buttons ───
  nurtureBtn: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
  },
  nurtureIcon: {
    width: 30,
    height: 30,
  },
});
