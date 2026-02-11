import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GamePhase } from '../../types';
import { generateGame4Pairings, IGame4Pairing } from '../../services/matchingService';
import { TEXTS } from '../../data/locales';

export const WhoDoYouKnowGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const T = TEXTS[state.language].games.whoDoYouKnow;
  const T_COMMON = TEXTS[state.language].common;
  
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!state.gameData.assignments) {
        const pairings = generateGame4Pairings(state.players);
        dispatch({ type: 'SET_GAME_DATA', payload: { assignments: pairings } });
    }
  }, [state.gameData.assignments, state.players, dispatch]);

  const assignments = state.gameData.assignments as IGame4Pairing[] | undefined;
  if (!assignments) return <div className="text-zinc-500 text-center p-10 font-bold">{T_COMMON.loading}</div>;

  // --- PHASE 1: WRITE ---
  if (state.phase === GamePhase.INPUT) {
      const assignment = assignments.find(a => a.authorId === currentPlayerId);
      if (!assignment) return <div>{T_COMMON.error}</div>;
      
      const target = state.players.find(p => p.id === assignment.targetId);
      if (!target) return <div>{T_COMMON.error}</div>;

      const handleWriteSubmit = () => {
          if (!input.trim()) return;
          dispatch({ type: 'SUBMIT_INPUT', payload: { pairingId: `${assignment.authorId}-${assignment.targetId}`, question: input.trim() } });
          setInput('');
      };

      return (
          <div className="flex flex-col h-screen bg-zinc-950 p-6 justify-center">
              <div className="text-center mb-8">
                  <span className="text-red-500 font-black tracking-[0.3em] uppercase text-xs border border-red-500/30 px-3 py-1 rounded-full">{T.target}</span>
                  <h1 className="text-5xl font-black text-white mt-4">{target.name}</h1>
              </div>
              
              <p className="text-zinc-400 text-center mb-6 text-sm font-bold">
                  {T.instruction}
              </p>

              <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={T.placeholder}
                  className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-lg focus:border-red-500 outline-none resize-none shadow-inner"
              />

              <button 
                  onClick={handleWriteSubmit}
                  disabled={!input.trim()}
                  className="w-full bg-red-600 hover:bg-red-500 mt-6 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg">
                  {T.sendQuestion}
              </button>
          </div>
      );
  }

  // --- PHASE 2: ANSWER ---
  if (state.phase === GamePhase.INPUT_SECOND_PASS) {
      const assignment = assignments.find(a => a.readerId === currentPlayerId);
      if (!assignment) return <div>{T_COMMON.error}</div>;

      const target = state.players.find(p => p.id === assignment.targetId);
      const questionData = state.gameData.rounds.find(r => r.pairingId === `${assignment.authorId}-${assignment.targetId}`);
      if (!target || !questionData) return <div>{T_COMMON.loading}</div>;

      const handleAnswerSubmit = () => {
          if (!input.trim()) return;
          dispatch({ type: 'SUBMIT_INPUT', payload: { pairingId: `${assignment.authorId}-${assignment.targetId}`, answer: input.trim() } });
          setInput('');
      };

      return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 justify-center">
            <div className="text-center mb-6">
                <span className="text-orange-500 font-black tracking-[0.2em] uppercase text-[10px] bg-orange-950/30 px-2 py-1 rounded">{T.secretQuestion}</span>
                <div className="mt-4 bg-zinc-900/50 p-6 rounded-xl border border-white/5 shadow-xl">
                    <h1 className="text-2xl font-bold text-white italic">"{questionData.question}"</h1>
                </div>
            </div>
            
            <p className="text-zinc-500 text-center text-xs font-black uppercase tracking-widest mb-6">
                {T.about} <span className="text-white text-base mx-1">{target.name}</span>
            </p>

            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={T.whatWouldAnswer}
                className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-lg focus:border-orange-500 outline-none resize-none shadow-inner"
            />

            <button 
                onClick={handleAnswerSubmit}
                disabled={!input.trim()}
                className="w-full bg-orange-600 hover:bg-orange-500 mt-6 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg">
                {T.sendAnswer}
            </button>
        </div>
      );
  }

  // --- PHASE 3: RESOLUTION ---
  if (state.phase === GamePhase.RESOLUTION) {
      return <ResolutionView assignments={assignments} />;
  }

  return null;
};

