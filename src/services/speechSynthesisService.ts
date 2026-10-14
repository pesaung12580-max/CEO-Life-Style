// High-Definition Burmese (Myanmar) Voice & Text-to-Speech Engine
// Features Studio-Grade Gemini AI Audio Support:
// 1. Flagship Gemini 3.8 Flash TTS AI Engine (/api/burmese-tts with 'gemini-3.8-flash-tts')
//    - Studio quality 24kHz audio, authentic Burmese pronunciation, natural human cadence & pauses
// 2. High-Efficiency Gemini 3.8 Flash-Lite TTS ('gemini-3.8-flash-lite-tts')
// 3. Google Web TTS stream fallback
// 4. Web Speech API (SpeechSynthesis) browser fallback
// 5. 5 Distinct Voice Personas (Ko Phyo, Ma Su, May, Ko Ye, Ma Hnin) mapped to Gemini prebuilt AI voices

import { ActiveAlarmPayload, VoicePersonaId, TtsModelType } from '../types';

export interface VoicePersona {
  id: VoicePersonaId;
  nameMm: string;
  nameEn: string;
  gender: 'man' | 'girl' | 'woman';
  avatar: string;
  badgeMm: string;
  taglineMm: string;
  descriptionMm: string;
  geminiVoiceName: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck' | 'Charon';
  aiRoleMm: string;
  defaultPitch: number;
  defaultRate: number;
  recommendedGender: 'male' | 'female';
  sampleText: string;
}

