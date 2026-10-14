import React, { useEffect } from 'react';
import { Bell, Clock, Moon, Sunrise, Quote, X, Volume2 } from 'lucide-react';
import { ActiveAlarmPayload } from '../types';
import { startAlarmLoop, stopAlarmLoop } from '../services/alarmAudio';

interface Props {
  alarm: ActiveAlarmPayload | null;
  soundEnabled: boolean;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const AlarmModal: React.FC<Props> = ({
  alarm,
  soundEnabled,
  onDismiss,
  onSnooze,
}) => {
  useEffect(() => {
    if (alarm && soundEnabled) {
      startAlarmLoop();
    }
    return () => {
      stopAlarmLoop();
    };
  }, [alarm, soundEnabled]);

  if (!alarm) return null;

  const handleDismiss = () => {
    stopAlarmLoop();
    onDismiss();
  };

  const handleSnooze = () => {
    stopAlarmLoop();
    onSnooze(5);
  };

  const isWakeup = alarm.type === 'wakeup';
  const isBedtime = alarm.type === 'bedtime';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border-2 border-rose-400 dark:border-rose-600 text-center relative overflow-hidden">
        {/* Glowing backdrop rings */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-rose-500/20 blur-2xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-rose-500/20 blur-2xl animate-pulse" />

        {/* Alarm Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4 animate-bounce-subtle">
          {isWakeup ? (
            <Sunrise className="w-8 h-8" />
          ) : isBedtime ? (
            <Moon className="w-8 h-8" />
          ) : (
            <Bell className="w-8 h-8 animate-wiggle" />
          )}
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {alarm.title}
        </h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
          {alarm.subtitle}
        </p>

        {/* Sound indicator */}
        {soundEnabled && (
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>အချက်ပေးသံ မြည်နေပါသည်</span>
          </div>
        )}

        {/* Wake up motivation quote if available */}
        {alarm.motivationMessage && (
          <div className="my-4 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
              <Quote className="w-3.5 h-3.5" />
              <span>ယနေ့အတွက် အောင်မင်းမော် စိတ်ဓာတ်ခွန်အား စကားစု</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              "{alarm.motivationMessage}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/25 transition active:scale-[0.98]"
          >
            ပိတ်မည် (Dismiss Alarm)
          </button>

          <button
            onClick={handleSnooze}
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition active:scale-[0.98]"
          >
            ၅ မိနစ် ရွှေ့ဆိုင်းမည် (Snooze 5 Min)
          </button>
        </div>
      </div>
    </div>
  );
};
