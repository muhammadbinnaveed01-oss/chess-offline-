import React from 'react';
import { ChessPieceSvg } from './ChessPieceSvg';
import { PlayerColor } from '../types/chess';
import { Clock } from 'lucide-react';

interface PlayerInfoProps {
  name: string;
  color: PlayerColor;
  capturedPieces: string[]; // piece types e.g. ['p', 'p', 'n'] captured BY this player
  materialAdvantage: number; // e.g. +3
  isCurrentTurn: boolean;
  timeLeft?: number | null; // seconds
  isAi?: boolean;
  isAiThinking?: boolean;
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

export const PlayerBar: React.FC<PlayerInfoProps> = ({
  name,
  color,
  capturedPieces,
  materialAdvantage,
  isCurrentTurn,
  timeLeft,
  isAi,
  isAiThinking,
}) => {
  // Sort captured pieces by value
  const sortedPieces = [...capturedPieces].sort(
    (a, b) => (PIECE_VALUES[a] || 0) - (PIECE_VALUES[b] || 0)
  );

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isWhite = color === 'w';
  const enemyColor: PlayerColor = isWhite ? 'b' : 'w';

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
        isCurrentTurn
          ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
          : 'bg-stone-100 text-stone-800 border border-stone-200'
      }`}
    >
      {/* Player name & status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
            isWhite
              ? 'bg-white text-stone-900 border-stone-300'
              : 'bg-stone-900 text-white border-stone-700'
          }`}
        >
          {isWhite ? 'W' : 'B'}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate leading-tight">{name}</span>
            {isAi && (
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isCurrentTurn ? 'text-amber-400' : 'text-stone-500'}`}>
                BOT
              </span>
            )}
            {isAiThinking && (
              <span className="text-[11px] text-amber-300 animate-pulse font-medium">
                thinking...
              </span>
            )}
          </div>

          {/* Captured pieces tray */}
          <div className="flex items-center gap-0.5 mt-0.5 h-4 overflow-hidden">
            {sortedPieces.map((pType, idx) => (
              <div key={idx} className="w-3.5 h-3.5 -mr-1 shrink-0 drop-shadow-xs">
                <ChessPieceSvg
                  type={pType as 'p' | 'n' | 'b' | 'r' | 'q' | 'k'}
                  color={enemyColor}
                />
              </div>
            ))}
            {materialAdvantage > 0 && (
              <span className={`text-[10px] font-bold ml-1.5 tabular-nums ${isCurrentTurn ? 'text-amber-300' : 'text-stone-700'}`}>
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock display (if timed game) */}
      {timeLeft !== undefined && timeLeft !== null && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold tabular-nums shrink-0 ${
            isCurrentTurn
              ? timeLeft <= 30
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-stone-800 text-amber-300'
              : 'bg-stone-200/80 text-stone-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5 opacity-80" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      )}
    </div>
  );
};
