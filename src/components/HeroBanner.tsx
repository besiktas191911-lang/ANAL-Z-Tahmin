import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Search, 
  Zap, 
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Calendar,
  Wand2,
  Send
} from 'lucide-react';
import { Match } from '../types';
import { soundFX } from '../utils/audioEffects';

interface HeroBannerProps {
  topMatch: Match | undefined;
  onOpenMatch: (match: Match) => void;
  onQuickSlip: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onSelectFilter: (f: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  totalMatches: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenSpecialRequest: () => void;
  onDirectSpecialRequest: (text: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  topMatch,
  onOpenMatch,
  onQuickSlip,
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  sortBy,
  onSortChange,
  totalMatches,
  selectedDate,
  onSelectDate,
  onOpenSpecialRequest,
  onDirectSpecialRequest,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');

  const filterTabs = [
    { id: 'all', label: `Tüm Maçlar (${totalMatches})`, icon: '⚽' },
    { id: 'banko', label: '🔥 %90+ Banko', icon: '🔥' },
    { id: 'goals', label: '⚡ 2.5 Üst Gol', icon: '⚡' },
    { id: 'btts', label: '🤝 Karşılıklı Gol', icon: '🤝' },
    { id: 'superlig', label: '🇹🇷 Süper Lig', icon: '🇹🇷' },
    { id: 'europe', label: '🇪🇺 Avrupa Devleri', icon: '🇪🇺' },
    { id: 'value', label: '💎 Değerli Oran', icon: '💎' },
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      soundFX.playClick();
      onDirectSpecialRequest(quickPrompt.trim());
      setQuickPrompt('');
    }
  };

  return (
    <div className="relative pt-6 pb-4 sm:pt-10 sm:pb-8 overflow-hidden">
      {/* Background Neon ambient flares */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Day Selector Bar (Prominent at top) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl glass-panel border border-emerald-500/30 bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
            <span className="text-xs font-bold text-slate-300">
              Bülten Günü:
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onSelectDate('today');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  selectedDate === 'today'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Bugün (15 Maç)
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onSelectDate('tomorrow');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  selectedDate === 'tomorrow'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Yarın (15 Maç)
              </button>
            </div>
          </div>

          {/* Special Request Prompt Launcher */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenSpecialRequest();
            }}
            className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Özel İstek ve Senaryo Analiz Et</span>
          </button>
        </div>

        {/* Top Header & Intro */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {selectedDate === 'today' ? 'BUGÜNÜN' : 'YARININ'} 15 MAÇI YAPAY ZEKA İLE SEÇİLDİ VE ANALİZ EDİLDİ
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Her Gün 15 Seçilmiş Maç <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                & Özel İstek Taktik Analizi
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Her gün için yapay zekanın seçtiği 15 karşılaşmayı inceleyin veya aklınızdaki özel taktik, maç ya da oran talebini yazarak anında analiz alın.
            </p>

            {/* Direct Special Request Input Bar */}
            <form onSubmit={handleQuickSubmit} className="pt-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Wand2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Özel istek analizi yazın... (Örn: En yüksek oranlı 3 banko maç, Derbi korner riski)"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0"
              >
                <span>Analiz Et</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span>Başarı Endeksi</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">%84.7</div>
              </div>

              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Günlük Seçim</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white mt-0.5">15 / 15 Maç</div>
              </div>

              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span>Ort. Değer Oranı</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">1.88</div>
              </div>
            </div>
          </div>

          {/* Featured Match Card (Günün Bankosu) */}
          {topMatch && (
            <div className="w-full lg:w-96 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-30 animate-pulse" />
              <div className="relative glass-card p-5 rounded-2xl border border-emerald-500/30 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>Seçilen Günün Bankosu</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                    <span>{topMatch.leagueLogo}</span>
                    <span>{topMatch.time}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="text-center flex-1">
                    <div className="text-base font-bold text-white truncate">{topMatch.homeTeam.name}</div>
                    <div className="text-[11px] text-slate-400">Lig #{topMatch.homeTeam.rank}</div>
                  </div>
                  <div className="px-3 text-xs font-black text-emerald-400 bg-emerald-950/60 py-1 rounded-lg border border-emerald-500/20">
                    VS
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-base font-bold text-white truncate">{topMatch.awayTeam.name}</div>
                    <div className="text-[11px] text-slate-400">Lig #{topMatch.awayTeam.rank}</div>
                  </div>
                </div>

                {/* AI Pick Box */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Yapay Zeka Seçimi</span>
                    <span className="text-emerald-400 font-bold">{topMatch.aiPrediction.mainPickOdds} Oran</span>
                  </div>
                  <div className="text-sm font-extrabold text-white flex items-center justify-between">
                    <span>{topMatch.aiPrediction.mainPick}</span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                      %{topMatch.aiPrediction.confidenceScore} Güven
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 border-t border-slate-800/80">
                    {topMatch.aiPrediction.analysisSummary}
                  </p>
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onOpenMatch(topMatch);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-md shadow-emerald-600/20"
                  >
                    <span>Detaylı Analizi Gör</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playSuccess();
                      onQuickSlip();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95 flex items-center space-x-1"
                    title="Günün en sağlam 3 maçını kupona aktar"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Hızlı Banko</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Takım, lig veya şehir ara... (Örn: Galatasaray, Chelsea)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sıralama:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="confidence">En Yüksek AI Güvenine Göre</option>
                <option value="time">Başlama Saatine Göre</option>
                <option value="odds">En Yüksek Orana Göre</option>
                <option value="goals">En Yüksek Gol İhtimaline Göre</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFX.playClick();
                    onSelectFilter(tab.id);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
