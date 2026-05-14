import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: 'intro',
      title: 'privacy.section.intro',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.intro')}
          </Text>
        </View>
      ),
    },
    {
      id: 'collection',
      title: 'privacy.section.collection',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.collection')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.collectionFamily')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.collectionMember')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.collectionContact')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.collectionDevice')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'purpose',
      title: 'privacy.section.purpose',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.purpose')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.purposeService')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.purposeSecurity')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.purposeImprovement')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.purposeLegal')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'storage',
      title: 'privacy.section.storage',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.storage')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.storageLocation')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.storageDuration')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.storageSecurity')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'sharing',
      title: 'privacy.section.sharing',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.sharing')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.sharingConsent')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.sharingLegal')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.sharingService')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.sharingSecurity')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'rights',
      title: 'privacy.section.rights',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.rights')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.rightsAccess')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.rightsCorrect')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.rightsDelete')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.rightsWithdraw')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('privacy.rightsPortability')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'children',
      title: 'privacy.section.children',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.children')}
          </Text>
        </View>
      ),
    },
    {
      id: 'changes',
      title: 'privacy.section.changes',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.changes')}
          </Text>
        </View>
      ),
    },
    {
      id: 'contact',
      title: 'privacy.section.contact',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('privacy.contact')}
          </Text>
          <Text style={[styles.contactInfo, { color: colors.text.secondary }]}>
            {t('privacy.contactEmail')}
          </Text>
          <Text style={[styles.contactInfo, { color: colors.text.secondary }]}>
            {t('privacy.contactAddress')}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t('privacy.privacyPolicy')}
        </Text>
        <Text style={[styles.version, { color: colors.text.tertiary }]}>
          {t('privacy.lastUpdated')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.section, { backgroundColor: colors.background.card }]}
            onPress={() => toggleSection(section.id)}
            accessible={true}
            accessibilityLabel={section.title}
            accessibilityRole="button"
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                {t(section.title)}
              </Text>
              <Text style={[styles.expandIcon, { color: colors.text.tertiary }]}>
                {expandedSections.includes(section.id) ? '▼' : '▶'}
              </Text>
            </View>
            
            {expandedSections.includes(section.id) && (
              <View style={styles.sectionContent}>
                {section.content}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            {t('privacy.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 14,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  listContainer: {
    paddingLeft: 16,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;
