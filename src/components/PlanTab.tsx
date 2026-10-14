import React, { useState } from 'react';
import { Video, Camera, Edit3, Save, CheckCircle, Sparkles, Mic, Battery, SunMedium, Smartphone } from 'lucide-react';
import { ShootingPlanItem } from '../types';
import { saveShootingPlans } from '../services/storage';

interface Props {
  shootingPlans: ShootingPlanItem[];
  onUpdatePlans: (plans: ShootingPlanItem[]) => void;
  todayDayOfWeek: number;
}

export const PlanTab: React.FC<Props> = ({
  shootingPlans,
  onUpdatePlans,
  todayDayOfWeek,
}) => {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMm, setEditMm] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);

  // Quick gear checklist state
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({
    mic: true,
    battery: true,
    light: false,
    teleprompter: true,
    sdcard: true,
  });

  const handleStartEdit = (item: ShootingPlanItem) => {
    setEditingDay(item.dayOfWeek);
    setEditTitle(item.focusTitle);
    setEditMm(item.focusMm);
    setEditDetails(item.details);
  };

  const handleSaveEdit = (dayOfWeek: number) => {
    const updated = shootingPlans.map((p) => {
      if (p.dayOfWeek === dayOfWeek) {
        return {
          ...p,
          focusTitle: editTitle.trim(),
          focusMm: editMm.trim(),
          details: editDetails.trim(),
        };
      }
      return p;
    });

    onUpdatePlans(updated);
    saveShootingPlans(updated);
    setEditingDay(null);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const toggleGear = (key: string) => {
    setGearChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 via-rose-100/40 to-rose-50 dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-sm shadow-rose-500/30">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Weekly Video Shooting Plan
            </h1>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              နေ့စဉ် 1:00 PM - 3:00 PM ဗီဒီယို ရိုက်ကူးရေး အဓိက အစီအစဉ်
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
          တစ်ပတ်တာအတွင်း Dwag Sharing ဗဟုသုတ ဗီဒီယိုများနှင့် Dwag Store ထုတ်ကုန် ကြော်ငြာများကို စနစ်တကျ ရိုက်ကူးနိုင်ရန် နေ့ရက်အလိုက် ကြိုတင် သတ်မှတ်ထားသော Focus များ ဖြစ်ပါသည်။ လိုအပ်သလို ပြင်ဆင်နိုင်ပါသည်။
        </p>

        {savedNotification && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span>အစီအစဉ် အောင်မြင်စွာ ပြင်ဆင်သိမ်းဆည်းပြီးပါပြီ!</span>
          </div>
        )}
      </div>

      {/* Quick Production Gear Checklist */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-rose-500" />
            <span>ရိုက်ကူးရေး ကိရိယာများ စစ်ဆေးချက် (Gear Checklist)</span>
          </h2>
          <span className="text-[11px] text-slate-400">1:00 PM မတိုင်မီ ပြင်ဆင်ရန်</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'mic', label: 'Wireless Mic / အသံစက်', icon: Mic },
            { id: 'battery', label: 'Camera Battery အပြည့်', icon: Battery },
            { id: 'light', label: 'Lighting / မီးအလင်း', icon: SunMedium },
            { id: 'teleprompter', label: 'Script / စာမူအဆင်သင့်', icon: Sparkles },
            { id: 'sdcard', label: 'Memory Card / Storage', icon: Smartphone },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggleGear(id)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition active:scale-95 text-xs ${
                gearChecked[id]
                  ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 font-medium'
                  : 'bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                  gearChecked[id]
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {gearChecked[id] && <CheckCircle className="w-3 h-3" />}
              </div>
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weekdays 7-Day Focus Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          ၇ ရက်တာ ရိုက်ကူးရေး အချိန်ဇယား (Weekly Focus)
        </h2>

        {shootingPlans.map((plan) => {
          const isToday = plan.dayOfWeek === todayDayOfWeek;
          const isEditing = editingDay === plan.dayOfWeek;

          return (
            <div
              key={plan.dayOfWeek}
              className={`rounded-3xl p-5 border transition-all ${
                isToday
                  ? 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 border-rose-300 dark:border-rose-700/80 shadow-md shadow-rose-500/10 ring-2 ring-rose-400/30'
                  : 'bg-white dark:bg-slate-900 border-rose-100/70 dark:border-slate-800 shadow-xs'
              }`}
            >
              {isEditing ? (
                /* Edit Form */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {plan.dayNameMm} ({plan.dayNameEn}) အစီအစဉ် ပြင်ဆင်ရန်
                    </span>
                    <button
                      onClick={() => setEditingDay(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      မလုပ်တော့ပါ
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      အင်္ဂလိပ် ခေါင်းစဉ် (English Focus)
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      မြန်မာ ဖော်ပြချက် (Burmese Focus)
                    </label>
                    <input
                      type="text"
                      value={editMm}
                      onChange={(e) => setEditMm(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      အသေးစိတ် မှတ်စု (Details & Ideas)
                    </label>
                    <textarea
                      rows={2}
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingDay(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ပယ်ဖျက်မည်
                    </button>
                    <button
                      onClick={() => handleSaveEdit(plan.dayOfWeek)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>သိမ်းဆည်းမည်</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* View Card */
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isToday
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {plan.dayNameEn.slice(0, 3)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {plan.dayNameMm}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {plan.dayNameEn}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold tracking-wider">
                              ယနေ့ · TODAY
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                          {plan.focusTitle}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartEdit(plan)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="အစီအစဉ် ပြင်ဆင်ရန်"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-2.5 pl-11">
                    {plan.focusMm}
                  </p>
                  {plan.details && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-11 leading-relaxed">
                      {plan.details}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
