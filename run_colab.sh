#!/usr/bin/env bash
set -e

echo "=== OpenShorts Google Colab Setup ==="

# 1. Bersihkan proses lama
pkill -9 -f uvicorn || true
pkill -9 -f vite || true
pkill -9 -f cloudflared || true

# 2. System packages
echo "Installing system packages..."
apt-get update -qq && apt-get install -y -qq ffmpeg curl nodejs npm
# 3. Python packages
echo "Installing Python dependencies..."
pip install -r requirements.txt
pip install boto3 "mediapipe==0.10.14" "scenedetect>=0.6.4" py3langid faster-whisper ultralytics torch torchvision transnetv2-pytorch json-repair

# 4. Frontend dependencies
echo "Installing Frontend dependencies..."
(cd dashboard && npm ci)

# 5. Environment config
export VITE_PROXY_TARGET="http://127.0.0.1:8000"
if [ ! -f .env ]; then
  echo "Creating .env configuration..."
  cat << 'EOF' > .env
LLM_BASE_URL=https://my.ivyy.dpdns.org/v1
LLM_API_KEY=sk-5f238e76072d7926-8d3e86-14b7d8e3
LLM_MODEL=antigravity/gemini-3.8-flash-tiered
LLM_PROVIDER=openai
LLM_TIMEOUT=120
LLM_SCORE_BATCH=3
VITE_PROXY_TARGET=http://127.0.0.1:8000
QUALITY_GATE_MIN_HEIGHT=0
RATE_LIMIT_ENABLED=0
DEBUG_LOGS=true
EOF
fi

# 6. Cloudflared tunnel
if [ ! -f /usr/local/bin/cloudflared ]; then
  echo "Downloading cloudflared..."
  curl -sLo /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x /usr/local/bin/cloudflared
fi

echo "Starting backend and frontend..."
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 > /content/backend.log 2>&1 &
(cd dashboard && VITE_PROXY_TARGET=http://127.0.0.1:8000 npm run dev -- --host 0.0.0.0 --port 5173) > /content/frontend.log 2>&1 &

sleep 4

echo "Starting Cloudflare tunnel..."
cloudflared tunnel --url http://127.0.0.1:5173
