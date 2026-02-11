import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { TEXTS } from '../../data/locales';

export const CheatVoteGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const T = TEXTS[state.language].games.cheatVote;
  
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);

  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

  // --- RESOLUTION ---
  if (state.phase === GamePhase.RESOLUTION) {
      const handleFinalize = () => {
          const votes: Record<string, number> = {};
          state.gameData.rounds.forEach(r => { if (r.votedId) votes[r.votedId] = (votes[r.votedId] || 0) + 1; });
          state.players.forEach(p => {
              const voteCount = votes[p.id] || 0;
              if (voteCount > 0) {
                  const penalty = Math.floor(p.score / 3);
                  if (penalty > 0) dispatch({ type: 'UPDATE_SCORE', payload: { playerId: p.id, points: -penalty } });
              }
          });
          dispatch({ type: 'NEXT_GAME' });
      };

      return (
          <div className="flex flex-col h-screen bg-red-950 p-8 justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h1 className="text-5xl font-black text-white mb-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">{T.ended}</h1>
                <p className="text-red-200 mb-12 text-lg font-medium leading-relaxed">
                    {T.desc}
                </p>
                <button 
                    onClick={handleFinalize}
                    className="w-full bg-black hover:bg-zinc-900 border border-red-500 text-red-500 font-black py-5 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse uppercase tracking-[0.2em] transition-transform active:scale-95">
                    {T.show}
                </button>
              </div>
          </div>
      );
  }

  // --- INPUT PHASE ---
  if (!currentPlayer) return null;

  const handleVoteSubmit = () => {
    if (!selectedSuspect) return;
    dispatch({ type: 'SUBMIT_INPUT', payload: { voterId: currentPlayerId, votedId: selectedSuspect } });
    setSelectedSuspect(null);
  };

  const suspects = state.players.filter(p => p.id !== currentPlayerId);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 p-6">
       <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-black text-red-600 mb-2 text-center uppercase tracking-tight drop-shadow-lg">{T.justice}</h2>
            <p className="text-zinc-500 text-center mb-10 text-sm font-bold uppercase tracking-wide">
                {T.prompt}
            </p>

            <div className="grid grid-cols-1 gap-3 mb-10">
                {suspects.map(suspect => (
                    <button
                        key={suspect.id}
                        onClick={() => setSelectedSuspect(suspect.id)}
                        className={`p-5 rounded-xl border-2 font-black text-lg transition-all ${
                            selectedSuspect === suspect.id 
                            ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-[1.02]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                    >
                        {suspect.name}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleVoteSubmit}
                disabled={!selectedSuspect}
                className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl text-lg shadow-lg uppercase tracking-widest transition-transform active:scale-95">
                {T.vote}
            </button>
       </div>
    </div>
  );
};