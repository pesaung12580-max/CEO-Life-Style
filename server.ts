import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI if API key exists
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Comprehensive Curated Leadership Wisdom pool for CEO persona
const CURATED_CEO_WISDOM = [
  {
    author: 'Steve Jobs (Apple)',
    message: 'ကြီးကျယ်သော ရလဒ်တစ်ခုကို ဖန်တီးနိုင်ရန် တစ်ခုတည်းသော နည်းလမ်းမှာ မိမိလုပ်ဆောင်နေသည့် အလုပ်ကို အမှန်တကယ် မြတ်နိုးတန်ဖိုးထားပြီး အမြင့်မားဆုံး စံနှုန်းများ သတ်မှတ်ထားခြင်း ဖြစ်သည်။',
    takeaway: 'CEO တစ်ဦးအနေဖြင့် ယနေ့ ဦးစားပေးအဓိက အလုပ်များကို ပြတ်သားစွာ ရွေးချယ်ပြီး အာရုံစူးစိုက်မှု အပြည့်ဖြင့် ပြီးမြောက်အောင် ဆောင်ရွက်ပါ။',
  },
  {
    author: 'Jensen Huang (NVIDIA)',
    message: 'ခေါင်းဆောင်မှုဆိုတာ အခက်အခဲများကို မရှောင်လွှဲဘဲ အခြားသူများထက် အကြိမ်ကြိမ် ပိုမိုကြံ့ကြံ့ခံ ရင်ဆိုင်ကျော်လွှားနိုင်စွမ်း ဖြစ်သည်။',
    takeaway: 'ယနေ့ စီးပွားရေးနှင့် လုပ်ငန်းခွင် စိန်ခေါ်မှုများကို တည့်တည့်ရင်ဆိုင်ပြီး အဖွဲ့အစည်းကို ရှေ့ဆောင်လမ်းပြပါ။',
  },
  {
    author: 'Elon Musk (Tesla / SpaceX)',
    message: 'တစ်ခုခုဟာ အမှန်တကယ် အရေးကြီးပါက အောင်မြင်နိုင်ခြေ အလွန်နည်းနေသော်လည်း သင်ဆက်လက် လုပ်ဆောင်ရမည်။',
    takeaway: 'ရေရှည်တန်ဖိုးကြီးမားသော လုပ်ငန်းပန်းတိုင်များအတွက် ယနေ့ မဖြစ်မနေ ပြီးမြောက်ရမည့် အလုပ်ကို ဇွဲမလျှော့ဘဲ ပြီးအောင်လုပ်ပါ။',
  },
  {
    author: 'Jeff Bezos (Amazon)',
    message: 'ပြိုင်ဘက်များကို အာရုံစိုက်မည့်အစား Customer များ၏ အဓိက ပြဿနာကို အကောင်းဆုံး ဖြေရှင်းပေးနိုင်ရန် စွဲစွဲမြဲမြဲ အာရုံစိုက်ပါ။',
    takeaway: 'ထုတ်ကုန်နှင့် ဝန်ဆောင်မှုတိုင်းတွင် သုံးစွဲသူများအတွက် တကယ့်လက်တွေ့ တန်ဖိုးကို ရှေ့တန်းတင်ပါ။',
  },
  {
    author: 'Satya Nadella (Microsoft)',
    message: 'အရာအားလုံးကို သိပြီးသားလူ (Know-it-all) မဖြစ်ပါစေနှင့်၊ အရာရာကို အမြဲ ဆာလောင်စွာ သင်ယူလိုသူ (Learn-it-all) ဖြစ်ပါစေ။',
    takeaway: 'ခေတ်သစ် AI နှင့် စီးပွားရေး နည်းပညာများကို နေ့စဉ် မပျက်မကွက် စူးစမ်းလေ့လာ အသုံးချပါ။',
  },
  {
    author: 'Sam Altman (OpenAI)',
    message: 'ဒီနေ့ခေတ်တွင် အောင်မြင်မှုကို အလျင်မြန်ဆုံး တွန်းပို့ပေးနိုင်သည်မှာ AI ကိရိယာများကို သာမန်ထက် သာလွန်စွာ ကျွမ်းကျင်ပိုင်နိုင်စွာ အသုံးချတတ်ခြင်း ဖြစ်သည်။',
    takeaway: 'နေ့စဉ် လုပ်ငန်းစဉ်များတွင် AI ကိရိယာများကို အသုံးချ၍ အချိန်နှင့် လုပ်အား စွမ်းဆောင်ရည်ကို အမြင့်ဆုံးမြှင့်တင်ပါ။',
  },
  {
    author: 'Andy Grove (Intel)',
    message: 'အောင်မြင်သော အဖွဲ့အစည်းတိုင်းတွင် အရေးကြီးဆုံးမှာ မည်သည့်အရာကို ငြင်းပယ်ရမည်နည်းကို ပြတ်သားစွာ ဆုံးဖြတ်နိုင်စွမ်း (Ruthless Prioritization) ဖြစ်သည်။',
    takeaway: 'ယနေ့ သင့်လုပ်ငန်းတိုးတက်မှုကို အဟန့်အတားဖြစ်စေသော မလိုအပ်သည့် အလုပ်များကို ရဲရဲဝံ့ဝံ့ ငြင်းပယ်လိုက်ပါ။',
  },
  {
    author: 'Ray Dalio (Bridgewater)',
    message: 'နာကျင်မှု ပေါင်း ပြန်လည်သုံးသပ်မှု (Pain + Reflection) သည် တိုးတက်မှု (Progress) ဖြစ်သည်။ အမှားများကို ဖုံးကွယ်မထားဘဲ သင်ခန်းစာ ယူပါ။',
    takeaway: 'ညစဉ် Review တွင် လိုအပ်ချက်များကို ရိုးသားစွာ သုံးသပ်ပြီး မနက်ဖြန်အတွက် ပိုမိုကောင်းမွန်သော မဟာဗျူဟာ ချမှတ်ပါ။',
  },
  {
    author: 'Naval Ravikant (AngelList)',
    message: 'သင်အိပ်ပျော်နေချိန်တွင်ပင် တန်ဖိုးရှာဖွေပေးနိုင်သော Code, Media နှင့် အဖွဲ့အစည်းဆိုင်ရာ Leverage များကို တည်ဆောက်ပါ။',
    takeaway: 'ယနေ့ သင်ဖန်တီးလိုက်သော စနစ်၊ သင်ခန်းစာနှင့် အကြောင်းအရာများသည် နောင်အနာဂတ်အတွက် တန်ဖိုးရှိသော Digital Assets များ ဖြစ်ပါစေ။',
  },
  {
    author: 'Peter Thiel (Founders Fund)',
    message: 'အခြားသူများ မမြင်နိုင်သေးသော လျှို့ဝှက်ချက်နှင့် အခွင့်အလမ်းကို သင်မြင်တွေ့ပါက တွန့်ဆုတ်မနေဘဲ ရှေ့ဆုံးမှ ဦးဆောင် စတင်လိုက်ပါ။',
    takeaway: 'စျေးကွက်ထဲတွင် ထူးခြားသော တန်ဖိုးသစ် ဖန်တီးပေးနိုင်မည့် မဟာဗျူဟာကို ယနေ့ စတင် အကောင်အထည်ဖော်ပါ။',
  },
  {
    author: 'Charlie Munger (Berkshire Hathaway)',
    message: 'နေ့စဉ် အိပ်ရာဝင်ချိန်တွင် မနက်ကထက် နည်းနည်းလေး ပိုမို အသိဉာဏ်ရှိနေပါစေ။ ဒါဟာ ရေရှည် အောင်မြင်မှု၏ လျှို့ဝှက်ချက် ဖြစ်သည်။',
    takeaway: 'နေ့စဉ် Learning Hour တွင် စီးပွားရေးနှင့် ခေါင်းဆောင်မှုဆိုင်ရာ ဗဟုသုတများကို စူးစိုက်လေ့လာပါ။',
  },
  {
    author: 'Warren Buffett (Berkshire Hathaway)',
    message: 'မိမိကိုယ်တိုင်၏ အရည်အသွေးများအပေါ် ရင်းနှီးမြှုပ်နှံခြင်းသည် ကမ္ဘာပေါ်တွင် အမြတ်အစွန်း အများဆုံး ထွက်မည့် အကောင်းဆုံး ရင်းနှီးမြှုပ်နှံမှု ဖြစ်သည်။',
    takeaway: 'CEO အနေဖြင့် မိမိ၏ ဆုံးဖြတ်ချက်ချနိုင်စွမ်း၊ ကျန်းမာရေးနှင့် စိတ်ပိုင်းဆိုင်ရာ ကြံ့ခိုင်မှုကို နေ့စဉ် မြှင့်တင်ပါ။',
  },
  {
    author: 'Mark Zuckerberg (Meta)',
    message: 'အကြီးမားဆုံးသော စွန့်စားမှုမှာ ဘာစွန့်စားမှုမှ မယူဘဲ ငြိမ်နေခြင်းပင် ဖြစ်သည်။ အလျင်အမြန် စတင်ပြီး လက်တွေ့စမ်းသပ်ပါ။',
    takeaway: 'အိုင်ဒီယာသစ်များ ရှိပါက အချိန်ဆွဲမနေဘဲ ယနေ့ စမ်းသပ်ထုတ်လုပ်ပြီး ပရိတ်သတ်ထံ ချပြလိုက်ပါ။',
  },
  {
    author: 'James Clear (Atomic Habits)',
    message: 'သင်သည် သင်၏ ကြီးကျယ်သော ပန်းတိုင်များဆီသို့ ရောက်သွားခြင်းမဟုတ်ဘဲ သင်နေ့စဉ် ကျင့်သုံးသော စည်းကမ်းစနစ် အဆင့်အတန်းဆီသို့သာ ကျဆင်းရောက်ရှိသွားခြင်း ဖြစ်သည်။',
    takeaway: 'ယနေ့ စီစဉ်ထားသော အချိန်ဇယားနှင့် Non-negotiables များကို မဖြစ်မနေ အကောင်အထည်ဖော်ပါ။',
  },
  {
    author: 'Brian Chesky (Airbnb)',
    message: 'လူပေါင်း ၁ သန်းက သာမန်သဘောကျသော အရာတစ်ခုထက် လူပေါင်း ၁ ရာက အမှန်တကယ် စွဲလမ်းချစ်ခင်သော ထုတ်ကုန်တစ်ခုကို တည်ဆောက်ခြင်းက ပိုမို အားကောင်းသည်။',
    takeaway: 'သင့် Customer အယောက် ၁၀၀ အတွက် အကောင်းမွန်ဆုံးသော အတွေ့အကြုံနှင့် ဝန်ဆောင်မှုကို အာရုံစိုက်ပါ။',
  },
  {
    author: 'Phil Knight (Nike)',
    message: 'အခြားသူများက ရူးသွပ်သော အကြံအစည်ဟု ပြောပါစေ၊ သင်ယုံကြည်ပါက စိတ်ဓာတ်မကျဘဲ ဆက်လက်လျှောက်လှမ်းပါ။ Just Do It.',
    takeaway: 'အခက်အခဲများကို စိုးရိမ်မနေဘဲ ယနေ့အတွက် အရေးကြီးဆုံး လုပ်ငန်းစဉ်ကို ရဲရဲဝံ့ဝံ့ စတင်လိုက်ပါ။',
  },
  {
    author: 'Alex Hormozi (Acquisition.com)',
    message: 'လူတွေက အချိန်မရှိကြတာ မဟုတ်ပါ၊ အရေးကြီးဆုံးအရာကို အာရုံမစိုက်နိုင်ကြခြင်းသာ ဖြစ်သည်။ အာရုံစူးစိုက်မှုရှိလျှင် အချိန်သည် လုံလောက်ပါသည်။',
    takeaway: 'Deep Work အချိန်တွင် အနှောင့်အယှက်အားလုံးကို ရှင်းလင်းပြီး ရလဒ်ထွက်မည့် အလုပ်ကိုသာ အာရုံစိုက်ပါ။',
  },
  {
    author: 'Marc Benioff (Salesforce)',
    message: 'ခေါင်းဆောင်တစ်ဦး၏ အဓိကတာဝန်မှာ အဖွဲ့အစည်းအား ရှင်းလင်းပြတ်သားသော ရည်မှန်းချက်၊ ယုံကြည်မှုနှင့် စွမ်းအင်များ ပေးစွမ်းနိုင်ခြင်း ဖြစ်သည်။',
    takeaway: 'ယနေ့ လုပ်ဆောင်ရမည့် ပန်းတိုင်များကို အဖွဲ့သားများအား ပြတ်သားစွာ ရှင်းပြပြီး လမ်းညွှန်မှု ပေးပါ။',
  },
];

