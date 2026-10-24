import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Layers, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Radio, 
  ShieldCheck, 
  Trophy,
  Filter,
  Calendar,
  Wand2
} from 'lucide-react';
import { Match, BetSlipItem } from './types';
import { INITIAL_15_MATCHES } from './data/initialMatches';
import { TOMORROW_15_MATCHES } from './data/multiDayMatches';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MatchCard } from './components/MatchCard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { MatchSimulationModal } from './components/MatchSimulationModal';
import { BetSlipDrawer } from './components/BetSlipDrawer';
import { CustomMatchModal } from './components/CustomMatchModal';
import { DailyBriefingModal } from './components/DailyBriefingModal';
import { SpecialRequestModal } from './components/SpecialRequestModal';
import { soundFX } from './utils/audioEffects';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [matches, setMatches] = useState<Match[]>(INITIAL_15_MATCHES);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [simulationMatch, setSimulationMatch] = useState<Match | null>(null);
  const [isCustomMatchOpen, setIsCustomMatchOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isSpecialRequestOpen, setIsSpecialRequestOpen] = useState(false);

  // Bet Slip state
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);

  // Fetch matches from API when date changes
  const fetchMatchesForDate = async (dateKey: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/matches?date=${dateKey}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.matches) && data.matches.length > 0) {
        setMatches(data.matches);
      } else {
        setMatches(dateKey === 'tomorrow' ? TOMORROW_15_MATCHES : INITIAL_15_MATCHES);
      }
    } catch {
      setMatches(dateKey === 'tomorrow' ? TOMORROW_15_MATCHES : INITIAL_15_MATCHES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesForDate(selectedDate);
  }, [selectedDate]);

  // Handle date selection
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    soundFX.playClick();
  };

  // Handle live odds refresh
  const handleRefreshMatches = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/matches/refresh?date=${selectedDate}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
      }
    } catch {
      // Fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playClick();
  };

  // Slip handlers
  const handleToggleSlip = (match: Match) => {
    setBetSlip((prev) => {
      const exists = prev.some((it) => it.matchId === match.id);
      if (exists) {
        return prev.filter((it) => it.matchId !== match.id);
      } else {
        return [
          ...prev,
          {
            matchId: match.id,
            matchTitle: `${match.homeTeam.name} - ${match.awayTeam.name}`,
            league: match.league,
            pick: match.aiPrediction.mainPick,
            pickLabel: match.aiPrediction.mainPickLabel,
            odds: match.aiPrediction.mainPickOdds,
            confidence: match.aiPrediction.confidenceScore,
          },
        ];
      }
    });
  };

  const handleRemoveFromSlip = (matchId: string) => {
    setBetSlip((prev) => prev.filter((it) => it.matchId !== matchId));
  };

  const handleClearSlip = () => {
    setBetSlip([]);
  };

  // Auto fill top 3 high-confidence banko picks
  const handleAutoFillBanko = () => {
    const top3 = [...matches]
      .sort((a, b) => b.aiPrediction.confidenceScore - a.aiPrediction.confidenceScore)
      .slice(0, 3)
      .map((m) => ({
        matchId: m.id,
        matchTitle: `${m.homeTeam.name} - ${m.awayTeam.name}`,
        league: m.league,
        pick: m.aiPrediction.mainPick,
        pickLabel: m.aiPrediction.mainPickLabel,
        odds: m.aiPrediction.mainPickOdds,
        confidence: m.aiPrediction.confidenceScore,
      }));
    setBetSlip(top3);
  };

  // Add custom match
  const handleMatchCreated = (newMatch: Match) => {
    setMatches((prev) => [newMatch, ...prev]);
  };

  // Direct special request trigger
  const handleDirectSpecialRequest = (_prompt: string) => {
    setIsSpecialRequestOpen(true);
  };

  // Filter & Search & Sort pipeline
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.stadium.toLowerCase().includes(q)
      );
    }

    // Filter categories
    if (activeFilter === 'banko') {
      result = result.filter((m) => m.aiPrediction.confidenceScore >= 90);
    } else if (activeFilter === 'goals') {
      result = result.filter(
        (m) => m.aiPrediction.over25Probability >= 70 || m.aiPrediction.mainPick.includes('2.5 Üst')
      );
    } else if (activeFilter === 'btts') {
      result = result.filter(
        (m) => m.aiPrediction.bttsProbability >= 70 || m.aiPrediction.mainPick.includes('KG')
      );
    } else if (activeFilter === 'superlig') {
      result = result.filter((m) => m.league.includes('Süper Lig'));
    } else if (activeFilter === 'europe') {
      result = result.filter((m) => !m.league.includes('Süper Lig'));
    } else if (activeFilter === 'value') {
      result = result.filter(
        (m) => m.aiPrediction.aiTag === 'Değerli Oran' || m.aiPrediction.mainPickOdds >= 1.85
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.aiPrediction.confidenceScore - a.aiPrediction.confidenceScore;
      }
      if (sortBy === 'time') {
        return a.time.localeCompare(b.time);
      }
      if (sortBy === 'odds') {
        return b.aiPrediction.mainPickOdds - a.aiPrediction.mainPickOdds;
      }
      if (sortBy === 'goals') {
        return b.aiPrediction.over25Probability - a.aiPrediction.over25Probability;
      }
      return 0;
    });

    return result;
  }, [matches, searchQuery, activeFilter, sortBy]);

  // Featured top match
  const topFeaturedMatch = useMemo(() => {
    return matches.find((m) => m.aiPrediction.aiTag === 'Günün Bankosu') || matches[0];
  }, [matches]);

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 flex flex-col font-sans pb-24 sm:pb-16 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Top Navbar */}
      <Navbar
        matchCount={matches.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshMatches}
        onOpenCustomMatch={() => setIsCustomMatchOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenSpecialRequest={() => setIsSpecialRequestOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* 2. Hero Banner & Filter Controls */}
      <HeroBanner
        topMatch={topFeaturedMatch}
        onOpenMatch={(m) => setDetailMatch(m)}
        onQuickSlip={handleAutoFillBanko}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalMatches={matches.length}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onOpenSpecialRequest={() => setIsSpecialRequestOpen(true)}
        onDirectSpecialRequest={handleDirectSpecialRequest}
      />

      {/* 3. Main Content: Grid of 15 Matches */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Results Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
              {selectedDate === 'today' ? 'Bugünün' : selectedDate === 'tomorrow' ? 'Yarının' : selectedDate} 15 Maç Analizi
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
              {filteredMatches.length} / {matches.length} Maç
            </span>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gemini 3.8 Flash ile otomatik seçilmiş 15 karşılaşma</span>
          </div>
        </div>

        {/* Empty state if search finds nothing */}
        {filteredMatches.length === 0 ? (
          <div className="py-16 text-center space-y-3 glass-panel rounded-2xl border border-slate-800">
            <div className="text-4xl">🔍</div>
            <h3 className="text-base font-bold text-white">Aradığınız kriterlere uygun maç bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Filtreleri sıfırlayabilir veya özel istek analiz motoruna yazarak istediğiniz takımı inceletebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          /* Cards Grid: 1 col on mobile, 2 on tablet, 3 on desktop */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onOpenDetails={(m) => setDetailMatch(m)}
                onOpenSimulation={(m) => setSimulationMatch(m)}
                isInSlip={betSlip.some((it) => it.matchId === match.id)}
                onToggleSlip={handleToggleSlip}
              />
            ))}
          </div>
        )}

      </main>

      {/* 4. Footer Information & Compliance */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-slate-400 font-semibold">FutbolAI Analytics v4.2</span>
          <span>•</span>
          <span>Her Güne 15 Maç Seçimi</span>
          <span>•</span>
          <span>Özel İstek Taktik Analizi</span>
        </div>
        <p className="max-w-xl mx-auto text-[11px] text-slate-600">
          Bu uygulama yapay zeka destekli istatistiki olasılık modellemeleri sunar. Sunulan veriler bilgilendirme amaçlı olup kesin sonuç garantisi içermez. Sorumlu bahis kurallarına uyunuz.
        </p>
      </footer>

      {/* 5. Mobile Bottom Quick Action Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 glass-panel border-t border-slate-800 bg-slate-950/95 p-2 flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={() => {
            soundFX.playClick();
            handleSelectDate('today');
            setActiveFilter('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center space-y-1 p-1 ${
            selectedDate === 'today' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📅</span>
          <span>Bugün</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            handleSelectDate('tomorrow');
            setActiveFilter('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center space-y-1 p-1 ${
            selectedDate === 'tomorrow' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base">⏭️</span>
          <span>Yarın</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            setIsSpecialRequestOpen(true);
          }}
          className="flex flex-col items-center space-y-1 p-1 text-emerald-400 font-black"
        >
          <span className="text-base">✨</span>
          <span>Özel İstek</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            setIsBriefingOpen(true);
          }}
          className="flex flex-col items-center space-y-1 p-1 text-purple-400"
        >
          <span className="text-base">🎙️</span>
          <span>Sesli Bülten</span>
        </button>
      </div>

      {/* 6. Floating Bet Slip Drawer */}
      <BetSlipDrawer
        items={betSlip}
        onRemoveItem={handleRemoveFromSlip}
        onClearSlip={handleClearSlip}
        onAutoFillBanko={handleAutoFillBanko}
      />

      {/* 7. Modals */}
      <MatchDetailModal
        match={detailMatch}
        onClose={() => setDetailMatch(null)}
        onAddToSlip={handleToggleSlip}
        isInSlip={detailMatch ? betSlip.some((it) => it.matchId === detailMatch.id) : false}
      />

      <MatchSimulationModal
        match={simulationMatch}
        onClose={() => setSimulationMatch(null)}
      />

      <CustomMatchModal
        isOpen={isCustomMatchOpen}
        onClose={() => setIsCustomMatchOpen(false)}
        onMatchCreated={handleMatchCreated}
      />

      <DailyBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />

      <SpecialRequestModal
        isOpen={isSpecialRequestOpen}
        onClose={() => setIsSpecialRequestOpen(false)}
        selectedDate={selectedDate}
      />

    </div>
  );
}
