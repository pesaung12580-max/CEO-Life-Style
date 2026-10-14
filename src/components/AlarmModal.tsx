import React, { useEffect, useState } from 'react';
import {
  Bell,
  Clock,
  Moon,
  Sunrise,
  Quote,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Radio,
} from 'lucide-react';
import { ActiveAlarmPayload, VoicePersonaId } from '../types';
import { startAlarmLoop, stopAlarmLoop } from '../services/alarmAudio';
import {
  speakBurmese,
  stopBurmeseSpeech,
  getBurmeseAlarmSpeechText,
  isSpeechSynthesisSupported,
  BURMESE_VOICE_PERSONAS,
  getVoicePersona,
  getSavedVoicePersonaId,
  saveSelectedVoicePersonaId,
} from '../services/speechSynthesisService';

interface Props {
  alarm: ActiveAlarmPayload | null;
  soundEnabled: boolean;
  voiceAlertsEnabled?: boolean;
  selectedVoiceId?: VoicePersonaId;
  onVoiceChanged?: (newVoiceId: VoicePersonaId) => void;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const AlarmModal: React.FC<Props> = ({
  alarm,
  soundEnabled,
  voiceAlertsEnabled = true,
  selectedVoiceId: initialVoiceId,
  onVoiceChanged,
  onDismiss,
  onSnooze,
}) => {
  const [activeVoiceId, setActiveVoiceId] = useState<VoicePersonaId>(() =>
    initialVoiceId || getSavedVoicePersonaId()
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSupported = isSpeechSynthesisSupported();
  const chimeTimeoutRef = React.useRef<number | null>(null);

  // Sync activeVoiceId if prop changes from Settings
  useEffect(() => {
    const target = initialVoiceId || getSavedVoicePersonaId();
    setActiveVoiceId(target);
  }, [initialVoiceId]);

  useEffect(() => {
    if (!alarm) return;

    // Reset pending timer and stop previous audio
    if (chimeTimeoutRef.current) {
      clearTimeout(chimeTimeoutRef.current);
      chimeTimeoutRef.current = null;
    }
    stopAlarmLoop();
    stopBurmeseSpeech();

    const voiceToUse = initialVoiceId || getSavedVoicePersonaId();
    setActiveVoiceId(voiceToUse);

    // Sequence:
    // Voice alert comes first (no overlapping continuous beeps).
    // After voice alert finishes, then start the alarm chime loop to ensure user wakes up.
    if (voiceAlertsEnabled) {
      const speechText = getBurmeseAlarmSpeechText(alarm, voiceToUse);
      setIsSpeaking(true);
      speakBurmese(speechText, {
        personaId: voiceToUse,
        onStart: () => {
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          if (soundEnabled) {
            chimeTimeoutRef.current = window.setTimeout(() => {
              startAlarmLoop();
            }, 600);
          }
        },
        onError: () => {
          setIsSpeaking(false);
          if (soundEnabled) {
            startAlarmLoop();
          }
        },
      });
    } else if (soundEnabled) {
      startAlarmLoop();
    }

    return () => {
      if (chimeTimeoutRef.current) {
        clearTimeout(chimeTimeoutRef.current);
      }
      stopAlarmLoop();
      stopBurmeseSpeech();
    };
  }, [alarm, soundEnabled, voiceAlertsEnabled, initialVoiceId]);

  if (!alarm) return null;

  const handleDismiss = () => {
    if (chimeTimeoutRef.current) {
      clearTimeout(chimeTimeoutRef.current);
    }
    stopAlarmLoop();
    stopBurmeseSpeech();
    setIsSpeaking(false);
    onDismiss();
  };

  const handleSnooze = () => {
    if (chimeTimeoutRef.current) {
      clearTimeout(chimeTimeoutRef.current);
    }
    stopAlarmLoop();
    stopBurmeseSpeech();
    setIsSpeaking(false);
    onSnooze(5);
  };

  const handleReplayVoice = (overrideVoiceId?: VoicePersonaId) => {
    if (chimeTimeoutRef.current) {
      clearTimeout(chimeTimeoutRef.current);
    }
    stopAlarmLoop();
    stopBurmeseSpeech();

    const vId = overrideVoiceId || activeVoiceId;
    const speechText = getBurmeseAlarmSpeechText(alarm, vId);
    setIsSpeaking(true);
    speakBurmese(speechText, {
      personaId: vId,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        if (soundEnabled) {
          chimeTimeoutRef.current = window.setTimeout(() => {
            startAlarmLoop();
          }, 600);
        }
      },
      onError: () => {
        setIsSpeaking(false);
        if (soundEnabled) {
          startAlarmLoop();
        }
      },
    });
  };

  const handleSwitchVoice = (newVoiceId: VoicePersonaId) => {
    setActiveVoiceId(newVoiceId);
    saveSelectedVoicePersonaId(newVoiceId);
    if (onVoiceChanged) {
      onVoiceChanged(newVoiceId);
    }
    handleReplayVoice(newVoiceId);
  };

  const handleStopVoiceOnly = () => {
    stopBurmeseSpeech();
    setIsSpeaking(false);
    if (soundEnabled) {
      startAlarmLoop();
    }
  };

  const isWakeup = alarm.type === 'wakeup';
  const isBedtime = alarm.type === 'bedtime';
  const currentPersona = getVoicePersona(activeVoiceId);
  const spokenText = getBurmeseAlarmSpeechText(alarm, activeVoiceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border-2 border-rose-400 dark:border-rose-600 text-center relative overflow-hidden">
        {/* Glowing backdrop rings */}
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-rose-500/20 blur-2xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />

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
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          {alarm.title}
        </h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
          {alarm.subtitle}
        </p>

        {/* Voice Alert Active Pill */}
        {voiceAlertsEnabled && speechSupported && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                isSpeaking
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm shadow-rose-500/25 animate-pulse'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-spin' : ''}`} />
              <span>
                {isSpeaking
                  ? 'မြန်မာလို အသံထွက် သတိပေးနေပါသည်...'
                  : 'မြန်မာလို အသံထွက် စနစ် ဖွင့်ထားသည်'}
              </span>
            </div>

            {isSpeaking ? (
              <button
                type="button"
                onClick={handleStopVoiceOnly}
                title="အသံ ရပ်တန့်မည်"
                className="p-1 rounded-full text-rose-500 hover:bg-rose-100 dark:hover:bg-slate-800 transition"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleReplayVoice()}
                title="အသံ ပြန်လည် နားထောင်မည်"
                className="p-1 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Spoken Burmese message transcript box */}
        <div className="my-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/80 to-amber-50/50 dark:from-rose-950/30 dark:to-slate-800/40 border border-rose-200/80 dark:border-rose-900/40 text-left">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                မြန်မာလို သတိပေးစကား ({currentPersona.avatar} {currentPersona.nameEn})
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-normal">
                Gemini AI
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              {isSpeaking && (
                <span className="flex gap-0.5 items-center mr-1">
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </span>
              )}
              <button
                type="button"
                onClick={() => handleReplayVoice()}
                className="py-1 px-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 transition active:scale-95 shadow-2xs"
                title="အသံ ပြန်လည်နားဆင်ရန်"
              >
                <Volume2 className="w-3 h-3" />
                <span>ပြန်နားထောင်မည်</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
            "{spokenText}"
          </p>
        </div>

        {/* 5 Voice Styles Switcher */}
        {voiceAlertsEnabled && (
          <div className="mb-3.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>အသံ ၅ မျိုး ရွေးချယ်နားဆင်ရန် (5 Voice Styles):</span>
              <span className="text-rose-500 font-semibold">{currentPersona.badgeMm}</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              {BURMESE_VOICE_PERSONAS.map((p) => {
                const isSelected = activeVoiceId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSwitchVoice(p.id)}
                    title={`${p.nameEn} - ${p.badgeMm}`}
                    className={`flex-1 py-1 px-1 rounded-xl text-center transition active:scale-95 flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-rose-300'
                    }`}
                  >
                    <span className="text-sm">{p.avatar}</span>
                    <span className="text-[9px] truncate max-w-full">
                      {p.nameEn.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Wake up motivation quote if available and distinct */}
        {alarm.motivationMessage && !isWakeup && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <Quote className="w-3 h-3" />
              <span>ယနေ့ စိတ်ဓာတ်ခွန်အား စကားစု</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "{alarm.motivationMessage}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm shadow-md shadow-rose-500/25 transition active:scale-[0.98]"
          >
            ပိတ်မည် (Dismiss Alarm)
          </button>

          <button
            onClick={handleSnooze}
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-[0.98]"
          >
            ၅ မိနစ် ရွှေ့ဆိုင်းမည် (Snooze 5 Min)
          </button>
        </div>
      </div>
    </div>
  );
};