interface IVerdictRecord {
    assignmentId: string;
    verdict: 'CORRECT' | 'WRONG' | 'BASIC';
}

const ResolutionView = ({ assignments }: { assignments: IGame4Pairing[] }) => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.whoDoYouKnow;
    const T_INTER = TEXTS[state.language].interstitial;

    const [index, setIndex] = useState(0);
    const [isInterstitial, setIsInterstitial] = useState(true);
    const [verdictHistory, setVerdictHistory] = useState<IVerdictRecord[]>([]);
    const [showSummary, setShowSummary] = useState(false);

    if (showSummary) {
        return <WhoDoYouKnowSummaryView assignments={assignments} verdictHistory={verdictHistory} />;
    }

    const assignment = assignments[index];
    if (!assignment) return <div className="text-white p-10">{TEXTS[state.language].common.loading}</div>;

    const target = state.players.find(p => p.id === assignment.targetId);

    if (isInterstitial) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-6 text-center animate-in fade-in duration-500 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="mb-8 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-red-500/20 bg-zinc-900 flex items-center justify-center">
                        <span className="text-5xl font-black text-red-500">
                            {target?.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="relative z-10 space-y-2 mb-10">
                    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">{T_INTER.passDevice}</h2>
                    <h1 className="text-5xl font-black text-white">
                        {target?.name}
                    </h1>
                </div>

                <button 
                    onClick={() => setIsInterstitial(false)}
                    className="relative z-10 w-full bg-white text-black font-black py-4 rounded-xl text-xl shadow-lg transition-transform active:scale-95 uppercase tracking-widest">
                    {T_INTER.button} {target?.name.toUpperCase()}
                </button>
            </div>
        );
    }

    const questionData = state.gameData.rounds.find(r => r.pairingId === `${assignment.authorId}-${assignment.targetId}`);
    const answerData = state.gameData.secondRoundData?.find(r => r.pairingId === `${assignment.authorId}-${assignment.targetId}`);
    
    const handleVerdict = (type: 'CORRECT' | 'WRONG' | 'BASIC') => {
        if (type === 'CORRECT') {
            dispatch({ type: 'UPDATE_SCORE', payload: { playerId: assignment.authorId, points: 1 } });
            dispatch({ type: 'UPDATE_SCORE', payload: { playerId: assignment.readerId, points: 1 } });
        } else if (type === 'BASIC') {
            dispatch({ type: 'UPDATE_SCORE', payload: { playerId: assignment.readerId, points: 1 } });
        }
        setVerdictHistory(prev => [...prev, { assignmentId: `${assignment.authorId}-${assignment.targetId}`, verdict: type }]);

        if (index < assignments.length - 1) {
            setIndex(prev => prev + 1);
            setIsInterstitial(true);
        } else {
            setShowSummary(true);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 justify-center text-center">
            <h2 className="text-red-600 font-black uppercase tracking-[0.3em] text-sm mb-6 animate-pulse">{T.courtTime}</h2>
            
            <div className="bg-zinc-900/80 p-6 rounded-xl border border-zinc-800 mb-4 shadow-lg">
                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-2">{T.question}</div>
                <div className="text-xl text-white font-bold italic">"{questionData?.question}"</div>
            </div>

            <div className="bg-zinc-900/80 p-6 rounded-xl border border-zinc-800 mb-8 shadow-lg">
                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-2">{T.answer}</div>
                <div className="text-xl text-white font-bold italic">"{answerData?.answer}"</div>
            </div>

            <div className="mb-8">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{T.judge}</p>
                <h1 className="text-4xl font-black text-white">{target?.name}</h1>
            </div>

            <div className="flex flex-col gap-3">
                <button onClick={() => handleVerdict('CORRECT')} className="bg-green-700 hover:bg-green-600 py-4 rounded-xl text-white font-black uppercase tracking-wide shadow-lg">
                    {T.btnCorrect}
                </button>
                <button onClick={() => handleVerdict('BASIC')} className="bg-orange-700 hover:bg-orange-600 py-4 rounded-xl text-white font-black uppercase tracking-wide shadow-lg">
                    {T.btnBasic}
                </button>
                <button onClick={() => handleVerdict('WRONG')} className="bg-red-700 hover:bg-red-600 py-4 rounded-xl text-white font-black uppercase tracking-wide shadow-lg">
                    {T.btnWrong}
                </button>
            </div>
        </div>
    );
};

