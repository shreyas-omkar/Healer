# Code Analyzer and Fixer

A web application that analyzes code for potential issues and automatically fixes them using AI.

## Features

- Analyze JavaScript and Python code for common issues
- Automatically fix detected problems using OpenAI's GPT-4
- Real-time analysis progress updates via WebSockets
- Clean, modern UI for code submission and review
- API for programmatic code analysis
- Comprehensive testing with Jest
- Docker support for easy deployment
- Structured logging with Winston
- CI/CD pipeline with GitHub Actions
- TypeScript support for strong typing and better developer experience

## Tech Stack

### Backend
- Node.js with Express
- TypeScript for type safety
- Socket.IO for real-time progress updates
- OpenAI API for AI-powered code fixes
- GitHub App integration via Probot
- Caching with node-cache
- Rate limiting for API security
- Structured logging with Winston
- Jest for testing

### Frontend
- React 18
- TypeScript
- Socket.IO client for real-time updates
- Vite for fast development experience

## Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/code-analyzer.git
   cd code-analyzer
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory based on `.env.example`:
   ```
   PORT=3001
   CLIENT_URL=http://localhost:5173
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```

4. Build the server (TypeScript):
   ```bash
   cd server
   npm run build
   ```

5. Start the development servers:
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory in another terminal)
   cd ../client
   npm run dev
   ```

6. Access the application at `http://localhost:5173`

### Docker Setup

1. Build and run with Docker Compose:
   ```bash
   docker-compose up
   ```

2. Or build the production image:
   ```bash
   docker build -t code-analyzer .
   docker run -p 3001:3001 -e OPENAI_API_KEY=your_key_here code-analyzer
   ```

## Real-time Analysis

The application now supports real-time progress updates during code analysis:

1. Client connects to the server using WebSockets
2. When analysis starts, progress updates are sent in real-time
3. The UI shows a progress bar with percentage complete
4. Status messages are updated as analysis proceeds

## Testing

Run the test suite:

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

## API Endpoints

### GET /api/health
Returns server health information.

### POST /api/analyze
Analyzes code for potential issues.

Request:
```json
{
  "code": "your code here",
  "language": "javascript"
}
```

Response:
```json
{
  "status": "done",
  "message": "✅ Code looks clean!",
  "suggestions": []
}
```

### POST /api/fix
Fixes code based on analysis suggestions.

Request:
```json
{
  "code": "your code here",
  "language": "javascript",
  "suggestions": ["Array of suggestions"]
}
```

Response:
```json
{
  "fixedCode": "Fixed code here"
}
```

### GET /api/analysis/status/:id
Returns the status of an ongoing analysis.

## GitHub Integration

This project includes GitHub App integration for analyzing code in repositories. To set up:

1. Create a GitHub App
2. Configure the webhook URL to point to your server's `/webhook` endpoint
3. Add the required permissions for the GitHub App
4. Update the `.env` file with your GitHub App credentials

## WebSocket Events

- `connect`: Client has connected to the WebSocket server
- `disconnect`: Client has disconnected
- `startAnalysis`: Client requests to start analysis
- `analysisStarted`: Server signals analysis has begun
- `analysisProgress`: Server sends progress updates during analysis
- `analysisCompleted`: Server signals analysis is complete

## Deployment

The project includes configuration for CI/CD with GitHub Actions:

1. Tests are run on every pull request
2. Docker images are built and pushed on merges to main
3. Deployment can be configured to your preferred hosting service

## License

MIT 