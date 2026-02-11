import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { YES_NO_QUESTIONS } from '../../data/yesNoQuestions';
import { YES_NO_QUESTIONS_EN } from '../../data/en/yesNoQuestions';
import { YES_NO_QUESTIONS_DE } from '../../data/de/yesNoQuestions';
import { TEXTS } from '../../data/locales';

export const YesNoGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const T = TEXTS[state.language].games.yesNo;
  const T_COMMON = TEXTS[state.language].common;
  
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  
  const QUESTIONS = state.language === 'EN' ? YES_NO_QUESTIONS_EN : state.language === 'DE' ? YES_NO_QUESTIONS_DE : YES_NO_QUESTIONS;

  const getQuestionForPlayer = (pid: string) => {
      const charCodeSum = pid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const qIndex = (charCodeSum + state.availableGames.length) % QUESTIONS.length;
      return QUESTIONS[qIndex];
  };

  const [, setSelectedOption] = useState<boolean | null>(null);

  if (!currentPlayer) return null;

  // --- PHASE 1: ANSWER YOUR OWN QUESTION ---
  if (state.phase === GamePhase.INPUT) {
      const question = getQuestionForPlayer(currentPlayerId);

      const handleAnswer = (val: boolean) => {
        setSelectedOption(val);
        setTimeout(() => {
            dispatch({ 
                type: 'SUBMIT_INPUT', 
                payload: { 
                    playerId: currentPlayerId, 
                    question, 
                    answer: val 
                } 
            });
            setSelectedOption(null);
        }, 300);
      };

      return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6">
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="mb-8">
                 <span className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase animate-pulse">{T.beHonest}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white mb-12 leading-tight drop-shadow-lg">
              "{question}"
            </h2>
    
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                    onClick={() => handleAnswer(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 border-2 border-green-900/50 hover:border-green-500 text-green-500 hover:text-green-400 font-black py-6 rounded-2xl text-2xl transition-all active:scale-95 shadow-lg">
                    {T_COMMON.yes}
                </button>
                <button 
                    onClick={() => handleAnswer(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 border-2 border-red-900/50 hover:border-red-500 text-red-500 hover:text-red-400 font-black py-6 rounded-2xl text-2xl transition-all active:scale-95 shadow-lg">
                    {T_COMMON.no}
                </button>
            </div>
            <p className="mt-8 text-zinc-600 text-xs font-bold uppercase tracking-widest">{T.secret}</p>
          </div>
        </div>
      );
  }

  // --- PHASE 2: GUESS TARGET'S ANSWER ---
  if (state.phase === GamePhase.INPUT_SECOND_PASS) {
      const targetIndex = (state.currentPlayerIndex + 1) % state.roundOrder.length;
      const targetId = state.roundOrder[targetIndex];
      const targetPlayer = state.players.find(p => p.id === targetId);
      const targetRoundData = state.gameData.rounds.find(r => r.playerId === targetId);

      if (!targetRoundData || !targetPlayer) return <div>Hata: Hedef veri bulunamadı.</div>;

      const handleGuess = (val: boolean) => {
        setSelectedOption(val);
        setTimeout(() => {
            dispatch({
                type: 'SUBMIT_INPUT',
                payload: {
                    guesserId: currentPlayerId,
                    targetId: targetId,
                    guess: val
                }
            });
            setSelectedOption(null);
        }, 300);
      };

      return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="mb-4">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-full">{T.targetPlayer}</span>
                    <h1 className="text-4xl font-black text-white mt-4">{targetPlayer.name}</h1>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 mb-8 w-full max-w-md shadow-xl backdrop-blur-sm">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-2 tracking-wider">{T.whatDidSay}</p>
                    <h2 className="text-2xl font-bold text-zinc-100 leading-snug">
                        "{targetRoundData.question}"
                    </h2>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button 
                        onClick={() => handleGuess(true)}
                        className="bg-zinc-800 hover:bg-zinc-700 border-2 border-green-900/50 hover:border-green-500 text-green-500 hover:text-green-400 font-black py-6 rounded-2xl text-2xl transition-all active:scale-95">
                        {T_COMMON.yes}
                    </button>
                    <button 
                        onClick={() => handleGuess(false)}
                        className="bg-zinc-800 hover:bg-zinc-700 border-2 border-red-900/50 hover:border-red-500 text-red-500 hover:text-red-400 font-black py-6 rounded-2xl text-2xl transition-all active:scale-95">
                        {T_COMMON.no}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- PHASE 3: RESOLUTION ---
  if (state.phase === GamePhase.RESOLUTION) {
     return <YesNoSummaryView />;
  }

  return null;
};

const YesNoSummaryView = () => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.yesNo;
    const T_COMMON = TEXTS[state.language].common;
    
    const results = (state.gameData.secondRoundData || []).map((guessData: any) => {
        const guesser = state.players.find(p => p.id === guessData.guesserId);
        const target = state.players.find(p => p.id === guessData.targetId);
        const realData = state.gameData.rounds.find(r => r.playerId === guessData.targetId);
        
        const isCorrect = realData && guessData.guess === realData.answer;
        
        return {
            id: `${guessData.guesserId}-${guessData.targetId}`,
            guesser,
            target,
            question: realData?.question,
            guess: guessData.guess,
            actual: realData?.answer,
            isCorrect,
            guesserId: guessData.guesserId,
            targetId: guessData.targetId
        };
    });

    const handleFinish = () => {
        results.forEach(r => {
            if (r.isCorrect) {
                dispatch({ type: 'UPDATE_SCORE', payload: { playerId: r.guesserId, points: 1 } });
                dispatch({ type: 'UPDATE_SCORE', payload: { playerId: r.targetId, points: 1 } });
            }
        });
        dispatch({ type: 'NEXT_GAME' });
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 overflow-hidden">
            <div className="text-center pt-4 pb-8">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">{T.resultsTitle}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.resultsSubtitle}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-24 scrollbar-hide">
                {results.map((r, idx) => (
                    <div key={r.id} className={`p-4 rounded-xl border-l-4 ${r.isCorrect ? 'bg-zinc-900/80 border-l-green-500 border-y border-r border-y-zinc-800 border-r-zinc-800' : 'bg-zinc-900/80 border-l-red-500 border-y border-r border-y-zinc-800 border-r-zinc-800'}`}>
                        
                        <div className="text-center mb-4 px-2">
                             <p className="text-zinc-300 font-medium italic text-sm">"{r.question}"</p>
                        </div>

                        <div className="flex flex-col gap-2 mb-4">
                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    {r.target?.name} {T.said}
                                </span>
                                <span className={`text-lg font-black ${r.actual ? 'text-green-500' : 'text-red-500'}`}>
                                    {r.actual ? T_COMMON.yes : T_COMMON.no}
                                </span>
                            </div>

                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    {r.guesser?.name} {T.guess}
                                </span>
                                <span className={`text-lg font-black ${r.guess ? 'text-green-500' : 'text-red-500'}`}>
                                    {r.guess ? T_COMMON.yes : T_COMMON.no}
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            {r.isCorrect ? (
                                <span className="inline-block px-4 py-1 bg-green-900/30 text-green-400 text-[10px] font-black uppercase tracking-widest rounded border border-green-900/50">
                                    {T.knew}
                                </span>
                            ) : (
                                <span className="inline-block px-4 py-1 bg-red-900/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded border border-red-900/50">
                                    {T.failed}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
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