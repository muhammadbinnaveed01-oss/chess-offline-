import { Chess, Move } from 'chess.js';
import { AiDifficulty } from '../types/chess';

// Piece baseline values (centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 325,
  b: 335,
  r: 510,
  q: 950,
  k: 20000,
};

// Piece Square Tables (from White's perspective; rank 8 down to 1, file a to h)
const PAWN_TABLE = [
  0,   0,   0,   0,   0,   0,   0,   0,
  55,  55,  55,  55,  55,  55,  55,  55,
  15,  15,  25,  35,  35,  25,  15,  15,
   5,   5,  15,  30,  30,  15,   5,   5,
   0,   0,   5,  25,  25,   5,   0,   0,
   5,  -5, -10,   5,   5, -10,  -5,   5,
   5,  10,  10, -25, -25,  10,  10,   5,
   0,   0,   0,   0,   0,   0,   0,   0,
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   5,  20,  25,  25,  20,   5, -30,
  -30,   5,  20,  25,  25,  20,   5, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -10,  10,  10,  15,  15,  10,  10, -10,
  -10,   5,  15,  20,  20,  15,   5, -10,
  -10,   0,  15,  20,  20,  15,   0, -10,
  -10,  10,  10,  15,  15,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const ROOK_TABLE = [
   0,   0,   0,   5,   5,   0,   0,   0,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
   5,  10,  10,  10,  10,  10,  10,   5,
   0,   0,   0,   5,   5,   0,   0,   0,
];

const QUEEN_TABLE = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -10,   5,   5,   5,   5,   5,   0, -10,
    0,   0,   5,   5,   5,   5,   0,  -5,
   -5,   0,   5,   5,   5,   5,   0,  -5,
  -10,   0,   5,   5,   5,   5,   0, -10,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20,
];

const KING_MIDDLE_TABLE = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
   20,  20,   0, -10, -10,   0,  20,  20,
   20,  30,  10,   0,   0,  10,  30,  20,
];

/**
 * Famous Master Opening Book
 * Sequences are indexed by canonical move history (san strings separated by space).
 * Includes Ruy Lopez, Italian Game, Queen's Gambit, Sicilian (Najdorf/Dragon),
 * French, Caro-Kann, King's Indian, London System, English Opening, and anti-Scholar's mate traps!
 */
