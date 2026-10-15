import React from 'react';
import { ChessPieceSvg } from './ChessPieceSvg';
import { PlayerColor } from '../types/chess';

interface PromotionModalProps {
  color: PlayerColor;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onCancel }) => {
  const pieces: Array<{ type: 'q' | 'r' | 'b' | 'n'; label: string }> = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-sm w-full p-5 text-center animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-bold text-stone-900 mb-1">Pawn Promotion</h3>
        <p className="text-xs text-stone-500 mb-4">Choose a piece to promote your pawn to</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {pieces.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => onSelect(p.type)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <div className="w-12 h-12 mb-1 flex items-center justify-center">
                <ChessPieceSvg type={p.type} color={color} />
              </div>
              <span className="text-xs font-semibold text-stone-700">{p.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
        >
          Cancel Move
        </button>
      </div>
    </div>
  );
};
