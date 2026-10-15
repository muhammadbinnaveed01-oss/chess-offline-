import React, { useMemo } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';
import { PlayerColor } from '../types/chess';

interface ChessBoardProps {
  game: Chess;
  orientation: PlayerColor; // 'w' or 'b'
  selectedSquare: Square | null;
  validMoves: Move[];
  lastMove: { from: string; to: string } | null;
  onSquareClick: (square: Square) => void;
  isAiThinking: boolean;
  showCoordinates?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  orientation,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick,
  isAiThinking,
  showCoordinates = true,
}) => {
  const isFlipped = orientation === 'b';
  const board = game.board(); // 8x8 array: board[0] is rank 8, board[7] is rank 1

  // Determine if the current active king is in check
  const inCheck = game.inCheck();
  const turn = game.turn();

  // Find king square for check indicator
  const kingSquare = useMemo(() => {
    if (!inCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, [inCheck, turn, board]);

  // Rank and file labels
  const files = isFlipped
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped
    ? ['1', '2', '3', '4', '5', '6', '7', '8']
    : ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Map valid moves to target squares for fast lookup
  const targetSquaresMap = useMemo(() => {
    const map = new Map<string, Move>();
    for (const m of validMoves) {
      map.set(m.to, m);
    }
    return map;
  }, [validMoves]);

  return (
    <div className="w-full max-w-[540px] mx-auto select-none px-2 sm:px-0">
      {/* Outer tournament vinyl board replica */}
      <div className="bg-white rounded-lg shadow-xl border border-stone-300 p-2 sm:p-3 transition-all">
        {/* Top coordinate row with inverted/rotated letters matching physical roll-up board */}
        {showCoordinates && (
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-stone-700 px-6 sm:px-8 py-0.5">
            <span className="w-4 text-center opacity-70 inline-block rotate-180">♟</span>
            <div className="flex-1 grid grid-cols-8 text-center">
              {files.map((file) => (
                <span key={`top-${file}`} className="inline-block rotate-180 tracking-tight">
                  {file}
                </span>
              ))}
            </div>
            <span className="w-4 text-center opacity-70 inline-block rotate-180">♟</span>
          </div>
        )}

        <div className="flex items-center">
          {/* Left rank coordinates */}
          {showCoordinates && (
            <div className="flex flex-col justify-around text-[11px] sm:text-xs font-semibold text-stone-700 w-4 sm:w-5 py-2 text-center h-[calc(100%-8px)]">
              {ranks.map((rank) => (
                <div key={`left-${rank}`} className="flex-1 flex items-center justify-center">
                  {rank}
                </div>
              ))}
            </div>
          )}

          {/* Main 8x8 Chessboard with double border */}
          <div className="flex-1 aspect-square p-[3px] border border-stone-900 rounded-[2px] bg-white">
            <div className="w-full h-full border border-stone-900 grid grid-cols-8 grid-rows-8 bg-stone-900">
              {ranks.map((rankStr, rankIdx) => {
                const rankNumber = parseInt(rankStr, 10);
                const actualRowIndex = 8 - rankNumber; // array row in board[][]

                return files.map((fileStr, fileIdx) => {
                  const actualColIndex = fileStr.charCodeAt(0) - 97;
                  const squareName = `${fileStr}${rankStr}` as Square;
                  const piece = board[actualRowIndex][actualColIndex];

                  // Dark/Light square logic
                  // Standard: a1 (0,0 from bottom) is dark.
                  // If (actualColIndex + actualRowIndex) % 2 === 0 -> light, otherwise dark
                  const isLightSquare = (actualColIndex + actualRowIndex) % 2 === 0;

                  const isSelected = selectedSquare === squareName;
                  const isLastMoveFrom = lastMove?.from === squareName;
                  const isLastMoveTo = lastMove?.to === squareName;
                  const isCheckSquare = kingSquare === squareName;
                  const targetMove = targetSquaresMap.get(squareName);
                  const isLegalTarget = !!targetMove;
                  const isCaptureTarget = isLegalTarget && (!!targetMove.captured || !!piece);

                  return (
                    <button
                      key={squareName}
                      type="button"
                      onClick={() => !isAiThinking && onSquareClick(squareName)}
                      disabled={isAiThinking}
                      aria-label={`Square ${squareName} ${piece ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : 'empty'}`}
                      className={`relative aspect-square flex items-center justify-center p-0.5 sm:p-1 focus:outline-none transition-colors duration-150 ${
                        isLightSquare ? 'bg-[#ffffff]' : 'bg-[#212124]'
                      } ${isSelected ? '!bg-amber-300/80 ring-2 ring-amber-500 z-10' : ''} ${
                        (isLastMoveFrom || isLastMoveTo) && !isSelected
                          ? isLightSquare
                            ? '!bg-[#dcfce7]' // soft light green for light square
                            : '!bg-[#14532d]' // rich dark green for dark square
                          : ''
                      }`}
                    >
                      {/* Check warning alert pulse */}
                      {isCheckSquare && (
                        <div className="absolute inset-0 bg-red-600/40 ring-4 ring-inset ring-red-600 animate-pulse z-20 pointer-events-none" />
                      )}

                      {/* Piece Icon */}
                      {piece && (
                        <div
                          className={`w-full h-full flex items-center justify-center transition-transform active:scale-95 z-10 pointer-events-none drop-shadow-sm`}
                        >
                          <ChessPieceSvg type={piece.type} color={piece.color} />
                        </div>
                      )}

                      {/* Legal Move Indicators */}
                      {isLegalTarget && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          {isCaptureTarget ? (
                            // Target has enemy piece -> red/amber hollow ring
                            <div className="w-[84%] h-[84%] rounded-full border-4 border-amber-500/90 shadow-sm animate-in fade-in zoom-in-75 duration-100" />
                          ) : (
                            // Empty square -> crisp centered dot
                            <div
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm ${
                                isLightSquare ? 'bg-stone-800/40' : 'bg-stone-200/60'
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                });
              })}
            </div>
          </div>

          {/* Right rank coordinates */}
          {showCoordinates && (
            <div className="flex flex-col justify-around text-[11px] sm:text-xs font-semibold text-stone-700 w-4 sm:w-5 py-2 text-center h-[calc(100%-8px)]">
              {ranks.map((rank) => (
                <div key={`right-${rank}`} className="flex-1 flex items-center justify-center">
                  {rank}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom coordinate row */}
        {showCoordinates && (
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-stone-700 px-6 sm:px-8 py-0.5">
            <span className="w-8 text-left text-[9px] font-bold tracking-wider text-stone-400 uppercase">
              2D Chess
            </span>
            <div className="flex-1 grid grid-cols-8 text-center">
              {files.map((file) => (
                <span key={`bottom-${file}`} className="tracking-tight">
                  {file}
                </span>
              ))}
            </div>
            <span className="w-8 text-right opacity-70">♚</span>
          </div>
        )}
      </div>
    </div>
  );
};