const OPENING_BOOK: Record<string, string[]> = {
  // Turn 1
  '': ['e4', 'd4', 'c4', 'Nf3'],

  // Against 1. e4
  'e4': ['e5', 'c5', 'e6', 'c6', 'd5'],
  // Anti-Scholar's Mate / Wayward Queen responses
  'e4 e5 Qh5': ['Nc6'],
  'e4 e5 Qh5 Nc6 Bc4': ['g6'],
  'e4 e5 Qh5 Nc6 Bc4 g6 Qf3': ['Nf6'],
  'e4 e5 Bc4': ['Nf6', 'Nc6'],
  'e4 e5 Bc4 Nf6 d3': ['c6', 'Bc5'],

  // Open Game: 1. e4 e5
  'e4 e5': ['Nf3', 'Nc3', 'Bc4'],
  'e4 e5 Nf3': ['Nc6', 'Nf6'],
  // Ruy Lopez (Spanish Opening)
  'e4 e5 Nf3 Nc6': ['Bb5', 'Bc4', 'd4', 'Nc3'],
  'e4 e5 Nf3 Nc6 Bb5': ['a6', 'Nf6', 'd6'],
  'e4 e5 Nf3 Nc6 Bb5 a6': ['Ba4', 'Bxc6'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4': ['Nf6', 'd6', 'b5'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6': ['O-O', 'd3'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O': ['Be7', 'b5'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7': ['Re1', 'd3'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1': ['b5'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3': ['d6', 'O-O'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6': ['c3'],
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3': ['O-O'],

  // Italian Game (Giuoco Piano & Two Knights)
  'e4 e5 Nf3 Nc6 Bc4': ['Bc5', 'Nf6'],
  'e4 e5 Nf3 Nc6 Bc4 Bc5': ['c3', 'd3', 'O-O'],
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3': ['Nf6', 'd6'],
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6': ['d3', 'd4'],
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3': ['d6', 'a6', 'O-O'],
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6': ['O-O', 'Bb3'],
  'e4 e5 Nf3 Nc6 Bc4 Nf6': ['d3', 'Ng5', 'd4'],
  'e4 e5 Nf3 Nc6 Bc4 Nf6 d3': ['Bc5', 'Be7', 'h6'],

  // Sicilian Defense: 1. e4 c5
  'e4 c5': ['Nf3', 'Nc3', 'c3'],
  'e4 c5 Nf3': ['d6', 'Nc6', 'e6'],
  'e4 c5 Nf3 d6': ['d4'],
  'e4 c5 Nf3 d6 d4': ['cxd4'],
  'e4 c5 Nf3 d6 d4 cxd4': ['Nxd4'],
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4': ['Nf6', 'a6', 'g6'],
  // Sicilian Najdorf
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6': ['Nc3'],
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3': ['a6', 'g6', 'e6', 'Nc6'],
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6': ['Be3', 'Bg5', 'Be2', 'h3'],
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3': ['e5', 'e6', 'Ng4'],

  // French Defense: 1. e4 e6
  'e4 e6': ['d4'],
  'e4 e6 d4': ['d5'],
  'e4 e6 d4 d5': ['Nc3', 'Nd2', 'e5', 'exd5'],
  'e4 e6 d4 d5 Nc3': ['Nf6', 'Bb4', 'dxe4'],
  'e4 e6 d4 d5 Nc3 Nf6': ['e5', 'Bg5'],
  'e4 e6 d4 d5 e5': ['c5'],
  'e4 e6 d4 d5 e5 c5': ['c3'],

  // Caro-Kann Defense: 1. e4 c6
  'e4 c6': ['d4'],
  'e4 c6 d4': ['d5'],
  'e4 c6 d4 d5': ['Nc3', 'e5', 'exd5'],
  'e4 c6 d4 d5 Nc3': ['dxe4'],
  'e4 c6 d4 d5 Nc3 dxe4': ['Nxe4'],
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4': ['Bf5', 'Nd7', 'Nf6'],

  // Scandinavian Defense: 1. e4 d5
  'e4 d5': ['exd5'],
  'e4 d5 exd5': ['Qxd5', 'Nf6'],
  'e4 d5 exd5 Qxd5': ['Nc3'],
  'e4 d5 exd5 Qxd5 Nc3': ['Qa5', 'Qd6', 'Qd8'],

  // 1. d4 Openings (Queen's Gambit & Indian Systems)
  'd4': ['d5', 'Nf6', 'e6', 'f5'],
  'd4 d5': ['c4', 'Nf3', 'Bf4'],
  // Queen's Gambit
  'd4 d5 c4': ['e6', 'c6', 'dxc4'],
  'd4 d5 c4 e6': ['Nc3', 'Nf3'],
  'd4 d5 c4 e6 Nc3': ['Nf6', 'c6', 'Be7'],
  'd4 d5 c4 e6 Nc3 Nf6': ['Bg5', 'Nf3', 'cxd5'],
  'd4 d5 c4 c6': ['Nf3', 'Nc3'],
  'd4 d5 c4 c6 Nf3': ['Nf6'],
  'd4 d5 c4 c6 Nf3 Nf6': ['Nc3', 'e3'],
  'd4 d5 c4 dxc4': ['Nf3', 'e3', 'e4'],

  // London System
  'd4 d5 Bf4': ['Nf6', 'c5', 'e6'],
  'd4 d5 Bf4 Nf6': ['e3', 'Nf3'],
  'd4 d5 Bf4 Nf6 e3': ['c5', 'e6', 'Bf5'],
  'd4 Nf6 Bf4': ['g6', 'd5', 'e6'],

  // King's Indian & Nimzo-Indian: 1. d4 Nf6
  'd4 Nf6': ['c4', 'Nf3', 'Bf4', 'Bg5'],
  'd4 Nf6 c4': ['g6', 'e6', 'c5'],
  'd4 Nf6 c4 g6': ['Nc3', 'Nf3'],
  'd4 Nf6 c4 g6 Nc3': ['Bg7', 'd5'],
  'd4 Nf6 c4 g6 Nc3 Bg7': ['e4', 'Nf3'],
  'd4 Nf6 c4 g6 Nc3 Bg7 e4': ['d6'],
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6': ['Nf3', 'Be2', 'f3'],

  // English Opening: 1. c4
  'c4': ['e5', 'c5', 'Nf6', 'e6'],
  'c4 e5': ['Nc3', 'g3'],
  'c4 e5 Nc3': ['Nf6', 'Nc6'],
  'c4 e5 Nc3 Nf6': ['Nf3', 'g3'],
  'c4 Nf6': ['Nc3', 'Nf3', 'd4'],
};

/**
 * Lookup opening book by move history
 */
function getOpeningBookMove(game: Chess): string | null {
  const history = game.history();
  const historyKey = history.join(' ').trim();

  const candidateMoves = OPENING_BOOK[historyKey];
  if (!candidateMoves || candidateMoves.length === 0) return null;

  // Pick one of the book moves
  const chosenSan = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];

  // Validate that it's a legal move in current position
  const legalMoves = game.moves();
  if (legalMoves.includes(chosenSan)) {
    return chosenSan;
  }

  return null;
}

/**
 * Positional & Tactical Board Evaluation (Centipawns)
 */
function evaluateBoard(game: Chess): number {
  let totalScore = 0;
  const board = game.board();

  let whiteBishops = 0;
  let blackBishops = 0;
  let whiteKnights = 0;
  let blackKnights = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const pieceType = piece.type;
      const isWhite = piece.color === 'w';
      const baseValue = PIECE_VALUES[pieceType] || 0;

      if (pieceType === 'b') {
        if (isWhite) whiteBishops++;
        else blackBishops++;
      }
      if (pieceType === 'n') {
        if (isWhite) whiteKnights++;
        else blackKnights++;
      }

      // Square Index (0-63)
      const sqIdx = r * 8 + c;
      const whiteSqIdx = isWhite ? sqIdx : (7 - r) * 8 + c;
      let posScore = 0;

      switch (pieceType) {
        case 'p':
          posScore = PAWN_TABLE[whiteSqIdx];
          break;
        case 'n':
          posScore = KNIGHT_TABLE[whiteSqIdx];
          break;
        case 'b':
          posScore = BISHOP_TABLE[whiteSqIdx];
          break;
        case 'r':
          posScore = ROOK_TABLE[whiteSqIdx];
          break;
        case 'q':
          posScore = QUEEN_TABLE[whiteSqIdx];
          break;
        case 'k':
          posScore = KING_MIDDLE_TABLE[whiteSqIdx];
          break;
      }

      // Center control bonus for e4, d4, e5, d5
      if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
        posScore += 20;
      }

      const totalPieceVal = baseValue + posScore;
      totalScore += isWhite ? totalPieceVal : -totalPieceVal;
    }
  }

  // Bishop pair advantage (+45 centipawns)
  if (whiteBishops >= 2) totalScore += 45;
  if (blackBishops >= 2) totalScore -= 45;

  return totalScore;
}

