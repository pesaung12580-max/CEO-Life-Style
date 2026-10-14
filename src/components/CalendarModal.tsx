import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import {
  formatBurmeseDate,
  getPreviousDateString,
  getNextDateString,
  hasDateActivity,
  getAllReviewDates,
} from '../services/storage';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
}

const MONTH_NAMES_MM = [
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

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = [
  { mm: 'နွေ', en: 'Su', fullMm: 'တနင်္ဂနွေ' },
  { mm: 'လာ', en: 'Mo', fullMm: 'တနင်္လာ' },
  { mm: 'ဂါ', en: 'Tu', fullMm: 'အင်္ဂါ' },
  { mm: 'ဟူး', en: 'We', fullMm: 'ဗုဒ္ဓဟူး' },
  { mm: 'တေး', en: 'Th', fullMm: 'ကြာသပတေး' },
  { mm: 'ကြာ', en: 'Fr', fullMm: 'သောကြာ' },
  { mm: 'နေ', en: 'Sa', fullMm: 'စနေ' },
];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  todayDate,
  onSelectDate,
}) => {
  // Parse initial view from selectedDate
  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[0] || new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[1] ? parts[1] - 1 : new Date().getMonth();
  });

  // Re-sync view month/year when modal opens or selectedDate changes
  React.useEffect(() => {
    if (isOpen) {
      const parts = selectedDate.split('-').map(Number);
      if (parts[0] && parts[1]) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [isOpen, selectedDate]);

  const reviewDatesSet = useMemo(() => {
    return new Set(getAllReviewDates());
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const [y, m] = todayDate.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    onSelectDate(todayDate);
    onClose();
  };

  const handlePickDate = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  // Selected date info
  const formattedSelected = formatBurmeseDate(selectedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-950/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                ရက်စွဲ ပြက္ခဒိန် ရွေးချယ်မှု
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                CEO Aung Min Maw Daily Execution Calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Date Badge */}
        <div className="px-4 py-2.5 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>လက်ရှိရွေးထားသောရက်:</span>
            <span className="font-bold underline decoration-rose-400">
              {formattedSelected.weekdayMm}၊ {selectedDate}
            </span>
          </div>
          {selectedDate !== todayDate && (
            <button
              onClick={handleJumpToToday}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition active:scale-95"
            >
              ယနေ့သို့ သွားမည်
            </button>
          )}
        </div>

        {/* Month Navigation Row */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition active:scale-90"
            title="ယခင်လ"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {MONTH_NAMES_MM[viewMonth]}လ {viewYear}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {MONTH_NAMES_EN[viewMonth]} {viewYear}
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition active:scale-90"
            title="နောက်လ"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 px-3 pt-3 text-center border-b border-slate-100 dark:border-slate-800 pb-2">
          {WEEKDAYS.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className={`text-[11px] font-bold ${idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                {day.mm}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold">{day.en}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="p-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Previous Month filler days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-10 sm:h-11 rounded-2xl flex items-center justify-center text-xs text-slate-300 dark:text-slate-700 font-medium select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayDate;
              const hasReview = reviewDatesSet.has(dateStr);
              const activity = hasDateActivity(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => handlePickDate(dateStr)}
                  className={`group relative h-10 sm:h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? 'bg-rose-600 text-white font-extrabold shadow-md shadow-rose-500/30 ring-2 ring-rose-500'
                      : isToday
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border-2 border-rose-400 dark:border-rose-600 hover:bg-rose-100'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-rose-50/70 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{dayNum}</span>

                  {/* Indicator dots */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {hasReview && (
                      <span
                        title="CEO ညစဉ် သုံးသပ်ချက် မှတ်တမ်းရှိသည်"
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}
                      />
                    )}
                    {activity.hasNonNeg && (
                      <span
                        title="Non-Negotiables မှတ်တမ်းရှိသည်"
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-200' : 'bg-amber-500'}`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Jump Buttons Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handlePickDate(todayDate)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-2xs"
            >
              ယနေ့ (Today)
            </button>
            <button
              onClick={() => handlePickDate(getPreviousDateString(todayDate))}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 shadow-2xs"
            >
              မနေ့က
            </button>
            <button
              onClick={() => handlePickDate(getNextDateString(todayDate))}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 shadow-2xs"
            >
              မနက်ဖြန်
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Review
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Non-Neg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
