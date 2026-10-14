import React, { useState, useEffect, useRef } from 'react';
import {
  Quote,
  RefreshCw,
  Heart,
  Sparkles,
  BookHeart,
  X,
  Volume2,
  VolumeX,
  Lightbulb,
  Check,
  Camera,
  Upload,
  Trash2,
  Copy,
  BadgeCheck,
  Crown,
  Dice5,
  Flame,
  Zap,
  Radio,
} from 'lucide-react';
import {
  getCachedMotivation,
  saveCachedMotivation,
  getMotivationHistory,
  getRandomFallbackMotivation,
  toggleMotivationFavorite,
  getMotivationFavorites,
  getCustomAvatar,
  saveCustomAvatar,
  removeCustomAvatar,
} from '../services/storage';
import { CEO_MORNING_AFFIRMATIONS, CeoMorningAffirmation } from '../data/defaults';
import { DailyMotivationState } from '../types';
import {
  speakBurmese,
  stopBurmeseSpeech,
  getVoicePersona,
  getSavedVoicePersonaId,
  saveSelectedVoicePersonaId,
} from '../services/speechSynthesisService';
import { MyanmarVoiceTesterModal } from './MyanmarVoiceTesterModal';

interface Props {
  todayDate: string;
}

type AffirmationCategory = 'all' | 'morning' | 'leadership' | 'discipline' | 'business' | 'gratitude';

