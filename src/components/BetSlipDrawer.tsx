import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Zap, 
  Flame,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BetSlipItem } from '../types';
import { soundFX } from '../utils/audioEffects';

interface BetSlipDrawerProps {
  items: BetSlipItem[];
  onRemoveItem: (matchId: string) => void;
  onClearSlip: () => void;
  onAutoFillBanko: () => void;
}

export const BetSlipDrawer: React.FC<BetSlipDrawerProps> = ({
  items,
  onRemoveItem,
  onClearSlip,
  onAutoFillBanko,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stake, setStake] = useState<number>(100);
  const [isCopied, setIsCopied] = useState(false);

  if (items.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => {
            soundFX.playSuccess();
            onAutoFillBanko();
          }}
          className="glass-panel px-4 py-3 rounded-2xl border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-2xl hover:bg-emerald-500/20 transition-all active:scale-95 group"
        >
          <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Günün 3'lü Banko Kuponunu Doldur</span>
        </button>
      </div>
    );
  }

  // Calculate total odds
  const totalOdds = items.reduce((acc, it) => acc * it.odds, 1);
  const averageConfidence = Math.round(
    items.reduce((acc, it) => acc + it.confidence, 0) / items.length
  );
  const potentialWin = Math.round(stake * totalOdds);

  const handleCopySlip = () => {
    soundFX.playSuccess();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignored
    }

    const text = `⚽ FutbolAI Günlük Kuponum:\n` +
      items.map((it, i) => `${i + 1}. ${it.matchTitle} -> ${it.pick} (${it.odds.toFixed(2)})`).join('\n') +
      `\n\n🔥 Toplam Oran: ${totalOdds.toFixed(2)}\n⭐ AI Güven Endeksi: %${averageConfidence}\nTahmini Kazanç: ${potentialWin} TL`;

    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 sm:right-6 sm:left-auto sm:w-96 z-40 p-2 sm:p-0">
      <div className="rounded-2xl glass-panel border border-emerald-500/40 shadow-2xl bg-slate-950/95 backdrop-blur-2xl overflow-hidden transition-all duration-300">
        
        {/* Dock Bar / Header */}
        <div 
          onClick={() => {
            soundFX.playClick();
            setIsOpen(!isOpen);
          }}
          className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between cursor-pointer border-b border-slate-800"
        >
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
              {items.length}
            </span>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Takip Kuponu ({items.length} Maç)
              </span>
              <span className="text-[11px] text-emerald-400 font-bold ml-2 font-mono">
                {totalOdds.toFixed(2)} Oran
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              %{averageConfidence} Güven
            </span>
            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Matches list */}
            <div className="space-y-2">
              {items.map((it) => (
                <div
                  key={it.matchId}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{it.matchTitle}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                      <span className="text-emerald-400 font-semibold">{it.pick}</span>
                      <span>•</span>
                      <span>{it.league}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded">
                      {it.odds.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        onRemoveItem(it.matchId);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Kupondan Çıkar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stake Input & Summary */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Kupon Tutarı:</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-right font-mono font-bold text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400 font-bold">TL</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Toplam Oran:</span>
                <span className="font-mono font-black text-white">{totalOdds.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-emerald-400 font-bold">Tahmini Kazanç:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">{potentialWin.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCopySlip}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                {isCopied ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
                <span>{isCopied ? 'Kupon Kopyalandı & Paylaşılmaya Hazır!' : 'Kuponu Kopyala & Paylaş'}</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onClearSlip();
                }}
                className="w-full py-1.5 rounded-xl text-slate-500 hover:text-slate-300 text-[11px] font-semibold text-center transition-colors"
              >
                Kuponu Temizle
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
