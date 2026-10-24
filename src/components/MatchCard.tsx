import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  PlayCircle, 
  FileText, 
  Plus, 
  Check, 
  MapPin, 
  Activity, 
  ShieldAlert,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { Match, FormResult } from '../types';
import { soundFX } from '../utils/audioEffects';

interface MatchCardProps {
  match: Match;
  onOpenDetails: (match: Match) => void;
  onOpenSimulation: (match: Match) => void;
  isInSlip: boolean;
  onToggleSlip: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onOpenDetails,
  onOpenSimulation,
  isInSlip,
  onToggleSlip,
}) => {
  const { homeTeam, awayTeam, odds, aiPrediction } = match;

  const renderFormBadge = (result: FormResult, idx: number) => {
    const config = {
      W: { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', label: 'G' },
      D: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', label: 'B' },
      L: { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40', label: 'M' },
    }[result];

    return (
      <span
        key={idx}
        className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-[10px] font-bold border ${config.bg}`}
        title={`${result === 'W' ? 'Galibiyet' : result === 'D' ? 'Beraberlik' : 'Mağlubiyet'}`}
      >
        {config.label}
      </span>
    );
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Günün Bankosu':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Gol Festivali':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Derbi Ateşi':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Değerli Oran':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl glass-card p-4 sm:p-5 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 shadow-xl overflow-hidden">
      
      {/* Top Ambient Glow on Card Hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all duration-500 pointer-events-none" />

      {/* 1. Header: League & AI Tag */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-base">{match.leagueLogo}</span>
            <div>
              <span className="font-bold text-slate-200">{match.league}</span>
              <span className="text-slate-500 text-[11px] ml-1.5 hidden sm:inline">({match.round})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTagColor(aiPrediction.aiTag)} flex items-center space-x-1`}>
              {aiPrediction.aiTag === 'Günün Bankosu' && <Flame className="w-2.5 h-2.5 text-emerald-400" />}
              {aiPrediction.aiTag === 'Gol Festivali' && <Zap className="w-2.5 h-2.5 text-cyan-400" />}
              <span>{aiPrediction.aiTag}</span>
            </span>

            <div className="flex items-center space-x-1 text-slate-400 font-semibold bg-slate-900/90 px-2 py-0.5 rounded-md text-[11px] border border-slate-800">
              <span>{match.time}</span>
            </div>
          </div>
        </div>

        {/* 2. Teams Layout */}
        <div className="py-4 space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm border border-slate-700 shrink-0"
                style={{ backgroundColor: homeTeam.color === '#ffffff' ? '#334155' : homeTeam.color }}
              >
                {homeTeam.shortName}
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm sm:text-base text-white truncate">
                    {homeTeam.name}
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    #{homeTeam.rank}
                  </span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  {homeTeam.form.map(renderFormBadge)}
                </div>
              </div>
            </div>

            {/* Home Odds */}
            <div className="text-right pl-2">
              <span className="text-xs sm:text-sm font-black text-slate-200 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                {odds.home.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Versus divider & Expected Score */}
          <div className="flex items-center justify-between text-xs py-1 px-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
            <span className="text-slate-400 text-[11px] flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span className="truncate max-w-[140px]">{match.stadium}</span>
            </span>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Beklenen Skor:</span>
              <span className="font-extrabold text-emerald-400 font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
                {aiPrediction.expectedScore}
              </span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm border border-slate-700 shrink-0"
                style={{ backgroundColor: awayTeam.color === '#ffffff' ? '#334155' : awayTeam.color }}
              >
                {awayTeam.shortName}
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm sm:text-base text-white truncate">
                    {awayTeam.name}
                  </span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    #{awayTeam.rank}
                  </span>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  {awayTeam.form.map(renderFormBadge)}
                </div>
              </div>
            </div>

            {/* Away Odds */}
            <div className="text-right pl-2">
              <span className="text-xs sm:text-sm font-black text-slate-200 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                {odds.away.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Core AI Recommendation Box */}
        <div className="mt-1 p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-emerald-500/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Yapay Zeka Tahmini
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                %{aiPrediction.confidenceScore} GÜVEN
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-black text-base sm:text-lg text-emerald-400 tracking-tight">
              {aiPrediction.mainPick}
            </div>
            <div className="text-sm font-mono font-bold text-white bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
              {aiPrediction.mainPickOdds.toFixed(2)} Oran
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            {aiPrediction.analysisSummary}
          </p>
        </div>

        {/* 4. Probability Segmented Bar (1 - X - 2) */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-400">
            <span>MS 1 (%{aiPrediction.winProbability.home})</span>
            <span>Beraberlik (%{aiPrediction.winProbability.draw})</span>
            <span>MS 2 (%{aiPrediction.winProbability.away})</span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex">
            <div 
              style={{ width: `${aiPrediction.winProbability.home}%` }}
              className="bg-emerald-500 hover:brightness-110 transition-all"
              title={`Ev Sahibi: %${aiPrediction.winProbability.home}`}
            />
            <div 
              style={{ width: `${aiPrediction.winProbability.draw}%` }}
              className="bg-slate-500 hover:brightness-110 transition-all"
              title={`Beraberlik: %${aiPrediction.winProbability.draw}`}
            />
            <div 
              style={{ width: `${aiPrediction.winProbability.away}%` }}
              className="bg-cyan-500 hover:brightness-110 transition-all"
              title={`Deplasman: %${aiPrediction.winProbability.away}`}
            />
          </div>
        </div>

        {/* 5. Key Metrics Chips */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-semibold">
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block">KG Var</span>
            <span className="text-emerald-400 font-mono font-bold">%{aiPrediction.bttsProbability}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block">2.5 Gol Üst</span>
            <span className="text-cyan-400 font-mono font-bold">%{aiPrediction.over25Probability}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-slate-400 block">Korner</span>
            <span className="text-amber-400 font-mono font-bold">{aiPrediction.expectedCorners}</span>
          </div>
        </div>
      </div>

      {/* 6. Action Buttons Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2">
        {/* Deep Analysis Modal Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onOpenDetails(match);
          }}
          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center space-x-1.5 border border-slate-700"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Derin Analiz</span>
        </button>

        {/* 90' Simulation Modal Button */}
        <button
          onClick={() => {
            soundFX.playClick();
            onOpenSimulation(match);
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-400 border border-slate-700 text-xs font-bold transition-all active:scale-95 flex items-center justify-center"
          title="90 Dakika Yapay Zeka Maç Simülasyonunu Aç"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Add To Slip Toggle Button */}
        <button
          onClick={() => {
            soundFX.playSuccess();
            onToggleSlip(match);
          }}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 flex items-center space-x-1.5 ${
            isInSlip
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
          title={isInSlip ? 'Kupondan Çıkar' : 'Kupona Ekle'}
        >
          {isInSlip ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Kuponda</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Kupona</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
