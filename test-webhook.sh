#!/bin/bash
echo "Testing webhook endpoint..."
echo ""
echo "1. Testing local endpoint (if server is running):"
curl -X POST http://localhost:7720/webhooks/retell \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call_id": "test_call_123",
    "call": {
      "start_timestamp": "2026-01-26T00:00:00Z",
      "direction": "inbound",
      "from_number": "+1234567890"
    }
  }' \
  --silent --show-error || echo "Server not running on port 7720"

echo ""
echo ""
echo "2. If using Render, test with your deployed URL:"
echo "   curl -X POST https://ai-deck.onrender.com/webhooks/retell \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"event\": \"call_started\", \"call_id\": \"test_123\"}'"
