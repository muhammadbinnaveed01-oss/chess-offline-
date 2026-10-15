import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { GameMode, PlayerColor, AiDifficulty, TimeControl, GameStatus } from './types/chess';
import { soundManager } from './utils/audio';
import { findBestMove } from './utils/ai';
import { ChessBoard } from './components/ChessBoard';
import { PlayerBar } from './components/CapturedPieces';
import { MoveHistory } from './components/MoveHistory';
import { PromotionModal } from './components/PromotionModal';
import { GameOverModal } from './components/GameOverModal';
import { StartMenu } from './components/StartMenu';
import {
  RotateCcw,
  LogOut,
  Volume2,
  VolumeX,
  Undo2,
  FlipVertical,
  Flag,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  // Game session states
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [playerSide, setPlayerSide] = useState<PlayerColor>('w');
  const [aiDifficulty, setDifficulty] = useState<AiDifficulty>('medium');
  const [timeControl, setTimeControl] = useState<TimeControl>({
    id: 'casual',
    name: 'Casual',
    initialMinutes: 0,
    incrementSeconds: 0,
  });

  // Active chess instance
  const [chess] = useState<Chess>(() => new Chess());
  const [, setRenderTrigger] = useState<number>(0); // Force re-render on chess state change

  // Board interaction states
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [boardOrientation, setBoardOrientation] = useState<PlayerColor>('w');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Promotion pending state
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: PlayerColor;
  } | null>(null);

  // AI thinking ref and timeout
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timers (in seconds)
  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Game over state
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [isGameOverModalDismissed, setIsGameOverModalDismissed] = useState<boolean>(false);

  // UI confirmation dialogs
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showHistoryMobile, setShowHistoryMobile] = useState<boolean>(false);

  const forceUpdate = () => setRenderTrigger((prev) => prev + 1);

  // Check game over status
  const evaluateGameEnd = useCallback(() => {
    if (chess.isCheckmate()) {
      const winningColor = chess.turn() === 'w' ? 'b' : 'w';
      setWinner(winningColor);
      setGameStatus('checkmate');
      soundManager.playVictory();
      return true;
    }

    if (chess.isStalemate()) {
      setWinner('draw');
      setGameStatus('stalemate');
      soundManager.playGameOver();
      return true;
    }

    if (chess.isThreefoldRepetition() || chess.isInsufficientMaterial() || chess.isDraw()) {
      setWinner('draw');
      setGameStatus('draw');
      soundManager.playGameOver();
      return true;
    }

    return false;
  }, [chess]);

  // Execute AI turn
  const triggerAiMove = useCallback(() => {
    if (gameMode !== 'vs_ai') return;
    if (chess.isGameOver()) return;

    const currentTurn = chess.turn();
    const aiColor = playerSide === 'w' ? 'b' : 'w';
    if (currentTurn !== aiColor) return;

    setIsAiThinking(true);

    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    // Realistic human-like bot delay (400ms - 650ms)
    const delay = Math.floor(Math.random() * 250) + 400;
    aiTimeoutRef.current = setTimeout(() => {
      try {
        const bestMove = findBestMove(chess, aiDifficulty);
        if (bestMove) {
          const moveRes = chess.move(bestMove);
          if (moveRes) {
            setLastMove({ from: moveRes.from, to: moveRes.to });

            // Sound cue
            if (moveRes.captured) {
              soundManager.playCapture();
            } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
              soundManager.playCastle();
            } else {
              soundManager.playMove();
            }

            if (chess.inCheck()) {
              soundManager.playCheck();
            }

            evaluateGameEnd();
          }
        }
      } catch (err) {
        console.error('AI move error:', err);
      } finally {
        setIsAiThinking(false);
        aiTimeoutRef.current = null;
        forceUpdate();
      }
    }, delay);
  }, [chess, gameMode, playerSide, aiDifficulty, evaluateGameEnd]);

  // Clock countdown interval
  useEffect(() => {
    if (gameState !== 'playing' || gameStatus !== 'in_progress') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timeControl.initialMinutes <= 0) return; // Untimed casual game

    timerRef.current = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameStatus('timeout');
            setWinner('b');
            soundManager.playGameOver();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameStatus('timeout');
            setWinner('w');
            soundManager.playGameOver();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, gameStatus, chess, timeControl]);

  // Handle Square Selection and Moves
  const handleSquareClick = (square: Square) => {
    if (isAiThinking || gameStatus !== 'in_progress') return;

    const currentTurn = chess.turn();
    const pieceOnSquare = chess.get(square);

    // If clicking on our own piece, select it and show legal target squares
    if (pieceOnSquare && pieceOnSquare.color === currentTurn) {
      // In vs_ai, don't allow selecting the bot's pieces
      if (gameMode === 'vs_ai' && currentTurn !== playerSide) return;

      // If user taps the already selected piece, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setValidMoves(moves);
      return;
    }

    // If we have a selected piece, attempt to make a move to the clicked square
    if (selectedSquare) {
      // Find matching move
      const targetMove = validMoves.find((m) => m.to === square);

      if (targetMove) {
        // Check for pawn promotion
        const isPawnPromotion =
          targetMove.piece === 'p' &&
          ((targetMove.color === 'w' && square[1] === '8') ||
            (targetMove.color === 'b' && square[1] === '1'));

        if (isPawnPromotion) {
          // Open promotion dialog
          setPendingPromotion({
            from: selectedSquare,
            to: square,
            color: targetMove.color as PlayerColor,
          });
          return;
        }

        // Execute regular move
        executeMove({
          from: selectedSquare,
          to: square,
        });
      } else {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const executeMove = (moveObj: { from: Square; to: Square; promotion?: string }) => {
    try {
      const res = chess.move(moveObj);
      if (res) {
        setLastMove({ from: res.from, to: res.to });
        setSelectedSquare(null);
        setValidMoves([]);
        forceUpdate();

        // Sound feedback
        if (res.captured) {
          soundManager.playCapture();
        } else if (res.flags.includes('k') || res.flags.includes('q')) {
          soundManager.playCastle();
        } else {
          soundManager.playMove();
        }

        if (chess.inCheck()) {
          soundManager.playCheck();
        }

        // Check if game ended
        const isOver = evaluateGameEnd();

        // If not over and in AI mode, trigger bot response
        if (!isOver && gameMode === 'vs_ai') {
          setTimeout(triggerAiMove, 100);
        }
      }
    } catch (e) {
      console.error('Invalid move:', e);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    executeMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: piece,
    });
    setPendingPromotion(null);
  };

  const handlePromotionCancel = () => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Start new game
  const handleStartGame = (config: {
    mode: GameMode;
    playerColor: PlayerColor;
    difficulty: AiDifficulty;
    timeControl: TimeControl;
  }) => {
    soundManager.init();

    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setIsAiThinking(false);

    chess.reset();
    setGameMode(config.mode);
    setPlayerSide(config.playerColor);
    setDifficulty(config.difficulty);
    setTimeControl(config.timeControl);
    setBoardOrientation(config.playerColor);

    const initialSecs = config.timeControl.initialMinutes * 60;
    setWhiteTime(initialSecs);
    setBlackTime(initialSecs);

    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
    setWinner(null);
    setGameStatus('in_progress');
    setIsGameOverModalDismissed(false);
    setShowResetConfirm(false);
    setShowExitConfirm(false);
    setGameState('playing');
    forceUpdate();

    // If player is Black in vs_ai, AI (White) makes the first move!
    if (config.mode === 'vs_ai' && config.playerColor === 'b') {
      setIsAiThinking(true);
      aiTimeoutRef.current = setTimeout(() => {
        try {
          const aiMove = findBestMove(chess, config.difficulty);
          if (aiMove) {
            const res = chess.move(aiMove);
            if (res) {
              setLastMove({ from: res.from, to: res.to });
              soundManager.playMove();
              forceUpdate();
            }
          }
        } catch (e) {
          console.error('Initial AI move error:', e);
        } finally {
          setIsAiThinking(false);
          aiTimeoutRef.current = null;
        }
      }, 500);
    }
  };

  // Reset current game
  const handleResetGame = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setIsAiThinking(false);

    chess.reset();
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
    setWinner(null);
    setGameStatus('in_progress');
    setIsGameOverModalDismissed(false);
    setShowResetConfirm(false);

    const initialSecs = timeControl.initialMinutes * 60;
    setWhiteTime(initialSecs);
    setBlackTime(initialSecs);
    forceUpdate();

    if (gameMode === 'vs_ai' && playerSide === 'b') {
      setIsAiThinking(true);
      aiTimeoutRef.current = setTimeout(() => {
        try {
          const aiMove = findBestMove(chess, aiDifficulty);
          if (aiMove) {
            const res = chess.move(aiMove);
            if (res) {
              setLastMove({ from: res.from, to: res.to });
              soundManager.playMove();
              forceUpdate();
            }
          }
        } catch (e) {
          console.error('Reset AI move error:', e);
        } finally {
          setIsAiThinking(false);
          aiTimeoutRef.current = null;
        }
      }, 500);
    }
  };

  // Exit back to Start Menu
  const handleExitGame = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setIsAiThinking(false);
    chess.reset();
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('menu');
    setShowExitConfirm(false);
    setShowResetConfirm(false);
  };

  // Undo move
  const handleUndoMove = () => {
    const histLen = chess.history().length;
    if (histLen === 0) return;

    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setIsAiThinking(false);

    if (gameMode === 'vs_ai') {
      const currentTurn = chess.turn();
      const isPlayerTurn = currentTurn === playerSide;
      // If it is player's turn, AI already responded -> undo 2 moves (AI move + Player move)
      if (isPlayerTurn && histLen >= 2) {
        chess.undo();
        chess.undo();
      } else {
        chess.undo();
      }
    } else {
      chess.undo();
    }

    const history = chess.history({ verbose: true });
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setLastMove({ from: prev.from, to: prev.to });
    } else {
      setLastMove(null);
    }

    setSelectedSquare(null);
    setValidMoves([]);
    setPendingPromotion(null);
    setGameStatus('in_progress');
    setWinner(null);
    setIsGameOverModalDismissed(false);
    soundManager.playMove();
    forceUpdate();
  };

  // Resign match
  const handleResign = () => {
    if (gameStatus !== 'in_progress') return;
    const resigningColor = chess.turn();
    const winningColor = resigningColor === 'w' ? 'b' : 'w';
    setWinner(winningColor);
    setGameStatus('resigned');
    soundManager.playGameOver();
  };

  // Sound toggle
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundManager.enabled = nextVal;
  };

  // Flip board toggle
  const toggleBoardFlip = () => {
    setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
  };

  // Calculate captured pieces & material difference
  const { whiteCaptured, blackCaptured, whiteAdvantage, blackAdvantage } = React.useMemo(() => {
    const startCounts: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentCountsW: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const currentCountsB: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };

    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          if (piece.color === 'w') {
            currentCountsW[piece.type] = (currentCountsW[piece.type] || 0) + 1;
          } else {
            currentCountsB[piece.type] = (currentCountsB[piece.type] || 0) + 1;
          }
        }
      }
    }

    // White captures Black's pieces
    const whiteCapturesList: string[] = [];
    for (const [ptype, maxCount] of Object.entries(startCounts)) {
      const lost = maxCount - (currentCountsB[ptype] || 0);
      for (let i = 0; i < lost; i++) whiteCapturesList.push(ptype);
    }

    // Black captures White's pieces
    const blackCapturesList: string[] = [];
    for (const [ptype, maxCount] of Object.entries(startCounts)) {
      const lost = maxCount - (currentCountsW[ptype] || 0);
      for (let i = 0; i < lost; i++) blackCapturesList.push(ptype);
    }

    const PIECE_VALS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const scoreW = whiteCapturesList.reduce((acc, p) => acc + (PIECE_VALS[p] || 0), 0);
    const scoreB = blackCapturesList.reduce((acc, p) => acc + (PIECE_VALS[p] || 0), 0);

    return {
      whiteCaptured: whiteCapturesList,
      blackCaptured: blackCapturesList,
      whiteAdvantage: Math.max(0, scoreW - scoreB),
      blackAdvantage: Math.max(0, scoreB - scoreW),
    };
  }, [chess]);

  // If in start menu view, display StartMenu component
  if (gameState === 'menu') {
    return <StartMenu onStartGame={handleStartGame} />;
  }

  // Active playing view
  const currentTurn = chess.turn();
  const isWhiteTurn = currentTurn === 'w';
  const isTimed = timeControl.initialMinutes > 0;

  // Determine top and bottom players depending on board orientation
  const isWhiteBottom = boardOrientation === 'w';

  const topPlayer = isWhiteBottom
    ? {
        name: gameMode === 'vs_ai' && playerSide === 'w' ? `Computer (${aiDifficulty})` : 'Black',
        color: 'b' as PlayerColor,
        captured: blackCaptured,
        advantage: blackAdvantage,
        time: isTimed ? blackTime : null,
        isAi: gameMode === 'vs_ai' && playerSide === 'w',
        isAiThinking: isAiThinking && currentTurn === 'b',
      }
    : {
        name: gameMode === 'vs_ai' && playerSide === 'b' ? `Computer (${aiDifficulty})` : 'White',
        color: 'w' as PlayerColor,
        captured: whiteCaptured,
        advantage: whiteAdvantage,
        time: isTimed ? whiteTime : null,
        isAi: gameMode === 'vs_ai' && playerSide === 'b',
        isAiThinking: isAiThinking && currentTurn === 'w',
      };

  const bottomPlayer = isWhiteBottom
    ? {
        name: gameMode === 'vs_ai' ? 'You' : 'White',
        color: 'w' as PlayerColor,
        captured: whiteCaptured,
        advantage: whiteAdvantage,
        time: isTimed ? whiteTime : null,
        isAi: false,
        isAiThinking: false,
      }
    : {
        name: gameMode === 'vs_ai' ? 'You' : 'Black',
        color: 'b' as PlayerColor,
        captured: blackCaptured,
        advantage: blackAdvantage,
        time: isTimed ? blackTime : null,
        isAi: false,
        isAiThinking: false,
      };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Bar Header */}
      <header className="bg-stone-950/90 backdrop-blur-md border-b border-stone-800 px-3 sm:px-6 py-2.5 shrink-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & mode tag */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-1.5">
              <span className="inline-block text-amber-400">♟</span>
              2D Chess
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
              {gameMode === 'vs_ai' ? `vs Computer (${aiDifficulty})` : 'Pass & Play'}
            </span>
          </div>

          {/* Functional Game Action Buttons: Reset, Exit, Sound, Flip, Undo */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Undo */}
            <button
              type="button"
              onClick={handleUndoMove}
              disabled={chess.history().length === 0 || isAiThinking || gameStatus !== 'in_progress'}
              title="Take back last move"
              className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            {/* Flip */}
            <button
              type="button"
              onClick={toggleBoardFlip}
              title="Flip board perspective"
              className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <FlipVertical className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>

            {/* Reset Button (Requested in user brief) */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold transition-colors border border-stone-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Exit Button (Requested in user brief) */}
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 text-xs font-semibold transition-colors border border-red-900/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4">
        {/* Board & Player HUD Column */}
        <div className="w-full max-w-[540px] flex flex-col gap-2">
          {/* Persistent Match Review Banner */}
          {gameStatus !== 'in_progress' && gameStatus !== 'waiting' && isGameOverModalDismissed && (
            <div className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">🏁 Match Ended:</span>
                <span className="text-stone-200 font-medium">
                  {gameStatus === 'checkmate'
                    ? `Checkmate — ${winner === 'w' ? 'White' : 'Black'} won!`
                    : gameStatus === 'stalemate'
                    ? 'Stalemate (Draw)'
                    : gameStatus === 'timeout'
                    ? `Time out — ${winner === 'w' ? 'White' : 'Black'} won!`
                    : gameStatus === 'resigned'
                    ? `${winner === 'w' ? 'White' : 'Black'} won by resignation!`
                    : 'Draw'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsGameOverModalDismissed(false)}
                className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold transition-colors"
              >
                View Summary
              </button>
            </div>
          )}

          {/* Top Player (Opponent) */}
          <PlayerBar
            name={topPlayer.name}
            color={topPlayer.color}
            capturedPieces={topPlayer.captured}
            materialAdvantage={topPlayer.advantage}
            isCurrentTurn={currentTurn === topPlayer.color}
            timeLeft={topPlayer.time}
            isAi={topPlayer.isAi}
            isAiThinking={topPlayer.isAiThinking}
          />

          {/* The Tournament Roll-Up Board */}
          <ChessBoard
            game={chess}
            orientation={boardOrientation}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            onSquareClick={handleSquareClick}
            isAiThinking={isAiThinking}
            showCoordinates={true}
          />

          {/* Bottom Player (User / Active) */}
          <PlayerBar
            name={bottomPlayer.name}
            color={bottomPlayer.color}
            capturedPieces={bottomPlayer.captured}
            materialAdvantage={bottomPlayer.advantage}
            isCurrentTurn={currentTurn === bottomPlayer.color}
            timeLeft={bottomPlayer.time}
            isAi={bottomPlayer.isAi}
            isAiThinking={bottomPlayer.isAiThinking}
          />

          {/* Mobile Move List Quick Drawer Toggle */}
          <div className="flex items-center justify-between lg:hidden pt-1">
            <button
              type="button"
              onClick={() => setShowHistoryMobile(!showHistoryMobile)}
              className="text-xs font-semibold text-stone-400 hover:text-white flex items-center gap-1 py-1 px-2 rounded bg-stone-800/80"
            >
              <span>{showHistoryMobile ? 'Hide Move History' : 'Show Move History'}</span>
              <span className="text-amber-400 font-mono">({chess.history().length} moves)</span>
            </button>

            {gameStatus === 'in_progress' && (
              <button
                type="button"
                onClick={handleResign}
                className="text-xs text-stone-500 hover:text-red-400 flex items-center gap-1 py-1 px-2"
              >
                <Flag className="w-3 h-3" />
                Resign
              </button>
            )}
          </div>

          {/* Mobile collapsible move history */}
          {showHistoryMobile && (
            <div className="lg:hidden mt-2">
              <MoveHistory history={chess.history()} fen={chess.fen()} pgn={chess.pgn()} />
            </div>
          )}
        </div>

        {/* Desktop Sidebar: Game Info, Move History, Status */}
        <div className="hidden lg:flex flex-col gap-3 w-72 shrink-0 h-[560px]">
          {/* Status Card */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status</span>
              <span className="text-xs font-medium text-stone-400">
                Turn {Math.floor(chess.history().length / 2) + 1}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  isWhiteTurn ? 'bg-white ring-2 ring-stone-400' : 'bg-stone-900 ring-2 ring-stone-600'
                }`}
              />
              <span className="text-sm font-bold text-white">
                {isWhiteTurn ? 'White to move' : 'Black to move'}
              </span>
            </div>

            {chess.inCheck() && (
              <div className="py-1 px-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-bold flex items-center gap-1.5 animate-pulse mb-3">
                <span>⚠️ Check!</span>
              </div>
            )}

            {gameStatus === 'in_progress' && (
              <button
                type="button"
                onClick={handleResign}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-stone-800 hover:border-red-900/60 hover:bg-red-950/20 text-stone-400 hover:text-red-300 text-xs font-medium transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                Resign Match
              </button>
            )}
          </div>

          {/* Move History Table */}
          <div className="flex-1 overflow-hidden">
            <MoveHistory history={chess.history()} fen={chess.fen()} pgn={chess.pgn()} />
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="text-center py-2 text-[11px] text-stone-500 border-t border-stone-850 bg-stone-950 shrink-0">
        <span>Offline 2D Chess · Full FIDE rules (En Passant, Castling, Promotion) · Minimax AI</span>
      </footer>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={pendingPromotion.color}
          onSelect={handlePromotionSelect}
          onCancel={handlePromotionCancel}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus !== 'in_progress' && gameStatus !== 'waiting' && !isGameOverModalDismissed && (
        <GameOverModal
          status={gameStatus}
          winner={winner}
          onPlayAgain={handleResetGame}
          onExit={handleExitGame}
          onReview={() => setIsGameOverModalDismissed(true)}
        />
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-xl max-w-xs w-full p-5 text-center">
            <h4 className="text-base font-bold text-white mb-2">Reset Match?</h4>
            <p className="text-xs text-stone-400 mb-5">
              The board will be reset to the standard starting position.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-3 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetGame}
                className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
              >
                Reset Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-xl max-w-xs w-full p-5 text-center">
            <h4 className="text-base font-bold text-white mb-2">Exit to Menu?</h4>
            <p className="text-xs text-stone-400 mb-5">
              Your current match progress will be discarded.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2 px-3 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExitGame}
                className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Exit Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
