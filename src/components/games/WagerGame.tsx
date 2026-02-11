import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { WAGER_DILEMMAS } from '../../data/wagerDilemmas';
import { WAGER_DILEMMAS_EN } from '../../data/en/wagerDilemmas';
import { WAGER_DILEMMAS_DE } from '../../data/de/wagerDilemmas';
import { TEXTS } from '../../data/locales';

export const WagerGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  const T = TEXTS[state.language].games.wager;

  const DILEMMAS = state.language === 'EN' ? WAGER_DILEMMAS_EN : state.language === 'DE' ? WAGER_DILEMMAS_DE : WAGER_DILEMMAS;

  // Use modulo logic to assign a dilemma deterministically based on player ID
  const dilemmaIndex = currentPlayerId ? Math.abs(currentPlayerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % DILEMMAS.length : 0;
  const myDilemma = DILEMMAS[dilemmaIndex];

  const [wagerAmount, setWagerAmount] = useState(0);
  const [prediction, setPrediction] = useState<'A' | 'B' | null>(null);

  // --- PHASE 1: MAKE CHOICE ---
  if (state.phase === GamePhase.INPUT) {
      const handleChoice = (choice: 'A' | 'B') => {
          dispatch({ type: 'SUBMIT_INPUT', payload: { playerId: currentPlayerId, dilemmaIndex, choice } });
      };

      return (
          <div className="flex flex-col h-dvh bg-zinc-950 p-6 justify-center text-center overflow-hidden">
              <h2 className="text-3xl font-black text-white mb-10 tracking-tight uppercase">{T.makeChoice}</h2>
              
              <div className="flex flex-col gap-6">
                  <button 
                    onClick={() => handleChoice('A')}
                    className="bg-zinc-800 hover:bg-zinc-700 border-l-8 border-blue-600 p-8 rounded-r-2xl text-xl font-bold text-white transition-all active:scale-95 shadow-lg text-left">
                    {myDilemma.A}
                  </button>
                  
                  <div className="flex items-center justify-center gap-4">
                      <div className="h-px bg-zinc-800 flex-1"></div>
                      <span className="text-zinc-600 font-black text-xs uppercase tracking-widest">{T.or}</span>
                      <div className="h-px bg-zinc-800 flex-1"></div>
                  </div>

                  <button 
                    onClick={() => handleChoice('B')}
                    className="bg-zinc-800 hover:bg-zinc-700 border-r-8 border-orange-600 p-8 rounded-l-2xl text-xl font-bold text-white transition-all active:scale-95 shadow-lg text-right">
                    {myDilemma.B}
                  </button>
              </div>
          </div>
      );
  }

  // --- PHASE 2: WAGER ---
  if (state.phase === GamePhase.INPUT_SECOND_PASS) {
      const targetIndex = (state.currentPlayerIndex + 1) % state.roundOrder.length;
      const targetId = state.roundOrder[targetIndex];
      const targetPlayer = state.players.find(p => p.id === targetId);
      const targetInput = state.gameData.rounds.find(r => r.playerId === targetId);
      
      if (!targetInput) return <div className="text-zinc-500 font-bold p-10 text-center">...</div>;
      
      const targetDilemma = DILEMMAS[targetInput.dilemmaIndex];
      const maxWager = currentPlayer ? Math.max(0, currentPlayer.score) : 0;

      const handleSubmitWager = () => {
          if (prediction === null) return;
          dispatch({ type: 'SUBMIT_INPUT', payload: { betterId: currentPlayerId, targetId: targetId, prediction, wagerAmount: Math.min(wagerAmount, maxWager) } });
          setPrediction(null);
          setWagerAmount(0);
      };

      return (
        <div className="flex flex-col h-dvh bg-zinc-950 p-6 justify-center overflow-hidden">
             <div className="text-center mb-8">
                 <span className="text-[10px] font-black text-green-500 uppercase tracking-widest border border-green-900/50 bg-green-900/20 px-3 py-1 rounded-full">{T.target}</span>
                 <h1 className="text-4xl font-black text-white mt-4 mb-1">{targetPlayer?.name}</h1>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.guessPrompt}</p>
             </div>

             <div className="flex flex-col gap-4 mb-8">
                  <button 
                    onClick={() => setPrediction('A')}
                    className={`p-5 rounded-xl border-2 font-bold transition-all text-left ${prediction === 'A' ? 'bg-blue-900/40 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400 opacity-60'}`}>
                    <span className="text-blue-500 mr-2 font-black">A)</span> {targetDilemma.A}
                  </button>
                  <button 
                    onClick={() => setPrediction('B')}
                    className={`p-5 rounded-xl border-2 font-bold transition-all text-left ${prediction === 'B' ? 'bg-orange-900/40 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400 opacity-60'}`}>
                    <span className="text-orange-500 mr-2 font-black">B)</span> {targetDilemma.B}
                  </button>
             </div>

             <div className="bg-zinc-900 p-6 rounded-2xl mb-8 border border-zinc-800">
                 <div className="flex justify-between mb-4 items-end">
                     <span className="text-zinc-400 font-bold text-sm uppercase">{T.risk}</span>
                     <span className="text-green-500 font-mono font-black text-2xl">{wagerAmount} {TEXTS[state.language].common.points}</span>
                 </div>
                 
                 {maxWager > 0 ? (
                     <>
                        <input 
                            type="range" 
                            min="0" 
                            max={maxWager} 
                            step="1"
                            value={wagerAmount} 
                            onChange={(e) => setWagerAmount(parseInt(e.target.value))}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-600 mt-3 font-black uppercase tracking-widest">
                            <span>0</span>
                            <span>{T.current} {maxWager}</span>
                        </div>
                     </>
                 ) : (
                     <div className="bg-red-900/20 border border-red-900/50 p-2 rounded text-red-500 text-xs text-center font-bold">
                         {T.noPoints}
                     </div>
                 )}
             </div>

             <button 
                onClick={handleSubmitWager}
                disabled={prediction === null}
                className="w-full bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 uppercase tracking-widest">
                {T.placeBet}
             </button>
        </div>
      );
  }

  // --- PHASE 3: RESOLUTION ---
  if (state.phase === GamePhase.RESOLUTION) {
      return <WagerSummaryView />;
  }

  return null;
};

