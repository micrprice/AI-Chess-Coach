import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StockfishService } from './services/stockfish';
import { ChatGPTService } from './services/chatgpt';
import { AnalysisRequest, ExplanationRequest } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize services
const stockfishService = new StockfishService();
const chatgptService = new ChatGPTService();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analyze position endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { fen } = req.body as AnalysisRequest;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN string is required' });
    }

    const analysis = await stockfishService.analyzePosition(fen);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze position' });
  }
});

// Get move explanation endpoint
app.post('/api/explain', async (req, res) => {
  try {
    const request = req.body as ExplanationRequest;
    
    if (!request.fen || !request.userMove || !request.bestMove || !request.evaluation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const explanation = await chatgptService.getMoveExplanation(request);
    res.json({ explanation });
  } catch (error) {
    console.error('Error in /api/explain:', error);
    res.status(500).json({ error: 'Failed to get move explanation' });
  }
});

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
  await stockfishService.quit();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 