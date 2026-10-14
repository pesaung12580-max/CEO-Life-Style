import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bot } from 'lucide-react';
import {
  TabType,
  TimeBlock,
  NonNegotiableItem,
  ShootingPlanItem,
  AlarmConfig,
  ActiveAlarmPayload,
} from './types';
import {
  getTodayDateString,
  getTimeBlocks,
  saveDailyTimeBlocks,
  saveTimeBlocksTemplate,
  resetDailyTimeBlocksToTemplate,
  getDailySubtasksProgress,
  setDailySubtaskStatus,
  getDailyNonNegotiables,
  setDailyNonNegotiables,
  getShootingPlans,
  saveShootingPlans,
  getDailyShootingFocus,
  getTodayShootingFocus,
  getDailyPriorities,
  saveDailyPriorities,
  calculateStreakStats,
  getAlarmSettings,
  saveAlarmSettings,
  getSavedTheme,
  saveTheme,
  getCachedMotivation,
  getRandomFallbackMotivation,
  formatTo12Hour,
  formatTimeRange12Hour,
} from './services/storage';
import { sendBrowserNotification } from './services/notificationService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayTab } from './components/TodayTab';
import { PlanTab } from './components/PlanTab';
import { TrackerTab } from './components/TrackerTab';
import { ReviewTab } from './components/ReviewTab';
import { StatsTab } from './components/StatsTab';
import { AlarmModal } from './components/AlarmModal';
import { SettingsModal } from './components/SettingsModal';
import { CeoChatModal } from './components/CeoChatModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (localStorage.getItem('ceo_active_tab') as TabType) || 'today';
  });

  // Real today date string
  const [todayDate, setTodayDate] = useState<string>(getTodayDateString());

  // Selected date for viewing past days, present day, or future planning
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const [currentTimeString, setCurrentTimeString] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(getSavedTheme());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => getTimeBlocks(selectedDate));

  // Subtasks progress for the currently selected date
  const [subtasksProgress, setSubtasksProgress] = useState<Record<string, boolean>>(() =>
    getDailySubtasksProgress(selectedDate)
  );

  // Non-negotiables for the currently selected date
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiableItem[]>(() =>
    getDailyNonNegotiables(selectedDate)
  );

  const [shootingPlans, setShootingPlans] = useState<ShootingPlanItem[]>(getShootingPlans());
  const [priorities, setPriorities] = useState<[string, string, string] | null>(() =>
    getDailyPriorities(selectedDate)
  );

  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig>(getAlarmSettings());
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmPayload | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showGoogleSync, setShowGoogleSync] = useState(false);
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    return localStorage.getItem('ceo_focus_mode') === 'true';
  });

  const handleToggleFocusMode = () => {
    setFocusMode((prev) => {
      const next = !prev;
      localStorage.setItem('ceo_focus_mode', String(next));
      return next;
    });
  };

  // Set of alarms triggered in this session to prevent repeated triggers in the same minute
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // Save active tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('ceo_active_tab', tab);
  };

  // Sync theme
  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  // When selectedDate changes, ensure that date's data is loaded strictly for that date
  useEffect(() => {
    setTimeBlocks(getTimeBlocks(selectedDate));
    setSubtasksProgress(getDailySubtasksProgress(selectedDate));
    setNonNegotiables(getDailyNonNegotiables(selectedDate));
    setPriorities(getDailyPriorities(selectedDate));
  }, [selectedDate]);

  // Synchronous batch updater for date switching across all context-dependent data
  const handleSelectDate = (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    setTimeBlocks(getTimeBlocks(newDate));
    setSubtasksProgress(getDailySubtasksProgress(newDate));
    setNonNegotiables(getDailyNonNegotiables(newDate));
    setPriorities(getDailyPriorities(newDate));
  };

  // Clock ticker and midnight date change check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHhMm = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      setCurrentTimeString(currentHhMm);

      const realToday = getTodayDateString();
      if (realToday !== todayDate) {
        setTodayDate(realToday);
        if (selectedDate === todayDate) {
          setSelectedDate(realToday);
        }
        triggeredAlarmsRef.current.clear();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [todayDate, selectedDate]);

  // Alarms check
  useEffect(() => {
    if (!currentTimeString) return;

    // 1. Wake up alarm check
    const wakeUpKey = `wakeup_${todayDate}_${alarmConfig.wakeUpTime}`;
    if (
      alarmConfig.wakeUpEnabled &&
      currentTimeString === alarmConfig.wakeUpTime &&
      !triggeredAlarmsRef.current.has(wakeUpKey)
    ) {
      triggeredAlarmsRef.current.add(wakeUpKey);
      const motivation = getCachedMotivation(todayDate)?.message || getRandomFallbackMotivation().message;

      setActiveAlarm({
        id: wakeUpKey,
        type: 'wakeup',
        title: 'မနက်ခင်း စတင်ချိန် ရောက်ပါပြီ (Wake Up, CEO Aung Min Maw!)',
        subtitle: `အချိန်: ${formatTo12Hour(alarmConfig.wakeUpTime)}`,
        motivationMessage: motivation,
      });

      sendBrowserNotification('Wake Up, CEO Aung Min Maw!', {
        body: `ယနေ့အတွက် အားအင်ပြည့်ဝစွာ စတင်လိုက်ပါ: "${motivation}"`,
      });
    }

    // 2. Bedtime reminder check
    const bedtimeKey = `bedtime_${todayDate}_${alarmConfig.bedtimeTime}`;
    if (
      alarmConfig.bedtimeEnabled &&
      currentTimeString === alarmConfig.bedtimeTime &&
      !triggeredAlarmsRef.current.has(bedtimeKey)
    ) {
      triggeredAlarmsRef.current.add(bedtimeKey);

      setActiveAlarm({
        id: bedtimeKey,
        type: 'bedtime',
        title: 'ညအိပ်စက်ရန် အနားယူချိန် ရောက်ပါပြီ (Bedtime Reminder)',
        subtitle: `အချိန်: ${formatTo12Hour(alarmConfig.bedtimeTime)} · ဖုန်းအသုံးပြုမှု လျှော့ချပါ`,
      });

      sendBrowserNotification('Bedtime Reminder', {
        body: '၁၀ နာရီတွင် အိပ်ရာဝင်နိုင်ရန် အနားယူချိန် ရောက်ပါပြီ။',
      });
    }

    // 3. Time block start reminders check (always checks against real today's schedule)
    if (alarmConfig.blockRemindersEnabled) {
      const blocksToCheck = selectedDate === todayDate ? timeBlocks : getTimeBlocks(todayDate);
      for (const block of blocksToCheck) {
        if (!block.reminderEnabled) continue;
        const blockKey = `block_${todayDate}_${block.id}_${block.startTime}`;
        if (
          currentTimeString === block.startTime &&
          !triggeredAlarmsRef.current.has(blockKey)
        ) {
          triggeredAlarmsRef.current.add(blockKey);

          setActiveAlarm({
            id: blockKey,
            type: 'block',
            title: block.title,
            subtitle: `${formatTimeRange12Hour(block.startTime, block.endTime)} (${block.englishTitle}) စတင်ပါပြီ`,
            blockTime: block.startTime,
          });

          sendBrowserNotification(`Time Block: ${block.title}`, {
            body: `${formatTimeRange12Hour(block.startTime, block.endTime)} (${block.englishTitle}) စတင်ပါပြီ။`,
          });
          break;
        }
      }
    }
  }, [currentTimeString, todayDate, alarmConfig, timeBlocks, selectedDate]);

  // Snooze handler
  const handleSnooze = (minutes: number) => {
    setActiveAlarm(null);
    setTimeout(() => {
      setActiveAlarm({
        id: `snooze_${Date.now()}`,
        type: 'block',
        title: 'ရွှေ့ဆိုင်းထားသော အချက်ပေးသံ (Snoozed Alarm)',
        subtitle: `${minutes} မိနစ် ပြည့်မြောက်ပါပြီ`,
      });
    }, minutes * 60 * 1000);
  };

  // Test Alarm trigger
  const handleTriggerTestAlarm = () => {
    const motivation = getCachedMotivation(selectedDate)?.message || getRandomFallbackMotivation().message;
    setActiveAlarm({
      id: `test_${Date.now()}`,
      type: 'wakeup',
      title: 'စမ်းသပ်အချက်ပေးသံ (Test Alarm)',
      subtitle: 'အချက်ပေးသံနှင့် အသိပေးချက် ကောင်းမွန်စွာ အလုပ်လုပ်နေပါသည်',
      motivationMessage: motivation,
    });
  };

  // Non-negotiables toggle (saves to selectedDate using functional state updater)
  const handleToggleNonNegotiable = (id: string) => {
    setNonNegotiables((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      );
      setDailyNonNegotiables(selectedDate, updated);
      return updated;
    });
  };

  // Subtask toggle (saves to selectedDate using functional state updater)
  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasksProgress((prev) => {
      const current = !prev[subtaskId];
      const next = { ...prev, [subtaskId]: current };
      setDailySubtaskStatus(selectedDate, subtaskId, current);
      return next;
    });
  };

  // Toggle single block reminder strictly for selectedDate
  const handleToggleReminder = (blockId: string) => {
    const updated = timeBlocks.map((b) =>
      b.id === blockId ? { ...b, reminderEnabled: !b.reminderEnabled } : b
    );
    setTimeBlocks(updated);
    saveDailyTimeBlocks(selectedDate, updated);
  };

  // Save updated or added time block strictly for selectedDate (with optional master template saving)
  const handleSaveBlock = (block: TimeBlock, saveAsTemplate?: boolean) => {
    const exists = timeBlocks.some((b) => b.id === block.id);
    let updated: TimeBlock[];
    if (exists) {
      updated = timeBlocks.map((b) => (b.id === block.id ? block : b));
    } else {
      updated = [...timeBlocks, block];
    }
    setTimeBlocks(updated);
    saveDailyTimeBlocks(selectedDate, updated);
    if (saveAsTemplate) {
      saveTimeBlocksTemplate(updated);
    }
  };

  // Delete block strictly from selectedDate
  const handleDeleteBlock = (blockId: string) => {
    const updated = timeBlocks.filter((b) => b.id !== blockId);
    setTimeBlocks(updated);
    saveDailyTimeBlocks(selectedDate, updated);
  };

  // Reset this day's blocks back to default template
  const handleResetDayBlocks = () => {
    const reset = resetDailyTimeBlocksToTemplate(selectedDate);
    setTimeBlocks(reset);
  };

  // Save priorities strictly for selectedDate
  const handleSavePriorities = (newPriorities: [string, string, string]) => {
    setPriorities(newPriorities);
    saveDailyPriorities(selectedDate, newPriorities);
  };

  // Update shooting plans
  const handleUpdateShootingPlans = (plans: ShootingPlanItem[]) => {
    setShootingPlans(plans);
  };

  // Save alarm configuration
  const handleSaveAlarmConfig = (config: AlarmConfig) => {
    setAlarmConfig(config);
    saveAlarmSettings(config);
  };

  // Shooting focus from plan for selectedDate (date-specific override or weekday plan)
  const selectedShootingFocus = useMemo(() => {
    return getDailyShootingFocus(selectedDate);
  }, [selectedDate, shootingPlans]);

  // Overall completion rate (% of non-negotiables + subtasks for selectedDate)
  const selectedCompletionRate = useMemo(() => {
    let totalItems = nonNegotiables.length;
    let completedItems = nonNegotiables.filter((n) => n.done).length;

    for (const b of timeBlocks) {
      totalItems += b.subtasks.length;
      completedItems += b.subtasks.filter((st) => !!subtasksProgress[st.id]).length;
    }

    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  }, [nonNegotiables, timeBlocks, subtasksProgress]);

  // Streak calculation
  const streakStats = useMemo(() => {
    return calculateStreakStats();
  }, [nonNegotiables, selectedDate]);

  const [y, m, d] = selectedDate.split('-').map(Number);
  const selectedDayOfWeek = new Date(y, m - 1, d).getDay();

  return (
    <div className="min-h-screen bg-rose-50/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top App Header */}
      <Header
        todayDate={selectedDate}
        completionRate={selectedCompletionRate}
        streakCount={streakStats.currentStreak}
        todayShootingPlan={selectedShootingFocus}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAiChat={() => setShowAiChat(true)}
        onOpenGoogleSync={() => setShowGoogleSync(true)}
        focusMode={focusMode}
        onToggleFocusMode={handleToggleFocusMode}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TodayTab
                selectedDate={selectedDate}
                realTodayDate={todayDate}
                onSelectDate={handleSelectDate}
                currentTimeString={currentTimeString}
                priorities={priorities}
                onSavePriorities={handleSavePriorities}
                nonNegotiables={nonNegotiables}
                onToggleNonNegotiable={handleToggleNonNegotiable}
                streakCount={streakStats.currentStreak}
                timeBlocks={timeBlocks}
                subtasksProgress={subtasksProgress}
                onToggleSubtask={handleToggleSubtask}
                onToggleReminder={handleToggleReminder}
                onSaveBlock={handleSaveBlock}
                onDeleteBlock={handleDeleteBlock}
                onResetDayBlocks={handleResetDayBlocks}
                focusMode={focusMode}
                onToggleFocusMode={handleToggleFocusMode}
              />
            </motion.div>
          )}

          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PlanTab
                shootingPlans={shootingPlans}
                onUpdatePlans={handleUpdateShootingPlans}
                todayDayOfWeek={selectedDayOfWeek}
              />
            </motion.div>
          )}

          {activeTab === 'tracker' && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TrackerTab onOpenGoogleSync={() => setShowGoogleSync(true)} />
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewTab
                selectedDate={selectedDate}
                todayDate={todayDate}
                onSelectDate={handleSelectDate}
                onOpenGoogleSync={() => setShowGoogleSync(true)}
                onReviewSaved={() => {
                  setPriorities(getDailyPriorities(selectedDate));
                }}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <StatsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Quick CEO AI Advisor Button (Desktop / Mobile - Hidden in Focus Mode) */}
      {!focusMode && (
        <button
          onClick={() => setShowAiChat(true)}
          title="CEO Aung Min Maw AI Advisor (Gemini)"
          className="fixed bottom-20 right-4 sm:right-8 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline">CEO Aung Min Maw Coach</span>
        </button>
      )}

      {/* Fixed Bottom Navigation (Hidden in Focus Mode) */}
      {!focusMode && (
        <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} />
      )}

      {/* Alarm Pop-up Modal */}
      <AlarmModal
        alarm={activeAlarm}
        soundEnabled={alarmConfig.soundEnabled}
        onDismiss={() => setActiveAlarm(null)}
        onSnooze={handleSnooze}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          config={alarmConfig}
          onSaveConfig={handleSaveAlarmConfig}
          onTriggerTestAlarm={handleTriggerTestAlarm}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* CEO AI Executive Chatbot Modal */}
      <CeoChatModal
        isOpen={showAiChat}
        onClose={() => setShowAiChat(false)}
      />

      {/* Google Drive & Sheets Backup & Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={showGoogleSync}
        onClose={() => setShowGoogleSync(false)}
      />
    </div>
  );
}
