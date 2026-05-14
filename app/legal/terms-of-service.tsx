import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

const TermsOfServiceScreen: React.FC = () => {
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
      title: 'tos.section.intro',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.intro')}
          </Text>
        </View>
      ),
    },
    {
      id: 'acceptance',
      title: 'tos.section.acceptance',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.acceptance')}
          </Text>
        </View>
      ),
    },
    {
      id: 'service',
      title: 'tos.section.service',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.service')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.serviceFamily')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.serviceMember')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.serviceRelation')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.serviceExport')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.serviceInvite')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'registration',
      title: 'tos.section.registration',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.registration')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.registrationEmail')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.registrationPassword')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.registrationAge')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'userContent',
      title: 'tos.section.userContent',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.userContent')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.userContentOwnership')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.userContentLicense')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.userContentResponsibility')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.userContentCompliance')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'copyright',
      title: 'tos.section.copyright',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.copyright')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.copyrightOwnership')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.copyrightLicense')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.copyrightTrademark')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'prohibited',
      title: 'tos.section.prohibited',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.prohibited')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.prohibitedIllegal')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.prohibitedHarmful')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.prohibitedUnauthorized')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.prohibitedSpam')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.prohibitedAutomated')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'termination',
      title: 'tos.section.termination',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.termination')}
          </Text>
          <View style={styles.listContainer}>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.terminationUser')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.terminationCompany')}
            </Text>
            <Text style={[styles.listItem, { color: colors.text.secondary }]}>
              • {t('tos.terminationEffect')}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'disclaimer',
      title: 'tos.section.disclaimer',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.disclaimer')}
          </Text>
        </View>
      ),
    },
    {
      id: 'limitation',
      title: 'tos.section.limitation',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.limitation')}
          </Text>
        </View>
      ),
    },
    {
      id: 'changes',
      title: 'tos.section.changes',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.changes')}
          </Text>
        </View>
      ),
    },
    {
      id: 'contact',
      title: 'tos.section.contact',
      content: (
        <View>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('tos.contact')}
          </Text>
          <Text style={[styles.contactInfo, { color: colors.text.secondary }]}>
            {t('tos.contactEmail')}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t('tos.termsOfService')}
        </Text>
        <Text style={[styles.version, { color: colors.text.tertiary }]}>
          {t('tos.lastUpdated')}
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
            {t('tos.footer')}
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

export default TermsOfServiceScreen;
