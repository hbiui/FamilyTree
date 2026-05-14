import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import PetalFallAnimation from '../../src/components/animations/PetalFallAnimation';
import BloodLineAnimation from '../../src/components/animations/BloodLineAnimation';
import NodePopupAnimation from '../../src/components/animations/NodePopupAnimation';

export default function AnimationDemoScreen() {
  const { colors } = useTheme();
  const [showPetal, setShowPetal] = useState(false);
  const [showBloodLine, setShowBloodLine] = useState(false);
  const [showNodePopup, setShowNodePopup] = useState(false);

  const bloodLinePoints = [
    { x: 50, y: 50 },
    { x: 150, y: 150 },
    { x: 250, y: 100 },
    { x: 350, y: 200 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text.primary }]}>动画效果演示</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            测试各种动画效果
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              🌸 花瓣飘落动画
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              生日/纪念日时显示飘落的花瓣效果
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary[500] }]}
                onPress={() => {
                  setShowPetal(true);
                }}
              >
                <Text style={styles.buttonText}>🌸 樱花飘落</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary[500] }]}
                onPress={() => {
                  setShowPetal(true);
                }}
              >
                <Text style={styles.buttonText}>🌺 红花飘落</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              🩸 血缘连线动画
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              关系计算结果的血缘连线动画
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary[500] }]}
              onPress={() => {
                setShowBloodLine(true);
              }}
            >
              <Text style={styles.buttonText}>显示血缘连线</Text>
            </TouchableOpacity>
            
            <View style={[styles.previewBox, { backgroundColor: colors.background.tertiary, borderColor: colors.border.default }]}>
              <BloodLineAnimation
                visible={showBloodLine}
                points={bloodLinePoints}
                onComplete={() => setShowBloodLine(false)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              🎉 节点弹出动画
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              新增家族成员时的弹出动画
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary[500] }]}
              onPress={() => {
                setShowNodePopup(true);
              }}
            >
              <Text style={styles.buttonText}>演示节点弹出</Text>
            </TouchableOpacity>
            
            <View style={[styles.previewBox, { backgroundColor: colors.background.tertiary, borderColor: colors.border.default }]}>
              <NodePopupAnimation
                visible={showNodePopup}
                parentX={100}
                parentY={100}
                childX={200}
                childY={250}
                onComplete={() => setShowNodePopup(false)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              📊 性能提示
            </Text>
            <View style={[styles.tipCard, { backgroundColor: colors.background.card }]}>
              <Text style={[styles.tipText, { color: colors.text.secondary }]}>
                • 花瓣动画使用 20 个粒子，建议性能较弱设备减少到 10 个
              </Text>
              <Text style={[styles.tipText, { color: colors.text.secondary }]}>
                • 血缘连线动画支持平滑贝塞尔曲线
              </Text>
              <Text style={[styles.tipText, { color: colors.text.secondary }]}>
                • 节点弹出使用弹性动画，damping=8 效果最佳
              </Text>
              <Text style={[styles.tipText, { color: colors.text.secondary }]}>
                • 所有动画均使用 react-native-reanimated 实现，60fps 流畅运行
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <PetalFallAnimation
        visible={showPetal}
        emoji="🌸"
        count={20}
        duration={8000}
        onComplete={() => setShowPetal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewBox: {
    height: 300,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 16,
    overflow: 'hidden',
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
});
