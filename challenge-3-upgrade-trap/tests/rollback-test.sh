#!/bin/bash

set -e

echo "⏪ Running rollback test..."

# Find the latest backup
BACKUP_FILE=$(ls -t backups/backup-*.sql | head -1)

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ No backup file found. Cannot perform rollback."
    exit 1
fi

echo "Found backup file: $BACKUP_FILE"

# 1. Stop and remove v2 containers
echo "Stopping v2 stack..."
docker-compose -f docker-compose-v2.yml down --volumes

# 2. Restore the database from backup
echo "Restoring database from backup..."
# Start a fresh v1 postgres to restore into
docker-compose up -d postgres
sleep 5 # Give postgres time to initialize
docker-compose exec -T postgres dropdb -U sekoia sekios
docker-compose exec -T postgres createdb -U sekoia sekios
cat $BACKUP_FILE | docker-compose exec -T postgres psql -U sekoia -d sekios
echo "✅ Database restored."

# 3. Restart the full v1 stack
echo "Restarting v1 stack..."
docker-compose up -d
sleep 5

# 4. Verify v1 is working again
echo "Verifying v1 stack after rollback..."
./tests/pre-upgrade-checks.sh

echo "🎉 Rollback test successful!"
exit 0
