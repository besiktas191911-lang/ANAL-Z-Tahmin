import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_15_MATCHES } from './src/data/initialMatches.ts';
import { TOMORROW_15_MATCHES } from './src/data/multiDayMatches.ts';
import { Match } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory match stores per date key
const matchesByDate: Record<string, Match[]> = {
  today: JSON.parse(JSON.stringify(INITIAL_15_MATCHES)),
  tomorrow: JSON.parse(JSON.stringify(TOMORROW_15_MATCHES)),
};

// Shared Gemini client utility
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. GET /api/matches - Fetch 15 daily matches by date key ('today' | 'tomorrow' | 'YYYY-MM-DD')
app.get('/api/matches', (req, res) => {
  const dateKey = (req.query.date as string) || 'today';
  
  if (!matchesByDate[dateKey]) {
    // Dynamically generate 15 matches for this specific date based on templates
    matchesByDate[dateKey] = INITIAL_15_MATCHES.map((m, idx) => ({
      ...m,
      id: `m-${dateKey}-${idx + 1}`,
      date: dateKey === 'today' ? 'Bugün' : dateKey === 'tomorrow' ? 'Yarın' : dateKey,
    }));
  }

  const list = matchesByDate[dateKey];
  res.json({
    success: true,
    date: dateKey,
    count: list.length,
    updatedAt: new Date().toISOString(),
    matches: list,
  });
});

// 2. POST /api/matches/refresh - Simulate live odds & metric updates for a given day
app.post('/api/matches/refresh', (req, res) => {
  const dateKey = (req.query.date as string) || req.body?.date || 'today';
  const currentList = matchesByDate[dateKey] || matchesByDate['today'];

  matchesByDate[dateKey] = currentList.map((m) => {
    const delta = (Math.random() - 0.5) * 0.08;
    const newHome = Math.max(1.15, Number((m.odds.home + delta).toFixed(2)));
    const newAway = Math.max(1.20, Number((m.odds.away - delta).toFixed(2)));
    const shift = delta > 0.02 ? 'home_drop' : delta < -0.02 ? 'away_drop' : 'stable';
    return {
      ...m,
      odds: {
        ...m.odds,
        home: newHome,
        away: newAway,
        oddsMovement: shift,
      },
    };
  });

  res.json({ success: true, date: dateKey, matches: matchesByDate[dateKey] });
});

// 3. POST /api/ai/special-request - Dedicated On-Demand Custom Request & Analysis Engine
app.post('/api/ai/special-request', async (req, res) => {
  const { requestText, dateKey } = req.body;

  if (!requestText || !requestText.trim()) {
    return res.status(400).json({ error: 'Özel istek metni belirtilmedi.' });
  }

  const targetDate = dateKey || 'today';
  const currentList = matchesByDate[targetDate] || matchesByDate['today'];
  const matchesContext = currentList
    .slice(0, 10)
    .map(
      (m, i) =>
        `${i + 1}. [${m.league}] ${m.homeTeam.name} vs ${m.awayTeam.name} (Ana Tercih: ${m.aiPrediction.mainPick}, Oran: ${m.aiPrediction.mainPickOdds}, Güven: %${m.aiPrediction.confidenceScore}, xG: ${m.homeTeam.xG}-${m.awayTeam.xG})`
    )
    .join('\n');

  const prompt = `Sen dünya çapında tanınan bir Futbol Taktik Uzmanı, Veri Analisti ve Yapay Zeka Danışmanısın.
Kullanıcının özel isteği / analizi:
"${requestText}"

Günün 15 Maçlık Bülten Özeti:
${matchesContext}

GÖREVİN:
Kullanıcının bu özel isteğine tam odaklanan, son derece zengin, profesyonel, istatistiksel ve taktiksel bir Türkçe analiz hazırla.
1. İsteği analiz et ve net bir başlık koy.
2. Özel Taktiksel Değerlendirme & xG Projeksiyonları sun.
3. Somut Tahmin ve Öneriler listele (Banko, Sürpriz/Değerli Oran, Skor, vb.).
4. Dikkat edilmesi gereken Risk Faktörleri ve Kilit Uyarıları belirt.
5. Samimi, enerjik ve güvenilir bir futbol dili kullan.`;

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Sen profesyonel bir spor yapay zekasısın. Yanıtların doyurucu, futbol jargonuna hakim, analitik ve kullanıcıya değer katan seviyede olsun.',
        },
      });

      return res.json({
        success: true,
        answer: response.text || 'Analiz oluşturulamadı.',
        source: 'gemini-3.8-flash',
      });
    } catch (err) {
      console.error('Special Request Gemini error:', err);
    }
  }

  // Fallback if API key is not ready
  const fallback = `🎯 **Özel İstek Analizi: "${requestText}"**

📊 **Yapay Zeka Taktiksel İncelemesi**:
Talebinizi günün 15 maçlık derin bülteni ve takımların son 5 haftalık metrikleri üzerinden taradık:
- **xG ve Hücum Üretkenliği**: Yüksek baskı kuran ev sahipleri (%62 topla oynama) erken dakikalarda skor üretmeye daha yatkın.
- **Taktiksel Öneri**: İsteğiniz doğrultusunda en optimize kombinasyon **1.5 Üst & KG Var** türevi seçeneklerdir.

💡 **Öne Çıkan Değerler**:
1. **Galatasaray - Başakşehir**: Erken baskı ve duran top üstünlüğü. (MS 1 & 1.5 Üst)
2. **Real Madrid - Barcelona**: Geçiş savunmalarındaki açıklar 2.5 Üst için zemin hazırlıyor.
3. **Arsenal - Man City**: Kademeli savunma ve korner potansiyeli yüksek.

⚠️ **Risk Yönetimi**: Kasa yönetiminde orantılı birim dağılımı yapmanız tavsiye edilir.`;

  return res.json({
    success: true,
    answer: fallback,
    source: 'ai-engine-fallback',
  });
});

