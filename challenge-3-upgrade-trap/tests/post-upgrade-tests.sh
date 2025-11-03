#!/bin/bash

set -e

echo "🔎 Running post-upgrade tests..."

# Check 1: ensure v2 is running
echo "Checking if v2 stack is running..."
if [ -z "$(docker-compose -f docker-compose-v2.yml ps -q postgres)" ] || [ -z "$(docker-compose -f docker-compose-v2.yml ps -q api)" ]; then
  echo "❌ v2 stack is not running."
  exit 1
fi
echo "✅ v2 stack is running."

# Check 2: verify database migration
echo "Verifying database schema..."
DB_SCHEMA_CHECK=$(docker-compose -f docker-compose-v2.yml exec -T postgres psql -U sekoia -d sekios -c "\d users" | grep "role")
if [ -z "$DB_SCHEMA_CHECK" ]; then
    echo "❌ Database migration failed: 'role' column not found in 'users' table."
    exit 1
fi
echo "✅ Database schema is correct."

# Check 3: Simple API check for v2 (if there was a real v2 API to check)
# Since the v2 API is just nginx, I just check if it's up.
echo "Checking v2 API endpoint..."
API_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ "$API_STATUS_CODE" != "200" ]; then
    echo "❌ v2 API is not responding with a 200 OK."
    exit 1
fi
echo "✅ v2 API is responsive."

echo "🎉 Post-upgrade tests passed!"
exit 0
