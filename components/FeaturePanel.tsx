// ═══════════════════════════════════════
// FeaturePanel — 內嵌功能面板（靈眼/靈心/靈魂）
// 顯示在 PetAvatar 下方、PetChat 上方
// 功能結果透過 onResult → PetChat 聊天氣泡輸出
// ═══════════════════════════════════════

import { View, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
