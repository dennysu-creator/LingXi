// ═══════════════════════════════════════
// 靈寵對話氣泡 — 所有功能結果以氣泡呈現
// ═══════════════════════════════════════

import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, Spacing } from '@/config/theme';
import type { ChatMessage, FortuneData, FaceData, FengshuiData, DivinationData, PetActionData, LevelUpData, EvolveData } from '@/stores/chat-store';
import { getPetImage, CHAT_BUBBLE } from '@/assets/images';
import { usePetStore } from '@/stores/pet-store';

// ─── Score bar (fortune / face) ───
function ScoreBar({ label, value, maxValue = 100 }: { label: string; value: number; maxValue?: number }) {
  const pct = Math.min(100, Math.round((value / maxValue) * 100));
  const color = pct >= 80 ? Colors.primary : pct >= 60 ? Colors.textSecondary : Colors.textMuted;
  return (
    <View style={s.scoreRow}>
      <Text style={s.scoreLabel}>{label}</Text>
      <View style={s.scoreTrack}>
        <View style={[s.scoreFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.scoreValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── 3x3 Compass grid ───
function CompassGrid({ data }: { data: FengshuiData }) {
  if (!data?.palaces) return null;
  const DIR_ORDER = ['西北', '北', '東北', '西', '中', '東', '西南', '南', '東南'];
  const palaceMap: Record<string, { direction: string; isAuspicious: boolean; gate?: string }> = {};
  for (const p of data.palaces) {
    palaceMap[p.direction] = p;
  }
  return (
    <View style={s.compassGrid}>
      {DIR_ORDER.map((dir) => {
        const p = palaceMap[dir];
        const isLucky = p?.isAuspicious;
        return (
          <View key={dir} style={[s.compassCell, isLucky && s.compassCellLucky]}>
            <Text style={[s.compassDir, isLucky && { color: Colors.primary }]}>{dir}</Text>
            {p?.gate && p.gate !== '—' && (
              <Text style={s.compassGate}>{p.gate}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Hexagram symbol ───
function HexagramBlock({ data }: { data: DivinationData }) {
  if (!data?.hexagram) return null;
  const h = data.hexagram;
  return (
    <View style={s.hexBlock}>
      <Text style={s.hexSymbol}>{h.symbol}</Text>
      <Text style={s.hexName}>{h.name}</Text>
      {h.oracle && <Text style={s.hexOracle}>「{h.oracle}」</Text>}
      {h.upperTrigram && (
        <View style={s.trigramRow}>
          <Text style={s.trigramText}>上卦 {h.upperTrigram}</Text>
          <Text style={s.trigramText}>下卦 {h.lowerTrigram}</Text>
          {h.element && <Text style={s.trigramText}>{h.element}</Text>}
        </View>
      )}
    </View>
  );
}

// ─── EXP badge ───
function ExpBadge({ type, data }: { type: string; data?: PetActionData }) {
  const expMap: Record<string, number> = { feed: 50, play: 30, meditate: 20 };
  const exp = data?.exp || expMap[type] || 0;
  return (
    <View style={s.expBadge}>
      <Text style={s.expBadgeText}>+{exp} EXP</Text>
    </View>
  );
}

// ─── Level-up / Evolve badge ───
function CelebrationBadge({ type, data }: { type: string; data?: LevelUpData & EvolveData }) {
  const isEvolve = type === 'evolve';
  return (
    <View style={[s.celebBadge, isEvolve && s.celebBadgeEvolve]}>
      <Text style={s.celebEmoji}>{isEvolve ? '🌟' : '⬆️'}</Text>
      <Text style={s.celebText}>
        {isEvolve
          ? `進化階段 ${data?.evolution || '?'}`
          : `Lv.${data?.level || '?'}`}
      </Text>
    </View>
  );
}

// ─── Props ───
interface PetBubbleProps {
  message: ChatMessage;
  petEmoji: string;
  petName: string;
}

export default function PetBubble({ message, petEmoji, petName }: PetBubbleProps) {
  const { t } = useTranslation();
  const petId = usePetStore(s => s.petId) || '';
  const petAvatarImg = getPetImage(petId, 'avatar');

  const timeStr = (() => {
    try {
      const d = new Date(message.time);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  })();

  const isNurture = ['feed', 'play', 'meditate'].includes(message.type);
  const isCeleb = ['levelup', 'evolve'].includes(message.type);

  // Result type badge image
  const resultBadge = message.type === 'face' ? CHAT_BUBBLE.resultEye
    : message.type === 'fengshui' ? CHAT_BUBBLE.resultHeart
    : message.type === 'divination' ? CHAT_BUBBLE.resultPearl
    : null;

  // Feature-colored accent border for result messages
  const accentColor = message.type === 'face' ? '#E8C547'
    : message.type === 'fengshui' ? '#4CAF50'
    : message.type === 'divination' ? '#9C6ADE'
    : null;

  return (
    <View style={s.container}>
      {/* Header: pet avatar/emoji + name + time */}
      <View style={s.header}>
        {petAvatarImg ? (
          <Image source={petAvatarImg} style={s.headerAvatar} resizeMode="cover" />
        ) : (
          <Text style={s.headerEmoji}>{petEmoji}</Text>
        )}
        <Text style={s.headerName}>{petName}</Text>
        {resultBadge && (
          <Image source={resultBadge} style={s.resultBadge} resizeMode="contain" />
        )}
        <Text style={s.headerTime}>{timeStr}</Text>
      </View>

      {/* Bubble body */}
      <View style={[
        s.bubble,
        accentColor ? { borderLeftWidth: 3, borderLeftColor: accentColor } : null,
      ]}>
        {/* Corner decoration */}
        <Image source={CHAT_BUBBLE.corner} style={s.bubbleCorner} resizeMode="contain" />
        <Text style={s.bubbleText}>{message.text}</Text>

        {/* Classic quote */}
        {message.classicQuote && (
          <Text style={s.classicQuote}>{message.classicQuote}</Text>
        )}

        {/* Embedded data by type */}
        {message.type === 'fortune' && (() => {
          const d = message.data as FortuneData | undefined;
          return d?.scores ? (
            <View style={s.dataSection}>
              <ScoreBar label={t('home.wealth')} value={d.scores.wealth} />
              <ScoreBar label={t('home.love')} value={d.scores.love} />
              <ScoreBar label={t('home.career')} value={d.scores.career} />
              <ScoreBar label={t('home.health')} value={d.scores.health} />
              <ScoreBar label={t('home.study')} value={d.scores.study} />
              {d.luckyDirection && (
                <View style={s.luckyRow}>
                  <Text style={s.luckyItem}>🧭 {d.luckyDirection}</Text>
                  {d.luckyColor && <Text style={s.luckyItem}>🎨 {d.luckyColor}</Text>}
                  {d.luckyNumber && <Text style={s.luckyItem}>🔢 {d.luckyNumber}</Text>}
                </View>
              )}
            </View>
          ) : null;
        })()}

        {message.type === 'face' && (() => {
          const d = message.data as FaceData | undefined;
          return d?.features ? (
            <View style={s.dataSection}>
              {Object.entries(d.features).map(([key, val]) => (
                <ScoreBar key={key} label={t(`eye.${key}`)} value={val.score} />
              ))}
              {d.lucky_item && (
                <View style={s.luckyRow}>
                  <Text style={s.luckyItem}>{d.lucky_item.emoji} {d.lucky_item.name}</Text>
                </View>
              )}
            </View>
          ) : null;
        })()}

        {message.type === 'fengshui' && (() => {
          const d = message.data as FengshuiData | undefined;
          return d ? (
            <View style={s.dataSection}>
              <CompassGrid data={d} />
              {d.luckyDirections && (
                <View style={s.luckyRow}>
                  <Text style={s.luckyItem}>✦ {d.luckyDirections.join(', ')}</Text>
                </View>
              )}
            </View>
          ) : null;
        })()}

        {message.type === 'divination' && (() => {
          const d = message.data as DivinationData | undefined;
          return d ? (
            <View style={s.dataSection}>
              <HexagramBlock data={d} />
            </View>
          ) : null;
        })()}

        {isNurture && <ExpBadge type={message.type} data={message.data as PetActionData | undefined} />}
        {isCeleb && <CelebrationBadge type={message.type} data={message.data as (LevelUpData & EvolveData) | undefined} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 4, paddingHorizontal: 4,
  },
  headerEmoji: { fontSize: 16 },
  headerAvatar: { width: 20, height: 20, borderRadius: 10 },
  headerName: { fontSize: 11, color: Colors.textDark, fontFamily: Fonts.serif },
  headerTime: { fontSize: 10, color: Colors.textDarkest, marginLeft: 'auto' },
  resultBadge: { width: 24, height: 24 },

  bubble: {
    padding: 14, borderRadius: 16,
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.1)',
  },
  bubbleCorner: {
    position: 'absolute', top: 0, left: 0,
    width: 16, height: 16, opacity: 0.4,
  },
  bubbleText: {
    fontSize: 14, color: Colors.textSecondary,
    fontFamily: Fonts.serif, lineHeight: 22,
  },

  classicQuote: {
    marginTop: 8, fontSize: 12, color: Colors.textDark,
    fontStyle: 'italic', fontFamily: Fonts.serif, lineHeight: 20,
  },

  dataSection: { marginTop: 12 },

  // Score bars
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  scoreLabel: { fontSize: 11, color: Colors.textDark, width: 30, textAlign: 'right' },
  scoreTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 2 },
  scoreValue: { fontSize: 11, width: 24, fontWeight: '700' },

  // Lucky items row
  luckyRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
  },
  luckyItem: { fontSize: 11, color: Colors.textDark },

  // Compass grid
  compassGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    width: '100%', gap: 2,
  },
  compassCell: {
    width: '31.5%', aspectRatio: 1.2,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  compassCellLucky: { backgroundColor: 'rgba(232,197,71,0.08)' },
  compassDir: { fontSize: 10, color: Colors.textDark, fontWeight: '600' },
  compassGate: { fontSize: 9, color: Colors.textMuted, marginTop: 2 },

  // Hexagram
  hexBlock: { alignItems: 'center', paddingVertical: 8 },
  hexSymbol: { fontSize: 32, marginBottom: 4 },
  hexName: { fontSize: 14, color: Colors.primary, fontFamily: Fonts.serifBold, letterSpacing: 2 },
  hexOracle: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.serif,
    marginTop: 6, textAlign: 'center', letterSpacing: 2,
  },
  trigramRow: {
    flexDirection: 'row', gap: 12, marginTop: 8,
  },
  trigramText: { fontSize: 10, color: Colors.textDark },

  // EXP badge
  expBadge: {
    marginTop: 8, alignSelf: 'flex-start',
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  expBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  // Celebration badge
  celebBadge: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.15)',
  },
  celebBadgeEvolve: { backgroundColor: 'rgba(160,100,255,0.15)' },
  celebEmoji: { fontSize: 16 },
  celebText: { fontSize: 13, color: Colors.primary, fontFamily: Fonts.serifBold },
});
