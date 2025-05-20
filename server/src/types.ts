export interface AnalysisRequest {
  fen: string;
}

export interface AnalysisResponse {
  evaluation: string;
  bestLine: string[];
}

export interface ExplanationRequest {
  fen: string;
  userMove: string;
  bestMove: string;
  evaluation: string;
}

export interface ExplanationResponse {
  explanation: string;
} 