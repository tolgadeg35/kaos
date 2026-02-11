import { IMiniGameConfig, MiniGameType } from '../../types';

export const MINI_GAMES_EN: Record<MiniGameType, IMiniGameConfig> = {
  [MiniGameType.YES_NO]: {
    id: MiniGameType.YES_NO,
    name: "Yes / No",
    description: "Answer random questions, then guess what your opponents answered.",
    isEnabled: true,
    scoringRules: [
        "Correctly guessing a friend's answer: +1 Point",
        "If your answer is guessed correctly: +1 Point"
    ]
  },
  [MiniGameType.SUPERLATIVES]: {
    id: MiniGameType.SUPERLATIVES,
    name: "Most Likely To",
    description: "Fill in the blank for the group's 'most likely'. Let's see if others agree.",
    isEnabled: true,
    scoringRules: [
        "If the jury approves your statement: +1 Point",
        "No points if rejected."
    ]
  },
  [MiniGameType.TRIVIA]: {
    id: MiniGameType.TRIVIA,
    name: "Quiz Master",
    description: "Write a Yes/No question. Others try to answer it.",
    isEnabled: true,
    scoringRules: [
        "Each correct answer you give: +1 Point",
        "If majority answers your question correctly: +2 Points",
        "If minority answers correctly: +1 Point",
        "If everyone or no one answers correctly: -1 Point"
    ]
  },
  [MiniGameType.WHO_DO_YOU_KNOW]: {
    id: MiniGameType.WHO_DO_YOU_KNOW,
    name: "Who Do You Know",
    description: "Write a question about a friend, someone else answers it.",
    isEnabled: true,
    scoringRules: [
        "If target says 'Correct': Asker +1, Answerer +1 Point",
        "If target says 'Basic Question': Only Answerer +1 Point",
        "If target says 'Wrong': No points"
    ]
  },
  [MiniGameType.WHO_ANSWERED]: {
    id: MiniGameType.WHO_ANSWERED,
    name: "Who Answered",
    description: "Match anonymous answers to their owners.",
    isEnabled: true,
    scoringRules: [
        "For each correct match on your own question: +1 Point",
        "The writer gets no points, only the guesser (question owner) wins."
    ]
  },
  [MiniGameType.WAGER]: {
    id: MiniGameType.WAGER,
    name: "Wager",
    description: "Risk your points to guess your friends' choices.",
    isEnabled: true,
    scoringRules: [
        "Correct guess: You win double your wager.",
        "Wrong guess: You lose your wager amount."
    ]
  },
  [MiniGameType.CHEAT_VOTE]: {
    id: MiniGameType.CHEAT_VOTE,
    name: "Imposter Vote",
    description: "Final showdown.",
    isEnabled: true,
    scoringRules: [
        "The most voted person loses 1 point for every 3 points they have."
    ]
  },
};