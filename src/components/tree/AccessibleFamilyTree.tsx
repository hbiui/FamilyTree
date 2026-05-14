import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { 
  buildAccessibilityProps, 
  createButtonAccessibility, 
  createCardAccessibility,
  announceForAccessibility 
} from '../../utils/accessibility';
import type { TreeNode, Gender } from '../../types/familyTree';

interface AccessibleTreeNodeProps {
  node: TreeNode;
  onSelectNode: (node: TreeNode) => void;
  onAddChild: (parentId: string) => void;
  level?: number;
}

const AccessibleTreeNode: React.FC<AccessibleTreeNodeProps> = ({
  node,
  onSelectNode,
  onAddChild,
  level = 0,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;
  const hasSpouse = !!node.spouse;

  const nodeAccessibilityLabel = useMemo(() => {
    const parts = [node.name];
    
    if (node.gender) {
      parts.push(node.gender === 'male' ? t('member.male') : t('member.female'));
    }
    
    if (node.birthDate) {
      parts.push(`${t('member.memberBirthDate')}: ${node.birthDate}`);
    }
    
    if (hasSpouse) {
      parts.push(t('member.spouse') + ': ' + node.spouse?.name);
    }
    
    if (hasChildren) {
      parts.push(t('member.children') + ': ' + node.children?.length + ' ' + t('member.child'));
    }
    
    return parts.join(', ');
  }, [node, hasSpouse, hasChildren, t]);

  const handleSelect = useCallback(() => {
    onSelectNode(node);
    announceForAccessibility(
      `${t('accessibility.viewMemberDetails')}: ${node.name}`
    );
  }, [node, onSelectNode, t]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
    announceForAccessibility(
      isExpanded 
        ? `${t('tree.collapseAll')}` 
        : `${t('tree.expandAll')}`
    );
  }, [isExpanded, t]);

  const handleAddChild = useCallback(() => {
    onAddChild(node.id);
    announceForAccessibility(
      `${t('member.addChild')} ${node.name}`
    );
  }, [node.id, node.name, onAddChild, t]);

  const genderColor = useMemo(() => {
    switch (node.gender) {
      case 'male':
        return colors.gender.male;
      case 'female':
        return colors.gender.female;
      default:
        return colors.gender.unknown;
    }
  }, [node.gender, colors]);

  return (
    <View 
      style={[styles.nodeContainer, { marginLeft: level * 20 }]}
      {...buildAccessibilityProps({
        label: nodeAccessibilityLabel,
        role: 'button',
        hint: `${t('accessibility.doubleTapToSelect')}, ${t('accessibility.longPressToAction')}`,
      })}
    >
      <View style={styles.nodeRow}>
        {hasChildren && (
          <TouchableOpacity
            onPress={handleToggleExpand}
            style={styles.expandButton}
            {...buildAccessibilityProps(createButtonAccessibility(
              isExpanded ? t('tree.collapseAll') : t('tree.expandAll')
            ))}
          >
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={handleSelect}
          onLongPress={handleAddChild}
          delayLongPress={500}
          style={[
            styles.nodeCard,
            { backgroundColor: colors.background.card, borderLeftColor: genderColor },
          ]}
          {...buildAccessibilityProps(createCardAccessibility(
            nodeAccessibilityLabel,
            `${t('accessibility.doubleTapToSelect')}, ${t('accessibility.longPressToAction')}`
          ))}
        >
          <View style={[styles.avatar, { backgroundColor: genderColor }]}>
            <Text style={styles.avatarText}>
              {node.name?.charAt(0) || '?'}
            </Text>
          </View>
          
          <View style={styles.nodeInfo}>
            <Text style={[styles.nodeName, { color: colors.text.primary }]}>
              {node.name}
            </Text>
            {node.birthDate && (
              <Text style={[styles.nodeDate, { color: colors.text.secondary }]}>
                {node.birthDate}
              </Text>
            )}
            {hasSpouse && node.spouse && (
              <View style={styles.spouseContainer}>
                <Text style={[styles.spouseIcon]}>💑</Text>
                <Text style={[styles.spouseName, { color: colors.text.secondary }]}>
                  {node.spouse.name}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleSelect}
              style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}
              {...buildAccessibilityProps(createButtonAccessibility(
                `${t('member.editMember')}: ${node.name}`
              ))}
            >
              <Text style={styles.actionButtonText}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAddChild}
              style={[styles.actionButton, { backgroundColor: colors.accent.amber }]}
              {...buildAccessibilityProps(createButtonAccessibility(
                `${t('member.addChild')} ${node.name}`
              ))}
            >
              <Text style={styles.actionButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {hasChildren && isExpanded && (
        <View style={styles.childrenContainer}>
          {node.children?.map((child) => (
            <AccessibleTreeNode
              key={child.id}
              node={child}
              onSelectNode={onSelectNode}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface AccessibleFamilyTreeProps {
  rootNode: TreeNode;
  onSelectNode: (node: TreeNode) => void;
  onAddMember: () => void;
  onAddChild?: (parentId: string) => void;
}

const AccessibleFamilyTree: React.FC<AccessibleFamilyTreeProps> = ({
  rootNode,
  onSelectNode,
  onAddMember,
  onAddChild,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleSelectNode = useCallback((node: TreeNode) => {
    setSelectedNodeId(node.id);
    onSelectNode(node);
  }, [onSelectNode]);

  const handleAddRootMember = useCallback(() => {
    onAddMember();
    announceForAccessibility(t('member.addMember'));
  }, [onAddMember, t]);

  const treeAccessibilityLabel = useMemo(() => {
    const count = countNodes(rootNode);
    return `${t('tree.familyTree')}, ${t('family.memberCount')}: ${count}`;
  }, [rootNode, t]);

  return (
    <View 
      style={styles.container}
      {...buildAccessibilityProps({
        label: treeAccessibilityLabel,
        role: 'tree',
        hint: t('accessibility.swipeToNavigate'),
        liveRegion: 'polite',
      })}
    >
      <View 
        style={styles.header}
        {...buildAccessibilityProps(createHeaderAccessibility(t('tree.familyTree')))}
      >
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t('tree.familyTree')}
        </Text>
        
        <TouchableOpacity
          onPress={handleAddRootMember}
          style={[styles.addButton, { backgroundColor: colors.primary[500] }]}
          {...buildAccessibilityProps(createButtonAccessibility(
            t('accessibility.addNewMember')
          ))}
        >
          <Text style={styles.addButtonText}>+ {t('member.addMember')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <AccessibleTreeNode
          node={rootNode}
          onSelectNode={handleSelectNode}
          onAddChild={onAddChild || (() => {})}
          level={0}
        />
      </ScrollView>

      <View 
        style={styles.navigation}
        {...buildAccessibilityProps({
          label: `${t('common.navigation')}: ${t('tree.familyTree')}`,
          role: 'toolbar',
        })}
      >
        <Text style={[styles.navigationHint, { color: colors.text.secondary }]}>
          {t('accessibility.longPressToAction')}
        </Text>
      </View>
    </View>
  );
};

function countNodes(node: TreeNode): number {
  let count = 1;
  if (node.spouse) count++;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  nodeContainer: {
    marginBottom: 8,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expandButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 14,
    color: '#6B7280',
  },
  nodeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nodeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nodeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nodeDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  spouseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  spouseIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  spouseName: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  childrenContainer: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 8,
  },
  navigation: {
    padding: 16,
    alignItems: 'center',
  },
  navigationHint: {
    fontSize: 13,
  },
});

export default AccessibleFamilyTree;
