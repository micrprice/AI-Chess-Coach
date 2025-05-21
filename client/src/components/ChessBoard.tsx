import * as React from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface ChessBoardProps {
  game: Chess;
  isFlipped: boolean;
  onFlip: () => void;
  onReset: () => void;
  onGoToStart: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoToEnd: () => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  isFlipped,
  onFlip,
  onReset,
  onGoToStart,
  onGoBack,
  onGoForward,
  onGoToEnd,
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="bg-gray-700 rounded-lg shadow-lg p-4 border border-gray-500">
        <Chessboard
          position={game.fen()}
          arePiecesDraggable={false}
          boardWidth={420}
          boardOrientation={isFlipped ? "black" : "white"}
        />
      </div>
      {/* Navigation, Flip, Reset Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onGoToStart}
        >
          {"|<"}
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onGoBack}
        >
          {"<"}
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onGoForward}
        >
          {">"}
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onGoToEnd}
        >
          {">|"}
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onFlip}
        >
          Flip
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
