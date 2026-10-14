import {
  TimeBlock,
  NonNegotiableItem,
  ShootingPlanItem,
  MonthlyTrackerData,
  CeoReviewData,
  AlarmConfig,
  DailyMotivationState,
  HabitDefinition,
  DailyVideoRecommendation,
} from '../types';
import {
  DEFAULT_TIME_BLOCKS,
  DEFAULT_NON_NEGOTIABLES,
  DEFAULT_SHOOTING_PLANS,
  DEFAULT_HABIT_DEFINITIONS,
  DEFAULT_ALARM_CONFIG,
  FALLBACK_BURMESE_MOTIVATIONS,
  FALLBACK_YOUTUBE_RECOMMENDATIONS,
} from '../data/defaults';

// Date utility functions
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getPreviousDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateLabel(dateStr: string, todayStr: string): { labelMm: string; isToday: boolean; isPast: boolean; isFuture: boolean } {
  if (dateStr === todayStr) {
    return { labelMm: 'ယနေ့', isToday: true, isPast: false, isFuture: false };
  }
  const yesterdayStr = getPreviousDateString(todayStr);
  if (dateStr === yesterdayStr) {
    return { labelMm: 'မနေ့က', isToday: false, isPast: true, isFuture: false };
  }
  const tomorrowStr = getNextDateString(todayStr);
  if (dateStr === tomorrowStr) {
    return { labelMm: 'မနက်ဖြန်', isToday: false, isPast: false, isFuture: true };
  }
  const isPast = dateStr < todayStr;
  return {
    labelMm: isPast ? 'အရင်နေ့' : 'နောက်နေ့',
    isToday: false,
    isPast,
    isFuture: !isPast,
  };
}

export function formatBurmeseDate(dateStr: string): { english: string; burmese: string; weekdayMm: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysMm = ['တနင်္ဂနွေနေ့', 'တနင်္လာနေ့', 'အင်္ဂါနေ့', 'ဗုဒ္ဓဟူးနေ့', 'ကြာသပတေးနေ့', 'သောကြာနေ့', 'စနေနေ့'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsMm = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];

  const weekdayEn = daysEn[date.getDay()];
  const weekdayMm = daysMm[date.getDay()];
  const monthEn = monthsEn[date.getMonth()];
  const monthMm = monthsMm[date.getMonth()];

  return {
    english: `${weekdayEn}, ${d} ${monthEn} ${y}`,
    burmese: `${y} ခုနှစ်၊ ${monthMm}လ ${d} ရက် (${weekdayMm})`,
    weekdayMm,
  };
}

// 12-Hour AM/PM Formatter
export function formatTo12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const parts = time24.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

export function formatTimeRange12Hour(start24: string, end24: string): string {
  return `${formatTo12Hour(start24)} - ${formatTo12Hour(end24)}`;
}

