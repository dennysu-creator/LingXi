// ═══════════════════════════════════════
// 集中管理所有圖片資源 — require() 必須為靜態字串
// ═══════════════════════════════════════

import { ImageSourcePropType } from 'react-native';

// ─── Logo ───
export const LOGO = {
  splash: require('./ui-v2/logo/logo-splash.png'),
  splashText: require('./ui-v2/logo/logo-splash-text.png'),
  statusBar: require('./ui-v2/logo/logo-statusbar.png'),
};

// ─── Action Bar Icons ───
export const ACTION_BAR = {
  nurture: {
    feed: require('./ui-v2/action-bar/nurture/feed.png'),
    play: require('./ui-v2/action-bar/nurture/play.png'),
    meditate: require('./ui-v2/action-bar/nurture/meditate.png'),
  },
  ability: {
    eye: require('./ui-v2/action-bar/ability/eye.png'),
    heart: require('./ui-v2/action-bar/ability/heart.png'),
    soul: require('./ui-v2/action-bar/ability/soul.png'),
  },
};

// ─── Pet Avatar Frames & Overlays ───
export const PET_FRAME = {
  normal: require('./ui-v2/pet-avatar/avatar-frame.png'),
  floatShadow: require('./ui-v2/pet-avatar/float-shadow.png'),
  frameEye: require('./ui-v2/pet-avatar/frame-eye.png'),
  frameHeart: require('./ui-v2/pet-avatar/frame-heart.png'),
  framePearl: require('./ui-v2/pet-avatar/frame-pearl.png'),
  eyeSymbol: require('./ui-v2/pet-avatar/eye-symbol.png'),
  directionRing: require('./ui-v2/pet-avatar/direction-ring.png'),
  baguaRing: require('./ui-v2/pet-avatar/bagua-ring.png'),
};

// ─── Feature Panel ───
export const FEATURE_PANEL = {
  eye: {
    btnCamera: require('./ui-v2/feature-panel/eye/btn-camera.png'),
    progressAnalyzing: require('./ui-v2/feature-panel/eye/progress-analyzing.png'),
    stepFace: require('./ui-v2/feature-panel/eye/step-face.png'),
  },
  heart: {
    btnAnalyze: require('./ui-v2/feature-panel/heart/btn-analyze.png'),
    compassBg: require('./ui-v2/feature-panel/heart/compass-bg.png'),
  },
  pearl: {
    btnDivinate: require('./ui-v2/feature-panel/pearl/btn-divinate.png'),
    catCareer: require('./ui-v2/feature-panel/pearl/cat-career.png'),
    catFamily: require('./ui-v2/feature-panel/pearl/cat-family.png'),
    catHealth: require('./ui-v2/feature-panel/pearl/cat-health.png'),
    catLove: require('./ui-v2/feature-panel/pearl/cat-love.png'),
    catStudy: require('./ui-v2/feature-panel/pearl/cat-study.png'),
  },
  stepFeatures: require('./ui-v2/feature-panel/step-features.png'),
  stepFortune: require('./ui-v2/feature-panel/step-fortune.png'),
};

// ─── Chat Bubble ───
export const CHAT_BUBBLE = {
  corner: require('./ui-v2/chat-bubble/bubble-corner.png'),
  resultEye: require('./ui-v2/chat-bubble/bubble-result-eye.png'),
  resultHeart: require('./ui-v2/chat-bubble/bubble-result-heart.png'),
  resultPearl: require('./ui-v2/chat-bubble/bubble-result-pearl.png'),
};

// ─── Effects ───
export const EFFECTS = {
  goldAura: require('./ui-v2/effects/gold-aura.png'),
  greenAura: require('./ui-v2/effects/green-aura.png'),
  purpleAura: require('./ui-v2/effects/purple-aura.png'),
  sparkleParticle: require('./ui-v2/effects/sparkle-particle.png'),
  compassNeedle: require('./ui-v2/effects/compass-needle.png'),
  panelBgPattern: require('./ui-v2/effects/panel-bg-pattern.png'),
  baguaSymbols: require('./ui-v2/effects/bagua-symbol-01~08.png'),
};

// ─── Pet Avatars ───
type PetImageSet = {
  avatar?: ImageSourcePropType;
  full?: ImageSourcePropType;
  icon?: ImageSourcePropType;
  evo1?: ImageSourcePropType;
  evo2?: ImageSourcePropType;
  evo3?: ImageSourcePropType;
};

export const PET_IMAGES: Record<string, PetImageSet> = {
  '01-lichun': {
    avatar: require('./pets/01-lichun/avatar.png'),
    full: require('./pets/01-lichun/full.png'),
    icon: require('./pets/01-lichun/icon.png'),
    evo1: require('./pets/01-lichun/evo-1.png'),
    evo2: require('./pets/01-lichun/evo-2.png'),
    evo3: require('./pets/01-lichun/evo-3.png'),
  },
  '02-yushui': {
    avatar: require('./pets/02-yushui/avatar.png'),
    full: require('./pets/02-yushui/full.png'),
    icon: require('./pets/02-yushui/icon.png'),
    evo1: require('./pets/02-yushui/evo-1.png'),
    evo2: require('./pets/02-yushui/evo-2.png'),
    evo3: require('./pets/02-yushui/evo-3.png'),
  },
  '03-jingzhe': {
    avatar: require('./pets/03-jingzhe/avatar.png'),
    full: require('./pets/03-jingzhe/full.png'),
    evo1: require('./pets/03-jingzhe/evo-1.png'),
  },
};

export function getPetImage(petId: string, type: keyof PetImageSet = 'avatar'): ImageSourcePropType | null {
  return PET_IMAGES[petId]?.[type] ?? null;
}

// ─── Pearl mode category images ───
export const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  career: FEATURE_PANEL.pearl.catCareer,
  love: FEATURE_PANEL.pearl.catLove,
  family: FEATURE_PANEL.pearl.catFamily,
  health: FEATURE_PANEL.pearl.catHealth,
  study: FEATURE_PANEL.pearl.catStudy,
};

// ─── Aura by feature type ───
export const FEATURE_AURA: Record<string, ImageSourcePropType> = {
  eye: EFFECTS.goldAura,
  heart: EFFECTS.greenAura,
  pearl: EFFECTS.purpleAura,
};

// ─── Frame by feature type ───
export const FEATURE_FRAME: Record<string, ImageSourcePropType> = {
  eye: PET_FRAME.frameEye,
  heart: PET_FRAME.frameHeart,
  pearl: PET_FRAME.framePearl,
};
