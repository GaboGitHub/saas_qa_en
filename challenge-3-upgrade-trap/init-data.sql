-- Sample data for testing

INSERT INTO users (username, email, legacy_id) VALUES
    ('alice', 'alice@sekoia.io', 1001),
    ('bob', 'bob@sekoia.io', 1002),
    ('charlie', 'charlie@sekoia.io', 1003);

INSERT INTO sessions (user_id, token) VALUES
    (1, 'token-alice-123'),
    (2, 'token-bob-456');

-- Données legacy (pour créer la dépendance)
INSERT INTO legacy_mappings (user_legacy_id, old_system_ref) VALUES
    (1001, 'OLD-SYS-ALICE'),
    (1002, 'OLD-SYS-BOB'),
    (1003, 'OLD-SYS-CHARLIE');
