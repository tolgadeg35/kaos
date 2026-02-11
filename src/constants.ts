import { IMiniGameConfig, MiniGameType } from './types';

export const MINI_GAMES: Record<MiniGameType, IMiniGameConfig> = {
  [MiniGameType.YES_NO]: {
    id: MiniGameType.YES_NO,
    name: "Evet / Hayır",
    description: "Rastgele soruları cevapla, sonra rakiplerinin ne dediğini tahmin et.",
    isEnabled: true,
    scoringRules: [
        "Bir arkadaşının cevabını doğru tahmin edersen: +1 Puan",
        "Senin cevabın doğru tahmin edilirse: +1 Puan"
    ]
  },
  [MiniGameType.SUPERLATIVES]: {
    id: MiniGameType.SUPERLATIVES,
    name: "Enleri Seç",
    description: "Grubun 'en'lerini belirle. Bakalım diğerleri seninle aynı fikirde mi?",
    isEnabled: true,
    scoringRules: [
        "Tespitin jüri tarafından onaylanırsa: +1 Puan",
        "Reddedilirse puan alamazsın."
    ]
  },
  [MiniGameType.TRIVIA]: {
    id: MiniGameType.TRIVIA,
    name: "Bilgi Yarışması",
    description: "Cevabı 'Evet' veya 'Hayır' olan bir soru yaz. Diğer oyuncular cevaplasın.",
    isEnabled: true,
    scoringRules: [
        "Doğru cevapladığın her soru: +1 Puan",
        "Sorduğun soruyu çoğunluk bilirse: +2 Puan",
        "Sorduğun soruyu azınlık bilirse: +1 Puan",
        "Herkes bilirse veya kimse bilemezse: -1 Puan"
    ]
  },
  [MiniGameType.WHO_DO_YOU_KNOW]: {
    id: MiniGameType.WHO_DO_YOU_KNOW,
    name: "Kimi Tanıyorsun",
    description: "Bir arkadaşın hakkında soru yaz, başkası cevaplasın.",
    isEnabled: true,
    scoringRules: [
        "Hakkında soru sorulan kişi 'Doğru' derse: Soran +1, Cevaplayan +1 Puan",
        "Hakkında soru sorulan kişi 'Basit Soru' derse: Sadece Cevaplayan +1 Puan",
        "Hakkında soru sorulan kişi 'Yanlış' derse: Puan yok"
    ]
  },
  [MiniGameType.WHO_ANSWERED]: {
    id: MiniGameType.WHO_ANSWERED,
    name: "Cevaplayan Kim",
    description: "Anonim cevapları sahipleriyle eşleştir.",
    isEnabled: true,
    scoringRules: [
        "Kendi soruna gelen cevapların sahiplerini doğru eşleştirdiğin her kişi için: +1 Puan",
        "Cevabı yazan kişi puan almaz, sadece tahmin eden (soru sahibi) puan kazanır."
    ]
  },
  [MiniGameType.WAGER]: {
    id: MiniGameType.WAGER,
    name: "Bahis",
    description: "Puanlarını riske atarak arkadaşlarının seçimlerini tahmin et.",
    isEnabled: true,
    scoringRules: [
        "Doğru tahmin edersen: Yatırdığın miktar kadar puan kazanırsın.",
        "Yanlış tahmin edersen: Yatırdığın miktar kadar puan kaybedersin."
    ]
  },
  [MiniGameType.CHEAT_VOTE]: {
    id: MiniGameType.CHEAT_VOTE,
    name: "Hileci Oylaması",
    description: "Oyun sonu hesaplaşması.",
    isEnabled: true,
    scoringRules: [
        "En çok oy alan kişilerin, sahip oldukları her 3 puan için 1 puanı silinir."
    ]
  },
};

export const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Oyuncu 1', score: 0, isHost: true },
  { id: 'p2', name: 'Oyuncu 2', score: 0, isHost: false },
  { id: 'p3', name: 'Oyuncu 3', score: 0, isHost: false },
];