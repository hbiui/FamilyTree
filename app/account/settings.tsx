import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { deleteAccountService } from '../../src/services/deleteAccountService';
import DeleteAccountModal from '../../src/components/account/DeleteAccountModal';

const AccountSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      Alert.alert(t('common.error'), t('account.deleteErrorUser'));
      setIsLoading(false);
      return;
    }

    const result = await deleteAccountService.fullAccountDeletion(user.data.user.id);
    
    if (result.success) {
      Alert.alert(t('common.success'), t('account.deleteSuccess'), [
        {
          text: t('common.ok'),
          onPress: () => {
            supabase.auth.signOut();
          },
        },
      ]);
    } else {
      Alert.alert(t('common.error'), result.message);
    }
    
    setIsLoading(false);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('account.signOutTitle'),
      t('account.signOutDescription'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('account.signOut'),
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: '👤',
      title: t('account.profile'),
      description: t('account.profileDesc'),
      onPress: () => {},
    },
    {
      icon: '🔒',
      title: t('account.security'),
      description: t('account.securityDesc'),
      onPress: () => {},
    },
    {
      icon: '🔔',
      title: t('account.notifications'),
      description: t('account.notificationsDesc'),
      onPress: () => {},
    },
    {
      icon: '🌐',
      title: t('account.language'),
      description: t('account.languageDesc'),
      onPress: () => {},
    },
    {
      icon: '📊',
      title: t('account.dataUsage'),
      description: t('account.dataUsageDesc'),
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.userCard, { backgroundColor: colors.background.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text.primary }]}>
              {t('account.userName')}
            </Text>
            <Text style={[styles.userEmail, { color: colors.text.secondary }]}>
              {t('account.userEmail')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.background.card }]}
              onPress={item.onPress}
              accessible={true}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text.primary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuDesc, { color: colors.text.secondary }]}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.background.card }]}
            onPress={handleSignOut}
            accessible={true}
            accessibilityLabel={t('account.signOut')}
            accessibilityRole="button"
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuTitle, { color: colors.text.primary }]}>
              {t('account.signOut')}
            </Text>
            <Text style={[styles.menuArrow, { color: colors.text.tertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={[styles.dangerTitle, { color: colors.text.primary }]}>
            {t('account.dangerZone')}
          </Text>
          
          <TouchableOpacity
            style={[styles.dangerItem, { backgroundColor: '#FEF2F2' }]}
            onPress={() => setShowDeleteModal(true)}
            accessible={true}
            accessibilityLabel={t('account.deleteAccount')}
            accessibilityRole="button"
          >
            <Text style={styles.dangerIcon}>🗑️</Text>
            <View style={styles.dangerContent}>
              <Text style={[styles.dangerTitleText, { color: colors.error }]}>
                {t('account.deleteAccount')}
              </Text>
              <Text style={[styles.dangerDesc, { color: colors.text.secondary }]}>
                {t('account.deleteAccountDesc')}
              </Text>
            </View>
            <Text style={[styles.dangerArrow, { color: colors.error }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            {t('account.appVersion')}
          </Text>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        onConfirm={handleDeleteAccount}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 13,
  },
  menuArrow: {
    fontSize: 24,
  },
  dangerZone: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  dangerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dangerContent: {
    flex: 1,
  },
  dangerTitleText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dangerDesc: {
    fontSize: 13,
  },
  dangerArrow: {
    fontSize: 24,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});

export default AccountSettingsScreen;
