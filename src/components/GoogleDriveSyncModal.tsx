import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  ShieldCheck,
  LogOut,
  FolderSync,
  Layers,
  Sparkles,
  ArrowRight,
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
  syncAllDataToGoogleSheets,
  getSavedSpreadsheetUrl,
  getLastSyncTime,
  SyncResult,
} from '../services/googleSheetsSync';
import {
  getAllTrackedDates,
  getAllCeoReviews,
} from '../services/storage';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStage, setSyncStage] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const [savedUrl, setSavedUrl] = useState<string | null>(getSavedSpreadsheetUrl());
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime());

  // Statistics of data to sync
  const trackedDates = getAllTrackedDates();
  const allReviews = getAllCeoReviews();

  useEffect(() => {
    if (isOpen) {
      setCurrentUser(getCurrentUser());
      setSavedUrl(getSavedSpreadsheetUrl());
      setLastSync(getLastSyncTime());
      setErrorMessage(null);

      // Listen for auth state
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
      setSyncResult(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Triggered when user confirms the sync operation
  const handleExecuteSync = async () => {
    setShowConfirmDialog(false);
    setIsSyncing(true);
    setErrorMessage(null);
    setSyncProgress(5);
    setSyncStage('Google Workspace ချိတ်ဆက်မှုကို စစ်ဆေးနေပါသည်...');

    try {
      let token = await getAccessToken();
      if (!token) {
        const signinResult = await googleSignIn();
        if (!signinResult?.accessToken) {
          throw new Error('Google Workspace OAuth access token မရရှိပါ။ ကျေးဇူးပြု၍ ပြန်လည် Sign-in ပြုလုပ်ပါ။');
        }
        token = signinResult.accessToken;
        setCurrentUser(signinResult.user);
      }

      const result = await syncAllDataToGoogleSheets(token, (stage, progress) => {
        setSyncStage(stage);
        setSyncProgress(progress);
      });

      setSyncResult(result);
      setSavedUrl(result.spreadsheetUrl);
      setLastSync(result.syncedAt);
    } catch (err: any) {
      console.error('Sync failed:', err);
      setErrorMessage(err.message || 'Google Drive သို့ သိမ်းဆည်းရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-950/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Google Drive & Sheets Backup
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                CEO Aung Min Maw Daily Execution Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* User Auth Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            {currentUser ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-emerald-300 dark:border-emerald-700 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.displayName || 'Google Account'}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-2 space-y-3">
                <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Google Account ဖြင့် ချိတ်ဆက်ပါ</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  သင်၏ Google Drive ထဲသို့ စာရင်းများကို auto-record ပြုလုပ်ရန် Google Account ဖြင့် Sign-in ပြုလုပ်ပေးပါ။
                </p>

                {/* Google Sign-in button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'ချိတ်ဆက်နေပါသည်...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Data Summary Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Google Sheet သို့ ထည့်သွင်းမည့် ဒေတာများ</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px]">
                {trackedDates.length} ရက်စာ မှတ်တမ်း
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  CEO ညစဉ် သုံးသပ်ချက်များ
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {allReviews.length} စောင်
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Non-Negotiables စာရင်းများ
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {trackedDates.length * 5} ချက်စာ
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Routine Subtasks မှတ်တမ်း
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  5 Blocks စလုံး
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Executive Performance
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  Streaks & Overview
                </span>
              </div>
            </div>
          </div>

          {/* Sync Progress Indicator */}
          {isSyncing && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                  <span>{syncStage}</span>
                </div>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {syncResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Google Drive ထဲသို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                သင်၏ အချက်အလက်များအားလုံးကို "CEO Aung Min Maw - Daily Execution & Review Tracker" စာအုပ်ထဲသို့ စနစ်တကျ ရေးသွင်းပြီးပါပြီ။
              </p>
              <a
                href={syncResult.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-sm"
              >
                <span>Google Sheet ဖွင့်ကြည့်ရန်</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Existing Google Sheet Link if already synced previously */}
          {!syncResult && savedUrl && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  ရှိပြီးသား Google Sheet
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {lastSync ? `နောက်ဆုံးသိမ်းခဲ့ချိန်: ${lastSync}` : 'CEO Aung Min Maw Tracker'}
                </span>
              </div>
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition active:scale-95 shrink-0"
              >
                <span>ကြည့်ရန်</span>
                <ExternalLink className="w-3 h-3 text-emerald-500" />
              </a>
            </div>
          )}
        </div>

        {/* Footer with Sync Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            ပိတ်မည်
          </button>

          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <FolderSync className="w-4 h-4" />
            <span>{isSyncing ? 'သိမ်းဆည်းနေပါသည်...' : 'Google Drive သို့ အကုန်သိမ်းမည်'}</span>
          </button>
        </div>

        {/* Mandatory User Confirmation Modal for Mutating Workspace Operation */}
        {showConfirmDialog && (
          <div className="absolute inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Drive သို့ သိမ်းဆည်းရန် အတည်ပြုပါ
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Confirm Sync to Google Drive
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                CEO Aung Min Maw ၏ နေ့စဉ်မှတ်တမ်းများ ({trackedDates.length} ရက်စာ)၊ ညစဉ် သုံးသပ်ချက်များ ({allReviews.length} စောင်) နှင့် Non-Negotiables စာရင်းများအားလုံးကို Google Drive အတွင်းရှိ Google Sheet စာအုပ်ထဲသို့ အသစ်ဖန်တီး/အပ်ဒိတ်ပြုလုပ် သိမ်းဆည်းပေးမည် ဖြစ်ပါသည်။
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  မလုပ်တော့ပါ (Cancel)
                </button>
                <button
                  onClick={handleExecuteSync}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                >
                  အတည်ပြုသည် (Confirm & Sync)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
