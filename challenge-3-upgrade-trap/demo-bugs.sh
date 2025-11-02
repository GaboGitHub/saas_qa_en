#!/bin/bash
# Script de démonstration des bugs du Challenge 3

set +e  # Ne pas arrêter en cas d'erreur (pour la démonstration)

echo "═══════════════════════════════════════════════════════════"
echo "   Challenge 3 - Démonstration des Bugs d'Upgrade"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🚀 Phase 1: État Initial (v1.0)"
echo "───────────────────────────────────────────────────────────"

# Démarrer v1
docker-compose up -d > /dev/null 2>&1
sleep 5

# Vérifier v1
APP_VERSION=$(docker inspect $(docker-compose ps -q api) --format='{{index .Config.Labels "app.version"}}' 2>/dev/null)
info "Application Version: $APP_VERSION"

USER_COUNT=$(docker-compose exec -T postgres psql -U sekoia -d sekios -c "SELECT COUNT(*) FROM users;" 2>/dev/null | grep -oP '\d+' | head -1)
check "Base de données : $USER_COUNT utilisateurs créés"

HAS_LEGACY=$(docker-compose exec -T postgres psql -U sekoia -d sekios -c "\d users" 2>/dev/null | grep -q "legacy_id" && echo "yes" || echo "no")
if [ "$HAS_LEGACY" = "yes" ]; then
    check "Schéma v1 : colonne 'legacy_id' présente"
else
    warning "Schéma v1 : colonne 'legacy_id' ABSENTE (problème)"
fi

HAS_ROLE=$(docker-compose exec -T postgres psql -U sekoia -d sekios -c "\d users" 2>/dev/null | grep -q "role" && echo "yes" || echo "no")
if [ "$HAS_ROLE" = "no" ]; then
    check "Schéma v1 : colonne 'role' absente (normal)"
else
    warning "Schéma v1 : colonne 'role' PRÉSENTE (anormal)"
fi

echo ""
echo "🔄 Phase 2: Tentative d'Upgrade vers v2.0"
echo "───────────────────────────────────────────────────────────"

# Nettoyer les anciens logs
rm -f logs/migration.log

# Lancer l'upgrade
info "Exécution du script d'upgrade..."
./upgrade-v1-to-v2.sh > /tmp/upgrade-output.log 2>&1
UPGRADE_EXIT_CODE=$?

if [ $UPGRADE_EXIT_CODE -eq 0 ]; then
    warning "Script retourne EXIT 0 (succès) - MAIS C'EST UN MENSONGE !"
else
    info "Script retourne EXIT $UPGRADE_EXIT_CODE (échec)"
fi

# Vérifier le message affiché
if grep -q "Upgrade successful" /tmp/upgrade-output.log; then
    warning "Script affiche '✅ Upgrade successful!' - MAIS C'EST FAUX !"
fi

echo ""
echo "🐛 Phase 3: Identification des Bugs"
echo "───────────────────────────────────────────────────────────"

# Bug 1 : Migration échoue silencieusement
echo ""
echo -e "${BLUE}BUG #1 : Migration SQL Échoue Silencieusement${NC}"
echo "───────────────────────────────────────────────────────────"

if [ -f logs/migration.log ]; then
    if grep -q "ERROR.*cannot drop column legacy_id" logs/migration.log; then
        warning "Migration a échoué ! Voir logs/migration.log"
        echo ""
        echo "Extrait du log :"
        echo "───────────────────────────────────────────────────────────"
        cat logs/migration.log | head -7
        echo "───────────────────────────────────────────────────────────"
    else
        check "Migration réussie (pas d'erreur dans les logs)"
    fi
else
    warning "Fichier logs/migration.log introuvable"
fi

# Bug 2 : Incompatibilité Application/Schéma
echo ""
echo -e "${BLUE}BUG #2 : Incompatibilité Application/Schéma${NC}"
echo "───────────────────────────────────────────────────────────"

sleep 3
APP_VERSION_V2=$(docker inspect $(docker-compose ps -q api) --format='{{index .Config.Labels "app.version"}}' 2>/dev/null)
info "Application Version actuelle : $APP_VERSION_V2"

HAS_ROLE_V2=$(docker-compose exec -T postgres psql -U sekoia -d sekios -c "\d users" 2>/dev/null | grep -q "role" && echo "yes" || echo "no")
HAS_LEGACY_V2=$(docker-compose exec -T postgres psql -U sekoia -d sekios -c "\d users" 2>/dev/null | grep -q "legacy_id" && echo "yes" || echo "no")

if [ "$HAS_ROLE_V2" = "no" ]; then
    warning "Schéma : colonne 'role' ABSENTE → Base en v1"
else
    check "Schéma : colonne 'role' présente → Base en v2"
fi

if [ "$HAS_LEGACY_V2" = "yes" ]; then
    warning "Schéma : colonne 'legacy_id' PRÉSENTE → Base en v1"
else
    check "Schéma : colonne 'legacy_id' absente → Base en v2"
fi

if [ "$APP_VERSION_V2" = "2.0" ] && [ "$HAS_ROLE_V2" = "no" ]; then
    echo ""
    echo -e "${RED}🚨 INCOHÉRENCE DÉTECTÉE !${NC}"
    echo "   Application : v2.0"
    echo "   Schéma DB   : v1.0"
    echo "   → Risque de corruption de données !"
fi

# Bug 3 : Backup non créé
echo ""
echo -e "${BLUE}BUG #3 : Backup Non Créé${NC}"
echo "───────────────────────────────────────────────────────────"

if [ -f "/tmp/nonexistent/backup.sql" ]; then
    check "Backup créé à /tmp/nonexistent/backup.sql"
else
    warning "Backup NON créé ! (le répertoire /tmp/nonexistent/ n'existe pas)"
    info "En cas de problème, rollback IMPOSSIBLE !"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   Résumé des Bugs Identifiés"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. ❌ Migration SQL échoue mais le script retourne exit 0"
echo "2. ❌ Application v2 tourne sur un schéma v1 (incohérence)"
echo "3. ❌ Backup non créé → rollback impossible"
echo ""
echo "💡 Le candidat doit proposer un script d'upgrade robuste !"
echo ""
