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
      
      console.log('Stockfish result:', result);
      
      // Find the info with the highest depth
      const bestInfo = Array.isArray(result.info)
        ? result.info.reduce((a, b) => (b.depth > (a.depth || 0) ? b : a), {})
        : {};
      const evaluation = this.formatEvaluation(bestInfo.score);
      const bestLine = bestInfo.pv ? bestInfo.pv.split(' ') : [];

      return {
        evaluation,
        bestLine
      };
    } catch (error) {
      console.error('Error analyzing position:', error);
      throw error;
    }
  }

  private formatEvaluation(score: any): string {
    if (!score) return 'N/A';
    if (typeof score === 'object' && 'value' in score) {
      if (score.unit === 'cp') {
        const value = score.value / 100;
        return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
      }
      if (score.unit === 'mate') {
        return `#${score.value}`;
      }
    }
    if (typeof score === 'number') {
      const value = score / 100;
      return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
    }
    return 'N/A';
  }

  async quit() {
    if (this.isReady) {
      await this.engine.quit();
      this.isReady = false;
    }
  }
} 