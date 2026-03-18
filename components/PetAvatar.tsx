// ═══════════════════════════════════════
// 靈寵頭像 — 分層圖片特效 + 浮動動畫 + 功能光環 + EXP 進度條 + 進化星級
// ═══════════════════════════════════════

import { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing } from '@/config/theme';
import { usePetStore } from '@/stores/pet-store';
import { getPetImage, PET_FRAME, FEATURE_FRAME, FEATURE_AURA } from '@/assets/images';

export type ActiveFeature = 'eye' | 'heart' | 'pearl' | null;

// Feature accent colours for fallback border / glow
const FEATURE_COLOR: Record<string, string> = {
  eye:   '#e8c547',
  heart: '#64c880',
  pearl: '#a78bfa',
};

interface PetAvatarProps {
  activeFeature?: ActiveFeature;
  compact?: boolean;
}

export default function PetAvatar({ activeFeature, compact = false }: PetAvatarProps) {
  const { t } = useTranslation();

  const emoji = usePetStore(s => s.emoji) || '🐉';
  const petId = usePetStore(s => s.petId) || '';
  const name = usePetStore(s => s.name) || '靈寵';
  const level = usePetStore(s => s.level);
  const exp = usePetStore(s => s.exp);
  const expToNext = usePetStore(s => s.expToNext);
  const evolution = usePetStore(s => s.evolution);
  const element = usePetStore(s => s.element) || '';

  const avatarImage = getPetImage(petId, 'avatar');

  const expPct = expToNext > 0 ? Math.round((exp / expToNext) * 100) : 0;

  // ─── Floating animation (translateY) ───
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  // ─── Pulse animation — active feature border pulsing ───
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!activeFeature) {
      pulseAnim.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [activeFeature, pulseAnim]);

  const accentColor = activeFeature ? FEATURE_COLOR[activeFeature] : null;

  // Determine which frame image to use
  const frameSource = activeFeature ? FEATURE_FRAME[activeFeature] : PET_FRAME.normal;

  // ─── Compact mode: smaller sizes when feature panel is active ───
  const assemblySize = compact ? ASSEMBLY_SIZE_COMPACT : ASSEMBLY_SIZE;
  const avatarFrameSize = compact ? AVATAR_FRAME_COMPACT : AVATAR_FRAME;
  const avatarImgSize = compact ? AVATAR_SIZE_COMPACT : AVATAR_SIZE;
  // Frame must stay WITHIN assembly bounds to avoid overflow
  const frameSize = compact ? (activeFeature ? 96 : 88) : (activeFeature ? 192 : 176);

  return (
    <View style={[s.container, compact && s.containerCompact]}>
      {/* ─── Layered avatar assembly ─── */}
      <Animated.View
        style={[
          s.avatarAssembly,
          { width: assemblySize, height: assemblySize },
          { transform: [{ translateY: floatAnim }, { scale: pulseAnim }] },
        ]}
      >
        {/* Layer 0 — Feature aura glow behind everything */}
        {activeFeature && (
          <Image
            source={FEATURE_AURA[activeFeature]}
            style={[s.auraImage, { width: assemblySize, height: assemblySize, top: 0, left: 0 }]}
            resizeMode="contain"
          />
        )}

        {/* Layer 1 — Pet avatar image (or emoji fallback) */}
        <View style={[s.avatarClip, { width: avatarFrameSize, height: avatarFrameSize, borderRadius: avatarFrameSize / 2 }]}>
          {avatarImage ? (
            <Image source={avatarImage} style={{ width: avatarImgSize, height: avatarImgSize, borderRadius: avatarImgSize / 2 }} resizeMode="cover" />
          ) : (
            <View style={[s.emojiFallback, { width: avatarImgSize, height: avatarImgSize, borderRadius: avatarImgSize / 2 }]}>
              <Text style={[s.emojiText, compact && { fontSize: 28 }]}>{emoji}</Text>
            </View>
          )}
        </View>

        {/* Layer 2 — Frame overlay on top of avatar */}
        <Image
          source={frameSource}
          style={[
            s.frameImage,
            { width: frameSize, height: frameSize },
            // centre the frame over the avatar
            {
              position: 'absolute',
              top: (assemblySize - frameSize) / 2,
              left: (assemblySize - frameSize) / 2,
            },
          ]}
          resizeMode="contain"
        />

        {/* Layer 3 — Eye symbol floating above avatar (only when eye active) */}
        {activeFeature === 'eye' && (
          <Image
            source={PET_FRAME.eyeSymbol}
            style={[s.eyeSymbol, compact && { width: 16, height: 16, top: 2 }]}
            resizeMode="contain"
          />
        )}
      </Animated.View>

      {/* Float shadow below avatar — hidden in compact mode */}
      {!compact && (
        <Image
          source={PET_FRAME.floatShadow}
          style={s.floatShadow}
          resizeMode="contain"
        />
      )}

      {/* Info row — always visible */}
      <View style={s.infoRow}>
        <Text style={[s.name, compact && { fontSize: 12 }]}>{name}</Text>
        <Text style={[s.levelText, compact && { fontSize: 10 }]}>{t('pet.level')}{level}</Text>
        {element !== '' && <Text style={s.elementBadge}>· {element}系</Text>}
      </View>

      {/* EXP bar + stars — hide when compact or feature active to save vertical space */}
      {!compact && !activeFeature && (
        <>
          <View style={s.expBar}>
            <View style={s.expTrack}>
              <View style={[s.expFill, { width: `${expPct}%` }]} />
            </View>
            <Text style={s.expText}>{exp}/{expToNext}</Text>
          </View>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={[s.star, i > evolution && { opacity: 0.15 }]}>★</Text>
            ))}
          </View>
          <Text style={s.evoLabel}>{t('pet.evoStage', { defaultValue: '進化階段' })} {evolution}/5</Text>
        </>
      )}
    </View>
  );
}

