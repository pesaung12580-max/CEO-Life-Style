import React, { useState, useEffect } from 'react';
import { Flag, Check, Sparkles, Edit2, Plus, X, Save } from 'lucide-react';
import {
  getDailyPrioritiesChecked,
  setDailyPrioritiesChecked,
  getRelativeDateLabel,
  getTodayDateString,
  formatBurmeseDate,
} from '../services/storage';

interface Props {
  priorities: [string, string, string] | null;
  selectedDate: string;
  onSavePriorities?: (priorities: [string, string, string]) => void;
}

export const PrioritiesBanner: React.FC<Props> = ({
  priorities,
  selectedDate,
  onSavePriorities,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editP1, setEditP1] = useState('');
  const [editP2, setEditP2] = useState('');
  const [editP3, setEditP3] = useState('');

  // Sync checked items whenever selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCheckedItems(getDailyPrioritiesChecked(selectedDate));
    } else {
      setCheckedItems({});
    }
    setIsEditing(false);
  }, [selectedDate, priorities]);

  const hasItems = priorities && priorities.some((p) => p && p.trim() !== '');

  const startEdit = () => {
    setEditP1(priorities?.[0] || '');
    setEditP2(priorities?.[1] || '');
    setEditP3(priorities?.[2] || '');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePriorities) {
      onSavePriorities([editP1.trim(), editP2.trim(), editP3.trim()]);
    }
    setIsEditing(false);
  };

  const toggleChecked = (index: number) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      if (selectedDate) {
        setDailyPrioritiesChecked(selectedDate, next);
      }
      return next;
    });
  };

  const relative = getRelativeDateLabel(selectedDate, getTodayDateString());
  const dateFormatted = formatBurmeseDate(selectedDate);

  // If editing form is active
  if (isEditing) {
    return (
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 shadow-sm transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {relative.labelMm} ({dateFormatted.weekdayMm}) အတွက် Top 3 Priorities သတ်မှတ်ခြင်း
            </h3>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-3 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
              ဦးစားပေး ၁ (Priority #1)
            </label>
            <input
              type="text"
              value={editP1}
              onChange={(e) => setEditP1(e.target.value)}
              placeholder="ဥပမာ- Dwag Sharing Script ပြီးအောင်ရေးခြင်း"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
              ဦးစားပေး ၂ (Priority #2)
            </label>
            <input
              type="text"
              value={editP2}
              onChange={(e) => setEditP2(e.target.value)}
              placeholder="ဥပမာ- Dwag Store ရောင်းအား စာရင်းစစ်ခြင်း"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
              ဦးစားပေး ၃ (Priority #3)
            </label>
            <input
              type="text"
              value={editP3}
              onChange={(e) => setEditP3(e.target.value)}
              placeholder="ဥပမာ- ညနေ လေ့ကျင့်ခန်း ပုံမှန် ပြုလုပ်ခြင်း"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              မလုပ်တော့ပါ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{relative.labelMm} အတွက်သာ သိမ်းမည်</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // If no items set yet
  if (!hasItems) {
    return (
      <div className="rounded-3xl p-4 bg-gradient-to-r from-rose-50/60 via-white to-amber-50/60 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border border-rose-200/60 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Flag className="w-4 h-4 fill-rose-500/20" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {relative.labelMm}အတွက် အဓိက ဦးစားပေး ၃ ချက်
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              ယခုရက်စွဲအတွက် Top 3 Priorities သတ်မှတ်ထားခြင်း မရှိသေးပါ
            </p>
          </div>
        </div>
        <button
          onClick={startEdit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 transition active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ထည့်သွင်းမည်</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-r from-rose-500/10 via-rose-100/40 to-amber-500/10 dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/15 dark:bg-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Flag className="w-4 h-4 fill-rose-500/20" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{relative.labelMm}အတွက် အဓိက ဦးစားပေး ၃ ချက်</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {relative.labelMm} ({dateFormatted.weekdayMm}) ၏ Top 3 Priorities (ရက်စွဲအလိုက် သီးခြားဖြစ်ပါသည်)
            </p>
          </div>
        </div>

        <button
          onClick={startEdit}
          title="ဤရက်စွဲ၏ ဦးစားပေးများကို ပြင်ဆင်ရန်"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ပြင်မည်</span>
        </button>
      </div>

      <div className="space-y-2">
        {priorities!.map((item, idx) => {
          if (!item || !item.trim()) return null;
          const isDone = !!checkedItems[idx];
          return (
            <button
              key={idx}
              onClick={() => toggleChecked(idx)}
              className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-xs sm:text-sm ${
                isDone
                  ? 'bg-rose-100/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-slate-400 dark:text-slate-500 line-through'
                  : 'bg-white/80 dark:bg-slate-800/80 border-rose-100 dark:border-slate-800 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                  isDone
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="font-medium flex-1">
                <span className="text-rose-600 dark:text-rose-400 font-bold mr-1.5">{idx + 1}.</span>
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
