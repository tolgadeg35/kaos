import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ScreenType } from './types';
import { LobbyScreen } from './components/LobbyScreen';
import { GameLoopManager } from './components/GameLoopManager';
import { FinalScoreScreen } from './components/FinalScoreScreen';

const ScreenManager: React.FC = () => {
  const { state } = useGame();

  switch (state.screen) {
    case ScreenType.LOBBY:
      return <LobbyScreen />;
    case ScreenType.GAME_LOOP:
      return <GameLoopManager />;
    case ScreenType.FINAL_SCORE:
        return <FinalScoreScreen />;
    default:
      return <div className="text-zinc-500 text-center mt-20">Bilinmeyen Ekran</div>;
  }
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
        <ScreenManager />
      </div>
    </GameProvider>
  );
};

export default App;