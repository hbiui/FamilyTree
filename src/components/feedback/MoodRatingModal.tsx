import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { MoodLevel } from '../../types/feedback';
import { MOOD_EMOJIS, MOOD_LABELS, MOOD_COLORS } from '../../types/feedback';

interface MoodRatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (score: MoodLevel, feedback?: string) => void;
  onSkip?: () => void;
}

const MoodRatingModal: React.FC<MoodRatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onSkip,
}) => {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (selectedMood) {
      onSubmit(selectedMood, feedback.trim() || undefined);
      setSelectedMood(null);
      setFeedback('');
    }
  };

  const handleClose = () => {
    setSelectedMood(null);
    setFeedback('');
    onClose();
  };

  const handleSkip = () => {
    setSelectedMood(null);
    setFeedback('');
    onSkip?.();
    onClose();
  };

  const moods: MoodLevel[] = [1, 2, 3, 4, 5];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.card }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>✨ 您的使用体验如何？</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              我们很重视您的反馈，这会帮助我们做得更好
            </Text>
          </View>

          <View style={styles.moodContainer}>
            {moods.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.moodButton,
                  selectedMood === level && {
                    backgroundColor: MOOD_COLORS[level] + '20',
                    borderColor: MOOD_COLORS[level],
                  },
                ]}
                onPress={() => setSelectedMood(level)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[level]}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    { color: colors.text.secondary },
                    selectedMood === level && { color: MOOD_COLORS[level] },
                  ]}
                >
                  {MOOD_LABELS[level]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMood && selectedMood >= 4 && (
            <View style={styles.feedbackContainer}>
              <Text style={[styles.feedbackLabel, { color: colors.text.primary }]}>
                太好了！您有什么想分享的吗？（选填）
              </Text>
              <TextInput
                style={[
                  styles.feedbackInput,
                  {
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    borderColor: colors.border.default,
                  },
                ]}
                placeholder="分享您的使用体验..."
                placeholderTextColor={colors.text.tertiary}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}

          {selectedMood && selectedMood <= 3 && (
            <View style={styles.feedbackContainer}>
              <Text style={[styles.feedbackLabel, { color: colors.text.primary }]}>
                我们很遗憾听到这些，您能告诉我们哪里可以改进吗？
              </Text>
              <TextInput
                style={[
                  styles.feedbackInput,
                  {
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    borderColor: colors.border.default,
                  },
                ]}
                placeholder="请告诉我们您的困扰..."
                placeholderTextColor={colors.text.tertiary}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: colors.border.default }]}
              onPress={handleSkip}
            >
              <Text style={[styles.skipButtonText, { color: colors.text.secondary }]}>
                稍后再说
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: selectedMood ? colors.primary[500] : colors.secondary[300],
                },
              ]}
              onPress={handleSubmit}
              disabled={!selectedMood}
            >
              <Text style={styles.submitButtonText}>
                {selectedMood && selectedMood >= 4 ? '感谢您！🎉' : '提交反馈'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 4,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MoodRatingModal;
