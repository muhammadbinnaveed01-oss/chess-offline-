import React, { useState } from 'react';
import { GameMode, PlayerColor, AiDifficulty, TimeControl } from '../types/chess';
import { Play, Users, Cpu, Clock, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface StartMenuProps {
  onStartGame: (config: {
    mode: GameMode;
    playerColor: PlayerColor;
    difficulty: AiDifficulty;
    timeControl: TimeControl;
  }) => void;
}

const TIME_CONTROLS: TimeControl[] = [
  { id: 'casual', name: 'Casual (No Timer)', initialMinutes: 0, incrementSeconds: 0 },
  { id: 'rapid_10', name: 'Rapid 10 min', initialMinutes: 10, incrementSeconds: 0 },
  { id: 'blitz_5', name: 'Blitz 5 min', initialMinutes: 5, incrementSeconds: 0 },
  { id: 'bullet_3', name: 'Bullet 3 min', initialMinutes: 3, incrementSeconds: 0 },
];

export const StartMenu: React.FC<StartMenuProps> = ({ onStartGame }) => {
  const [mode, setMode] = useState<GameMode>('vs_ai');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium');
  const [selectedTimeId, setSelectedTimeId] = useState<string>('casual');
  const [showRules, setShowRules] = useState<boolean>(false);

  const handleStart = () => {
    const timeControl = TIME_CONTROLS.find((t) => t.id === selectedTimeId) || TIME_CONTROLS[0];
    onStartGame({
      mode,
      playerColor,
      difficulty,
      timeControl,
    });
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative chessboard accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-stone-900 font-bold text-2xl shadow-md mb-3 border border-stone-300">
            ♟
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
            Classic 2D Chess
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Offline chess with authentic tournament board design & complete FIDE rules
          </p>
        </div>

        {/* Mode Selector */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('vs_ai')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  mode === 'vs_ai'
                    ? 'bg-white text-stone-900 border-white shadow-sm'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <Cpu className="w-4 h-4" />
                vs Computer
              </button>

              <button
                type="button"
                onClick={() => setMode('pass_and_play')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  mode === 'pass_and_play'
                    ? 'bg-white text-stone-900 border-white shadow-sm'
                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Pass & Play
              </button>
            </div>
          </div>

          {/* AI Settings (if vs_ai) */}
          {mode === 'vs_ai' && (
            <div className="space-y-3 bg-stone-900/80 p-3.5 rounded-xl border border-stone-800/80 animate-in fade-in duration-150">
              {/* Difficulty */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-stone-300">Computer Difficulty</span>
                  <span className="text-amber-400 font-semibold capitalize">{difficulty}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'medium', 'hard'] as AiDifficulty[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        difficulty === level
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side Selection */}
              <div>
                <span className="block text-xs font-medium text-stone-300 mb-1.5">Play As</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerColor('w')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      playerColor === 'w'
                        ? 'bg-white text-stone-900 border-white'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-400 inline-block" />
                    White (Moves 1st)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerColor('b')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      playerColor === 'b'
                        ? 'bg-stone-900 text-white border-amber-500'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-600 inline-block" />
                    Black
                  </button>
                </div>
              </div>
              {/* Opening Book Indicator */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Master Opening Book
                </span>
                <span className="text-stone-400">Ruy Lopez · Sicilian · London · Italian</span>
              </div>
            </div>
          )}

          {/* Time Controls */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Time Control
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setSelectedTimeId(tc.id)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                    selectedTimeId === tc.id
                      ? 'bg-stone-800 border-amber-500 text-white font-semibold'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game Action Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Game
        </button>

        {/* Footer links */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs text-stone-500">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1 hover:text-stone-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules & Features</span>
          </button>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Offline Ready
          </span>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-stone-200 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Chess Rules & Engine Logic
            </h3>
            <div className="text-xs space-y-3 text-stone-400 leading-relaxed mb-6">
              <div>
                <strong className="text-white block mb-0.5">Complete FIDE Rules</strong>
                Supports all standard chess moves including Pawns (double-step on first move, diagonal captures), Knights (L-shape jumping), Bishops, Rooks, Queen, and King.
              </div>
              <div>
                <strong className="text-white block mb-0.5">Special Moves</strong>
                <ul className="list-disc list-inside space-y-0.5 text-stone-300">
                  <li><strong>Castling:</strong> Kingside (O-O) and Queenside (O-O-O) when king and rook have not moved and path is clear of check.</li>
                  <li><strong>En Passant:</strong> Capture an opponent pawn that just moved two squares past your pawn.</li>
                  <li><strong>Pawn Promotion:</strong> Pick Queen, Rook, Bishop, or Knight when pawn reaches the back rank.</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block mb-0.5">End Game Conditions</strong>
                Checkmate, Stalemate (draw), 50-Move Rule (draw), Threefold Repetition (draw), and Insufficient Material (draw).
              </div>
              <div>
                <strong className="text-white block mb-0.5">Offline Capability</strong>
                Runs 100% in your browser without requiring an internet connection. Play against the built-in Minimax AI or with a friend on the same device.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
