import React, { useState } from 'react';
import { X, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Match } from '../types';
import { soundFX } from '../utils/audioEffects';

interface CustomMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: (newMatch: Match) => void;
}

export const CustomMatchModal: React.FC<CustomMatchModalProps> = ({
  isOpen,
  onClose,
  onMatchCreated,
}) => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [league, setLeague] = useState('Özel Karşılaşma');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError('Lütfen her iki takımın adını da girin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    soundFX.playClick();

    try {
      const res = await fetch('/api/ai/custom-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeamName: homeTeam.trim(),
          awayTeamName: awayTeam.trim(),
          league: league.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.match) {
        soundFX.playSuccess();
        onMatchCreated(data.match);
        onClose();
        setHomeTeam('');
        setAwayTeam('');
      } else {
        setError('Maç analizi oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Sunucu ile iletişim kurulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md rounded-2xl glass-panel border border-emerald-500/40 p-6 space-y-5 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Yapay Zeka ile Özel Maç Analizi</h3>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          İstediğiniz herhangi iki futbol takımını girin; Gemini 3.8 Flash modeli anında xG hesaplamaları, taktiksel analiz ve bahis tahminleri üretsin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ev Sahibi Takım
            </label>
            <input
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              placeholder="Örn: Roma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deplasman Takımı
            </label>
            <input
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              placeholder="Örn: Lazio"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lig / Organizasyon (Opsiyonel)
            </label>
            <input
              type="text"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              placeholder="Örn: Serie A"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yapay Zeka Analizini Hazırlıyor...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Analizi Oluştur ve Listeye Ekle</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
