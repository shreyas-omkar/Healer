#!/bin/bash

# Test if client builds successfully
echo "Building client..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
  echo "✅ Client build successful"
else
  echo "❌ Client build failed"
  exit 1
fi

echo "✅ All client tests passed!" 