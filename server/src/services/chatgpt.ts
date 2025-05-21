import OpenAI from 'openai';
import { ExplanationRequest } from '../types';

export class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async getMoveExplanation(request: ExplanationRequest): Promise<string> {
    const prompt = this.buildPrompt(request);

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are a chess grandmaster explaining chess moves. Be concise but insightful."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      // Log the full response for debugging
      console.log('ChatGPT API response:', JSON.stringify(response, null, 2));

      return response.choices[0].message.content || 'No explanation available';
    } catch (error) {
      console.error('Error getting move explanation:', error);
      throw error;
    }
  }

  private buildPrompt(request: ExplanationRequest): string {
    return `Analyze this chess position and moves:

Position (FEN): ${request.fen}
Player's move: ${request.userMove}
Stockfish's best move: ${request.bestMove}
Evaluation: ${request.evaluation}

Please explain:
1. Why the player's move was good or bad
2. Why Stockfish recommends the best move instead
Keep the explanation clear and concise.`;
  }
} 