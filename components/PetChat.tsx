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

// Date separator — shown between messages on different days
function DateSeparator({ dateStr }: { dateStr: string }) {
  return (
    <View style={s.dateSep}>
      <View style={s.dateLine} />
      <Text style={s.dateText}>{dateStr}</Text>
      <View style={s.dateLine} />
    </View>
  );
}

// Build list with date separators inserted
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

  // Auto-scroll to bottom when new messages arrive
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
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },

  dateSep: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 12,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  dateText: { fontSize: 10, color: Colors.textDarkest, letterSpacing: 1 },

  loadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  loadingEmoji: { fontSize: 16 },
  loadingText: { fontSize: 14, color: Colors.textDark, fontFamily: Fonts.serif },
});
