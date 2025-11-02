# Challenge 3: The Upgrade Trap ⬆️

## 📖 Context

A client has successfully installed SekiOS v1.0. They now want to upgrade to v2.0 which brings new features. The upgrade seems to succeed (exit code 0) but the application no longer works correctly.

## 🎯 Objectives

1. **Execute the provided upgrade script**
2. **Identify why data is corrupted**
3. **Check rollback possibility**
4. **Propose a safe upgrade procedure**

## 🚀 Initial Setup

### Option 1: With Tilt (Recommended)

```bash
cd challenge-3-upgrade-trap

# Launch Tilt
tilt up

# Open Tilt dashboard
# http://localhost:10350

# In the dashboard, use the buttons:
# - "check-data" to verify data
# - "upgrade-to-v2" to launch the upgrade
# - "reset-v1" to restart
```

### Option 2: Manual

```bash
cd challenge-3-upgrade-trap

# 1. Start v1.0 with data
docker-compose up -d

# 2. Verify everything works
curl http://localhost:8080/users
# Should return 3 users

# 3. Launch the upgrade
./upgrade-v1-to-v2.sh

# 4. Observe the problem...
# The script says "Upgrade successful!" but actually the migration failed
cat logs/migration.log
# You will see SQL errors

# 5. Check database state
docker-compose exec postgres psql -U sekoia -d sekios -c "\d users"
# The legacy_id column is still there (migration rolled back)
# The role column doesn't exist (proof that migration failed)
```

### Option 3: Use the Demo Script

```bash
cd challenge-3-upgrade-trap

# Script that shows all bugs automatically
./demo-bugs.sh

# This script will:
# 1. Start v1
# 2. Launch upgrade
# 3. Identify and clearly display the 3 bugs
```

## 🐛 Symptoms

After the upgrade:

- ✅ The script returns "Upgrade successful!" (exit 0)
- ❌ The migration failed and rolled back automatically (thanks to BEGIN/COMMIT)
- ❌ The database remained in v1, but the script doesn't detect it
- ❌ The v2 application is started while the database isn't migrated

## 🔍 Files to Analyze

```

challenge-3-upgrade-trap/
├── docker-compose.yml # v1.0 Stack
├── docker-compose-v2.yml # v2.0 Stack
├── upgrade-v1-to-v2.sh # Upgrade script (BUGGY)
├── migrations/
│ ├── v1-schema.sql # Initial schema
│ └── v2-migration.sql # v1→v2 Migration (BUGGY)
├── logs/
│ ├── migration.log # Migration logs
└── init-data.sql # Test data

```

## 📤 Expected Deliverables

```
challenge-3-upgrade-trap/
├── docker-compose.yml # Stack v1.0
├── docker-compose-v2.yml # Stack v2.0
├── upgrade-v1-to-v2.sh # Upgrade script (BUGGY)
├── migrations/
│ ├── v1-schema.sql # Initial schema
│ └── v2-migration.sql # Migration v1→v2 (BUGGY)
├── logs/
│ ├── migration.log # Migration logs
└── init-data.sql # Test data
├── tests/
│   ├── pre-upgrade-checks.sh   # Pre-upgrade validations
│   ├── post-upgrade-tests.sh   # Post-upgrade tests
│   └── rollback-test.sh        # Rollback test
```

## 🎓 Evaluation Criteria

| Criterion                | Points |
| ------------------------ | ------ |
| Identification of 3 bugs | 40%    |
| Safe upgrade script      | 30%    |
| Validation tests         | 20%    |
| Documentation            | 10%    |

## 🎯 Good Upgrade Checklist

Your procedure must:

- ✅ Create a **verified** backup
- ✅ Perform pre-checks (disk space, versions)
- ✅ Execute migration **with error handling**
- ✅ Validate data post-migration
- ✅ Allow automatic rollback if failure
- ✅ Be idempotent (replayable without damage)

Good luck! 🎢
