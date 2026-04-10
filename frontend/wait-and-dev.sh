#!/bin/sh

# Wait for backend to be ready
echo "Waiting for backend service to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if nc -z backend 8080 2>/dev/null; then
    echo "Backend is ready!"
    break
  fi
  echo "Attempt $attempt/$max_attempts: Backend not ready yet..."
  sleep 1
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "Warning: Backend did not respond in time, but continuing anyway..."
fi

# Start Vite dev server
echo "Starting Vite development server..."
cd /app/frontend
exec pnpm dev --host 0.0.0.0