export const DailyMotivationCard: React.FC<Props> = ({ todayDate }) => {
  const [motivation, setMotivation] = useState<DailyMotivationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceTester, setShowVoiceTester] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(getCustomAvatar());
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>('all');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load motivation for today
  useEffect(() => {
    const cached = getCachedMotivation(todayDate);
    if (cached) {
      setMotivation(cached);
    } else {
      // Pick an initial inspiring morning affirmation
      const initial = CEO_MORNING_AFFIRMATIONS[0];
      const initialFav = getMotivationFavorites().includes(initial.affirmation);
      const state: DailyMotivationState = {
        date: todayDate,
        message: initial.affirmation,
        author: initial.author,
        takeawayMm: initial.takeaway,
        isFavorite: initialFav,
        source: 'curated',
      };
      setMotivation(state);
      saveCachedMotivation(todayDate, state);
    }
    setFavoritesList(getMotivationFavorites());
    setCustomAvatar(getCustomAvatar());
  }, [todayDate]);

  // Handle uploading user photo
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (PNG သို့မဟုတ် JPG) ကိုသာ ရွေးချယ်ပါ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomAvatar(result);
        saveCustomAvatar(result);
        setShowPhotoModal(false);
        showToast('CEO Aung Min Maw ၏ ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    removeCustomAvatar();
    setCustomAvatar(null);
    setShowPhotoModal(false);
    showToast('ဓာတ်ပုံ ဖယ်ရှားပြီး မူလပုံစံသို့ ပြန်ထားပါသည်');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate / Pick Random Inspiring Affirmation
  const handleRandomAffirmation = () => {
    setLoading(true);

    setTimeout(() => {
      let pool = CEO_MORNING_AFFIRMATIONS;
      if (selectedCategory !== 'all') {
        pool = CEO_MORNING_AFFIRMATIONS.filter((a) => a.category === selectedCategory);
      }

      // Filter out current message
      const available = pool.filter((a) => a.affirmation !== motivation?.message);
      const finalPool = available.length > 0 ? available : pool;
      const picked = finalPool[Math.floor(Math.random() * finalPool.length)];

      const isFav = getMotivationFavorites().includes(picked.affirmation);

      const newState: DailyMotivationState = {
        date: todayDate,
        message: picked.affirmation,
        author: picked.author,
        takeawayMm: picked.takeaway,
        isFavorite: isFav,
        source: 'curated',
      };

      setMotivation(newState);
      saveCachedMotivation(todayDate, newState);
      setLoading(false);
      showToast('နေ့သစ် စိတ်ဓာတ်ခွန်အား Affirmation အသစ် ရယူပြီးပါပြီ!');
    }, 250);
  };

  const handleCategorySelect = (category: AffirmationCategory) => {
    setSelectedCategory(category);
    let pool = CEO_MORNING_AFFIRMATIONS;
    if (category !== 'all') {
      pool = CEO_MORNING_AFFIRMATIONS.filter((a) => a.category === category);
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const isFav = getMotivationFavorites().includes(picked.affirmation);

    const newState: DailyMotivationState = {
      date: todayDate,
      message: picked.affirmation,
      author: picked.author,
      takeawayMm: picked.takeaway,
      isFavorite: isFav,
      source: 'curated',
    };

    setMotivation(newState);
    saveCachedMotivation(todayDate, newState);
  };

  const handleToggleFavorite = () => {
    if (!motivation) return;
    const isNowFav = toggleMotivationFavorite(motivation.message);
    setMotivation({ ...motivation, isFavorite: isNowFav });
    setFavoritesList(getMotivationFavorites());
    showToast(isNowFav ? 'အကြိုက်ဆုံးထဲ သိမ်းဆည်းပြီးပါပြီ ❤️' : 'အကြိုက်ဆုံးမှ ဖယ်ရှားပြီးပါပြီ');
  };

  const handleCopyQuote = async () => {
    if (!motivation) return;
    const textToCopy = `"${motivation.message}"\n— ${motivation.author}\n\nလက်တွေ့ အကောင်အထည်ဖော်မှု: ${motivation.takeawayMm || ''}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('စကားစုအား Clipboard သို့ ကူးယူပြီးပါပြီ 📋');
    } catch {
      showToast('ကူးယူခြင်း မအောင်မြင်ပါ');
    }
  };

  const handleSpeak = () => {
    if (!motivation || typeof window === 'undefined') return;

    if (isSpeaking) {
      stopBurmeseSpeech();
      setIsSpeaking(false);
      return;
    }

    const savedVoiceId = getSavedVoicePersonaId();
    const persona = getVoicePersona(savedVoiceId);
    const isFemale = persona.gender === 'woman' || persona.gender === 'girl';

    // Construct smooth, natural, daily conversational speech in Burmese
    const greeting = isFemale
      ? 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်ရှင်။'
      : 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်ခင်ဗျာ။';
    const affirmationIntro = isFemale
      ? `ယနေ့ သန္နိဋ္ဌာန်ကတော့ "${motivation.message}" ဖြစ်ပါတယ်ရှင်။`
      : `ယနေ့ သန္နိဋ္ဌာန်ကတော့ "${motivation.message}" ဖြစ်ပါတယ်ဗျာ။`;
    const actionTakeaway = isFemale
      ? `အောင်မင်းမော် လက်တွေ့ အကောင်အထည်ဖော်မှုကတော့ - ${motivation.takeawayMm} ဖြစ်ပါတယ်ရှင်။`
      : `အောင်မင်းမော် လက်တွေ့ အကောင်အထည်ဖော်မှုကတော့ - ${motivation.takeawayMm} ဖြစ်ပါတယ်ခင်ဗျာ။`;
    const closing = isFemale
      ? 'ယနေ့တစ်နေ့တာလုံး စိတ်ခွန်အားပြည့်ဝစွာနဲ့ အောင်မြင်မှုတွေ ပိုင်ဆိုင်ပါစေရှင်။'
      : 'ယနေ့တစ်နေ့တာလုံး စိတ်ခွန်အားပြည့်ဝစွာနဲ့ အောင်မြင်အောင် လုပ်ဆောင်ကြပါစို့ဗျာ။';

    const textToSpeak = `${greeting} ${affirmationIntro} ${actionTakeaway} ${closing}`;

    setIsSpeaking(true);
    speakBurmese(textToSpeak, {
      personaId: savedVoiceId,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-rose-500/10 via-rose-100/30 to-amber-50/40 dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900/90 border border-rose-200/80 dark:border-rose-900/50 shadow-sm transition-all">
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-rose-400/15 dark:bg-rose-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-amber-400/15 dark:bg-rose-600/10 blur-xl pointer-events-none" />

        {/* 1. Executive Profile Header with Photo & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* CEO Profile Photo with Executive Luxury Ring */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-md shadow-rose-500/20">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                  {customAvatar ? (
                    <img
                      src={customAvatar}
                      alt="CEO Aung Min Maw"
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    /* Default Executive Portrait Illustration of Aung Min Maw */
                    <div className="w-full h-full bg-gradient-to-b from-slate-700 to-slate-950 flex flex-col items-center justify-center text-white relative">
                      <div className="relative">
                        {/* Glasses & Face Minimalist Executive Icon */}
                        <div className="w-8 h-8 rounded-full bg-rose-200/20 border border-rose-300/40 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-amber-300" />
                        </div>
                      </div>
                      <span className="text-[9px] font-black tracking-wider text-rose-300 mt-0.5">
                        CEO AUNG
                      </span>
                    </div>
                  )}

                  {/* Hover Camera overlay to change photo */}
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    title="CEO ဓာတ်ပုံ ထည့်သွင်း/ပြောင်းလဲရန်"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-2xs cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white drop-shadow-md" />
                  </button>
                </div>
              </div>

              {/* Verified Executive Badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-900"
                title="Verified CEO"
              >
                <BadgeCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* CEO Name & Brand Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>CEO Aung Min Maw</span>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-2xs">
                  Executive
                </span>
              </div>

              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                Founder of Dwag Sharing & Dwag Store
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>နေ့သစ် စတင်ခြင်း ခွန်အား (Morning Affirmation)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Photo Upload / Change Button */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-rose-200/80 dark:border-slate-700 shadow-2xs transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              <span>{customAvatar ? 'ဓာတ်ပုံ ပြောင်းမည်' : 'ဓာတ်ပုံ ထည့်မည်'}</span>
            </button>
          </div>
        </div>

        {/* 2. Affirmation Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar scroll-smooth">
          {[
            { id: 'all', label: '🌟 အားလုံး' },
            { id: 'morning', label: '🌅 မနက်ခင်း စွမ်းအင်' },
            { id: 'leadership', label: '👑 ခေါင်းဆောင်မှု' },
            { id: 'discipline', label: '⚡ စည်းကမ်းနှင့် အာရုံစိုက်မှု' },
            { id: 'business', label: '💼 စီးပွားရေးနှင့် မီဒီယာ' },
            { id: 'gratitude', label: '🙏 ကျေးဇူးသိတတ်မှု' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id as AffirmationCategory)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs shadow-rose-500/30'
                  : 'bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800 border border-rose-100/80 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="my-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 3. Main Affirmation / Daily Quote Body */}
        <div className="relative my-2 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/70 dark:border-rose-950/80 shadow-2xs backdrop-blur-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <Quote className="w-4 h-4 fill-rose-500/20" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-bold tracking-tight">
                "{motivation?.message}"
              </p>

              {motivation?.author && (
                <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>— {motivation.author}</span>
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium">
                    CEO Aung Min Maw Daily Wisdom
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Practical Takeaway for CEO */}
        {motivation?.takeawayMm && (
          <div className="mt-2.5 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 shadow-2xs">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              <strong className="text-amber-700 dark:text-amber-400 mr-1.5 font-bold">
                CEO Aung Min Maw လက်တွေ့ အကောင်အထည်ဖော်မှု:
              </strong>
              {motivation.takeawayMm}
            </p>
          </div>
        )}

        {/* 5. Executive Action Toolbar */}
        <div className="mt-4 pt-3 border-t border-rose-200/50 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Random Generate Button */}
          <button
            onClick={handleRandomAffirmation}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-sm shadow-rose-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Dice5 className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />
            <span>Affirmation အသစ် ရယူမည်</span>
          </button>

          {/* Right: Copy, Audio, Favorites Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Audio Voice readout */}
            {'speechSynthesis' in window && (
              <button
                onClick={handleSpeak}
                title={isSpeaking ? 'အသံရပ်ရန်' : 'စကားစုကို အသံဖြင့် နားထောင်ရန်'}
                className={`p-2 rounded-xl text-xs font-medium transition active:scale-95 flex items-center gap-1 ${
                  isSpeaking
                    ? 'text-rose-600 bg-rose-100 dark:bg-rose-950 animate-pulse'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-100/60 dark:text-slate-300 dark:hover:bg-rose-900/40'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden sm:inline text-[11px]">နားထောင်မည်</span>
              </button>
            )}

            {/* Myanmar Voice Studio (5 Voices) Button */}
            <button
              onClick={() => setShowVoiceTester(true)}
              title="မြန်မာအသံ စမ်းသပ်ခန်း (5 Voice Styles) ဖွင့်ရန်"
              className="p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100/60 dark:text-rose-400 dark:hover:bg-rose-900/40 transition active:scale-95 flex items-center gap-1 border border-rose-200/60 dark:border-rose-900/40"
            >
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="text-[11px] font-bold">🎙️ အသံ ၅ မျိုး</span>
            </button>

            {/* Copy Quote Button */}
            <button
              onClick={handleCopyQuote}
              title="စကားစု ကူးယူရန်"
              className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-100/60 dark:text-slate-300 dark:hover:bg-rose-900/40 transition active:scale-95 flex items-center gap-1 text-xs"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">ကူးယူမည်</span>
            </button>

            {/* Favorite toggle button */}
            <button
              onClick={handleToggleFavorite}
              title={motivation?.isFavorite ? 'အကြိုက်ဆုံးမှ ပြန်ဖယ်ရန်' : 'အကြိုက်ဆုံးအဖြစ် သိမ်းရန်'}
              className={`p-2 rounded-xl transition active:scale-95 ${
                motivation?.isFavorite
                  ? 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/60'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 dark:hover:text-rose-300 dark:hover:bg-rose-900/40'
              }`}
            >
              <Heart className={`w-4 h-4 ${motivation?.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {/* View Favorites button */}
            <button
              onClick={() => {
                setFavoritesList(getMotivationFavorites());
                setShowFavoritesModal(true);
              }}
              title="သိမ်းဆည်းထားသော မက်ဆေ့ခ်ျများ"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-100/60 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-900/40 transition active:scale-95"
            >
              <BookHeart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo Management Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  CEO Aung Min Maw ဓာတ်ပုံ စီမံရန်
                </h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 flex flex-col items-center text-center">
              {/* Photo Preview Circle */}
              <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-xl mb-4">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center">
                  {customAvatar ? (
                    <img
                      src={customAvatar}
                      alt="CEO Aung Min Maw Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-rose-300">
                      <Crown className="w-8 h-8 text-amber-300 mb-1" />
                      <span className="text-[10px] font-bold">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                CEO Aung Min Maw Profile Photo
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                သင့်ဖုန်း သို့မဟုတ် ကွန်ပျူတာထဲမှ ဓာတ်ပုံ (Prifile Photo v -1.png) ကို ရွေးချယ်၍ လှပစွာ တင်နိုင်ပါသည်
              </p>

              {/* Upload Trigger Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-rose-500/30 transition active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>ဓာတ်ပုံအသစ် ရွေးချယ်တင်မည် (Select Photo)</span>
              </button>

              {/* Remove photo option if custom exists */}
              {customAvatar && (
                <button
                  onClick={handleRemovePhoto}
                  className="mt-2 w-full py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ဓာတ်ပုံ ဖယ်ရှားမည် (Reset)</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPhotoModal(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              ပိတ်ရန်
            </button>
          </div>
        </div>
      )}

      {/* Favorites List Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  အကြိုက်ဆုံး ခေါင်းဆောင်မှု စကားစုများ ({favoritesList.length})
                </h3>
              </div>
              <button
                onClick={() => setShowFavoritesModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {favoritesList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  သိမ်းဆည်းထားသော စကားစု မရှိသေးပါ။ နှလုံးသားပုံစံ icon ကို နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်။
                </div>
              ) : (
                favoritesList.map((fav, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700/60 relative group"
                  >
                    <p className="text-xs text-slate-700 dark:text-slate-200 pr-6 leading-relaxed">
                      "{fav}"
                    </p>
                    <button
                      onClick={() => {
                        toggleMotivationFavorite(fav);
                        setFavoritesList(getMotivationFavorites());
                        if (motivation?.message === fav) {
                          setMotivation({ ...motivation, isFavorite: false });
                        }
                      }}
                      title="ဖယ်ထုတ်ရန်"
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowFavoritesModal(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              ပိတ်ရန်
            </button>
          </div>
        </div>
      )}

      {/* 5 Burmese Voice Tester Studio Modal */}
      <MyanmarVoiceTesterModal
        isOpen={showVoiceTester}
        onClose={() => setShowVoiceTester(false)}
        onVoiceChanged={(id) => saveSelectedVoicePersonaId(id)}
      />
    </>
  );
};
