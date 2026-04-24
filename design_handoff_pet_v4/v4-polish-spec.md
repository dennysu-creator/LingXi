# V4 Polish — 實作規格

**對象檔案**: `LingXi/` repo
**目標**: Pet-First Immersive Home
**對照圖**: `screenshots/v4-open.png`(展開)/ `v4-closed.png`(收起)

---

## §0 整體方向

現狀問題(見 `screenshots/before.png`):
- 靈寵被塞在中間一個小卡片裡,周圍一堆 UI chrome
- 上面有 header、下面有 status card、再下面有 action bar、再下面有 tab bar — 四層 UI 擠壓靈寵視覺
- 留白不夠,金色 accent 被稀釋

V4 方向:**靈寵是主角,UI 是浮在它上面的半透明元件**。
- 靈寵全螢幕(從 status bar 到底部)
- UI 只留:頂部 chip / 右側兩顆功能鍵 / 底部訊息卡(可收) / 底部 tab(透明)
- 所有浮動元件用 `rgba(10,10,14,0.55) + backdrop-filter blur(20)` 毛玻璃

---

## §1 Theme tokens(`config/theme.ts`)

新增以下 tokens,**不要刪原有的**(怕其他頁面還在用):

```ts
export const theme = {
  // ... 既有 ...

  // ↓↓↓ V4 新增 ↓↓↓
  v4: {
    // 毛玻璃表面
    glass: {
      base: 'rgba(10, 10, 14, 0.55)',
      strong: 'rgba(10, 10, 14, 0.72)',
      border: 'rgba(232, 197, 71, 0.18)',   // 金色描邊
      borderStrong: 'rgba(232, 197, 71, 0.35)',
    },
    // 主色
    gold: '#E8C547',
    goldDim: 'rgba(232, 197, 71, 0.6)',
    ink: '#0A0A0E',
    // 文字
    text: {
      primary: '#F5F1E8',
      secondary: 'rgba(245, 241, 232, 0.7)',
      tertiary: 'rgba(245, 241, 232, 0.45)',
      accent: '#E8C547',
    },
    // 間距(V4 比較大方)
    space: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, xxl: 40 },
    radius: { sm: 10, md: 16, lg: 22, pill: 999 },
    // 陰影
    glow: {
      gold: '0 0 24px rgba(232, 197, 71, 0.4)',
      soft: '0 8px 32px rgba(0, 0, 0, 0.35)',
    },
  },
};
```

> RN 沒有 `backdrop-filter`。改用 `expo-blur` 的 `<BlurView intensity={40} tint="dark">` 疊 `rgba(10,10,14,0.4)` 背景。

---

## §2 `components/PetAvatar.tsx`

**現狀**: 靈寵被包在固定大小 container,有圓角卡片邊框
**改成**: 可以被外層拉滿整個螢幕的 Image,無邊框、無陰影

```tsx
type Props = {
  source: ImageSourcePropType;
  fullBleed?: boolean;  // ← V4 新增
};

<Image
  source={source}
  resizeMode={fullBleed ? 'cover' : 'contain'}
  style={fullBleed
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : existingStyle}
/>
```

Home(`app/(tabs)/index.tsx`)呼叫時帶 `fullBleed`。其他畫面(onboarding 等)維持舊行為。

---

## §3 新增 `components/PetHeaderChip.tsx`

頂部那一條「暱稱 Lv.X · 進度點」chip。獨立元件方便別頁也用。

```tsx
// 結構
<View style={styles.wrap}>           // absolute top, safe-area aware
  <BlurView tint="dark" intensity={40} style={styles.chip}>
    <Text style={styles.name}>{petName}</Text>       // 衡翼鳳
    <View style={styles.lvBadge}>
      <Text style={styles.lvText}>Lv.{level}</Text>  // 金底黑字 pill
    </View>
    <View style={styles.dots}>                        // 三顆小圓:已過 / 現在 / 未來
      <Dot filled /><Dot active /><Dot />
    </View>
  </BlurView>

  <View style={styles.rightBadges}>                   // 通知 / 八卦符
    <Badge icon="bell" count={3} />
    <Badge icon="bagua" />
  </View>
</View>
```

**樣式要點**
- `wrap` 用 `SafeAreaView` 內 `top: insets.top + 8`,水平 `paddingHorizontal: 16`
- chip 高 40、radius 20、border `1px solid theme.v4.glass.border`
- lvBadge 用 `backgroundColor: theme.v4.gold`、文字 `#0A0A0E`、字重 700

---

## §4 新增 `components/PetFloatingActions.tsx`

右側兩顆浮動按鈕(eye / heart)。現狀這兩個功能散在 ActionBar 裡,V4 抽出來。

```tsx
<View style={{ position: 'absolute', right: 16, top: '38%', gap: 12 }}>
  <FloatBtn icon="eye"  onPress={toggleFortuneMode} />  // 切占卜/日常模式
  <FloatBtn icon="heart" onPress={onPetInteract} />     // 摸靈寵
</View>
```

`FloatBtn`: 44×44 圓形、`BlurView intensity={50}` 包 `rgba(10,10,14,0.4)` + `borderWidth 1 borderColor: theme.v4.glass.border`。icon 用既有的 lucide-react-native。

---

## §5 改 `components/PetBubble.tsx` → 變成可收底部訊息卡

**現狀**: 靠靈寵旁邊的小對話泡
**V4**: 畫面底部一張橫卡,有「標題 + 時間 + 3 行內文 + 收合把手」。可以下滑收起(進 `v4-closed` 模式)。

