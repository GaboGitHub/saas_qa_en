#!/bin/bash

# Bug volontaire : script qui retourne succès même en cas d'échec

echo "🚀 Starting upgrade from v1.0 to v2.0..."

# ❌ BUG : Pas de backup !
echo "📦 Creating backup..."
# Cette ligne devrait créer un backup mais le path n'existe pas
pg_dump -h localhost -U sekoia sekios > /tmp/nonexistent/backup.sql 2>/dev/null
echo "✅ Backup created"

# ❌ BUG : Migration échoue mais on ignore l'erreur
echo "🔄 Running migration..."
docker-compose exec -T postgres psql -U sekoia -d sekios < migrations/v2-migration.sql > logs/migration.log 2>&1
# On ne check pas le exit code !
echo "✅ Migration completed"

# ❌ BUG : On ne crée pas le nouveau secret JWT
echo "🔄 Upgrading application..."
docker-compose -f docker-compose-v2.yml up -d

sleep 5

echo "✅ Upgrade successful!"
echo ""
echo "Check status with: curl http://localhost:8080/users"
exit 0  # ❌ Retourne toujours succès !
