import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  Flame, 
  Trophy,
  Zap,
  Clock
} from 'lucide-react';
import { Match, SimulationMomentumPoint } from '../types';
import { soundFX } from '../utils/audioEffects';

interface MatchSimulationModalProps {
  match: Match | null;
  onClose: () => void;
}

export const MatchSimulationModal: React.FC<MatchSimulationModalProps> = ({
  match,
  onClose,
}) => {
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simScore, setSimScore] = useState({ home: 0, away: 0 });
  const [eventsFeed, setEventsFeed] = useState<SimulationMomentumPoint[]>([]);

  const intervalRef = useRef<number | null>(null);

  if (!match) return null;

  const { homeTeam, awayTeam, simulation, aiPrediction } = match;

  // Run simulation timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentMinute((prev) => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 90;
          }
          const next = prev + 1;

          // Check if an event occurred at this minute
          const found = simulation.find((e) => e.minute === next);
          if (found) {
            setEventsFeed((old) => [found, ...old]);
            if (found.type === 'goal') {
              soundFX.playSuccess();
              if (found.homePressure > 0) {
                setSimScore((s) => ({ ...s, home: s.home + 1 }));
              } else {
                setSimScore((s) => ({ ...s, away: s.away + 1 }));
              }
            } else {
              soundFX.playClick();
            }
          }

          return next;
        });
      }, 180); // Speed: ~180ms per match minute (full match in ~16s)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, simulation]);

  const handleReset = () => {
    soundFX.playClick();
    setCurrentMinute(0);
    setSimScore({ home: 0, away: 0 });
    setEventsFeed([]);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                90 Dakika Yapay Zeka Maç Simülatörü
              </h3>
              <p className="text-xs text-slate-400">
                Olasılık dağılımı ve momentum analiziyle dinamik maç provası
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scoreboard Display */}
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-xs font-mono font-bold text-cyan-400">
            <Clock className="w-4 h-4" />
            <span>DAKİKA: {currentMinute}'</span>
            {currentMinute === 90 && (
              <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MAÇ SONA ERDİ
              </span>
            )}
          </div>

          {/* Teams & Real-Time Simulated Score */}
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Home Team */}
            <div className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg border border-slate-700"
                style={{ backgroundColor: homeTeam.color === '#ffffff' ? '#334155' : homeTeam.color }}
              >
                {homeTeam.shortName}
              </div>
              <span className="font-extrabold text-sm text-white">{homeTeam.name}</span>
            </div>

            {/* Score */}
            <div className="px-6 py-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
              <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest">
                {simScore.home} - {simScore.away}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg border border-slate-700"
                style={{ backgroundColor: awayTeam.color === '#ffffff' ? '#334155' : awayTeam.color }}
              >
                {awayTeam.shortName}
              </div>
              <span className="font-extrabold text-sm text-white">{awayTeam.name}</span>
            </div>
          </div>

          {/* Playback Progress Slider */}
          <div className="space-y-1 max-w-md mx-auto">
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                style={{ width: `${(currentMinute / 90) * 100}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Durdur' : 'Devam Et'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yeniden Başlat</span>
            </button>
          </div>
        </div>

        {/* Live Momentum & Events Stream */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Simüle Edilen Maç Olayları ve Pozisyon Akışı</span>
          </h4>

          {eventsFeed.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Hakem düdüğü çaldı, maç başlıyor... Pozisyonlar dakika ilerledikçe burada listelenecektir.
            </div>
          ) : (
            <div className="space-y-2">
              {eventsFeed.map((ev, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    ev.type === 'goal'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                      : ev.type === 'yellow_card'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      {ev.minute}'
                    </span>
                    <span>{ev.event}</span>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80">
                    {ev.type === 'goal' ? '⚽ GOL' : ev.type === 'yellow_card' ? '🟨 KART' : '⚡ ATAK'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simulation Summary Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div>
            <span className="text-slate-400">Beklenen Skor Algoritması: </span>
            <span className="font-bold text-emerald-400">{aiPrediction.expectedScore}</span>
          </div>
          <span className="text-slate-400">
            Ana Tahmin: <strong className="text-white">{aiPrediction.mainPick}</strong>
          </span>
        </div>

      </div>
    </div>
  );
};
