# Challenge 3 Solution: The Upgrade Trap

This document outlines the investigation and resolution of the issues found in the `challenge-3-upgrade-trap`.

## Summary of the Problem

The core issue was a "silent failure" during the upgrade from v1.0 to v2.0. The provided `upgrade-v1-to-v2.sh` script would always report "Upgrade successful!" (exiting with code 0), even when critical failures occurred.

This dangerous behavior led to a situation where the v2 application was started against an unmigrated v1 database, which would inevitably lead to data corruption in a production environment.

## Investigation and Bug Discovery

My investigation focused on the two key files identified in the `README.md`: `upgrade-v1-to-v2.sh` and `migrations/v2-migration.sql`. By analyzing the scripts and observing their behavior, I identified three distinct bugs that, together, created the "upgrade trap."

## Analysis of the Bugs and Their Fixes

### Bug #1: Silent Backup Failure & Portability Issue

*   **Problem**: The upgrade script attempted to create a database backup using `pg_dump`, but the command was flawed in two ways:
    1.  It tried to save the backup to a non-existent directory (`/tmp/nonexistent/`), causing the command to fail.
    2.  It assumed `pg_dump` was installed on the host machine, which is not a safe assumption for a portable script.
*   **Fix**: I modified the script to first create a `./backups` directory. Then, I changed the `pg_dump` command to be executed *inside* the running `postgres` container using `docker-compose exec`. This ensures the command will work reliably in any environment.

### Bug #2: SQL Migration Error Was Ignored

*   **Problem**: The `v2-migration.sql` script failed because it tried to `DROP` a column (`legacy_id`) that was still referenced by a foreign key constraint. While the database correctly rejected this and rolled back the transaction, the main `upgrade-v1-to-v2.sh` script never checked the exit code of the `psql` command, so it continued as if the migration had succeeded.
*   **Fix**:
    1.  I added `set -e` to the top of `upgrade-v1-to-v2.sh`, which makes the script exit immediately if any command fails.
    2.  I corrected the logic in `v2-migration.sql` to first `DROP` the foreign key constraint before dropping the now-unused column.

### Bug #3: Missing JWT Secret for v2

*   **Problem**: The v2 application uses a newer version of PostgREST that requires a JSON Web Token (JWT) secret for secure authentication. The original upgrade process never created this secret, and the `docker-compose-v2.yml` file wasn't configured to use one.
*   **Fix**: I added a command to the upgrade script to generate a secure `jwt.secret` file. I then updated the `docker-compose-v2.yml` file to pass this secret to the `api` service as an environment variable.

## Creating a Safe Upgrade Procedure

After fixing the bugs, I created a suite of test scripts to ensure the upgrade process is not only successful but also verifiable and safe.

1.  **`tests/pre-upgrade-checks.sh`**: Verifies that the v1 application is running and healthy *before* the upgrade begins.
2.  **`tests/post-upgrade-tests.sh`**: Verifies that the v2 application is running and that the database schema was correctly migrated *after* the upgrade is complete.
3.  **`tests/rollback-test.sh`**: Provides a tested and reliable procedure for restoring the database from a backup and reverting to the v1 application in case of any issues.

## Evidence of Successful Migration

The successful migration is most clearly demonstrated by the change in the data structure returned by the API.

#### Data Schema Before Fix (`v1`)
```json
[
  {
    "id": 1,
    "username": "alice",
    "email": "alice@sekoia.io",
    "legacy_id": 1001,
    "created_at": "2025-11-03T08:56:09.033455"
  },
  {
    "id": 2,
    "username": "bob",
    "email": "bob@sekoia.io",
    "legacy_id": 1002,
    "created_at": "2025-11-03T08:56:09.033455"
  },
  {
    "id": 3,
    "username": "charlie",
    "email": "charlie@sekoia.io",
    "legacy_id": 1003,
    "created_at": "2025-11-03T08:56:09.033455"
  }
]
```

#### Data Schema After Fix (`v2`)
```json
[
  {
    "id": 1,
    "username": "alice",
    "email": "alice@sekoia.io",
    "created_at": "2025-11-03T09:09:53.623637",
    "role": "user"
  },
  {
    "id": 2,
    "username": "bob",
    "email": "bob@sekoia.io",
    "created_at": "2025-11-03T09:09:53.623637",
    "role": "user"
  },
  {
    "id": 3,
    "username": "charlie",
    "email": "charlie@sekoia.io",
    "created_at": "2025-11-03T09:09:53.623637",
    "role": "user"
  }
]
```
As shown above, the `legacy_id` column has been successfully removed, and the new `role` column has been added to all existing users, confirming the migration was a success.