function getRandomCuratedWisdom(excludeList: string[] = []) {
  const available = CURATED_CEO_WISDOM.filter((m) => !excludeList.includes(m.message));
  const pool = available.length > 0 ? available : CURATED_CEO_WISDOM;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked;
}

// Endpoint for daily leadership wisdom from successful entrepreneurs aligned with CEO persona
app.post('/api/motivation', async (req, res) => {
  const { history = [] } = req.body;
  const historyList = Array.isArray(history) ? history : [];

  if (!ai) {
    const picked = getRandomCuratedWisdom(historyList);
    return res.status(200).json({
      source: 'curated',
      author: picked.author,
      message: picked.message,
      takeaway: picked.takeaway,
    });
  }

  const historyExclusion =
    historyList.length > 0
      ? `\n\nRecent quotes to strictly NOT repeat:\n${historyList.slice(-6).map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}`
      : '';

  const prompt = `Write ONE distinct, authentic, high-impact leadership wisdom or strategic advice from a globally acclaimed entrepreneur or legendary CEO (e.g., Steve Jobs, Jensen Huang, Elon Musk, Jeff Bezos, Satya Nadella, Sam Altman, Warren Buffett, Charlie Munger, Andy Grove, Phil Knight, Ray Dalio, Brian Chesky, Alex Hormozi).

Persona alignment:
- Strictly align with the 'CEO' persona: decisive execution, ruthlessly high-leverage priorities, extreme focus, and disciplined momentum.

Format criteria:
- Return valid JSON with three keys:
  "author": Name of the entrepreneur and company (e.g. "Jensen Huang (NVIDIA)", "Steve Jobs (Apple)", "Elon Musk (Tesla)", "Sam Altman (OpenAI)")
  "message": The core leadership insight in authoritative, dignified, inspiring Burmese for a CEO (1-2 sentences)
  "takeaway": A direct, high-leverage practical action in Burmese for a CEO's execution today (1 sentence)${historyExclusion}`;

  // Try gemini-3.1-flash-lite first, fallback to gemini-3.5-flash with fast timeout
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.5-flash'];

  for (const model of modelsToTry) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction:
            'You are an executive leadership mentor. Write in natural, dignified, executive Burmese suitable for a CEO. Return clean JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING },
              message: { type: Type.STRING },
              takeaway: { type: Type.STRING },
            },
            required: ['author', 'message', 'takeaway'],
          },
          temperature: 0.9,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 4500)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.message && parsed.author) {
        return res.json({
          source: 'gemini',
          author: parsed.author,
          message: parsed.message,
          takeaway: parsed.takeaway || 'ယနေ့ CEO Aung Min Maw အနေဖြင့် အရေးအကြီးဆုံး ဦးစားပေး လုပ်ငန်းစဉ်ကို ရှင်းလင်းပြတ်သားစွာ ဦးဆောင် အကောင်အထည်ဖော်ပါ။',
        });
      }
    } catch (err: any) {
      console.warn(`Motivation model ${model} failed/timed out:`, err?.status || err?.message?.slice(0, 100));
    }
  }

  // If Gemini calls failed or quota reached, return a fresh curated quote NOT in history
  const picked = getRandomCuratedWisdom(historyList);
  return res.status(200).json({
    source: 'curated',
    author: picked.author,
    message: picked.message,
    takeaway: picked.takeaway,
  });
});

