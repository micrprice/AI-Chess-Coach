import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

interface EvalInfo {
  eval: string;
  depth: number;
  bestLine: string;
  bestMove: string;
}

interface Explanation {
  summary?: string;
  playerMoveAnalysis?: string[];
  stockfishMoveAnalysis?: string[];
  raw?: string;
}

export const useAnalysis = (game: Chess, ply: number, getHistoryByPly: (ply: number) => string[]) => {
  const [evalInfo, setEvalInfo] = useState<EvalInfo | null>(null);
  const [explanation, setExplanation] = useState<Explanation | string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  const analyzePosition = async (fen: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen }),
      });
      const data = await response.json();
      setEvalInfo({
        eval: data.evaluation,
        depth: 20,
        bestLine: data.bestLine?.join(" ") || "",
        bestMove: data.bestMove || "",
      });
      setIsAnalyzing(false);
      return data;
    } catch (error) {
      setIsAnalyzing(false);
      console.error("Error analyzing position:", error);
      return null;
    }
  };

  const explainCurrentMove = async (moves: { white?: string; black?: string }[]) => {
    if (ply < 0) {
      setExplanation("No move selected to explain.");
      return;
    }
    setIsExplaining(true);
    // Get FEN before this ply
    const tempGame = new Chess();
    const history = getHistoryByPly(ply - 1);
    history.forEach((move) => tempGame.move(move));
    const fen = tempGame.fen();
    // Get the move just made
    let userMove = "";
    if (ply % 2 === 0) {
      // White move
      const moveIdx = Math.floor(ply / 2);
      userMove = moves[moveIdx]?.white || "";
    } else {
      // Black move
      const moveIdx = Math.floor(ply / 2);
      userMove = moves[moveIdx]?.black || "";
    }
    // Get Stockfish best move and evaluation
    let bestMove = "";
    let evaluation = "";
    if (evalInfo) {
      bestMove = evalInfo.bestMove || "";
      evaluation = evalInfo.eval;
    }
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen,
          userMove,
          bestMove,
          evaluation,
        }),
      });
      const data = await response.json();
      setExplanation(data);
    } catch (error) {
      setExplanation({
        summary: "Failed to get explanation.",
        playerMoveAnalysis: [],
        stockfishMoveAnalysis: [],
      });
    }
    setIsExplaining(false);
  };

  // Auto-analyze on ply change
  useEffect(() => {
    if (ply >= 0) {
      const newGame = new Chess();
      const history = getHistoryByPly(ply);
      history.forEach((move) => newGame.move(move));
      const fen = newGame.fen();
      analyzePosition(fen);
    }
  }, [ply]);

  const clearAnalysis = () => {
    setEvalInfo(null);
    setExplanation(null);
  };

  return {
    evalInfo,
    explanation,
    isAnalyzing,
    isExplaining,
    analyzePosition,
    explainCurrentMove,
    clearAnalysis,
    setExplanation,
  };
}; 