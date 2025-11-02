-- SekiOS v1.0 Schema

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    legacy_id INTEGER UNIQUE,  -- UNIQUE pour permettre les foreign keys
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table qui utilise legacy_id (pour créer une dépendance)
CREATE TABLE legacy_mappings (
    id SERIAL PRIMARY KEY,
    user_legacy_id INTEGER NOT NULL,
    old_system_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_legacy_user FOREIGN KEY (user_legacy_id) REFERENCES users(legacy_id)
);

CREATE INDEX idx_users_legacy ON users(legacy_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_legacy_mappings_user ON legacy_mappings(user_legacy_id);
