# `config/theme.ts` Patch

直接貼進 `LingXi/config/theme.ts` 的 export 物件裡,key 叫 `v4`。

```ts
// ─────────────────────────────────────────────
// V4 Pet-First Immersive tokens
// ─────────────────────────────────────────────
v4: {
  // 毛玻璃表面(配 expo-blur 的 BlurView tint="dark")
  glass: {
    base:         'rgba(10, 10, 14, 0.55)',
    strong:       'rgba(10, 10, 14, 0.72)',
    border:       'rgba(232, 197, 71, 0.18)',
    borderStrong: 'rgba(232, 197, 71, 0.35)',
  },

  // 主色
  gold:    '#E8C547',
  goldDim: 'rgba(232, 197, 71, 0.6)',
  ink:     '#0A0A0E',

  // 文字
  text: {
    primary:   '#F5F1E8',
    secondary: 'rgba(245, 241, 232, 0.7)',
    tertiary:  'rgba(245, 241, 232, 0.45)',
    accent:    '#E8C547',
  },

  // 間距(V4 比舊版大一號,給沉浸感留呼吸)
  space: {
    xs:  6,
    sm:  10,
    md:  14,
    lg:  20,
    xl:  28,
    xxl: 40,
  },

  // 圓角
  radius: {
    sm:   10,
    md:   16,
    lg:   22,
    pill: 999,
  },

  // 陰影/光暈(RN 用 elevation + shadow*,這裡先給 CSS 語法當備忘)
  glow: {
    gold: {
      shadowColor:   '#E8C547',
      shadowOpacity: 0.4,
      shadowRadius:  24,
      shadowOffset:  { width: 0, height: 0 },
      elevation:     6,
    },
    soft: {
      shadowColor:   '#000',
      shadowOpacity: 0.35,
      shadowRadius:  32,
      shadowOffset:  { width: 0, height: 8 },
      elevation:     10,
    },
  },

  // 動畫常數
  motion: {
    bubbleSpring: { bounciness: 6, speed: 14 },
    enter:        { duration: 300, easing: 'ease-out' },
    tapPulse:     { duration: 400, peak: 1.04 },
  },
},
```

## 使用範例

```tsx
import { theme } from '@/config/theme';

// 毛玻璃卡片
<BlurView tint="dark" intensity={40} style={{
  backgroundColor: theme.v4.glass.base,
  borderColor:     theme.v4.glass.border,
  borderWidth:     1,
  borderRadius:    theme.v4.radius.lg,
  padding:         theme.v4.space.md,
}}>
  <Text style={{ color: theme.v4.text.primary }}>...</Text>
</BlurView>

// 金色 pill
<View style={{
  backgroundColor: theme.v4.gold,
  borderRadius:    theme.v4.radius.pill,
  paddingHorizontal: 10,
  paddingVertical:   4,
}}>
  <Text style={{ color: theme.v4.ink, fontWeight: '700' }}>Lv.5</Text>
</View>
```

## Type 定義

如果你的 `theme.ts` 有 TS interface,加進去:

```ts
type V4Tokens = {
  glass: { base: string; strong: string; border: string; borderStrong: string };
  gold: string; goldDim: string; ink: string;
  text: { primary: string; secondary: string; tertiary: string; accent: string };
  space: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radius: { sm: number; md: number; lg: number; pill: number };
  glow: { gold: ViewStyle; soft: ViewStyle };
  motion: {
    bubbleSpring: { bounciness: number; speed: number };
    enter: { duration: number; easing: string };
    tapPulse: { duration: number; peak: number };
  };
};
```
