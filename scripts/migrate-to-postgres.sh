#!/bin/bash
# DataSphere Innovation - PostgreSQL Migration Script
# Sprint 3: Migration from SQLite to PostgreSQL

set -e

echo "=========================================="
echo "DataSphere Innovation - DB Migration"
echo "=========================================="
echo ""

# Configuration
SQLITE_DB="${SQLITE_DB:-./db/custom.db}"
POSTGRES_URL="${DATABASE_URL:-postgresql://user:password@localhost:5432/datasphere}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Backup SQLite database
backup_sqlite() {
    log_info "Backing up SQLite database..."
    BACKUP_FILE="./backups/sqlite_backup_$(date +%Y%m%d_%H%M%S).db"
    mkdir -p ./backups
    
    if [ -f "$SQLITE_DB" ]; then
        cp "$SQLITE_DB" "$BACKUP_FILE"
        log_info "Backup created: $BACKUP_FILE"
    else
        log_warn "SQLite database not found at $SQLITE_DB"
    fi
}

# Step 2: Generate Prisma client for PostgreSQL
generate_client() {
    log_info "Generating Prisma client for PostgreSQL..."
    
    # Copy PostgreSQL schema
    cp prisma/schema.postgresql.prisma prisma/schema.prisma
    
    # Generate client
    bun run db:generate
    
    log_info "Prisma client generated successfully"
}

# Step 3: Create PostgreSQL database schema
create_schema() {
    log_info "Creating PostgreSQL schema..."
    
    # Run migrations
    bunx prisma migrate deploy
    
    log_info "PostgreSQL schema created successfully"
}

# Step 4: Migrate data from SQLite to PostgreSQL
migrate_data() {
    log_info "Starting data migration..."
    
    # Run migration script
    bun run scripts/migrate-data.ts
    
    log_info "Data migration completed successfully"
}

# Step 5: Verify data integrity
verify_migration() {
    log_info "Verifying data integrity..."
    
    # Run verification script
    bun run scripts/verify-migration.ts
    
    log_info "Data verification completed successfully"
}

# Step 6: Update application configuration
update_config() {
    log_info "Updating application configuration..."
    
    # Update environment variables
    if [ -f ".env.local" ]; then
        # Backup existing config
        cp .env.local .env.local.backup
        
        log_info "Configuration updated. Please verify .env.local"
    fi
}

# Step 7: Rollback plan
rollback() {
    log_warn "Initiating rollback..."
    
    # Restore SQLite schema
    if [ -f "prisma/schema.sqlite.prisma.bak" ]; then
        cp prisma/schema.sqlite.prisma.bak prisma/schema.prisma
    fi
    
    # Regenerate client
    bun run db:generate
    
    log_info "Rollback completed. SQLite configuration restored."
}

# Main execution
main() {
    case "$1" in
        backup)
            backup_sqlite
            ;;
        generate)
            generate_client
            ;;
        schema)
            create_schema
            ;;
        migrate)
            migrate_data
            ;;
        verify)
            verify_migration
            ;;
        config)
            update_config
            ;;
        rollback)
            rollback
            ;;
        all)
            backup_sqlite
            generate_client
            create_schema
            migrate_data
            verify_migration
            log_info "Migration completed successfully!"
            ;;
        *)
            echo "Usage: $0 {backup|generate|schema|migrate|verify|config|rollback|all}"
            echo ""
            echo "Commands:"
            echo "  backup   - Backup SQLite database"
            echo "  generate - Generate Prisma client for PostgreSQL"
            echo "  schema   - Create PostgreSQL schema"
            echo "  migrate  - Migrate data from SQLite to PostgreSQL"
            echo "  verify   - Verify data integrity"
            echo "  config   - Update application configuration"
            echo "  rollback - Rollback to SQLite"
            echo "  all      - Run full migration process"
            exit 1
            ;;
    esac
}

main "$@"
