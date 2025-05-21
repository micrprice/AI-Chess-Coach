import * as React from "react";
import { Move } from "../types";

interface MoveListProps {
  moves: Move[];
  currentPly: number;
  onMoveClick: (ply: number) => void;
}

export const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentPly,
  onMoveClick,
}) => {
  return (
    <div className="bg-gray-700 rounded shadow border border-gray-500 p-2 max-h-72 overflow-y-auto text-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-200 border-b border-gray-500">
            <th className="px-2 py-1 font-normal">#</th>
            <th className="px-2 py-1 font-normal">White</th>
            <th className="px-2 py-1 font-normal">Black</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move, idx) => (
            <tr key={idx} className="border-b border-gray-800 last:border-b-0">
              <td className="px-2 py-1 text-gray-400">{move.number}.</td>
              <td className="px-2 py-1">
                {move.white && (
                  <a
                    href="#"
                    className={`underline-offset-2 ${
                      currentPly === idx * 2
                        ? "text-blue-400 underline"
                        : "text-gray-100 hover:text-blue-200"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onMoveClick(idx * 2);
                    }}
                  >
                    {move.white}
                  </a>
                )}
              </td>
              <td className="px-2 py-1">
                {move.black && (
                  <a
                    href="#"
                    className={`underline-offset-2 ${
                      currentPly === idx * 2 + 1
                        ? "text-blue-400 underline"
                        : "text-gray-100 hover:text-blue-200"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onMoveClick(idx * 2 + 1);
                    }}
                  >
                    {move.black}
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
