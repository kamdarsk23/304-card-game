#!/bin/bash

# Simple HTTP server for local testing
echo "Starting local server for 304 Card Game..."
echo ""
echo "🎮 LOCAL TESTING MODE"
echo "📱 Open: http://localhost:8000/test-local.html"
echo "🌐 GitHub Pages version: http://localhost:8000/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. Please install Python to run the local server."
    echo "💡 Alternatively, you can open test-local.html directly in your browser."
fi 