import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, TextInput, ScrollView } from 'react-native';
import { exportToGedcom } from '../../services/gedcomService';
import type { TreeNode } from '../../types/familyTree';

interface GedcomExportDialogProps {
  visible: boolean;
  tree: TreeNode;
  familyName: string;
  onClose: () => void;
  onExport: (content: string, fileName: string) => void;
}

const GedcomExportDialog: React.FC<GedcomExportDialogProps> = ({
  visible,
  tree,
  familyName,
  onClose,
  onExport,
}) => {
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [filterPrivateData, setFilterPrivateData] = useState(true);
  const [exporting, setExporting] = useState(false);

  const validatePassword = () => {
    if (!encrypt) return true;
    
    if (!password) {
      setPasswordError('请输入密码');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError('密码至少需要6个字符');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleExport = async () => {
    if (!validatePassword()) return;
    
    setExporting(true);
    
    try {
      const result = exportToGedcom(tree, {
        familyName,
        exportDate: new Date(),
        privacyFilter: filterPrivateData,
        encrypt,
        password: encrypt ? password : undefined,
      });
      
      if (result.success) {
        onExport(result.content, result.fileName);
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const resetForm = () => {
    setEncrypt(false);
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setFilterPrivateData(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>导出 GEDCOM</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.optionContainer}>
              <View style={styles.optionRow}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>过滤隐私数据</Text>
                  <Text style={styles.optionDescription}>
                    隐藏标记为私有的敏感信息
                  </Text>
                </View>
                <Switch
                  value={filterPrivateData}
                  onValueChange={setFilterPrivateData}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
            
            <View style={styles.optionContainer}>
              <View style={styles.optionRow}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>密码保护</Text>
                  <Text style={styles.optionDescription}>
                    对导出的文件进行加密
                  </Text>
                </View>
                <Switch
                  value={encrypt}
                  onValueChange={setEncrypt}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              {encrypt && (
                <View style={styles.passwordContainer}>
                  <View style={styles.passwordInputContainer}>
                    <Text style={styles.passwordLabel}>密码</Text>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="至少6个字符"
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                  
                  <View style={styles.passwordInputContainer}>
                    <Text style={styles.passwordLabel}>确认密码</Text>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        passwordError ? styles.inputError : null,
                      ]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="再次输入密码"
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                  
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>
              )}
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💡 GEDCOM 是标准的家谱数据格式，可在大多数家谱软件中导入
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={exporting}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.exportButton,
                exporting && styles.disabledButton,
              ]}
              onPress={handleExport}
              disabled={exporting}
            >
              <Text style={styles.exportButtonText}>
                {exporting ? '导出中...' : '导出'}
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  optionContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  passwordContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  passwordInputContainer: {
    marginBottom: 12,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  exportButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GedcomExportDialog;