export const BURMESE_VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'man_executive',
    nameMm: 'ကိုဖြိုး (ခန့်ညားသော CEO ခေါင်းဆောင် အမျိုးသားအသံ)',
    nameEn: 'Ko Phyo (Executive Gentleman / CEO)',
    gender: 'man',
    avatar: '👨‍💼',
    badgeMm: 'အမျိုးသား (Man - ခင်ဗျာ/ဗျာ)',
    taglineMm: 'တည်ကြည်လေးနက်ပြီး အမှုဆောင်အရာရှိဆန်သော အသံ',
    descriptionMm: 'လုပ်ငန်းခွင် စီမံခန့်ခွဲမှုနှင့် အရေးကြီးသတိပေးချက်များအတွက် အထူးသင့်လျော်သော တည်ကြည်သော အမျိုးသားအသံ။',
    geminiVoiceName: 'Fenrir',
    aiRoleMm: 'Gemini AI Voice: Fenrir (Authoritative Executive Male)',
    defaultPitch: 0.85,
    defaultRate: 0.95,
    recommendedGender: 'male',
    sampleText: 'ကိုမင်းမော် အိပ်ချိန်ရောက်ပါပြီခင်ဗျာ။ ဒီနေ့တစ်နေ့တာအတွက် ကောင်းမွန်စွာ အနားယူလိုက်ပါတော့ဗျာ။ မနက်ဖြန်အတွက် အားအင်မွေးကြပါစို့ဗျာ။',
  },
  {
    id: 'woman_pro',
    nameMm: 'မစု (ယဉ်ကျေးကျွမ်းကျင်သော အမျိုးသမီးအသံ)',
    nameEn: 'Ma Su (Professional Woman)',
    gender: 'woman',
    avatar: '👩‍💼',
    badgeMm: 'အမျိုးသမီး (Woman - ရှင်)',
    taglineMm: 'ကြည်လင်သန့်ရှင်းပြီး ယဉ်ကျေးဖော်ရွေသော အကူအသံ',
    descriptionMm: 'ရုံးခန်းနှင့် နေ့စဉ်အချိန်ဇယား သတိပေးချက်များအတွက် ကြည်လင်ယဉ်ကျေးသော အမျိုးသမီးလက်ထောက်သံ။',
    geminiVoiceName: 'Kore',
    aiRoleMm: 'Gemini AI Voice: Kore (Clear Professional Female)',
    defaultPitch: 1.0,
    defaultRate: 1.0,
    recommendedGender: 'female',
    sampleText: 'မင်္ဂလာပါ ကိုမင်းမော်ရှင်။ အခု အချိန်ဇယား စတင်ချိန် ရောက်ရှိပါပြီရှင်။ အစီအစဉ်အတိုင်း အတူတကွ ဆောင်ရွက်နိုင်ပါပြီရှင်။',
  },
  {
    id: 'girl_sweet',
    nameMm: 'ညီမလေး မေ (ကြည်လင်ချိုသာသော မိန်းကလေးအသံ)',
    nameEn: 'May (Sweet & Cheerful Girl)',
    gender: 'girl',
    avatar: '👧',
    badgeMm: 'မိန်းကလေး (Girl - ရှင်/နော်ရှင်)',
    taglineMm: 'ချိုသာပျူငှာပြီး ချစ်စနိုးနွေးထွေးသော မိန်းကလေးအသံ',
    descriptionMm: 'စိတ်ကို လန်းဆန်းစေပြီး ချိုသာနွေးထွေးစွာ သတိပေးတတ်သော ညီမလေး မိန်းကလေးအသံ။',
    geminiVoiceName: 'Zephyr',
    aiRoleMm: 'Gemini AI Voice: Zephyr (Warm & Sweet Female)',
    defaultPitch: 1.15,
    defaultRate: 1.05,
    recommendedGender: 'female',
    sampleText: 'ကိုမင်းမော်ရေ... အိပ်ချိန်ရောက်ပြီနော်ရှင်! မနက်ဖြန်အတွက် အားမွေးဖို့ ဖုန်းလေးခဏချပြီး စောစော အိပ်လိုက်တော့နော်ရှင်။ ကောင်းသောညလေး ဖြစ်ပါစေရှင်။',
  },
  {
    id: 'man_coach',
    nameMm: 'ကိုရဲ (တက်ကြွခွန်အားပေး နည်းပြအမျိုးသားအသံ)',
    nameEn: 'Ko Ye (Energetic Motivator / Coach)',
    gender: 'man',
    avatar: '🏋️‍♂️',
    badgeMm: 'အမျိုးသား (Man - ဗျာ/ဗျို့)',
    taglineMm: 'စိတ်ဓာတ်တက်ကြွစေပြီး စည်းကမ်းလိုက်နာစေမည့် နည်းပြသံ',
    descriptionMm: 'မနက်ခင်း စောစောထချိန်နှင့် လေ့ကျင့်ခန်း၊ Focus Time များတွင် စိတ်ခွန်အားပြည့်ဝစေမည့် တက်ကြွသော အမျိုးသားအသံ။',
    geminiVoiceName: 'Puck',
    aiRoleMm: 'Gemini AI Voice: Puck (Dynamic & Energetic Male)',
    defaultPitch: 0.95,
    defaultRate: 1.1,
    recommendedGender: 'male',
    sampleText: 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်! နေထွက်ချိန် ရောက်ပြီဗျာ! အိပ်ရာထပြီး ဒီနေ့ပန်းတိုင်တွေကို အပြည့်အဝ အကောင်အထည်ဖော်ကြစို့ဗျာ!',
  },
  {
    id: 'woman_calm',
    nameMm: 'မနှင်း (ငြိမ်းချမ်းညင်သာ အိပ်ချိန်အမျိုးသမီးအသံ)',
    nameEn: 'Ma Hnin (Calm & Soothing Mentor)',
    gender: 'woman',
    avatar: '🧘‍♀️',
    badgeMm: 'အမျိုးသမီး (Woman - ရှင်)',
    taglineMm: 'ညအိပ်ချိန်နှင့် စိတ်လက်အပန်းဖြေချိန်အတွက် အထူးညင်သာသော အသံ',
    descriptionMm: 'စိတ်ဖိစီးမှု လျော့ကျစေပြီး နှစ်ခြိုက်စွာ အိပ်ပျော်စေမည့် တည်ငြိမ်အေးချမ်းသော အသံ။',
    geminiVoiceName: 'Kore',
    aiRoleMm: 'Gemini AI Voice: Kore (Mindful, Soothing & Serene Female)',
    defaultPitch: 0.92,
    defaultRate: 0.9,
    recommendedGender: 'female',
    sampleText: 'စိတ်လက်အေးချမ်းစွာ အနားယူပါတော့ရှင် ကိုမင်းမော်။ ဒီနေ့တစ်နေ့တာ ကြိုးစားခဲ့မှုတွေအတွက် ဂုဏ်ယူပါတယ်ရှင်။ ချိုမြိန်စွာ အိပ်ပျော်ပါစေရှင်။',
  },
];

