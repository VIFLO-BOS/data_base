#!/bin/bash
# Database Restore Script
# Restores a PostgreSQL database from a pg_dump backup.

set -e

DB_URL=${DATABASE_URL:-"postgresql://annotator:annotator_dev@localhost:5432/annotator_platform"}
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh <backup-file.sql>"
  exit 1
fi

psql $DB_URL < $BACKUP_FILE
echo "Restore completed from $BACKUP_FILE"
