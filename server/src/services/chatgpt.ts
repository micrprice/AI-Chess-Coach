import OpenAI from 'openai';
import { ExplanationRequest } from '../types';

export class ChatGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async getMoveExplanation(request: ExplanationRequest): Promise<any> {
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

      const content = response.choices[0].message.content || '';
      try {
        // Try to parse the JSON response
        const parsed = JSON.parse(content);
        return parsed;
      } catch (err) {
        // If parsing fails, return the raw content as a fallback
        console.warn('Failed to parse ChatGPT JSON response:', content);
        return { summary: 'No explanation available', playerMoveAnalysis: [], stockfishMoveAnalysis: [], raw: content };
      }
    } catch (error) {
      console.error('Error getting move explanation:', error);
      throw error;
    }
  }

  private buildPrompt(request: ExplanationRequest): string {
    return `You are a chess grandmaster and coach. Analyze the following position and moves:

Position (FEN): ${request.fen}
Player's move: ${request.userMove}
Stockfish's best move: ${request.bestMove}
Stockfish evaluation: ${request.evaluation}

Please respond in the following JSON format:
{
  "summary": "One concise sentence summarizing the move quality.",
  "playerMoveAnalysis": [
    "Short bullet point explaining why the player's move is good or bad.",
    "Another bullet point if relevant."
  ],
  "stockfishMoveAnalysis": [
    "Short bullet point explaining why Stockfish's move is preferred.",
    "Another bullet point if relevant."
  ]
}

Do not include any text outside the JSON object.`;
  }
} 