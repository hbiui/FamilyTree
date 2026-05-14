import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeedbackState, FeedbackEntry, MoodRating, MoodLevel } from '../types/feedback';

interface FeedbackStore extends FeedbackState {
  initializeFirstUse: () => void;
  submitMoodRating: (score: MoodLevel, feedback?: string) => void;
  submitFeedback: (entry: Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>) => void;
  hasReachedTriggerDay: (days: number) => boolean;
  shouldShowMoodPrompt: (triggerDays: number) => boolean;
  dismissMoodPrompt: () => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  resetFeedback: () => void;
  getAllEntries: () => FeedbackEntry[];
}

const FIRST_USE_KEY = 'first_use_date';
const MOOD_RATING_KEY = 'mood_rating_given';
const LAST_MOOD_DATE_KEY = 'last_mood_date';
const TOTAL_MOOD_KEY = 'total_mood_ratings';
const FEEDBACK_ENTRIES_KEY = 'feedback_entries';
const HAS_SEEN_ONBOARDING_KEY = 'has_seen_onboarding';

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set, get) => ({
      firstUseDate: null,
      moodRatingGiven: false,
      lastMoodRatingDate: null,
      totalMoodRatings: 0,
      feedbackEntries: [],
      hasSeenOnboarding: false,

      initializeFirstUse: () => {
        const state = get();
        if (!state.firstUseDate) {
          set({
            firstUseDate: new Date().toISOString(),
          });
        }
      },

      submitMoodRating: (score: MoodLevel, feedback?: string) => {
        const now = new Date().toISOString();
        const moodRating: MoodRating = {
          score,
          timestamp: now,
          feedback,
        };

        const entry: FeedbackEntry = {
          id: `mood_${Date.now()}`,
          type: 'mood_rating',
          moodRating,
          timestamp: now,
          status: 'submitted',
        };

        set((state) => ({
          moodRatingGiven: true,
          lastMoodRatingDate: now,
          totalMoodRatings: state.totalMoodRatings + 1,
          feedbackEntries: [...state.feedbackEntries, entry],
        }));
      },

      submitFeedback: (entryData) => {
        const now = new Date().toISOString();
        const entry: FeedbackEntry = {
          ...entryData,
          id: `feedback_${Date.now()}`,
          timestamp: now,
          status: 'submitted',
        };

        set((state) => ({
          feedbackEntries: [...state.feedbackEntries, entry],
        }));
      },

      hasReachedTriggerDay: (days: number) => {
        const state = get();
        if (!state.firstUseDate) {
          return false;
        }

        const firstUse = new Date(state.firstUseDate);
        const now = new Date();
        const diffTime = now.getTime() - firstUse.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= days;
      },

      shouldShowMoodPrompt: (triggerDays: number) => {
        const state = get();
        
        if (!state.firstUseDate) {
          return false;
        }

        if (state.moodRatingGiven) {
          return false;
        }

        return state.hasReachedTriggerDay(triggerDays);
      },

      dismissMoodPrompt: () => {
        set({ moodRatingGiven: true });
      },

      setHasSeenOnboarding: (seen: boolean) => {
        set({ hasSeenOnboarding: seen });
      },

      resetFeedback: () => {
        set({
          firstUseDate: new Date().toISOString(),
          moodRatingGiven: false,
          lastMoodRatingDate: null,
          totalMoodRatings: 0,
          feedbackEntries: [],
          hasSeenOnboarding: false,
        });
      },

      getAllEntries: () => {
        return get().feedbackEntries;
      },
    }),
    {
      name: 'feedback-storage',
    }
  )
);
