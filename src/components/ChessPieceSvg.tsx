import React from 'react';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export const ChessPieceSvg: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // Crisp standard Staunton vector definitions
  switch (type) {
    case 'p': // Pawn
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          {/* Base */}
          <path
            d="M 9,39.5 L 36,39.5 L 35,36.5 L 10,36.5 Z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Pedestal step */}
          <path
            d="M 11.5,36.5 C 12,34 13.5,33 15,33 L 30,33 C 31.5,33 33,34 33.5,36.5 Z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Stem & Collar */}
          <path
            d="M 15.5,33 C 17,25 18,20 17,17.5 L 28,17.5 C 27,20 28,25 29.5,33 Z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Collar ring */}
          <path
            d="M 16,18.5 C 19,20.5 26,20.5 29,18.5"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Head sphere */}
          <circle
            cx="22.5"
            cy="11.5"
            r="5"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
          />
          {/* Subtle 2D highlight reflection */}
          <path
            d="M 20.5,9 C 21.5,8 23.5,8 24.5,9"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Lower body accent line */}
          <path
            d="M 12.5,36.5 C 17,38 28,38 32.5,36.5"
            stroke="#1c1917"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          {/* Base */}
          <path
            d="M 9,39.5 L 36,39.5 L 35,36.5 L 10,36.5 Z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Pedestal step */}
          <path
            d="M 11.5,36.5 C 12,34 13.5,33 15,33 L 30,33 C 31.5,33 33,34 33.5,36.5 Z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Stem & Collar */}
          <path
            d="M 15.5,33 C 17,25 18,20 17,17.5 L 28,17.5 C 27,20 28,25 29.5,33 Z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Collar ring */}
          <path
            d="M 16,18.5 C 19,20.5 26,20.5 29,18.5"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Head sphere */}
          <circle
            cx="22.5"
            cy="11.5"
            r="5"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Subtle 2D highlight reflection */}
          <path
            d="M 20.5,9 C 21.5,8 23.5,8 24.5,9"
            stroke="#71717a"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Lower body accent line */}
          <path
            d="M 12.5,36.5 C 17,38 28,38 32.5,36.5"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case 'n': // Knight
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.424 22.23,5.99 22,10 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15" cy="14" r="1.5" fill="#1c1917" />
          <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#1c1917" />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.424 22.23,5.99 22,10 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15" cy="14" r="1.5" fill="#ffffff" />
          <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#ffffff" />
        </svg>
      );

    case 'b': // Bishop
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 9,36 C 12.33,35 14.66,35 18,35 C 21.33,35 23.66,35 27,36 C 30,36 33,36 36,36 C 36,39 36,39 36,40 L 9,40 C 9,39 9,39 9,36 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 12,36 C 11.66,31.66 11.66,28.66 12,27 C 13,22 17,16 22.5,14 C 28,16 32,22 33,27 C 33.33,28.66 33.33,31.66 33,36 L 12,36 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22.5" cy="10" r="2.5" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
          <path d="M 17.5,26 L 27.5,26 M 22.5,21 L 22.5,31" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 9,36 C 12.33,35 14.66,35 18,35 C 21.33,35 23.66,35 27,36 C 30,36 33,36 36,36 C 36,39 36,39 36,40 L 9,40 C 9,39 9,39 9,36 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 12,36 C 11.66,31.66 11.66,28.66 12,27 C 13,22 17,16 22.5,14 C 28,16 32,22 33,27 C 33.33,28.66 33.33,31.66 33,36 L 12,36 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22.5" cy="10" r="2.5" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M 17.5,26 L 27.5,26 M 22.5,21 L 22.5,31" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'r': // Rook
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 12,14 L 33,14 L 31,32 L 14,32 L 12,14 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 12,14 L 33,14 L 31,32 L 14,32 L 12,14 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'q': // Queen
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 L 9,26 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11,36 12,36 14,36 C 16,36 17,36 18,36 C 20,36 21,36 22.5,36 C 24,36 25,36 27,36 C 28,36 29,36 31,36 C 33,36 34,36 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 L 9,26 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 11,38.5 L 34,38.5 L 33,36 L 12,36 L 11,38.5 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="12" r="2" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="14" cy="9" r="2" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="22.5" cy="7.5" r="2" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="31" cy="9" r="2" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="39" cy="12" r="2" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 L 9,26 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11,36 12,36 14,36 C 16,36 17,36 18,36 C 20,36 21,36 22.5,36 C 24,36 25,36 27,36 C 28,36 29,36 31,36 C 33,36 34,36 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 L 9,26 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 11,38.5 L 34,38.5 L 33,36 L 12,36 L 11,38.5 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="12" r="2" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="14" cy="9" r="2" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="22.5" cy="7.5" r="2" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="31" cy="9" r="2" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="39" cy="12" r="2" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      );

    case 'k': // King
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          {/* Cross */}
          <path d="M 22.5,11.5 L 22.5,4.5 M 19,8 L 26,8" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
          {/* Crown */}
          <path
            d="M 11.5,37 C 17,40.5 27,40.5 33.5,37 C 37,29 34.5,19.5 31,16 C 28.5,19.5 25,19 22.5,16 C 20,19 16.5,19.5 14,16 C 10.5,19.5 8,29 11.5,37 z"
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 11.5,30 C 17,27 27,27 33.5,30 M 11.5,33.5 C 17,30.5 27,30.5 33.5,33.5 M 11.5,37 C 17,34 27,34 33.5,37"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          {/* Cross */}
          <path d="M 22.5,11.5 L 22.5,4.5 M 19,8 L 26,8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          {/* Crown */}
          <path
            d="M 11.5,37 C 17,40.5 27,40.5 33.5,37 C 37,29 34.5,19.5 31,16 C 28.5,19.5 25,19 22.5,16 C 20,19 16.5,19.5 14,16 C 10.5,19.5 8,29 11.5,37 z"
            fill="#18181b"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 11.5,30 C 17,27 27,27 33.5,30 M 11.5,33.5 C 17,30.5 27,30.5 33.5,33.5 M 11.5,37 C 17,34 27,34 33.5,37"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};