export const TTS_MODEL_OPTIONS: { id: TtsModelType; nameMm: string; nameEn: string; badge: string; isAi: boolean }[] = [
  {
    id: 'gemini-3.8-flash-tts',
    nameMm: 'Gemini 3.8 Flash TTS (အသံထွက် အကောင်းဆုံး Studio AI)',
    nameEn: 'Gemini 3.8 Flash Flagship Audio AI',
    badge: '🌟 အကောင်းဆုံး AI (Best Quality)',
    isAi: true,
  },
  {
    id: 'gemini-3.8-flash-lite-tts',
    nameMm: 'Gemini 3.8 Flash-Lite TTS (လျင်မြန်သော AI အသံ)',
    nameEn: 'Gemini 3.8 Flash-Lite Fast Audio AI',
    badge: '⚡ အမြန်ဆုံး AI (Fast)',
    isAi: true,
  },
  {
    id: 'google-web',
    nameMm: 'Standard Web Audio (အရန် အသံလိုင်း)',
    nameEn: 'Standard Web Stream Fallback',
    badge: '🌐 Standard Web',
    isAi: false,
  },
];

// Active Audio & Speech states
let activeAudioElement: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let audioContextInstance: AudioContext | null = null;

/**
 * Checks if Web Speech API is supported in current browser
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Retrieves available system voices and caches them
 */
export function getSystemVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  if (cachedVoices.length > 0) return cachedVoices;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

// Preload voices when available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

/**
 * Gets saved voice persona ID from localStorage or defaults to 'man_executive'
 */
export function getSavedVoicePersonaId(): VoicePersonaId {
  try {
    const saved = localStorage.getItem('ceo_selected_voice') as VoicePersonaId;
    if (saved && BURMESE_VOICE_PERSONAS.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {}
  return 'man_executive';
}

/**
 * Saves selected voice persona ID to localStorage
 */
export function saveSelectedVoicePersonaId(id: VoicePersonaId): void {
  try {
    localStorage.setItem('ceo_selected_voice', id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ceo-voice-persona-changed', { detail: { personaId: id } })
      );
    }
  } catch {}
}

/**
 * Gets saved TTS model or defaults to 'gemini-3.8-flash-tts'
 */
export function getSavedVoiceModel(): TtsModelType {
  try {
    const saved = localStorage.getItem('ceo_tts_model') as TtsModelType;
    if (saved && TTS_MODEL_OPTIONS.some((m) => m.id === saved)) {
      return saved;
    }
  } catch {}
  return 'gemini-3.8-flash-tts';
}

/**
 * Saves selected TTS model to localStorage
 */
export function saveSelectedVoiceModel(model: TtsModelType): void {
  try {
    localStorage.setItem('ceo_tts_model', model);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ceo-voice-model-changed', { detail: { model } })
      );
    }
  } catch {}
}

/**
 * Finds persona by ID
 */
export function getVoicePersona(id?: VoicePersonaId): VoicePersona {
  const targetId = id || getSavedVoicePersonaId();
  return BURMESE_VOICE_PERSONAS.find((p) => p.id === targetId) || BURMESE_VOICE_PERSONAS[0];
}

/**
 * Generates direct audio URL for authentic Myanmar TTS via Gemini 3.8 Flash Audio AI
 */
export function getBurmeseTtsAudioUrl(text: string, personaId?: VoicePersonaId, model?: TtsModelType): string {
  const persona = getVoicePersona(personaId);
  const targetModel = model || getSavedVoiceModel();
  const clean = encodeURIComponent(text.trim());
  return `/api/burmese-tts?text=${clean}&persona=${persona.id}&model=${targetModel}&voice=${persona.geminiVoiceName}`;
}