```tsx
// PropsV4
{
  title: string;          // "今日靈寵奇語"
  time: string;           // "10:53"
  body: string;           // 主人早安~...
  collapsed: boolean;
  onToggle: () => void;
  highlights?: string[];  // ["小吉", "東南方"] — 會在 body 裡被 <Text> 金色高亮
}
```

**佈局**
- `position: absolute` 在底部 tab bar 上方(bottom: TAB_HEIGHT + 8)
- `marginHorizontal: 12`, radius 22
- 背景 BlurView + `theme.v4.glass.base`,border `theme.v4.glass.border`
- 標題列左邊一顆金色小圓點(`•`)+ 粗體標題,右邊時間 + close/expand icon
- body 用 `Text` component,把 `highlights` 裡的字用 `<Text style={{color: gold}}>` 包起來
- 收起時:整個卡往下滑 `translateY(cardHeight + 12)`,用 `Animated.timing` 250ms
- 收起狀態畫面上依然留一條 8px 把手讓使用者點擊展開

**高亮字 helper**
```tsx
function renderHighlight(body: string, keys: string[]) {
  // split by regex of keys, return array of <Text>
  // 金色那段加 color: theme.v4.text.accent, fontWeight: '600'
}
```

---

## §6 改 `components/ActionBar.tsx` → 透明化

**現狀**: 實心背景、有上邊框
**V4**: 背景透明、上方疊一層由下往上的漸層黑(讓 icon 在亮色靈寵上可讀)、icon 改成外框圓(active 金色填色)

```tsx
<View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
  <LinearGradient
    colors={['rgba(10,10,14,0)', 'rgba(10,10,14,0.8)']}
    style={{ position: 'absolute', inset: 0, height: 140 }}
  />
  <View style={tabRow}>
    {tabs.map(t => (
      <Pressable onPress={...} style={pillWrap}>
        <View style={[
          pillCircle,
          t.active && { backgroundColor: 'rgba(232,197,71,0.18)',
                        borderColor: theme.v4.gold }
        ]}>
          <Icon color={t.active ? gold : 'rgba(245,241,232,0.6)'} />
        </View>
        <Text style={[label, t.active && { color: gold }]}>{t.label}</Text>
      </Pressable>
    ))}
  </View>
</View>
```

- pillCircle: 42×42 radius 21 border 1 `rgba(245,241,232,0.2)`
- 底下 label 12px,active 時金色

---

## §7 改 `app/(tabs)/index.tsx`(Home)

整頁重寫 return,層級由下到上:

```tsx
return (
  <View style={{ flex: 1, backgroundColor: theme.v4.ink }}>
    {/* 1. 靈寵全螢幕 */}
    <PetAvatar source={activePet.image} fullBleed />

    {/* 2. 頂部漸層遮罩 — 讓 status bar / chip 可讀 */}
    <LinearGradient
      colors={['rgba(10,10,14,0.7)', 'transparent']}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180 }}
      pointerEvents="none"
    />

    {/* 3. 頂部 chip */}
    <PetHeaderChip petName={pet.name} level={pet.lv} />

    {/* 4. 右側浮鈕 */}
    <PetFloatingActions
      onFortune={() => router.push('/(tabs)/fortune')}
      onInteract={handlePet}
    />

    {/* 5. 底部訊息卡 */}
    <PetBubble
      title={t('pet.dailyWhisper')}
      time={nowHHmm}
      body={dailyMessage}
      highlights={extractHighlights(dailyMessage)}
      collapsed={bubbleCollapsed}
      onToggle={() => setBubbleCollapsed(v => !v)}
    />

    {/* 6. 輸入框(只在展開時顯示) */}
    {!bubbleCollapsed && (
      <PetChatComposer
        onSend={send}
        style={{ position: 'absolute', bottom: TAB_H + CARD_H + 8, left: 12, right: 12 }}
      />
    )}

    {/* 7. Tab bar(透明版)*/}
    <ActionBar variant="v4" />
  </View>
);
```

**state 只多一個**:
```tsx
const [bubbleCollapsed, setBubbleCollapsed] = useState(false);
```

**`extractHighlights`**: 簡單實作 — 從每日訊息裡找 `小吉 / 大吉 / 凶 / 東南方 / 西北方 / 吉時` 這類詞,回傳字串陣列。實作放 `services/pet-narrator.ts` 裡一個新 export。

---

## §8 PetChat 輸入框(次要)

現在的輸入框如果已經是獨立元件就直接沿用,只調整容器寬度與 border。如果還沒拆出來,在 `components/PetChat.tsx` 多 export 一個 `PetChatComposer`(純輸入列,不含歷史)。

樣式:
- 高 44、radius 22、BlurView 包 `rgba(10,10,14,0.6)`
- 左 icon(mic)、中 input、右圓形送出鍵(金底)
- border `theme.v4.glass.border`

---

## §9 動畫細節

- Bubble 收/展: `Animated.spring` bounciness 6 speed 14
- 摸靈寵(heart 按): `Animated.sequence([scale 1→1.04→1])` 400ms
- 進入 Home: 靈寵 `opacity 0→1` + 下浮 8px → 0,300ms ease-out。chip/bubble 晚 150ms 進場

---

## §10 驗收清單

- [ ] 靈寵從 status bar 頂到底部 tab,完全 cover 整個背景
- [ ] 沒有任何 UI 元件有實心不透明背景(除了 lvBadge 金色 pill)
- [ ] 下拉把手點一下:bubble 消失,畫面變 `screenshots/v4-closed.png`
- [ ] 再點:bubble 回來
- [ ] 切去其他 tab 再切回 Home,bubble 狀態被 remember(用 zustand `ui-store` 存或者 local state 都行)
- [ ] Dark mode only — 不用做 light mode
- [ ] iPhone 15 Pro / Pixel 7 兩種尺寸都要看過
