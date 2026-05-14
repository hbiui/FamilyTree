import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from '../../src/constants/typography';
import { useTheme } from '../../src/context/ThemeContext';
import ThemeSwitcher from '../../src/components/theme/ThemeSwitcher';
import { OfflineDebugPanel } from '../../src/components/tour/OfflineDebugPanel';
import { NetworkDebugPanel } from '../../src/components/tour/NetworkDebugPanel';

export default function SettingsScreen() {
  const { colors, fontScale } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>设置</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>账户</Text>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>个人资料</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🔐</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>账户安全</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>应用</Text>
          <View style={[styles.menuItem, { backgroundColor: colors.background.card }]}>
            <ThemeSwitcher />
          </View>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>通知设置</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🌐</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>语言设置</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>关于</Text>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📖</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>使用指南</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>💬</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>反馈建议</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.background.card }]} 
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={[styles.menuText, { color: colors.text.primary }]}>关于我们</Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>开发调试</Text>
            <View style={{ backgroundColor: colors.background.card, borderRadius: 12, padding: 8, marginBottom: 8 }}>
              <NetworkDebugPanel />
            </View>
            <View style={{ backgroundColor: colors.background.card, borderRadius: 12, padding: 8 }}>
              <OfflineDebugPanel />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.text.tertiary }]}>FamilyTree v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    ...Typography.h2(1),
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.overline(1),
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    ...Typography.body(1),
    flex: 1,
  },
  menuArrow: {
    fontSize: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    ...Typography.caption(1),
  },
});
