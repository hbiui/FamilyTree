import React, { useEffect, useState } from 'react';
import { useFeedbackStore } from '../../store/useFeedbackStore';
import MoodRatingModal from './MoodRatingModal';
import type { MoodLevel } from '../../types/feedback';

interface FeedbackProviderProps {
  children: React.ReactNode;
  triggerDays?: number;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
  children,
  triggerDays = 3,
}) => {
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    initializeFirstUse,
    shouldShowMoodPrompt,
    submitMoodRating,
    dismissMoodPrompt,
    firstUseDate,
    moodRatingGiven,
  } = useFeedbackStore();

  useEffect(() => {
    initializeFirstUse();
    setIsInitialized(true);
  }, [initializeFirstUse]);

  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      if (shouldShowMoodPrompt(triggerDays)) {
        setShowMoodModal(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInitialized, triggerDays, shouldShowMoodPrompt]);

  const handleMoodSubmit = (score: MoodLevel, feedback?: string) => {
    submitMoodRating(score, feedback);
    setShowMoodModal(false);
  };

  const handleMoodDismiss = () => {
    dismissMoodPrompt();
    setShowMoodModal(false);
  };

  return (
    <>
      {children}
      <MoodRatingModal
        visible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
        onSkip={handleMoodDismiss}
      />
    </>
  );
};

export const useMoodRatingPrompt = () => {
  const [showModal, setShowModal] = useState(false);

  const {
    shouldShowMoodPrompt,
    dismissMoodPrompt,
  } = useFeedbackStore();

  const triggerPrompt = (days: number = 3) => {
    if (shouldShowMoodPrompt(days)) {
      setShowModal(true);
      return true;
    }
    return false;
  };

  const handleSubmit = (score: MoodLevel, feedback?: string) => {
    useFeedbackStore.getState().submitMoodRating(score, feedback);
    setShowModal(false);
  };

  const handleDismiss = () => {
    dismissMoodPrompt();
    setShowModal(false);
  };

  return {
    showModal,
    setShowModal,
    triggerPrompt,
    handleSubmit,
    handleDismiss,
  };
};

export default FeedbackProvider;
