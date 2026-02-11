import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { TEXTS } from '../../data/locales';

interface ITriviaRound {
    authorId: string;
    question: string;
    correctAnswer: boolean;
}

interface ITriviaAnswerPayload {
    playerId: string;
    answers: { questionAuthorId: string; answer: boolean }[];
}

export const TriviaGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const T = TEXTS[state.language].games.trivia;
  const T_COMMON = TEXTS[state.language].common;
  
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);

  // Phase 1 State
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);

  // Phase 2 State
  const [answerQueue, setAnswerQueue] = useState<ITriviaRound[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [collectedAnswers, setCollectedAnswers] = useState<{ questionAuthorId: string; answer: boolean }[]>([]);
  
  const [feedback, setFeedback] = useState<{
      isCorrect: boolean;
      correctAnswer: boolean;
      pointsGained: number;
  } | null>(null);

  // --- RESOLUTION PHASE ---
  if (state.phase === GamePhase.RESOLUTION) {
      return <TriviaSummaryView />;
  }

  // --- PHASE 2: ANSWERING ---
  if (state.phase === GamePhase.INPUT_SECOND_PASS) {
      if (answerQueue.length === 0 && collectedAnswers.length === 0 && !feedback) {
          const questionsToAnswer = state.gameData.rounds.filter(
              (r: any) => r.authorId !== currentPlayerId
          ) as ITriviaRound[];
          
          if (questionsToAnswer.length > 0) {
            setAnswerQueue(questionsToAnswer);
            setCurrentQIndex(0);
          } else {
             dispatch({ type: 'SUBMIT_INPUT', payload: { playerId: currentPlayerId, answers: [] } });
          }
          return <div className="text-zinc-500 p-10 text-center font-bold animate-pulse">{T_COMMON.loading}</div>;
      }

      const activeQuestion = answerQueue[currentQIndex];
      
      if (feedback) {
          const handleNextQuestion = () => {
              setFeedback(null);
              if (currentQIndex < answerQueue.length - 1) {
                  setCurrentQIndex(prev => prev + 1);
              } else {
                  dispatch({
                      type: 'SUBMIT_INPUT',
                      payload: {
                          playerId: currentPlayerId,
                          answers: collectedAnswers
                      }
                  });
                  setAnswerQueue([]);
                  setCollectedAnswers([]);
                  setCurrentQIndex(0);
              }
          };

          return (
              <div className="flex flex-col h-screen p-6 justify-center items-center text-center bg-zinc-950 animate-in fade-in zoom-in duration-300">
                  <div className="mb-8">
                      {feedback.isCorrect ? (
                          <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                              <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          </div>
                      ) : (
                          <div className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                              <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                          </div>
                      )}
                  </div>
                  
                  <h2 className={`text-6xl font-black mb-4 tracking-tighter ${feedback.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {feedback.isCorrect ? T_COMMON.correct : T_COMMON.wrong}
                  </h2>
                  
                  <p className="text-xl text-zinc-400 mb-10 font-bold">
                      {T.answer} <span className="text-white">{feedback.correctAnswer ? T_COMMON.yes : T_COMMON.no}</span>
                  </p>

                  <button 
                      onClick={handleNextQuestion}
                      className="w-full bg-white text-black hover:bg-zinc-200 font-black py-4 rounded-xl shadow-lg text-xl uppercase tracking-widest">
                      {T_COMMON.next}
                  </button>
              </div>
          );
      }

      const handlePhase2Answer = (ans: boolean) => {
          const isCorrect = ans === activeQuestion.correctAnswer;
          const newAnswers = [...collectedAnswers, { questionAuthorId: activeQuestion.authorId, answer: ans }];
          setCollectedAnswers(newAnswers);
          if (isCorrect) {
               dispatch({ type: 'UPDATE_SCORE', payload: { playerId: currentPlayerId, points: 1 } });
          }
          setFeedback({ isCorrect, correctAnswer: activeQuestion.correctAnswer, pointsGained: isCorrect ? 1 : 0 });
      };

      if (!activeQuestion) return <div>{T_COMMON.error}</div>;

      return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 justify-center">
            <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                    {T.questionCount} {currentQIndex + 1} / {answerQueue.length}
                </span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white text-center leading-relaxed">
                        "{activeQuestion.question}"
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => handlePhase2Answer(true)}
                        className="bg-zinc-800 hover:bg-zinc-700 border-2 border-green-900/50 hover:border-green-500 py-6 rounded-2xl text-2xl font-black text-green-500 transition-all active:scale-95 shadow-lg">
                        {T_COMMON.yes}
                    </button>
                    <button 
                        onClick={() => handlePhase2Answer(false)}
                        className="bg-zinc-800 hover:bg-zinc-700 border-2 border-red-900/50 hover:border-red-500 py-6 rounded-2xl text-2xl font-black text-red-500 transition-all active:scale-95 shadow-lg">
                        {T_COMMON.no}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- PHASE 1: INPUT ---
  if (!currentPlayer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || correctAnswer === null) return;

    dispatch({
        type: 'SUBMIT_INPUT',
        payload: {
            authorId: currentPlayerId,
            question: question.trim(),
            correctAnswer
        }
    });
    setQuestion('');
    setCorrectAnswer(null);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 p-6">
       <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tight">{T.prepareTitle}</h2>
            <p className="text-zinc-500 text-center mb-8 text-xs font-bold uppercase tracking-widest">
                {T.prepareSubtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={T.placeholder}
                    className="w-full h-40 bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-xl p-4 text-white text-lg placeholder:text-zinc-600 outline-none resize-none shadow-inner"
                />
                
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setCorrectAnswer(true)}
                        className={`flex-1 py-4 rounded-xl font-black text-lg border-2 transition-all ${correctAnswer === true ? 'bg-green-600 border-green-400 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                        {T.answer} {T_COMMON.yes}
                    </button>
                    <button
                        type="button"
                        onClick={() => setCorrectAnswer(false)}
                        className={`flex-1 py-4 rounded-xl font-black text-lg border-2 transition-all ${correctAnswer === false ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                        {T.answer} {T_COMMON.no}
                    </button>
                </div>

                <button 
                    type="submit"
                    disabled={!question.trim() || correctAnswer === null}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-lg shadow-lg uppercase tracking-widest">
                    {T_COMMON.save}
                </button>
            </form>
       </div>
    </div>
  );
};

const TriviaSummaryView = () => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.trivia;
    const T_COMMON = TEXTS[state.language].common;
    
    const rounds = state.gameData.rounds as ITriviaRound[];
    const allAnswers = state.gameData.secondRoundData as ITriviaAnswerPayload[] || [];

    const authorStats = rounds.map(r => {
        const answersForThisQuestion = allAnswers.map(p => {
            const theirAnswerObj = p.answers.find(a => a.questionAuthorId === r.authorId);
            return { answererId: p.playerId, answer: theirAnswerObj?.answer };
        }).filter(a => a.answer !== undefined);

        const correctCount = answersForThisQuestion.filter(a => a.answer === r.correctAnswer).length;
        const totalVoters = answersForThisQuestion.length;
        
        let points = 0;
        let reason = "";

        if (totalVoters === 0) { points = 0; reason = "No Answers"; } 
        else if (correctCount === 0) { points = -1; reason = "No One Knew (-1)"; } 
        else if (correctCount === totalVoters) { points = -1; reason = "Everyone Knew (-1)"; } 
        else {
            const ratio = correctCount / totalVoters;
            if (ratio > 0.5) { points = 2; reason = "Majority Knew (+2)"; } 
            else { points = 1; reason = "Minority Knew (+1)"; }
        }
        return { authorId: r.authorId, points, reason };
    });

    const answerStats = state.players.map(player => {
        const playerEntry = allAnswers.find(p => p.playerId === player.id);
        let correctCount = 0;
        if (playerEntry) {
            playerEntry.answers.forEach(ans => {
                const q = rounds.find(r => r.authorId === ans.questionAuthorId);
                if (q && q.correctAnswer === ans.answer) correctCount++;
            });
        }
        return { playerId: player.id, correctCount, points: correctCount };
    });

    const fullResults = state.players.map(player => {
        const aStat = authorStats.find(s => s.authorId === player.id);
        const ansStat = answerStats.find(s => s.playerId === player.id);
        return {
            player,
            authorData: aStat,
            answerData: ansStat,
            totalRoundPoints: (aStat ? aStat.points : 0) + (ansStat ? ansStat.points : 0)
        };
    }).sort((a, b) => b.totalRoundPoints - a.totalRoundPoints);

    const handleFinish = () => {
        authorStats.forEach(stat => {
            if (stat.points !== 0) {
                dispatch({ type: 'UPDATE_SCORE', payload: { playerId: stat.authorId, points: stat.points } });
            }
        });
        dispatch({ type: 'NEXT_GAME' });
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 overflow-hidden">
             <div className="text-center mb-6 pt-4">
                 <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{T.roundResult}</h2>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.strategy}</p>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 pb-20 scrollbar-hide">
                 {fullResults.map((item, idx) => (
                     <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                         <div className="bg-zinc-800/50 p-3 flex justify-between items-center border-b border-zinc-700/50">
                             <span className="font-bold text-white text-lg">{item.player.name}</span>
                             <div className={`px-3 py-1 rounded-lg font-black text-sm ${item.totalRoundPoints >= 0 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                                 {item.totalRoundPoints > 0 ? '+' : ''}{item.totalRoundPoints} {T_COMMON.points}
                             </div>
                         </div>

                         <div className="flex divide-x divide-zinc-800">
                             <div className="flex-1 p-3 text-center">
                                 <div className="text-[10px] uppercase font-black text-zinc-500 mb-1 tracking-wider">{T.authorScore}</div>
                                 <div className="text-xs text-zinc-300 font-bold mb-1">{item.authorData?.reason || "-"}</div>
                                 <div className={`text-sm font-black ${item.authorData && item.authorData.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                     {item.authorData && item.authorData.points > 0 ? '+' : ''}{item.authorData?.points || 0}
                                 </div>
                             </div>

                             <div className="flex-1 p-3 text-center">
                                 <div className="text-[10px] uppercase font-black text-zinc-500 mb-1 tracking-wider">{T.answerScore}</div>
                                 <div className="text-xs text-zinc-300 font-bold mb-1">{item.answerData?.correctCount || 0} {T_COMMON.correct}</div>
                                 <div className="text-sm font-black text-green-500">+{item.answerData?.points || 0}</div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             <button 
                 onClick={handleFinish}
                 className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg mt-auto transition-transform active:scale-95 uppercase tracking-widest">
                 {T.nextGame}
             </button>
        </div>
    );
};