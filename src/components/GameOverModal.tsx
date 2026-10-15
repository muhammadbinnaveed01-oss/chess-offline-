import React from 'react';
import { GameStatus } from '../types/chess';
import { Trophy, RefreshCw, LogOut, Eye } from 'lucide-react';

interface GameOverModalProps {
  status: GameStatus;
  winner: 'w' | 'b' | 'draw' | null;
  onPlayAgain: () => void;
  onExit: () => void;
  onReview: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  winner,
  onPlayAgain,
  onExit,
  onReview,
}) => {
  let title = 'Game Finished';
  let subtitle = '';
  let isWin = false;

  if (status === 'checkmate') {
    title = winner === 'w' ? 'White Wins!' : 'Black Wins!';
    subtitle = 'Victory achieved by checkmate.';
    isWin = true;
  } else if (status === 'stalemate') {
    title = 'Stalemate';
    subtitle = 'No legal moves remaining and not in check. The game is a draw.';
  } else if (status === 'draw') {
    title = 'Draw';
    subtitle = 'The game has concluded in a draw.';
  } else if (status === 'resigned') {
    title = winner === 'w' ? 'White Wins!' : 'Black Wins!';
    subtitle = `${winner === 'w' ? 'Black' : 'White'} resigned the match.`;
  } else if (status === 'timeout') {
    title = winner === 'w' ? 'White Wins on Time!' : 'Black Wins on Time!';
    subtitle = 'Opponent ran out of time.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <Trophy className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-1">{title}</h3>
        <p className="text-sm text-stone-600 mb-6">{subtitle}</p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReview}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-medium text-xs hover:bg-stone-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Review Board
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-medium text-xs hover:bg-stone-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Exit to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