// 4. POST /api/ai/analyze - Deep analysis via Gemini 3.8 Flash for specific match
app.post('/api/ai/analyze', async (req, res) => {
  const { matchId, homeName, awayName, league, dateKey } = req.body;
  const currentList = matchesByDate[dateKey || 'today'] || matchesByDate['today'];
  const match = currentList.find((m) => m.id === matchId);

  const prompt = `Sen profesyonel bir UEFA Pro Lisanslı futbol taktik analiz uzmanı ve yapay zeka spor istatistikçisisin.
Maç: ${homeName || match?.homeTeam.name} vs ${awayName || match?.awayTeam.name}
Lig: ${league || match?.league || 'Süper Lig'}

Aşağıdaki başlıklarda Türkçe, son derece profesyonel, veri odaklı ve akıcı bir maç öncesi derin analizi hazırla:
1. Taktiksel Çarpışma ve Saha Geometrisi (Pres hatları, pas kanalları)
2. Beklenen Gol (xG) ve Tehlikeli Bölge Hücumları
3. Kilit Oyuncu Eşleşmeleri ve Bireysel Düellolar
4. Hakem, Hava Durumu ve Zemin Faktörü
5. Yapay Zeka Skor ve Bahis Tahmini (Banko Tercih, Alternatif Sürpriz, Korner & Kart Beklentisi)`;

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Sen dünya standartlarında bir spor istatistiği ve futbol analizi yapay zekasısın.',
        },
      });

      return res.json({
        success: true,
        analysis: response.text || '',
        source: 'gemini-3.8-flash',
      });
    } catch (error) {
      console.error('Gemini API Error:', error);
    }
  }

  // Fallback
  const fallback = `📊 **Taktiksel Çarpışma & Saha Analizi**:
${match?.homeTeam.name || homeName}, iç sahada ortalama %58 topla oynama ve 2.1 xG üretim kapasitesiyle sahaya çıkıyor. ${match?.awayTeam.name || awayName} ise hızlı kanat geçişleri ve duran top etkinlikleriyle karşılık verecek.

🎯 **Gol Beklentisi & xG Projeksiyonu**:
Yapay zeka modelleme simülasyonlarımız maçta her iki takımın da en az birer net gol pozisyonu üreteceğini (%78 ihtimalle) göstermektedir. 

🔮 **Yapay Zeka Nihai Önerisi**:
- **Ana Tercih**: ${match?.aiPrediction.mainPick || '2.5 Üst & KG Var'}
- **Güven Seviyesi**: %${match?.aiPrediction.confidenceScore || 89}
- **Tahmini Skor**: ${match?.aiPrediction.expectedScore || '2 - 1'}`;

  return res.json({
    success: true,
    analysis: fallback,
    source: 'ai-engine-fallback',
  });
});

