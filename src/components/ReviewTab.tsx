import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Save,
  Calendar,
  History,
  Sparkles,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  ThumbsUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import { CeoReviewData } from '../types';
import {
  getCeoReview,
  saveCeoReview,
  getAllReviewDates,
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
  onReviewSaved?: () => void;
  onOpenGoogleSync?: () => void;
}

export const ReviewTab: React.FC<Props> = ({
  selectedDate,
  todayDate,
  onSelectDate,
  onReviewSaved,
  onOpenGoogleSync,
}) => {
  const [completedToday, setCompletedToday] = useState('');
  const [businessNotes, setBusinessNotes] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToFix, setWhatToFix] = useState('');
  const [priority1, setPriority1] = useState('');
  const [priority2, setPriority2] = useState('');
  const [priority3, setPriority3] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pastDates, setPastDates] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Load review data whenever selectedDate changes
  useEffect(() => {
    const data = getCeoReview(selectedDate);
    if (data) {
      setCompletedToday(data.completedToday || '');
      setBusinessNotes(data.businessNotes || '');
      setWhatWorked(data.whatWorked || '');
      setWhatToFix(data.whatToFix || '');
      setPriority1(data.topPrioritiesTomorrow?.[0] || '');
      setPriority2(data.topPrioritiesTomorrow?.[1] || '');
      setPriority3(data.topPrioritiesTomorrow?.[2] || '');
    } else {
      setCompletedToday('');
      setBusinessNotes('');
      setWhatWorked('');
      setWhatToFix('');
      setPriority1('');
      setPriority2('');
      setPriority3('');
    }
    setPastDates(getAllReviewDates());
  }, [selectedDate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData: CeoReviewData = {
      date: selectedDate,
      completedToday: completedToday.trim(),
      businessNotes: businessNotes.trim(),
      whatWorked: whatWorked.trim(),
      whatToFix: whatToFix.trim(),
      topPrioritiesTomorrow: [priority1.trim(), priority2.trim(), priority3.trim()],
      updatedAt: new Date().toISOString(),
    };

    saveCeoReview(reviewData);
    setPastDates(getAllReviewDates());
    setSavedSuccess(true);
    if (onReviewSaved) onReviewSaved();

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const formatted = formatBurmeseDate(selectedDate);
  const relative = getRelativeDateLabel(selectedDate, todayDate);
  const isViewingToday = selectedDate === todayDate;

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 via-rose-100/30 to-rose-50 dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-sm shadow-rose-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                CEO Aung Min Maw ညစဉ် သုံးသပ်ချက်
              </h1>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Nightly Review & Plan Tomorrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenGoogleSync && (
              <button
                type="button"
                onClick={onOpenGoogleSync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition active:scale-95 shadow-xs"
                title="Google Sheet ထဲသို့ သုံးသပ်ချက်များ သိမ်းမည်"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Drive Sheet</span>
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-rose-100 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-rose-500" />
              <span>မှတ်တမ်းများ ({pastDates.length})</span>
            </button>
          </div>
        </div>

        {/* Date Selector Row & Quick Buttons */}
        <div className="mt-4 pt-3 border-t border-rose-200/50 dark:border-rose-900/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-700 transition active:scale-95 group shadow-2xs"
              title="ရက်စွဲ ပြက္ခဒိန် ဖွင့်ရန် နှိပ်ပါ"
            >
              <Calendar className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {selectedDate}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                ပြက္ခဒိန်
              </span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                {formatted.burmese}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  relative.isToday
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                    : relative.isPast
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {relative.labelMm}
              </span>
            </div>
          </div>

          {/* Quick Date Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectDate(getPreviousDateString(selectedDate))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 transition active:scale-95"
            >
              <ChevronLeft className="w-3 h-3 text-rose-500" />
              <span>အရင်နေ့</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(getPreviousDateString(todayDate))}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition active:scale-95 ${
                selectedDate === getPreviousDateString(todayDate)
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50'
              }`}
            >
              မနေ့က သုံးသပ်ချက်
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(todayDate)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition active:scale-95 ${
                isViewingToday
                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50'
              }`}
            >
              ယနေ့ သုံးသပ်ချက်
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(getNextDateString(todayDate))}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition active:scale-95 ${
                selectedDate === getNextDateString(todayDate)
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50'
              }`}
            >
              မနက်ဖြန်အတွက် ကြိုတင်မှတ်သားရန်
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(getNextDateString(selectedDate))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700 transition active:scale-95"
            >
              <span>နောက်နေ့</span>
              <ChevronRight className="w-3 h-3 text-rose-500" />
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>သုံးသပ်ချက် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ဦးစားပေး ၃ ချက်သည် မနက်ဖြန် Today မျက်နှာပြင်တွင် ပေါ်လာပါမည်။</span>
          </div>
        )}
      </div>

      {/* Past Reviews Quick Picker Drawer (if opened) */}
      {showHistory && (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-rose-500" />
            <span>လွန်ခဲ့သော သုံးသပ်ချက် နေ့စွဲများ</span>
          </h3>
          {pastDates.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">သိမ်းဆည်းထားသော မှတ်တမ်း မရှိသေးပါ။</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto thin-scrollbar">
              {pastDates.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    onSelectDate(d);
                    setShowHistory(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    selectedDate === d
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CEO Aung Min Maw Review Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Field 1: What I completed today */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-rose-500" />
            <span>၁။ ယနေ့ ပြီးမြောက်ခဲ့သော အလုပ်များ (What I Completed Today)</span>
          </label>
          <textarea
            rows={3}
            value={completedToday}
            onChange={(e) => setCompletedToday(e.target.value)}
            placeholder="ယနေ့ ပြီးစီးခဲ့သည့် ဗီဒီယိုများ၊ စာမူများ၊ ရုံးလုပ်ငန်းများနှင့် သင်ယူမှုများ..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Field 2: Content / Customer / Sales / Income notes */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span>၂။ Content / Customer / Sales / Income မှတ်တမ်း</span>
          </label>
          <textarea
            rows={3}
            value={businessNotes}
            onChange={(e) => setBusinessNotes(e.target.value)}
            placeholder="Dwag Sharing ကြည့်ရှုသူတိုးတက်မှု၊ Dwag Store အော်ဒါများ၊ Customer feedback များနှင့် ယနေ့ရရှိသော ဝင်ငွေ..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Field 3: What worked */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
            <span>၃။ ယနေ့ ကောင်းမွန်ခဲ့သည့် အရာများ (What Worked)</span>
          </label>
          <textarea
            rows={2}
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            placeholder="ထိရောက်ခဲ့သော စည်းကမ်း၊ အောင်မြင်သော အစီအစဉ် သို့မဟုတ် စိတ်ကျေနပ်ဖွယ် အတွေ့အကြုံ..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Field 4: What to fix */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>၄။ ပြုပြင်ပြောင်းလဲရန် လိုအပ်သည့် အချက်များ (What to Fix)</span>
          </label>
          <textarea
            rows={2}
            value={whatToFix}
            onChange={(e) => setWhatToFix(e.target.value)}
            placeholder="အချိန်ဖြုန်းမိခြင်း၊ မပြီးပြတ်ခဲ့သော အလုပ်များ သို့မဟုတ် မနက်ဖြန် ပိုကောင်းအောင် ပြင်ဆင်ရမည့်အချက်..."
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Field 5: Top 3 priorities for tomorrow */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-50 via-white to-rose-50/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 border-2 border-rose-300 dark:border-rose-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>၅။ မနက်ဖြန်အတွက် အဓိက ဦးစားပေး ၃ ချက် (Top 3 Priorities for Tomorrow)</span>
            </label>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            ဤ ၃ ချက်သည် မနက်ဖြန် မနက်ခင်း Today မျက်နှာပြင် (Morning Reset အပေါ်) တွင် အလိုအလျောက် ပေါ်နေပါမည်။
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <input
                type="text"
                value={priority1}
                onChange={(e) => setPriority1(e.target.value)}
                placeholder="မနက်ဖြန်၏ နံပါတ် ၁ အရေးကြီးဆုံးအလုပ် (ဥပမာ- Dwag Sharing Script ရေးရန်)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <input
                type="text"
                value={priority2}
                onChange={(e) => setPriority2(e.target.value)}
                placeholder="မနက်ဖြန်၏ နံပါတ် ၂ အရေးကြီးဆုံးအလုပ် (ဥပမာ- ဗီဒီယို ရိုက်ကူးခြင်း)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <input
                type="text"
                value={priority3}
                onChange={(e) => setPriority3(e.target.value)}
                placeholder="မနက်ဖြန်၏ နံပါတ် ၃ အရေးကြီးဆုံးအလုပ် (ဥပမာ- Dwag Store ပို့စ်တင်ရန်)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99]"
        >
          <Save className="w-4 h-4" />
          <span>သုံးသပ်ချက် သိမ်းဆည်းမည် (Save Daily Review)</span>
        </button>
      </form>

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