/**
 * Order moves to drastically improve alpha-beta pruning speed:
 * 1. Winning Captures (MVV-LVA)
 * 2. Queen Promotions
 * 3. Checks
 * 4. Quiet moves
 */
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Promotions
    if (a.promotion === 'q') scoreA += 900;
    if (b.promotion === 'q') scoreB += 900;

    // Captures (MVV-LVA)
    if (a.captured) {
      const victimVal = PIECE_VALUES[a.captured] || 100;
      const attackerVal = PIECE_VALUES[a.piece] || 100;
      scoreA += victimVal * 10 - attackerVal;
    }
    if (b.captured) {
      const victimVal = PIECE_VALUES[b.captured] || 100;
      const attackerVal = PIECE_VALUES[b.piece] || 100;
      scoreB += victimVal * 10 - attackerVal;
    }

    // Castling bonus in opening
    if (a.flags.includes('k') || a.flags.includes('q')) scoreA += 60;
    if (b.flags.includes('k') || b.flags.includes('q')) scoreB += 60;

    return scoreB - scoreA;
  });
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) {
      return isMaximizing ? -99999 + (10 - depth) : 99999 - (10 - depth);
    }
    if (game.isDraw()) {
      return 0;
    }
    return evaluateBoard(game);
  }

  const moves = orderMoves(game.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

/**
 * Find the optimal or opening move for AI
 */
export function findBestMove(game: Chess, difficulty: AiDifficulty): Move | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // 1. Check Master Opening Book first for Medium & Hard (or 50% for Easy)
  if (difficulty !== 'easy' || Math.random() < 0.5) {
    const bookSan = getOpeningBookMove(game);
    if (bookSan) {
      const matchedMove = moves.find((m) => m.san === bookSan);
      if (matchedMove) {
        return matchedMove;
      }
    }
  }

  // 2. Easy Mode: Casual player with 30% random exploration
  if (difficulty === 'easy') {
    if (Math.random() < 0.35) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    const isMaximizing = game.turn() === 'w';
    let bestVal = isMaximizing ? -Infinity : Infinity;
    let candidates: Move[] = [];

    for (const move of moves) {
      game.move(move);
      const score = evaluateBoard(game);
      game.undo();

      if (isMaximizing) {
        if (score > bestVal) {
          bestVal = score;
          candidates = [move];
        } else if (score === bestVal) {
          candidates.push(move);
        }
      } else {
        if (score < bestVal) {
          bestVal = score;
          candidates = [move];
        } else if (score === bestVal) {
          candidates.push(move);
        }
      }
    }
    return candidates[Math.floor(Math.random() * candidates.length)] || moves[0];
  }

  // 3. Medium (depth 2) & Hard (depth 3)
  const depth = difficulty === 'medium' ? 2 : 3;
  const isMaximizing = game.turn() === 'w';

  const orderedMoves = orderMoves(moves);
  let bestMove: Move = orderedMoves[0];
  let bestVal = isMaximizing ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of orderedMoves) {
    game.move(move);
    const score = minimax(game, depth - 1, alpha, beta, !isMaximizing);
    game.undo();

    if (isMaximizing) {
      if (score > bestVal) {
        bestVal = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestVal) {
        bestVal = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
    }
  }

  // Ensure pawn promotions always default to Queen if somehow unspecified
  if (bestMove.flags.includes('p') && !bestMove.promotion) {
    bestMove.promotion = 'q';
  }

  return bestMove;
}
