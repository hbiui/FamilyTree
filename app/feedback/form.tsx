import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useFeedbackStore } from '../../src/store/useFeedbackStore';
import FeedbackForm from '../../src/components/feedback/FeedbackForm';
import type { FeedbackEntry } from '../../src/types/feedback';

export default function FeedbackFormScreen() {
  const router = useRouter();
  const { submitFeedback } = useFeedbackStore();

  const handleSubmit = (data: {
    type: FeedbackEntry['type'];
    title?: string;
    description: string;
    contact?: string;
  }) => {
    submitFeedback(data);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <FeedbackForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
