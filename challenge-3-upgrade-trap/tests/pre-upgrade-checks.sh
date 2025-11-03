#!/bin/bash

set -e

echo "🔎 Running pre-upgrade checks..."

# Check 1: Ensure v1 is running
echo "Checking if v1 stack is running..."
if [ -z "$(docker-compose ps -q postgres)" ] || [ -z "$(docker-compose ps -q api)" ]; then
  echo "❌ v1 stack is not running. Please start it with 'docker-compose up -d'."
  exit 1
fi
echo "✅ v1 stack is running."

# Check 2: Verify v1 API is responsive
echo "Checking v1 API endpoint..."
API_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ "$API_STATUS_CODE" != "200" ]; then
    echo "❌ v1 API is not responding with a 200 OK."
    exit 1
fi
echo "✅ v1 API is responsive."

echo "🎉 Pre-upgrade checks passed!"
exit 0