const WagerSummaryView = () => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.wager;
    const T_COMMON = TEXTS[state.language].common;
    const DILEMMAS = state.language === 'EN' ? WAGER_DILEMMAS_EN : state.language === 'DE' ? WAGER_DILEMMAS_DE : WAGER_DILEMMAS;

    const bets = state.gameData.secondRoundData || [];
    const results = bets.map(bet => {
        const better = state.players.find(p => p.id === bet.betterId);
        const target = state.players.find(p => p.id === bet.targetId);
        const targetChoiceData = state.gameData.rounds.find(r => r.playerId === bet.targetId);
        const dilemma = targetChoiceData ? DILEMMAS[targetChoiceData.dilemmaIndex] : { A: '?', B: '?' };
        const actualChoice = targetChoiceData?.choice;
        const isWin = bet.prediction === actualChoice;
        const targetChoiceText = actualChoice === 'A' ? dilemma.A : dilemma.B;
        const predictionText = bet.prediction === 'A' ? dilemma.A : dilemma.B;
        return { better, target, wager: bet.wagerAmount, isWin, betPrediction: bet.prediction, predictionText, actualChoice, targetChoiceText, dilemma };
    });

    const handleFinish = () => {
        results.forEach(r => {
            if (r.better) {
                const points = r.isWin ? r.wager : -r.wager;
                if (points !== 0) dispatch({ type: 'UPDATE_SCORE', payload: { playerId: r.better.id, points } });
            }
        });
        dispatch({ type: 'NEXT_GAME' });
    };

    return (
        <div className="flex flex-col h-dvh bg-zinc-950 relative overflow-hidden">
             <div className="shrink-0 pt-6 px-6 pb-4 text-center z-10">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{T.results}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.winLose}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide z-0">
                <div className="space-y-4">
                {results.map((r, idx) => (
                    <div key={idx} className={`relative p-5 rounded-xl border-l-4 ${r.isWin ? 'bg-zinc-900 border-l-green-600' : 'bg-zinc-900 border-l-red-600'} shadow-lg`}>
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                             <div className="flex flex-col">
                                 <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">{T.better}</span>
                                 <span className="font-bold text-white text-lg">{r.better?.name}</span>
                             </div>
                             <div className="text-right flex flex-col items-end">
                                 <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">{T.target}</span>
                                 <span className="font-bold text-zinc-300">{r.target?.name}</span>
                             </div>
                        </div>

                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-3 text-center">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{T.realChoice}</div>
                            <div className={`font-black text-lg leading-tight ${r.actualChoice === 'A' ? 'text-blue-500' : 'text-orange-500'}`}>
                                "{r.targetChoiceText}"
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">{T.prediction}</span>
                                <span className={`text-sm font-bold leading-tight ${r.betPrediction === 'A' ? 'text-blue-400' : 'text-orange-400'}`}>
                                    "{r.predictionText}"
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{T.risk}: {r.wager}</span>
                                {r.isWin ? (
                                    <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-green-900/50 uppercase">
                                        +{r.wager} {T.won}
                                    </span>
                                ) : (
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-red-900/50 uppercase">
                                        -{r.wager} {T.lost}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20">
                <button 
                    onClick={handleFinish}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg text-lg transition-transform active:scale-95 uppercase tracking-widest">
                    {T_COMMON.next}
                </button>
            </div>
        </div>
    );
};