// Endpoint for multi-turn Gemini Chatbot - CEO AI Executive Advisor
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `မင်္ဂလာပါ CEO Aung Min Maw။ ${lastUserMsg ? `"${lastUserMsg.slice(0, 30)}..." နှင့် ပတ်သက်ပြီး ` : ''}ခေါင်းဆောင်မှုနှင့် စီးပွားရေး စီမံခန့်ခွဲမှုတွင် အရေးကြီးဆုံးမှာ ဦးစားပေးအရာများကို ပြတ်သားစွာ ခွဲခြားသတ်မှတ်နိုင်ခြင်း (Extreme Prioritization) နှင့် အာရုံမလွင့်ဘဲ တစိုက်မတ်မတ် အကောင်အထည်ဖော်ခြင်း (Relentless Execution) ဖြစ်ပါသည်။ ယနေ့အတွက် အကျိုးသက်ရောက်မှု အမြင့်မားဆုံး လုပ်ငန်း ၃ ခုကို အာရုံစိုက် ဆောင်ရွက်ပါရန် အကြံပြုအပ်ပါသည်။`,
      });
    }

    // Format messages for @google/genai SDK
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const systemInstruction = `You are an elite Executive Coach and Strategic Business Advisor for CEO Aung Min Maw (ဦးအောင်မင်းမော်), an ambitious and visionary Burmese CEO and content creator/business leader.
Address him respectfully and directly as "CEO Aung Min Maw" (or "CEO ဦးအောင်မင်းမော်").
Language: Natural, professional, inspiring, and fluent Burmese.
Tone: Respectful, sharp, insightful, and high-level executive.
Core topics: High-leverage decision making, ruthless time management, business vision, strategic execution, emotional discipline, and team leadership.
Draw inspiration from legendary entrepreneurs like Steve Jobs, Jensen Huang, Elon Musk, Jeff Bezos, Andy Grove, and Charlie Munger.
Keep responses well-structured, clear, practical, and directly actionable for CEO Aung Min Maw.`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.5-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        const replyText = response.text?.trim();
        if (replyText) {
          return res.json({ reply: replyText });
        }
      } catch (err: any) {
        console.warn(`Chat model ${model} failed:`, err?.status || err?.message?.slice(0, 80));
      }
    }

    return res.json({
      reply: 'မင်္ဂလာပါ CEO Aung Min Maw။ ခေါင်းဆောင်မှုနှင့် စီးပွားရေး မဟာဗျူဟာများတွင် အရေးကြီးဆုံးမှာ ယနေ့အတွက် အမြင့်မားဆုံး အကျိုးသက်ရောက်မှု ရှိစေမည့် အဓိက ဦးစားပေး ၃ ချက်ကို ပြတ်သားစွာ သတ်မှတ်၍ တစိုက်မတ်မတ် အကောင်အထည်ဖော်ခြင်း ဖြစ်ပါသည်။',
    });
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error);
    return res.json({
      reply: 'မင်္ဂလာပါ CEO Aung Min Maw။ ကွန်ရက် သို့မဟုတ် စနစ်ပိုင်း အနည်းငယ် နှောင့်နှေးမှု ရှိနေသော်လည်း ခေါင်းဆောင်မှုဆိုင်ရာ နည်းဗျူဟာနှင့် ဦးစားပေး အစီအစဉ်များကို စဉ်ဆက်မပြတ် ဆက်လက် ဆွေးနွေးနိုင်ပါသည်။',
    });
  }
});

