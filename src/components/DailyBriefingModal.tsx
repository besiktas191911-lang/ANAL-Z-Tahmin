import React, { useState, useEffect } from 'react';
import { X, Radio, Play, Pause, RotateCw, Volume2 } from 'lucide-react';
import { soundFX } from '../utils/audioEffects';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [script, setScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen && !script) {
      fetchBriefing();
    }
  }, [isOpen]);

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/briefing', { method: 'POST' });
      const data = await res.json();
      if (data.script) {
        setScript(data.script);
      }
    } catch {
      setScript('Sesli bülten yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = () => {
    soundFX.playClick();
    if (!('speechSynthesis' in window)) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(script.replace(/[#*🎙️🔥⚽💎]/g, ''));
      utterance.lang = 'tr-TR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-lg rounded-2xl glass-panel border border-purple-500/40 p-5 sm:p-6 space-y-4 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">FutbolAI Günlük Sesli Bülten</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Player Visualizer Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/50 to-slate-950 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleVoice}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-white block">
                {isPlaying ? 'Sesli Bülten Çalıyor...' : 'Günün Özetini Dinle'}
              </span>
              <span className="text-[11px] text-purple-300">
                15 Maçın AI Yönetici Özeti (Türkçe)
              </span>
            </div>
          </div>

          {/* Animated Waveform */}
          <div className="flex items-center space-x-1 h-8 px-2">
            {[40, 75, 55, 90, 60, 30, 85, 45].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-purple-400 wave-bar' : 'bg-slate-700 h-2'
                }`}
                style={{
                  height: isPlaying ? `${h}%` : '6px',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Text Transcript */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-h-60 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap">
          {isLoading ? (
            <div className="py-8 flex items-center justify-center space-y-2 text-slate-500">
              <RotateCw className="w-4 h-4 animate-spin text-purple-400 mr-2" />
              <span>Günün sesli bülteni derleniyor...</span>
            </div>
          ) : (
            script
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tarayıcı konuşma motoru ve yapay zeka destekli</span>
          </span>
          <button
            onClick={fetchBriefing}
            disabled={isLoading}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
          >
            <RotateCw className="w-3 h-3" />
            <span>Yeniden Üret</span>
          </button>
        </div>

      </div>
    </div>
  );
};
