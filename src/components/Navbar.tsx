import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  PlusCircle, 
  Radio, 
  Calendar,
  Wand2
} from 'lucide-react';
import { soundFX } from '../utils/audioEffects';

interface NavbarProps {
  matchCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenCustomMatch: () => void;
  onOpenBriefing: () => void;
  onOpenSpecialRequest: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  matchCount,
  isRefreshing,
  onRefresh,
  onOpenCustomMatch,
  onOpenBriefing,
  onOpenSpecialRequest,
  soundEnabled,
  onToggleSound,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 shadow-lg shadow-emerald-500/20 text-white font-extrabold shrink-0">
              <span className="text-xl">⚽</span>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Futbol<span className="text-emerald-400">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
                  v4.2 PRO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center space-x-1">
                <span>Her Güne 15 Maç Analizi</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-emerald-400 font-semibold">{matchCount} Maç Seçildi</span>
              </p>
            </div>
          </div>

          {/* Center: Day Selector (Bugün / Yarın) */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundFX.playClick();
                onSelectDate('today');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === 'today'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 Bugün (15 Maç)
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onSelectDate('tomorrow');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDate === 'tomorrow'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 Yarın (15 Maç)
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Special Request AI Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenSpecialRequest();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-cyan-600/30 hover:from-emerald-600/40 hover:to-cyan-600/40 text-emerald-300 border border-emerald-500/50 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
              title="Özel İstek ve Sorularınızı Yapay Zekaya Analiz Ettirin"
            >
              <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
              <span>Özel İstek Analizi</span>
            </button>

            {/* Audio Briefing Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenBriefing();
              }}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-semibold transition-all active:scale-95 group"
              title="Günün Sesli AI Bülteni"
            >
              <Radio className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
              <span>Sesli Bülten</span>
            </button>

            {/* Custom Match Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenCustomMatch();
              }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Özel Maç Ekle</span>
            </button>

            {/* Refresh Odds */}
            <button
              onClick={() => {
                soundFX.playClick();
                onRefresh();
              }}
              disabled={isRefreshing}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs sm:text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
              title="Oranları ve Verileri Canlı Yenile"
            >
              <RotateCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline ml-1.5 text-xs">Yenile</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                soundEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Sesleri Kapat' : 'Sesleri Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
