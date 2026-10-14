import React, { useState, useEffect } from 'react';
import {
  Heart,
  Leaf,
  Moon,
  Award,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  CheckCircle2,
  Save,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Cloud,
} from 'lucide-react';
import {
  MonthlyTrackerData,
  HabitDefinition,
  HabitCategoryType,
} from '../types';
import {
  getMonthlyHabitTracker,
  saveMonthlyHabitTracker,
  getCurrentYearMonth,
} from '../services/storage';
import { SyncHabitsModal } from './SyncHabitsModal';

interface Props {
  onScoreUpdate?: (score: number) => void;
  onOpenGoogleSync?: () => void;
}

export const TrackerTab: React.FC<Props> = ({ onScoreUpdate, onOpenGoogleSync }) => {
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(
    getCurrentYearMonth()
  );
  const [trackerData, setTrackerData] = useState<MonthlyTrackerData | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [notes, setNotes] = useState('');
  const [showSyncHabitsModal, setShowSyncHabitsModal] = useState(false);

  // Load tracker data when yearMonth changes
  useEffect(() => {
    const data = getMonthlyHabitTracker(currentYearMonth);
    setTrackerData(data);
    setNotes(data.notes || '');
  }, [currentYearMonth]);

  if (!trackerData) return null;

  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Number of days in the month (e.g. 31, 30, 28)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Calculate day-of-week abbreviations for headers
  const getWeekdayShort = (dayNum: number) => {
    const d = new Date(year, month - 1, dayNum);
    const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return names[d.getDay()];
  };

  // Month navigation
  const handlePrevMonth = () => {
    const d = new Date(year, month - 2, 1);
    const newYm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentYearMonth(newYm);
  };

  const handleNextMonth = () => {
    const d = new Date(year, month, 1);
    const newYm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentYearMonth(newYm);
  };

  // Toggle checkmark for a habit on a specific day
  const handleToggleCell = (habitId: string, dayNum: number) => {
    const key = `${habitId}_${dayNum}`;
    const nextChecks = {
      ...trackerData.checks,
      [key]: !trackerData.checks[key],
    };

    const updatedData: MonthlyTrackerData = {
      ...trackerData,
      checks: nextChecks,
    };

    setTrackerData(updatedData);
    saveMonthlyHabitTracker(updatedData);
  };

  // Save notes
  const handleSaveNotes = (newNotes: string) => {
    setNotes(newNotes);
    const updatedData: MonthlyTrackerData = {
      ...trackerData,
      notes: newNotes,
    };
    setTrackerData(updatedData);
    saveMonthlyHabitTracker(updatedData);
  };

  // Habit name editing
  const handleStartRenameHabit = (h: HabitDefinition) => {
    setEditingHabitId(h.id);
    setEditHabitName(h.nameMm || h.name);
  };

  const handleSaveRenameHabit = (habitId: string) => {
    if (!editHabitName.trim()) return;
    const updatedHabits = trackerData.habits.map((h) => {
      if (h.id === habitId) {
        return { ...h, nameMm: editHabitName.trim(), name: editHabitName.trim() };
      }
      return h;
    });

    const updatedData: MonthlyTrackerData = {
      ...trackerData,
      habits: updatedHabits,
    };

    setTrackerData(updatedData);
    saveMonthlyHabitTracker(updatedData);
    setEditingHabitId(null);
  };

  // Calculate monthly score
  const totalSlots = trackerData.habits.length * daysInMonth; // 9 habits * days
  const completedSlots = Object.values(trackerData.checks).filter(Boolean).length;
  const scorePercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  // Medal determination:
  // > 80% = Gold Medal, 50-79% = Silver Medal, < 50% = No Medal
  let medalTier: 'gold' | 'silver' | 'none' = 'none';
  if (scorePercent >= 80) {
    medalTier = 'gold';
  } else if (scorePercent >= 50) {
    medalTier = 'silver';
  }

  const burmeseMonths = [
    'ဇန်နဝါရီ',
    'ဖေဖော်ဝါရီ',
    'မတ်',
    'ဧပြီ',
    'မေ',
    'ဇွန်',
    'ဇူလိုင်',
    'သြဂုတ်',
    'စက်တင်ဘာ',
    'အောက်တိုဘာ',
    'နိုဝင်ဘာ',
    'ဒီဇင်ဘာ',
  ];
  const currentMonthMm = burmeseMonths[month - 1];

  const categories: {
    key: HabitCategoryType;
    title: string;
    englishTitle: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      key: 'exercise',
      title: 'ကိုယ်လက်လှုပ်ရှားမှု',
      englishTitle: 'Exercise',
      icon: Heart,
      accentColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
    },
    {
      key: 'food',
      title: 'အစားအသောက်နှင့် အာဟာရ',
      englishTitle: 'Food & Nutrition',
      icon: Leaf,
      accentColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      key: 'rest',
      title: 'အနားယူခြင်းနှင့် အခြား',
      englishTitle: 'Rest & Others',
      icon: Moon,
      accentColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* Google Drive & Sheets Backup Banner */}
      {onOpenGoogleSync && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span>Google Drive & Sheets Backup</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Google Workspace
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                CEO Aung Min Maw ၏ နေ့စဉ် မှတ်တမ်းများ၊ သုံးသပ်ချက်များနှင့် အချက်အလက်များအားလုံးကို Google Drive ထဲသို့ သိမ်းမည်
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSyncHabitsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
              title="ယခုလ အလေ့အကျင့်ဇယားကို Google Sheet Grid အဖြစ် သိမ်းမည်"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sync Habits</span>
            </button>
            <button
              onClick={onOpenGoogleSync}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition active:scale-95 shadow-xs"
              title="CEO အချက်အလက်အားလုံး Drive သို့ အပြည့်အစုံ သိမ်းမည်"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">ဒေတာအားလုံး သိမ်းမည်</span>
            </button>
          </div>
        </div>
      )}

      {/* Month Navigation & Medal Score Header */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-rose-500/10 via-rose-100/30 to-white dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50 shadow-sm">
        {/* Month Selector */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-200/50 dark:border-rose-900/40">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 border border-rose-100 dark:border-slate-700 shadow-xs active:scale-95 transition"
            title="ယခင်လ"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>{year} ခုနှစ်၊ {currentMonthMm}လ</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Monthly Goal Tracker ({currentYearMonth})
              </p>
              <button
                onClick={() => setShowSyncHabitsModal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-[10px] font-bold transition shadow-2xs"
                title="Sync Habits to Google Sheet"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Sync Habits</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 border border-rose-100 dark:border-slate-700 shadow-xs active:scale-95 transition"
            title="နောက်လ"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Medal Showcase */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Monthly Score */}
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-rose-100 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              လစဉ် ပြီးမြောက်မှု ရမှတ်
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black tabular-nums text-rose-600 dark:text-rose-400">
                {scorePercent}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({completedSlots}/{totalSlots})
              </span>
            </div>
          </div>

          {/* Medal Tier */}
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-rose-100 dark:border-slate-700 flex flex-col justify-center">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              ရရှိသော တံဆိပ် (Medal Tier)
            </span>
            <div className="flex items-center gap-2">
              {medalTier === 'gold' ? (
                <>
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shadow-xs">
                    🥇
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                      ရွှေတံဆိပ် (Gold Medal)
                    </span>
                    <span className="text-[10px] text-slate-400">&gt; 80% ပြည့်မြောက်</span>
                  </div>
                </>
              ) : medalTier === 'silver' ? (
                <>
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs">
                    🥈
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      ငွေတံဆိပ် (Silver Medal)
                    </span>
                    <span className="text-[10px] text-slate-400">50% - 79% ပြည့်မြောက်</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                    🎯
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                      တံဆိပ်မရသေးပါ
                    </span>
                    <span className="text-[10px] text-slate-400">50% အထက် ကြိုးစားပါ</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Goal Insight */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-rose-100 dark:border-slate-700 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
              အလေ့အကျင့် ၉ ခုအား နေ့စဉ် အကွက်နှိပ်ပြီး မှတ်သားပါ။ စည်းကမ်းရှိမှုက ရလဒ်ကောင်း ဖြစ်စေပါမည်။
            </p>
          </div>
        </div>
      </div>

      {/* Habit Sheet Table with Sticky Left Column and Scrollable Days 1-31 */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-rose-100/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-500" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              လစဉ် အလေ့အကျင့် ခြေရာခံဇယား (Daily Habit Grid 1-{daysInMonth})
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSyncHabitsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              title="Google Sheets သို့ ယခုလ အလေ့အကျင့် Grid ဇယား အဖြစ် တင်သွင်းရန်"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sync Habits</span>
            </button>
            <span className="text-[11px] text-slate-400">ဘေးသို့ ဆွဲကြည့်ပါ &rarr;</span>
          </div>
        </div>

        {/* Categories & Habit Rows */}
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full text-left border-collapse min-w-[760px]">
            {/* Days 1-31 Header Row */}
            <thead>
              <tr className="bg-rose-50/60 dark:bg-slate-800/60 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 border-b border-rose-100 dark:border-slate-800">
                <th className="sticky left-0 z-20 bg-rose-50 dark:bg-slate-800 py-3 px-3 sm:px-4 font-bold text-slate-800 dark:text-slate-200 min-w-[170px] sm:min-w-[210px] shadow-sm">
                  အလေ့အကျင့်များ (Habits)
                </th>
                {dayNumbers.map((d) => (
                  <th
                    key={d}
                    className="py-2 px-1 text-center min-w-[28px] max-w-[32px] font-medium"
                  >
                    <div className="text-[9px] text-slate-400 font-normal">
                      {getWeekdayShort(d)}
                    </div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {d}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body by Category */}
            <tbody>
              {categories.map((cat) => {
                const catHabits = trackerData.habits.filter(
                  (h) => h.category === cat.key
                );
                const IconComponent = cat.icon;

                return (
                  <React.Fragment key={cat.key}>
                    {/* Category Divider Header */}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-t border-b border-rose-100/50 dark:border-slate-800">
                      <td
                        colSpan={daysInMonth + 1}
                        className="py-2 px-3 sm:px-4 text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center ${cat.accentColor}`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span>{cat.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({cat.englishTitle})
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* 3 Habits in this Category */}
                    {catHabits.map((habit) => {
                      const isEditing = editingHabitId === habit.id;

                      return (
                        <tr
                          key={habit.id}
                          className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-rose-50/20 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          {/* Sticky Habit Name Column */}
                          <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 py-2.5 px-3 sm:px-4 text-xs font-medium text-slate-800 dark:text-slate-200 min-w-[170px] sm:min-w-[210px] shadow-sm">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editHabitName}
                                  onChange={(e) => setEditHabitName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRenameHabit(habit.id);
                                  }}
                                  className="w-full px-2 py-1 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSaveRenameHabit(habit.id)}
                                  className="p-1 rounded-lg bg-rose-500 text-white"
                                  title="သိမ်းမည်"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <span className="truncate pr-1">
                                  {habit.nameMm || habit.name}
                                </span>
                                <button
                                  onClick={() => handleStartRenameHabit(habit)}
                                  className="opacity-40 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                                  title="အမည်ပြောင်းရန်"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Days 1-31 Cells */}
                          {dayNumbers.map((d) => {
                            const isChecked = !!trackerData.checks[`${habit.id}_${d}`];

                            return (
                              <td key={d} className="p-0.5 text-center">
                                <button
                                  onClick={() => handleToggleCell(habit.id, d)}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg mx-auto flex items-center justify-center transition-all active:scale-90 ${
                                    isChecked
                                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                                      : 'bg-slate-50 dark:bg-slate-800/80 text-transparent hover:bg-rose-100/50 dark:hover:bg-slate-700/50 border border-slate-200/50 dark:border-slate-800'
                                  }`}
                                  title={`Day ${d}: ${habit.nameMm}`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Notes Section */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>လစဉ် မှတ်စုနှင့် ရည်မှန်းချက်များ (Monthly Notes)</span>
          </label>
          <span className="text-[11px] text-slate-400">အလိုအလျောက် သိမ်းဆည်းပါသည်</span>
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => handleSaveNotes(e.target.value)}
          placeholder="ယခုလအတွက် အဓိက သတိပြုစရာများ၊ ကျန်းမာရေးနှင့် အလေ့အကျင့်ဆိုင်ရာ ရလဒ်များ ရေးသားရန်..."
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
        />
      </div>

      {/* Sync Habits to Google Sheet Modal */}
      <SyncHabitsModal
        isOpen={showSyncHabitsModal}
        onClose={() => setShowSyncHabitsModal(false)}
        yearMonth={currentYearMonth}
        trackerData={trackerData}
      />
    </div>
  );
};
