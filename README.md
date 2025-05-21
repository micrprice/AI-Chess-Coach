# AI Chess Coach

A full-stack web application that provides chess game analysis using Stockfish and ChatGPT. Upload or paste your PGN files to get detailed move-by-move analysis and explanations.

## Features

- Interactive chessboard display with move navigation
- PGN paste/upload support
- FEN position import
- Stockfish analysis with:
  - Evaluation scores
  - Best move suggestions
  - Best line variations
  - Automatic analysis on position change
- ChatGPT-powered move explanations with:
  - Move summary
  - Player's move analysis
  - Stockfish's best move analysis
- Interactive move list with clickable moves
- Board navigation controls (start, back, forward, end)
- Board flip and reset functionality
- Dark mode UI with modern styling

## Tech Stack

### Frontend

- React with TypeScript
- Vite for build tooling
- react-chessboard for the chess interface
- chess.js for move validation and PGN parsing
- Tailwind CSS for styling

### Backend

- Node.js with Express
- Stockfish integration via node-uci
- OpenAI API integration for move explanations


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

Response:

```json
{
  "evaluation": "+0.5",
  "bestLine": ["e2e4", "e7e5", "g1f3"],
  "bestMove": "e2e4"
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

Response:

```json
{
  "summary": "White plays e4, establishing central control...",
  "playerMoveAnalysis": [
    "Controls the center",
    "Develops the king's pawn",
    "Prepares for castling"
  ],
  "stockfishMoveAnalysis": [
    "Best move in the position",
    "Maintains equality",
    "Follows opening principles"
  ]
}
```

## Development Notes

- The application uses a two-column layout with the chessboard on the left and controls/analysis on the right
- Stockfish analysis is automatically triggered when navigating moves or importing PGN
- Move explanations are displayed in a collapsible panel below the chessboard
- The move list is displayed as a table with clickable moves for easy navigation
- All state is managed using React hooks for efficient updates
