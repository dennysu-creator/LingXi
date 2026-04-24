// 靈犀 App 主題設定 — v2 全面翻新

import { Dimensions } from 'react-native';

// ─── 響應式尺寸 ───
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BASE_WIDTH = 393; // iPhone 14 Pro
export const scale = (size: number) => (SCREEN_W / BASE_WIDTH) * size;

export const Colors = {
  // 主色調 — 東方神秘金
  primary: '#e8c547',
  primaryDark: '#8b6914',
  primaryLight: '#f5e6a3',
  primaryBg: 'rgba(232,197,71,0.08)',
  primaryBorder: 'rgba(232,197,71,0.18)',

  // 背景色
  background: '#08080f',
  surface: '#0d0d15',
  surfaceLight: '#151520',
  surfaceElevated: '#1a1a28',

  // 五行色系
  metal: '#e8e0c0',
  wood: '#80c880',
  water: '#64b4ff',
  fire: '#ff6b6b',
  earth: '#c8a060',

  // 功能色
  pet: '#64b4ff',
  fengshui: '#64c880',
  outfit: '#a78bfa',
  love: '#ff8ba0',
  danger: '#c44040',

  // 功能主題色
  eyePrimary: '#FFC107',
  heartPrimary: '#4ADE80',
  pearlPrimary: '#A78BFA',

  // 文字色
  textPrimary: '#e8c547',
  textSecondary: '#d4c08a',
  textMuted: '#9b8d6e',
  textDark: '#7b7360',
  textDarkest: '#6a6050',
  textLight: '#e8e0d0',
} as const;

export const Fonts = {
  serif: 'NotoSerifTC_400Regular',
  serifBold: 'NotoSerifTC_700Bold',
  brush: 'MaShanZheng_400Regular',
} as const;

export const FontSize = {
  xs: scale(10),
  sm: scale(12),
  md: scale(14),
  lg: scale(16),
  xl: scale(18),
  xxl: scale(22),
  title: scale(28),
  hero: scale(36),
  display: scale(48),
} as const;

export const IconSize = {
  xs: scale(20),
  sm: scale(28),
  md: scale(40),
  lg: scale(52),
  xl: scale(64),
  xxl: scale(80),
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 30,
  xxl: 40,
  xxxl: 60,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 50,
} as const;

// 光暈陰影預設
export const GlowShadow = {
  gold: {
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 0 } as const,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  goldStrong: {
    shadowColor: '#e8c547',
    shadowOffset: { width: 0, height: 2 } as const,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  green: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 } as const,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  purple: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 } as const,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// 功能主題配色
export const FeatureTheme = {
  eye: { primary: '#FFC107', bg: 'rgba(255,193,7,0.12)', border: 'rgba(255,193,7,0.28)' },
  heart: { primary: '#4ADE80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.28)' },
  pearl: { primary: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.28)' },
} as const;

// 共用卡片樣式
export const CardStyle = {
  background: Colors.primaryBg,
  borderWidth: 1,
  borderColor: Colors.primaryBorder,
  borderRadius: BorderRadius.lg,
  padding: Spacing.lg,
} as const;

// ─────────────────────────────────────────────
// V4 Pet-First Immersive tokens
// 配 expo-blur 的 <BlurView tint="dark"> 使用
// ─────────────────────────────────────────────
export const V4 = {
  glass: {
    base:         'rgba(10, 10, 14, 0.55)',
    strong:       'rgba(10, 10, 14, 0.72)',
    border:       'rgba(232, 197, 71, 0.18)',
    borderStrong: 'rgba(232, 197, 71, 0.35)',
  },

  gold:    '#E8C547',
  goldDim: 'rgba(232, 197, 71, 0.6)',
  ink:     '#0A0A0E',

  text: {
    primary:   '#F5F1E8',
    secondary: 'rgba(245, 241, 232, 0.7)',
    tertiary:  'rgba(245, 241, 232, 0.45)',
    accent:    '#E8C547',
  },

  space: {
    xs:  6,
    sm:  10,
    md:  14,
    lg:  20,
    xl:  28,
    xxl: 40,
  },

  radius: {
    sm:   10,
    md:   16,
    lg:   22,
    pill: 999,
  },

  glow: {
    gold: {
      shadowColor:   '#E8C547',
      shadowOpacity: 0.4,
      shadowRadius:  24,
      shadowOffset:  { width: 0, height: 0 } as const,
      elevation:     6,
    },
    soft: {
      shadowColor:   '#000',
      shadowOpacity: 0.35,
      shadowRadius:  32,
      shadowOffset:  { width: 0, height: 8 } as const,
      elevation:     10,
    },
  },

  motion: {
    bubbleSpring: { tension: 80, friction: 10 },
    enter:        { duration: 300 },
    tapPulse:     { duration: 400, peak: 1.04 },
  },
} as const;

export { SCREEN_W, SCREEN_H };
