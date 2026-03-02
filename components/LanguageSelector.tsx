// ═══════════════════════════════════════
// 語言選擇器元件
// ═══════════════════════════════════════

import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { Colors } from '@/config/theme';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const currentLang = i18n.language as SupportedLanguage;

  const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code: code as SupportedLanguage,
    ...info,
  }));

  const switchLanguage = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
    setVisible(false);
    // TODO: 同時更新 Claude API 的回覆語言偏好
    // 存到 AsyncStorage 持久化
  };

  const currentInfo = SUPPORTED_LANGUAGES[currentLang];

  return (
    <>
      {/* 當前語言按鈕 */}
      <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
        <Text style={styles.flag}>{currentInfo?.flag}</Text>
        <Text style={styles.label}>{currentInfo?.nativeLabel}</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* 語言選擇彈窗 */}
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('settings.language')}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    item.code === currentLang && styles.langItemActive,
                  ]}
                  onPress={() => switchLanguage(item.code)}
                >
                  <Text style={styles.langFlag}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.langName,
                      item.code === currentLang && styles.langNameActive,
                    ]}>
                      {item.nativeLabel}
                    </Text>
                  </View>
                  {item.code === currentLang && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.1)',
    gap: 10,
  },
  flag: { fontSize: 22 },
  label: { flex: 1, fontSize: 15, color: Colors.textSecondary, fontFamily: 'NotoSerifTC_400Regular' },
  arrow: { fontSize: 20, color: Colors.textDark },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12121a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,197,71,0.06)',
  },
  sheetTitle: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: 'NotoSerifTC_700Bold',
  },
  closeBtn: { fontSize: 20, color: Colors.textMuted, padding: 4 },

  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  langItemActive: {
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  langFlag: { fontSize: 26 },
  langName: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  langNameActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
});
