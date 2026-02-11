import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { assignSuperlativesVoters, ISuperlativesAssignment } from '../../services/matchingService';
import { TEXTS } from '../../data/locales';

export const SuperlativesGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const T = TEXTS[state.language].games.superlatives;
  const T_COMMON = TEXTS[state.language].common;
  
  // --- PHASE 1: INPUT ---
  if (state.phase === GamePhase.INPUT) {
      const currentPlayer = state.players.find(p => p.id === currentPlayerId);
      const targetIndex = (state.currentPlayerIndex + 1) % state.roundOrder.length;
      const targetId = state.roundOrder[targetIndex];
      const targetPlayer = state.players.find(p => p.id === targetId);
      
      const [input, setInput] = useState('');

      if (!currentPlayer || !targetPlayer) return null;

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        dispatch({
            type: 'SUBMIT_INPUT',
            payload: {
                authorId: currentPlayerId,
                targetId: targetId,
                word: input.trim()
            }
        });
        setInput('');
      };

      // Construct sentence manually to support languages
      let sentence;
      if (state.language === 'EN') {
        sentence = <p className="text-xl text-zinc-300 font-bold text-center leading-relaxed">"{targetPlayer.name} is the most <br/><span className="inline-block text-red-500 border-b-2 border-red-500 mx-1 mt-2">_____________</span> <br/>person in this group."</p>;
      } else if (state.language === 'DE') {
        sentence = <p className="text-xl text-zinc-300 font-bold text-center leading-relaxed">"{targetPlayer.name} ist in dieser Gruppe <br/>am <span className="inline-block text-red-500 border-b-2 border-red-500 mx-1 mt-2">_____________</span>."</p>;
      } else {
        sentence = <p className="text-xl text-zinc-300 font-bold text-center leading-relaxed">"{targetPlayer.name} bu gruptaki en <br/><span className="inline-block text-red-500 border-b-2 border-red-500 mx-1 mt-2">_____________</span> <br/>kişidir."</p>;
      }

      return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6">
           <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="mb-8 text-center">
                     <div className="inline-block border border-red-500/30 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        {T.targetPlayer}
                     </div>
                     <h2 className="text-5xl font-black text-white mb-2">{targetPlayer.name}</h2>
                </div>

                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/10 mb-8 backdrop-blur-sm shadow-xl">
                    {sentence}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={T.fillBlank}
                        autoFocus
                        className="w-full bg-zinc-800 border-2 border-zinc-700 focus:border-red-500 rounded-xl px-4 py-4 text-white text-lg placeholder:text-zinc-600 outline-none transition-colors text-center font-bold"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-lg shadow-lg transition-transform active:scale-95 uppercase tracking-wider">
                        {T_COMMON.submit}
                    </button>
                </form>
           </div>
        </div>
      );
  }

  // --- PHASE 2: VOTING ---
  useEffect(() => {
    if (state.phase === GamePhase.INPUT_SECOND_PASS && !state.gameData.assignments) {
        const rounds = state.gameData.rounds.map(r => ({
            authorId: r.authorId,
            targetId: r.targetId,
            word: r.word
        }));
        const assignments = assignSuperlativesVoters(state.players, rounds);
        dispatch({ type: 'SET_GAME_DATA', payload: { assignments } });
    }
  }, [state.phase, state.gameData.rounds]);

  if (state.phase === GamePhase.INPUT_SECOND_PASS) {
      const assignments = state.gameData.assignments as ISuperlativesAssignment[] | undefined;
      
      if (!assignments) return <div className="text-white p-10 text-center">{T_COMMON.loading}</div>;

      const myTask = assignments.find(a => a.voterId === currentPlayerId);

      if (!myTask) {
           return (
             <div className="flex flex-col h-screen bg-zinc-950 p-6 justify-center text-center">
                 <h2 className="text-xl text-white font-bold">{T_COMMON.loading}</h2>
                 <button onClick={() => dispatch({type: 'SUBMIT_INPUT', payload: null})} className="bg-zinc-700 p-4 rounded mt-4">{T_COMMON.skip}</button>
             </div>
           );
      }

      const target = state.players.find(p => p.id === myTask.targetId);

      const handleVote = (approved: boolean) => {
          dispatch({
              type: 'SUBMIT_INPUT',
              payload: {
                  roundIndex: myTask.roundIndex,
                  voterId: currentPlayerId,
                  approved
              }
          });
      };

      let sentence;
      if (state.language === 'EN') {
        sentence = <p className="text-2xl text-white font-black leading-relaxed mt-4">"{target?.name} is the most <span className="text-red-500 underline decoration-wavy decoration-red-700">{myTask.word}</span> person."</p>;
      } else if (state.language === 'DE') {
        sentence = <p className="text-2xl text-white font-black leading-relaxed mt-4">"{target?.name} ist in dieser Gruppe am <span className="text-red-500 underline decoration-wavy decoration-red-700">{myTask.word}</span>."</p>;
      } else {
        sentence = <p className="text-2xl text-white font-black leading-relaxed mt-4">"{target?.name} bu gruptaki en <span className="text-red-500 underline decoration-wavy decoration-red-700">{myTask.word}</span> kişidir."</p>;
      }

      return (
          <div className="flex flex-col h-screen bg-zinc-950 p-6 justify-center text-center">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">{T.evaluate}</h2>
              
              <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 mb-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-zinc-800 rounded-bl-xl text-[10px] font-bold text-zinc-400 uppercase">{T.hiddenAuthor}</div>
                  {sentence}
              </div>

              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-8">{T.agreeQuestion}</p>

              <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleVote(true)}
                    className="bg-green-700 hover:bg-green-600 text-white font-black py-5 rounded-xl text-xl shadow-lg transition-transform active:scale-95 uppercase">
                    {T.approve}
                  </button>
                  <button 
                    onClick={() => handleVote(false)}
                    className="bg-red-700 hover:bg-red-600 text-white font-black py-5 rounded-xl text-xl shadow-lg transition-transform active:scale-95 uppercase">
                    {T.reject}
                  </button>
              </div>
          </div>
      );
  }

  // --- PHASE 3: RESOLUTION ---
  if (state.phase === GamePhase.RESOLUTION) {
     return <SuperlativesSummaryView />;
  }

  return null;
};

