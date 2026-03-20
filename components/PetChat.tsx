// ═══════════════════════════════════════
// 靈寵對話列表 — 可捲動的聊天歷史
// ═══════════════════════════════════════

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '@/config/theme';
import { useChatStore, type ChatMessage } from '@/stores/chat-store';
import { formatLocalDateLabel, getLocalDateKey } from '@/services/date-utils';
import PetBubble from './PetBubble';

interface PetChatProps {
  petEmoji: string;
  petName: string;
  isLoading?: boolean;
}

function DateSeparator({ dateStr }: { dateStr: string }) {
  return (
    <View style={s.dateSep}>
      <View style={s.dateLine} />
      <View style={s.datePill}>
        <Text style={s.dateText}>{dateStr}</Text>
      </View>
      <View style={s.dateLine} />
    </View>
  );
}

type ListItem = { type: 'date'; key: string; dateStr: string } | { type: 'msg'; key: string; msg: ChatMessage };

function buildListItems(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const dk = getLocalDateKey(msg.time);
    if (dk !== lastDate) {
      items.push({ type: 'date', key: `date-${dk}`, dateStr: formatLocalDateLabel(msg.time) });
      lastDate = dk;
    }
    items.push({ type: 'msg', key: msg.id, msg });
  }
  return items;
}

export default function PetChat({ petEmoji, petName, isLoading }: PetChatProps) {
  const messages = useChatStore((s) => s.messages);
  const flatListRef = useRef<FlatList>(null);

  const listItems = useMemo(() => buildListItems(messages), [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'date') {
      return <DateSeparator dateStr={item.dateStr} />;
    }
    return <PetBubble message={item.msg} petEmoji={petEmoji} petName={petName} />;
  }, [petEmoji, petName]);

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  return (
    <View style={s.container}>
      <FlatList
        ref={flatListRef}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      {isLoading && (
        <View style={s.loadingBox}>
          <View style={s.loadingDot} />
          <Text style={s.loadingEmoji}>{petEmoji}</Text>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={s.loadingText}>...</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  // ─── Date separator ───
  dateSep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(232,197,71,0.08)',
  },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.08)',
  },
  dateText: {
    fontSize: 13,
    color: Colors.textDark,
    letterSpacing: 1,
    fontFamily: Fonts.serif,
  },

  // ─── Loading ───
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,197,71,0.05)',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0.4,
  },
  loadingEmoji: { fontSize: 20 },
  loadingText: {
    fontSize: 14,
    color: Colors.textDark,
    fontFamily: Fonts.serif,
  },
});
