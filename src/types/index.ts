export type TabType = 'today' | 'plan' | 'tracker' | 'review' | 'stats';

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

export interface TimeBlock {
  id: string;
  startTime: string; // '06:00'
  endTime: string;   // '07:00'
  title: string;
  englishTitle: string;
  iconName: string;
  reminderEnabled: boolean;
  subtasks: SubTask[];
}

export interface NonNegotiableItem {
  id: string;
  title: string;
  burmeseTitle: string;
  done: boolean;
}

export interface ShootingPlanItem {
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayNameEn: string;
  dayNameMm: string;
  focusTitle: string;
  focusMm: string;
  details: string;
}

export type HabitCategoryType = 'exercise' | 'food' | 'rest';

export interface HabitDefinition {
  id: string;
  category: HabitCategoryType;
  name: string;
  nameMm: string;
}

export interface MonthlyTrackerData {
  yearMonth: string; // '2026-10'
  habits: HabitDefinition[];
  // Key format: `${habitId}_${dayNumber}` -> boolean
  checks: Record<string, boolean>;
  notes: string;
}

export interface CeoReviewData {
  date: string; // 'YYYY-MM-DD'
  completedToday: string;
  businessNotes: string; // Content / customer / sales / income notes
  whatWorked: string;
  whatToFix: string;
  topPrioritiesTomorrow: [string, string, string];
  updatedAt?: string;
}

export interface DailyMotivationState {
  date: string;
  message: string;
  author?: string;
  takeawayMm?: string;
  isFavorite: boolean;
  source: 'gemini' | 'curated';
}

export interface DailyVideoRecommendation {
  id: string;
  title: string;
  titleMm: string;
  channel: string;
  url: string;
  duration: string;
  category: string;
  takeawayMm: string;
}

export type VoicePersonaId = 'man_executive' | 'woman_pro' | 'girl_sweet' | 'man_coach' | 'woman_calm';

export type TtsModelType = 'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts' | 'google-web';

export interface AlarmConfig {
  wakeUpTime: string;      // default '06:00'
  wakeUpEnabled: boolean;
  bedtimeTime: string;     // default '21:40'
  bedtimeEnabled: boolean;
  soundEnabled: boolean;
  voiceAlertsEnabled?: boolean; // Burmese Text-to-Speech alerts (my-MM)
  selectedVoiceId?: VoicePersonaId; // 5 kinds of voices (man / woman / girl)
  ttsModel?: TtsModelType; // Flagship Gemini AI TTS vs fast vs fallback
  browserNotificationsEnabled: boolean;
  blockRemindersEnabled: boolean;
}

export interface ActiveAlarmPayload {
  id: string;
  type: 'wakeup' | 'bedtime' | 'block';
  title: string;
  subtitle: string;
  motivationMessage?: string;
  blockTime?: string;
  speechText?: string;
}
