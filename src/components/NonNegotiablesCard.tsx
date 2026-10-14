import React from 'react';
import { CheckCircle2, Circle, Flame, Target, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NonNegotiableItem } from '../types';

interface Props {
  items: NonNegotiableItem[];
  onToggleItem: (id: string) => void;
  streakCount: number;
}

export const NonNegotiablesCard: React.FC<Props> = ({
  items,
  onToggleItem,
  streakCount,
}) => {
  const completedCount = items.filter((it) => it.done).length;
  const isStreakQualified = completedCount >= 3;
  const isAllCompleted = completedCount === 5;

  const handleToggle = (id: string, currentDone: boolean) => {
    // If user is completing an item that pushes them to streak qualification (3) or all complete (5), fire confetti
    const willBeCompleted = !currentDone;
    const nextCount = willBeCompleted ? completedCount + 1 : completedCount - 1;

    if (willBeCompleted && (nextCount === 3 || nextCount === 5)) {
      confetti({
        particleCount: nextCount === 5 ? 120 : 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#facc15', '#ffffff'],
      });
    }

    onToggleItem(id);
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-sm transition-all">
      {/* Header with Title and Counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Daily Non-Negotiables
              </h2>
              {isStreakQualified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  Streak ရရှိပြီ!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              နေ့စဉ် မဖြစ်မနေ လုပ်ရမည့် အချက် ၅ ချက် (အနည်းဆုံး ၃ ချက်ပြီးပါက Streak ရမည်)
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="text-right">
          <div className="text-lg sm:text-xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400">
            {completedCount}<span className="text-xs text-slate-400 font-normal">/5</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isAllCompleted
              ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400'
              : isStreakQualified
              ? 'bg-rose-500'
              : 'bg-rose-400'
          }`}
          style={{ width: `${(completedCount / 5) * 100}%` }}
        />
      </div>

      {/* 5 Non-Negotiable Items */}
      <div className="space-y-2.5">
        {items.map((item, index) => {
          return (
            <button
              key={item.id}
              onClick={() => handleToggle(item.id, item.done)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl border transition-all active:scale-[0.99] ${
                item.done
                  ? 'bg-rose-50/70 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-900/50 text-slate-700 dark:text-slate-200'
                  : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-rose-200 dark:hover:border-rose-900/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-100 dark:fill-rose-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                    {index + 1}.
                  </span>
                  <p
                    className={`text-xs sm:text-sm font-medium transition-colors ${
                      item.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {item.burmeseTitle}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {item.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* All Complete Celebration Banner */}
      {isAllCompleted && (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>ဂုဏ်ယူပါတယ် အောင်မင်းမော်! ယနေ့ မဖြစ်မနေ အချက် ၅ ချက်စလုံး ပြီးပြည့်စုံသွားပါပြီ။</span>
        </div>
      )}
    </div>
  );
};
