-- Migration v1.0 → v2.0
-- Bug volontaire : cette migration échoue silencieusement

BEGIN;

-- Nouvelle table pour v2
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ❌ BUG : Supprime une colonne référencée par legacy_mappings via foreign key
-- Cela DOIT échouer à cause de la contrainte fk_legacy_user mais l'erreur est ignorée par le script
ALTER TABLE users DROP COLUMN legacy_id;

-- Nouvelle colonne (ne sera jamais ajoutée si la migration échoue)
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Ajout de contrainte
ALTER TABLE users ADD CONSTRAINT check_email CHECK (email LIKE '%@%');

COMMIT;
