// ═══════════════════════════════════════
// 靈寵對話氣泡 — 靈寵為主角，自然敘述結果
// ═══════════════════════════════════════

import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { Colors, Fonts } from '@/config/theme';
import type { ChatMessage, FortuneData, FaceData, FengshuiData, DivinationData, PetActionData, LevelUpData, EvolveData } from '@/stores/chat-store';
import { CHAT_BUBBLE } from '@/assets/images';
import { localizeColor, localizeDirection, localizeDirections, localizeElement, localeJoin } from '@/services/i18n-fortune-values';

// ─── Star Rating ───
function StarRating({ count }: { count: number }) {
  const clamped = Math.max(1, Math.min(5, count));
  const stars = Array.from({ length: 5 }, (_, i) => i < clamped ? '★' : '☆');
  return (
    <View style={s.starRow}>
      {stars.map((star, i) => (
        <Text
          key={i}
          style={[
            s.star,
            star === '★' ? s.starFilled : s.starEmpty,
          ]}
        >
          {star}
        </Text>
      ))}
    </View>
  );
}

// ─── Lucky Pills ───
interface LuckyPill {
  emoji: string;
  label: string;
  value: string;
}

function LuckyPills({ items, accentColor }: { items: LuckyPill[]; accentColor: string }) {
  if (!items || items.length === 0) return null;

  // Parse accentColor to get rgba with low opacity for background
  const pillBg = accentColor + '14'; // ~0.08 opacity hex
  const pillBorder = accentColor + '33'; // ~0.20 opacity hex

  return (
    <View style={s.pillsContainer}>
      {items.map((item, i) => (
        <View
          key={i}
          style={[
            s.pill,
            { backgroundColor: pillBg, borderColor: pillBorder },
          ]}
        >
          <Text style={[s.pillText, { color: accentColor }]}>
            {item.emoji} {item.label} {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Fortune Score Bar (emoji-simplified) ───
function FortuneBar({ emoji, label, value, color }: { emoji: string; label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.round(value));
  return (
    <View style={s.fortuneRow}>
      <Text style={s.fortuneEmoji}>{emoji}</Text>
      <Text style={s.fortuneLabel}>{label}</Text>
      <View style={s.fortuneTrack}>
        <View style={[s.fortuneFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.fortuneValue, { color }]}>{value}</Text>
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
      <Text style={[s.celebText, isEvolve && { color: '#A78BFA' }]}>
        {isEvolve
          ? `進化階段 ${data?.evolution || '?'}`
          : `Lv.${data?.level || '?'}`}
      </Text>
    </View>
  );
}

// ─── Helpers: compute stars & lucky pills from existing data ───

function computeStars(type: string, data: any): number {
  if (data?.stars) return data.stars;
  switch (type) {
    case 'face':
      return Math.max(1, Math.min(5, Math.round((data?.overall_score || 75) / 20)));
    case 'fengshui':
      return 4;
    case 'divination': {
      const level = data?.hexagram?.fortuneLevel || data?.interpretation?.verdict || '';
      if (level.includes('大宜') || level.includes('大吉')) return 5;
      if (level.includes('宜') || level.includes('吉')) return 4;
      if (level.includes('中') || level.includes('平')) return 3;
      if (level.includes('不宜') || level.includes('凶')) return 2;
      if (level.includes('大忌') || level.includes('大凶')) return 1;
      return 3;
    }
    case 'fortune': {
      const overall = data?.overallScore || 75;
      return Math.max(1, Math.min(5, Math.round(overall / 20)));
    }
    default:
      return 3;
  }
}

function buildLuckyPills(type: string, data: any): LuckyPill[] {
  if (data?.luckyItems) return data.luckyItems;
  const pills: LuckyPill[] = [];

  switch (type) {
    case 'face': {
      if (data?.lucky_item) {
        pills.push({ emoji: data.lucky_item.emoji || '🍀', label: i18n.t('common.luckyItem', { defaultValue: '幸運物' }), value: data.lucky_item.name || '' });
      }
      if (data?.lucky_direction) {
        pills.push({ emoji: '📍', label: i18n.t('home.luckyDirection', { defaultValue: '吉方' }), value: localizeDirection(data.lucky_direction) });
      }
      if (data?.lucky_number != null) {
        pills.push({ emoji: '🔢', label: i18n.t('home.luckyNumber', { defaultValue: '幸運數' }), value: String(data.lucky_number) });
      }
      break;
    }
    case 'fengshui': {
      if (data?.luckyDirections?.length) {
        pills.push({ emoji: '✦', label: i18n.t('home.luckyDirection', { defaultValue: '吉方' }), value: localeJoin(localizeDirections(data.luckyDirections)) });
      }
      if (data?.seat_advice) {
        pills.push({ emoji: '🪑', label: i18n.t('heart.seatLabel', { defaultValue: '座位' }), value: data.seat_advice });
      }
      if (data?.dangerDirections?.length) {
        pills.push({ emoji: '⚠️', label: i18n.t('heart.avoidLabel', { defaultValue: '避開' }), value: localeJoin(localizeDirections(data.dangerDirections)) });
      }
      break;
    }
    case 'divination': {
      const timing = data?.interpretation?.timing;
      if (timing) {
        pills.push({ emoji: '⏰', label: i18n.t('pearl.timing', { defaultValue: '時機' }), value: timing });
      }
      if (data?.hexagram?.element) {
        pills.push({ emoji: '🌀', label: i18n.t('pearl.element', { defaultValue: '五行' }), value: localizeElement(data.hexagram.element) });
      }
      break;
    }
    case 'fortune': {
      if (data?.luckyDirection) {
        pills.push({ emoji: '🧭', label: i18n.t('home.luckyDirection', { defaultValue: '吉方' }), value: localizeDirection(data.luckyDirection) });
      }
      if (data?.luckyColor) {
        pills.push({ emoji: '🎨', label: i18n.t('home.luckyColor', { defaultValue: '幸運色' }), value: localizeColor(data.luckyColor) });
      }
      if (data?.luckyNumber != null) {
        pills.push({ emoji: '🔢', label: i18n.t('home.luckyNumber', { defaultValue: '幸運數' }), value: String(data.luckyNumber) });
      }
      if (data?.luckyElement) {
        pills.push({ emoji: '🌀', label: i18n.t('pearl.element', { defaultValue: '五行' }), value: localizeElement(data.luckyElement) });
      }
      break;
    }
  }

  return pills;
}

// ─── Props ───
interface PetBubbleProps {
  message: ChatMessage;
  petEmoji: string;
  petName: string;
}

export default function PetBubble({ message, petEmoji, petName }: PetBubbleProps) {
  const { t } = useTranslation();
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
  const isResult = ['face', 'fengshui', 'divination', 'fortune'].includes(message.type);

  // Result type badge image
  const resultBadge = message.type === 'face' ? CHAT_BUBBLE.resultEye
    : message.type === 'fengshui' ? CHAT_BUBBLE.resultHeart
    : message.type === 'divination' ? CHAT_BUBBLE.resultPearl
    : null;

  // Feature accent colors
  const accentColor = message.type === 'face' ? '#FFC107'
    : message.type === 'fengshui' ? '#4ADE80'
    : message.type === 'fortune' ? '#e8c547'
    : message.type === 'divination' ? '#A78BFA'
    : null;

  // Gradient top tint for result bubbles
  const gradientTop = accentColor ? accentColor + '0A' : 'transparent'; // ~0.04 opacity

  const data = message.data as any;
  const stars = isResult ? computeStars(message.type, data) : 0;
  const luckyPills = isResult ? buildLuckyPills(message.type, data) : [];

  return (
    <View style={s.container}>
      {/* Header — compact: badge + time only */}
      <View style={s.header}>
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
        {/* Subtle gradient overlay for result bubbles */}
        {isResult && (
          <LinearGradient
            colors={[gradientTop, 'transparent']}
            style={s.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        )}

        {/* Star Rating (result types only) */}
        {isResult && <StarRating count={stars} />}

        {/* Message text */}
        <Text style={s.bubbleText}>{message.text}</Text>

        {/* Classic quote (fortune type) */}
        {message.classicQuote && message.type === 'fortune' && (
          <View style={s.quoteContainer}>
            <View style={s.quoteLine} />
            <Text style={s.classicQuote}>{message.classicQuote}</Text>
          </View>
        )}

        {/* Fortune score bars (simplified with emoji) */}
        {message.type === 'fortune' && (() => {
          const d = data as FortuneData | undefined;
          return d?.scores ? (
            <View style={s.dataSection}>
              <FortuneBar emoji="💰" label={t('home.wealth')} value={d.scores.wealth} color="#e8c547" />
              <FortuneBar emoji="💕" label={t('home.love')} value={d.scores.love} color="#ff8ba0" />
              <FortuneBar emoji="💼" label={t('home.career')} value={d.scores.career} color="#64b4ff" />
              <FortuneBar emoji="💪" label={t('home.health')} value={d.scores.health} color="#4ADE80" />
              <FortuneBar emoji="📚" label={t('home.study')} value={d.scores.study} color="#A78BFA" />
            </View>
          ) : null;
        })()}

        {/* Fengshui direction indicator (simple colored text) */}
        {message.type === 'fengshui' && (() => {
          const d = data as FengshuiData | undefined;
          if (!d) return null;
          const hasDirections = d.luckyDirections?.length || d.dangerDirections?.length;
          if (!hasDirections) return null;
          return (
            <View style={s.directionSection}>
              {d.luckyDirections?.length ? (
                <Text style={s.directionGood}>
                  {(() => {
                    const localized = localeJoin(localizeDirections(d.luckyDirections));
                    return i18n.t('heart.luckyDirLine', { dir: localized, defaultValue: `✦ 吉方：${localized}` });
                  })()}
                </Text>
              ) : null}
              {d.dangerDirections?.length ? (
                <Text style={s.directionBad}>
                  {(() => {
                    const localized = localeJoin(localizeDirections(d.dangerDirections));
                    return i18n.t('heart.avoidListLine', { dir: localized, defaultValue: `⚠ 避開：${localized}` });
                  })()}
                </Text>
              ) : null}
            </View>
          );
        })()}

        {/* Lucky Pills (all result types) */}
        {isResult && luckyPills.length > 0 && (
          <LuckyPills items={luckyPills} accentColor={accentColor || '#e8c547'} />
        )}

        {/* Nurture & Celebration badges */}
        {isNurture && <ExpBadge type={message.type} data={message.data as PetActionData | undefined} />}
        {isCeleb && <CelebrationBadge type={message.type} data={message.data as (LevelUpData & EvolveData) | undefined} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: 14 },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  headerTime: {
    fontSize: 10,
    color: Colors.textDarkest,
    marginLeft: 'auto',
  },
  resultBadge: { width: 24, height: 24 },

  // ─── Bubble ───
  bubble: {
    padding: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(232,197,71,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.12)',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  bubbleText: {
    fontSize: 16,
    color: Colors.textLight,
    fontFamily: Fonts.serif,
    lineHeight: 26,
  },

  // ─── Star Rating ───
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 8,
  },
  star: {
    fontSize: 20,
  },
  starFilled: {
    color: Colors.primary,
    textShadowColor: 'rgba(232,197,71,0.50)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  starEmpty: {
    color: Colors.textDarkest,
  },

  // ─── Classic quote ───
  quoteContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  quoteLine: {
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,197,71,0.25)',
  },
  classicQuote: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontStyle: 'italic',
    fontFamily: Fonts.serif,
    lineHeight: 20,
  },

  // ─── Data section ───
  dataSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },

  // ─── Fortune bars (emoji-simplified) ───
  fortuneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fortuneEmoji: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  fortuneLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    width: 28,
    fontFamily: Fonts.serif,
  },
  fortuneTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  fortuneFill: {
    height: '100%',
    borderRadius: 3,
  },
  fortuneValue: {
    fontSize: 14,
    width: 30,
    fontWeight: '700',
    textAlign: 'right',
  },

  // ─── Direction indicators (fengshui) ───
  directionSection: {
    marginTop: 12,
    gap: 4,
  },
  directionGood: {
    fontSize: 15,
    color: '#4ADE80',
    fontFamily: Fonts.serif,
  },
  directionBad: {
    fontSize: 15,
    color: '#ff8ba0',
    fontFamily: Fonts.serif,
  },

  // ─── Lucky Pills ───
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: Fonts.serif,
  },

  // ─── EXP badge ───
  expBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.20)',
  },
  expBadgeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },

  // ─── Celebration badge ───
  celebBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(232,197,71,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.25)',
  },
  celebBadgeEvolve: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderColor: 'rgba(167,139,250,0.25)',
  },
  celebEmoji: { fontSize: 20 },
  celebText: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: Fonts.serifBold,
  },
});
