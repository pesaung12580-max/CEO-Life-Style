import React from 'react';
import { Check, Bell, BellOff, Edit2, Clock } from 'lucide-react';
import { TimeBlock } from '../types';
import { IconRenderer } from './IconRenderer';

import { formatTimeRange12Hour } from '../services/storage';

interface Props {
  block: TimeBlock;
  currentTimeString: string; // e.g. "08:15"
  subtaskProgress: Record<string, boolean>;
  onToggleSubtask: (subtaskId: string) => void;
  onToggleReminder: (blockId: string) => void;
  onEditBlock: (block: TimeBlock) => void;
}

export const TimelineBlockCard: React.FC<Props> = ({
  block,
  currentTimeString,
  subtaskProgress,
  onToggleSubtask,
  onToggleReminder,
  onEditBlock,
}) => {
  // Check if current time falls into block time range
  const isActive =
    currentTimeString >= block.startTime && currentTimeString < block.endTime;

  const totalSubtasks = block.subtasks.length;
  const completedSubtasks = block.subtasks.filter(
    (st) => !!subtaskProgress[st.id]
  ).length;
  const isAllDone = totalSubtasks > 0 && completedSubtasks === totalSubtasks;

  return (
    <div
      className={`relative rounded-3xl p-5 transition-all duration-300 border ${
        isActive
          ? 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/50 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 border-rose-300 dark:border-rose-700/80 shadow-md shadow-rose-500/10 ring-2 ring-rose-400/40'
          : isAllDone
          ? 'bg-white/80 dark:bg-slate-900/60 border-rose-100/60 dark:border-slate-800/80 opacity-90'
          : 'bg-white dark:bg-slate-900 border-rose-100/70 dark:border-slate-800 shadow-xs'
      }`}
    >
      {/* Active Pill Indicator */}
      {isActive && (
        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm shadow-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Active Now · လက်ရှိအချိန်</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              isActive
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : isAllDone
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                : 'bg-rose-50 text-rose-600 dark:bg-slate-800 dark:text-rose-400'
            }`}
          >
            <IconRenderer name={block.iconName} className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {formatTimeRange12Hour(block.startTime, block.endTime)}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                {block.englishTitle}
              </span>
            </div>

            <h3
              className={`text-sm sm:text-base font-bold mt-0.5 truncate transition-colors ${
                isAllDone
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {block.title}
            </h3>
          </div>
        </div>

        {/* Card Actions: Reminder Bell + Edit */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleReminder(block.id)}
            title={block.reminderEnabled ? 'အချိန်စတင်ချိန် အချက်ပေးထားပါသည်' : 'အချက်ပေးသံ ဖွင့်ရန်'}
            className={`p-2 rounded-xl transition active:scale-90 ${
              block.reminderEnabled
                ? 'text-rose-600 bg-rose-100/80 dark:bg-rose-950 dark:text-rose-400'
                : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
            }`}
          >
            {block.reminderEnabled ? (
              <Bell className="w-4 h-4 fill-rose-500/20" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onEditBlock(block)}
            title="အချိန်ဇယား ပြင်ဆင်ရန်"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtasks List */}
      {block.subtasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-rose-100/60 dark:border-slate-800/80 space-y-2">
          {block.subtasks.map((st) => {
            const isDone = !!subtaskProgress[st.id];
            return (
              <button
                key={st.id}
                onClick={() => onToggleSubtask(st.id)}
                className={`w-full text-left flex items-start gap-2.5 p-2 rounded-xl transition active:scale-[0.99] ${
                  isDone
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 text-slate-400 dark:text-slate-500'
                    : 'hover:bg-rose-50/30 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
                    isDone
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <span
                  className={`text-xs leading-relaxed transition-all ${
                    isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }`}
                >
                  {st.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress Footer if subtasks exist */}
      {totalSubtasks > 0 && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>ပြီးစီးမှု</span>
          </span>
          <span className="tabular-nums font-semibold text-rose-600 dark:text-rose-400">
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}
    </div>
  );
};
