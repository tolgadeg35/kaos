import React from 'react';
import { useGame } from '../context/GameContext';
import { TEXTS } from '../data/locales';

export const FinalScoreScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const T = TEXTS[state.language].final;
  const T_COMMON = TEXTS[state.language].common;

  // Sort players by score
  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  
  const highestScore = sortedPlayers[0]?.score || 0;
  const winners = sortedPlayers.filter(p => p.score === highestScore);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden relative">
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-6 z-10 w-full max-w-2xl mx-auto overflow-y-auto scrollbar-hide">
        
        {/* WINNERS TOP SECTION */}
        <div className="mb-8 w-full text-center pt-10">
            <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827 1.035l-1.74 3.258 2.153 3.192a1 1 0 01-.914 1.768L14 11.235V17a1 1 0 01-1 1H7a1 1 0 01-1-1v-5.765l-3.98 2.62a1 1 0 01-.913-1.768l2.153-3.192-1.74-3.258a1 1 0 011.827-1.035l1.699 3.181L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            </div>

            <h2 className="text-yellow-600 font-black tracking-[0.5em] uppercase text-xs mb-4">
                {winners.length > 1 ? T.winners : T.champion}
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-4">
                {winners.map((winner) => (
                    <div key={winner.id} className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-zinc-900 border-4 border-yellow-500 flex items-center justify-center mb-2">
                             <span className="text-4xl font-black text-white">
                                {winner.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {winner.name}
                        </h1>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <span className="inline-block bg-zinc-900 px-6 py-2 rounded-full text-yellow-500 font-mono font-bold text-2xl tracking-widest border border-zinc-800">
                    {highestScore} {T_COMMON.points}
                </span>
            </div>
        </div>

        {/* FULL LEADERBOARD */}
        <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 bg-zinc-950/50 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">
                <span>{T.rank}</span>
                <span>{T_COMMON.score}</span>
            </div>
            <div className="divide-y divide-zinc-800">
                {sortedPlayers.map((p, idx) => {
                    const rank = idx + 1;
                    const isWinner = p.score === highestScore;
                    
                    return (
                        <div key={p.id} className={`flex items-center justify-between p-4 ${isWinner ? 'bg-yellow-900/10' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center rounded font-black text-sm ${
                                    rank === 1 ? 'bg-yellow-500 text-black' : 
                                    rank === 2 ? 'bg-zinc-400 text-black' : 
                                    rank === 3 ? 'bg-orange-700 text-white' : 
                                    'bg-zinc-800 text-zinc-500'
                                }`}>
                                    {rank}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={`font-bold leading-none ${isWinner ? 'text-yellow-500' : 'text-zinc-200'}`}>
                                        {p.name}
                                    </span>
                                </div>
                            </div>
                            <span className={`font-mono font-bold text-lg ${isWinner ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                {p.score}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>

      <div className="p-6 bg-zinc-900 border-t border-zinc-800 z-30">
          <button 
            onClick={() => dispatch({ type: 'RESET_GAME' })}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg uppercase tracking-wider">
            {T.newGame}
          </button>
      </div>
    </div>
  );
};