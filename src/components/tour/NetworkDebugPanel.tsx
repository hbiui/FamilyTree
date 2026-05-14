import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Slider } from 'react-native';
import { useNetworkSimulator, NetworkSimulationMode } from '../../store/useNetworkSimulationStore';
import { Colors } from '../../constants/colors';

const MODES: { label: string; value: NetworkSimulationMode; color: string }[] = [
  { label: '正常网络', value: 'NORMAL', color: '#10B981' },
  { label: '慢速网络', value: 'SLOW', color: '#3B82F6' },
  { label: '离线', value: 'OFFLINE', color: Colors.primary },
  { label: '网络限流', value: 'THROTTLING', color: '#F59E0B' },
  { label: '请求超时', value: 'TIMEOUT', color: '#6366F1' },
  { label: '500错误', value: '500_ERROR', color: '#8B5CF6' },
  { label: '403禁止', value: '403_FORBIDDEN', color: '#EC4899' },
  { label: '404找不到', value: '404_NOT_FOUND', color: '#14B8A6' },
];

export const NetworkDebugPanel: React.FC = () => {
  const {
    isEnabled,
    mode,
    delayMs,
    failureRate,
    toggle,
    setMode,
    setDelayMs,
    setFailureRate,
    resetSimulation,
  } = useNetworkSimulator();

  const currentModeConfig = MODES.find(m => m.value === mode) || MODES[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌐 网络模拟调试</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>启用</Text>
          <Switch
            value={isEnabled}
            onValueChange={toggle}
            trackColor={{ false: '#D1D5DB', true: currentModeConfig.color }}
          />
        </View>
      </View>

      {isEnabled && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>网络模式</Text>
          <View style={styles.modeGrid}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.modeButton,
                  mode === m.value && [
                    styles.modeButtonActive,
                    { backgroundColor: m.color },
                  ],
                ]}
                onPress={() => setMode(m.value)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.modeButtonText,
                  mode === m.value && styles.modeButtonTextActive,
                ]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>延迟设置</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>延迟: {delayMs}ms</Text>
            </View>
            
            {mode !== 'OFFLINE' && (
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>100ms</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={5000}
                  step={100}
                  value={delayMs}
                  onValueChange={setDelayMs}
                  minimumTrackTintColor={currentModeConfig.color}
                  maximumTrackTintColor="#E5E7EB"
                />
                <Text style={styles.sliderLabel}>5s</Text>
              </View>
            )}
          </View>

          {['THROTTLING', '500_ERROR', '403_FORBIDDEN', '404_NOT_FOUND'].includes(mode) && (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>失败率</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>
                  {Math.round(failureRate * 100)}%
                </Text>
              </View>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.1}
                  value={failureRate}
                  onValueChange={setFailureRate}
                  minimumTrackTintColor={currentModeConfig.color}
                  maximumTrackTintColor="#E5E7EB"
                />
                <Text style={styles.sliderLabel}>100%</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetSimulation}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>重置为默认</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isEnabled && (
        <View style={styles.disabledNotice}>
          <Text style={styles.disabledText}>
            点击顶部开关启用网络模拟功能
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  settingsSection: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    width: 35,
  },
  slider: {
    flex: 1,
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  disabledNotice: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
