import React from 'react';
import { useGame } from '../context/GameContext';
import { MINI_GAMES } from '../constants';
import { MINI_GAMES_EN } from '../data/en/constants';
import { MINI_GAMES_DE } from '../data/de/constants';
import { TEXTS } from '../data/locales';

export const InstructionScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const GAMES = state.language === 'EN' ? MINI_GAMES_EN : state.language === 'DE' ? MINI_GAMES_DE : MINI_GAMES;
  const currentGame = state.currentGameId ? GAMES[state.currentGameId] : null;
  const T = TEXTS[state.language].instruction;

  if (!currentGame) return null;

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-8 pb-40 flex flex-col items-center text-center z-10">
        <div className="mb-6 px-4 py-1.5 bg-red-950/50 border border-red-800/50 rounded-full text-red-400 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shrink-0">
            {T.nextGame}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight text-white drop-shadow-xl shrink-0">
          {currentGame.name}
        </h1>
        
        <div className="bg-zinc-900/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>
            
            <p className="text-lg md:text-xl leading-relaxed font-medium text-zinc-200 mb-6">
            {currentGame.description}
            </p>

            {/* Scoring Rules Section */}
            {currentGame.scoringRules && (
                <div className="pt-6 border-t border-white/5 text-left">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">
                        {T.scoringHeader}
                    </h3>
                    <ul className="space-y-3">
                        {currentGame.scoringRules.map((rule, idx) => (
                            <li key={idx} className="text-sm text-zinc-300 flex items-start gap-3">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_5px_red]"></span>
                                <span className="leading-snug">{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        
         <p className="mt-8 text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse shrink-0">
            {T.voiceHint}
        </p>
      </div>

      {/* Fixed Bottom Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20">
        <button 
            onClick={() => dispatch({ type: 'NEXT_PHASE' })}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform active:scale-95 tracking-widest uppercase">
            {T.startButton}
        </button>
      </div>
    </div>
  );
};