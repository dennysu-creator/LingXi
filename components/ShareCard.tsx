// ═══════════════════════════════════════════════════════════════
// Share Card — 1080×1920 IG-story branded artwork with pet theme
// ═══════════════════════════════════════════════════════════════
// Rendered OFF-SCREEN (position:absolute, left:-99999) then captured
// to PNG via react-native-view-shot. Width/height are in dp, scaled
// down by PixelRatio so the physical output is 1080×1920 exactly.
// ═══════════════════════════════════════════════════════════════

import { forwardRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  PixelRatio,
  ImageSourcePropType,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Fonts } from '@/config/theme';

export const CARD_PHYSICAL_WIDTH = 1080;
export const CARD_PHYSICAL_HEIGHT = 1920;

export interface ShareCardData {
  title: string;
  content: string;
  category?: string;
  petImage: ImageSourcePropType | null;
  petName: string;
  petLevel: number;
  timestamp: Date;
  appStoreUrl: string;
}

interface Props {
  data: ShareCardData;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

const ShareCard = forwardRef<View, Props>(({ data }, ref) => {
  const pr = PixelRatio.get() || 1;
  const dpWidth = CARD_PHYSICAL_WIDTH / pr;
  const dpHeight = CARD_PHYSICAL_HEIGHT / pr;

  const title = truncate(data.title, 28);
  const content = truncate(data.content, 220);
  const dateStr = formatDate(data.timestamp);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.root,
        { width: dpWidth, height: dpHeight },
      ]}
    >
      {/* Dark cosmic gradient background (flat + overlay glow) */}
      <View style={[styles.bgBase, { width: dpWidth, height: dpHeight }]} />
      <View style={[styles.bgGlow, { width: dpWidth * 0.85, height: dpWidth * 0.85 }]} />

      {/* ─── Pet hero ───────────────────────────────── */}
      {data.petImage ? (
        <Image
          source={data.petImage}
          style={[styles.petImage, { width: dpWidth * 0.55, height: dpWidth * 0.55 }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.petFallback, { width: dpWidth * 0.55, height: dpWidth * 0.55 }]}>
          <Text style={styles.petFallbackEmoji}>🐉</Text>
        </View>
      )}

      {/* ─── Pet name + level pill ──────────────────── */}
      <View style={styles.petNameRow}>
        <Text style={styles.petName}>{truncate(data.petName, 10)}</Text>
        <View style={styles.lvlPill}>
          <Text style={styles.lvlText}>Lv.{data.petLevel}</Text>
        </View>
      </View>

      {/* ─── Title with gold accent ─────────────────── */}
      <View style={styles.titleRow}>
        <View style={styles.titleBar} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.titleBar} />
      </View>

      {data.category ? (
        <Text style={styles.category}>{data.category}</Text>
      ) : null}

      {/* ─── Content ────────────────────────────────── */}
      <View style={[styles.contentWrap, { width: dpWidth * 0.82 }]}>
        <Text style={styles.content} numberOfLines={9} adjustsFontSizeToFit minimumFontScale={0.8}>
          {content}
        </Text>
      </View>

      {/* ─── Footer ─────────────────────────────────── */}
      <View style={[styles.footer, { width: dpWidth * 0.88 }]}>
        <View style={styles.footerLeft}>
          <Text style={styles.brand}>靈犀 LingXi</Text>
          <Text style={styles.tagline}>AI 命理靈寵</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.qrWrap}>
          <QRCode
            value={data.appStoreUrl}
            size={Math.round(dpWidth * 0.14)}
            color="#0a0a0e"
            backgroundColor="#F5F1E8"
            ecl="H"
          />
          <Text style={styles.qrCaption}>掃碼下載</Text>
        </View>
      </View>
    </View>
  );
});
ShareCard.displayName = 'ShareCard';

export default ShareCard;

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#0a0a0e',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  bgBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#0a0a0e',
  },
  bgGlow: {
    position: 'absolute',
    top: '25%',
    borderRadius: 999,
    backgroundColor: 'rgba(232,197,71,0.10)',
    opacity: 0.9,
  },
  petImage: {
    marginTop: 20,
  },
  petFallback: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petFallbackEmoji: {
    fontSize: 140,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 18,
  },
  petName: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Fonts.brush,
    letterSpacing: 3,
    textShadowColor: 'rgba(232,197,71,0.4)',
    textShadowRadius: 8,
  },
  lvlPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.35)',
    backgroundColor: 'rgba(232,197,71,0.08)',
  },
  lvlText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  titleBar: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(232,197,71,0.45)',
  },
  title: {
    fontSize: 24,
    color: Colors.primary,
    fontFamily: Fonts.brush,
    letterSpacing: 6,
  },
  category: {
    fontSize: 13,
    color: 'rgba(245,241,232,0.55)',
    marginBottom: 14,
    fontFamily: Fonts.serif,
    letterSpacing: 3,
  },
  contentWrap: {
    marginTop: 8,
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: '#F5F1E8',
    fontFamily: Fonts.serif,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  footerLeft: {
    flex: 1,
  },
  brand: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: Fonts.brush,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(245,241,232,0.55)',
    fontFamily: Fonts.serif,
    marginTop: 2,
    letterSpacing: 2,
  },
  date: {
    fontSize: 10,
    color: 'rgba(245,241,232,0.38)',
    marginTop: 4,
    letterSpacing: 1,
  },
  qrWrap: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F5F1E8',
  },
  qrCaption: {
    fontSize: 8,
    color: '#0a0a0e',
    marginTop: 2,
    letterSpacing: 1,
  },
});
