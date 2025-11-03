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

-- ✅ FIX: Drop the foreign key constraint first
ALTER TABLE legacy_mappings DROP CONSTRAINT fk_legacy_user;

-- Now it's safe to drop the column
ALTER TABLE users DROP COLUMN legacy_id;

-- Nouvelle colonne (ne sera jamais ajoutée si la migration échoue)
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Ajout de contrainte
ALTER TABLE users ADD CONSTRAINT check_email CHECK (email LIKE '%@%');

COMMIT;
