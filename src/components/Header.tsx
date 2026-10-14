import {
  Flame,
  Sun,
  Moon,
  Settings,
  Sparkles,
  Video,
  FileSpreadsheet,
  Target,
} from 'lucide-react';
import { formatBurmeseDate, getCustomAvatar } from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { ShootingPlanItem } from '../types';

interface Props {
  todayDate: string;
  completionRate: number; // 0 - 100
  streakCount: number;
  todayShootingPlan: ShootingPlanItem;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenAiChat: () => void;
  onOpenGoogleSync: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const Header: React.FC<Props> = ({
  todayDate,
  completionRate,
  streakCount,
  todayShootingPlan,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenAiChat,
  onOpenGoogleSync,
  focusMode,
  onToggleFocusMode,
}) => {
  const formatted = formatBurmeseDate(todayDate);
  const avatar = getCustomAvatar();

  // Dynamic greeting based on current hour personalized to CEO Aung Min Maw
  const currentHour = new Date().getHours();
  let greetingMm = 'မင်္ဂလာပါ CEO Aung Min Maw!';
  if (currentHour >= 5 && currentHour < 12) {
    greetingMm = 'မင်္ဂလာနံနက်ခင်းပါ CEO Aung Min Maw!';
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingMm = 'မင်္ဂလာနေ့လယ်ခင်းပါ CEO Aung Min Maw!';
  } else if (currentHour >= 17 && currentHour < 21) {
    greetingMm = 'မင်္ဂလာညနေခင်းပါ CEO Aung Min Maw!';
  } else {
    greetingMm = 'မင်္ဂလာညချမ်းပါ CEO Aung Min Maw!';
  }

  // Circular progress ring calculation (radius = 18, circumference = 2 * PI * 18 ≈ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <header className="sticky top-0 z-30 bg-rose-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-rose-100/80 dark:border-rose-950/80 pt-safe px-4 py-3 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Date & Greeting with optional Executive Avatar */}
        <div className="min-w-0 flex items-center gap-2.5">
          {avatar && (
            <div className="w-9 h-9 rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shrink-0 shadow-xs">
              <img
                src={avatar}
                alt="CEO Aung Min Maw"
                className="w-full h-full rounded-[10px] object-cover object-top"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span>{formatted.english}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{formatted.weekdayMm}</span>
            </div>

            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
              {greetingMm}
            </h1>
          </div>
        </div>

        {/* Right Slot: Progress Ring + Streak + Theme + Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Circular Progress Ring */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-rose-100 dark:stroke-slate-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-rose-500 transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {completionRate}%
            </span>
          </div>

          {/* Focus Mode active toggle or Streak Counter Badge */}
          {focusMode && onToggleFocusMode ? (
            <button
              onClick={onToggleFocusMode}
              title="Focus Mode မှ ထွက်ရန် နှိပ်ပါ"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/30 active:scale-95 transition"
            >
              <Target className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Focus Active</span>
            </button>
          ) : (
            <div
              title={`လက်ရှိ Streak: ${streakCount} ရက်`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/60 shadow-xs"
            >
              <Flame
                className={`w-4 h-4 ${
                  streakCount > 0
                    ? 'fill-rose-500 text-rose-500 animate-pulse'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
              <span className="text-xs font-black tabular-nums text-slate-800 dark:text-white">
                {streakCount}
              </span>
            </div>
          )}

          {/* PWA Compact Install trigger */}
          <PWAInstallButton variant="compact" />

          {/* CEO AI Advisor button */}
          <button
            onClick={onOpenAiChat}
            title="CEO AI အကြံပေး (Gemini)"
            className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500/10 to-rose-600/15 dark:from-rose-500/20 dark:to-rose-600/25 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 hover:from-rose-500/20 hover:to-rose-600/30 transition active:scale-95 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold hidden sm:inline">AI Advisor</span>
          </button>

          {/* Google Drive & Sheets Backup & Sync Button */}
          <button
            onClick={onOpenGoogleSync}
            title="Google Drive & Sheets သို့ အကုန်သိမ်းရန်"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition active:scale-95 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold hidden md:inline">Drive Sync</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Light Mode သို့ ပြောင်းရန်' : 'Dark Mode သို့ ပြောင်းရန်'}
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800 transition active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings / Alarms button */}
          <button
            onClick={onOpenSettings}
            title="အချက်ပေးသံနှင့် ဆက်တင်များ"
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Today's Video Focus Sub-bar */}
      <div className="max-w-3xl mx-auto mt-2 pt-1.5 border-t border-rose-100/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[9px] tracking-wide shrink-0">
            VIDEO FOCUS
          </span>
          <span className="font-semibold text-rose-600 dark:text-rose-400 shrink-0">
            {todayShootingPlan.dayNameEn}:
          </span>
          <span className="truncate">{todayShootingPlan.focusTitle}</span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2 hidden sm:inline">
          1:00 PM - 3:00 PM ရိုက်ကူးရေး
        </span>
      </div>
    </header>
  );
};
