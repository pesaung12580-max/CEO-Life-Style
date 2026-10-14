import React, { useState } from 'react';
import {
  X,
  Bell,
  Clock,
  Volume2,
  Moon,
  Sunrise,
  ShieldCheck,
  Smartphone,
  Play,
  Save,
  CheckCircle,
} from 'lucide-react';
import { AlarmConfig } from '../types';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendBrowserNotification,
} from '../services/notificationService';
import { playChimeSequence } from '../services/alarmAudio';
import { PWAInstallButton } from './PWAInstallButton';
import { formatTo12Hour } from '../services/storage';

interface Props {
  config: AlarmConfig;
  onSaveConfig: (config: AlarmConfig) => void;
  onTriggerTestAlarm: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  config,
  onSaveConfig,
  onTriggerTestAlarm,
  onClose,
}) => {
  const [wakeUpTime, setWakeUpTime] = useState(config.wakeUpTime);
  const [wakeUpEnabled, setWakeUpEnabled] = useState(config.wakeUpEnabled);
  const [bedtimeTime, setBedtimeTime] = useState(config.bedtimeTime);
  const [bedtimeEnabled, setBedtimeEnabled] = useState(config.bedtimeEnabled);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [blockRemindersEnabled, setBlockRemindersEnabled] = useState(
    config.blockRemindersEnabled
  );
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    getNotificationPermissionStatus()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      sendBrowserNotification('အောင်မင်းမော် Daily Routine အသိပေးချက် ဖွင့်ထားပါပြီ', {
        body: 'နေ့စဉ် အချိန်ဇယားနှင့် အချက်ပေးသံများ အသင့်ဖြစ်ပါပြီ။',
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AlarmConfig = {
      wakeUpTime,
      wakeUpEnabled,
      bedtimeTime,
      bedtimeEnabled,
      soundEnabled,
      blockRemindersEnabled,
      browserNotificationsEnabled: permissionStatus === 'granted',
    };
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              အချက်ပေးနှင့် ဆက်တင်များ (Alarms & Settings)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Wake-up alarm */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-rose-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  မနက်ခင်း အိပ်ရာထ အချက်ပေးသံ (Wake-up Alarm)
                </span>
              </div>
              <input
                type="checkbox"
                checked={wakeUpEnabled}
                onChange={(e) => setWakeUpEnabled(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded accent-rose-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              အိပ်ရာထချိန်တွင် ယနေ့အတွက် အောင်မင်းမော် စိတ်ဓာတ်ခွန်အား စကားစုနှင့်အတူ အချက်ပေးပါမည်။
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-slate-700">
                {formatTo12Hour(wakeUpTime)}
              </span>
            </div>
          </div>

          {/* Bedtime reminder */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  ညအိပ်ရာဝင် သတိပေးချက် (Bedtime Reminder)
                </span>
              </div>
              <input
                type="checkbox"
                checked={bedtimeEnabled}
                onChange={(e) => setBedtimeEnabled(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded accent-rose-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              ဖုန်းအသုံးပြုမှု လျှော့ချပြီး ၁၀:၀၀ PM တွင် အိပ်ရာဝင်နိုင်ရန် သတိပေးပါမည်။
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={bedtimeTime}
                onChange={(e) => setBedtimeTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {formatTo12Hour(bedtimeTime)}
              </span>
            </div>
          </div>

          {/* Time block reminders toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                အချိန်ဇယား စတင်ချိန် သတိပေးချက်များ
              </span>
              <span className="text-[11px] text-slate-400">
                Time block တစ်ခုစီ၏ စတင်ချိန်တွင် Remind လုပ်ရန်
              </span>
            </div>
            <input
              type="checkbox"
              checked={blockRemindersEnabled}
              onChange={(e) => setBlockRemindersEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded accent-rose-500"
            />
          </div>

          {/* Sound Alarm toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-rose-500" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  အချက်ပေး အသံမြည်ခြင်း (Sound Alarm)
                </span>
                <span className="text-[11px] text-slate-400">
                  သာယာသော ခေါင်းလောင်းသံမြည်ရန်
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded accent-rose-500"
            />
          </div>

          {/* Test Alarm & Sound Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                playChimeSequence();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>အသံ စမ်းသပ်ရန် (Test Sound)</span>
            </button>

            <button
              type="button"
              onClick={onTriggerTestAlarm}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Alarm စမ်းသပ်ရန် (Test Popup)</span>
            </button>
          </div>

          {/* Browser Notification Permission */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>ဘရောက်ဇာ Notification ခွင့်ပြုချက်</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {permissionStatus === 'granted' ? 'ခွင့်ပြုထားသည်' : 'ခွင့်မပြုရသေးပါ'}
              </span>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="mt-2 w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold"
              >
                Notification ခွင့်ပြုချက် တောင်းဆိုရန် (Allow)
              </button>
            )}
          </div>

          {/* PWA Section */}
          <div className="pt-2">
            <PWAInstallButton variant="full" />
          </div>

          {/* Note explaining notification constraint */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>သတိပြုရန်-</strong> အချက်ပေးသံများနှင့် Notification များသည် ဤဝက်ဘ်ဆိုက်အား ဖွင့်ထားချိန် သို့မဟုတ် ဖုန်းမျက်နှာပြင်တွင် PWA App အဖြစ် ထည့်သွင်း (Install) ထားချိန်တွင် အပြည့်အဝ အလုပ်လုပ်ပါမည်။
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>သိမ်းဆည်းပြီးပါပြီ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ဆက်တင်များ သိမ်းဆည်းမည်</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
