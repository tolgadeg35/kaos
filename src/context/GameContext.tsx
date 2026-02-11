import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  IGameState, 
  GameAction, 
  ScreenType, 
  GamePhase, 
  MiniGameType,
  IGameContext,
  Language
} from '../types';
import { DEFAULT_PLAYERS, MINI_GAMES } from '../constants';
import { shuffle } from '../services/matchingService';

const initialState: IGameState = {
  screen: ScreenType.LOBBY,
  language: 'TR', // Default language
  players: DEFAULT_PLAYERS,
  availableGames: Object.keys(MINI_GAMES).map(k => k as MiniGameType),
  currentGameId: null,
  phase: GamePhase.INSTRUCTION,
  roundOrder: [],
  currentPlayerIndex: 0,
  gameData: {
    rounds: [],
    pendingInput: null,
  },
};

const gameReducer = (state: IGameState, action: GameAction): IGameState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };

    case 'ADD_PLAYER':
      const newPlayerId = `p${Date.now()}`;
      return {
        ...state,
        players: [
          ...state.players,
          { id: newPlayerId, name: action.payload || `Player ${state.players.length + 1}`, score: 0, isHost: false }
        ]
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload)
      };

    case 'TOGGLE_GAME':
      const isEnabled = state.availableGames.includes(action.payload);
      return {
        ...state,
        availableGames: isEnabled
          ? state.availableGames.filter(g => g !== action.payload)
          : [...state.availableGames, action.payload]
      };

    case 'START_GAME': {
      const selectedGames = state.availableGames;
      const fixedEndGames = [MiniGameType.WAGER, MiniGameType.CHEAT_VOTE];
      const gamesToShuffle = selectedGames.filter(g => !fixedEndGames.includes(g));
      const shuffledGames = shuffle(gamesToShuffle);
      
      if (selectedGames.includes(MiniGameType.WAGER)) shuffledGames.push(MiniGameType.WAGER);
      if (selectedGames.includes(MiniGameType.CHEAT_VOTE)) shuffledGames.push(MiniGameType.CHEAT_VOTE);

      if (shuffledGames.length === 0) return state;

      const initialRoundOrder = shuffle(state.players.map(p => p.id));

      return {
        ...state,
        screen: ScreenType.GAME_LOOP,
        availableGames: shuffledGames,
        currentGameId: shuffledGames[0],
        phase: GamePhase.INSTRUCTION,
        roundOrder: initialRoundOrder,
        currentPlayerIndex: 0,
        gameData: { rounds: [], pendingInput: null }
      };
    }

    case 'NEXT_GAME': {
      const remainingGames = state.availableGames.slice(1);

      if (remainingGames.length === 0) {
        return { ...state, screen: ScreenType.FINAL_SCORE };
      }

      const nextRoundOrder = shuffle(state.players.map(p => p.id));

      return {
        ...state,
        availableGames: remainingGames,
        currentGameId: remainingGames[0],
        phase: GamePhase.INSTRUCTION,
        roundOrder: nextRoundOrder,
        currentPlayerIndex: 0,
        gameData: { rounds: [], pendingInput: null }
      };
    }

    case 'NEXT_PHASE':
      if (state.phase === GamePhase.INSTRUCTION) {
        return { ...state, phase: GamePhase.INTERSTITIAL, currentPlayerIndex: 0 };
      }
      if (state.phase === GamePhase.INTERSTITIAL) {
        return state; 
      }
      return state;

    case 'CONFIRM_PASS':
      // Interstitial'dan çıkış. Hangi faza gideceğiz?
      
      let nextPhase = GamePhase.INPUT;
      
      // Çok turlu oyun kontrolü
      const multiStageGames = [
          MiniGameType.WHO_DO_YOU_KNOW, 
          MiniGameType.WHO_ANSWERED, 
          MiniGameType.WAGER,
          MiniGameType.SUPERLATIVES,
          MiniGameType.TRIVIA,
          MiniGameType.YES_NO // Added YES_NO here
      ];
      const isMultiStage = state.currentGameId && multiStageGames.includes(state.currentGameId);
      
      if (isMultiStage && state.gameData.rounds.length === state.players.length) {
         nextPhase = GamePhase.INPUT_SECOND_PASS;
      }

      return {
        ...state,
        phase: nextPhase
      };

    case 'SUBMIT_INPUT': {
        const nextIdx = state.currentPlayerIndex + 1;
        
        // Hangi array'i dolduruyoruz?
        const isSecondPass = state.phase === GamePhase.INPUT_SECOND_PASS;
        
        let newGameData = { ...state.gameData };
        
        if (isSecondPass) {
            newGameData.secondRoundData = action.payload ? [...(state.gameData.secondRoundData || []), action.payload] : state.gameData.secondRoundData;
        } else {
            newGameData.rounds = action.payload ? [...state.gameData.rounds, action.payload] : state.gameData.rounds;
        }

        // Tur bitti mi?
        if (nextIdx < state.roundOrder.length) {
            // Sonraki oyuncuya geç (Araya interstitial girer)
            return {
                ...state,
                currentPlayerIndex: nextIdx,
                phase: GamePhase.INTERSTITIAL, 
                gameData: newGameData
            };
        } else {
            // TÜM OYUNCULAR BU TURU BİTİRDİ
            
            // Eğer bu ilk tursa ve oyun çok turluysa:
            const multiStageGamesCheck = [
                MiniGameType.WHO_DO_YOU_KNOW, 
                MiniGameType.WHO_ANSWERED, 
                MiniGameType.WAGER,
                MiniGameType.SUPERLATIVES,
                MiniGameType.TRIVIA,
                MiniGameType.YES_NO // Added YES_NO here as well
            ];
            const isMultiStageCheck = state.currentGameId && multiStageGamesCheck.includes(state.currentGameId);

            if (isMultiStageCheck && !isSecondPass) {
                 return {
                     ...state,
                     phase: GamePhase.INTERSTITIAL, // "Telefonu ilk kişiye ver"
                     currentPlayerIndex: 0,
                     gameData: newGameData
                 };
            }

            // Aksi halde Çözümleme
            return {
                ...state,
                phase: GamePhase.RESOLUTION,
                currentPlayerIndex: 0,
                gameData: newGameData
            };
        }
    }

    case 'SET_GAME_DATA':
        return {
            ...state,
            gameData: { ...state.gameData, ...action.payload }
        };

    case 'UPDATE_SCORE':
        return {
            ...state,
            players: state.players.map(p => 
                p.id === action.payload.playerId 
                ? { ...p, score: p.score + action.payload.points }
                : p
            )
        };

    case 'RESET_GAME':
        return {
            ...initialState,
            language: state.language, // Keep selected language
            players: state.players,
            availableGames: state.availableGames
        };

    default:
      return state;
  }
};

const GameContext = createContext<IGameContext | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};