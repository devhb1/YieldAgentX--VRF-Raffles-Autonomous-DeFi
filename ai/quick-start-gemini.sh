#!/bin/bash

# Google Gemini AI Quick Start Script
# Multi-Agent DeFi Yield Optimizer

echo "🤖 Google Gemini AI Quick Start"
echo "================================"
echo ""

# Check if we're in the AI directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the ai/ directory"
    echo "   cd ai && ./quick-start-gemini.sh"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "🔑 IMPORTANT: Add your Google Gemini API key to .env"
    echo "   1. Visit https://aistudio.google.com"
    echo "   2. Get your free API key"
    echo "   3. Edit .env and set: GOOGLE_AI_API_KEY=your_key_here"
    echo ""
    read -p "Press Enter when you've added your API key..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Test Google Gemini connection
echo "🧪 Testing Google Gemini connection..."
echo ""
npm run test:gemini

echo ""
echo "🚀 Google Gemini setup complete!"
echo ""
echo "💡 Next steps:"
echo "   • Run 'npm run dev' to start the AI service"
echo "   • Check docs/GOOGLE_GEMINI_SETUP.md for detailed setup"
echo "   • Visit https://aistudio.google.com to monitor API usage"
echo ""
