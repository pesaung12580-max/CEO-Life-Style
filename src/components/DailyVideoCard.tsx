import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Play,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  Bookmark,
  Check,
  CheckCircle2,
  FolderOpen,
  X,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyVideoRecommendation } from '../types';
import {
  getDailyRecommendedVideo,
  saveDailyRecommendedVideo,
  getRandomDifferentVideo,
  getAllPresetVideos,
  getVideoWatchedStatus,
  setVideoWatchedStatus,
} from '../services/storage';

interface Props {
  todayDate: string;
}

export const DailyVideoCard: React.FC<Props> = ({ todayDate }) => {
  const [video, setVideo] = useState<DailyVideoRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const current = getDailyRecommendedVideo(todayDate);
    setVideo(current);
    setIsWatched(getVideoWatchedStatus(todayDate));
  }, [todayDate]);

  const handleToggleWatched = () => {
    const next = !isWatched;
    setIsWatched(next);
    setVideoWatchedStatus(todayDate, next);

    if (next) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#f43f5e', '#fb7185', '#10b981', '#ffffff'],
      });
    }
  };

  const handleFetchNewVideo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/video-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const newVideo: DailyVideoRecommendation = {
          id: `yt-rec-${Date.now()}`,
          title: data.title || 'Mastering AI & Content Creation',
          titleMm: data.titleMm || 'AI ခေတ်တွင် တန်ဖိုးမြင့် စီးပွားရေးနှင့် ဗီဒီယိုဖန်တီးမှု',
          channel: data.channel || 'Y Combinator',
          url: data.url || 'https://www.youtube.com',
          duration: data.duration || '15 mins',
          category: data.category || 'AI & Business',
          takeawayMm: data.takeawayMm || 'အောင်မင်းမော် အတွက် နေ့စဉ် တိုးတက်စေမည့် လက်တွေ့အသုံးချ သင်ခန်းစာ။',
        };
        setVideo(newVideo);
        saveDailyRecommendedVideo(todayDate, newVideo);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback from rich preset list
      if (video) {
        const alt = getRandomDifferentVideo(video.id);
        setVideo(alt);
        saveDailyRecommendedVideo(todayDate, alt);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromLibrary = (chosen: DailyVideoRecommendation) => {
    setVideo(chosen);
    saveDailyRecommendedVideo(todayDate, chosen);
    setShowLibraryModal(false);
  };

  const handleWatchYouTube = () => {
    if (!video) return;
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  const allPresets = getAllPresetVideos();
  const categories = ['All', ...Array.from(new Set(allPresets.map((p) => p.category)))];

  const filteredLibrary = allPresets.filter((v) => {
    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch =
      v.titleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.takeawayMm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!video) return null;

  return (
    <>
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs transition-all relative overflow-hidden">
        {/* Soft gradient accent on corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Youtube className="w-5 h-5 fill-red-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Daily YouTube Recommendation
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  {video.category}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                နေ့စဉ် အကြံပြု YouTube ဗီဒီယို (၁ ရက် ၁ ပုဒ်)
              </h3>
            </div>
          </div>

          {/* Action buttons on top right */}
          <div className="flex items-center gap-1">
            {/* Library button */}
            <button
              onClick={() => setShowLibraryModal(true)}
              title="ဗီဒီယို စာရင်းများ အားလုံး ကြည့်ရန်"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>

            {/* Refresh video button */}
            <button
              onClick={handleFetchNewVideo}
              disabled={loading}
              title="အခြား ဗီဒီယိုတစ်ခု အကြံပြုရန်"
              className="flex items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-[11px] font-medium hidden sm:inline">ဗီဒီယိုအသစ်</span>
            </button>
          </div>
        </div>

        {/* Video Content Block */}
        <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-slate-800/50 border border-rose-100/80 dark:border-slate-800 space-y-2.5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {video.titleMm}
              </h4>
              {isWatched && (
                <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ကြည့်ရှုပြီး</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {video.title}
            </p>
          </div>

          {/* Channel and Duration Metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {video.channel}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{video.duration}</span>
            </span>
          </div>

          {/* Key Takeaway for Aung Min Maw */}
          <div className="pt-2 border-t border-rose-100/80 dark:border-slate-700/60">
            <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-rose-600 dark:text-rose-400 font-semibold mr-1">
                  အောင်မင်းမော် အတွက် သင်ခန်းစာ-
                </strong>
                {video.takeawayMm}
              </p>
            </div>
          </div>
        </div>

        {/* Action Watch & Watched Buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={handleWatchYouTube}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>YouTube တွင် ကြည့်ရှုရန် (Watch on YouTube)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Mark as watched button */}
          <button
            onClick={handleToggleWatched}
            title={isWatched ? 'မကြည့်ရသေးပါအဖြစ် ပြောင်းရန်' : 'ကြည့်ရှုပြီးအဖြစ် မှတ်သားရန်'}
            className={`px-3 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
              isWatched
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isWatched ? 'text-emerald-600 fill-emerald-100' : ''}`} />
            <span className="hidden sm:inline">{isWatched ? 'ကြည့်ရှုပြီး' : 'မှတ်သားရန်'}</span>
          </button>

          {/* Copy URL button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(video.url);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            title="လင့်ခ် ကူးယူရန်"
            className="p-3 rounded-2xl border border-rose-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Recommended Videos Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-rose-100 dark:border-rose-900/40 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  အောင်မင်းမော် အတွက် အကြံပြု ဗီဒီယိုများ ({allPresets.length})
                </h3>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="mt-3 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ဗီဒီယို သို့မဟုတ် သင်ခန်းစာ ရှာဖွေရန်..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium ${
                      selectedCategory === cat
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Video List */}
            <div className="mt-3 overflow-y-auto space-y-2.5 flex-1 pr-1">
              {filteredLibrary.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">ရှာဖွေတွေ့ရှိခြင်း မရှိပါ</p>
              ) : (
                filteredLibrary.map((item) => {
                  const isCurrent = video.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition text-left ${
                        isCurrent
                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                            {item.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {item.titleMm}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.title}</p>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 font-medium">{item.duration}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-semibold">
                        <span>{item.channel}</span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 bg-rose-50/50 dark:bg-slate-800/60 p-2 rounded-xl leading-relaxed">
                        <strong>သင်ခန်းစာ-</strong> {item.takeawayMm}
                      </p>

                      <div className="mt-2.5 flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                          className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        >
                          <Play className="w-3 h-3 fill-red-500" />
                          <span>YouTube တွင် ကြည့်မည်</span>
                        </button>
                        <button
                          onClick={() => handleSelectFromLibrary(item)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>ယနေ့အတွက် ရွေးမည်</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
