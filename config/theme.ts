// 靈犀 App 主題設定

export const Colors = {
  // 主色調 — 東方神秘金
  primary: '#e8c547',
  primaryDark: '#8b6914',
  primaryLight: '#f5e6a3',
  primaryBg: 'rgba(232,197,71,0.04)',
  primaryBorder: 'rgba(232,197,71,0.12)',

  // 背景色
  background: '#08080f',
  surface: '#0d0d15',
  surfaceLight: '#151520',

  // 五行色系
  metal: '#e8e0c0',   // 金
  wood: '#80c880',     // 木
  water: '#64b4ff',    // 水
  fire: '#ff6b6b',     // 火
  earth: '#c8a060',    // 土

  // 功能色
  pet: '#64b4ff',      // 靈寵藍
  fengshui: '#64c880', // 風水綠
  outfit: '#a78bfa',   // 穿搭紫
  love: '#ff8ba0',     // 桃花粉
  danger: '#c44040',   // 凶/警告

  // 文字色
  textPrimary: '#e8c547',
  textSecondary: '#c4b07a',
  textMuted: '#8b7d5e',
  textDark: '#6b6350',
  textDarkest: '#5a5040',
} as const;

export const Fonts = {
  serif: 'NotoSerifTC_400Regular',
  serifBold: 'NotoSerifTC_700Bold',
  brush: 'MaShanZheng_400Regular',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 30,
  xxl: 40,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50,
} as const;

// 共用卡片樣式
export const CardStyle = {
  background: Colors.primaryBg,
  borderWidth: 1,
  borderColor: Colors.primaryBorder,
  borderRadius: BorderRadius.lg,
  padding: Spacing.lg,
} as const;
