import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

type EmptyStateType =
  | 'no_family'
  | 'no_members'
  | 'no_events'
  | 'no_invite_response'
  | 'no_search_results'
  | 'no_relations'
  | 'no_timeline'
  | 'no_achievements';

interface EmptyStateConfig {
  illustration: string;
  title: string;
  description: string;
  actionText?: string;
  secondaryText?: string;
  style?: 'warm' | 'neutral' | 'professional';
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateType, EmptyStateConfig> = {
  no_family: {
    illustration: '🏠',
    title: '创建您的第一个家族',
    description:
      '家，是温暖的港湾。\n开始记录家族故事，\n让每一代人的记忆都能被珍藏。',
    actionText: '创建家族',
    style: 'warm',
  },
  no_members: {
    illustration: '👨‍👩‍👧‍👦',
    title: '添加第一位家族成员',
    description:
      '每一个家族都从一个名字开始。\n记录下第一位成员，\n开启您的家族故事。',
    actionText: '添加成员',
    style: 'warm',
  },
  no_events: {
    illustration: '📖',
    title: '记录生命的故事',
    description:
      '每个人的一生都有值得铭记的时刻。\n添加出生、结婚、升学... \n这些珍贵的记忆将被代代相传。',
    actionText: '添加故事',
    style: 'warm',
  },
  no_invite_response: {
    illustration: '💌',
    title: '等待家人的回应',
    description:
      '邀请已发出，亲人还未接受？\n尝试分享邀请码给家人，\n一起编织我们的家族故事。',
    actionText: '分享邀请码',
    secondaryText: '重新生成邀请',
    style: 'neutral',
  },
  no_search_results: {
    illustration: '🔍',
    title: '未找到相关结果',
    description: '试试其他关键词，或者扩大搜索范围。',
    style: 'neutral',
  },
  no_relations: {
    illustration: '🔗',
    title: '暂无家族关系',
    description:
      '家族成员之间的关系将在此显示。\n添加更多成员，\n让关系网更加完整。',
    style: 'neutral',
  },
  no_timeline: {
    illustration: '📅',
    title: '记录重要时刻',
    description:
      '家族的每一个里程碑都值得被铭记。\n出生、结婚、迁徙...\n让这些故事成为家族的珍贵财富。',
    actionText: '添加事件',
    style: 'warm',
  },
  no_achievements: {
    illustration: '🏆',
    title: '荣誉墙空空如也',
    description:
      '每一位家族成员都有值得骄傲的时刻。\n记录成就与荣誉，\n让优良家风代代相传。',
    actionText: '添加荣誉',
    style: 'professional',
  },
};

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  customTitle?: string;
  customDescription?: string;
  customActionText?: string;
  customSecondaryText?: string;
  style?: ViewStyle;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  onSecondaryAction,
  customTitle,
  customDescription,
  customActionText,
  customSecondaryText,
  style,
  compact = false,
}) => {
  const config = EMPTY_STATE_CONFIGS[type];

  const containerStyle: ViewStyle[] = [
    styles.container,
    compact && styles.containerCompact,
    config.style === 'warm' && styles.containerWarm,
    config.style === 'professional' && styles.containerProfessional,
    style as ViewStyle,
  ];

  const getIllustrationStyle = (): ViewStyle => {
    if (compact) {
      return styles.illustrationCompact;
    }
    return config.style === 'warm' ? styles.illustrationWarm : styles.illustrationNeutral;
  };

  return (
    <View style={containerStyle}>
      <View style={getIllustrationStyle()}>
        <Text style={styles.illustrationEmoji}>{config.illustration}</Text>
        {config.style === 'warm' && (
          <View style={styles.illustrationGlow} />
        )}
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>
        {customTitle || config.title}
      </Text>

      <Text style={[styles.description, compact && styles.descriptionCompact]}>
        {customDescription || config.description}
      </Text>

      <View style={styles.actions}>
        {onAction && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              config.style === 'warm' && styles.primaryButtonWarm,
              config.style === 'professional' && styles.primaryButtonProfessional,
            ]}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.primaryButtonText,
                config.style === 'warm' && styles.primaryButtonTextWarm,
              ]}
            >
              {customActionText || config.actionText || '开始'}
            </Text>
          </TouchableOpacity>
        )}

        {onSecondaryAction && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              compact && styles.secondaryButtonCompact,
            ]}
            onPress={onSecondaryAction}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {customSecondaryText || config.secondaryText}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {config.style === 'warm' && !compact && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>每一段记忆都值得被珍藏 💝</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  containerCompact: {
    paddingVertical: 24,
  },
  containerWarm: {
    backgroundColor: '#FFFBF5',
  },
  containerProfessional: {
    backgroundColor: '#F9FAFB',
  },
  illustrationWarm: {
    marginBottom: 24,
  },
  illustrationNeutral: {
    marginBottom: 16,
  },
  illustrationCompact: {
    marginBottom: 12,
  },
  illustrationEmoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  illustrationGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    opacity: 0.5,
    zIndex: -1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  titleCompact: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  descriptionCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButtonWarm: {
    backgroundColor: '#EF4444',
  },
  primaryButtonProfessional: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButtonTextWarm: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonCompact: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default EmptyState;
export { EmptyState };
export type { EmptyStateType, EmptyStateProps };
