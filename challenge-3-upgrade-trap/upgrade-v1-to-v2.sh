#!/bin/bash

set -e

echo "🚀 Starting upgrade from v1.0 to v2.0..."

# ✅ FIX: Create a real backup in a valid path
echo "📦 Creating backup..."
mkdir -p ./backups
docker-compose exec -T postgres pg_dump -U sekoia sekios > ./backups/backup-$(date +%Y%m%d-%H%M%S).sql
echo "✅ Backup created"

# ✅ FIX: Error handling is now active via 'set -e'
echo "🔄 Running migration..."
docker-compose exec -T postgres psql -U sekoia -d sekios < migrations/v2-migration.sql > logs/migration.log 2>&1
echo "✅ Migration completed"

# ✅ FIX: Create the JWT secret required by v2
echo "🔑 Creating JWT secret..."
openssl rand -hex 32 > jwt.secret
echo "✅ Secret created"

echo "🔄 Upgrading application..."
docker-compose -f docker-compose-v2.yml up -d

sleep 5

echo "🎉 Upgrade successful!"
echo ""
echo "Check status with: curl http://localhost:8080/users"
