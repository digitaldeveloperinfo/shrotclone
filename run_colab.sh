#!/usr/bin/env bash
set -e

echo "=== OpenShorts Google Colab Setup ==="

# 1. System packages
echo "Installing system packages..."
apt-get update -qq && apt-get install -y -qq ffmpeg curl nodejs npm

# 2. Python packages
echo "Installing Python dependencies..."
pip install -r requirements.txt
pip install "mediapipe==0.10.14" "scenedetect>=0.6.4" py3langid faster-whisper ultralytics torch torchvision transnetv2-pytorch json-repair

# 3. Frontend dependencies
echo "Installing Frontend dependencies..."
(cd dashboard && npm ci)

# 4. Environment config
if [ ! -f .env ]; then
  echo "Creating .env configuration..."
  cat << 'EOF' > .env
LLM_BASE_URL=https://my.ivyy.dpdns.org/v1
LLM_API_KEY=sk-5f238e76072d7926-8d3e86-14b7d8e3
LLM_MODEL=antigravity/gemini-3.8-flash-tiered
LLM_PROVIDER=openai
LLM_TIMEOUT=120
LLM_SCORE_BATCH=3
QUALITY_GATE_MIN_HEIGHT=0
RATE_LIMIT_ENABLED=0
DEBUG_LOGS=true
EOF
fi

# 5. Cloudflared tunnel
if [ ! -f /usr/local/bin/cloudflared ]; then
  echo "Downloading cloudflared..."
  curl -sLo /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x /usr/local/bin/cloudflared
fi

echo "Starting backend and frontend..."
uvicorn app:app --host 0.0.0.0 --port 8000 &
(cd dashboard && npm run dev -- --host 0.0.0.0 --port 5173) &

sleep 5

echo "Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:5173
