// ═══════════════════════════════════════
// 底部 Tab 導航佈局（2 Tab：靈寵 / 我的）
// ═══════════════════════════════════════

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts } from '@/config/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
      {focused && (
        <View style={{
          position: 'absolute', top: 0,
          width: 24, height: 4, borderRadius: 2,
          backgroundColor: Colors.primary,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
        }} />
      )}
      <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.35 }}>{emoji}</Text>
      <Text style={{
        fontSize: 12,
        color: focused ? Colors.primary : Colors.textDarkest,
        fontFamily: Fonts.serif,
        marginTop: 3,
        letterSpacing: 1,
      }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function CenterPetIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <View style={{
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: focused ? 'rgba(232,197,71,0.14)' : 'rgba(232,197,71,0.05)',
        borderWidth: 1.5,
        borderColor: focused ? 'rgba(232,197,71,0.35)' : 'rgba(232,197,71,0.10)',
        alignItems: 'center', justifyContent: 'center',
        // Golden glow when focused
        shadowColor: focused ? '#e8c547' : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: focused ? 0.4 : 0,
        shadowRadius: 10,
        elevation: focused ? 4 : 0,
      }}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>
      <Text style={{
        fontSize: 12,
        color: focused ? Colors.primary : Colors.textDarkest,
        fontFamily: Fonts.serif,
        marginTop: 3,
        letterSpacing: 1,
      }}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      initialRouteName="pet"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
        tabBarShowLabel: false,
      }}
    >
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
    </Tabs>
  );
}
