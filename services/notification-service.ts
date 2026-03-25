// ═══════════════════════════════════════
// 推播通知服務 — 每日運勢提醒
// ═══════════════════════════════════════

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 設定前景通知行為
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 靈寵推播文案（隨機選一）
const DAILY_MESSAGES = [
  { title: '🔮 你的靈寵有話要說...', body: '主人，今日的星象有變化，快來看看運勢吧！' },
  { title: '✨ 靈氣波動提醒', body: '主人～今天的運勢很特別，靈寵已經幫你算好了！' },
  { title: '🌟 每日運勢已更新', body: '新的一天，新的機運！你的靈寵正在等你...' },
  { title: '🐾 靈寵想念你了', body: '主人好久沒來了...今日有重要運勢提示等你查看！' },
  { title: '☰ 今日卦象已成', body: '奇門遁甲顯示今日吉方有變，快來確認！' },
  { title: '💫 靈眼觀察', body: '主人，今天的氣色適合做重要決定，來看詳細分析！' },
  { title: '🧭 風水提醒', body: '今日方位吉凶已更新，你的靈寵有建議要給你～' },
];

/**
 * 請求通知權限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * 排程每日 8:00 AM 本地推播
 */
export async function scheduleDailyFortunePush(): Promise<void> {
  // 先取消所有既有的排程
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 隨機選一則文案
  const msg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

  // 排程每日 8:00
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: 'default',
      badge: 1,
      data: { type: 'daily_fortune' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  // 加一個下午 6 點的提醒（如果早上沒開）
  const eveningMsg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: eveningMsg.title,
      body: '晚間運勢提醒：' + eveningMsg.body,
      sound: 'default',
      data: { type: 'evening_fortune' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

/**
 * 初始化通知系統（App 啟動時呼叫）
 */
export async function initNotifications(): Promise<void> {
  const granted = await requestNotificationPermission();
  if (granted) {
    await scheduleDailyFortunePush();
  }
}