// 5. POST /api/ai/ask - Interactive AI Football Chat Assistant
app.post('/api/ai/ask', async (req, res) => {
  const { question, matchContext } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Soru belirtilmedi.' });
  }

  const prompt = `Sen kullanıcıya maç öncesi taktiksel danışmanlık yapan bir Futbol Yapay Zekasısın.
Kullanıcının sorusu: "${question}"
${matchContext ? `İlgili Maç Bilgisi:\n${JSON.stringify(matchContext)}` : ''}

Lütfen soruya net, somut istatistiklere ve mantıklı futbol gerekçelerine dayanan, Türkçe, samimi ve güven veren bir yanıt ver. (Maksimum 3-4 paragraf)`;

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        success: true,
        answer: response.text || 'Analiz yanıtı oluşturulamadı.',
        source: 'gemini-3.8-flash',
      });
    } catch (err) {
      console.error('Ask Gemini Error:', err);
    }
  }

  return res.json({
    success: true,
    answer: `🤖 **Yapay Zeka Taktiksel Görüşü:**
"${question}" sorunuzu analiz ettiğimizde:
1. Takımların son haftalık pas isabeti ve ceza sahasına giriş istatistikleri yüksek tempolu bir mücadeleyi destekliyor.
2. İlk 30 dakikada yaşanacak yüksek pres, maçın gol beklentisini doğrudan artıracaktır.
3. Risk analizi açısından kademeli bahis veya 1.5 Gol Üstü / KG Var kombinasyonu güvenli liman görünümündedir.`,
    source: 'ai-engine-fallback',
  });
});

// 6. POST /api/ai/briefing - Daily Audio/Podcast Script
app.post('/api/ai/briefing', async (req, res) => {
  const dateKey = (req.body?.date as string) || 'today';
  const currentList = matchesByDate[dateKey] || matchesByDate['today'];
  const topMatches = currentList
    .slice(0, 5)
    .map(
      (m) =>
        `${m.homeTeam.name} vs ${m.awayTeam.name} (${m.aiPrediction.mainPick}, Güven: %${m.aiPrediction.confidenceScore})`
    )
    .join('\n');

  const prompt = `Sen FutbolAI radyo bülteni sunucususun. Günün 15 maçlık bülteninden en öne çıkan 3 maçı ve günün bankosunu dinleyicilere enerjik, samimi ve heyecanlı bir dille 1 dakikalık sesli özet bülteni olarak hazırla.
Seçilen Tarih: ${dateKey === 'today' ? 'Bugün' : dateKey === 'tomorrow' ? 'Yarın' : dateKey}
Maçlar:
${topMatches}

Başlangıç: "FutbolAI Günlük Sesli Maç Öncesi Bültenine hoş geldiniz! Bugün yeşil sahalarda nefesler tutulacak..."`;

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      return res.json({
        success: true,
        script: response.text,
      });
    } catch (err) {
      console.error('Briefing error:', err);
    }
  }

  res.json({
    success: true,
    script: `🎙️ **FutbolAI Günlük Sesli Maç Öncesi Bülteni**:\n\n"FutbolAI bültenine hoş geldiniz! Bugün yeşil sahalarda nefesler tutulacak. Günün öne çıkan 15 karşılaşmasında yapay zeka modellememiz çok net sinyaller veriyor.\n\n🔥 **Günün Bankosu**: Sahasında 12 maçtır kazanan Galatasaray'ın mücadelesi 'MS 1 & 1.5 Üst' tercihiyle günün en sağlam kalesi.\n\n⚽ **Gol Bombası**: Bernabéu ve Allianz Arena'da savunma arkası boşluklar 2.5 Üst ve KG Var için biçilmiş kaftan.\n\n💎 **Sürpriz Değer**: İtalya derbisinde 1.95 oranıyla günün en değerli oran fırsatı parlıyor. Herkese bol şans!"`,
  });
});

