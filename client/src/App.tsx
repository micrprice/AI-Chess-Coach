import * as React from "react";
import { useGameState } from "./hooks/useGameState";
import { useAnalysis } from "./hooks/useAnalysis";
import { ChessBoard } from "./components/ChessBoard";
import { MoveList } from "./components/MoveList";
import { ImportControls } from "./components/ImportControls";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { ExplanationBox } from "./components/ExplanationBox";

function App() {
  const {
    game,
    gameState,
    ply,
    isFlipped,
    goToStart,
    goBack,
    goForward,
    goToEnd,
    flipBoard,
    resetBoard,
    importPGN,
    importFEN,
    goToPly,
  } = useGameState();

  const {
    evalInfo,
    explanation,
    isAnalyzing,
    isExplaining,
    explainCurrentMove,
    clearAnalysis,
    setExplanation,
  } = useAnalysis(game, ply, (ply) => {
    const moves: string[] = [];
    for (let i = 0; i < gameState.moves.length; ++i) {
      if (2 * i <= ply && gameState.moves[i].white)
        moves.push(gameState.moves[i].white!);
      if (2 * i + 1 <= ply && gameState.moves[i].black)
        moves.push(gameState.moves[i].black!);
    }
    return moves;
  });

  const [fenInput, setFenInput] = React.useState("");
  const [pgnInput, setPgnInput] = React.useState("");

  const handleFenImport = () => {
    if (importFEN(fenInput)) {
      clearAnalysis();
    } else {
      alert("Invalid FEN");
    }
  };

  const handlePgnImport = () => {
    if (importPGN(pgnInput)) {
      clearAnalysis();
      // Analyze the first move if available
      setTimeout(() => {
        if (gameState.moves.length > 0) goToPly(0);
      }, 0);
    } else {
      alert("Invalid PGN");
    }
  };

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
          {/* Left: Chessboard, navigation, and explanation */}
          <div className="flex flex-col justify-center items-center h-full">
            <ChessBoard
              game={game}
              isFlipped={isFlipped}
              onFlip={flipBoard}
              onReset={resetBoard}
              onGoToStart={goToStart}
              onGoBack={goBack}
              onGoForward={goForward}
              onGoToEnd={goToEnd}
            />
            <ExplanationBox
              explanation={explanation}
              onClose={() => setExplanation(null)}
            />
          </div>
          {/* Right: All controls except navigation/flip/reset */}
          <div className="flex flex-col gap-4 justify-center">
            <ImportControls
              fenInput={fenInput}
              pgnInput={pgnInput}
              onFenInputChange={setFenInput}
              onPgnInputChange={setPgnInput}
              onFenImport={handleFenImport}
              onPgnImport={handlePgnImport}
            />
            <AnalysisPanel
              evalInfo={evalInfo}
              isAnalyzing={isAnalyzing}
              isExplaining={isExplaining}
              onExplain={() => explainCurrentMove(gameState.moves)}
              canExplain={ply >= 0}
            />
            <MoveList
              moves={gameState.moves}
              currentPly={ply}
              onMoveClick={(newPly) => {
                goToPly(newPly);
                clearAnalysis();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
