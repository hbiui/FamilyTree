import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { FeedbackEntry } from '../../types/feedback';
import { FEEDBACK_TYPE_LABELS } from '../../types/feedback';

interface FeedbackFormProps {
  onSubmit: (data: {
    type: FeedbackEntry['type'];
    title?: string;
    description: string;
    contact?: string;
  }) => void;
  onCancel?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, onCancel }) => {
  const { colors } = useTheme();
  const [feedbackType, setFeedbackType] = useState<FeedbackEntry['type']>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes: { type: FeedbackEntry['type']; icon: string; label: string }[] = [
    { type: 'bug_report', icon: '🐛', label: '问题反馈' },
    { type: 'feature_request', icon: '💡', label: '功能建议' },
    { type: 'general', icon: '💬', label: '其他意见' },
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('提示', '请填写反馈内容');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit({
        type: feedbackType,
        title: title.trim() || undefined,
        description: description.trim(),
        contact: contact.trim() || undefined,
      });

      Alert.alert('感谢您的反馈！', '我们会尽快处理您的问题。');
      
      setTitle('');
      setDescription('');
      setContact('');
      setFeedbackType('general');
    } catch (error) {
      Alert.alert('提交失败', '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>意见反馈</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            您的反馈对我们非常重要
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>反馈类型</Text>
          <View style={styles.typeContainer}>
            {feedbackTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: feedbackType === item.type ? colors.primary[500] : colors.background.card,
                    borderColor: feedbackType === item.type ? colors.primary[500] : colors.border.default,
                  },
                ]}
                onPress={() => setFeedbackType(item.type)}
              >
                <Text style={styles.typeIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    { color: feedbackType === item.type ? '#FFFFFF' : colors.text.primary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>问题标题（选填）</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.card,
                color: colors.text.primary,
                borderColor: colors.border.default,
              },
            ]}
            placeholder="请简要描述问题"
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>详细描述 *</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.background.card,
                color: colors.text.primary,
                borderColor: colors.border.default,
              },
            ]}
            placeholder="请详细描述您的问题或建议..."
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
            {description.length}/500
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>联系方式（选填）</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.card,
                color: colors.text.primary,
                borderColor: colors.border.default,
              },
            ]}
            placeholder="手机号或邮箱"
            placeholderTextColor={colors.text.tertiary}
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={[styles.hint, { color: colors.text.tertiary }]}>
            如需回复，请留下联系方式
          </Text>
        </View>

        <View style={styles.tips}>
          <Text style={[styles.tipsTitle, { color: colors.text.primary }]}>💡 温馨提示</Text>
          <Text style={[styles.tipsText, { color: colors.text.secondary }]}>
            • 请尽量详细描述问题，以便我们更好地解决
          </Text>
          <Text style={[styles.tipsText, { color: colors.text.secondary }]}>
            • 如遇到 Bug，请提供您的设备型号和应用版本
          </Text>
          <Text style={[styles.tipsText, { color: colors.text.secondary }]}>
            • 我们会在 1-3 个工作日内处理您的反馈
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background.card }]}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border.default }]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>取消</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: description.trim() ? colors.primary[500] : colors.secondary[300],
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !description.trim()}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '提交中...' : '提交反馈'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
  tips: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
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

export default FeedbackForm;
