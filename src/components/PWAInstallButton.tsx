import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          title="App ကို ဖုန်းထဲထည့်သွင်းရန် (Install PWA)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium text-sm shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700 active:scale-[0.99] transition"
      >
        <Download className="w-4 h-4" />
        <span>ဖုန်းမျက်နှာပြင်တွင် App အဖြစ် ထည့်သွင်းရန် (Install App)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'compact' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 transition active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-medium text-sm hover:bg-rose-100/50 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span>iPhone / iPad တွင် Home Screen ထည့်ရန်</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-rose-500" />
                  iPhone တွင် ထည့်သွင်းနည်း
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <p>Safari ဘရောက်ဇာ၏ အောက်ခြေ (သို့မဟုတ် အပေါ်) ရှိ <strong>Share (မျှဝေရန်)</strong> ခလုတ်ကို နှိပ်ပါ။</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <p>မီနူးတွင် အောက်သို့ဆွဲပြီး <strong>"Add to Home Screen"</strong> (ပင်မမျက်နှာပြင်သို့ ထည့်ပါ) ကို ရွေးချယ်ပါ။</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <p>အပေါ်ညာဘက်ရှိ <strong>"Add"</strong> ကို နှိပ်ပြီး ဖုန်းတွင် သီးသန့် App အဖြစ် အသုံးပြုနိုင်ပါပြီ။</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-2xl bg-rose-500 py-3 text-sm font-medium text-white hover:bg-rose-600 transition"
              >
                နားလည်ပါပြီ (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
