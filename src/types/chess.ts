export type GameMode = 'vs_ai' | 'pass_and_play';
export type PlayerColor = 'w' | 'b';
export type AiDifficulty = 'easy' | 'medium' | 'hard';

export type TimeControl = {
  id: string;
  name: string;
  initialMinutes: number;
  incrementSeconds: number;
};

export interface GameSettings {
  mode: GameMode;
  playerColor: PlayerColor;
  difficulty: AiDifficulty;
  timeControl: TimeControl;
  autoFlip: boolean;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
}

export type GameStatus = 'waiting' | 'in_progress' | 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout';

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: 'w' | 'b';
  piece: string;
  captured?: string;
  promotion?: string;
  fen: string;
}
