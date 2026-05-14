import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onConfirm, onCancel }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleConfirm = () => {
    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      onConfirm();
      setIsDeleting(false);
      setShowPasswordInput(false);
      setPassword('');
    }, 500);
  };

  const handleCancel = () => {
    setShowPasswordInput(false);
    setPassword('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.card }]}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>⚠️</Text>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('account.deleteTitle')}
          </Text>

          <Text style={[styles.description, { color: colors.text.secondary }]}>
            {t('account.deleteDescription')}
          </Text>

          <View style={styles.warningBox}>
            <Text style={[styles.warningText, { color: colors.error }]}>
              {t('account.deleteWarning')}
            </Text>
          </View>

          {showPasswordInput && (
            <View style={styles.passwordSection}>
              <Text style={[styles.passwordLabel, { color: colors.text.primary }]}>
                {t('account.deleteConfirmPassword')}
              </Text>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    borderColor: colors.border.default,
                  },
                ]}
                placeholder={t('common.password')}
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border.default }]}
              onPress={handleCancel}
              disabled={isDeleting}
              accessible={true}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor: password.length >= 6 || !showPasswordInput ? colors.error : colors.secondary[300],
                },
              ]}
              onPress={handleConfirm}
              disabled={isDeleting || (showPasswordInput && password.length < 6)}
              accessible={true}
              accessibilityLabel={t('account.deleteAccount')}
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleting || (showPasswordInput && password.length < 6) }}
            >
              <Text style={styles.confirmButtonText}>
                {isDeleting ? t('common.processing') : t('account.deleteAccount')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  passwordSection: {
    width: '100%',
    marginBottom: 20,
  },
  passwordLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DeleteAccountModal;
