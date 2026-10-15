import React, { useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface MoveHistoryProps {
  history: string[]; // standard SAN moves: ['e4', 'e5', 'Nf3', ...]
  fen: string;
  pgn: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history, fen, pgn }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Group moves into pairs (White & Black)
  const movePairs: Array<{ number: number; white: string; black?: string }> = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 bg-stone-50/70">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Moves ({movePairs.length})
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleCopy(pgn || 'No moves yet', 'pgn')}
            title="Copy PGN notation"
            className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded hover:bg-stone-200/60 transition-colors"
          >
            {copied === 'pgn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>PGN</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy(fen, 'fen')}
            title="Copy FEN position"
            className="flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded hover:bg-stone-200/60 transition-colors"
          >
            {copied === 'fen' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-xs max-h-36 sm:max-h-48 space-y-0.5"
      >
        {movePairs.length === 0 ? (
          <div className="text-center py-6 text-stone-400 text-xs italic">Game ready. White to move.</div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.number}
              className="grid grid-cols-12 py-0.5 px-1.5 rounded hover:bg-stone-50 text-stone-700"
            >
              <span className="col-span-2 text-stone-400 font-semibold">{pair.number}.</span>
              <span className="col-span-5 font-medium">{pair.white}</span>
              <span className="col-span-5 font-medium text-stone-600">{pair.black || ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
