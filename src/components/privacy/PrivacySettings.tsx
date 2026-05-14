import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { PrivacyLevel, PersonPrivacy } from '../../types/familyTree';
import { 
  getPrivacyLabel, 
  getPrivacyIcon, 
  getPrivacyColor, 
  DEFAULT_PRIVACY_SETTINGS, 
  PRIVACY_FIELD_LABELS 
} from '../../services/privacyService';

interface PrivacySettingsProps {
  settings?: PersonPrivacy;
  onSettingsChange?: (settings: PersonPrivacy) => void;
  disabled?: boolean;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings = DEFAULT_PRIVACY_SETTINGS,
  onSettingsChange,
  disabled = false,
}) => {
  const [localSettings, setLocalSettings] = useState<PersonPrivacy>(settings);

  const handlePrivacyChange = (field: keyof PersonPrivacy, level: PrivacyLevel) => {
    const newSettings = { ...localSettings, [field]: level };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const privacyLevels: PrivacyLevel[] = ['private', 'family', 'public'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>隐私设置</Text>
      
      <ScrollView style={styles.scrollView}>
        {Object.entries(PRIVACY_FIELD_LABELS).map(([field, label]) => (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.levelSelector}>
              {privacyLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    localSettings[field as keyof PersonPrivacy] === level && {
                      backgroundColor: getPrivacyColor(level) + '20',
                      borderColor: getPrivacyColor(level),
                    },
                    disabled && styles.disabled,
                  ]}
                  onPress={() => !disabled && handlePrivacyChange(field as keyof PersonPrivacy, level)}
                  disabled={disabled}
                >
                  <Text style={styles.levelIcon}>{getPrivacyIcon(level)}</Text>
                  <Text 
                    style={[
                      styles.levelLabel,
                      localSettings[field as keyof PersonPrivacy] === level && {
                        color: getPrivacyColor(level),
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {getPrivacyLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 仅自己可见 - 只有您可以查看
        </Text>
        <Text style={styles.footerText}>
          👨‍👩‍👧‍👦 家族内可见 - 家族成员可以查看
        </Text>
        <Text style={styles.footerText}>
          🌐 公开可见 - 所有人都可以查看
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  fieldContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  levelSelector: {
    flexDirection: 'column',
    gap: 8,
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  levelIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  levelLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  disabled: {
    opacity: 0.5,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default PrivacySettings;