// 7. POST /api/ai/custom-match - Generate custom match analysis
app.post('/api/ai/custom-match', async (req, res) => {
  const { homeTeamName, awayTeamName, league, dateKey } = req.body;
  if (!homeTeamName || !awayTeamName) {
    return res.status(400).json({ error: 'Takım isimleri gereklidir.' });
  }

  const prompt = `İki futbol takımı için maç öncesi analiz verisi üret:
Ev Sahibi: ${homeTeamName}
Deplasman: ${awayTeamName}
Lig: ${league || 'Süper Lig / Avrupa'}

JSON formatında aşağıdaki yapıda yanıt ver (SADECE geçerli JSON döndür):
{
  "mainPick": "örnek: MS 1 & 2.5 Üst",
  "mainPickLabel": "örnek: Ev Sahibi Kazanır ve 2.5 Üst",
  "mainPickOdds": 1.85,
  "confidenceScore": 88,
  "riskLevel": "Düşük",
  "expectedScore": "2 - 1",
  "winProbability": { "home": 52, "draw": 26, "away": 22 },
  "bttsProbability": 72,
  "over25Probability": 68,
  "analysisSummary": "Kısa taktiksel özet...",
  "tacticalKey": "Kritik taktiksel detay...",
  "weatherCondition": "15°C Açık",
  "expectedCorners": "9.5 Üst",
  "expectedCards": "4.5 Alt"
}`;

  let parsedData = null;
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text?.trim() || '';
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error('Custom match generation failed:', e);
    }
  }

  const targetDateKey = dateKey || 'today';
  const customMatch: Match = {
    id: `custom-${Date.now()}`,
    league: league || 'Özel Analiz',
    leagueCountry: 'Dünya',
    leagueLogo: '🌍',
    round: 'Maç Öncesi',
    date: targetDateKey === 'today' ? 'Bugün' : targetDateKey === 'tomorrow' ? 'Yarın' : targetDateKey,
    time: '21:00',
    stadium: `${homeTeamName} Stadyumu`,
    city: 'Merkez',
    isCustom: true,
    homeTeam: {
      name: homeTeamName,
      shortName: homeTeamName.substring(0, 3).toUpperCase(),
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
      color: '#10b981',
      rank: 4,
      points: 45,
      played: 24,
      form: ['W', 'W', 'D', 'W', 'L'],
      goalsScored: 42,
      goalsConceded: 22,
      xG: 1.85,
      injuries: [],
      keyPlayer: { name: 'Kilit Oyuncu', position: 'Santrfor', rating: 8.4, stat: '10 Gol' },
      attackPower: 84,
      defensePower: 80,
    },
    awayTeam: {
      name: awayTeamName,
      shortName: awayTeamName.substring(0, 3).toUpperCase(),
      logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=120&q=80',
      color: '#3b82f6',
      rank: 5,
      points: 43,
      played: 24,
      form: ['W', 'D', 'L', 'W', 'W'],
      goalsScored: 39,
      goalsConceded: 25,
      xG: 1.65,
      injuries: [],
      keyPlayer: { name: 'Kilit Oyuncu', position: 'Kanat', rating: 8.2, stat: '8 Gol, 5 Asist' },
      attackPower: 81,
      defensePower: 79,
    },
    odds: {
      home: 2.10,
      draw: 3.30,
      away: 3.40,
      over25: 1.75,
      under25: 2.05,
      bttsYes: 1.65,
      bttsNo: 2.15,
      oddsMovement: 'stable',
    },
    aiPrediction: {
      mainPick: parsedData?.mainPick || '2.5 Üst & KG Var',
      mainPickLabel: parsedData?.mainPickLabel || 'Toplam 2.5 Üst & KG Var',
      mainPickOdds: parsedData?.mainPickOdds || 1.80,
      confidenceScore: parsedData?.confidenceScore || 87,
      riskLevel: parsedData?.riskLevel || 'Düşük',
      expectedScore: parsedData?.expectedScore || '2 - 1',
      winProbability: parsedData?.winProbability || { home: 48, draw: 28, away: 24 },
      bttsProbability: parsedData?.bttsProbability || 74,
      over25Probability: parsedData?.over25Probability || 68,
      firstHalfOver05: 80,
      expectedCorners: parsedData?.expectedCorners || '9.5 Üst',
      expectedCards: parsedData?.expectedCards || '3.5 Üst',
      analysisSummary: parsedData?.analysisSummary || `${homeTeamName} ve ${awayTeamName} arasındaki mücadelede yapay zeka modellemesi hücum gücü yüksek, iki taraflı tempolu bir karşılaşma öngörmektedir.`,
      tacticalKey: parsedData?.tacticalKey || 'Hızlı kanat akınları ve orta saha presi belirleyici olacaktır.',
      weatherCondition: parsedData?.weatherCondition || '15°C Açık',
      referee: 'FIFA Hakemi',
      refereeCardAvg: 4.2,
      aiTag: 'Taktiksel Kilit',
    },
    h2h: {
      homeWins: 3,
      draws: 2,
      awayWins: 3,
      totalGoals: 21,
      lastMatches: [
        { date: '12.11.2025', score: '2 - 1', competition: 'Lig' },
        { date: '14.04.2025', score: '1 - 1', competition: 'Lig' },
      ],
    },
    simulation: [
      { minute: 15, homePressure: 40, event: 'İlk tehlikeli atak', type: 'chance' },
      { minute: 34, homePressure: 70, event: 'GOL! Ev sahibi öne geçti', type: 'goal' },
      { minute: 61, homePressure: -50, event: 'GOL! Deplasman beraberliği yakaladı', type: 'goal' },
      { minute: 82, homePressure: 75, event: 'GOL! Son dakikalarda galibiyet sayısı geldi', type: 'goal' },
    ],
  };

  if (!matchesByDate[targetDateKey]) {
    matchesByDate[targetDateKey] = [];
  }
  matchesByDate[targetDateKey].unshift(customMatch);
  res.json({ success: true, match: customMatch });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚽ FutbolAI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
