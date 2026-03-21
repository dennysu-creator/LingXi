// ═══════════════════════════════════════
// 分享服務 — 運勢結果分享到 LINE/IG
// ═══════════════════════════════════════

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * 分享運勢結果文字
 */
export async function shareFortuneText(text: string, petName: string): Promise<void> {
  const shareText = `${text}\n\n——————\n🔮 由「靈犀 LingXi」AI 命理靈寵分析\n📲 下載 App：https://apps.apple.com/app/id6759918378`;

  if (Platform.OS === 'web') return;

  const available = await Sharing.isAvailableAsync();
  if (!available) return;

  // 建立暫存文字檔來觸發分享（expo-sharing 需要 file URI）
  const fileUri = FileSystem.cacheDirectory + 'fortune-share.txt';
  await FileSystem.writeAsStringAsync(fileUri, shareText);
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: `${petName}的命理分析`,
  });
}

/**
 * 分享結果（直接用系統 share sheet）
 */
export async function shareResult(title: string, message: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const available = await Sharing.isAvailableAsync();
  if (!available) return;

  const fullMessage = `${title}\n\n${message}\n\n🔮 靈犀 LingXi — AI 命理靈寵\n📲 https://apps.apple.com/app/id6759918378`;
  const fileUri = FileSystem.cacheDirectory + 'fortune-share.txt';
  await FileSystem.writeAsStringAsync(fileUri, fullMessage);
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: title,
  });
}
