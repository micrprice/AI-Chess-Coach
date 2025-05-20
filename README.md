# AI Chess Coach

A full-stack web application that provides chess game analysis using Stockfish and ChatGPT. Upload or paste your PGN files to get detailed move-by-move analysis and explanations.

## Features

- Interactive chessboard display
- PGN file upload and parsing
- Stockfish analysis with evaluation scores
- ChatGPT-powered move explanations
- Best line suggestions
- Move-by-move analysis

## Tech Stack

### Frontend

- React with TypeScript
- react-chessboard for the chess interface
- chess.js for move validation and PGN parsing
- Tailwind CSS for styling
- shadcn/ui for UI components

### Backend

- Node.js with Express
- Stockfish integration via node-uci
- OpenAI API integration for move explanations

## Project Structure

```
.
├── client/             # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── server/             # Node.js backend
    ├── src/
    └── package.json
```

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:

   - Create `.env` in the server directory with:
     ```
     OPENAI_API_KEY=your_api_key_here
     PORT=3001
     ```

4. Start the development servers:

   ```bash
   # Start backend (from server directory)
   npm run dev

   # Start frontend (from client directory)
   npm run dev
   ```

## API Endpoints

### POST /api/analyze

Analyzes a chess position using Stockfish.

Request body:

```json
{
  "fen": "current_position_fen"
}
```

### POST /api/explain

Gets a ChatGPT explanation for a move.

Request body:

```json
{
  "fen": "current_position_fen",
  "userMove": "e2e4",
  "bestMove": "e7e5",
  "evaluation": "+0.5"
}
```

## License

MIT
