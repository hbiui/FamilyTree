export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodRating {
  score: MoodLevel;
  timestamp: string;
  feedback?: string;
}

export interface FeedbackEntry {
  id: string;
  type: 'mood_rating' | 'bug_report' | 'feature_request' | 'general';
  moodRating?: MoodRating;
  title?: string;
  description?: string;
  contact?: string;
  timestamp: string;
  status: 'pending' | 'submitted' | 'reviewed';
}

export interface FeedbackState {
  firstUseDate: string | null;
  moodRatingGiven: boolean;
  lastMoodRatingDate: string | null;
  totalMoodRatings: number;
  feedbackEntries: FeedbackEntry[];
  hasSeenOnboarding: boolean;
}

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😍',
};

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: '很不满意',
  2: '不太满意',
  3: '一般般',
  4: '比较满意',
  5: '非常满意',
};

export const MOOD_COLORS: Record<MoodLevel, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#FBBF24',
  4: '#84CC16',
  5: '#22C55E',
};

export const FEEDBACK_TYPE_LABELS: Record<FeedbackEntry['type'], string> = {
  mood_rating: '心情评分',
  bug_report: '问题反馈',
  feature_request: '功能建议',
  general: '其他意见',
};
