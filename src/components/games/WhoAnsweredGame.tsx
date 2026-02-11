import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { distributeGame5Questions, IGame5Distribution } from '../../services/matchingService';
import { TEXTS } from '../../data/locales';

export const WhoAnsweredGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const T = TEXTS[state.language].games.whoAnswered;
  const T_COMMON = TEXTS[state.language].common;
  
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  
  const [textInput, setTextInput] = useState('');

  // --- PHASE 1: WRITE QUESTION ---
  if (state.phase === GamePhase.INPUT) {
      const handleQuestionSubmit = () => {
          if (!textInput.trim()) return;
          dispatch({ type: 'SUBMIT_INPUT', payload: { id: currentPlayerId, authorId: currentPlayerId, text: textInput.trim() } });
          setTextInput('');
      };

      return (
          <div className="flex flex-col h-dvh bg-zinc-950 p-6 justify-center overflow-hidden">
              <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tight">{T.title}</h2>
              <p className="text-zinc-500 text-center mb-8 text-xs font-bold uppercase tracking-widest">
                  {T.subtitle}
              </p>

              <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={T.placeholder}
                  className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-lg focus:border-red-500 outline-none resize-none shadow-inner"
              />

              <button 
                  onClick={handleQuestionSubmit}
                  disabled={!textInput.trim()}
                  className="w-full bg-red-600 hover:bg-red-500 mt-6 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest">
                  {T_COMMON.save}
              </button>
          </div>
      );
  }

  // --- PHASE 2: ANSWER ---
  useEffect(() => {
      if (state.phase === GamePhase.INPUT_SECOND_PASS && !state.gameData.assignments) {
          const questions = state.gameData.rounds.map(r => ({ id: r.id, authorId: r.authorId, text: r.text }));
          const distributions = distributeGame5Questions(state.players, questions);
          dispatch({ type: 'SET_GAME_DATA', payload: { assignments: distributions } });
      }
  }, [state.phase, state.gameData.rounds]);

  if (state.phase === GamePhase.INPUT_SECOND_PASS) {
      const assignments = state.gameData.assignments as IGame5Distribution[] | undefined;
      if (!assignments) return <div className="text-zinc-500 p-10 text-center font-bold">{T.distributing}</div>;

      const myTasks = assignments.filter(a => a.playerId === currentPlayerId);
      const answeredIds = state.gameData.secondRoundData?.map(r => r.assignmentUniqueId) || [];
      const currentTask = myTasks.find(t => !answeredIds.includes(`${t.playerId}-${t.questionId}`));

      if (!currentTask) {
          return (
             <div className="flex flex-col h-dvh bg-zinc-950 p-6 justify-center text-center overflow-hidden">
                 <h2 className="text-3xl font-black text-white mb-6">{T.done}</h2>
                 <button 
                    onClick={() => dispatch({ type: 'SUBMIT_INPUT', payload: null })}
                    className="bg-green-600 text-white font-black py-4 px-8 rounded-xl uppercase tracking-widest shadow-lg">
                    {T.pass}
                 </button>
             </div>
          );
      }

      const remainingCount = myTasks.filter(t => !answeredIds.includes(`${t.playerId}-${t.questionId}`)).length;
      const authorName = state.players.find(p => p.id === currentTask.questionAuthorId)?.name;

      const handleAnswerSubmit = () => {
          if (!textInput.trim()) return;
          const payload = {
              assignmentUniqueId: `${currentTask.playerId}-${currentTask.questionId}`,
              questionId: currentTask.questionId,
              answererId: currentPlayerId,
              text: textInput.trim()
          };

          if (remainingCount > 1) {
              const currentData = state.gameData.secondRoundData || [];
              dispatch({ type: 'SET_GAME_DATA', payload: { secondRoundData: [...currentData, payload] } });
          } else {
              dispatch({ type: 'SUBMIT_INPUT', payload: payload });
          }
          setTextInput('');
      };

      return (
          <div className="flex flex-col h-dvh bg-zinc-950 p-6 justify-center overflow-hidden">
              <div className="text-center mb-6">
                 <span className="bg-red-900/30 text-red-400 border border-red-900/50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {T.remaining} {remainingCount}
                 </span>
              </div>
              
              <div className="text-center mb-8">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{T.asker} {authorName}</span>
                  <div className="mt-4 bg-zinc-900/50 p-6 rounded-xl border border-white/5 shadow-xl backdrop-blur-sm">
                     <h2 className="text-2xl font-bold text-white italic leading-snug">"{currentTask.questionText}"</h2>
                  </div>
              </div>

              <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={T.yourAnswer}
                  className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-lg focus:border-orange-500 outline-none resize-none shadow-inner"
              />

              <button 
                  onClick={handleAnswerSubmit}
                  disabled={!textInput.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-500 mt-6 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest">
                  {remainingCount > 1 ? T.nextQ : T.finish}
              </button>
          </div>
      );
  }

  // --- PHASE 3: RESOLUTION ---
  if (state.phase === GamePhase.RESOLUTION) {
     return <ResolutionView />;
  }

  return null;
};