// 1. Time Blocks Configuration (Template & Date-Specific Isolation)
export function getTimeBlocksTemplate(): TimeBlock[] {
  try {
    const raw = localStorage.getItem('ceo_time_blocks_template') || localStorage.getItem('ceo_time_blocks_config');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_TIME_BLOCKS;
}

export function saveTimeBlocksTemplate(blocks: TimeBlock[]): void {
  localStorage.setItem('ceo_time_blocks_template', JSON.stringify(blocks));
  // Keep legacy key synced
  localStorage.setItem('ceo_time_blocks_config', JSON.stringify(blocks));
}

// Get time blocks for a specific date (defaults to today).
// Each date maintains its own independent schedule once modified!
export function getTimeBlocks(date?: string): TimeBlock[] {
  const targetDate = date || getTodayDateString();
  try {
    const raw = localStorage.getItem(`ceo_time_blocks_${targetDate}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  // If this date hasn't been individually customized yet, return a clean clone of the template
  const template = getTimeBlocksTemplate();
  return JSON.parse(JSON.stringify(template));
}

// Save time blocks strictly for a specific date
export function saveDailyTimeBlocks(date: string, blocks: TimeBlock[]): void {
  localStorage.setItem(`ceo_time_blocks_${date}`, JSON.stringify(blocks));
}

// Reset a specific day back to the master template
export function resetDailyTimeBlocksToTemplate(date: string): TimeBlock[] {
  localStorage.removeItem(`ceo_time_blocks_${date}`);
  return getTimeBlocks(date);
}

// Check if a specific date has custom schedule modifications
export function isDailyTimeBlocksCustomized(date: string): boolean {
  return !!localStorage.getItem(`ceo_time_blocks_${date}`);
}

// Save time blocks (supports optional date; if omitted, saves template)
export function saveTimeBlocks(blocks: TimeBlock[], date?: string): void {
  if (date) {
    saveDailyTimeBlocks(date, blocks);
  } else {
    saveTimeBlocksTemplate(blocks);
  }
}

// Subtasks progress by date (auto resets daily)
export function getDailySubtasksProgress(date: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`ceo_subtasks_${date}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setDailySubtaskStatus(date: string, subtaskId: string, done: boolean): void {
  const current = getDailySubtasksProgress(date);
  current[subtaskId] = done;
  localStorage.setItem(`ceo_subtasks_${date}`, JSON.stringify(current));
}

// 2. Non-Negotiables by date (auto reset daily, counter 0/5)
export function getDailyNonNegotiables(date: string): NonNegotiableItem[] {
  try {
    const raw = localStorage.getItem(`ceo_non_negotiables_${date}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all 5 default items exist
      return DEFAULT_NON_NEGOTIABLES.map((def) => {
        const found = parsed.find((p: NonNegotiableItem) => p.id === def.id);
        return found ? found : def;
      });
    }
  } catch {
    // fallback
  }
  return DEFAULT_NON_NEGOTIABLES;
}

export function setDailyNonNegotiables(date: string, items: NonNegotiableItem[]): void {
  localStorage.setItem(`ceo_non_negotiables_${date}`, JSON.stringify(items));
}

// 3. Shooting Plan (Weekday Focus)
export function getShootingPlans(): ShootingPlanItem[] {
  try {
    const raw = localStorage.getItem('ceo_shooting_plans');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_SHOOTING_PLANS;
}

export function saveShootingPlans(plans: ShootingPlanItem[]): void {
  localStorage.setItem('ceo_shooting_plans', JSON.stringify(plans));
}

export function getTodayShootingFocus(dateStr: string): ShootingPlanItem {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayIndex = new Date(y, m - 1, d).getDay();
  const plans = getShootingPlans();
  return plans.find((p) => p.dayOfWeek === dayIndex) || DEFAULT_SHOOTING_PLANS[1];
}

// Date-specific shooting focus (allows overriding focus topic for a specific date)
export function getDailyShootingFocus(dateStr: string): ShootingPlanItem {
  try {
    const raw = localStorage.getItem(`ceo_shooting_focus_${dateStr}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return getTodayShootingFocus(dateStr);
}

export function saveDailyShootingFocus(dateStr: string, focus: ShootingPlanItem): void {
  localStorage.setItem(`ceo_shooting_focus_${dateStr}`, JSON.stringify(focus));
}

// 4. Monthly Habit Tracker
export function getMonthlyHabitTracker(yearMonth: string): MonthlyTrackerData {
  try {
    const raw = localStorage.getItem(`ceo_tracker_${yearMonth}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  // Load habit definitions from global or default
  const savedDefs = localStorage.getItem('ceo_habit_definitions');
  const habits: HabitDefinition[] = savedDefs ? JSON.parse(savedDefs) : DEFAULT_HABIT_DEFINITIONS;

  return {
    yearMonth,
    habits,
    checks: {},
    notes: '',
  };
}

export function saveMonthlyHabitTracker(data: MonthlyTrackerData): void {
  localStorage.setItem(`ceo_tracker_${data.yearMonth}`, JSON.stringify(data));
  localStorage.setItem('ceo_habit_definitions', JSON.stringify(data.habits));
}

// 5. Nightly CEO Review
export function getCeoReview(date: string): CeoReviewData | null {
  try {
    const raw = localStorage.getItem(`ceo_review_${date}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCeoReview(review: CeoReviewData): void {
  localStorage.setItem(`ceo_review_${review.date}`, JSON.stringify(review));
  // Add to index list
  const listRaw = localStorage.getItem('ceo_review_dates');
  const list: string[] = listRaw ? JSON.parse(listRaw) : [];
  if (!list.includes(review.date)) {
    list.unshift(review.date);
    localStorage.setItem('ceo_review_dates', JSON.stringify(list));
  }
}

export function getAllReviewDates(): string[] {
  try {
    const raw = localStorage.getItem('ceo_review_dates');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getYesterdaysPriorities(todayStr: string): [string, string, string] | null {
  const prevDate = getPreviousDateString(todayStr);
  const prevReview = getCeoReview(prevDate);
  if (prevReview && prevReview.topPrioritiesTomorrow && prevReview.topPrioritiesTomorrow.some((p) => p.trim() !== '')) {
    return prevReview.topPrioritiesTomorrow;
  }
  return null;
}

// Date-specific Top 3 Priorities: checks dedicated record first, fallbacks to yesterday's review
export function getDailyPriorities(date: string): [string, string, string] | null {
  try {
    const raw = localStorage.getItem(`ceo_daily_priorities_${date}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((p: string) => p && p.trim() !== '')) {
        return [parsed[0] || '', parsed[1] || '', parsed[2] || ''];
      }
    }
  } catch {
    // fallback
  }
  return getYesterdaysPriorities(date);
}

export function saveDailyPriorities(date: string, priorities: [string, string, string]): void {
  localStorage.setItem(`ceo_daily_priorities_${date}`, JSON.stringify(priorities));
}

// Check status of yesterday's / today's priorities for a given date
export function getDailyPrioritiesChecked(date: string): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(`ceo_priorities_checked_${date}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setDailyPrioritiesChecked(date: string, checked: Record<number, boolean>): void {
  localStorage.setItem(`ceo_priorities_checked_${date}`, JSON.stringify(checked));
}


// 6. Streak calculation
// Rule: A day counts when the user finishes at least 3 of the 5 Non-negotiables
export function calculateStreakStats(): {
  currentStreak: number;
  bestStreak: number;
  thirtyDayRate: number;
  completedDaysCount: number;
} {
  const today = getTodayDateString();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let qualifiedInLast30 = 0;

  // Check last 90 days
  const checkedDays: { date: string; qualified: boolean }[] = [];
  let runner = today;
  for (let i = 0; i < 90; i++) {
    const items = getDailyNonNegotiables(runner);
    const countDone = items.filter((it) => it.done).length;
    const qualified = countDone >= 3;
    checkedDays.push({ date: runner, qualified });
    if (i < 30 && qualified) {
      qualifiedInLast30++;
    }
    runner = getPreviousDateString(runner);
  }

  // Calculate current streak starting from today (or yesterday if today isn't 3 yet)
  const todayDone = checkedDays[0].qualified;
  const yesterdayDone = checkedDays[1]?.qualified ?? false;

  if (todayDone) {
    for (let i = 0; i < checkedDays.length; i++) {
      if (checkedDays[i].qualified) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (yesterdayDone) {
    for (let i = 1; i < checkedDays.length; i++) {
      if (checkedDays[i].qualified) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate best streak across all checked days
  for (let i = checkedDays.length - 1; i >= 0; i--) {
    if (checkedDays[i].qualified) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  const thirtyDayRate = Math.round((qualifiedInLast30 / 30) * 100);

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    thirtyDayRate,
    completedDaysCount: qualifiedInLast30,
  };
}

export interface DayHabitStat {
  date: string;
  dayNum: number;
  dayLabel: string;
  weekdayMm: string;
  count: number;
  qualified: boolean;
  perfect: boolean;
  items: NonNegotiableItem[];
}

export interface HabitBreakdownStat {
  id: string;
  title: string;
  burmeseTitle: string;
  completedDays: number;
  rate: number;
}

export interface ThirtyDayStatsPayload {
  days: DayHabitStat[];
  habitBreakdown: HabitBreakdownStat[];
  totalCheckedDays: number;
  streakStats: {
    currentStreak: number;
    bestStreak: number;
    thirtyDayRate: number;
    completedDaysCount: number;
  };
}

// Retrieve detailed 30-day non-negotiables history for data visualization & AI analysis
export function getPast30DaysNonNegotiablesStats(): ThirtyDayStatsPayload {
  const today = getTodayDateString();
  const streakStats = calculateStreakStats();

  const daysList: DayHabitStat[] = [];
  const habitCounts: Record<string, { title: string; burmeseTitle: string; count: number }> = {};

  // Initialize habit breakdown counts with defaults
  DEFAULT_NON_NEGOTIABLES.forEach((item) => {
    habitCounts[item.id] = {
      title: item.title,
      burmeseTitle: item.burmeseTitle,
      count: 0,
    };
  });

  // Collect last 30 days starting from 29 days ago up to today
  let runner = today;
  const tempDates: string[] = [];
  for (let i = 0; i < 30; i++) {
    tempDates.unshift(runner);
    runner = getPreviousDateString(runner);
  }

  for (const dateStr of tempDates) {
    const items = getDailyNonNegotiables(dateStr);
    const count = items.filter((it) => it.done).length;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysMm = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];

    const dayLabel = `${dayNames[dateObj.getDay()]} ${d}`;
    const weekdayMm = daysMm[dateObj.getDay()];

    // Count completions for breakdown
    items.forEach((it) => {
      if (it.done) {
        if (!habitCounts[it.id]) {
          habitCounts[it.id] = { title: it.title, burmeseTitle: it.burmeseTitle, count: 0 };
        }
        habitCounts[it.id].count++;
      }
    });

    daysList.push({
      date: dateStr,
      dayNum: d,
      dayLabel,
      weekdayMm,
      count,
      qualified: count >= 3,
      perfect: count === 5,
      items,
    });
  }

  const habitBreakdown: HabitBreakdownStat[] = Object.keys(habitCounts).map((id) => {
    const info = habitCounts[id];
    return {
      id,
      title: info.title,
      burmeseTitle: info.burmeseTitle,
      completedDays: info.count,
      rate: Math.round((info.count / 30) * 100),
    };
  });

  const totalCheckedDays = daysList.filter((d) => d.count > 0).length;

  return {
    days: daysList,
    habitBreakdown,
    totalCheckedDays,
    streakStats,
  };
}

// 7. Motivation Message Caching & Favorites
export function getCachedMotivation(date: string): DailyMotivationState | null {
  try {
    const raw = localStorage.getItem(`ceo_motivation_${date}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedMotivation(date: string, state: DailyMotivationState): void {
  localStorage.setItem(`ceo_motivation_${date}`, JSON.stringify(state));
  // Keep history of last 7
  try {
    const histRaw = localStorage.getItem('ceo_motivation_history');
    const hist: string[] = histRaw ? JSON.parse(histRaw) : [];
    if (!hist.includes(state.message)) {
      hist.unshift(state.message);
      if (hist.length > 7) hist.pop();
      localStorage.setItem('ceo_motivation_history', JSON.stringify(hist));
    }
  } catch {}
}

export function getMotivationHistory(): string[] {
  try {
    const raw = localStorage.getItem('ceo_motivation_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getMotivationFavorites(): string[] {
  try {
    const raw = localStorage.getItem('ceo_motivation_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleMotivationFavorite(message: string): boolean {
  const current = getMotivationFavorites();
  const index = current.indexOf(message);
  let isFav = false;
  if (index >= 0) {
    current.splice(index, 1);
    isFav = false;
  } else {
    current.unshift(message);
    isFav = true;
  }
  localStorage.setItem('ceo_motivation_favorites', JSON.stringify(current));
  return isFav;
}

// 8. Custom Profile Photo / Avatar
export function getCustomAvatar(): string | null {
  try {
    return localStorage.getItem('ceo_custom_avatar') || null;
  } catch {
    return null;
  }
}

export function saveCustomAvatar(dataUrl: string): void {
  try {
    localStorage.setItem('ceo_custom_avatar', dataUrl);
  } catch (err) {
    console.error('Failed to save avatar', err);
  }
}

export function removeCustomAvatar(): void {
  try {
    localStorage.removeItem('ceo_custom_avatar');
  } catch {}
}

// 9. Alarm Settings
export function getAlarmSettings(): AlarmConfig {
  try {
    const raw = localStorage.getItem('ceo_alarm_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ALARM_CONFIG,
        ...parsed,
        voiceAlertsEnabled:
          parsed.voiceAlertsEnabled !== undefined ? parsed.voiceAlertsEnabled : true,
        selectedVoiceId: parsed.selectedVoiceId || 'man_executive',
      };
    }
    return DEFAULT_ALARM_CONFIG;
  } catch {
    return DEFAULT_ALARM_CONFIG;
  }
}

export function saveAlarmSettings(config: AlarmConfig): void {
  localStorage.setItem('ceo_alarm_config', JSON.stringify(config));
}

// 9. Theme
export function getSavedTheme(): 'light' | 'dark' {
  const theme = localStorage.getItem('ceo_theme');
  return theme === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem('ceo_theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Helper to pick random fallback motivation from leaders
export function getRandomFallbackMotivation(excludeList: string[] = []): { author: string; message: string; takeaway: string } {
  const available = FALLBACK_BURMESE_MOTIVATIONS.filter((m) => !excludeList.includes(m.message));
  const pool = available.length > 0 ? available : FALLBACK_BURMESE_MOTIVATIONS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

// 10. Daily YouTube Video Recommendation (1 video per day)
export function getDailyRecommendedVideo(dateStr: string): DailyVideoRecommendation {
  try {
    const raw = localStorage.getItem(`ceo_yt_video_${dateStr}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Deterministically select 1 video based on day of month (1-30)
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayIndex = ((d - 1) % FALLBACK_YOUTUBE_RECOMMENDATIONS.length);
  const selected = FALLBACK_YOUTUBE_RECOMMENDATIONS[dayIndex] || FALLBACK_YOUTUBE_RECOMMENDATIONS[0];

  localStorage.setItem(`ceo_yt_video_${dateStr}`, JSON.stringify(selected));
  return selected;
}

export function saveDailyRecommendedVideo(dateStr: string, video: DailyVideoRecommendation): void {
  localStorage.setItem(`ceo_yt_video_${dateStr}`, JSON.stringify(video));
}

export function getRandomDifferentVideo(currentId: string): DailyVideoRecommendation {
  const others = FALLBACK_YOUTUBE_RECOMMENDATIONS.filter((v) => v.id !== currentId);
  const pool = others.length > 0 ? others : FALLBACK_YOUTUBE_RECOMMENDATIONS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function getAllPresetVideos(): DailyVideoRecommendation[] {
  return FALLBACK_YOUTUBE_RECOMMENDATIONS;
}

export function getVideoWatchedStatus(dateStr: string): boolean {
  return localStorage.getItem(`ceo_yt_watched_${dateStr}`) === 'true';
}

export function setVideoWatchedStatus(dateStr: string, watched: boolean): void {
  localStorage.setItem(`ceo_yt_watched_${dateStr}`, watched ? 'true' : 'false');
}

// 11. Google Sheets & Drive Data Aggregation
export function getAllTrackedDates(): string[] {
  const datesSet = new Set<string>();
  datesSet.add(getTodayDateString());

  // Add review dates
  const reviewDates = getAllReviewDates();
  reviewDates.forEach((d) => datesSet.add(d));

  // Scan localStorage for date-keyed records
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith('ceo_non_negotiables_')) {
      datesSet.add(key.replace('ceo_non_negotiables_', ''));
    } else if (key.startsWith('ceo_subtasks_')) {
      datesSet.add(key.replace('ceo_subtasks_', ''));
    } else if (key.startsWith('ceo_review_') && key !== 'ceo_review_dates') {
      datesSet.add(key.replace('ceo_review_', ''));
    } else if (key.startsWith('ceo_priorities_checked_')) {
      datesSet.add(key.replace('ceo_priorities_checked_', ''));
    } else if (key.startsWith('ceo_time_blocks_') && key !== 'ceo_time_blocks_config' && key !== 'ceo_time_blocks_template') {
      datesSet.add(key.replace('ceo_time_blocks_', ''));
    } else if (key.startsWith('ceo_daily_priorities_')) {
      datesSet.add(key.replace('ceo_daily_priorities_', ''));
    } else if (key.startsWith('ceo_shooting_focus_')) {
      datesSet.add(key.replace('ceo_shooting_focus_', ''));
    }
  }

  // Return sorted descending (newest first)
  return Array.from(datesSet)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort((a, b) => b.localeCompare(a));
}

export function hasDateActivity(date: string): { hasReview: boolean; hasNonNeg: boolean; hasSubtasks: boolean } {
  const review = getCeoReview(date);
  const nonNegs = getDailyNonNegotiables(date);
  const subtasks = getDailySubtasksProgress(date);

  const hasReview = !!review;
  const hasNonNeg = nonNegs.some((item) => item.done);
  const hasSubtasks = Object.values(subtasks).some((v) => v === true);

  return { hasReview, hasNonNeg, hasSubtasks };
}

export function getAllCeoReviews(): CeoReviewData[] {
  const dates = getAllReviewDates();
  const reviews: CeoReviewData[] = [];
  for (const date of dates) {
    const r = getCeoReview(date);
    if (r) reviews.push(r);
  }
  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}

