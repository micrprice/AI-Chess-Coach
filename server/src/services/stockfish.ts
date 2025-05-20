import { Engine } from 'node-uci';
import path from 'path';

export class StockfishService {
  private engine: Engine;
  private isReady: boolean = false;

  constructor() {
    // Note: In production, you'll need to ensure Stockfish is available at this path
    const stockfishPath = path.join(__dirname, '../../stockfish');
    this.engine = new Engine(stockfishPath);
    this.initialize();
  }

  private async initialize() {
    try {
      await this.engine.init();
      await this.engine.setoption('MultiPV', '1');
      await this.engine.setoption('Threads', '4');
      await this.engine.setoption('Hash', '128');
      this.isReady = true;
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      throw error;
    }
  }

  async analyzePosition(fen: string): Promise<{ evaluation: string; bestLine: string[] }> {
    if (!this.isReady) {
      throw new Error('Stockfish engine is not ready');
    }

    try {
      await this.engine.position(fen);
      const result = await this.engine.go({ depth: 20 });
      
      const evaluation = this.formatEvaluation(result.score);
      const bestLine = result.pv || [];

      return {
        evaluation,
        bestLine
      };
    } catch (error) {
      console.error('Error analyzing position:', error);
      throw error;
    }
  }

  private formatEvaluation(score: number): string {
    // Convert centipawns to a more readable format
    const value = score / 100;
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  }

  async quit() {
    if (this.isReady) {
      await this.engine.quit();
      this.isReady = false;
    }
  }
} 