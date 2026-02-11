import React from 'react';
import { useGame } from '../context/GameContext';
import { GamePhase, MiniGameType } from '../types';
import { InstructionScreen } from './InstructionScreen';
import { InterstitialScreen } from './InterstitialScreen';
import { TEXTS } from '../data/locales';

// Games
import { YesNoGame } from './games/YesNoGame';
import { SuperlativesGame } from './games/SuperlativesGame';
import { TriviaGame } from './games/TriviaGame';
import { WhoDoYouKnowGame } from './games/WhoDoYouKnowGame';
import { WhoAnsweredGame } from './games/WhoAnsweredGame';
import { WagerGame } from './games/WagerGame';
import { CheatVoteGame } from './games/CheatVoteGame';

export const GameLoopManager: React.FC = () => {
  const { state, dispatch } = useGame();

  // 1. Eğitim Ekranı
  if (state.phase === GamePhase.INSTRUCTION) {
    return <InstructionScreen />;
  }

  // 2. Geçiş Ekranı
  if (state.phase === GamePhase.INTERSTITIAL) {
    return <InterstitialScreen />;
  }

  // Get current player for Score Display
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);

  let ActiveGameComponent: React.FC | null = null;

  switch (state.currentGameId) {
      case MiniGameType.YES_NO:
          ActiveGameComponent = YesNoGame;
          break;
      case MiniGameType.SUPERLATIVES:
          ActiveGameComponent = SuperlativesGame;
          break;
      case MiniGameType.TRIVIA:
          ActiveGameComponent = TriviaGame;
          break;
      case MiniGameType.WHO_DO_YOU_KNOW:
          ActiveGameComponent = WhoDoYouKnowGame;
          break;
      case MiniGameType.WHO_ANSWERED:
          ActiveGameComponent = WhoAnsweredGame;
          break;
      case MiniGameType.WAGER:
          ActiveGameComponent = WagerGame;
          break;
      case MiniGameType.CHEAT_VOTE:
          ActiveGameComponent = CheatVoteGame;
          break;
      default:
          ActiveGameComponent = null;
  }

  const scoreLabel = TEXTS[state.language].common.score;

  return (
    <div className="relative h-dvh w-full bg-zinc-950 overflow-hidden">
        {/* Persistent Score Badge (Visible only during Input phases) */}
        {currentPlayer && state.phase !== GamePhase.RESOLUTION && (
            <div className="absolute top-4 left-4 z-50 pointer-events-none">
                <div className="bg-zinc-900/90 border border-zinc-700/50 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></div>
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">{scoreLabel}</span>
                    <span className="text-white font-mono font-bold text-lg">{currentPlayer.score}</span>
                </div>
            </div>
        )}
        
        {ActiveGameComponent ? (
            <ActiveGameComponent />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Oyun Bulunamadı</h1>
                <button 
                onClick={() => dispatch({type: 'NEXT_GAME'})}
                className="bg-zinc-700 px-4 py-2 rounded text-white">
                Atla
                </button>
            </div>
        )}
    </div>
  );
};