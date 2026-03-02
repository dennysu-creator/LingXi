// ═══════════════════════════════════════
// 底部 Tab 導航佈局（3 Tab：首頁/靈寵/我的）
// ═══════════════════════════════════════

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/config/theme';
import { usePetStore } from '@/stores/pet-store';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
      {focused && (
        <View style={{
          position: 'absolute', top: 0,
          width: 4, height: 4, borderRadius: 2,
          backgroundColor: Colors.primary,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        }} />
      )}
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.35 }}>{emoji}</Text>
      <Text style={{
        fontSize: 9,
        color: focused ? Colors.primary : Colors.textDarkest,
        fontFamily: 'NotoSerifTC_400Regular',
        marginTop: 2,
      }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function CenterPetIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <View style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: focused ? 'rgba(232,197,71,0.15)' : 'rgba(232,197,71,0.06)',
        borderWidth: 1,
        borderColor: focused ? 'rgba(232,197,71,0.3)' : 'rgba(232,197,71,0.1)',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <Text style={{
        fontSize: 9,
        color: focused ? Colors.primary : Colors.textDarkest,
        fontFamily: 'NotoSerifTC_400Regular',
        marginTop: 2,
      }}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const petEmoji = usePetStore(s => s.emoji) || '🐉';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,8,15,0.98)',
          borderTopColor: 'rgba(232,197,71,0.06)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={petEmoji} label={t('tabs.home')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          tabBarIcon: ({ focused }) => (
            <CenterPetIcon emoji="🔮" label={t('tabs.pet')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label={t('tabs.profile')} focused={focused} />
          ),
        }}
      />
      {/* 隱藏舊 Tab（檔案仍保留作為備份但不顯示在 Tab Bar） */}
      <Tabs.Screen name="eye" options={{ href: null }} />
      <Tabs.Screen name="heart" options={{ href: null }} />
      <Tabs.Screen name="pearl" options={{ href: null }} />
    </Tabs>
  );
}
