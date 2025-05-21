import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { GameState, Move } from "./types";
import React from "react";

function App() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameState, setGameState] = useState<GameState>({
    moves: [],
    currentPosition: game.fen(),
    currentMoveIndex: -1, // fullmove index
  });
  const [fenInput, setFenInput] = useState("");
  const [pgnInput, setPgnInput] = useState("");
  const [evalInfo, setEvalInfo] = useState<{
    eval: string;
    depth: number;
    bestLine: string;
    bestMove: string;
  } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [ply, setPly] = useState(-1); // ply: -1 = start, 0 = first white move, 1 = first black move, etc.
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- PGN Paste Import ---
  const importPGN = () => {
    const newGame = new Chess();
    try {
      newGame.loadPgn(pgnInput);
      const moves: Move[] = [];
      const history = newGame.history({ verbose: true });
      for (let i = 0; i < history.length; i += 2) {
        const move: Move = {
          number: Math.floor(i / 2) + 1,
          white: history[i]?.san,
          black: history[i + 1]?.san,
        };
        moves.push(move);
      }
      setGame(newGame);
      setGameState({
        moves,
        currentPosition: newGame.fen(),
        currentMoveIndex: -1,
      });
      setPly(-1);
      setExplanation(null);
      setEvalInfo(null);
      // Analyze the first move if available
      setTimeout(() => {
        if (moves.length > 0) setPly(0);
      }, 0);
    } catch (error) {
      alert("Invalid PGN");
    }
  };

  // --- FEN Import ---
  const importFEN = () => {
    try {
      const newGame = new Chess();
      newGame.load(fenInput);
      setGame(newGame);
      setGameState({
        moves: [],
        currentPosition: newGame.fen(),
        currentMoveIndex: -1,
      });
      setPly(-1);
      setExplanation(null);
      setEvalInfo(null);
    } catch {
      alert("Invalid FEN");
    }
  };

  // --- Navigation by ply ---
  const goToStart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGameState((prev) => ({
      ...prev,
      currentPosition: newGame.fen(),
      currentMoveIndex: -1,
    }));
    setPly(-1);
    setExplanation(null);
    setEvalInfo(null);
  };
  const goBack = () => {
    if (ply > -1) {
      const newGame = new Chess();
      const history = getHistoryByPly(ply - 1);
      history.forEach((move) => newGame.move(move));
      setGame(newGame);
      setGameState((prev) => ({ ...prev, currentPosition: newGame.fen() }));
      setPly(ply - 1);
      setExplanation(null);
      setEvalInfo(null);
    }
  };
  const goForward = () => {
    const maxPly = getMaxPly();
    if (ply < maxPly) {
      const newGame = new Chess();
      const history = getHistoryByPly(ply + 1);
      history.forEach((move) => newGame.move(move));
      setGame(newGame);
      setGameState((prev) => ({ ...prev, currentPosition: newGame.fen() }));
      setPly(ply + 1);
      setExplanation(null);
      setEvalInfo(null);
    }
  };
  const goToEnd = () => {
    const newGame = new Chess();
    const history = getHistoryByPly(getMaxPly());
    history.forEach((move) => newGame.move(move));
    setGame(newGame);
    setGameState((prev) => ({ ...prev, currentPosition: newGame.fen() }));
    setPly(getMaxPly());
    setExplanation(null);
    setEvalInfo(null);
  };
  const flipBoard = () => setIsFlipped((f) => !f);
  const resetBoard = () => {
    setGame(new Chess());
    setGameState({
      moves: [],
      currentPosition: new Chess().fen(),
      currentMoveIndex: -1,
    });
    setEvalInfo(null);
    setExplanation(null);
    setPly(-1);
    setIsAnalyzing(false);
  };

  // --- Helpers for ply navigation ---
  function getMaxPly() {
    const moves = gameState.moves;
    if (moves.length === 0) return -1;
    const last = moves[moves.length - 1];
    return moves.length * 2 - (last.black ? 1 : 2);
  }
  function getHistoryByPly(plyNum: number) {
    // Returns SAN moves up to plyNum (0-based)
    const moves: string[] = [];
    for (let i = 0; i < gameState.moves.length; ++i) {
      if (2 * i <= plyNum && gameState.moves[i].white)
        moves.push(gameState.moves[i].white!);
      if (2 * i + 1 <= plyNum && gameState.moves[i].black)
        moves.push(gameState.moves[i].black!);
    }
    return moves;
  }

  // --- Analysis ---
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
        depth: 20, // hardcoded for now
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

  // --- Auto-analyze on ply change ---
  useEffect(() => {
    if (ply >= 0) {
      const newGame = new Chess();
      const history = getHistoryByPly(ply);
      history.forEach((move) => newGame.move(move));
      const fen = newGame.fen();
      analyzePosition(fen);
    }
  }, [ply]);

  // --- Central Explain Button ---
  const explainCurrentMove = async () => {
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
      userMove = gameState.moves[moveIdx]?.white || "";
    } else {
      // Black move
      const moveIdx = Math.floor(ply / 2);
      userMove = gameState.moves[moveIdx]?.black || "";
    }
    // Get Stockfish best move and evaluation (optional: could call analyzePosition here)
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

  // --- Move List as Table ---
  const moveList = (
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
          {gameState.moves.map((move, idx) => (
            <tr key={idx} className="border-b border-gray-800 last:border-b-0">
              <td className="px-2 py-1 text-gray-400">{move.number}.</td>
              <td className="px-2 py-1">
                {move.white && (
                  <a
                    href="#"
                    className={`underline-offset-2 ${
                      ply === idx * 2
                        ? "text-blue-400 underline"
                        : "text-gray-100 hover:text-blue-200"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      const newGame = new Chess();
                      const history = getHistoryByPly(idx * 2);
                      history.forEach((m) => newGame.move(m));
                      setGame(newGame);
                      setGameState((prev) => ({
                        ...prev,
                        currentPosition: newGame.fen(),
                      }));
                      setPly(idx * 2);
                      setExplanation(null);
                      setEvalInfo(null);
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
                      ply === idx * 2 + 1
                        ? "text-blue-400 underline"
                        : "text-gray-100 hover:text-blue-200"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      const newGame = new Chess();
                      const history = getHistoryByPly(idx * 2 + 1);
                      history.forEach((m) => newGame.move(m));
                      setGame(newGame);
                      setGameState((prev) => ({
                        ...prev,
                        currentPosition: newGame.fen(),
                      }));
                      setPly(idx * 2 + 1);
                      setExplanation(null);
                      setEvalInfo(null);
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

  return (
    <div className="min-h-screen bg-gray-800 text-gray-200">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-extrabold mb-2">Analysis Board</h1>
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">
          Reproduce and analyze your games or the positions you want. Import
          your game in PGN notation or set up a position from a FEN. Take
          advantage of this online chess calculator and analysis board powered
          by Stockfish and ChatGPT, offering detailed insights into your
          positions and games.
        </p>
      </div>
      {/* Main Grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[600px]">
          {/* Left: Chessboard and navigation */}
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
                onClick={goToStart}
              >
                {"|<"}
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                onClick={goBack}
              >
                {"<"}
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                onClick={goForward}
              >
                {">"}
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                onClick={goToEnd}
              >
                {">|"}
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                onClick={flipBoard}
              >
                Flip
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                onClick={resetBoard}
              >
                Reset
              </button>
            </div>
          </div>
          {/* Right: All controls except navigation/flip/reset */}
          <div className="flex flex-col gap-4 justify-center">
            {/* FEN Import */}
            <div className="flex gap-2 w-full items-center">
              <span className="text-sm font-mono">FEN</span>
              <input
                className="flex-1 border border-gray-500 bg-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-200 placeholder-gray-400"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="Paste FEN here"
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                onClick={importFEN}
              >
                Import FEN
              </button>
            </div>
            {/* PGN Import */}
            <div className="w-full">
              <textarea
                className="w-full border border-gray-500 bg-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-200 placeholder-gray-400"
                rows={3}
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="Paste PGN here"
              />
              <button
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded w-full"
                onClick={importPGN}
              >
                Import PGN
              </button>
            </div>
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
                onClick={explainCurrentMove}
                disabled={isExplaining || ply < 0}
              >
                {isExplaining ? "Explaining..." : "Explain Current Move"}
              </button>
            </div>
            {/* Best move, line, and depth */}
            {evalInfo && (
              <div className="mb-2 text-gray-200 text-sm">
                <span className="font-semibold">Best move:</span>{" "}
                {evalInfo.bestMove} &nbsp;|&nbsp;
                <span className="font-semibold">Depth:</span> {evalInfo.depth}{" "}
                &nbsp;|&nbsp;
                <span className="font-semibold">Best line:</span>{" "}
                {evalInfo.bestLine}
              </div>
            )}
            {/* Move List */}
            {moveList}
            {/* Explanation Output */}
            {explanation && (
              <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded text-gray-900">
                <div className="font-semibold mb-1">Explanation:</div>
                {typeof explanation === "string" ? (
                  <div>{explanation}</div>
                ) : (
                  <>
                    {explanation.summary && (
                      <div className="mb-2 font-semibold">
                        {explanation.summary}
                      </div>
                    )}
                    {explanation.playerMoveAnalysis &&
                      explanation.playerMoveAnalysis.length > 0 && (
                        <div className="mb-2">
                          <div className="font-semibold">Player's Move:</div>
                          <ul className="list-disc list-inside ml-4">
                            {explanation.playerMoveAnalysis.map(
                              (item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {explanation.stockfishMoveAnalysis &&
                      explanation.stockfishMoveAnalysis.length > 0 && (
                        <div>
                          <div className="font-semibold">
                            Stockfish's Best Move:
                          </div>
                          <ul className="list-disc list-inside ml-4">
                            {explanation.stockfishMoveAnalysis.map(
                              (item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              )
                            )}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
