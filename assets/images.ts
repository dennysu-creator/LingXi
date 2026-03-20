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
  baguaSymbols: [
    require('./ui-v2/effects/bagua-symbol-01.png'),
    require('./ui-v2/effects/bagua-symbol-02.png'),
    require('./ui-v2/effects/bagua-symbol-03.png'),
    require('./ui-v2/effects/bagua-symbol-04.png'),
    require('./ui-v2/effects/bagua-symbol-05.png'),
    require('./ui-v2/effects/bagua-symbol-06.png'),
    require('./ui-v2/effects/bagua-symbol-07.png'),
    require('./ui-v2/effects/bagua-symbol-08.png'),
  ],
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
    icon: require('./pets/03-jingzhe/icon.png'),
    evo1: require('./pets/03-jingzhe/evo-1.png'),
    evo2: require('./pets/03-jingzhe/evo-2.png'),
    evo3: require('./pets/03-jingzhe/evo-3.png'),
  },
  '04-chunfen': {
    avatar: require('./pets/04-chunfen/avatar.png'),
    full: require('./pets/04-chunfen/full.png'),
    icon: require('./pets/04-chunfen/icon.png'),
    evo1: require('./pets/04-chunfen/evo-1.png'),
    evo2: require('./pets/04-chunfen/evo-2.png'),
    evo3: require('./pets/04-chunfen/evo-3.png'),
  },
  '05-qingming': {
    avatar: require('./pets/05-qingming/avatar.png'),
    full: require('./pets/05-qingming/full.png'),
    icon: require('./pets/05-qingming/icon.png'),
    evo1: require('./pets/05-qingming/evo-1.png'),
    evo2: require('./pets/05-qingming/evo-2.png'),
    evo3: require('./pets/05-qingming/evo-3.png'),
  },
  '06-guyu': {
    avatar: require('./pets/06-guyu/avatar.png'),
    full: require('./pets/06-guyu/full.png'),
    icon: require('./pets/06-guyu/icon.png'),
    evo1: require('./pets/06-guyu/evo-1.png'),
    evo2: require('./pets/06-guyu/evo-2.png'),
    evo3: require('./pets/06-guyu/evo-3.png'),
  },
  '07-lixia': {
    avatar: require('./pets/07-lixia/avatar.png'),
    full: require('./pets/07-lixia/full.png'),
    icon: require('./pets/07-lixia/icon.png'),
    evo1: require('./pets/07-lixia/evo-1.png'),
    evo2: require('./pets/07-lixia/evo-2.png'),
    evo3: require('./pets/07-lixia/evo-3.png'),
  },
  '08-xiaoman': {
    avatar: require('./pets/08-xiaoman/avatar.png'),
    full: require('./pets/08-xiaoman/full.png'),
    icon: require('./pets/08-xiaoman/icon.png'),
    evo1: require('./pets/08-xiaoman/evo-1.png'),
    evo2: require('./pets/08-xiaoman/evo-2.png'),
    evo3: require('./pets/08-xiaoman/evo-3.png'),
  },
  '09-mangzhong': {
    avatar: require('./pets/09-mangzhong/avatar.png'),
    full: require('./pets/09-mangzhong/full.png'),
    icon: require('./pets/09-mangzhong/icon.png'),
    evo1: require('./pets/09-mangzhong/evo-1.png'),
    evo2: require('./pets/09-mangzhong/evo-2.png'),
    evo3: require('./pets/09-mangzhong/evo-3.png'),
  },
  '10-xiazhi': {
    avatar: require('./pets/10-xiazhi/avatar.png'),
    full: require('./pets/10-xiazhi/full.png'),
    icon: require('./pets/10-xiazhi/icon.png'),
    evo1: require('./pets/10-xiazhi/evo-1.png'),
    evo2: require('./pets/10-xiazhi/evo-2.png'),
    evo3: require('./pets/10-xiazhi/evo-3.png'),
  },
  '11-xiaoshu': {
    avatar: require('./pets/11-xiaoshu/avatar.png'),
    full: require('./pets/11-xiaoshu/full.png'),
    icon: require('./pets/11-xiaoshu/icon.png'),
    evo1: require('./pets/11-xiaoshu/evo-1.png'),
    evo2: require('./pets/11-xiaoshu/evo-2.png'),
    evo3: require('./pets/11-xiaoshu/evo-3.png'),
  },
  '12-dashu': {
    avatar: require('./pets/12-dashu/avatar.png'),
    full: require('./pets/12-dashu/full.png'),
    icon: require('./pets/12-dashu/icon.png'),
    evo1: require('./pets/12-dashu/evo-1.png'),
    evo2: require('./pets/12-dashu/evo-2.png'),
    evo3: require('./pets/12-dashu/evo-3.png'),
  },
  '13-liqiu': {
    avatar: require('./pets/13-liqiu/avatar.png'),
    full: require('./pets/13-liqiu/full.png'),
    icon: require('./pets/13-liqiu/icon.png'),
    evo1: require('./pets/13-liqiu/evo-1.png'),
    evo2: require('./pets/13-liqiu/evo-2.png'),
    evo3: require('./pets/13-liqiu/evo-3.png'),
  },
  '14-chushu': {
    avatar: require('./pets/14-chushu/avatar.png'),
    full: require('./pets/14-chushu/full.png'),
    icon: require('./pets/14-chushu/icon.png'),
    evo1: require('./pets/14-chushu/evo-1.png'),
    evo2: require('./pets/14-chushu/evo-2.png'),
    evo3: require('./pets/14-chushu/evo-3.png'),
  },
  '15-bailu': {
    avatar: require('./pets/15-bailu/avatar.png'),
    full: require('./pets/15-bailu/full.png'),
    icon: require('./pets/15-bailu/icon.png'),
    evo1: require('./pets/15-bailu/evo-1.png'),
    evo2: require('./pets/15-bailu/evo-2.png'),
    evo3: require('./pets/15-bailu/evo-3.png'),
  },
  '16-qiufen': {
    avatar: require('./pets/16-qiufen/avatar.png'),
    full: require('./pets/16-qiufen/full.png'),
    icon: require('./pets/16-qiufen/icon.png'),
    evo1: require('./pets/16-qiufen/evo-1.png'),
    evo2: require('./pets/16-qiufen/evo-2.png'),
    evo3: require('./pets/16-qiufen/evo-3.png'),
  },
  '17-hanlu': {
    avatar: require('./pets/17-hanlu/avatar.png'),
    full: require('./pets/17-hanlu/full.png'),
    icon: require('./pets/17-hanlu/icon.png'),
    evo1: require('./pets/17-hanlu/evo-1.png'),
    evo2: require('./pets/17-hanlu/evo-2.png'),
    evo3: require('./pets/17-hanlu/evo-3.png'),
  },
  '18-shuangjiang': {
    avatar: require('./pets/18-shuangjiang/avatar.png'),
    full: require('./pets/18-shuangjiang/full.png'),
    icon: require('./pets/18-shuangjiang/icon.png'),
    evo1: require('./pets/18-shuangjiang/evo-1.png'),
    evo2: require('./pets/18-shuangjiang/evo-2.png'),
    evo3: require('./pets/18-shuangjiang/evo-3.png'),
  },
  '19-lidong': {
    avatar: require('./pets/19-lidong/avatar.png'),
    full: require('./pets/19-lidong/full.png'),
    icon: require('./pets/19-lidong/icon.png'),
    evo1: require('./pets/19-lidong/evo-1.png'),
    evo2: require('./pets/19-lidong/evo-2.png'),
    evo3: require('./pets/19-lidong/evo-3.png'),
  },
  '20-xiaoxue': {
    avatar: require('./pets/20-xiaoxue/avatar.png'),
    full: require('./pets/20-xiaoxue/full.png'),
    icon: require('./pets/20-xiaoxue/icon.png'),
    evo1: require('./pets/20-xiaoxue/evo-1.png'),
    evo2: require('./pets/20-xiaoxue/evo-2.png'),
    evo3: require('./pets/20-xiaoxue/evo-3.png'),
  },
  '21-daxue': {
    avatar: require('./pets/21-daxue/avatar.png'),
    full: require('./pets/21-daxue/full.png'),
    icon: require('./pets/21-daxue/icon.png'),
    evo1: require('./pets/21-daxue/evo-1.png'),
    evo2: require('./pets/21-daxue/evo-2.png'),
    evo3: require('./pets/21-daxue/evo-3.png'),
  },
  '22-dongzhi': {
    avatar: require('./pets/22-dongzhi/avatar.png'),
    full: require('./pets/22-dongzhi/full.png'),
    icon: require('./pets/22-dongzhi/icon.png'),
    evo1: require('./pets/22-dongzhi/evo-1.png'),
    evo2: require('./pets/22-dongzhi/evo-2.png'),
    evo3: require('./pets/22-dongzhi/evo-3.png'),
  },
  '23-xiaohan': {
    avatar: require('./pets/23-xiaohan/avatar.png'),
    full: require('./pets/23-xiaohan/full.png'),
    icon: require('./pets/23-xiaohan/icon.png'),
    evo1: require('./pets/23-xiaohan/evo-1.png'),
    evo2: require('./pets/23-xiaohan/evo-2.png'),
    evo3: require('./pets/23-xiaohan/evo-3.png'),
  },
  '24-dahan': {
    avatar: require('./pets/24-dahan/avatar.png'),
    full: require('./pets/24-dahan/full.png'),
    icon: require('./pets/24-dahan/icon.png'),
    evo1: require('./pets/24-dahan/evo-1.png'),
    evo2: require('./pets/24-dahan/evo-2.png'),
    evo3: require('./pets/24-dahan/evo-3.png'),
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
