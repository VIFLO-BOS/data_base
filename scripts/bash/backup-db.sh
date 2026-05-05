#!/bin/bash
# Database Backup Script
# Creates a pg_dump backup of the PostgreSQL database.

set -e

DB_URL=${DATABASE_URL:-"postgresql://annotator:annotator_dev@localhost:5432/annotator_platform"}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${TIMESTAMP}.sql"

mkdir -p $BACKUP_DIR
pg_dump $DB_URL > $BACKUP_DIR/$FILENAME
echo "Backup saved to $BACKUP_DIR/$FILENAME"