const WhoDoYouKnowSummaryView = ({ assignments, verdictHistory }: { assignments: IGame4Pairing[], verdictHistory: IVerdictRecord[] }) => {
    const { state, dispatch } = useGame();
    const T = TEXTS[state.language].games.whoDoYouKnow;
    const T_COMMON = TEXTS[state.language].common;

    const getVerdictDetails = (type: string) => {
        switch(type) {
            case 'CORRECT': return { label: T.btnCorrect, badgeBg: 'bg-green-600', border: 'border-green-800', bg: 'bg-green-950/20' };
            case 'BASIC': return { label: T.btnBasic, badgeBg: 'bg-orange-600', border: 'border-orange-800', bg: 'bg-orange-950/20' };
            case 'WRONG': return { label: T.btnWrong, badgeBg: 'bg-red-600', border: 'border-red-800', bg: 'bg-red-950/20' };
            default: return { label: '?', badgeBg: 'bg-zinc-700', border: 'border-zinc-700', bg: 'bg-zinc-800' };
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 p-6 overflow-hidden">
             <div className="text-center pt-4 pb-8">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{T.results}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{T.report}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pb-20 scrollbar-hide">
                {assignments.map((assignment, idx) => {
                    const uniqueId = `${assignment.authorId}-${assignment.targetId}`;
                    const verdictRec = verdictHistory.find(v => v.assignmentId === uniqueId);
                    const verdictInfo = getVerdictDetails(verdictRec?.verdict || '');
                    
                    const question = state.gameData.rounds.find(r => r.pairingId === uniqueId)?.question;
                    const answer = state.gameData.secondRoundData?.find(r => r.pairingId === uniqueId)?.answer;

                    const author = state.players.find(p => p.id === assignment.authorId);
                    const target = state.players.find(p => p.id === assignment.targetId);
                    const reader = state.players.find(p => p.id === assignment.readerId);

                    return (
                        <div key={idx} className={`relative rounded-xl border-l-4 ${verdictInfo.border} ${verdictInfo.bg} bg-zinc-900/50 shadow-lg`}>
                             <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase text-white tracking-widest ${verdictInfo.badgeBg}`}>
                                {verdictInfo.label}
                            </div>

                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex flex-col border-b border-white/5 pb-3">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{T.dummy}</span>
                                    <span className="text-2xl font-black text-white">{target?.name}</span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{T.asker} ({author?.name})</span>
                                        </div>
                                        <p className="text-zinc-300 italic text-sm">"{question}"</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{T.answerer} ({reader?.name})</span>
                                        </div>
                                        <p className="text-white font-bold text-sm">"{answer}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
                <button 
                    onClick={() => dispatch({ type: 'NEXT_GAME' })}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl shadow-lg text-lg transition-transform active:scale-95 uppercase tracking-widest">
                    {T_COMMON.next}
                </button>
            </div>
        </div>
    );
};