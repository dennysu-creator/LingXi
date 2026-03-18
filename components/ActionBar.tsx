// ═══════════════════════════════════════
// 動作列 — 養成 + 功能按鈕
// Premium mystical design with AI art icons
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

const ROW1: { key: ActionType; image: ImageSourcePropType; labelKey: string; exp: string }[] = [
  { key: 'feed', image: ACTION_BAR.nurture.feed, labelKey: 'pet.feed', exp: '+50' },
  { key: 'play', image: ACTION_BAR.nurture.play, labelKey: 'pet.play', exp: '+30' },
  { key: 'meditate', image: ACTION_BAR.nurture.meditate, labelKey: 'pet.meditate', exp: '+20' },
];

// Feature glow colors for active state
const ABILITY_COLORS: Record<string, string> = {
  eye: '#FFC107',
  heart: '#4ADE80',
  pearl: '#A78BFA',
};

const ROW2: { key: ActionType; image: ImageSourcePropType; labelKey: string; color: string }[] = [
  { key: 'eye', image: ACTION_BAR.ability.eye, labelKey: 'actionBar.eye', color: ABILITY_COLORS.eye },
  { key: 'heart', image: ACTION_BAR.ability.heart, labelKey: 'actionBar.heart', color: ABILITY_COLORS.heart },
  { key: 'pearl', image: ACTION_BAR.ability.soul, labelKey: 'actionBar.soul', color: ABILITY_COLORS.pearl },
];

export default function ActionBar({ onAction, disabled, activeFeature }: ActionBarProps) {
  const { t } = useTranslation();

  return (
    <View style={s.container}>
      {/* Row 1: Nurture — hide when feature is active to save space */}
      {!activeFeature && (
        <View style={s.row}>
          {ROW1.map(item => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [s.btn, s.btnNurture, pressed && s.pressed]}
              onPress={() => onAction(item.key)}
              disabled={disabled}
            >
              {/* Circular icon container with subtle glow */}
              <View style={s.nurtureIconWrap}>
                <Image source={item.image} style={s.nurtureIcon} resizeMode="contain" />
              </View>
              <Text style={s.btnLabel}>{t(item.labelKey)}</Text>
              <Text style={s.btnExp}>{item.exp}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Row 2: Abilities — highlight active feature with colored glow */}
      <View style={s.row}>
        {ROW2.map(item => {
          const isActive = activeFeature === item.key;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                s.btn,
                s.btnAbility,
                isActive && {
                  backgroundColor: `${item.color}18`,
                  borderColor: `${item.color}80`,
                  shadowColor: item.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 8,
                },
                pressed && s.pressed,
              ]}
              onPress={() => onAction(item.key)}
              disabled={disabled}
            >
              {/* Icon container — larger for abilities, with glow ring when active */}
              <View
                style={[
                  s.abilityIconWrap,
                  isActive && {
                    borderColor: `${item.color}99`,
                    shadowColor: item.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    elevation: 6,
                  },
                ]}
              >
                <Image source={item.image} style={s.abilityIcon} resizeMode="contain" />
              </View>
              <Text
                style={[
                  s.btnLabel,
                  s.abilityLabel,
                  isActive && { color: item.color, fontWeight: '700' },
                ]}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,197,71,0.12)',
    backgroundColor: 'rgba(8,8,15,0.98)',
  },

  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },

  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },

  // ── Nurture buttons (Row 1) ──
  btnNurture: {
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderColor: 'rgba(232,197,71,0.15)',
  },

  nurtureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.18)',
    marginBottom: 6,
    // Subtle golden glow
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  nurtureIcon: {
    width: 44,
    height: 44,
  },

  // ── Ability buttons (Row 2) ──
  btnAbility: {
    backgroundColor: 'rgba(100,180,255,0.04)',
    borderColor: 'rgba(100,180,255,0.12)',
  },

  abilityIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 6,
  },

  abilityIcon: {
    width: 48,
    height: 48,
  },

  abilityLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },

  btnLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: Fonts.serif,
    marginTop: 2,
  },

  btnExp: {
    fontSize: 9,
    color: Colors.textDark,
    fontFamily: Fonts.serif,
    marginTop: 1,
  },
});