interface IAnswerGroup {
    assignmentUniqueId: string;
    answererId: string;
    text: string;
}

interface IHistoryRecord {
    questionText: string;
    authorId: string;
    details: {
        answerText: string;
        realAnswererId: string;
        guessedId: string | null;
        isCorrect: boolean;
    }[];
}

const ResolutionView = () => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.whoAnswered;
    const T_INTER = TEXTS[state.language].interstitial;
    
    const [qIndex, setQIndex] = useState(0);
    const [isInterstitial, setIsInterstitial] = useState(true);
    const [history, setHistory] = useState<IHistoryRecord[]>([]);
    const [showSummary, setShowSummary] = useState(false);
    
    const [selections, setSelections] = useState<Record<string, string>>({});

    if (showSummary) return <WhoAnsweredSummaryView history={history} />;

    const question = state.gameData.rounds[qIndex];
    const answers = state.gameData.secondRoundData?.filter(r => r.questionId === question?.id) as IAnswerGroup[];
    const author = state.players.find(p => p.id === question?.authorId);
    const suspects = state.players.filter(p => p.id !== question?.authorId);

    if (!question || !answers || answers.length === 0) {
         if (state.gameData.rounds.length > 0 && qIndex < state.gameData.rounds.length - 1) {
             setQIndex(prev => prev + 1);
             setSelections({});
         } else if (!showSummary && history.length > 0) {
             setShowSummary(true);
         }
         return <div className="text-zinc-500 p-10 text-center font-bold">{T.waiting}</div>;
    }

    const handleConfirmGuesses = () => {
        let correctCount = 0;
        const details: any[] = [];

        for (const ans of answers) {
            const guessId = selections[ans.assignmentUniqueId];
            const isCorrect = guessId === ans.answererId;
            if (isCorrect) correctCount++;
            details.push({ answerText: ans.text, realAnswererId: ans.answererId, guessedId: guessId || null, isCorrect });
        }

        if (correctCount > 0) {
            dispatch({ type: 'UPDATE_SCORE', payload: { playerId: question.authorId, points: correctCount } });
        }

        setHistory(prev => [...prev, { questionText: question.text, authorId: question.authorId, details }]);

        if (qIndex < state.gameData.rounds.length - 1) {
            setQIndex(prev => prev + 1);
            setSelections({});
            setIsInterstitial(true); 
        } else {
            setShowSummary(true);
        }
    };

    const isAllSelected = answers.every(a => selections[a.assignmentUniqueId]);

    if (isInterstitial) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-6 text-center animate-in fade-in duration-500 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="mb-8 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-red-500/20 bg-zinc-900 flex items-center justify-center">
                        <span className="text-5xl font-black text-red-500">
                            {author?.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="relative z-10 space-y-2 mb-10">
                    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">{T_INTER.passDevice}</h2>
                    <h1 className="text-5xl font-black text-white">
                        {author?.name}
                    </h1>
                </div>
                
                <p className="relative z-10 text-zinc-400 text-sm font-bold uppercase tracking-widest mb-8">
                    {answers.length} cevap seni bekliyor
                </p>

                <button 
                    onClick={() => setIsInterstitial(false)}
                    className="relative z-10 w-full bg-white text-black font-black py-4 rounded-xl text-xl shadow-lg transition-transform active:scale-95 uppercase tracking-widest">
                    {T_INTER.button} {author?.name.toUpperCase()}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-dvh bg-zinc-950 p-4 justify-start overflow-hidden">
            <div className="text-center mb-6 pt-4 shrink-0">
                <div className="mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Soru Sahibi: {author?.name}</div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-md">
                    <h3 className="text-lg font-bold text-white leading-tight italic">"{question.text}"</h3>
                </div>
            </div>

            <p className="text-red-500 text-[10px] text-center mb-4 font-black uppercase tracking-[0.2em] animate-pulse shrink-0">
                {T.guessTitle}
            </p>

            {/* Scrollable Area with bottom padding */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-32 scrollbar-hide">
                {answers.map((ans) => {
                    const currentSelection = selections[ans.assignmentUniqueId];
                    return (
                        <div key={ans.assignmentUniqueId} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                            <div className="bg-white/5 p-3 rounded-lg border-l-4 border-red-500 mb-4">
                                <span className="text-zinc-100 font-bold text-lg">"{ans.text}"</span>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{T.selectAuthor}</span>
                                <div className="flex flex-wrap gap-2">
                                    {suspects.map(suspect => (
                                        <button
                                            key={suspect.id}
                                            onClick={() => setSelections(prev => ({ ...prev, [ans.assignmentUniqueId]: suspect.id }))}
                                            className={`flex-grow px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                currentSelection === suspect.id 
                                                ? 'bg-red-600 border-red-500 text-white shadow-lg' 
                                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {suspect.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-50">
                <button 
                    onClick={handleConfirmGuesses}
                    disabled={!isAllSelected}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-transform active:scale-95 uppercase tracking-widest">
                    {T.confirm}
                </button>
            </div>
        </div>
    );
};

const WhoAnsweredSummaryView = ({ history }: { history: IHistoryRecord[] }) => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.whoAnswered;
    const T_COMMON = TEXTS[state.language].common;

    return (
        <div className="flex flex-col h-dvh bg-zinc-950 relative overflow-hidden">
             <div className="shrink-0 pt-6 px-6 pb-4 text-center z-10">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{T.results}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.expert}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide z-0">
                <div className="space-y-6">
                {history.map((record, idx) => {
                    const author = state.players.find(p => p.id === record.authorId);
                    const score = record.details.filter(d => d.isCorrect).length;

                    return (
                        <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                            <div className="bg-zinc-800 p-3 flex justify-between items-center border-b border-zinc-700">
                                <div>
                                     <div className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{T.guesser}</div>
                                     <div className="font-bold text-white text-lg">{author?.name}</div>
                                </div>
                                <div className="bg-red-900/40 px-3 py-1 rounded text-red-200 font-black text-sm border border-red-500/30">
                                    +{score} {T_COMMON.points}
                                </div>
                            </div>
                            <div className="p-3 bg-zinc-950/50 border-b border-zinc-800">
                                <p className="text-zinc-400 italic text-sm font-medium">"{record.questionText}"</p>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {record.details.map((detail, dIdx) => {
                                    const realAnswerer = state.players.find(p => p.id === detail.realAnswererId);
                                    const guessedPlayer = state.players.find(p => p.id === detail.guessedId);
                                    return (
                                        <div key={dIdx} className={`p-3 flex items-center justify-between ${detail.isCorrect ? 'bg-green-900/10' : 'bg-red-900/10'}`}>
                                            <div className="flex-1 pr-2">
                                                <div className="text-zinc-200 font-bold text-sm mb-1">"{detail.answerText}"</div>
                                                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase">
                                                    <span className="text-zinc-500">{T.writer}: <span className="text-zinc-300">{realAnswerer?.name}</span></span>
                                                    <span className="text-zinc-500">{T.guess}: <span className={`${detail.isCorrect ? 'text-green-500' : 'text-red-500'}`}>{guessedPlayer?.name}</span></span>
                                                </div>
                                            </div>
                                            <div className="w-6 flex justify-center">
                                                {detail.isCorrect ? <span className="text-green-500 text-lg">✓</span> : <span className="text-red-500 text-lg">✗</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20">
                <button 
                    onClick={() => dispatch({ type: 'NEXT_GAME' })}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg text-lg transition-transform active:scale-95 uppercase tracking-widest">
                    {T_COMMON.next}
                </button>
            </div>
        </div>
    );
};