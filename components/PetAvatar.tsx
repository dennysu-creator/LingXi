// ═══════════════════════════════════════
// 靈寵頭像 — 分層圖片特效 + 浮動動畫 + 功能光環 + EXP 進度條 + 進化星級
// ═══════════════════════════════════════

import { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Colors, Fonts, scale } from '@/config/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
import { usePetStore } from '@/stores/pet-store';
import { getPetImage, PET_FRAME, FEATURE_FRAME, FEATURE_AURA } from '@/assets/images';

export type ActiveFeature = 'eye' | 'heart' | 'pearl' | null;

const FEATURE_COLOR: Record<string, string> = {
  eye:   '#FFC107',
  heart: '#4ADE80',
  pearl: '#A78BFA',
};

// 五行對應色
const ELEMENT_COLORS: Record<string, string> = {
  金: Colors.metal,
  木: Colors.wood,
  水: Colors.water,
  火: Colors.fire,
  土: Colors.earth,
};

interface PetAvatarProps {
  activeFeature?: ActiveFeature;
  compact?: boolean;
  fullscreen?: boolean;
}

export default function PetAvatar({ activeFeature, compact = false, fullscreen = false }: PetAvatarProps) {
  const emoji = usePetStore(s => s.emoji) || '🐉';
  const petId = usePetStore(s => s.petId) || '';
  const name = usePetStore(s => s.name) || '靈寵';
  const level = usePetStore(s => s.level);
  const evolution = usePetStore(s => s.evolution) || 1;
  const element = usePetStore(s => s.element) || '';

  // 根據進化階段選擇圖片：evo1(Lv1-9) → evo2(Lv10-19) → evo3(Lv20+)
  // fullscreen 用進化大圖，一般用 avatar
  const evoImageKey = evolution >= 3 ? 'evo3' : evolution >= 2 ? 'evo2' : 'evo1';
  const fullImage = getPetImage(petId, evoImageKey) || getPetImage(petId, 'full');
  const avatarImage = fullscreen ? fullImage : (getPetImage(petId, 'avatar') || fullImage);
  const elementColor = ELEMENT_COLORS[element] || Colors.primary;

  // ─── Floating animation ───
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  // ─── Pulse animation ───
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!activeFeature) { pulseAnim.setValue(1); return; }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [activeFeature, pulseAnim]);

  const frameSource = activeFeature ? FEATURE_FRAME[activeFeature] : PET_FRAME.normal;

  // ─── Sizes ───
  const fullSize = SCREEN_W * 0.85;
  const assemblySize = compact ? scale(130) : fullSize;
  const avatarImgSize = compact ? scale(80) : fullSize * 0.67;
  const avatarFrameSize = compact ? scale(90) : fullSize * 0.75;
  const frameSize = compact
    ? (activeFeature ? scale(126) : scale(110))
    : (activeFeature ? fullSize * 0.95 : fullSize * 0.88);

  // ─── Fullscreen: 直接渲染滿屏圖片 ───
  if (fullscreen) {
    return (
      <View style={s.containerFullscreen}>
        {avatarImage ? (
          <Image
            source={avatarImage}
            style={s.fullscreenImage}
            resizeMode="cover"
          />
        ) : (
          <View style={s.fullscreenEmoji}>
            <Text style={{ fontSize: 160 }}>{emoji}</Text>
          </View>
        )}
      </View>
    );
  }

  // ─── Normal / Compact mode ───
  return (
    <View style={[s.container, compact && s.containerCompact]}>
      <Animated.View
        style={[
          s.avatarAssembly,
          { width: assemblySize, height: assemblySize },
          { transform: [{ translateY: floatAnim }, { scale: pulseAnim }] },
        ]}
      >
        {activeFeature && (
          <Image
            source={FEATURE_AURA[activeFeature]}
            style={[s.auraImage, { width: assemblySize, height: assemblySize }]}
            resizeMode="contain"
          />
        )}

        <View
          style={[
            s.avatarClip,
            {
              width: avatarFrameSize,
              height: avatarFrameSize,
              borderRadius: avatarFrameSize / 2,
            },
            avatarImage && {
              borderWidth: 2,
              borderColor: activeFeature ? FEATURE_COLOR[activeFeature] : '#E8C54780',
            },
            activeFeature && {
              shadowColor: FEATURE_COLOR[activeFeature],
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          {avatarImage ? (
            <Image
              source={avatarImage}
              style={{ width: avatarImgSize, height: avatarImgSize, borderRadius: avatarImgSize / 2 }}
              resizeMode="cover"
            />
          ) : (
            <View style={[s.emojiFallback, { width: avatarImgSize, height: avatarImgSize, borderRadius: avatarImgSize / 2 }]}>
              <Text style={[s.emojiText, compact && { fontSize: 24 }]}>{emoji}</Text>
            </View>
          )}
        </View>

        {!avatarImage && (
          <Image
            source={frameSource}
            style={[
              s.frameImage,
              { width: frameSize, height: frameSize },
              { position: 'absolute', top: (assemblySize - frameSize) / 2, left: (assemblySize - frameSize) / 2 },
            ]}
            resizeMode="contain"
          />
        )}

        {activeFeature === 'eye' && (
          <Image
            source={PET_FRAME.eyeSymbol}
            style={[s.eyeSymbol, compact && { width: 24, height: 24, top: 2 }]}
            resizeMode="contain"
          />
        )}
      </Animated.View>

      {!compact && (
        <Image source={PET_FRAME.floatShadow} style={s.floatShadow} resizeMode="contain" />
      )}

      <View style={s.infoRow}>
        <Text style={[s.name, compact && { fontSize: 13 }]}>{name}</Text>
        <View style={s.levelPill}>
          <Text style={[s.levelText, compact && { fontSize: 9 }]}>Lv.{level}</Text>
        </View>
        {element !== '' && (
          <View style={[s.elementBadge, { backgroundColor: `${elementColor}15`, borderColor: `${elementColor}30` }]}>
            <Text style={[s.elementText, { color: elementColor }]}>{element}系</Text>
          </View>
        )}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  containerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  containerFullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
  fullscreenImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  fullscreenEmoji: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  avatarAssembly: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  auraImage: {
    position: 'absolute',
  },

  avatarClip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(232,197,71,0.20)',
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  emojiFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.04)',
  },
  emojiText: {
    fontSize: 100,
  },

  frameImage: {},

  eyeSymbol: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: 4,
    alignSelf: 'center',
  },

  floatShadow: {
    width: 180,
    height: 24,
    marginTop: -6,
    opacity: 0.35,
    marginBottom: 2,
  },

  // ─── Info Row ───
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Fonts.brush,
    letterSpacing: 3,
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(232,197,71,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.18)',
  },
  levelText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  elementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  elementText: {
    fontSize: 12,
    fontWeight: '600',
  },

});
