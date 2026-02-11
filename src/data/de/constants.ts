import { IMiniGameConfig, MiniGameType } from '../../types';

export const MINI_GAMES_DE: Record<MiniGameType, IMiniGameConfig> = {
  [MiniGameType.YES_NO]: {
    id: MiniGameType.YES_NO,
    name: "Ja / Nein",
    description: "Beantworte zufällige Fragen und rate dann, was deine Gegner geantwortet haben.",
    isEnabled: true,
    scoringRules: [
        "Wenn du die Antwort eines Freundes richtig errätst: +1 Punkt",
        "Wenn deine Antwort richtig erraten wird: +1 Punkt"
    ]
  },
  [MiniGameType.SUPERLATIVES]: {
    id: MiniGameType.SUPERLATIVES,
    name: "Superlative",
    description: "Fülle die Lücke für den 'Am wahrscheinlichsten...' der Gruppe aus. Mal sehen, ob die anderen zustimmen.",
    isEnabled: true,
    scoringRules: [
        "Wenn die Jury deiner Aussage zustimmt: +1 Punkt",
        "Keine Punkte bei Ablehnung."
    ]
  },
  [MiniGameType.TRIVIA]: {
    id: MiniGameType.TRIVIA,
    name: "Quizmaster",
    description: "Schreibe eine Ja/Nein-Frage. Die anderen versuchen, sie zu beantworten.",
    isEnabled: true,
    scoringRules: [
        "Jede richtige Antwort, die du gibst: +1 Punkt",
        "Wenn die Mehrheit deine Frage richtig beantwortet: +2 Punkte",
        "Wenn die Minderheit richtig antwortet: +1 Punkt",
        "Wenn alle oder niemand richtig antwortet: -1 Punkt"
    ]
  },
  [MiniGameType.WHO_DO_YOU_KNOW]: {
    id: MiniGameType.WHO_DO_YOU_KNOW,
    name: "Wen kennst du",
    description: "Schreibe eine Frage über einen Freund, jemand anderes beantwortet sie.",
    isEnabled: true,
    scoringRules: [
        "Wenn das Ziel 'Richtig' sagt: Fragesteller +1, Antwortender +1 Punkt",
        "Wenn das Ziel 'Einfache Frage' sagt: Nur Antwortender +1 Punkt",
        "Wenn das Ziel 'Falsch' sagt: Keine Punkte"
    ]
  },
  [MiniGameType.WHO_ANSWERED]: {
    id: MiniGameType.WHO_ANSWERED,
    name: "Wer hat geantwortet",
    description: "Ordne anonyme Antworten ihren Besitzern zu.",
    isEnabled: true,
    scoringRules: [
        "Für jede richtige Zuordnung bei deiner eigenen Frage: +1 Punkt",
        "Der Schreiber bekommt keine Punkte, nur der Rater (Fragebesitzer) gewinnt."
    ]
  },
  [MiniGameType.WAGER]: {
    id: MiniGameType.WAGER,
    name: "Wette",
    description: "Riskiere deine Punkte, um die Entscheidungen deiner Freunde zu erraten.",
    isEnabled: true,
    scoringRules: [
        "Richtige Vermutung: Du gewinnst das Doppelte deines Einsatzes.",
        "Falsche Vermutung: Du verlierst deinen Einsatz."
    ]
  },
  [MiniGameType.CHEAT_VOTE]: {
    id: MiniGameType.CHEAT_VOTE,
    name: "Hochstapler-Wahl",
    description: "Der letzte Showdown.",
    isEnabled: true,
    scoringRules: [
        "Die Person mit den meisten Stimmen verliert 1 Punkt für alle 3 Punkte, die sie hat."
    ]
  },
};