/**
 * Checks system capabilities for Myanmar voice diagnostics
 */
export function checkMyanmarVoiceStatus(): {
  hasSpeechSynthesis: boolean;
  hasBurmeseVoiceInstalled: boolean;
  totalVoicesAvailable: number;
} {
  const hasSpeechSynthesis = isSpeechSynthesisSupported();
  const voices = getSystemVoices();
  const hasBurmeseVoiceInstalled = voices.some(
    (v) =>
      v.lang.toLowerCase().includes('my') ||
      v.name.toLowerCase().includes('myanmar') ||
      v.name.toLowerCase().includes('burmese')
  );

  return {
    hasSpeechSynthesis,
    hasBurmeseVoiceInstalled,
    totalVoicesAvailable: voices.length,
  };
}

/**
 * Formats tailored Burmese speech alert message based on alarm type and voice persona
 */
export function getBurmeseAlarmSpeechText(alarm: ActiveAlarmPayload, personaId?: VoicePersonaId): string {
  const persona = getVoicePersona(personaId);
  const isFemale = persona.gender === 'woman' || persona.gender === 'girl';

  // If a custom speech text is explicitly provided and doesn't match standard defaults,
  // sanitize the polite particles to match the chosen persona gender.
  if (alarm.speechText && !alarm.speechText.includes('မင်္ဂလာပါ ကိုမင်းမော်။ ဒါကတော့') && !alarm.speechText.includes('မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်။ မနက်ခင်း အိပ်ရာထချိန်')) {
    let sanitized = alarm.speechText;
    if (isFemale) {
      sanitized = sanitized
        .replace(/ခင်ဗျာ/g, 'ရှင်')
        .replace(/ပါဗျာ/g, 'ပါရှင်')
        .replace(/နော်ဗျာ/g, 'နော်ရှင်')
        .replace(/ဗျို့/g, 'ရှင်')
        .replace(/ဗျာ/g, 'ရှင်');
    } else {
      sanitized = sanitized
        .replace(/ပါရှင်/g, 'ပါဗျာ')
        .replace(/နော်ရှင်/g, 'နော်ဗျာ')
        .replace(/ရှင်/g, 'ခင်ဗျာ');
    }
    return sanitized;
  }

  switch (alarm.type) {
    case 'bedtime':
      if (persona.id === 'girl_sweet') {
        return 'ကိုမင်းမော်ရေ... အခု ညအိပ်ချိန် ရောက်ပြီနော်ရှင်! ဒီနေ့တစ်နေ့တာလုံး ပင်ပန်းခဲ့သမျှ အမောတွေပြေသွားအောင် ဖုန်းလေးခဏချပြီး စောစော အိပ်လိုက်တော့နော်ရှင်။ မနက်ဖြန်အတွက် အားမွေးလိုက်ပါရှင်။ ကောင်းသောညလေး ဖြစ်ပါစေရှင်။';
      }
      if (persona.id === 'woman_pro') {
        return 'မင်္ဂလာပါ ကိုမင်းမော်ရှင်။ အခု ညအိပ်ရာဝင်ချိန် ရောက်ရှိပါပြီရှင်။ ယနေ့တစ်နေ့တာလုံး ကြိုးစားအားထုတ်ခဲ့မှုတွေအတွက် ဂုဏ်ယူပါတယ်ရှင်။ စိတ်လက်အေးချမ်းစွာ အနားယူလိုက်ပါတော့ရှင်။ မနက်ဖြန် အစီအစဉ်များအတွက် အားအင်မွေးလိုက်ပါတော့ရှင်။';
      }
      if (persona.id === 'woman_calm') {
        return 'ကိုမင်းမော် စိတ်လက်အေးချမ်းစွာ အနားယူပါတော့ရှင်။ ဒီနေ့တစ်နေ့တာ ပင်ပန်းခဲ့သမျှကို လက်လွှတ်ပြီး နှစ်နှစ်ခြိုက်ခြိုက် အိပ်ပျော်ပါစေရှင်။ ကောင်းသောညပါရှင်။';
      }
      if (persona.id === 'man_coach') {
        return 'ကိုမင်းမော်ရေ... အခု အိပ်ချိန်ရောက်ပါပြီဗျာ! ဒီနေ့ အကောင်းဆုံး ကြိုးစားခဲ့ပြီးပြီမို့ စိတ်လက်ပေါ့ပါးစွာ အနားယူလိုက်ပါတော့ဗျာ။ ကောင်းကောင်း အနားယူမှ မနက်ဖြန် စွမ်းအင်အပြည့်နဲ့ ရလဒ်ကောင်းတွေ ဖော်ဆောင်နိုင်မှာပါဗျာ။ အိပ်လိုက်ကြစို့ဗျာ!';
      }
      // default: man_executive
      return 'ကိုမင်းမော် အိပ်ချိန်ရောက်ပါပြီခင်ဗျာ။ ဒီနေ့တစ်နေ့တာ စီမံခန့်ခွဲမှုတွေ အကောင်းဆုံး ပြီးမြောက်ခဲ့ပြီမို့ ဖုန်းခေတ္တချပြီး စိတ်လက်အေးချမ်းစွာ အနားယူလိုက်ပါတော့ဗျာ။ မနက်ဖြန်အတွက် အားအင်မွေးကြပါစို့ဗျာ။ ကောင်းသောညပါခင်ဗျာ။';

    case 'wakeup': {
      if (persona.id === 'girl_sweet') {
        let msg = 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်ရေ! မနက်ခင်း အိပ်ရာထချိန် ရောက်ပြီနော်ရှင်! ဒီနေ့တစ်နေ့တာလုံး စိတ်ချမ်းသာပြီး လန်းဆန်းတက်ကြွပါစေနော်ရှင်! အိပ်ရာထပြီး နေ့သစ်လေးကို အတူတူ စတင်လိုက်ကြရအောင်နော်ရှင်!';
        if (alarm.motivationMessage) {
          msg += ` ဒီနေ့ သန္နိဋ္ဌာန်လေးကတော့ "${alarm.motivationMessage}" ပါတဲ့နော်ရှင်။`;
        }
        return msg;
      }
      if (persona.id === 'woman_pro') {
        let msg = 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်ရှင်။ မနက်ခင်း အိပ်ရာထချိန် ရောက်ရှိပါပြီရှင်။ ယနေ့တစ်နေ့တာလုံး အောင်မြင်မှုတွေ အပြည့်အဝ ရရှိပါစေရှင်။ အချိန်ဇယားအတိုင်း အတူတကွ စတင်လိုက်ကြရအောင်ရှင်။';
        if (alarm.motivationMessage) {
          msg += ` ယနေ့ သန္နိဋ္ဌာန်ကတော့ "${alarm.motivationMessage}" ဖြစ်ပါတယ်ရှင်။`;
        }
        return msg;
      }
      if (persona.id === 'woman_calm') {
        let msg = 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်။ နေရောင်ခြည်နဲ့အတူ နေ့သစ်တစ်ခု စတင်ပါပြီရှင်။ အေးချမ်းတည်ကြည်တဲ့ စိတ်ခွန်အားနဲ့ ဒီနေ့ကို သာယာစွာ စတင်လိုက်ကြပါစို့ရှင်။';
        if (alarm.motivationMessage) {
          msg += ` ယနေ့ သန္နိဋ္ဌာန်ကတော့ "${alarm.motivationMessage}" ဖြစ်ပါတယ်ရှင်။`;
        }
        return msg;
      }
      if (persona.id === 'man_coach') {
        let msg = 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်! နေထွက်ချိန် ရောက်ပြီဗျာ! အိပ်ရာကနေ တက်ကြွစွာ ထပြီး ဒီနေ့ ရည်မှန်းချက်တွေကို အပြည့်အဝ အကောင်အထည်ဖော်ကြစို့ဗျာ!';
        if (alarm.motivationMessage) {
          msg += ` ဒီနေ့ သန္နိဋ္ဌာန်: "${alarm.motivationMessage}" ပါဗျာ!`;
        }
        return msg;
      }
      // default: man_executive
      let msg = 'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်။ မနက်ခင်း အိပ်ရာထချိန် ရောက်ပါပြီဗျာ။ ယနေ့သစ်ကို စိတ်အားထက်သန်စွာနဲ့ အောင်မြင်အောင် စတင်လိုက်ကြရအောင်ဗျာ။';
      if (alarm.motivationMessage) {
        msg += ` ယနေ့ သန္နိဋ္ဌာန်ကတော့ "${alarm.motivationMessage}" ဖြစ်ပါတယ်ခင်ဗျာ။`;
      }
      return msg;
    }

    case 'block':
      if (persona.id === 'girl_sweet') {
        return `ကိုမင်းမော်ရေ... အခု ${alarm.title} လုပ်ရမယ့် အချိန် ရောက်ပြီနော်ရှင်! စိတ်အေးအေးထားပြီး အာရုံစိုက် လုပ်ကြရအောင်နော်ရှင်!`;
      }
      if (persona.id === 'woman_pro') {
        return `မင်္ဂလာပါ ကိုမင်းမော်ရှင်။ အခု ${alarm.title} လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီရှင်။ အစီအစဉ်အတိုင်း ဆောင်ရွက်နိုင်ပါပြီရှင်။`;
      }
      if (persona.id === 'woman_calm') {
        return `ကိုမင်းမော် အခု ${alarm.title} လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီရှင်။ အေးချမ်းတည်ကြည်စွာနဲ့ အာရုံစိုက် စတင်လိုက်ကြပါစို့ရှင်။`;
      }
      if (persona.id === 'man_coach') {
        return `ကိုမင်းမော်! အခု ${alarm.title} လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီဗျာ။ အာရုံအပြည့်စိုက်ပြီး အကောင်းဆုံး အကောင်အထည်ဖော်ကြစို့ဗျာ!`;
      }
      return `ကိုမင်းမော်ခင်ဗျာ၊ အခု ${alarm.title} လုပ်ဆောင်ရမယ့် အချိန် ရောက်ရှိပါပြီဗျာ။ အာရုံစူးစိုက်ပြီး အကောင်းဆုံး စတင်လိုက်ကြရအောင်ခင်ဗျာ။`;

    default:
      if (isFemale) {
        return `မင်္ဂလာပါ ကိုမင်းမော်ရှင်။ ${alarm.title}။ ${alarm.subtitle} ရောက်ရှိပါပြီနော်ရှင်။ စနစ်အားလုံး အဆင်ပြေစွာ အလုပ်လုပ်နေပါပြီရှင်။`;
      }
      return `မင်္ဂလာပါ ကိုမင်းမော်။ ${alarm.title}။ ${alarm.subtitle} ရောက်ရှိပါပြီခင်ဗျာ။ စနစ်အားလုံး အဆင်ပြေစွာ အလုပ်လုပ်နေပါပြီဗျာ။`;
  }
}

