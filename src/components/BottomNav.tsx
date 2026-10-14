import React from 'react';
import { Calendar, Video, Award, CheckSquare, BarChart2 } from 'lucide-react';
import { TabType } from '../types';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  const tabs: {
    id: TabType;
    labelEn: string;
    labelMm: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'today', labelEn: 'Today', labelMm: 'ယနေ့', icon: Calendar },
    { id: 'plan', labelEn: 'Plan', labelMm: 'အစီအစဉ်', icon: Video },
    { id: 'tracker', labelEn: 'Tracker', labelMm: 'အလေ့အကျင့်', icon: Award },
    { id: 'review', labelEn: 'Review', labelMm: 'သုံးသပ်ချက်', icon: CheckSquare },
    { id: 'stats', labelEn: 'Stats', labelMm: 'စာရင်းအင်း', icon: BarChart2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-rose-100/90 dark:border-rose-950/80 pb-safe transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center min-h-[48px] w-full py-1 text-center transition-all active:scale-95"
            >
              {/* Active soft pill indicator */}
              {isActive && (
                <span className="absolute top-1 w-8 h-1 rounded-full bg-rose-500 animate-fadeIn" />
              )}

              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex flex-col items-center leading-none mt-0.5">
                <span
                  className={`text-[10px] tracking-tight font-medium transition-colors ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.labelMm}
                </span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500">
                  {tab.labelEn}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
