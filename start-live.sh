#!/bin/bash
# UniSync Live Server Startup Script
# Usage: ./start-live.sh

echo "🚀 Starting UniSync Live Server..."

# Kill any existing processes
pkill -f "node server.js" 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 2

# Start backend server
cd /Users/ahmad/Desktop/unisync/server
PORT=5000 node server.js &
SERVER_PID=$!
echo "✅ Server started (PID: $SERVER_PID)"
sleep 3

# Verify server is up
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Server health check passed"
else
    echo "❌ Server failed to start. Check logs."
    exit 1
fi

# Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:5000 > /tmp/cf-live.txt 2>&1 &
TUNNEL_PID=$!
echo "✅ Cloudflare tunnel started (PID: $TUNNEL_PID)"
echo "⏳ Waiting for tunnel URL..."
sleep 12

# Extract and display the public URL
URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-live.txt | head -1)

if [ -n "$URL" ]; then
    echo ""
    echo "🌐 YOUR LIVE URL: $URL"
    echo "   (Copy this link to share!)"
    echo ""
    echo "📋 Test it:"
    echo "   curl -s $URL/api/health"
    echo ""
    echo "🛑 To stop: kill $SERVER_PID $TUNNEL_PID"
    echo ""
    # Save URL to file for reference
    echo "$URL" > /Users/ahmad/Desktop/unisync/LIVE_URL.txt
else
    echo "⚠️ Could not extract URL. Check /tmp/cf-live.txt"
    cat /tmp/cf-live.txt | tail -10
fi

echo "✨ UniSync is live!"
