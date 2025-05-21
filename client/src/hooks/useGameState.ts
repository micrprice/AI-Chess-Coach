import { useState } from 'react';
import { Chess } from 'chess.js';
import { GameState, Move } from '../types';

export const useGameState = () => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameState, setGameState] = useState<GameState>({
    moves: [],
    currentPosition: game.fen(),
    currentMoveIndex: -1,
  });
  const [ply, setPly] = useState(-1);
  const [isFlipped, setIsFlipped] = useState(false);

  const getMaxPly = () => {
    const moves = gameState.moves;
    if (moves.length === 0) return -1;
    const last = moves[moves.length - 1];
    return moves.length * 2 - (last.black ? 1 : 2);
  };

  const getHistoryByPly = (plyNum: number) => {
    const moves: string[] = [];
    for (let i = 0; i < gameState.moves.length; ++i) {
      if (2 * i <= plyNum && gameState.moves[i].white)
        moves.push(gameState.moves[i].white!);
      if (2 * i + 1 <= plyNum && gameState.moves[i].black)
        moves.push(gameState.moves[i].black!);
    }
    return moves;
  };

  const goToStart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGameState((prev) => ({
      ...prev,
      currentPosition: newGame.fen(),
      currentMoveIndex: -1,
    }));
    setPly(-1);
  };

  const goBack = () => {
    if (ply > -1) {
      const newGame = new Chess();
      const history = getHistoryByPly(ply - 1);
      history.forEach((move) => newGame.move(move));
      setGame(newGame);
      setGameState((prev) => ({ ...prev, currentPosition: newGame.fen() }));
      setPly(ply - 1);
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
    }
  };

  const goToEnd = () => {
    const newGame = new Chess();
    const history = getHistoryByPly(getMaxPly());
    history.forEach((move) => newGame.move(move));
    setGame(newGame);
    setGameState((prev) => ({ ...prev, currentPosition: newGame.fen() }));
    setPly(getMaxPly());
  };

  const flipBoard = () => setIsFlipped((f) => !f);

  const resetBoard = () => {
    setGame(new Chess());
    setGameState({
      moves: [],
      currentPosition: new Chess().fen(),
      currentMoveIndex: -1,
    });
    setPly(-1);
  };

  const importPGN = (pgnInput: string) => {
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
      return true;
    } catch (error) {
      return false;
    }
  };

  const importFEN = (fenInput: string) => {
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
      return true;
    } catch {
      return false;
    }
  };

  const goToPly = (newPly: number) => {
    const newGame = new Chess();
    const history = getHistoryByPly(newPly);
    history.forEach((m) => newGame.move(m));
    setGame(newGame);
    setGameState((prev) => ({
      ...prev,
      currentPosition: newGame.fen(),
    }));
    setPly(newPly);
  };

  return {
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
  };
}; 