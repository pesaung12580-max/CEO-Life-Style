import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Target,
  Check,
  Zap,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { DateNavigator } from './DateNavigator';
import { DailyMotivationCard } from './DailyMotivationCard';
import { DailyVideoCard } from './DailyVideoCard';
import { NonNegotiablesCard } from './NonNegotiablesCard';
import { PrioritiesBanner } from './PrioritiesBanner';
import { TimelineBlockCard } from './TimelineBlockCard';
import { EditBlockModal } from './EditBlockModal';
import { IconRenderer } from './IconRenderer';
import { TimeBlock, NonNegotiableItem } from '../types';
import {
  isDailyTimeBlocksCustomized,
  getRelativeDateLabel,
  formatTimeRange12Hour,
} from '../services/storage';

interface Props {
  selectedDate: string;
  realTodayDate: string;
  onSelectDate: (date: string) => void;
  currentTimeString: string;
  priorities: [string, string, string] | null;
  onSavePriorities?: (priorities: [string, string, string]) => void;
  nonNegotiables: NonNegotiableItem[];
  onToggleNonNegotiable: (id: string) => void;
  streakCount: number;
  timeBlocks: TimeBlock[];
  subtasksProgress: Record<string, boolean>;
  onToggleSubtask: (subtaskId: string) => void;
  onToggleReminder: (blockId: string) => void;
  onSaveBlock: (block: TimeBlock, saveAsTemplate?: boolean) => void;
  onDeleteBlock: (blockId: string) => void;
  onResetDayBlocks?: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const TodayTab: React.FC<Props> = ({
  selectedDate,
  realTodayDate,
  onSelectDate,
  currentTimeString,
  priorities,
  onSavePriorities,
  nonNegotiables,
  onToggleNonNegotiable,
  streakCount,
  timeBlocks,
  subtasksProgress,
  onToggleSubtask,
  onToggleReminder,
  onSaveBlock,
  onDeleteBlock,
  onResetDayBlocks,
  focusMode = false,
  onToggleFocusMode,
}) => {
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Sorted time blocks by startTime
  const sortedBlocks = [...timeBlocks].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  const isCustomized = isDailyTimeBlocksCustomized(selectedDate);
  const relative = getRelativeDateLabel(selectedDate, realTodayDate);

  // Identify current active time block for Focus Mode
  const currentActiveBlock =
    sortedBlocks.find(
      (b) => currentTimeString >= b.startTime && currentTimeString < b.endTime
    ) ||
    sortedBlocks.find((b) => b.startTime > currentTimeString) ||
    sortedBlocks[0];

  // Calculate progress for current focus block
  const focusTotalSubtasks = currentActiveBlock?.subtasks.length || 0;
  const focusCompletedSubtasks =
    currentActiveBlock?.subtasks.filter((st) => !!subtasksProgress[st.id]).length || 0;
  const focusBlockProgress =
    focusTotalSubtasks > 0
      ? Math.round((focusCompletedSubtasks / focusTotalSubtasks) * 100)
      : 0;

  // Next block after current
  const currentBlockIndex = sortedBlocks.findIndex(
    (b) => b.id === currentActiveBlock?.id
  );
  const nextBlock =
    currentBlockIndex >= 0 && currentBlockIndex < sortedBlocks.length - 1
      ? sortedBlocks[currentBlockIndex + 1]
      : null;

  // If Focus Mode is enabled, render clean, distraction-free view focusing on current time block
  if (focusMode) {
    return (
      <div className="space-y-5 pb-20 animate-fadeIn">
        {/* Focus Mode Top Reassurance Bar */}
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                <Target className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '8s' }} />
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-100">
                  CEO Aung Min Maw Deep Focus
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  အာရုံစူးစိုက်မှု Focus Mode
                </h2>
              </div>
            </div>

            {onToggleFocusMode && (
              <button
                onClick={onToggleFocusMode}
                className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-rose-600 hover:bg-rose-50 shadow-md transition active:scale-95 shrink-0"
              >
                ပုံမှန်သို့ ထွက်မည်
              </button>
            )}
          </div>
          <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
            အခြား အာရုံလွင့်စေသော အချက်အလက်များအား ဖျောက်ထားပြီး လက်ရှိအချိန်ဇယားနှင့် subtasks များကိုသာ အာရုံစူးစိုက် လုပ်ဆောင်နေပါသည်
          </p>
        </div>

        {/* Current Active Time Block Spotlight */}
        {currentActiveBlock ? (
          <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border-2 border-rose-400 dark:border-rose-600 shadow-xl shadow-rose-500/10">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>
                  လက်ရှိ အချိန်ဇယား ({formatTimeRange12Hour(currentActiveBlock.startTime, currentActiveBlock.endTime)})
                </span>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                Active Block
              </span>
            </div>

            {/* Block Info */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                <IconRenderer name={currentActiveBlock.iconName} className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {currentActiveBlock.title}
                </h3>
                {currentActiveBlock.englishTitle && (
                  <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {currentActiveBlock.englishTitle}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    အချိန်: {currentActiveBlock.startTime} - {currentActiveBlock.endTime} · ယခု: {currentTimeString}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5 p-4 rounded-2xl bg-rose-50/70 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">
                  လုပ်ငန်းစဉ် ပြီးစီးမှု အခြေအနေ
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                  {focusCompletedSubtasks}/{focusTotalSubtasks} ({focusBlockProgress}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-rose-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${focusBlockProgress}%` }}
                />
              </div>
            </div>

            {/* Subtasks Checkboxes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                လုပ်ဆောင်ရမည့် Subtasks ({currentActiveBlock.subtasks.length})
              </h4>
              {currentActiveBlock.subtasks.map((st) => {
                const done = !!subtasksProgress[st.id];
                return (
                  <button
                    key={st.id}
                    onClick={() => onToggleSubtask(st.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      done
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-slate-400 dark:text-slate-500 line-through'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-rose-300 shadow-xs text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        done
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-rose-400'
                      }`}
                    >
                      {done && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-semibold leading-relaxed flex-1">
                      {st.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Clock className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              အချိန်ဇယား မရှိသေးပါ
            </p>
          </div>
        )}

        {/* Next upcoming block indicator */}
        {nextBlock && (
          <div className="rounded-2xl p-4 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">နောက်ဆက်တွဲ လုပ်ငန်းစဉ်:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {nextBlock.title} ({formatTimeRange12Hour(nextBlock.startTime, nextBlock.endTime)})
              </span>
            </div>
          </div>
        )}

        {/* Exit Focus Mode Action button */}
        {onToggleFocusMode && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={onToggleFocusMode}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs flex items-center gap-2"
            >
              <span>ပုံမှန် အချိန်ဇယား မြင်ကွင်းသို့ ပြန်သွားမည်</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Normal View with Date Navigator, Habits, Videos, Motivation, Timeline and Focus Mode Button
  return (
    <div className="space-y-4 pb-24">
      {/* 0. Date Selector & Past/Future Days Navigator */}
      <DateNavigator
        selectedDate={selectedDate}
        todayDate={realTodayDate}
        onSelectDate={onSelectDate}
      />

      {/* Date Isolation Indicator Reassurance Banner */}
      <div className="rounded-2xl px-4 py-2.5 bg-rose-50/70 dark:bg-slate-900/80 border border-rose-200/60 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-[11px] sm:text-xs truncate text-slate-700 dark:text-slate-300">
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {relative.labelMm} ({selectedDate})
            </span>
            <span className="hidden sm:inline"> အတွက် သီးသန့် မှတ်တမ်းဖြစ်သည် · အခြားရက်များ မပြောင်းလဲပါ</span>
          </div>
        </div>

        {isCustomized ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              စိတ်ကြိုက်ပြင်ထားသည်
            </span>
            {onResetDayBlocks && (
              <button
                onClick={() => {
                  if (confirm(`${relative.labelMm} အတွက် အချိန်ဇယားအား မူလ ပုံမှန် Template အတိုင်း ပြန်ထားမည်မှာ သေချာပါသလား?`)) {
                    onResetDayBlocks();
                  }
                }}
                title="မူလ Template အတိုင်း ပြန်ယူမည်"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
            ပုံမှန် Template
          </span>
        )}
      </div>

      {/* 1. Daily Leader Wisdom & Motivation Card for CEO Persona */}
      <DailyMotivationCard todayDate={selectedDate} />

      {/* 2. Daily Recommended YouTube Video Card (1 video per day) */}
      <DailyVideoCard todayDate={selectedDate} />

      {/* 3. Top 3 Priorities for Today (Date-isolated with direct edit support) */}
      <PrioritiesBanner
        priorities={priorities}
        selectedDate={selectedDate}
        onSavePriorities={onSavePriorities}
      />

      {/* 4. Daily Non-Negotiables Card (0/5, auto reset, confetti) */}
      <NonNegotiablesCard
        items={nonNegotiables}
        onToggleItem={onToggleNonNegotiable}
        streakCount={streakCount}
      />

      {/* 5. Vertical Timeline Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              CEO Aung Min Maw Daily Timeline · အချိန်ဇယား ({sortedBlocks.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Focus Mode Trigger Button */}
            {onToggleFocusMode && (
              <button
                onClick={onToggleFocusMode}
                title="အာရုံစူးစိုက်မှု Focus Mode ဖွင့်မည်"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xs shadow-rose-500/25 transition active:scale-95"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Focus Mode</span>
              </button>
            )}

            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 transition active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>အသစ်ထည့်မည်</span>
            </button>
          </div>
        </div>

        {/* Timeline Cards List */}
        <div className="space-y-3.5">
          {sortedBlocks.map((block) => (
            <TimelineBlockCard
              key={block.id}
              block={block}
              currentTimeString={currentTimeString}
              subtaskProgress={subtasksProgress}
              onToggleSubtask={onToggleSubtask}
              onToggleReminder={onToggleReminder}
              onEditBlock={(b) => setEditingBlock(b)}
            />
          ))}
        </div>
      </div>

      {/* Edit Block Modal */}
      {editingBlock && (
        <EditBlockModal
          block={editingBlock}
          selectedDate={selectedDate}
          onSave={(updated, saveAsTemplate) => {
            onSaveBlock(updated, saveAsTemplate);
            setEditingBlock(null);
          }}
          onDelete={(id) => {
            onDeleteBlock(id);
            setEditingBlock(null);
          }}
          onClose={() => setEditingBlock(null)}
        />
      )}

      {/* Add New Block Modal */}
      {isAddingNew && (
        <EditBlockModal
          isNew={true}
          selectedDate={selectedDate}
          block={{
            id: `custom-${Date.now()}`,
            title: 'လုပ်ငန်းစဉ် အသစ်',
            englishTitle: 'Custom Focus Block',
            startTime: '10:00',
            endTime: '11:00',
            iconName: 'Target',
            reminderEnabled: true,
            subtasks: [
              {
                id: `sub-${Date.now()}-1`,
                text: 'အဓိက အလုပ် ပြီးစီးအောင် ဆောင်ရွက်ခြင်း',
                done: false,
              },
            ],
          }}
          onSave={(newBlock, saveAsTemplate) => {
            onSaveBlock(newBlock, saveAsTemplate);
            setIsAddingNew(false);
          }}
          onDelete={() => setIsAddingNew(false)}
          onClose={() => setIsAddingNew(false)}
        />
      )}
    </div>
  );
};
