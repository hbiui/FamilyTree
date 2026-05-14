import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { aiService } from '../../services/aiService';
import { useAIStore } from '../../store/useAIStore';
import type { PhotoAnalysis } from '../../types/familyTree';

interface PhotoEnhancerProps {
  imageUrl: string;
  onEnhanced?: (enhancedUrl: string) => void;
  onClose?: () => void;
}

const ScoreBar = ({ label, value, color, invert = false }: {
  label: string;
  value: number;
  color: string;
  invert?: boolean;
}) => {
  const displayValue = invert ? 100 - value : value;
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBarContainer}>
        <View
          style={[
            styles.scoreBar,
            {
              width: `${displayValue}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.scoreValue}>{Math.round(value)}</Text>
    </View>
  );
};

const AnalysisCard = ({ title, analysis }: { title: string; analysis: PhotoAnalysis }) => (
  <View style={styles.analysisCard}>
    <Text style={styles.analysisTitle}>{title}</Text>
    <View style={styles.analysisContent}>
      <ScoreBar
        label="清晰度"
        value={analysis.clarity_score}
        color="#059669"
      />
      <ScoreBar
        label="锐度"
        value={analysis.sharpness_score}
        color="#3B82F6"
      />
      <ScoreBar
        label="色彩"
        value={analysis.color_score}
        color="#EC4899"
      />
      <ScoreBar
        label="噪点"
        value={analysis.noise_level}
        color="#EF4444"
        invert
      />
      <View style={styles.analysisMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>分辨率</Text>
          <Text style={styles.metaValue}>
            {analysis.resolution.width} × {analysis.resolution.height}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>文件大小</Text>
          <Text style={styles.metaValue}>{analysis.file_size_kb} KB</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>人脸检测</Text>
          <Text style={[
            styles.metaValue,
            { color: analysis.face_detected ? '#059669' : '#6B7280' },
          ]}>
            {analysis.face_detected ? `${analysis.face_count} 张` : '未检测到'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const ComparisonView = ({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) => {
  return (
    <View style={styles.comparisonContainer}>
      <View style={styles.comparisonImageContainer}>
        <Text style={styles.comparisonLabel}>修复前</Text>
        <Image
          source={{ uri: beforeUrl }}
          style={styles.comparisonImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.comparisonDivider}>
        <Text style={styles.comparisonArrow}>→</Text>
      </View>
      <View style={styles.comparisonImageContainer}>
        <Text style={[styles.comparisonLabel, { color: '#059669' }]}>
          修复后
        </Text>
        <Image
          source={{ uri: afterUrl }}
          style={styles.comparisonImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const ImprovementIndicator = ({
  before,
  after,
  label,
  invert = false,
}: {
  before: number;
  after: number;
  label: string;
  invert?: boolean;
}) => {
  const diff = invert ? before - after : after - before;
  const isImproved = diff > 0;
  const percent = Math.abs(Math.round((diff / (invert ? before : (before || 1))) * 100));

  return (
    <View style={styles.improvementItem}>
      <Text style={styles.improvementLabel}>{label}</Text>
      <View style={styles.improvementValueRow}>
        <Text style={styles.improvementBefore}>{Math.round(before)}</Text>
        <Text style={[
          styles.improvementArrow,
          { color: isImproved ? '#059669' : '#EF4444' },
        ]}>
          →
        </Text>
        <Text style={[
          styles.improvementAfter,
          { color: isImproved ? '#059669' : '#EF4444' },
        ]}>
          {Math.round(after)}
        </Text>
        {isImproved && (
          <View style={styles.improvementBadge}>
            <Text style={styles.improvementBadgeText}>+{percent}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function PhotoEnhancer({
  imageUrl,
  onEnhanced,
  onClose,
}: PhotoEnhancerProps) {
  const {
    enhancementResult,
    isEnhancing,
    enhanceError,
    setEnhancementResult,
    setIsEnhancing,
    setEnhanceError,
    clearEnhanceState,
  } = useAIStore();

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const result = await aiService.enhancePhoto(imageUrl);
      setEnhancementResult(result);

      if (!result.success && result.error) {
        Alert.alert('优化失败', result.error);
      }
    } catch (error) {
      setEnhanceError(error instanceof Error ? error.message : '优化失败');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleConfirm = () => {
    if (enhancementResult?.success) {
      onEnhanced?.(enhancementResult.enhanced_url);
      clearEnhanceState();
      onClose?.();
    }
  };

  const handleReset = () => {
    clearEnhanceState();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 标题 */}
      <Text style={styles.title}>✨ 照片智能优化</Text>
      <Text style={styles.subtitle}>
        使用 AI 技术修复老照片，提升清晰度和色彩还原度
      </Text>

      {/* 原始照片预览 */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>当前照片</Text>
        <View style={styles.previewImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 优化按钮 */}
      {!enhancementResult && (
        <TouchableOpacity
          style={[styles.enhanceButton, isEnhancing && styles.enhanceButtonDisabled]}
          onPress={handleEnhance}
          disabled={isEnhancing}
        >
          {isEnhancing ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.enhanceButtonText}>  优化中...</Text>
            </>
          ) : (
            <Text style={styles.enhanceButtonText}>🔮 开始优化</Text>
          )}
        </TouchableOpacity>
      )}

      {/* 优化结果 */}
      {enhancementResult && enhancementResult.success && (
        <View style={styles.resultSection}>
          {/* 对比视图 */}
          <ComparisonView
            beforeUrl={enhancementResult.original_url}
            afterUrl={enhancementResult.enhanced_url}
          />

          {/* 改进指标 */}
          <View style={styles.improvementsCard}>
            <Text style={styles.improvementsTitle}>📊 效果对比</Text>
            <ImprovementIndicator
              label="清晰度"
              before={enhancementResult.before_analysis.clarity_score}
              after={enhancementResult.after_analysis.clarity_score}
            />
            <ImprovementIndicator
              label="锐度"
              before={enhancementResult.before_analysis.sharpness_score}
              after={enhancementResult.after_analysis.sharpness_score}
            />
            <ImprovementIndicator
              label="色彩"
              before={enhancementResult.before_analysis.color_score}
              after={enhancementResult.after_analysis.color_score}
            />
            <ImprovementIndicator
              label="噪点"
              before={enhancementResult.before_analysis.noise_level}
              after={enhancementResult.after_analysis.noise_level}
              invert
            />
            <View style={styles.processingTimeRow}>
              <Text style={styles.processingTimeLabel}>处理耗时</Text>
              <Text style={styles.processingTimeValue}>
                {(enhancementResult.processing_time_ms / 1000).toFixed(1)}s
              </Text>
            </View>
          </View>

          {/* 详细分析 */}
          <AnalysisCard
            title="📋 修复前分析"
            analysis={enhancementResult.before_analysis}
          />
          <AnalysisCard
            title="✅ 修复后分析"
            analysis={enhancementResult.after_analysis}
          />

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>重新优化</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>💾 保存优化结果</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {enhanceError && (
        <View style={styles.errorSection}>
          <Text style={styles.errorTitle}>❌ 优化失败</Text>
          <Text style={styles.errorText}>{enhanceError}</Text>
        </View>
      )}

      {/* 使用说明 */}
      {!enhancementResult && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 使用提示</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>支持修复模糊、褪色的老照片</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>可以去除照片上的噪点和划痕</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>优化后可以对比效果再决定是否保存</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>建议使用清晰的原始照片获得最佳效果</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  previewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  enhanceButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  enhanceButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  enhanceButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultSection: {
    marginTop: 16,
  },
  comparisonContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  comparisonImageContainer: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  comparisonImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  comparisonDivider: {
    paddingHorizontal: 12,
  },
  comparisonArrow: {
    fontSize: 24,
    color: '#059669',
    fontWeight: '700',
  },
  improvementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  improvementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  improvementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  improvementLabel: {
    fontSize: 15,
    color: '#4B5563',
  },
  improvementValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  improvementBefore: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  improvementArrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  improvementAfter: {
    fontSize: 15,
    fontWeight: '600',
  },
  improvementBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  improvementBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  processingTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  processingTimeLabel: {
    fontSize: 15,
    color: '#4B5563',
  },
  processingTimeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  analysisContent: {
    gap: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    width: 60,
    fontSize: 14,
    color: '#6B7280',
  },
  scoreBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 5,
  },
  scoreValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  analysisMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
  },
  tipsSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    color: '#D97706',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
