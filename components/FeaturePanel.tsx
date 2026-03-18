// ═══════════════════════════════════════
// FeaturePanel — 內嵌功能面板（靈眼/靈心/靈魂）
// 顯示在 PetAvatar 下方、PetChat 上方
// 功能結果透過 onResult → PetChat 聊天氣泡輸出
// ═══════════════════════════════════════

import { View, StyleSheet, ImageBackground } from 'react-native';
import { Colors } from '@/config/theme';
import { EFFECTS } from '@/assets/images';
import type { ActiveFeature } from './PetAvatar';
import PetEyeMode from './features/PetEyeMode';
import PetHeartMode from './features/PetHeartMode';
import PetPearlMode from './features/PetPearlMode';

interface FeaturePanelProps {
  activeFeature: ActiveFeature;
  onClose: () => void;
  onEyeResult: (text: string, data: any) => void;
  onHeartResult: (text: string, data: any) => void;
  onPearlResult: (text: string, data: any) => void;
  onQuotaExhausted: () => void;
}

export default function FeaturePanel({
  activeFeature,
  onClose,
  onEyeResult,
  onHeartResult,
  onPearlResult,
  onQuotaExhausted,
}: FeaturePanelProps) {
  if (!activeFeature) return null;

  return (
    <ImageBackground
      source={EFFECTS.panelBgPattern}
      resizeMode="repeat"
      style={styles.container}
      imageStyle={{ opacity: 0.05 }}
    >
      {activeFeature === 'eye' && (
        <PetEyeMode
          onClose={onClose}
          onResult={onEyeResult}
          onQuotaExhausted={onQuotaExhausted}
        />
      )}
      {activeFeature === 'heart' && (
        <PetHeartMode
          onClose={onClose}
          onResult={onHeartResult}
          onQuotaExhausted={onQuotaExhausted}
        />
      )}
      {activeFeature === 'pearl' && (
        <PetPearlMode
          onClose={onClose}
          onResult={onPearlResult}
          onQuotaExhausted={onQuotaExhausted}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,197,71,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,197,71,0.08)',
  },
});
