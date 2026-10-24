export type FormResult = 'W' | 'D' | 'L'; // Win, Draw, Loss (Galibiyet, Beraberlik, Mağlubiyet)

export interface TeamInfo {
  name: string;
  shortName: string;
  logo: string;
  color: string;
  rank: number;
  points: number;
  played: number;
  form: FormResult[];
  goalsScored: number;
  goalsConceded: number;
  xG: number;
  injuries: string[];
  keyPlayer: {
    name: string;
    position: string;
    rating: number;
    stat: string;
  };
  attackPower: number; // 0 - 100
  defensePower: number; // 0 - 100
}

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  oddsMovement?: 'home_drop' | 'away_drop' | 'stable';
}

export interface HeadToHead {
  homeWins: number;
  draws: number;
  awayWins: number;
  totalGoals: number;
  lastMatches: {
    date: string;
    score: string;
    competition: string;
  }[];
}

export interface SimulationMomentumPoint {
  minute: number;
  homePressure: number; // -100 to 100 (positive = home, negative = away)
  event?: string;
  type?: 'goal' | 'yellow_card' | 'red_card' | 'chance' | 'substitution';
}

export interface AIPrediction {
  mainPick: string; // e.g. "MS 1", "2.5 Üst", "KG Var"
  mainPickLabel: string; // Turkish descriptive label e.g. "Ev Sahibi Kazanır & 1.5 Üst"
  mainPickOdds: number;
  confidenceScore: number; // 0 - 100
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  expectedScore: string; // "2 - 1"
  winProbability: {
    home: number;
    draw: number;
    away: number;
  };
  bttsProbability: number; // % Karşılıklı Gol Var
  over25Probability: number; // % 2.5 Gol Üst
  firstHalfOver05: number; // % İlk Yarı 0.5 Üst
  expectedCorners: string; // "9.5 Üst"
  expectedCards: string; // "3.5 Alt"
  analysisSummary: string;
  tacticalKey: string;
  weatherCondition: string;
  referee: string;
  refereeCardAvg: number;
  aiTag: 'Günün Bankosu' | 'Gol Festivali' | 'Değerli Oran' | 'Derbi Ateşi' | 'Taktiksel Kilit';
}

export interface Match {
  id: string;
  league: string;
  leagueCountry: string;
  leagueLogo: string;
  round: string;
  date: string;
  time: string;
  stadium: string;
  city: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  odds: MatchOdds;
  aiPrediction: AIPrediction;
  h2h: HeadToHead;
  simulation: SimulationMomentumPoint[];
  isCustom?: boolean;
}

export interface BetSlipItem {
  matchId: string;
  matchTitle: string;
  league: string;
  pick: string;
  pickLabel: string;
  odds: number;
  confidence: number;
}
