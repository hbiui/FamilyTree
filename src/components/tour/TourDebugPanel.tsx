import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTourStore } from '../../store/useTourStore';

export function TourDebugPanel() {
  const {
    tourCompleted,
    currentStep,
    isVisible,
    startTour,
    resetTour,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
  } = useTourStore();

  const handlePrintState = () => {
    console.log('Tour State:', {
      tourCompleted,
      currentStep,
      isVisible,
    });
    Alert.alert('Tour State', JSON.stringify({
      tourCompleted,
      currentStep,
      isVisible,
    }, null, 2));
  };

  const handleClearStorage = () => {
    try {
      localStorage.removeItem('family-tree-tour-storage');
      Alert.alert('成功', '已清除存储的引导状态');
    } catch {
      Alert.alert('失败', '清除存储失败');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 引导测试工具</Text>
      
      <View style={styles.stateCard}>
        <Text style={styles.stateLabel}>当前状态:</Text>
        <View style={styles.stateRow}>
          <Text style={styles.stateText}>
            完成: {tourCompleted ? '✅' : '❌'}
          </Text>
          <Text style={styles.stateText}>
            显示中: {isVisible ? '✅' : '❌'}
          </Text>
          <Text style={styles.stateText}>
            步骤: {currentStep || 'null'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={startTour}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>▶️ 开始引导</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={resetTour}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>🔄 重置引导</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={closeTour}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>✖️ 关闭引导</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePrintState}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>📊 打印状态</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => goToStep('welcome')}
          activeOpacity={0.7}
        >
          <Text style={styles.smallButtonText}>步骤1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => goToStep('tap_member')}
          activeOpacity={0.7}
        >
          <Text style={styles.smallButtonText}>步骤2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => goToStep('long_press_add')}
          activeOpacity={0.7}
        >
          <Text style={styles.smallButtonText}>步骤3</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerRow}>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearStorage}
          activeOpacity={0.7}
        >
          <Text style={styles.dangerButtonText}>🗑️ 清除存储</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  stateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dangerRow: {
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