const SuperlativesSummaryView = () => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.superlatives;
    const T_COMMON = TEXTS[state.language].common;
    
    const results = state.gameData.rounds.map((round, idx) => {
        const voteData = state.gameData.secondRoundData?.find((r: any) => r && r.roundIndex === idx);
        return {
            id: idx,
            author: state.players.find(p => p.id === round.authorId),
            target: state.players.find(p => p.id === round.targetId),
            voter: state.players.find(p => p.id === voteData?.voterId),
            word: round.word,
            isApproved: voteData?.approved === true
        };
    });

    const handleFinish = () => {
        results.forEach(r => {
            if (r.isApproved && r.author) {
                 dispatch({ type: 'UPDATE_SCORE', payload: { playerId: r.author.id, points: 1 } });
            }
        });
        dispatch({ type: 'NEXT_GAME' });
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 overflow-hidden">
             <div className="text-center pt-4 pb-8">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{T.verdictTitle}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.verdictSubtitle}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-24 scrollbar-hide">
                {results.map((r) => {
                     let sentence;
                     if (state.language === 'EN') {
                        sentence = <p className="text-white text-lg font-bold leading-snug">"{r.target?.name} is the most <span className="text-red-500">{r.word}</span>"</p>;
                     } else if (state.language === 'DE') {
                        sentence = <p className="text-white text-lg font-bold leading-snug">"{r.target?.name} ist am <span className="text-red-500">{r.word}</span>"</p>;
                     } else {
                        sentence = <p className="text-white text-lg font-bold leading-snug">"{r.target?.name} en <span className="text-red-500">{r.word}</span> kişidir."</p>;
                     }

                    return (
                    <div key={r.id} className={`relative p-5 rounded-xl border border-zinc-800 overflow-hidden ${r.isApproved ? 'bg-zinc-900' : 'bg-zinc-900 opacity-70'}`}>
                        
                        {/* Statement Section */}
                        <div className="mb-4 text-center relative z-10">
                            <div className="flex justify-center items-center gap-2 mb-2">
                                <span className="font-bold text-zinc-400 text-sm uppercase tracking-wider">{r.author?.name} {T.says}</span>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                {sentence}
                            </div>
                        </div>

                        {/* Verdict Section */}
                        <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">{T.jury}</span>
                                <span className="text-zinc-300 font-bold">{r.voter?.name}</span>
                            </div>

                            <div className="text-right">
                                {r.isApproved ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-green-500 font-black text-lg tracking-tight uppercase">{T.approved}</span>
                                        <span className="text-[10px] font-bold bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded inline-block">+1 {T_COMMON.points}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <span className="text-red-500 font-black text-lg tracking-tight uppercase">{T.rejected}</span>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">{T.noPoints}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )})}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
                <button 
                    onClick={handleFinish}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg text-lg transition-transform active:scale-95 uppercase tracking-widest">
                    {T_COMMON.next}
                </button>
            </div>
        </div>
    );
};