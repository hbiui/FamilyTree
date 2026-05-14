import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../context/ThemeContext';
import type { MemorialPoster, MemorialElement, PosterTemplate, POSTER_TEMPLATES } from '../../types/memorial';
import type { Person } from '../../types/familyTree';
import { v4 as uuidv4 } from 'uuid';

interface MemorialEditorProps {
  familyName: string;
  familyMotto?: string;
  selectedMembers: Person[];
  qrCodeData?: string;
  onSave?: (poster: MemorialPoster) => void;
  onShare?: () => void;
}

const MemorialEditor: React.FC<MemorialEditorProps> = ({
  familyName,
  familyMotto,
  selectedMembers,
  qrCodeData,
  onSave,
  onShare,
}) => {
  const { colors } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [isEditing, setIsEditing] = useState(false);
  const [elements, setElements] = useState<MemorialElement[]>([]);
  const [showTemplates, setShowTemplates] = useState(true);

  const templates = [
    {
      id: 'classic',
      name: '经典典雅',
      backgroundColor: '#FFF8E7',
      icon: '🏮',
    },
    {
      id: 'modern',
      name: '现代简约',
      backgroundColor: '#F5F5F5',
      icon: '✨',
    },
    {
      id: 'minimal',
      name: '极简黑白',
      backgroundColor: '#1A1A1A',
      icon: '⬛',
    },
    {
      id: 'festive',
      name: '喜庆红金',
      backgroundColor: '#FF4444',
      icon: '🎊',
    },
  ];

  const handleSelectTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setElements([]);

      const memberElements: MemorialElement[] = selectedMembers.slice(0, 6).map((member, index) => ({
        id: uuidv4(),
        type: 'avatar' as const,
        x: 30 + (index % 3) * 110,
        y: 120 + Math.floor(index / 3) * 130,
        width: 100,
        height: 120,
        data: member,
      }));

      const qrCodeElement: MemorialElement = {
        id: uuidv4(),
        type: 'qrcode',
        x: 250,
        y: 350,
        width: 80,
        height: 100,
        data: { label: '扫码加入家族' },
      };

      setElements([...memberElements, qrCodeElement]);
      setShowTemplates(false);
    }
  }, [selectedMembers]);

  const handleAddElement = useCallback((type: MemorialElement['type']) => {
    const newElement: MemorialElement = {
      id: uuidv4(),
      type,
      x: 100,
      y: 200,
      width: type === 'qrcode' ? 80 : 100,
      height: type === 'qrcode' ? 100 : type === 'avatar' ? 120 : 50,
      data: type === 'text' ? { text: '添加文字' } : {},
    };
    setElements([...elements, newElement]);
  }, [elements]);

  const handleUpdateElement = useCallback((updatedElement: MemorialElement) => {
    setElements(elements.map(el => el.id === updatedElement.id ? updatedElement : el));
  }, [elements]);

  const handleDeleteElement = useCallback((elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
  }, [elements]);

  const generatePoster = useCallback((): MemorialPoster => {
    const template = templates.find(t => t.id === selectedTemplate);
    return {
      id: uuidv4(),
      familyName,
      familyMotto,
      selectedMembers,
      layout: {
        id: uuidv4(),
        name: template?.name || '经典典雅',
        type: selectedTemplate as any,
        backgroundColor: template?.backgroundColor || '#FFF8E7',
        elements,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      qrCodeData,
      createdAt: new Date().toISOString(),
    };
  }, [familyName, familyMotto, selectedMembers, selectedTemplate, elements, qrCodeData]);

  const handleShare = useCallback(async () => {
    try {
      const poster = generatePoster();
      
      Alert.alert(
        '分享海报',
        '海报已准备好！\n\n在真实设备上，这将调用系统分享功能。\n支持的分享渠道：\n• 微信\n• 朋友圈\n• QQ\n• 微博\n• 更多...',
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '保存到相册',
            onPress: () => {
              Alert.alert('提示', '在真实设备上，海报将保存到系统相册');
              onShare?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('错误', '分享失败，请重试');
    }
  }, [generatePoster, onShare]);

  const handleSave = useCallback(() => {
    const poster = generatePoster();
    onSave?.(poster);
    Alert.alert('成功', '海报已保存');
  }, [generatePoster, onSave]);

  if (showTemplates) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <ScrollView contentContainerStyle={styles.templatesContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>选择海报模板</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            为您的家族纪念册选择风格
          </Text>

          <View style={styles.templatesGrid}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  {
                    backgroundColor: template.backgroundColor,
                    borderColor: selectedTemplate === template.id ? colors.primary[500] : colors.border.default,
                    borderWidth: selectedTemplate === template.id ? 3 : 1,
                  },
                ]}
                onPress={() => handleSelectTemplate(template.id)}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <Text
                  style={[
                    styles.templateName,
                    { color: template.id === 'minimal' ? '#FFFFFF' : colors.text.primary },
                  ]}
                >
                  {template.name}
                </Text>
                {selectedTemplate === template.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              预览成员（{selectedMembers.length}人）
            </Text>
            <View style={styles.membersPreview}>
              {selectedMembers.slice(0, 6).map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberAvatar,
                    { backgroundColor: member.gender === 'male' ? colors.gender.male : colors.gender.female },
                  ]}
                >
                  <Text style={styles.memberInitial}>
                    {member.name?.charAt(0) || '?'}
                  </Text>
                </View>
              ))}
              {selectedMembers.length > 6 && (
                <View style={[styles.memberAvatar, { backgroundColor: colors.secondary[400] }]}>
                  <Text style={styles.memberInitial}>+{selectedMembers.length - 6}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background.card }]}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary[500] }]}
            onPress={() => setShowTemplates(false)}
          >
            <Text style={styles.nextButtonText}>下一步：自定义布局</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.editorContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowTemplates(true)}>
            <Text style={[styles.backText, { color: colors.primary[500] }]}>← 返回模板</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={[styles.editText, { color: colors.primary[500] }]}>
              {isEditing ? '完成编辑' : '编辑布局'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewContainer}>
          <View
            style={[
              styles.posterPreview,
              { backgroundColor: templates.find(t => t.id === selectedTemplate)?.backgroundColor },
            ]}
          >
            <Text style={[styles.posterFamilyName, { color: '#FFFFFF' }]}>{familyName}</Text>
            
            <View style={styles.elementsContainer}>
              {elements.map((element) => (
                <TouchableOpacity
                  key={element.id}
                  style={[
                    styles.elementPreview,
                    {
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                    },
                    isEditing && styles.elementEditing,
                  ]}
                  onLongPress={() => isEditing && handleDeleteElement(element.id)}
                  disabled={!isEditing}
                >
                  {element.type === 'avatar' && (
                    <View style={styles.avatarPreview}>
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: element.data.gender === 'male' ? colors.gender.male : colors.gender.female },
                        ]}
                      >
                        <Text style={styles.avatarText}>
                          {element.data.name?.charAt(0) || '?'}
                        </Text>
                      </View>
                      <Text style={styles.elementName}>{element.data.name}</Text>
                    </View>
                  )}
                  {element.type === 'qrcode' && (
                    <View style={styles.qrcodePreview}>
                      <View style={styles.qrcodeBox}>
                        <Text style={styles.qrcodeText}>二维码</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {familyMotto && (
              <Text style={styles.posterMotto}>"{familyMotto}"</Text>
            )}
          </View>
        </View>

        {isEditing && (
          <View style={styles.toolsContainer}>
            <Text style={[styles.toolsTitle, { color: colors.text.primary }]}>添加元素</Text>
            <View style={styles.toolsRow}>
              <TouchableOpacity
                style={[styles.toolButton, { backgroundColor: colors.background.card }]}
                onPress={() => handleAddElement('avatar')}
              >
                <Text style={styles.toolButtonText}>👤 成员</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolButton, { backgroundColor: colors.background.card }]}
                onPress={() => handleAddElement('text')}
              >
                <Text style={styles.toolButtonText}>📝 文字</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolButton, { backgroundColor: colors.background.card }]}
                onPress={() => handleAddElement('qrcode')}
              >
                <Text style={styles.toolButtonText}>📱 二维码</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.toolsHint}>长按元素可删除</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background.card }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary[200] }]}
          onPress={handleSave}
        >
          <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>保存</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}
          onPress={handleShare}
        >
          <Text style={styles.actionButtonText}>分享海报</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  templatesContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: '47%',
    aspectRatio: 0.8,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  templateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  membersPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  editorContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  posterPreview: {
    width: 300,
    height: 420,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  posterFamilyName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  elementsContainer: {
    flex: 1,
    marginTop: 20,
  },
  elementPreview: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementEditing: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  avatarPreview: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  elementName: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  qrcodePreview: {
    alignItems: 'center',
  },
  qrcodeBox: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrcodeText: {
    fontSize: 10,
    color: '#1F2937',
  },
  posterMotto: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toolsContainer: {
    marginTop: 16,
  },
  toolsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toolButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toolsHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MemorialEditor;
