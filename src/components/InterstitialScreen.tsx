import React from 'react';
import { useGame } from '../context/GameContext';
import { TEXTS } from '../data/locales';

export const InterstitialScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const currentPlayerId = state.roundOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  const T = TEXTS[state.language].interstitial;

  if (!currentPlayer) return <div>Hata: Oyuncu bulunamadı</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-6 text-center animate-in fade-in duration-500 overflow-hidden relative">
      
      {/* Background Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative z-10 mb-10">
        <div className="w-32 h-32 rounded-full border-4 border-red-600/30 bg-zinc-900 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <span className="text-5xl font-black text-red-500">
                {currentPlayer.name.charAt(0).toUpperCase()}
            </span>
        </div>
      </div>

      <div className="relative z-10 space-y-2 mb-12">
        <h2 className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em]">{T.passDevice}</h2>
        <h1 className="text-6xl font-black text-white drop-shadow-2xl">
            {currentPlayer.name}
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-xs space-y-6">
        <div className="bg-zinc-900/80 p-4 rounded-lg border border-red-900/30 text-center">
            <p className="text-red-400 text-xs font-bold uppercase tracking-wide">{T.warning}</p>
        </div>

        <button 
            onClick={() => dispatch({ type: 'CONFIRM_PASS' })}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-5 rounded-xl text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform active:scale-95 uppercase tracking-wider">
            {T.button} {currentPlayer.name.toUpperCase()}
        </button>
      </div>
    </div>
  );
};