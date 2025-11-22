# Environment variables for Medagen Frontend

# Backend API Configuration
# Production Backend: https://medagen-backend.hf.space
# Local Development: http://localhost:8000
NEXT_PUBLIC_API_URL=https://medagen-backend.hf.space

# WebSocket URL for real-time ReAct updates
# Production: wss://medagen-backend.hf.space/ws/chat
# Local: ws://localhost:8000/ws/chat
NEXT_PUBLIC_WS_URL=wss://medagen-backend.hf.space/ws/chat

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REACT_FLOW=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_CV_INSIGHTS=true

# Mock Data (for development/testing)
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_MOCK_DATA=false

# WebSocket Configuration
NEXT_PUBLIC_MAX_RECONNECT_ATTEMPTS=5
NEXT_PUBLIC_RECONNECT_DELAY_MS=1000

# Development/Debug
NEXT_PUBLIC_DEBUG_WEBSOCKET=false
NEXT_PUBLIC_SHOW_STEP_NUMBERS=true
