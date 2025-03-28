# Code Analyzer and Fixer

A web application that analyzes code for potential issues and automatically fixes them using AI.

## Features

- Analyze JavaScript and Python code for common issues
- Automatically fix detected problems using OpenAI's GPT-4
- Real-time analysis progress updates via WebSockets
- Clean, modern UI for code submission and review
- API for programmatic code analysis
- Comprehensive testing with Jest and Vitest
- Docker support for easy deployment
- Structured logging with Winston
- CI/CD pipeline with GitHub Actions
- TypeScript support for strong typing and better developer experience

## Tech Stack

### Backend
- Node.js 18+ with Express
- TypeScript for type safety
- Socket.IO for real-time progress updates
- OpenAI API for AI-powered code fixes
- GitHub App integration via Probot
- Caching with node-cache and Redis
- Rate limiting for API security
- Structured logging with Winston
- Jest for testing

### Frontend
- React 18
- TypeScript
- Zustand for state management
- Socket.IO client for real-time updates
- Vite for fast development experience
- Vitest for component testing

## Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn
- Docker and Docker Compose (optional, for containerized development)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/code-analyzer.git
   cd code-analyzer
   ```

2. Install dependencies for client, server and shared packages:
   ```bash
   # Install shared types dependencies
   cd shared
   npm install
   npm run build
   cd ..

   # Install server dependencies
   cd server
   npm install
   cd ..

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. Create `.env` files in both server and client directories based on the provided `.env.example` files.

4. Build the shared package and server:
   ```bash
   # Build shared package
   cd shared
   npm run build
   cd ..

   # Build server
   cd server
   npm run build
   cd ..
   ```

5. Start the development servers:
   ```bash
   # Start server (from server directory)
   cd server
   npm run dev

   # Start client (from client directory in another terminal)
   cd client
   npm run dev
   ```

6. Access the application at `http://localhost:5173`

### Docker Setup

1. Build and run with Docker Compose:
   ```bash
   docker-compose up
   ```

2. Or build and run production images:
   ```bash
   # Build images
   docker build -t code-analyzer-server ./server
   docker build -t code-analyzer-client ./client

   # Run server
   docker run -p 3001:3001 --env-file ./server/.env code-analyzer-server

   # Run client
   docker run -p 80:80 code-analyzer-client
   ```

## Development Workflow

### Running Tests

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

### Linting

```bash
# Lint server code
cd server
npm run lint

# Lint client code
cd client
npm run lint
```

### Building for Production

```bash
# Build shared package
cd shared
npm run build
cd ..

# Build server
cd server
npm run build
cd ..

# Build client
cd client
npm run build
cd ..
```

## Project Structure

```
.
├── .github/            # GitHub Actions workflows
├── client/             # React frontend
│   ├── public/         # Static assets
│   ├── src/            # React components and logic
│   └── ...
├── server/             # Express backend
│   ├── src/            # Server logic
│   ├── routes/         # API routes
│   └── ...
└── shared/             # Shared TypeScript types
```

## API Documentation

### REST Endpoints

#### POST /api/analyze
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
  "status": "success",
  "suggestions": [
    {
      "id": "uuid",
      "type": "warning",
      "message": "Avoid using console.log in production code",
      "line": 5,
      "column": 3,
      "severity": "medium",
      "codeSnippet": "console.log('debug')",
      "solution": "// console.log('debug')"
    }
  ]
}
```

#### POST /api/fix
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
  "status": "fixed",
  "fixedCode": "Fixed code here"
}
```

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Client has connected |
| `disconnect` | Client → Server | Client has disconnected |
| `startAnalysis` | Client → Server | Client requests to start analysis |
| `analysisStarted` | Server → Client | Analysis has begun |
| `analysisProgress` | Server → Client | Progress updates during analysis |
| `analysisCompleted` | Server → Client | Analysis is complete |

## License

MIT 