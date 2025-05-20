declare module 'node-uci' {
  export class Engine {
    constructor(path: string);
    init(): Promise<void>;
    setoption(name: string, value: string): Promise<void>;
    position(fen: string): Promise<void>;
    go(options: { depth: number }): Promise<{
      score: number;
      pv: string[];
    }>;
    quit(): Promise<void>;
  }
} 