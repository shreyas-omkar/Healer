#!/bin/bash

# Test if TypeScript builds successfully
echo "Building TypeScript..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# Check if server starts successfully
echo "Starting server..."
node dist/index.js &
SERVER_PID=$!

# Wait a moment to let the server start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server started successfully"
else
  echo "❌ Server failed to start"
  exit 1
fi

# Kill the server process
kill $SERVER_PID

echo "✅ All tests passed!" 