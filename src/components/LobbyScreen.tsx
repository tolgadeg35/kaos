import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MINI_GAMES } from '../constants';
import { MINI_GAMES_EN } from '../data/en/constants';
import { MINI_GAMES_DE } from '../data/de/constants';
import { MiniGameType } from '../types';
import { TEXTS } from '../data/locales';

export const LobbyScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'games'>('players');

  const T = TEXTS[state.language];
  const GAMES = state.language === 'EN' ? MINI_GAMES_EN : state.language === 'DE' ? MINI_GAMES_DE : MINI_GAMES;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      dispatch({ type: 'ADD_PLAYER', payload: newPlayerName.trim() });
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  };

  // Check against selectedGameIds instead of availableGames which is used for the queue
  const isGameEnabled = (id: MiniGameType) => state.selectedGameIds.includes(id);

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-white overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Language Switcher - Mobile Friendly Dropdown */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
            <select 
                value={state.language}
                onChange={(e) => dispatch({type: 'SET_LANGUAGE', payload: e.target.value as any})}
                className="appearance-none bg-zinc-900/80 border border-zinc-700 text-white text-xs font-bold py-2 pl-8 pr-8 rounded-full focus:outline-none focus:border-red-500 backdrop-blur-md shadow-lg"
            >
                <option value="TR">TR</option>
                <option value="EN">EN</option>
                <option value="DE">DE</option>
            </select>
            {/* Globe Icon */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            {/* Chevron Icon */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative p-6 mt-6 text-center space-y-1 z-10 shrink-0">
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-red-500 to-red-900 drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
          {T.lobby.title}
        </h1>
        <p className="text-zinc-500 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase">{T.lobby.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex justify-center gap-2 mb-4 px-6 shrink-0">
        <button 
          onClick={() => setActiveTab('players')}
          className={`flex-1 max-w-[140px] py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${activeTab === 'players' ? 'bg-red-700 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}>
          {T.lobby.playersTab}
          <span className="block text-[10px] opacity-70">{state.players.length} {T.lobby.personCount}</span>
        </button>
        <button 
          onClick={() => setActiveTab('games')}
          className={`flex-1 max-w-[140px] py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${activeTab === 'games' ? 'bg-red-700 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}>
          {T.lobby.gamesTab}
          <span className="block text-[10px] opacity-70">{state.selectedGameIds.length} {T.lobby.selectedCount}</span>
        </button>
      </div>

      {/* Content Area - Scrollable with bottom padding to avoid button overlap */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-40 scrollbar-hide">
        
        {activeTab === 'players' && (
          <div className="max-w-md mx-auto space-y-4">
             <form onSubmit={handleAddPlayer} className="flex gap-2 group">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder={T.lobby.addPlayerPlaceholder}
                className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded-xl px-4 py-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600 text-white"
              />
              <button 
                type="submit"
                disabled={!newPlayerName.trim()}
                className="bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-black px-6 rounded-xl font-bold transition-all active:scale-95">
                {T.lobby.addButton}
              </button>
            </form>

            <ul className="space-y-2">
              {state.players.map((p, idx) => (
                <li key={p.id} className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-300 backdrop-blur-sm" style={{animationDelay: `${idx * 50}ms`}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 flex items-center justify-center text-sm font-black text-zinc-300">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-lg text-zinc-200">{p.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleRemovePlayer(p.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-red-950 hover:text-red-500 text-zinc-500 transition-colors"
                      aria-label="Oyuncuyu Sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {state.players.length < 3 && (
              <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-red-400 text-xs font-medium">{T.lobby.minPlayerWarning}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'games' && (
          <div className="max-w-md mx-auto space-y-3">
            {Object.values(GAMES).map((game) => {
              const isEndGame = game.id === MiniGameType.WAGER || game.id === MiniGameType.CHEAT_VOTE;
              
              return (
                <div 
                  key={game.id}
                  onClick={() => dispatch({ type: 'TOGGLE_GAME', payload: game.id })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${isGameEnabled(game.id) ? 'border-red-500/50 bg-red-950/20' : 'border-zinc-800 bg-zinc-900/50 opacity-60 grayscale'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-black text-lg ${isGameEnabled(game.id) ? 'text-red-100' : 'text-zinc-500'}`}>{game.name}</h3>
                        {isEndGame && (
                            <span className="text-[9px] bg-orange-900/40 text-orange-400 border border-orange-900/50 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                {T.lobby.finalBadge}
                            </span>
                        )}
                    </div>
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isGameEnabled(game.id) ? 'bg-red-600 text-white' : 'bg-zinc-800'}`}>
                      {isGameEnabled(game.id) && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-snug">{game.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Button Area - Fixed with gradient */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20">
        <button
          onClick={() => dispatch({ type: 'START_GAME' })}
          disabled={state.players.length < 3}
          className="w-full max-w-md mx-auto block bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-transform active:scale-95 tracking-widest uppercase">
          {T.lobby.startButton}
        </button>
      </div>
    </div>
  );
};