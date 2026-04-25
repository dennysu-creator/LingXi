// ═══════════════════════════════════════
// ErrorBoundary — 全局錯誤邊界
// ═══════════════════════════════════════

import { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import i18n from '@/i18n';
import { Colors, Fonts } from '@/config/theme';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🔮</Text>
          <Text style={styles.title}>
            {this.props.fallbackMessage || '發生了一些問題'}
          </Text>
          <Text style={styles.subtitle}>{i18n.t('error.unexpected', { defaultValue: '靈犀遇到了意外狀況' })}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.7 }]}
            onPress={this.handleRetry}
          >
            <Text style={styles.retryText}>{i18n.t('error.retry', { defaultValue: '重新載入' })}</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background, padding: 40,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 20, color: Colors.primary, fontFamily: Fonts.serifBold,
    textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 24,
  },
  retryBtn: {
    paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12,
    backgroundColor: 'rgba(232,197,71,0.12)',
    borderWidth: 1, borderColor: 'rgba(232,197,71,0.3)',
  },
  retryText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
});
