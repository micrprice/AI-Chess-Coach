import React from "react";

interface Explanation {
  summary?: string;
  playerMoveAnalysis?: string[];
  stockfishMoveAnalysis?: string[];
  raw?: string;
}

interface ExplanationBoxProps {
  explanation: Explanation | string | null;
  onClose: () => void;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({
  explanation,
  onClose,
}) => {
  if (!explanation) return null;

  return (
    <div className="mt-6 w-full max-w-xl mx-auto bg-gray-100 text-gray-900 rounded shadow border border-gray-300 p-4 relative animate-fadein">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold focus:outline-none"
        onClick={onClose}
        aria-label="Close explanation"
      >
        ×
      </button>
      <div className="font-bold mb-2">Explanation:</div>
      {typeof explanation === "string" ? (
        <div>{explanation}</div>
      ) : (
        <>
          {explanation.summary && (
            <div className="mb-2 font-semibold">{explanation.summary}</div>
          )}
          {explanation.playerMoveAnalysis &&
            explanation.playerMoveAnalysis.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold">Player's Move:</div>
                <ul className="list-disc list-inside ml-4">
                  {explanation.playerMoveAnalysis.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          {explanation.stockfishMoveAnalysis &&
            explanation.stockfishMoveAnalysis.length > 0 && (
              <div>
                <div className="font-semibold">Stockfish's Best Move:</div>
                <ul className="list-disc list-inside ml-4">
                  {explanation.stockfishMoveAnalysis.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          {explanation.raw && (
            <div className="mt-2 text-xs text-gray-500">
              Raw: {explanation.raw}
            </div>
          )}
        </>
      )}
    </div>
  );
};