// ─── Layout constants ───
const ASSEMBLY_SIZE = 200;   // bounding box for the layered avatar area
const AVATAR_SIZE = 120;     // pet image
const AVATAR_FRAME = 140;    // clipping circle

// Compact mode constants (when feature panel is active)
const ASSEMBLY_SIZE_COMPACT = 100;
const AVATAR_SIZE_COMPACT = 60;
const AVATAR_FRAME_COMPACT = 70;

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  containerCompact: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  // The bounding box that holds all layered images (aura, avatar, frame, symbol)
  // width/height set inline to support compact mode
  avatarAssembly: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Feature aura — large glow behind everything, centred
  // width/height/top/left set inline to support compact mode
  auraImage: {
    position: 'absolute',
  },

  // Circular clip for the pet image
  // width/height/borderRadius set inline to support compact mode
  avatarClip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  emojiFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  emojiText: {
    fontSize: 56,
  },

  // Frame overlay (positioned absolute, sized per frame type)
  frameImage: {
    // width/height/top/left set inline
  },

  // Eye symbol floating above avatar when eye feature active
  eyeSymbol: {
    position: 'absolute',
    width: 28,
    height: 28,
    top: 4,
    alignSelf: 'center',
  },

  // Shadow below the floating avatar
  floatShadow: {
    width: 100,
    height: 20,
    marginTop: -6,
    opacity: 0.4,
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 6,
  },
  name: { fontSize: 14, color: Colors.primary, fontFamily: Fonts.serifBold },
  levelText: { fontSize: 12, color: Colors.textSecondary },
  elementBadge: {
    fontSize: 10, color: Colors.textDark,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    backgroundColor: 'rgba(232,197,71,0.08)',
    overflow: 'hidden',
  },

  expBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '70%', marginBottom: 4,
  },
  expTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(232,197,71,0.1)', overflow: 'hidden',
  },
  expFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.primary },
  expText: { fontSize: 9, color: Colors.textDarkest, width: 50 },

  starsRow: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 12, color: Colors.primary },
  evoLabel: { fontSize: 9, color: Colors.textDarkest, marginTop: 2 },
});
