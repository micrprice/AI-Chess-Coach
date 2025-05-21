import * as React from "react";

interface EvalInfo {
  eval: string;
  depth: number;
  bestLine: string;
  bestMove: string;
}

interface AnalysisPanelProps {
  evalInfo: EvalInfo | null;
  isAnalyzing: boolean;
  isExplaining: boolean;
  onExplain: () => void;
  canExplain: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  evalInfo,
  isAnalyzing,
  isExplaining,
  onExplain,
  canExplain,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Evaluation and Explain */}
      <div className="flex gap-2">
        <div className="bg-blue-600 text-white font-bold text-2xl px-6 py-2 rounded flex items-center min-w-[80px] min-h-[48px] justify-center">
          {isAnalyzing ? (
            <span className="animate-pulse">...</span>
          ) : evalInfo ? (
            evalInfo.eval
          ) : (
            "..."
          )}
        </div>
        <button
          className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded font-semibold"
          onClick={onExplain}
          disabled={isExplaining || !canExplain}
        >
          {isExplaining ? "Explaining..." : "Explain Current Move"}
        </button>
      </div>
      {/* Best move, line, and depth */}
      {evalInfo && (
        <div className="mb-2 text-gray-200 text-sm">
          <span className="font-semibold">Best move:</span> {evalInfo.bestMove}{" "}
          &nbsp;|&nbsp;
          <span className="font-semibold">Depth:</span> {evalInfo.depth}{" "}
          &nbsp;|&nbsp;
          <span className="font-semibold">Best line:</span> {evalInfo.bestLine}
        </div>
      )}
    </div>
  );
};