// Endpoint for recommending a high-value YouTube video for Aung Min Maw
app.post('/api/video-recommendation', async (req, res) => {
  try {
    if (!ai) {
      return res.status(200).json({
        source: 'fallback',
        title: 'How to Build a High-Value AI Business & Master Content Creation',
        titleMm: 'AI ခေတ်တွင် တန်ဖိုးမြင့် စီးပွားရေးနှင့် ဗီဒီယိုဖန်တီးမှု နည်းဗျူဟာများ',
        channel: 'Y Combinator',
        url: 'https://www.youtube.com/results?search_query=how+to+build+ai+startup+y+combinator',
        duration: '18 mins',
        category: 'AI & Business',
        takeawayMm: 'အောင်မင်းမော် အတွက် Dwag Sharing နှင့် Dwag Store တွင် AI နည်းပညာကို အသုံးချပြီး ပရိတ်သတ်ထံ တန်ဖိုးအစစ်အမှန် ပေးစွမ်းနိုင်မည့် အဓိက အချက်များ။',
      });
    }

    const prompt = `Recommend ONE specific, world-class YouTube video (or topic from top creators like Ali Abdaal, Y Combinator, Garry Tan, Alex Hormozi, Think Media, Lex Fridman, Huberman Lab) for "အောင်မင်းမော်" (Aung Min Maw) who runs an AI education business and creates Dwag Sharing / Dwag Store videos.
Return valid JSON with:
- "title": English title of the recommended video
- "titleMm": Burmese translated title / topic description
- "channel": Channel name or speaker
- "url": Valid YouTube search or watch URL (e.g., https://www.youtube.com/results?search_query=...)
- "duration": Estimated duration (e.g., "14 mins")
- "category": Category (e.g., "AI & Automation", "Content Creation", "Productivity", "Business")
- "takeawayMm": 1-2 sentence practical benefit in Burmese for Aung Min Maw.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'Provide practical, insightful YouTube recommendations in Burmese for Aung Min Maw. Return JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            titleMm: { type: Type.STRING },
            channel: { type: Type.STRING },
            url: { type: Type.STRING },
            duration: { type: Type.STRING },
            category: { type: Type.STRING },
            takeawayMm: { type: Type.STRING },
          },
          required: ['title', 'titleMm', 'channel', 'url', 'duration', 'category', 'takeawayMm'],
        },
        temperature: 0.75,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      source: 'gemini',
      ...parsed,
    });
  } catch (err: any) {
    console.error('Video recommendation API error:', err);
    return res.status(200).json({
      source: 'fallback',
      title: 'How to Build a High-Value AI Business & Master Content Creation',
      titleMm: 'AI ခေတ်တွင် တန်ဖိုးမြင့် စီးပွားရေးနှင့် ဗီဒီယိုဖန်တီးမှု နည်းဗျူဟာများ',
      channel: 'Y Combinator',
      url: 'https://www.youtube.com/results?search_query=how+to+build+ai+startup+y+combinator',
      duration: '18 mins',
      category: 'AI & Business',
      takeawayMm: 'အောင်မင်းမော် အတွက် Dwag Sharing နှင့် Dwag Store တွင် AI နည်းပညာကို အသုံးချပြီး ပရိတ်သတ်ထံ တန်ဖိုးအစစ်အမှန် ပေးစွမ်းနိုင်မည့် အဓိက အချက်များ။',
    });
  }
});

// Endpoint for AI Brain: 30-Day Non-Negotiables & Performance Analysis for CEO Aung Min Maw
app.post('/api/ai-stats-insights', async (req, res) => {
  try {
    const {
      thirtyDayRate = 0,
      currentStreak = 0,
      bestStreak = 0,
      completedDaysCount = 0,
      habitBreakdown = [],
      recentTrend = [],
      customQuestion,
    } = req.body;

    // Fallback deterministic analysis generator if Gemini is unavailable
    const generateFallbackInsights = () => {
      let grade = 'B+';
      let verdictMm = 'ပုံမှန်အရှိန်အဟုန် ကောင်းမွန်သော စည်းကမ်းစံနှုန်း (Solid Momentum)';

      if (thirtyDayRate >= 80) {
        grade = 'A+';
        verdictMm = 'ထိပ်တန်းအဆင့် ခေါင်းဆောင်မှု စည်းကမ်း (Elite Executive Discipline)';
      } else if (thirtyDayRate >= 65) {
        grade = 'A';
        verdictMm = 'အလွန်ကောင်းမွန်သော တသမတ်တည်းရှိမှု (High Consistency)';
      } else if (thirtyDayRate >= 45) {
        grade = 'B+';
        verdictMm = 'တိုးတက်လျက်ရှိသော အလေ့အကျင့်အရှိန် (Steady Momentum)';
      } else {
        grade = 'B';
        verdictMm = 'ပြန်လည်မြှင့်တင်ရန် လိုအပ်သော ကာလ (Recovery & Re-focus Phase)';
      }

      // Find top performing and lowest performing habits
      const sortedHabits = [...habitBreakdown].sort((a: any, b: any) => (b.rate || 0) - (a.rate || 0));
      const topHabit = sortedHabits[0];
      const lowestHabit = sortedHabits[sortedHabits.length - 1];

      const strengthsMm = [
        topHabit
          ? `"${topHabit.burmeseTitle || topHabit.title}" သည် ${topHabit.rate}% ဖြင့် အားအကောင်းဆုံး တည်ဆောက်ထားနိုင်သော အလေ့အကျင့် ဖြစ်ပါသည်။`
          : 'နေ့စဉ် စတင်မှုများတွင် တသမတ်တည်း လုပ်ဆောင်နိုင်စွမ်း ကောင်းမွန်ပါသည်။',
        `ရက် ၃၀ အတွင်း စုစုပေါင်း ${completedDaysCount} ရက် Streak ပြည့်မီခဲ့ပြီး လက်ရှိ Streak မှာ ${currentStreak} ရက် ရှိနေပါသည်။`,
      ];

      const vulnerabilitiesMm = [
        lowestHabit && lowestHabit.rate < 60
          ? `"${lowestHabit.burmeseTitle || lowestHabit.title}" သည် ${lowestHabit.rate}% သာ ရှိသေးသဖြင့် အထူးပြန်လည် အာရုံစိုက်ရန် လိုအပ်ပါသည်။`
          : 'ညစဉ် Review နှင့် နောက်နေ့ အစီအစဉ်ဆွဲမှုတွင် အချိန်မီ ပြီးမြောက်စေရန် အချက်ပေးသံ သတ်မှတ်ရန် အကြံပြုပါသည်။',
        'တစ်ပတ်တာအတွင်း အားလပ်ရက်များ၌ အလေ့အကျင့် အနည်းငယ် လျော့ရဲတတ်မှုကို သတိပြုသင့်ပါသည်။',
      ];

      const strategicActionPlanMm = [
        'နံနက် ၇:၀၀ - ၉:၀၀ Deep Work တွင် အနှောင့်အယှက်ကင်းစွာဖြင့် အရေးအကြီးဆုံးအလုပ်ကို ဦးစားပေး ပြီးမြောက်အောင် ဆောင်ရွက်ရန်။',
        'Dwag Sharing ဗီဒီယိုနှင့် Dwag Store ရောင်းအား တိုးတက်ရေး အလုပ်ကို နေ့လယ် ၁:၀၀ ရိုက်ကူးရေး မတိုင်မီ အပြီးသတ် စီစဉ်ထားရန်။',
        'ညစဉ် ညဘက် Review သုံးသပ်ချက်ကို အိပ်ရာမဝင်မီ ၈:၀၀ PM တွင် မပျက်မကွက် ပြုလုပ်ပြီး နောက်နေ့ Top 3 Priorities ချမှတ်ရန်။',
      ];

      let answerToQuestion = '';
      if (customQuestion) {
        answerToQuestion = `CEO Aung Min Maw မေးမြန်းထားသော "${customQuestion}" နှင့် ပတ်သက်၍ အဓိက အကြံပြုလိုသည်မှာ - စည်းကမ်းတည်ဆောက်ရာတွင် ပြီးပြည့်စုံလွန်းခြင်းထက် နေ့စဉ် တစိုက်မတ်မတ် (Consistency over Perfection) လုပ်ဆောင်ခြင်းကသာ အနိုင်ရစေမည် ဖြစ်ပါသည်။ ယနေ့အတွက် အရေးကြီးဆုံး ၁ ခုကို မပျက်မကွက် အရင်ဆုံး အပြီးသတ်လိုက်ပါ။`;
      }

      return {
        source: 'deterministic-brain',
        grade,
        verdictMm,
        summaryMm: `လွန်ခဲ့သော ရက် ၃၀ အတွင်း CEO Aung Min Maw ၏ စည်းကမ်းပြည့်မီမှုနှုန်းသည် ${thirtyDayRate}% ရှိခဲ့ပြီး စုစုပေါင်း ${completedDaysCount} ရက် Streak သတ်မှတ်ချက်ကို အောင်မြင်စွာ ပြည့်မီခဲ့ပါသည်။ အကောင်းဆုံး စံချိန်ဟောင်း ${bestStreak} ရက်ကို ကျော်လွန်ရန် နောက်ထပ် ခြေလှမ်းအနည်းငယ်သာ လိုအပ်တော့ပါသည်။`,
        strengthsMm,
        vulnerabilitiesMm,
        strategicActionPlanMm,
        answerToQuestion,
      };
    };

    if (!ai) {
      return res.status(200).json(generateFallbackInsights());
    }

    const promptData = `
CEO Name: CEO Aung Min Maw (founder of Dwag Sharing and Dwag Store)
30-Day Non-Negotiables Consistency Rate: ${thirtyDayRate}%
Total Qualified Days (3+/5 items done): ${completedDaysCount} of 30 days
Current Streak: ${currentStreak} days
All-time Best Streak: ${bestStreak} days
Habit breakdown:
${habitBreakdown.map((h: any) => `- ${h.burmeseTitle} (${h.title}): ${h.completedDays}/30 days (${h.rate}%)`).join('\n')}
Recent trend counts (last few days): ${recentTrend.join(', ')}
${customQuestion ? `Specific User Question to AI Brain: "${customQuestion}"` : ''}

You are the "CEO AI Executive Brain", an elite AI strategic advisor and performance analyst.
Analyze these realistic habit metrics with extreme precision and executive insight in Burmese.

Return STRICT JSON matching this schema:
{
  "grade": "A+" | "A" | "B+" | "B" | "C",
  "verdictMm": "Short authoritative executive verdict in Burmese (e.g., ထိပ်တန်းအဆင့် ခေါင်းဆောင်မှု စည်းကမ်း)",
  "summaryMm": "Deep, inspiring, and sharp 2-3 sentence executive analysis of the past 30 days in Burmese",
  "strengthsMm": ["2-3 specific core strengths observed from the data in Burmese"],
  "vulnerabilitiesMm": ["2-3 critical vulnerabilities or habits that slip most often in Burmese"],
  "strategicActionPlanMm": ["3 concrete, tactical, high-leverage action steps for the next 7 days in Burmese"],
  "answerToQuestion": "Clear, direct, and actionable answer in Burmese if customQuestion was provided, else empty string"
}
`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptData,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.grade && parsed.verdictMm && parsed.summaryMm) {
          return res.json({
            source: 'gemini',
            ...parsed,
          });
        }
      } catch (err: any) {
        console.warn(`AI Stats Insights model ${model} failed:`, err?.status || err?.message?.slice(0, 100));
      }
    }

    return res.json(generateFallbackInsights());
  } catch (error: any) {
    console.error('AI Stats Insights API error:', error);
    return res.status(200).json({
      source: 'fallback',
      grade: 'A',
      verdictMm: 'တသမတ်တည်း အားကောင်းသော ခေါင်းဆောင်မှု စည်းကမ်း',
      summaryMm: 'CEO Aung Min Maw ၏ လွန်ခဲ့သော ရက် ၃၀ စည်းကမ်းပြည့်မီမှုသည် ခိုင်မာသော အရှိန်အဟုန်တွင် ရှိနေပါသည်။ နေ့စဉ် အဓိက အလုပ်များကို ဆက်လက် ထိန်းသိမ်းသွားပါက အကောင်းဆုံး စံချိန်သစ်များကို စိုက်ထူနိုင်ပါလိမ့်မည်။',
      strengthsMm: ['Dwag Sharing ဗီဒီယိုများနှင့် Dwag Store အလုပ်များတွင် စဉ်ဆက်မပြတ် အာရုံစိုက်နိုင်ခြင်း', 'မနက်ခင်း စတင်ချိန်များတွင် စိတ်အားထက်သန်မှု ကောင်းမွန်ခြင်း'],
      vulnerabilitiesMm: ['ညဘက် Review သုံးသပ်ချက်များအား အချိန်မှန် ပြုလုပ်ရန် ဂရုပြုသင့်ခြင်း'],
      strategicActionPlanMm: ['ယနေ့ အရေးအကြီးဆုံး ဦးစားပေး ၃ ချက်ကို နေ့လယ်မတိုင်မီ အပြီးသတ်ရန်', 'ညစဉ် ညဘက် Review အား ၁၀ မိနစ် မပျက်မကွက် အချိန်ပေးရန်'],
      answerToQuestion: '',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`အောင်မင်းမော် Daily Routine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
