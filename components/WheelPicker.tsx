// ═══════════════════════════════════════
// 滾輪選擇器 — 模擬 iOS Picker 風格
// 使用 FlatList + snapToInterval
// ═══════════════════════════════════════

import { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  type NativeSyntheticEvent, type NativeScrollEvent,
  type ViewToken,
} from 'react-native';
import { Colors, Fonts } from '@/config/theme';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelPickerProps {
  items: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
  width?: number;
}

export default function WheelPicker({
  items,
  selectedIndex,
  onValueChange,
  width = 90,
}: WheelPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);

  // 在首尾各加 2 個空白項以允許第一個/最後一個項目滾到中間
  const paddedItems = ['', '', ...items, '', ''];

  useEffect(() => {
    // 初始滾動到選中位置
    if (flatListRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, []);

  const handleMomentumEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

    if (clampedIndex !== selectedIndex) {
      onValueChange(clampedIndex);
    }
    isScrolling.current = false;
  }, [items.length, selectedIndex, onValueChange]);

  const renderItem = useCallback(({ item, index }: { item: string; index: number }) => {
    const actualIndex = index - 2; // 扣掉前面 2 個空白項
    const isSelected = actualIndex === selectedIndex;
    const isAdjacent = Math.abs(actualIndex - selectedIndex) === 1;

    return (
      <View style={[styles.itemContainer, { height: ITEM_HEIGHT }]}>
        <Text style={[
          styles.itemText,
          isSelected && styles.itemTextSelected,
          isAdjacent && styles.itemTextAdjacent,
          !isSelected && !isAdjacent && styles.itemTextFar,
        ]}>
          {item}
        </Text>
      </View>
    );
  }, [selectedIndex]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <View style={[styles.container, { width, height: PICKER_HEIGHT }]}>
      {/* 選中行指示器 */}
      <View style={styles.indicator} pointerEvents="none" />

      <FlatList
        ref={flatListRef}
        data={paddedItems}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollBeginDrag={() => { isScrolling.current = true; }}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(232,197,71,0.25)',
    backgroundColor: 'rgba(232,197,71,0.06)',
    zIndex: 1,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontFamily: Fonts.serif,
    color: Colors.textDarkest,
  },
  itemTextSelected: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  itemTextAdjacent: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  itemTextFar: {
    fontSize: 14,
    color: Colors.textDarkest,
    opacity: 0.5,
  },
});
