import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, CheckBox } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

interface PrivacyModalProps {
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ visible, onAccept, onReject }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      onAccept();
    }
  };

  const handleReject = () => {
    onReject();
  };

  const handleViewPrivacy = () => {
    router.push('/legal/privacy-policy');
  };

  const handleViewTerms = () => {
    router.push('/legal/terms-of-service');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleReject}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('privacy.modalTitle')}
            </Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {t('privacy.modalDescription')}
            </Text>

            <View style={styles.pointsContainer}>
              <Text style={[styles.pointTitle, { color: colors.text.primary }]}>
                {t('privacy.modalPointsTitle')}
              </Text>
              <View style={styles.pointsList}>
                <Text style={[styles.pointItem, { color: colors.text.secondary }]}>
                  • {t('privacy.modalPoint1')}
                </Text>
                <Text style={[styles.pointItem, { color: colors.text.secondary }]}>
                  • {t('privacy.modalPoint2')}
                </Text>
                <Text style={[styles.pointItem, { color: colors.text.secondary }]}>
                  • {t('privacy.modalPoint3')}
                </Text>
                <Text style={[styles.pointItem, { color: colors.text.secondary }]}>
                  • {t('privacy.modalPoint4')}
                </Text>
              </View>
            </View>

            <View style={styles.agreeContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsChecked(!isChecked)}
                accessible={true}
                accessibilityLabel={isChecked ? t('common.checked') : t('common.unchecked')}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isChecked ? colors.primary[500] : colors.border.default,
                      backgroundColor: isChecked ? colors.primary[500] : 'transparent',
                    },
                  ]}
                >
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text.secondary }]}>
                  {t('privacy.modalAgree')}
                </Text>
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity
                  onPress={handleViewPrivacy}
                  style={styles.linkButton}
                  accessible={true}
                  accessibilityLabel={t('privacy.privacyPolicy')}
                  accessibilityRole="link"
                >
                  <Text style={[styles.linkText, { color: colors.primary[500] }]}>
                    {t('privacy.privacyPolicy')}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.divider, { color: colors.text.tertiary }]}>•</Text>
                <TouchableOpacity
                  onPress={handleViewTerms}
                  style={styles.linkButton}
                  accessible={true}
                  accessibilityLabel={t('tos.termsOfService')}
                  accessibilityRole="link"
                >
                  <Text style={[styles.linkText, { color: colors.primary[500] }]}>
                    {t('tos.termsOfService')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.rejectButton, { borderColor: colors.border.default }]}
              onPress={handleReject}
              accessible={true}
              accessibilityLabel={t('common.reject')}
              accessibilityRole="button"
            >
              <Text style={[styles.rejectButtonText, { color: colors.text.primary }]}>
                {t('privacy.modalReject')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                {
                  backgroundColor: isChecked ? colors.primary[500] : colors.secondary[300],
                },
              ]}
              onPress={handleAccept}
              disabled={!isChecked}
              accessible={true}
              accessibilityLabel={t('common.accept')}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isChecked }}
            >
              <Text style={styles.acceptButtonText}>
                {t('privacy.modalAccept')}
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
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    maxHeight: 400,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'justify',
  },
  pointsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pointTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  pointsList: {
    paddingLeft: 8,
  },
  pointItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  agreeContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingLeft: 34,
    gap: 12,
  },
  linkButton: {},
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  divider: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacyModal;
