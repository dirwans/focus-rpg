#!/bin/bash
# Focus RPG VPS Deployment Script
# This script is executed on the VPS to pull, build, and restart the PM2 process.

echo "--- Pulling from GitHub ---"
git pull origin main

echo "--- Removing old dist (fix permissions) ---"
rm -rf dist

echo "--- Installing dependencies ---"
npm install

echo "--- Building ---"
npm run build

echo "--- Restarting PM2 ---"
pm2 restart focus-rpg --update-env

echo "--- Done ---"
