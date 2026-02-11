import React from 'react';

const TreeItem = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div className="ml-6 border-l-2 border-slate-700 pl-4 mt-2">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
      <span className="text-sm font-mono text-slate-300">{label}</span>
    </div>
    {children}
  </div>
);

export const ArchitectureMap: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Önerilen Component Mimarisi</h2>
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
        
        <TreeItem label="App (Provider: GameContext)">
          <TreeItem label="Layout (Background, Container)">
            
            <TreeItem label="ScreenManager (Switch based on state.screen)">
              
              <div className="mt-4 mb-2 text-xs uppercase tracking-widest text-slate-500 font-bold">1. Giriş & Ayarlar</div>
              <TreeItem label="LobbyScreen">
                <TreeItem label="PlayerList (Add/Remove)" />
                <TreeItem label="GameSettings (Toggle MiniGames)" />
                <TreeItem label="StartButton" />
              </TreeItem>

              <div className="mt-4 mb-2 text-xs uppercase tracking-widest text-slate-500 font-bold">2. Oyun Döngüsü (GameLoopManager)</div>
              <TreeItem label="GameLoopManager (Controls MiniGame State)">
                
                <TreeItem label="InterstitialScreen (Gizlilik Ekranı)">
                   <TreeItem label="PassPhoneMsg ('Ver: Ahmet')" />
                   <TreeItem label="UnlockBtn" />
                </TreeItem>

                <TreeItem label="InstructionScreen (Eğitim)">
                   <TreeItem label="GameRules (Text/TTS)" />
                </TreeItem>

                <TreeItem label="PhaseManager (Switch based on phase)">
                   <TreeItem label="InputPhase">
                      <TreeItem label="DynamicForm (Game specific inputs)" />
                      <TreeItem label="Timer (Optional)" />
                   </TreeItem>
                   <TreeItem label="ResolutionPhase">
                      <TreeItem label="VotingModule (Game 4/7)" />
                      <TreeItem label="RevealAnimation" />
                      <TreeItem label="ScoreDelta" />
                   </TreeItem>
                </TreeItem>

                <TreeItem label="StatusHUD (Turn indicator, Round #)" />
              </TreeItem>

              <div className="mt-4 mb-2 text-xs uppercase tracking-widest text-slate-500 font-bold">3. Sonuçlar</div>
              <TreeItem label="FinalScoreScreen">
                 <TreeItem label="CheatVoteModule (Game 7)" />
                 <TreeItem label="Podium" />
              </TreeItem>

            </TreeItem>
          </TreeItem>
        </TreeItem>

      </div>
    </div>
  );
};