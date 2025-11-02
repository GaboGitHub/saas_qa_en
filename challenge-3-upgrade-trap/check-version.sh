#!/bin/bash
# Script pour vérifier la version de l'application

COMPOSE_FILE=${1:-docker-compose.yml}

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ File $COMPOSE_FILE not found"
    exit 1
fi

echo "📋 Checking application version..."
echo ""

# Vérifier quelle version du docker-compose est utilisée
if docker-compose ps --services 2>/dev/null | grep -q api; then
    VERSION=$(docker inspect $(docker-compose ps -q api) --format='{{index .Config.Labels "app.version"}}' 2>/dev/null)
    POSTGREST_VERSION=$(docker inspect $(docker-compose ps -q api) --format='{{.Config.Image}}' 2>/dev/null)
    
    echo "🏷️  Application Version: ${VERSION:-unknown}"
    echo "🐳 PostgREST Image: $POSTGREST_VERSION"
    echo ""
    
    # Vérifier le schéma de la base
    echo "🗄️  Database Schema:"
    docker-compose exec -T postgres psql -U sekoia -d sekios -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;" 2>/dev/null | grep -E "(legacy_id|role)"
    
    if docker-compose exec -T postgres psql -U sekoia -d sekios -c "\d users" 2>/dev/null | grep -q "role"; then
        echo "✅ Schema: v2.0 (column 'role' exists)"
    else
        echo "⚠️  Schema: v1.0 (column 'role' missing)"
    fi
else
    echo "❌ No containers running"
    exit 1
fi
