import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Flame,
  Award,
  BarChart2,
  TrendingUp,
  Target,
  Sparkles,
  Zap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  getPast30DaysNonNegotiablesStats,
  getCurrentYearMonth,
  getMonthlyHabitTracker,
  ThirtyDayStatsPayload,
  DayHabitStat,
} from '../services/storage';

type ChartMode = 'bar' | 'line';
type TimeRange = 7 | 14 | 30;

interface AiBrainResponse {
  source: string;
  grade: string;
  verdictMm: string;
  summaryMm: string;
  strengthsMm: string[];
  vulnerabilitiesMm: string[];
  strategicActionPlanMm: string[];
  answerToQuestion?: string;
}

export const StatsTab: React.FC = () => {
  const [statsData, setStatsData] = useState<ThirtyDayStatsPayload>(() =>
    getPast30DaysNonNegotiablesStats()
  );
  const [chartMode, setChartMode] = useState<ChartMode>('bar');
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [hoveredDay, setHoveredDay] = useState<DayHabitStat | null>(null);

  // AI Brain state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AiBrainResponse | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentYm = getCurrentYearMonth();
  const monthlyTracker = getMonthlyHabitTracker(currentYm);

  // Reload stats on mount
  useEffect(() => {
    setStatsData(getPast30DaysNonNegotiablesStats());
  }, []);

  // Filter days according to timeRange
  const displayedDays = useMemo(() => {
    const all = statsData.days;
    return all.slice(-timeRange);
  }, [statsData.days, timeRange]);

  // Calculate monthly score
  const [yearStr, monthStr] = currentYm.split('-');
  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const totalMonthlySlots = monthlyTracker.habits.length * daysInMonth;
  const completedMonthlySlots = Object.values(monthlyTracker.checks).filter(Boolean).length;
  const trackerScore = totalMonthlySlots > 0
    ? Math.round((completedMonthlySlots / totalMonthlySlots) * 100)
    : 0;

  // Run AI Brain Analysis
  const handleRunAiAnalysis = async (customQ?: string) => {
    setAiLoading(true);
    try {
      const payload = {
        thirtyDayRate: statsData.streakStats.thirtyDayRate,
        currentStreak: statsData.streakStats.currentStreak,
        bestStreak: statsData.streakStats.bestStreak,
        completedDaysCount: statsData.streakStats.completedDaysCount,
        habitBreakdown: statsData.habitBreakdown,
        recentTrend: statsData.days.slice(-7).map((d) => d.count),
        customQuestion: customQ || customQuestion,
      };

      const response = await fetch('/api/ai-stats-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('API request failed');
      const data: AiBrainResponse = await response.json();
      setAiInsights(data);
      if (customQ) setCustomQuestion('');
      showToast('AI Brain သုံးသပ်ချက် အောင်မြင်စွာ ရယူပြီးပါပြီ 🧠');
    } catch {
      showToast('AI ခေတ္တ အဆင်မပြေသော်လည်း စံနှုန်းများ သုံးသပ်ထားပါသည်');
    } finally {
      setAiLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSpeakAi = () => {
    if (!aiInsights || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `CEO AI Executive Brain သုံးသပ်ချက်။ အဆင့် ${aiInsights.grade}။ ${aiInsights.verdictMm}။ ${aiInsights.summaryMm}။ အဓိက အားသာချက်။ ${aiInsights.strengthsMm.join('။ ')}။ နည်းဗျူဟာ လမ်းညွှန်။ ${aiInsights.strategicActionPlanMm.join('။ ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // SVG Coordinates calculation for Smooth Line Chart
  const svgPoints = useMemo(() => {
    const width = 600;
    const height = 140;
    const paddingX = 15;
    const paddingY = 20;

    const n = displayedDays.length;
    if (n === 0) return { path: '', areaPath: '', coords: [] };

    const stepX = (width - paddingX * 2) / (n - 1 || 1);
    const maxY = 5;

    const coords = displayedDays.map((d, i) => {
      const x = paddingX + i * stepX;
      // Invert y: 5 is at top (paddingY), 0 is at bottom (height - paddingY)
      const y = height - paddingY - (d.count / maxY) * (height - paddingY * 2);
      return { x, y, day: d };
    });

    // Build smooth SVG Bezier curve path
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const midX = (curr.x + next.x) / 2;
      path += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const bottomY = height - paddingY;
    const areaPath = `${path} L ${coords[coords.length - 1].x} ${bottomY} L ${coords[0].x} ${bottomY} Z`;

    return { path, areaPath, coords, targetY: height - paddingY - (3 / maxY) * (height - paddingY * 2) };
  }, [displayedDays]);

  return (
    <div className="space-y-6 pb-28">
      {/* 1. Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-500/15 via-rose-100/40 to-indigo-500/10 dark:from-rose-950/40 dark:via-rose-900/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  CEO Aung Min Maw စွမ်းဆောင်ရည် စာရင်းအင်း
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-2xs">
                  30-Day Analysis
                </span>
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                Past 30 Days Habit Execution & AI Executive Brain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-rose-200/60 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Brain className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>AI Brain Powered</span>
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Streak & Consistency Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Streak */}
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mb-1">
            <Flame className="w-4 h-4 fill-rose-500" />
            <span className="text-[11px] font-bold">လက်ရှိ Streak</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-slate-900 dark:text-white">
              {statsData.streakStats.currentStreak}
            </span>
            <span className="text-xs font-medium text-slate-500">ရက်</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            (မပျက်မကွက် ဆက်တိုက်)
          </p>
        </div>

        {/* Best Streak */}
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-[11px] font-bold">Best Record</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-600 dark:text-amber-400">
              {statsData.streakStats.bestStreak}
            </span>
            <span className="text-xs font-medium text-slate-500">ရက်</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            အမြင့်ဆုံး စံချိန်ဟောင်း
          </p>
        </div>

        {/* 30 Days Rate */}
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-[11px] font-bold">၃၀ ရက် ပျမ်းမျှ</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-rose-600 dark:text-rose-400">
              {statsData.streakStats.thirtyDayRate}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            {statsData.streakStats.completedDaysCount}/30 ရက် ပြည့်မြောက်
          </p>
        </div>

        {/* Monthly Medal */}
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold">ယခုလ ရမှတ်</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-indigo-600 dark:text-indigo-400">
              {trackerScore}%
            </span>
            <span className="text-[11px] font-bold ml-1">
              {trackerScore >= 80 ? '🥇 Gold' : trackerScore >= 50 ? '🥈 Silver' : '🌱 Build'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Goal Tracker အလေ့အကျင့်
          </p>
        </div>
      </div>

      {/* 3. 30-Day Non-Negotiables Completion Chart (Interactive Visualizer) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100/70 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                လွန်ခဲ့သော ရက် ၃၀ စည်းကမ်းပြည့်မီမှု ကားချပ်
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily Non-Negotiables (0-5 Items) နေ့ရက်အလိုက် ပြီးမြောက်မှု ဇယား
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Time range pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
              {[
                { range: 30, label: 'ရက် ၃၀' },
                { range: 14, label: '၁၄ ရက်' },
                { range: 7, label: '၇ ရက်' },
              ].map((t) => (
                <button
                  key={t.range}
                  onClick={() => setTimeRange(t.range as TimeRange)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                    timeRange === t.range
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Chart mode toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setChartMode('bar')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                  chartMode === 'bar'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>တိုင်ကားချပ်</span>
              </button>
              <button
                onClick={() => setChartMode('line')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                  chartMode === 'line'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>မျဉ်းကွေးချပ်</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hovered Day Tooltip Card */}
        {hoveredDay && (
          <div className="my-3 p-3 rounded-2xl bg-rose-50/90 dark:bg-slate-800/90 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  hoveredDay.perfect
                    ? 'bg-amber-400 text-slate-900 font-black'
                    : hoveredDay.qualified
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {hoveredDay.count}/5
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {hoveredDay.weekdayMm}နေ့၊ {hoveredDay.date}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hoveredDay.perfect
                    ? '🌟 ၅ ချက်စလုံး ပြီးမြောက်ခဲ့သော ထူးချွန်နေ့'
                    : hoveredDay.qualified
                    ? '🔥 Streak သတ်မှတ်ချက် ပြည့်မီခဲ့သည် (>=၃ ချက်)'
                    : 'အချက် ၃ ချက် မပြည့်မီခဲ့ပါ'}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400">
              {Math.round((hoveredDay.count / 5) * 100)}%
            </span>
          </div>
        )}

        {/* Chart Viewport */}
        {chartMode === 'bar' ? (
          /* 30-Day Bar Chart View */
          <div className="pt-6 pb-2">
            <div className="relative">
              {/* Target threshold dashed guide line at 3/5 (60%) */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-rose-300 dark:border-rose-800/80 z-0 pointer-events-none flex items-center justify-end"
                style={{ bottom: '60%' }}
              >
                <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 bg-white dark:bg-slate-900 px-1.5 -translate-y-1/2">
                  Target (Streak &ge; 3)
                </span>
              </div>

              {/* Bars Row */}
              <div
                className="grid gap-1 sm:gap-1.5 items-end h-44 z-10 relative"
                style={{
                  gridTemplateColumns: `repeat(${displayedDays.length}, minmax(0, 1fr))`,
                }}
              >
                {displayedDays.map((d, idx) => {
                  const heightPercent = Math.max((d.count / 5) * 100, 6);
                  const isHovered = hoveredDay?.date === d.date;

                  return (
                    <div
                      key={d.date}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setHoveredDay(d)}
                      className="group flex flex-col items-center h-full justify-end cursor-pointer transition-transform active:scale-95"
                    >
                      {/* Bar Container */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-t-lg h-full flex items-end p-0.5 relative">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            d.perfect
                              ? 'bg-gradient-to-t from-rose-500 via-rose-400 to-amber-400 shadow-xs shadow-amber-400/30'
                              : d.qualified
                              ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                              : d.count > 0
                              ? 'bg-rose-300 dark:bg-rose-900/60'
                              : 'bg-transparent'
                          } ${isHovered ? 'ring-2 ring-rose-400 ring-offset-1' : ''}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Day Label */}
                      <span
                        className={`text-[9px] mt-1 text-center font-semibold truncate w-full ${
                          d.qualified
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {d.dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* 30-Day Smooth SVG Line Chart View */
          <div className="pt-4 pb-2">
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox="0 0 600 140"
                className="w-full h-44 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Target Dashed Line at 3/5 */}
                <line
                  x1="15"
                  y1={svgPoints.targetY}
                  x2="585"
                  y2={svgPoints.targetY}
                  stroke="#fb7185"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* Gradient Fill under the line */}
                {svgPoints.areaPath && (
                  <path d={svgPoints.areaPath} fill="url(#lineGrad)" />
                )}

                {/* Smooth Curve Line */}
                {svgPoints.path && (
                  <path
                    d={svgPoints.path}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points on curve */}
                {svgPoints.coords.map((pt, i) => (
                  <g
                    key={pt.day.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDay(pt.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setHoveredDay(pt.day)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.day.perfect ? 5 : pt.day.qualified ? 4 : 3}
                      className={`transition-all duration-200 ${
                        pt.day.perfect
                          ? 'fill-amber-400 stroke-rose-600 stroke-2'
                          : pt.day.qualified
                          ? 'fill-rose-500 stroke-white stroke-2'
                          : 'fill-slate-400 dark:fill-slate-600 stroke-white stroke-1'
                      }`}
                    />
                  </g>
                ))}
              </svg>

              {/* X Axis Labels */}
              <div
                className="grid gap-1 mt-1 text-[9px] text-slate-400 text-center font-medium"
                style={{
                  gridTemplateColumns: `repeat(${displayedDays.length}, minmax(0, 1fr))`,
                }}
              >
                {displayedDays.map((d, i) => (
                  <span
                    key={d.date}
                    className={i % 3 === 0 || i === displayedDays.length - 1 ? 'block' : 'hidden sm:block'}
                  >
                    {d.dayNum}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-rose-500 to-amber-400" />
              <span>၅ ချက်စလုံး ပြည့် (5/5)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Streak ရရှိ (&gt;= ၃ ချက်)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-300 dark:bg-rose-900" />
              <span>&lt; ၃ ချက်</span>
            </span>
          </div>

          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            စံနှုန်း: နေ့စဉ် ၃ ချက်နှင့်အထက် = Streak ရရှိ
          </span>
        </div>
      </div>

      {/* 4. Individual 5 Non-Negotiables Breakdown (30-Day Performance) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              မဖြစ်မနေ ၅ ချက်၏ ရက် ၃၀ စွမ်းဆောင်ရည် အသေးစိတ်
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">၃၀ ရက်အတွင်း</span>
        </div>

        <div className="space-y-3.5">
          {statsData.habitBreakdown.map((h, idx) => (
            <div key={h.id} className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-slate-800/50 border border-rose-100/60 dark:border-slate-800">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {h.burmeseTitle}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 ml-7">
                    {h.title}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black tabular-nums text-rose-600 dark:text-rose-400">
                    {h.rate}%
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {h.completedDays}/30 ရက်
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    h.rate >= 80
                      ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                      : h.rate >= 50
                      ? 'bg-rose-500'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${h.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. "🧠 CEO AI Executive Brain" Section (AI Style & AI Brain) */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-rose-950/80 to-slate-950 text-white border border-rose-500/30 shadow-xl shadow-rose-950/40 overflow-hidden">
        {/* Futuristic glowing neural circuits background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* AI Brain Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-rose-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>CEO AI Executive Brain</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300">
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                ရက် ၃၀ စွမ်းဆောင်ရည်နှင့် အလေ့အကျင့်မှတ်တမ်းများအား AI ဖြင့် သုံးသပ်ခြင်း
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunAiAnalysis()}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'AI Brain လေ့လာနေပါသည်...' : '🧠 AI ဖြင့် စွမ်းဆောင်ရည် သုံးသပ်မည်'}</span>
            </button>
          </div>
        </div>

        {/* AI Brain Insights Output */}
        {aiInsights ? (
          <div className="relative mt-5 space-y-4 animate-fadeIn">
            {/* Top Verdict & Grade Banner */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-rose-400/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  Executive Performance Verdict
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                  {aiInsights.verdictMm}
                </h4>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {aiInsights.summaryMm}
                </p>
              </div>

              {/* Grade Badge */}
              <div className="text-center shrink-0 p-3 rounded-2xl bg-gradient-to-tr from-amber-400/20 to-rose-500/20 border border-amber-400/40">
                <span className="text-[10px] font-bold text-amber-300 block">GRADE</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  {aiInsights.grade}
                </span>
              </div>
            </div>

            {/* Strengths & Vulnerabilities Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Core Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ခိုင်မာသော အားသာချက်များ (Core Strengths)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {aiInsights.strengthsMm.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vulnerabilities */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-2.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>သတိပြုရမည့် အားနည်းချက်များ (Vulnerabilities)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {aiInsights.vulnerabilitiesMm.map((v, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 7-Day Tactical Action Plan */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                  <Target className="w-4 h-4 text-rose-400" />
                  <span>နောက် ၇ ရက်အတွက် AI မဟာဗျူဟာ အကြံပြုချက် (Strategic Action Plan)</span>
                </div>

                {'speechSynthesis' in window && (
                  <button
                    onClick={handleSpeakAi}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-white transition"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'ရပ်မည်' : 'အသံဖြင့် နားထောင်မည်'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-200">
                {aiInsights.strategicActionPlanMm.map((plan, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5">
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{plan}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer to custom question if present */}
            {aiInsights.answerToQuestion && (
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-400/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  AI Brain Direct Answer
                </span>
                <p className="text-xs text-slate-100 mt-1 leading-relaxed">
                  {aiInsights.answerToQuestion}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Placeholder Before Running Analysis */
          <div className="relative mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <Brain className="w-10 h-10 text-rose-400 mx-auto mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-white">
              CEO Aung Min Maw ၏ ၃၀ ရက် မှတ်တမ်းအား AI Brain ဖြင့် လေ့လာဆန်းစစ်ရန် အဆင်သင့်ဖြစ်ပါသည်
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              Gemini AI က သင့် Non-Negotiables ပြီးမြောက်မှု ရာခိုင်နှုန်း၊ အားအကောင်းဆုံး အလေ့အကျင့်များနှင့် လျော့ရဲခဲ့သည့် ရက်များကို တွက်ချက်ကာ အဆင့်သတ်မှတ်ချက်နှင့် မဟာဗျူဟာ ထုတ်ပြန်ပေးမည် ဖြစ်ပါသည်။
            </p>
            <button
              onClick={() => handleRunAiAnalysis()}
              disabled={aiLoading}
              className="mt-4 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/30 transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>စတင်ဆန်းစစ်မည် (Analyze Now)</span>
            </button>
          </div>
        )}

        {/* Interactive "Ask AI Brain" Custom Question Section */}
        <div className="relative mt-5 pt-4 border-t border-rose-500/20">
          <span className="text-xs font-bold text-rose-300 block mb-2">
            AI Brain အား အလေ့အကျင့် တိုးတက်စေရန် မေးမြန်းပါ
          </span>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {[
              'နောက် ၇ ရက်မှာ Streak မကျအောင် ဘယ်လိုလုပ်ရမလဲ?',
              'Dwag Sharing ဗီဒီယို ပုံမှန်ရိုက်နိုင်ဖို့ အချိန်စီမံခန့်ခွဲမှု အကြံပေးပါ',
              'ညဘက် Review မမေ့အောင် ဘာလုပ်သင့်သလဲ?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomQuestion(q);
                  handleRunAiAnalysis(q);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-rose-500/30 border border-white/10 text-slate-200 whitespace-nowrap transition active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customQuestion.trim()) {
                  handleRunAiAnalysis(customQuestion.trim());
                }
              }}
              placeholder="ဥပမာ- နံနက်ခင်း စည်းကမ်းကို ဘယ်လို ပိုကောင်းအောင် လုပ်ရမလဲ?"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-rose-400/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              onClick={() => customQuestion.trim() && handleRunAiAnalysis(customQuestion.trim())}
              disabled={aiLoading || !customQuestion.trim()}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
