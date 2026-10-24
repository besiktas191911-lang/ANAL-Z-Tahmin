import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  UserCheck, 
  CloudSun, 
  RotateCw, 
  Send, 
  Bot, 
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Match } from '../types';
import { soundFX } from '../utils/audioEffects';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
  onAddToSlip: (match: Match) => void;
  isInSlip: boolean;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  onAddToSlip,
  isInSlip,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tactics' | 'chat'>('overview');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Merhaba! Ben FutbolAI taktik danışmanıyım. ${match?.homeTeam.name} - ${match?.awayTeam.name} karşılaşmasıyla ilgili taktik, oyuncu eşleşmeleri, korner/kart ya da canlı bahis senaryolarını bana sorabilirsiniz.`,
    },
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  if (!match) return null;

  const { homeTeam, awayTeam, aiPrediction, h2h } = match;

  // Generate live AI report via server endpoint
  const handleGenerateAiReport = async () => {
    setIsGeneratingReport(true);
    soundFX.playClick();
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          homeName: homeTeam.name,
          awayName: awayTeam.name,
          league: match.league,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiReport(data.analysis);
      }
    } catch (e) {
      console.error(e);
      setAiReport('Canlı analiz oluşturulurken bağlantı hatası oluştu.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Submit question to AI
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userQuery.trim() || isAnswering) return;

    const query = userQuery.trim();
    setUserQuery('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setIsAnswering(true);
    soundFX.playClick();

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          matchContext: {
            teams: `${homeTeam.name} vs ${awayTeam.name}`,
            league: match.league,
            expectedScore: aiPrediction.expectedScore,
            mainPick: aiPrediction.mainPick,
            homeRank: homeTeam.rank,
            awayRank: awayTeam.rank,
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.answer || 'Üzgünüm, şu an yanıt oluşturulamadı.' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sunucuya bağlanırken bir sorun yaşandı.' },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{match.leagueLogo}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {homeTeam.name} vs {awayTeam.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  %{aiPrediction.confidenceScore} Güven
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {match.league} • {match.date}, {match.time} • {match.stadium}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 pt-2 shrink-0">
          {[
            { id: 'overview', label: 'Genel İstatistik & Güçler', icon: Activity },
            { id: 'tactics', label: 'Derin AI Raporu', icon: Sparkles },
            { id: 'chat', label: 'Yapay Zeka ile Sohbet Et', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-all mr-2 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Highlight AI Prediction Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Algoritmik Ana Tercih</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {aiPrediction.mainPick}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {aiPrediction.mainPickLabel} ({aiPrediction.mainPickOdds.toFixed(2)} Oran)
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-center bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Tahmini Skor</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{aiPrediction.expectedScore}</span>
                  </div>
                  <div className="text-center bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Risk Seviyesi</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">{aiPrediction.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Comparative Power Bars */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Takım Karşılaştırma Matrisi</span>
                </h4>

                {/* Team Names Header */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-1">
                  <span className="text-emerald-400">{homeTeam.name}</span>
                  <span className="text-cyan-400">{awayTeam.name}</span>
                </div>

                {/* Metric 1: Attack Power */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Hücum Gücü: {homeTeam.attackPower}</span>
                    <span className="font-semibold text-slate-300">HÜCUM GÜCÜ</span>
                    <span>{awayTeam.attackPower}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div style={{ width: `${(homeTeam.attackPower / (homeTeam.attackPower + awayTeam.attackPower)) * 100}%` }} className="bg-emerald-500" />
                    <div style={{ width: `${(awayTeam.attackPower / (homeTeam.attackPower + awayTeam.attackPower)) * 100}%` }} className="bg-cyan-500" />
                  </div>
                </div>

                {/* Metric 2: Defense Power */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Savunma: {homeTeam.defensePower}</span>
                    <span className="font-semibold text-slate-300">SAVUNMA GÜCÜ</span>
                    <span>{awayTeam.defensePower}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div style={{ width: `${(homeTeam.defensePower / (homeTeam.defensePower + awayTeam.defensePower)) * 100}%` }} className="bg-emerald-500" />
                    <div style={{ width: `${(awayTeam.defensePower / (homeTeam.defensePower + awayTeam.defensePower)) * 100}%` }} className="bg-cyan-500" />
                  </div>
                </div>

                {/* Metric 3: xG (Expected Goals) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>xG: {homeTeam.xG}</span>
                    <span className="font-semibold text-slate-300">GOL BEKLENTİSİ (xG)</span>
                    <span>xG: {awayTeam.xG}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div style={{ width: `${(homeTeam.xG / (homeTeam.xG + awayTeam.xG)) * 100}%` }} className="bg-emerald-500" />
                    <div style={{ width: `${(awayTeam.xG / (homeTeam.xG + awayTeam.xG)) * 100}%` }} className="bg-cyan-500" />
                  </div>
                </div>
              </div>

              {/* Key Players Spotlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>{homeTeam.name} Kilit Oyuncu</span>
                  </div>
                  <div className="font-bold text-sm text-white flex items-center justify-between">
                    <span>{homeTeam.keyPlayer.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      ★ {homeTeam.keyPlayer.rating}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {homeTeam.keyPlayer.position} • <span className="text-slate-200 font-semibold">{homeTeam.keyPlayer.stat}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>{awayTeam.name} Kilit Oyuncu</span>
                  </div>
                  <div className="font-bold text-sm text-white flex items-center justify-between">
                    <span>{awayTeam.keyPlayer.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                      ★ {awayTeam.keyPlayer.rating}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {awayTeam.keyPlayer.position} • <span className="text-slate-200 font-semibold">{awayTeam.keyPlayer.stat}</span>
                  </div>
                </div>
              </div>

              {/* Environmental & Referee Conditions */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hava ve Zemin</span>
                  </span>
                  <span className="font-semibold text-slate-200 block">{aiPrediction.weatherCondition}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Karşılaşmanın Hakemi</span>
                  </span>
                  <span className="font-semibold text-slate-200 block">
                    {aiPrediction.referee} ({aiPrediction.refereeCardAvg} Kart Ort.)
                  </span>
                </div>
              </div>

              {/* H2H (Son Karşılaşmalar) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aralarındaki Son Karşılaşmalar (H2H)</span>
                </h4>
                <div className="space-y-2">
                  {h2h.lastMatches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                      <span className="text-slate-400">{m.date}</span>
                      <span className="text-slate-300 font-medium">{m.competition}</span>
                      <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {m.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TACTICAL GEMINI AI REPORT */}
          {activeTab === 'tactics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Gemini 3.8 Flash Derin Taktik Raporu</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Maç öncesi pres hatları, beklenen xG modelleri ve taktiksel eşleşmeler.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAiReport}
                  disabled={isGeneratingReport}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingReport ? 'Yapay Zeka Analiz Ediyor...' : 'Raporu Yenile'}</span>
                </button>
              </div>

              {/* Report Body */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {isGeneratingReport ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-400">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <p className="text-xs">Yapay zeka xG modellerini ve takım taktiklerini işliyor...</p>
                  </div>
                ) : aiReport ? (
                  aiReport
                ) : (
                  <div className="space-y-3">
                    <p className="font-semibold text-white">
                      📌 Yapay Zeka İlk İncelemesi:
                    </p>
                    <p>{aiPrediction.analysisSummary}</p>
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                      <strong>Taktiksel Kilit Nokta:</strong> {aiPrediction.tacticalKey}
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleGenerateAiReport}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Kapsamlı Canlı Yapay Zeka Raporu Oluştur</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHAT ASSISTANT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[400px]">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAnswering && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200" />
                    <span>Yapay zeka analiz ediyor...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="py-2 flex items-center space-x-2 overflow-x-auto scrollbar-none text-[11px]">
                {[
                  'İlk yarı 0.5 gol üstü olur mu?',
                  'En çok hangi dakikalarda gol bekleniyor?',
                  'Korner beklentisi nedir?',
                  'Hangi oyuncu kart görmeye yakın?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setUserQuery(prompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendChat} className="pt-2 flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Maçla ilgili bir soru yazın... (Örn: İkinci yarı gol olur mu?)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!userQuery.trim() || isAnswering}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="text-xs">
            <span className="text-slate-400">Yapay Zeka Seçimi: </span>
            <span className="font-bold text-emerald-400">{aiPrediction.mainPick}</span>
            <span className="text-slate-400 font-mono ml-2 font-bold">({aiPrediction.mainPickOdds.toFixed(2)})</span>
          </div>

          <button
            onClick={() => {
              soundFX.playSuccess();
              onAddToSlip(match);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center space-x-1.5 ${
              isInSlip
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
            }`}
          >
            {isInSlip ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Kuponunuzda Eklendi</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Kupona Ekle</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
