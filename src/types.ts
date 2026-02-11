import React from 'react';

/**
 * CORE ENUMS
 */
export enum ScreenType {
  LOBBY = 'LOBBY',
  GAME_LOOP = 'GAME_LOOP',
  FINAL_SCORE = 'FINAL_SCORE',
  ARCHITECTURE_VIEW = 'ARCHITECTURE_VIEW' 
}

export enum GamePhase {
  INSTRUCTION = 'INSTRUCTION',    // Reading rules
  INPUT = 'INPUT',                // Round 1: Everyone writes
  INTERSTITIAL = 'INTERSTITIAL',  // Pass phone
  INPUT_SECOND_PASS = 'INPUT_SECOND_PASS', // Round 2: Everyone answers (for complex games)
  RESOLUTION = 'RESOLUTION',      // Reveal/Voting
  ROUND_END = 'ROUND_END'
}

export enum MiniGameType {
  YES_NO = 'YES_NO',
  SUPERLATIVES = 'SUPERLATIVES',
  TRIVIA = 'TRIVIA',
  WHO_DO_YOU_KNOW = 'WHO_DO_YOU_KNOW',
  WHO_ANSWERED = 'WHO_ANSWERED',
  WAGER = 'WAGER',
  CHEAT_VOTE = 'CHEAT_VOTE'
}

export type Language = 'TR' | 'EN' | 'DE';

/**
 * ENTITIES
 */
export interface IPlayer {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  isHost: boolean;
}

export interface IMiniGameConfig {
  id: MiniGameType;
  name: string;
  description: string;
  isEnabled: boolean;
  scoringRules?: string[];
}

/**
 * DYNAMIC GAME DATA STRUCTURES
 */
export interface IRoundData {
  [key: string]: any;
}

/**
 * STATE MANAGEMENT
 */
export interface IGameState {
  screen: ScreenType;
  language: Language; // Added Language support
  players: IPlayer[];
  
  // Game Loop Control
  availableGames: MiniGameType[]; // Queue of games to play
  currentGameId: MiniGameType | null;
  phase: GamePhase;
  
  // Turn Management
  roundOrder: string[]; // List of Player IDs in random order for the current game
  currentPlayerIndex: number; // Pointer to roundOrder array
  
  // Data Storage for current game
  gameData: {
    rounds: IRoundData[]; 
    secondRoundData?: IRoundData[]; // Storage for second pass
    assignments?: any[]; // Store matches (Who reads whom)
    pendingInput: null | any;
  };
}

export interface IGameContext {
  state: IGameState;
  dispatch: React.Dispatch<GameAction>;
}

/**
 * ACTIONS
 */
export type GameAction =
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'TOGGLE_GAME'; payload: MiniGameType }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'START_GAME' }
  | { type: 'NEXT_GAME' } 
  | { type: 'NEXT_PHASE' }
  | { type: 'SUBMIT_INPUT'; payload: any }
  | { type: 'CONFIRM_PASS' } 
  | { type: 'UPDATE_SCORE'; payload: { playerId: string; points: number } }
  | { type: 'SET_GAME_DATA'; payload: any }
  | { type: 'RESET_GAME' };