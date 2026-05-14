import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeMode } from '../../constants/colors';

const themeOptions: { mode: ThemeMode; label: string; description: string; icon: string }[] = [
  { mode: 'light', label: '浅色模式', description: '明亮清爽的界面', icon: '☀️' },
  { mode: 'dark', label: '深色模式', description: '暖墨色护眼界面', icon: '🌙' },
  { mode: 'system', label: '跟随系统', description: '自动匹配系统设置', icon: '⚙️' },
];

const ThemeSwitcher: React.FC = () => {
  const { themeMode, setThemeMode, colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>主题模式</Text>
      <Text style={[styles.description, { color: colors.text.secondary }]}>
        选择您喜欢的界面外观
      </Text>
      
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.optionButton,
              {
                backgroundColor: themeMode === option.mode 
                  ? colors.primary[500] 
                  : colors.background.card,
                borderColor: themeMode === option.mode 
                  ? colors.primary[500] 
                  : colors.border.default,
              },
            ]}
            onPress={() => setThemeMode(option.mode)}
          >
            <Text style={styles.icon}>{option.icon}</Text>
            <View style={styles.optionContent}>
              <Text 
                style={[
                  styles.optionLabel,
                  { 
                    color: themeMode === option.mode 
                      ? colors.text.inverse 
                      : colors.text.primary 
                  },
                ]}
              >
                {option.label}
              </Text>
              <Text 
                style={[
                  styles.optionDescription,
                  { 
                    color: themeMode === option.mode 
                      ? colors.text.inverse + '80' 
                      : colors.text.secondary 
                  },
                ]}
              >
                {option.description}
              </Text>
            </View>
            {themeMode === option.mode && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemeSwitcher;
