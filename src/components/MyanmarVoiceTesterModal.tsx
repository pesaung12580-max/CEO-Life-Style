import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Radio,
  Sliders,
  CheckCircle2,
  Moon,
  Sunrise,
  Clock,
  Quote,
  Check,
  AlertTriangle,
  BellRing,
  HelpCircle,
  Headphones,
  Cpu,
  Zap,
  Globe,
} from 'lucide-react';
import {
  BURMESE_VOICE_PERSONAS,
  VoicePersona,
  speakBurmese,
  stopBurmeseSpeech,
  isSpeechSynthesisSupported,
  getVoicePersona,
  getSavedVoicePersonaId,
  saveSelectedVoicePersonaId,
  getSavedVoiceModel,
  saveSelectedVoiceModel,
  TTS_MODEL_OPTIONS,
  getBurmeseTtsAudioUrl,
  checkMyanmarVoiceStatus,
  unlockAudioContext,
} from '../services/speechSynthesisService';
import { playChimeSequence } from '../services/alarmAudio';
import { VoicePersonaId, TtsModelType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVoiceChanged?: (personaId: VoicePersonaId) => void;
  onModelChanged?: (model: TtsModelType) => void;
}

export const MyanmarVoiceTesterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onVoiceChanged,
  onModelChanged,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<VoicePersonaId>(() =>
    getSavedVoicePersonaId()
  );
  const [selectedModel, setSelectedModel] = useState<TtsModelType>(() =>
    getSavedVoiceModel()
  );
  const [customText, setCustomText] = useState<string>(
    'ကိုမင်းမော် အိပ်ချိန်ရောက်ပါပြီ၊ နားလိုက်ပါတော့ ခင်ဗျာ။ မနက်ဖြန်အတွက် အားအင်ပြည့်ဝစေဖို့ အိပ်ရာဝင်လိုက်ပါတော့။'
  );
  const [pitch, setPitch] = useState<number>(0.85);
  const [rate, setRate] = useState<number>(0.95);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activePhraseKey, setActivePhraseKey] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [audioErrorNotice, setAudioErrorNotice] = useState<string | null>(null);
  const [showTroubleshooter, setShowTroubleshooter] = useState<boolean>(false);
  const [testChimePlaying, setTestChimePlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPersona = getVoicePersona(selectedPersonaId);
  const voiceDiagnostics = checkMyanmarVoiceStatus();

  // Sync pitch and rate when switching persona
  useEffect(() => {
    const p = getVoicePersona(selectedPersonaId);
    setPitch(p.defaultPitch);
    setRate(p.defaultRate);
  }, [selectedPersonaId]);

  // Clean up on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopBurmeseSpeech();
      setIsSpeaking(false);
      setActivePhraseKey(null);
      setAudioErrorNotice(null);
    } else {
      unlockAudioContext();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleSelectPersona = (id: VoicePersonaId) => {
    setSelectedPersonaId(id);
    saveSelectedVoicePersonaId(id);
    const persona = getVoicePersona(id);
    setPitch(persona.defaultPitch);
    setRate(persona.defaultRate);
    setCustomText(persona.sampleText);
    if (onVoiceChanged) {
      onVoiceChanged(id);
    }
    showToast(`"${persona.nameMm.split('(')[0].trim()}" (${persona.geminiVoiceName}) ကို သတ်မှတ်လိုက်ပါပြီ!`);
  };

  const handleSelectModel = (model: TtsModelType) => {
    setSelectedModel(model);
    saveSelectedVoiceModel(model);
    if (onModelChanged) {
      onModelChanged(model);
    }
    const option = TTS_MODEL_OPTIONS.find((m) => m.id === model);
    showToast(`အသံစနစ်: ${option?.nameMm || model} သို့ ပြောင်းလိုက်ပါပြီ!`);
  };

  const handleSpeakText = (text: string, phraseKey: string = 'custom') => {
    setAudioErrorNotice(null);

    // If already speaking this phrase, stop it
    if (isSpeaking && activePhraseKey === phraseKey) {
      stopBurmeseSpeech();
      setIsSpeaking(false);
      setActivePhraseKey(null);
      return;
    }

    stopBurmeseSpeech();
    setIsSpeaking(true);
    setActivePhraseKey(phraseKey);
    unlockAudioContext();

    speakBurmese(text, {
      personaId: selectedPersonaId,
      model: selectedModel,
      pitch,
      rate,
      onStart: () => {
        setIsSpeaking(true);
        setAudioErrorNotice(null);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setActivePhraseKey(null);
      },
      onError: (err) => {
        setIsSpeaking(false);
        setActivePhraseKey(null);
        console.warn('Speech playback notice:', err);
        setAudioErrorNotice(
          'အသံဖွင့်ရန် အခက်အခဲရှိနေပါက အောက်ပါ စပီကာစမ်းသပ်ခလုတ် သို့မဟုတ် Audio Player ဖြင့် ဖွင့်နားဆင်နိုင်ပါသည်။'
        );
      },
    });
  };

  const handleStopAll = () => {
    stopBurmeseSpeech();
    setIsSpeaking(false);
    setActivePhraseKey(null);
  };

  const handleResetSliders = () => {
    setPitch(currentPersona.defaultPitch);
    setRate(currentPersona.defaultRate);
    showToast('အသံအမြန်နှုန်းနှင့် အသံအမြင့်ကို မူလတန်ဖိုးသို့ ပြန်ထားပါပြီ');
  };

  const handlePlayChimeTest = () => {
    unlockAudioContext();
    setTestChimePlaying(true);
    playChimeSequence();
    showToast('စပီကာ စမ်းသပ်သံ မြည်နေပါသည်... (Chime playing)');
    setTimeout(() => setTestChimePlaying(false), 2000);
  };

  const isFemalePersona = currentPersona.gender === 'woman' || currentPersona.gender === 'girl';

  const PRESET_PHRASES = [
    {
      key: 'bedtime',
      icon: Moon,
      titleMm: 'ညအိပ်ချိန် သတိပေးသံ',
      titleEn: 'Bedtime Alert',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      text:
        selectedPersonaId === 'girl_sweet'
          ? 'ကိုမင်းမော်ရေ... အခု ညအိပ်ချိန် ရောက်ပြီနော်ရှင်! ဒီနေ့တစ်နေ့တာလုံး ပင်ပန်းခဲ့သမျှ အမောတွေပြေသွားအောင် ဖုန်းလေးခဏချပြီး စောစော အိပ်လိုက်တော့နော်ရှင်။ မနက်ဖြန်အတွက် အားမွေးလိုက်ပါရှင်။ ကောင်းသောညလေး ဖြစ်ပါစေရှင်။'
          : selectedPersonaId === 'man_coach'
          ? 'ကိုမင်းမော်ရေ... အခု အိပ်ချိန်ရောက်ပါပြီဗျာ! ဒီနေ့ အကောင်းဆုံး ကြိုးစားခဲ့ပြီးပြီမို့ စိတ်လက်ပေါ့ပါးစွာ အနားယူလိုက်ပါတော့ဗျာ။ ကောင်းကောင်း အနားယူမှ မနက်ဖြန် စွမ်းအင်အပြည့်နဲ့ ရလဒ်ကောင်းတွေ ဖော်ဆောင်နိုင်မှာပါဗျာ။ အိပ်လိုက်ကြစို့ဗျာ!'
          : selectedPersonaId === 'woman_calm'
          ? 'ကိုမင်းမော် စိတ်လက်အေးချမ်းစွာ အနားယူပါတော့ရှင်။ ဒီနေ့တစ်နေ့တာ ပင်ပန်းခဲ့သမျှကို လက်လွှတ်ပြီး နှစ်နှစ်ခြိုက်ခြိုက် အိပ်ပျော်ပါစေရှင်။ ကောင်းသောညပါရှင်။'
          : selectedPersonaId === 'woman_pro'
          ? 'မင်္ဂလာပါ ကိုမင်းမော်ရှင်။ အခု ညအိပ်ရာဝင်ချိန် ရောက်ရှိပါပြီရှင်။ ယနေ့တစ်နေ့တာလုံး ကြိုးစားအားထုတ်ခဲ့မှုတွေအတွက် ဂုဏ်ယူပါတယ်ရှင်။ စိတ်လက်အေးချမ်းစွာ အနားယူလိုက်ပါတော့ရှင်။'
          : 'ကိုမင်းမော် အိပ်ချိန်ရောက်ပါပြီခင်ဗျာ။ ဒီနေ့တစ်နေ့တာ စီမံခန့်ခွဲမှုတွေ အကောင်းဆုံး ပြီးမြောက်ခဲ့ပြီမို့ ဖုန်းခေတ္တချပြီး စိတ်လက်အေးချမ်းစွာ အနားယူလိုက်ပါတော့ဗျာ။ မနက်ဖြန်အတွက် အားအင်မွေးကြပါစို့ဗျာ။ ကောင်းသောညပါခင်ဗျာ။',
    },
    {
      key: 'wakeup',
      icon: Sunrise,
      titleMm: 'မနက်ခင်း နိုးထချိန်',
      titleEn: 'Morning Wakeup',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      text:
        selectedPersonaId === 'girl_sweet'
          ? 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်ရေ! မနက်ခင်း အိပ်ရာထချိန် ရောက်ပြီနော်ရှင်! ဒီနေ့တစ်နေ့တာလုံး စိတ်ချမ်းသာပြီး လန်းဆန်းတက်ကြွပါစေနော်ရှင်! အိပ်ရာထပြီး နေ့သစ်လေးကို အတူတူ စတင်လိုက်ကြရအောင်နော်ရှင်!'
          : selectedPersonaId === 'man_coach'
          ? 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်! နေထွက်ချိန် ရောက်ပြီဗျာ! အိပ်ရာကနေ တက်ကြွစွာ ထပြီး ဒီနေ့ ရည်မှန်းချက်တွေကို အပြည့်အဝ အကောင်အထည်ဖော်ကြစို့ဗျာ!'
          : selectedPersonaId === 'woman_calm'
          ? 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်။ နေရောင်ခြည်နဲ့အတူ နေ့သစ်တစ်ခု စတင်ပါပြီရှင်။ အေးချမ်းတည်ကြည်တဲ့ စိတ်ခွန်အားနဲ့ ဒီနေ့ကို သာယာစွာ စတင်လိုက်ကြပါစို့ရှင်။'
          : selectedPersonaId === 'woman_pro'
          ? 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်ရှင်။ မနက်ခင်း အိပ်ရာထချိန် ရောက်ရှိပါပြီရှင်။ ယနေ့တစ်နေ့တာလုံး အောင်မြင်မှုတွေ အပြည့်အဝ ရရှိပါစေရှင်။ အချိန်ဇယားအတိုင်း အတူတကွ စတင်လိုက်ကြရအောင်ရှင်။'
          : 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်။ မနက်ခင်း အိပ်ရာထချိန် ရောက်ပါပြီဗျာ။ ယနေ့သစ်ကို စိတ်အားထက်သန်စွာနဲ့ အောင်မြင်အောင် စတင်လိုက်ကြရအောင်ဗျာ။',
    },
    {
      key: 'block',
      icon: Clock,
      titleMm: 'အချိန်ဇယား သတိပေးသံ',
      titleEn: 'Focus Block Alert',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text:
        selectedPersonaId === 'girl_sweet'
          ? 'ကိုမင်းမော်ရေ... အခု Focus Deep Work လုပ်ရမယ့် အချိန် ရောက်ပြီနော်ရှင်! စိတ်အေးအေးထားပြီး အာရုံစိုက် လုပ်ကြရအောင်နော်ရှင်!'
          : selectedPersonaId === 'man_coach'
          ? 'ကိုမင်းမော်! အခု Focus Deep Work လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီဗျာ။ အာရုံအပြည့်စိုက်ပြီး အကောင်းဆုံး အကောင်အထည်ဖော်ကြစို့ဗျာ!'
          : selectedPersonaId === 'woman_pro'
          ? 'မင်္ဂလာပါ ကိုမင်းမော်ရှင်။ အခု Focus Deep Work လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီရှင်။ အစီအစဉ်အတိုင်း ဆောင်ရွက်နိုင်ပါပြီရှင်။'
          : selectedPersonaId === 'woman_calm'
          ? 'ကိုမင်းမော် အခု Focus Deep Work လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီရှင်။ အေးချမ်းတည်ကြည်စွာနဲ့ အာရုံစိုက် စတင်လိုက်ကြပါစို့ရှင်။'
          : 'ကိုမင်းမော်ခင်ဗျာ၊ အခု Focus Deep Work လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီဗျာ။ အာရုံစူးစိုက်ပြီး အကောင်းဆုံး စတင်လိုက်ကြရအောင်ခင်ဗျာ။',
    },
    {
      key: 'quote',
      icon: Quote,
      titleMm: 'CEO Affirmation ခွန်အားပေးစကား',
      titleEn: 'Daily Affirmation',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      text: isFemalePersona
        ? 'ယနေ့ သင့်ရဲ့ အောင်မြင်မှုဟာ မနက်ခင်း စတင်ပုံအပေါ် မူတည်ပါတယ်ရှင်။ မလျှော့သော ဇွဲလုံ့လဖြင့် မိမိရည်မှန်းချက်များကို ဆက်လက်ဖော်ဆောင်ကြပါစို့ရှင်။'
        : 'ယနေ့ သင့်ရဲ့ အောင်မြင်မှုဟာ မနက်ခင်း စတင်ပုံအပေါ် မူတည်ပါတယ်ဗျာ။ မလျှော့သော ဇွဲလုံ့လဖြင့် မိမိရည်မှန်းချက်များကို ဆက်လက်ဖော်ဆောင်ကြပါစို့ဗျာ။',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-rose-200/80 dark:border-rose-900/60 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 dark:border-slate-800 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  မြန်မာအသံ စမ်းသပ်ခန်း (Myanmar Voice Studio)
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>Gemini 3.8 Flash AI Engine</span>
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                အသံထွက်အကြည်လင်ဆုံး Gemini Studio AI ဖြင့် မြန်မာအသံ ၅ မျိုးကို စမ်းသပ်နားဆင်နိုင်ပါသည်
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopAll();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="ပိတ်မည်"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
          {/* Toast Alert */}
          {feedbackToast && (
            <div className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-md animate-bounce flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* AI Model Selector Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-800 border border-rose-200/90 dark:border-rose-900/50 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  TTS အသံထုတ်လုပ်ရေး မော်ဒယ် ရွေးချယ်မှု (AI Audio Engine)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                Studio Quality
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TTS_MODEL_OPTIONS.map((opt) => {
                const isSelected = selectedModel === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectModel(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition active:scale-95 flex flex-col justify-between gap-1 shadow-2xs ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-rose-300 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                        {opt.id === 'gemini-3.8-flash-tts' ? (
                          <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-200' : 'text-rose-500'}`} />
                        ) : opt.id === 'gemini-3.8-flash-lite-tts' ? (
                          <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`} />
                        ) : (
                          <Globe className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        )}
                        <span className="truncate">{opt.nameEn.split(' ')[0]} {opt.nameEn.split(' ')[1]}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />}
                    </div>
                    <span className={`text-[10px] truncate ${isSelected ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              💡 <strong>Gemini 3.8 Flash TTS</strong> သည် စကားလုံး အဖြတ်အတောက်၊ လေယူလေသိမ်းနှင့် မြန်မာအသံထွက် အကြည်လင် အပီသဆုံး အဆင့်မြင့်ဆုံး AI မော်ဒယ်ဖြစ်ပါသည်။
            </p>
          </div>

          {/* Quick Speaker & Hardware Test Bar */}
          <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                  စပီကာနှင့် အသံအတိုးအကျယ် (Volume) စစ်ဆေးရန်
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  အသံမကြားရပါက ဖုန်း/ကွန်ပျူတာ Volume ဖွင့်ထားခြင်း၊ Silent Mode ပိတ်ထားခြင်း ရှိ/မရှိ စစ်ဆေးပါ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayChimeTest}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-xs ${
                testChimePlaying
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>စပီကာ စမ်းသပ်သံ ဖွင့်မည်</span>
            </button>
          </div>

          {/* Error notice if audio playback had trouble */}
          {audioErrorNotice && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{audioErrorNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTroubleshooter(!showTroubleshooter)}
                className="text-[11px] underline font-bold shrink-0 text-rose-600 dark:text-rose-400"
              >
                ဖြေရှင်းနည်းကြည့်ရန်
              </button>
            </div>
          )}

          {/* Currently Active Voice & Live Waveform Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/80 border border-rose-200/90 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="text-3xl p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-rose-100 dark:border-slate-700 shrink-0">
                {currentPersona.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {currentPersona.nameMm}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-2xs">
                    {currentPersona.badgeMm}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                    AI Voice: {currentPersona.geminiVoiceName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {currentPersona.taglineMm}
                </p>
              </div>
            </div>

            {/* Live Audio Status & Waveform */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {isSpeaking ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-[11px] shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>အသံထွက်နေပါသည်...</span>
                  {/* Wave bars */}
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-1 bg-white rounded-full animate-bounce h-3" />
                    <span
                      className="w-1 bg-white rounded-full animate-bounce h-2"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1 bg-white rounded-full animate-bounce h-3.5"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>စမ်းသပ်ရန် အသင့်ရှိသည်</span>
                </div>
              )}

              {isSpeaking && (
                <button
                  onClick={handleStopAll}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold flex items-center gap-1 hover:opacity-90 active:scale-95"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>ရပ်ရန်</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: 5 Kinds of Voices Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>ရွေးချယ်နိုင်သော မြန်မာအသံ ၅ မျိုး (5 Studio AI Voice Styles)</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ကလစ်နှိပ်၍ အသံပြောင်းပါ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BURMESE_VOICE_PERSONAS.map((persona) => {
                const isSelected = selectedPersonaId === persona.id;
                const isThisSpeaking = isSpeaking && activePhraseKey === `sample_${persona.id}`;

                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{persona.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {persona.nameEn}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                persona.gender === 'girl'
                                  ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                                  : persona.gender === 'man'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                            >
                              {persona.badgeMm}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              {persona.nameMm.split('(')[0].trim()}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono font-bold">
                              Gemini {persona.geminiVoiceName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2.5 line-clamp-2">
                      {persona.descriptionMm}
                    </p>

                    {/* Quick Test Sample Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Pitch: {persona.defaultPitch} | Rate: {persona.defaultRate}x
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPersona(persona.id);
                          handleSpeakText(persona.sampleText, `sample_${persona.id}`);
                        }}
                        className={`py-1.5 px-3 rounded-xl font-bold text-[11px] flex items-center gap-1 transition active:scale-95 shadow-2xs ${
                          isThisSpeaking
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-slate-600 hover:bg-rose-50'
                        }`}
                      >
                        {isThisSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>ရပ်ရန်</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>🔊 နားဆင်မည်</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Preset Burmese Test Scenarios */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>အခြေအနေအလိုက် သတိပေးစကားများ နားဆင်ရန် (Preset Phrases)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_PHRASES.map((phrase) => {
                const Icon = phrase.icon;
                const isThisSpeaking = isSpeaking && activePhraseKey === phrase.key;

                return (
                  <button
                    key={phrase.key}
                    type="button"
                    onClick={() => handleSpeakText(phrase.text, phrase.key)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition active:scale-95 ${
                      isThisSpeaking
                        ? 'bg-rose-500 text-white border-rose-600 shadow-md'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isThisSpeaking ? 'bg-white/20 text-white' : phrase.color
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-xs ${
                            isThisSpeaking ? 'text-white' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {phrase.titleMm}
                        </span>
                        {isThisSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 line-clamp-2 ${
                          isThisSpeaking
                            ? 'text-rose-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        "{phrase.text}"
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Text Voice Tester & Direct Audio Fallback */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-rose-500" />
                <span>စိတ်ကြိုက် စာသား ရိုက်ထည့် စမ်းသပ်ရန် (Type Custom Text)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setCustomText(
                    'မင်္ဂလာပါ ကိုမင်းမော်။ ယနေ့တစ်နေ့တာ Dwag Sharing နှင့် လုပ်ငန်းဆောင်တာများ အားလုံး အောင်မြင်ပါစေ ခင်ဗျာ။'
                  )
                }
                className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                နမူနာစာသား ထည့်ရန်
              </button>
            </div>

            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="စမ်းသပ်လိုသည့် မြန်မာစာသားကို ဤနေရာတွင် ရိုက်ထည့်ပါ..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-rose-500"
            />

            {/* Sliders for Pitch and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>အသံအမြင့် (Pitch - အသံစူး/တည်ငြိမ်မှု):</span>
                  <span className="font-mono text-rose-500">{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>အမျိုးသားသံ (0.8)</span>
                  <span>မိန်းကလေးသံ (1.35)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>အသံအမြန်နှုန်း (Speed Rate):</span>
                  <span className="font-mono text-rose-500">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>အေးဆေး (0.84x)</span>
                  <span>တက်ကြွ (1.15x)</span>
                </div>
              </div>
            </div>

            {/* Speak Custom Text Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSpeakText(customText, 'custom_text')}
                disabled={!customText.trim()}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${
                  isSpeaking && activePhraseKey === 'custom_text'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {isSpeaking && activePhraseKey === 'custom_text' ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>အသံ ရပ်တန့်မည် (Stop Playing)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>🔊 Gemini AI မြန်မာအသံထွက် နားဆင်မည် (Play Studio Voice)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetSliders}
                title="အသံချိန်ညှိမှု မူလအတိုင်း ပြန်ထားရန်"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Native HTML5 Audio Player with Gemini Audio Stream */}
            {customText.trim() && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>🔊 တိုက်ရိုက် Audio Player ဖြင့် ဖွင့်နားဆင်ရန် (Direct Player):</span>
                  <span className="text-[10px] text-rose-500 font-bold">24kHz Studio WAV</span>
                </span>
                <audio
                  ref={audioRef}
                  controls
                  className="w-full h-9 rounded-lg"
                  src={getBurmeseTtsAudioUrl(customText, selectedPersonaId, selectedModel)}
                  onPlay={() => {
                    setIsSpeaking(true);
                    setActivePhraseKey('direct_player');
                  }}
                  onPause={() => setIsSpeaking(false)}
                  onEnded={() => {
                    setIsSpeaking(false);
                    setActivePhraseKey(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Engine Status Note & Troubleshooter */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Active Engine:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    Gemini 3.8 Flash TTS Flagship AI (Online & Active)
                  </strong>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowTroubleshooter(!showTroubleshooter)}
                className="text-rose-600 dark:text-rose-400 font-semibold underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>အသံမထွက်ပါက ဖြေရှင်းနည်း</span>
              </button>
            </div>

            {showTroubleshooter && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  အသံနားထောင်လို့ မရပါက အောက်ပါတို့ကို စစ်ဆေးပေးပါ:
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>ဖုန်း သို့မဟုတ် ကွန်ပျူတာ၏ <strong>Volume (အသံအတိုးအကျယ်)</strong> ဖွင့်ထားပါသလား။</li>
                  <li>iPhone / Android တွင် <strong>Silent Switch (အသံတိတ်ခလုတ်)</strong> ပိတ်ထားပါသလား။</li>
                  <li>အထက်ပါ <strong>"စပီကာ စမ်းသပ်သံ ဖွင့်မည်"</strong> ခလုတ်ကို နှိပ်၍ ခေါင်းလောင်းသံ ကြား/မကြား စမ်းသပ်ပါ။</li>
                  <li>Browser Tab ၏ အသံ Mute မဖြစ်နေရန် စစ်ဆေးပေးပါ။</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              လက်ရှိ သတ်မှတ်အသံ: <strong>{currentPersona.nameEn}</strong> ({currentPersona.badgeMm} / {currentPersona.geminiVoiceName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleStopAll();
                onClose();
              }}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>အတည်ပြုပြီး ပိတ်မည် (Done)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
