#!/bin/bash
set -e
export PGPASSWORD=replicatorpass

echo "Waiting for primary database to be ready..."
until pg_isready -h postgres-primary -p 5432 -U admin; do
  echo "Still waiting for primary..."
  sleep 2
done
echo "Primary database is ready!"

echo "Stopping local PostgreSQL server..."
pg_ctl -D /var/lib/postgresql/data stop || true

echo "Removing existing data directory..."
rm -rf /var/lib/postgresql/data/*

echo "Creating base backup from primary..."
pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U replicator -P --wal-method=stream

echo "Setting up replica configuration..."
# Create standby.signal file for PostgreSQL 12+
touch /var/lib/postgresql/data/standby.signal

# Add primary connection info to postgresql.conf
echo "primary_conninfo = 'host=postgres-primary port=5432 user=replicator password=replicatorpass'" >> /var/lib/postgresql/data/postgresql.conf
echo "recovery_target_timeline = 'latest'" >> /var/lib/postgresql/data/postgresql.conf

echo "Replica setup complete!"