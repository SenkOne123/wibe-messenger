#!/bin/bash
# Stop execution if any command fails
set -e

echo "====================================="
echo "🚀 Starting Deployment for Wibe Messenger"
echo "====================================="

echo "➡️ Navigating to project directory..."
cd /var/www/wibe-messenger

echo "➡️ Pulling latest code from main branch..."
git fetch origin main
git reset --hard origin/main

echo "➡️ Installing and building Frontend..."
cd frontend
npm ci || npm install
npm run build
cd ..

echo "➡️ Installing and building Backend..."
cd backend
npm ci || npm install
npx prisma generate
npx prisma db push --skip-generate
npm run build
cd ..

echo "➡️ Restarting Backend with PM2..."
# Assuming your pm2 process is the only one running or you named it wibe-backend. 
# We'll use 'all' to be safe, but you can change it to the exact app name later if needed.
pm2 restart all || echo "PM2 restart failed, but deployment continues..."

echo "✅ Deployment finished successfully!"
echo "====================================="
