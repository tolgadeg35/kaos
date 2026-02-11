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
      
      {/* Content Area - Scrollable */}
      <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto scrollbar-hide px-6 pt-6 pb-40">
        
        {/* WINNERS TOP SECTION */}
        <div className="mb-8 w-full text-center">
            <div className="flex justify-center mb-4">
                {/* Crown Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.9998 3L8.99977 9L3.00391 6L5.00391 18H18.9957L20.9957 6L14.9998 9L11.9998 3Z" stroke="none"/>
                    <path d="M4.83984 19H19.1598C19.8298 19 20.2898 19.64 20.0698 20.26L19.7298 21.26C19.5598 21.72 19.1098 22 18.6198 22H5.37984C4.88984 22 4.43984 21.72 4.26984 21.26L3.92984 20.26C3.70984 19.64 4.16984 19 4.83984 19Z" stroke="none"/>
                </svg>
            </div>

            <h2 className="text-yellow-600 font-black tracking-[0.5em] uppercase text-xs mb-6">
                {winners.length > 1 ? T.winners : T.champion}
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
                {winners.map((winner) => (
                    <div key={winner.id} className="flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-900 border-4 border-yellow-500 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(234,179,8,0.3)] relative">
                             {/* Small crown on avatar */}
                             <div className="absolute -top-4 text-2xl">👑</div>
                             <span className="text-4xl font-black text-white">
                                {winner.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                            {winner.name}
                        </h1>
                    </div>
                ))}
            </div>

            <div className="mt-2">
                <span className="inline-block bg-zinc-900/80 px-8 py-3 rounded-2xl text-yellow-500 font-mono font-black text-3xl tracking-widest border border-yellow-500/30 shadow-lg">
                    {highestScore} <span className="text-sm text-zinc-500 ml-1">{T_COMMON.points}</span>
                </span>
            </div>
        </div>

        {/* FULL LEADERBOARD */}
        <div className="w-full bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="px-5 py-4 bg-zinc-950/80 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between sticky top-0 z-10">
                <span>{T.rank}</span>
                <span>{T_COMMON.score}</span>
            </div>
            <div className="divide-y divide-zinc-800/50">
                {sortedPlayers.map((p, idx) => {
                    const rank = idx + 1;
                    const isWinner = p.score === highestScore;
                    
                    return (
                        <div key={p.id} className={`flex items-center justify-between p-4 ${isWinner ? 'bg-yellow-900/10' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shadow-md ${
                                    rank === 1 ? 'bg-yellow-500 text-black shadow-yellow-900/50' : 
                                    rank === 2 ? 'bg-zinc-300 text-black shadow-zinc-900/50' : 
                                    rank === 3 ? 'bg-orange-600 text-white shadow-orange-900/50' : 
                                    'bg-zinc-800 text-zinc-500'
                                }`}>
                                    {rank}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={`font-bold text-lg leading-none ${isWinner ? 'text-yellow-500' : 'text-zinc-200'}`}>
                                        {p.name}
                                    </span>
                                </div>
                            </div>
                            <span className={`font-mono font-bold text-xl ${isWinner ? 'text-yellow-500' : 'text-zinc-500'}`}>
                                {p.score}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>

      {/* Fixed Bottom Button with Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-50">
          <button 
            onClick={() => dispatch({ type: 'RESET_GAME' })}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-95 text-lg uppercase tracking-wider">
            {T.newGame}
          </button>
      </div>
    </div>
  );
};