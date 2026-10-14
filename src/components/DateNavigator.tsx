import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
  Clock,
  CalendarCheck,
  CalendarDays,
} from 'lucide-react';
import {
  formatBurmeseDate,
  getPreviousDateString,
  getNextDateString,
  getRelativeDateLabel,
} from '../services/storage';
import { CalendarModal } from './CalendarModal';

interface Props {
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
}

export const DateNavigator: React.FC<Props> = ({
  selectedDate,
  todayDate,
  onSelectDate,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formatted = formatBurmeseDate(selectedDate);
  const relative = getRelativeDateLabel(selectedDate, todayDate);

  const handlePrevDay = () => {
    onSelectDate(getPreviousDateString(selectedDate));
  };

  const handleNextDay = () => {
    onSelectDate(getNextDateString(selectedDate));
  };

  const handleGoToday = () => {
    onSelectDate(todayDate);
  };

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      {/* Date Navigation Bar */}
      <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-rose-100 dark:border-rose-950/80 p-2 sm:p-2.5 shadow-xs flex items-center justify-between gap-2 transition-colors">
        {/* Previous Day Button */}
        <button
          onClick={handlePrevDay}
          title="မနေ့က သို့မဟုတ် အရင်နေ့သို့ သွားရန်"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">အရင်နေ့</span>
        </button>

        {/* Center: Date Display & Calendar Modal Trigger */}
        <div className="relative flex items-center justify-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setIsCalendarOpen(true)}
            title="ရက်စွဲ ပြက္ခဒိန် ရွေးချယ်ရန် နှိပ်ပါ"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-800 transition text-center min-w-0 max-w-full group cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900 active:scale-98"
          >
            <div className="p-1 rounded-lg bg-rose-100/70 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {formatted.weekdayMm}၊ {selectedDate}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  relative.isToday
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : relative.isPast
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                }`}
              >
                {relative.labelMm}
              </span>
            </div>
          </button>
        </div>

        {/* Next Day Button */}
        <button
          onClick={handleNextDay}
          title="နောက်နေ့သို့ သွားရန်"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
        >
          <span className="hidden sm:inline">နောက်နေ့</span>
          <ChevronRight className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      {/* Floating alert bar when NOT viewing today */}
      {!relative.isToday && (
        <div
          className={`px-3.5 py-2 rounded-2xl flex items-center justify-between gap-2 text-xs transition-colors ${
            relative.isPast
              ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate font-medium">
              {relative.isPast
                ? `အရင်နေ့ (${selectedDate}) ၏ လုပ်ဆောင်ချက်များကို ကြည့်ရှု/ပြင်ဆင်နေပါသည်`
                : `နောက်နေ့ (${selectedDate}) အတွက် အစီအစဉ်များ ကြိုတင်မှတ်သားနေပါသည်`}
            </span>
          </div>

          <button
            onClick={handleGoToday}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition shrink-0 active:scale-95 shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ယနေ့ သို့ ပြန်သွားရန်</span>
          </button>
        </div>
      )}

      {/* Interactive Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        todayDate={todayDate}
        onSelectDate={onSelectDate}
      />
    </div>
  );
};
