export interface Move {
  number: number;
  white: string;
  black?: string;
  evaluation?: string;
  bestLine?: string[];
  bestMove?: string;
  explanation?: string;
}

export interface AnalysisResponse {
  evaluation: string;
  bestLine: string[];
  bestMove: string;
}

export interface ExplanationResponse {
  explanation: string;
}

export interface GameState {
  moves: Move[];
  currentPosition: string;
  currentMoveIndex: number;
} 