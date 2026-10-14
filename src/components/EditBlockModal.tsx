import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { TimeBlock, SubTask } from '../types';
import { formatTo12Hour, formatBurmeseDate, getRelativeDateLabel, getTodayDateString } from '../services/storage';

interface Props {
  block: TimeBlock | null;
  isNew?: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSave: (block: TimeBlock, saveAsTemplate?: boolean) => void;
  onDelete?: (blockId: string) => void;
}

const AVAILABLE_ICONS = [
  'Sunrise',
  'Brain',
  'Coffee',
  'FileVideo',
  'Utensils',
  'Camera',
  'Heart',
  'TrendingUp',
  'Activity',
  'BookOpen',
  'MoonStar',
  'CheckSquare',
  'Moon',
  'Clock',
];

export const EditBlockModal: React.FC<Props> = ({
  block,
  isNew = false,
  selectedDate,
  onClose,
  onSave,
  onDelete,
}) => {
  const [startTime, setStartTime] = useState(block?.startTime || '08:00');
  const [endTime, setEndTime] = useState(block?.endTime || '09:00');
  const [title, setTitle] = useState(block?.title || '');
  const [englishTitle, setEnglishTitle] = useState(block?.englishTitle || '');
  const [iconName, setIconName] = useState(block?.iconName || 'Clock');
  const [subtasks, setSubtasks] = useState<SubTask[]>(block?.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const activeDate = selectedDate || getTodayDateString();
  const dateInfo = formatBurmeseDate(activeDate);
  const relativeDate = getRelativeDateLabel(activeDate, getTodayDateString());

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newTask: SubTask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newSubtaskText.trim(),
      done: false,
    };
    setSubtasks([...subtasks, newTask]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleUpdateSubtaskText = (id: string, text: string) => {
    setSubtasks(subtasks.map((st) => (st.id === id ? { ...st, text } : st)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedBlock: TimeBlock = {
      id: block?.id || `block-${Date.now()}`,
      startTime,
      endTime,
      title: title.trim(),
      englishTitle: englishTitle.trim() || title.trim(),
      iconName,
      reminderEnabled: block?.reminderEnabled ?? true,
      subtasks,
    };

    onSave(updatedBlock, saveAsTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {isNew ? 'အချိန်ဇယား အသစ်ထည့်သွင်းရန်' : 'အချိန်ဇယား ပြင်ဆင်ရန် (Edit Time Block)'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Isolation Notice */}
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              📅 {relativeDate.labelMm} ({dateInfo.weekdayMm}၊ {activeDate}) အတွက်သာ ပြင်ဆင်နေပါသည်
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              ယခု ပြင်ဆင်ချက်သည် မနေ့က သို့မဟုတ် မနက်ဖြန် အစီအစဉ်များအပေါ် မသက်ရောက်ဘဲ ဤရက်စွဲတစ်ခုတည်းအတွက် သီးခြား သိမ်းဆည်းပေးမည် ဖြစ်ပါသည်။
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>စတင်ချိန် (Start Time)</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{formatTo12Hour(startTime)}</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>ပြီးဆုံးချိန် (End Time)</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{formatTo12Hour(endTime)}</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Titles */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              မြန်မာခေါင်းစဉ် (Burmese Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ဥပမာ- နံနက်ခင်း စတင်ခြင်း"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              အင်္ဂလိပ်ခေါင်းစဉ် (English Section Name)
            </label>
            <input
              type="text"
              value={englishTitle}
              onChange={(e) => setEnglishTitle(e.target.value)}
              placeholder="e.g. Morning Reset"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              အိုင်ကွန် ရွေးချယ်ရန် (Icon)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-h-24 overflow-y-auto thin-scrollbar">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIconName(ic)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                    iconName === ic
                      ? 'bg-rose-500 text-white border-rose-500 font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks management */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              လုပ်ဆောင်ရမည့် အသေးစိတ်အချက်များ (Sub-tasks) ({subtasks.length})
            </label>
            <div className="space-y-2 max-h-44 overflow-y-auto thin-scrollbar pr-1">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={st.text}
                    onChange={(e) => handleUpdateSubtaskText(st.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="လုပ်ဆောင်ချက်အသစ် ထည့်ရန်..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ထည့်မည်</span>
              </button>
            </div>
          </div>

          {/* Master Template Toggle Option */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer select-none hover:bg-slate-100/60 dark:hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 shrink-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                နောင်ရက်များအတွက် ပုံသေ Template အဖြစ်ပါ သိမ်းဆည်းမည်
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                (အမှန်မခြစ်ပါက {relativeDate.labelMm} ရက်စွဲတစ်ခုတည်းအတွက်သာ သီးခြား သိမ်းဆည်းပါမည်)
              </p>
            </div>
          </label>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {!isNew && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('ဤအချိန်ဇယားအား ဖျက်လိုသည်မှာ သေချာပါသလား?')) {
                    onDelete(block!.id);
                  }
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ဖျက်ပစ်မည်</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-500/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>သိမ်းဆည်းမည်</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