export interface SpeakOptions {
  personaId?: VoicePersonaId;
  model?: TtsModelType;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Unlocks Web Audio context and browser audio on user gesture
 */
export function unlockAudioContext(): void {
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextInstance) {
          audioContextInstance = new AudioCtx();
        }
        if (audioContextInstance.state === 'suspended') {
          audioContextInstance.resume();
        }
      }
    }
  } catch {}
}

/**
 * Fallback to Web Speech API (SpeechSynthesis)
 */
function speakViaWebSpeech(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  try {
    const persona = getVoicePersona(options.personaId);
    const utterance = new SpeechSynthesisUtterance(text);

    // Language set to Myanmar
    utterance.lang = 'my-MM';
    utterance.pitch = options.pitch !== undefined ? options.pitch : persona.defaultPitch;
    utterance.rate = options.rate !== undefined ? options.rate : persona.defaultRate;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    const voices = getSystemVoices();
    const myanmarVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('my') ||
        v.name.toLowerCase().includes('myanmar') ||
        v.name.toLowerCase().includes('burmese')
    );
    if (myanmarVoice) {
      utterance.voice = myanmarVoice;
    }

    activeUtterance = utterance;

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      console.warn('Web Speech fallback error:', e);
      if (options.onError) options.onError(e);
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Web Speech API execution failed:', err);
    return false;
  }
}

