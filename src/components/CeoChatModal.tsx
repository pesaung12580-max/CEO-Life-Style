import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Lightbulb,
  Zap,
  Target,
  Compass,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'ceo_ai_chat_history';

const SUGGESTED_PROMPTS = [
  {
    icon: Target,
    label: 'ယနေ့အတွက် ဦးစားပေး အလုပ် ၃ ခု ရွေးချယ်နည်း',
    prompt: 'CEO တစ်ယောက်အနေနဲ့ ယနေ့အတွက် High-Impact ဖြစ်စေမယ့် ဦးစားပေး အလုပ် ၃ ခုကို ဘယ်လို စံနှုန်းတွေနဲ့ စိစစ်ရွေးချယ်သင့်ပါသလဲ?',
  },
  {
    icon: Zap,
    label: 'အရေးကြီးသော ဆုံးဖြတ်ချက်များ ပြတ်သားစွာ ချမှတ်နည်း',
    prompt: 'အချက်အလက် မပြည့်စုံသေးတဲ့ အခြေအနေမှာ အမှားအနည်းဆုံးနဲ့ အမြန်ဆုံး ဆုံးဖြတ်ချက်ချနိုင်မယ့် CEO Framework တွေကို အကြံပြုပေးပါ။',
  },
  {
    icon: Compass,
    label: 'အချိန်စီမံခန့်ခွဲမှုနှင့် အာရုံမလွင့်စေရန် ထိန်းချုပ်နည်း',
    prompt: 'CEO အနေနဲ့ နေ့စဉ် မလိုအပ်တဲ့ အသေးအမွှား distractions တွေကို ဖြတ်တောက်ပြီး အကျိုးအမြတ်အမြင့်ဆုံး အလုပ်တွေပေါ်မှာပဲ Focus မပြတ်အောင် ဘယ်လို စီမံရမလဲ?',
  },
  {
    icon: Lightbulb,
    label: 'စိတ်ဓာတ်ခွန်အားနှင့် ခေါင်းဆောင်မှု ခံယူချက်',
    prompt: 'အခက်အခဲနဲ့ ဖိစီးမှုတွေ ကြုံလာရချိန်မှာ Steve Jobs ဒါမှမဟုတ် Jensen Huang တို့လို စိတ်ဓာတ်မကျဘဲ စိတ်အေးချမ်းစွာ ရင်ဆိုင်ကျော်လွှားနိုင်မယ့် ခေါင်းဆောင်မှု သဘောတရားကို မျှဝေပေးပါ။',
  },
];

export const CeoChatModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'init-1',
        role: 'model',
        content:
          'မင်္ဂလာပါ CEO Aung Min Maw။ ကျွန်တော်သည် သင်၏ Executive Leadership & Strategic AI Advisor ဖြစ်ပါသည်။ \n\nစီးပွားရေး မဟာဗျူဟာ၊ အချိန်စီမံခန့်ခွဲမှု၊ ပြတ်သားသော ဆုံးဖြတ်ချက်ချမှတ်မှုနှင့် ခေါင်းဆောင်မှု စိတ်ဓာတ်ခွန်အားများအတွက် မည်သည့်အကြောင်းအရာကိုမဆို ဆွေးနွေးမေးမြန်းနိုင်ပါသည်။',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Prepare history payload
      const payload = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: data.reply || 'CEO Aung Min Maw အတွက် အကြံပြုချက်များကို အမြဲ အသင့်ဆွေးနွေးပေးနိုင်ပါသည်။',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content:
          'CEO Aung Min Maw အနေဖြင့် ဦးစားပေးလုပ်ငန်းများကို အမြဲ ရှင်းလင်းပြတ်သားစွာ သတ်မှတ်ထားခြင်းက အကောင်းဆုံး ခေါင်းဆောင်မှု စနစ်ဖြစ်ပါသည်။ ယနေ့အတွက် အရေးအကြီးဆုံး အရာကို အာရုံစိုက် ဆောင်ရွက်လိုက်ပါ။',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content:
          'မင်္ဂလာပါ CEO Aung Min Maw။ ဆွေးနွေးချက်များကို အစပြုပြင်ဆင်ပြီးပါပြီ။ ယနေ့ စီးပွားရေး၊ အချိန်ဇယား သို့မဟုတ် ခေါင်းဆောင်မှု နည်းဗျူဟာများအတွက် မည်သည့်အရာကို ဆွေးနွေးလိုပါသလဲ?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/60 flex flex-col h-[85vh] max-h-[720px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-rose-100 dark:border-rose-950 flex items-center justify-between bg-rose-50/50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  CEO Aung Min Maw AI Advisor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ခေါင်းဆောင်မှုနှင့် မဟာဗျူဟာ အကြံပေး AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="စကားဝိုင်း ပြန်စရန်"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-rose-100/50 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    isUser
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      isUser ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px] font-medium text-slate-500">CEO Aung Min Maw အတွက် စဉ်းစားနေပါသည်...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-rose-50/40 dark:bg-slate-950/40 border-t border-rose-100 dark:border-rose-950/60 overflow-x-auto">
            <div className="flex gap-2">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200/60 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-600 transition shrink-0 active:scale-95"
                  >
                    <Icon className="w-3 h-3 text-rose-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-rose-100 dark:border-rose-950 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="CEO Aung Min Maw အတွက် ခေါင်းဆောင်မှု သို့မဟုတ် နည်းဗျူဟာ မေးမြန်းရန်..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold flex items-center justify-center transition active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
