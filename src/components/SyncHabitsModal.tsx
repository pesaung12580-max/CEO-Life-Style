import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  ShieldCheck,
  LogOut,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Table,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  getCurrentUser,
} from '../services/googleAuth';
import {
  syncMonthlyHabitsToGoogleSheets,
  getSavedSpreadsheetUrl,
  getLastSyncTime,
  MonthlyHabitsSyncResult,
} from '../services/googleSheetsSync';
import { MonthlyTrackerData } from '../types';

interface SyncHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearMonth: string;
  trackerData: MonthlyTrackerData;
}

const BURMESE_MONTHS = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'သြဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];

export const SyncHabitsModal: React.FC<SyncHabitsModalProps> = ({
  isOpen,
  onClose,
  yearMonth,
  trackerData,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStage, setSyncStage] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncResult, setSyncResult] = useState<MonthlyHabitsSyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [savedUrl, setSavedUrl] = useState<string | null>(getSavedSpreadsheetUrl());
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime());

  // Parse month
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const burmeseMonth = BURMESE_MONTHS[month - 1] || `${month}လ`;

  // Calculate monthly stats
  const habits = trackerData.habits;
  const totalSlots = habits.length * daysInMonth;
  const completedSlots = Object.values(trackerData.checks).filter(Boolean).length;
  const scorePercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  let medalTierText = 'တံဆိပ်မရသေးပါ (<50%)';
  if (scorePercent >= 80) {
    medalTierText = '🥇 ရွှေတံဆိပ် (>80% Gold Medal)';
  } else if (scorePercent >= 50) {
    medalTierText = '🥈 ငွေတံဆိပ် (50-79% Silver Medal)';
  }

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(getCurrentUser());
      setSavedUrl(getSavedSpreadsheetUrl());
      setLastSync(getLastSyncTime());
      setErrorMessage(null);
      setSyncResult(null);
      setSyncProgress(0);
      setSyncStage('');

      const unsubscribe = initAuth(
        (user) => {
          setCurrentUser(user);
        },
        () => {
          setCurrentUser(null);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleExecuteSync = async () => {
    setErrorMessage(null);
    setIsSyncing(true);
    setSyncProgress(5);
    setSyncStage('Google Workspace ချိတ်ဆက်မှုကို စစ်ဆေးနေပါသည်...');

    try {
      let token = await getAccessToken();

      // If no token cached, prompt Google sign-in
      if (!token) {
        setSyncStage('Google အကောင့်သို့ ဝင်ရောက်နေပါသည်...');
        const authRes = await googleSignIn();
        if (!authRes?.accessToken) {
          throw new Error('Google Workspace OAuth access token could not be obtained.');
        }
        token = authRes.accessToken;
        setCurrentUser(authRes.user);
      }

      const result = await syncMonthlyHabitsToGoogleSheets(
        token,
        yearMonth,
        (stage, pct) => {
          setSyncStage(stage);
          setSyncProgress(pct);
        }
      );

      setSyncResult(result);
      setSavedUrl(result.spreadsheetUrl);
      setLastSync(new Date().toLocaleString());
    } catch (err: any) {
      console.error('Sync habits error:', err);
      setErrorMessage(err.message || 'Failed to sync habit data to Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-rose-200/80 dark:border-rose-950/80 shadow-2xl p-5 sm:p-6 my-8 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-rose-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Sync Habits to Google Sheet</span>
              </h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                လစဉ် အလေ့အကျင့်ဇယား (Monthly Habit Grid) ကို Google Drive သို့ သိမ်းမည်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">ချိတ်ဆက်မှု မအောင်မြင်ပါ</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Content depending on state */}
        {!syncResult ? (
          <div className="mt-4 space-y-4">
            {/* Target Month Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>ရွေးချယ်ထားသော လ</span>
                </span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                  {year} ခုနှစ်၊ {burmeseMonth} ({yearMonth})
                </span>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">Habits စုစုပေါင်း</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-white">
                    {habits.length} ခု
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">ရက်အရေအတွက်</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-white">
                    {daysInMonth} ရက်
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">ပြီးမြောက်မှု ရမှတ်</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {scorePercent}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>ရရှိထားသော တံဆိပ်:</span>
                <span className="font-bold">{medalTierText}</span>
              </div>
            </div>

            {/* Google Drive Sheet Destination Description */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <Table className="w-4 h-4 text-emerald-600" />
                <span>Google Drive Grid Structure အချက်အလက်များ</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Spreadsheet ဖိုင်:</strong>{' '}
                  CEO Aung Min Maw - Daily Execution & Review Tracker
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">သီးသန့် Sheet Tab:</strong>{' '}
                  <code className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono">
                    📅 Habits - {yearMonth}
                  </code>
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-100">Format ပုံစံ:</strong> Column များတွင်
                  Day 1 မှ Day {daysInMonth} အထိ နေ့ရက်များနှင့် နေ့အလိုက် အလေ့အကျင့် အမှတ်အသား (✓)၊ ပြီးမြောက်မှု ရာခိုင်နှုန်း (Rate %)၊
                  နေ့စဉ် Summary များကို စနစ်တကျ ဇယားဆွဲတင်ပေးမည်ဖြစ်ပါသည်။
                </li>
              </ul>
            </div>

            {/* Google Authentication Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      currentUser.displayName?.charAt(0) || 'G'
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                      {currentUser.displayName || 'Google User'}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Google အကောင့် မချိတ်ဆက်ရသေးပါ</span>
                </div>
              )}

              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  disabled={isSyncing}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="အကောင့်ထွက်မည်"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn || isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition hover:opacity-90 active:scale-95 shadow-xs"
                >
                  {isSigningIn ? 'ဝင်ရောက်နေသည်...' : 'Google ဖြင့် ဝင်မည်'}
                </button>
              )}
            </div>

            {/* Sync Progress Bar if in progress */}
            {isSyncing && (
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{syncStage}</span>
                  </span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                မလုပ်တော့ပါ (Cancel)
              </button>

              <button
                type="button"
                onClick={handleExecuteSync}
                disabled={isSyncing || isSigningIn}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>သိမ်းဆည်းနေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>အလေ့အကျင့်ဇယား သိမ်းဆည်းမည် (Sync Habits)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="mt-4 space-y-5 animate-fadeIn">
            <div className="text-center py-4 space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Google Sheet သို့ လစဉ် Grid ဇယား အောင်မြင်စွာ တင်ပြီးပါပြီ!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {year} ခုနှစ်၊ {burmeseMonth} အလေ့အကျင့်ဇယားအား Google Drive ရှိ Spreadsheet ထဲတွင် သီးသန့် Tab ဖြင့်
                အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ။
              </p>
            </div>

            {/* Sync Summary Details */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400">Sheet Tab အမည်:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {syncResult.sheetTabName}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400">တင်သွင်းခဲ့သော အလေ့အကျင့်များ:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {syncResult.summary.habitsCount} ခု ({syncResult.summary.daysCount} ရက်စာ)
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/50 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400">လစဉ် ရမှတ် &amp; တံဆိပ်:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {syncResult.summary.scorePercent}% ({syncResult.summary.medal})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">သိမ်းဆည်းခဲ့သည့် အချိန်:</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {syncResult.syncedAt}
                </span>
              </div>
            </div>

            {/* Open in Google Sheets Button */}
            <a
              href={syncResult.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 active:scale-98 transition"
            >
              <span>Google Sheet တွင် ချက်ချင်းဖွင့်ကြည့်ရန် (Open in Drive)</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Done Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setSyncResult(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
              >
                နောက်တစ်ကြိမ် ပြန်သိမ်းမည် (Sync Again)
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
              >
                ပြီးပါပြီ (Done)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
