import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  RotateCw, 
  Copy, 
  Check, 
  Flame, 
  Zap, 
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audioEffects';

interface SpecialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export const SpecialRequestModal: React.FC<SpecialRequestModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
}) => {
  const [requestText, setRequestText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const presetRequests = [
    { label: '🔥 En Güvenilir 3 Banko', text: 'Bugünün 15 maçından güven endeksi en yüksek 3 maçı seç, nedenlerini ve toplam oranını analiz et.' },
    { label: '⚽ 2.5 Üst Gol Festivali', text: 'En çok gol beklenen maçları ve karşılıklı gol (KG Var) potansiyeli en yüksek takımları listele.' },
    { label: '💎 4.00+ Sürpriz Değer', text: 'Oranına göre kazanma ihtimali en yüksek 2 sürpriz maçı ve xG gerekçelerini analiz et.' },
    { label: '🚩 Korner & Kart Raporu', text: 'Hakem ve oyun temposuna göre bugün en çok korner ve kart çıkması beklenen maçları açıkla.' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (customPrompt?: string) => {
    const promptToSend = customPrompt || requestText;
    if (!promptToSend.trim() || isLoading) return;

    setIsLoading(true);
    soundFX.playClick();
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/special-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestText: promptToSend.trim(),
          dateKey: selectedDate,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        soundFX.playSuccess();
        setAnalysisResult(data.answer);
      } else {
        setAnalysisResult('Analiz oluşturulamadı. Lütfen farklı bir soru deneyin.');
      }
    } catch {
      setAnalysisResult('Yapay zeka motoruna bağlanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard?.writeText(analysisResult);
    setIsCopied(true);
    soundFX.playClick();
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    } catch {
      // Ignored
    }
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-2xl glass-panel border border-emerald-500/40 p-5 sm:p-6 space-y-4 bg-slate-900 shadow-2xl my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Özel İstek & Talep Üzerine Analiz
              </h3>
              <p className="text-xs text-slate-400">
                Aklınızdaki herhangi bir senaryoyu yazın; Gemini 3.8 Flash anında analiz etsin.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Prompt Pills */}
        <div className="space-y-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Hızlı İstek Seçenekleri:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {presetRequests.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRequestText(preset.text);
                  handleSubmit(preset.text);
                }}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="space-y-2 shrink-0">
          <div className="relative">
            <textarea
              rows={3}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Özel analizinizi yazın... (Örn: Beşiktaş - Fenerbahçe maçında karşılıklı gol ve 2.5 üst ihtimalini derinlemesine incele veya Bana en az 5 oranlı 3 maçlık kupon çıkar)"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {selectedDate === 'today' ? 'Bugünün 15 Maçı' : selectedDate === 'tomorrow' ? 'Yarının 15 Maçı' : `${selectedDate} Bülteni`} taranacaktır
            </span>

            <button
              onClick={() => handleSubmit()}
              disabled={!requestText.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Özel Analiz Yap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Output Section */}
        <div className="flex-1 overflow-y-auto min-h-[160px] p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-xs">Yapay zeka bülteni ve istatistikleri özel talebinize göre modelliyor...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <Bot className="w-4 h-4" />
                  <span>Yapay Zeka Özel Raporu</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Kopyalandı' : 'Raporu Kopyala'}</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {analysisResult}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2 text-slate-500">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">
                Yukarıdaki hazır butonlardan birine tıklayabilir veya aklınızdaki soruyu yazıp "Özel Analiz Yap" butonuna basabilirsiniz.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