/**
 * Main Speech Function: Plays Authentic Studio-Quality Burmese Voice with Persona Styling
 * 1. Tries high-definition Gemini 3.8 Flash TTS / Native Audio Stream via /api/burmese-tts
 * 2. If network/server fails, falls back to Web Speech API
 */
export function speakBurmese(text: string, options: SpeakOptions = {}): { stop: () => void } {
  const cleanText = text.trim();
  if (!cleanText) {
    return { stop: () => {} };
  }

  // Stop any ongoing audio or speech
  stopBurmeseSpeech();
  unlockAudioContext();

  const persona = getVoicePersona(options.personaId);
  const model = options.model || getSavedVoiceModel();
  const targetRate = options.rate !== undefined ? options.rate : persona.defaultRate;
  const targetVolume = options.volume !== undefined ? options.volume : 1.0;

  // Primary: Gemini AI Native Audio Engine
  try {
    const audioUrl = getBurmeseTtsAudioUrl(cleanText, persona.id, model);
    const audio = new Audio(audioUrl);
    activeAudioElement = audio;

    // Apply persona playback speed (0.75x to 1.5x)
    audio.playbackRate = Math.min(Math.max(targetRate, 0.75), 1.5);
    audio.volume = Math.min(Math.max(targetVolume, 0), 1.0);

    let hasEnded = false;

    audio.onplay = () => {
      if (options.onStart) options.onStart();
    };

    audio.onended = () => {
      if (hasEnded) return;
      hasEnded = true;
      activeAudioElement = null;
      if (options.onEnd) options.onEnd();
    };

    audio.onerror = (err) => {
      console.warn('Native Gemini Burmese TTS audio failed, trying Web Speech fallback...', err);
      activeAudioElement = null;
      const fallbackSuccess = speakViaWebSpeech(cleanText, options);
      if (!fallbackSuccess && options.onError) {
        options.onError(err);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play prevented (autoplay policy or network):', err);
        // Attempt Web Speech fallback
        const fallbackSuccess = speakViaWebSpeech(cleanText, options);
        if (!fallbackSuccess && options.onError) {
          options.onError(err);
        }
      });
    }

    return {
      stop: () => stopBurmeseSpeech(),
    };
  } catch (err) {
    console.warn('Native audio init failed, attempting Web Speech fallback...', err);
    speakViaWebSpeech(cleanText, options);
    return {
      stop: () => stopBurmeseSpeech(),
    };
  }
}

/**
 * Stops any ongoing Burmese speech synthesis or audio playback
 */
export function stopBurmeseSpeech(): void {
  // Stop native audio
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch {}
    activeAudioElement = null;
  }

  // Stop Web Speech API
  if (isSpeechSynthesisSupported()) {
    try {
      activeUtterance = null;
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Returns whether speech synthesis or Burmese audio is actively playing
 */
export function isSpeakingBurmese(): boolean {
  if (activeAudioElement && !activeAudioElement.paused) {
    return true;
  }
  if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
    return true;
  }
  return false;
}

/**
 * Preloads audio for common alarm phrases so it triggers instantly with zero delay
 */
export function preloadAlarmAudios(): void {
  if (typeof window === 'undefined') return;

  const defaultPhrases = [
    'ကိုမင်းမော် အိပ်ချိန်ရောက်ပါပြီ၊ နားလိုက်ပါတော့ ခင်ဗျာ။',
    'မင်္ဂလာနံနက်ခင်းပါ ကိုမင်းမော်။ မနက်ခင်း အိပ်ရာထချိန် ရောက်ပါပြီ။',
  ];

  defaultPhrases.forEach((phrase) => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = getBurmeseTtsAudioUrl(phrase);
    } catch {}
  });
}
