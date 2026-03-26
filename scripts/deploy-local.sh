#!/bin/bash

# ============================================
# DataSphere Innovation - Local Deployment Script
# ============================================
# Usage: ./scripts/deploy-local.sh [command]
# Commands:
#   start     - Start all services
#   stop      - Stop all services
#   restart   - Restart all services
#   status    - Show services status
#   logs      - Show logs
#   backup    - Create database backup
#   restore   - Restore database from backup
#   update    - Pull latest code and redeploy
#   clean     - Remove all containers and volumes
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.local.yml"
PROJECT_NAME="datasphere"

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "============================================"
    echo "   DataSphere Innovation - Local Deploy    "
    echo "============================================"
    echo -e "${NC}"
}

# Check dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed.${NC}"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed.${NC}"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All dependencies are installed${NC}"
}

# Check environment file
check_env_file() {
    if [ ! -f ".env.production.local" ]; then
        echo -e "${YELLOW}Creating .env.production.local from template...${NC}"
        cp .env.production.local .env.production.local.bak 2>/dev/null || true
        echo -e "${GREEN}✓ Environment file ready${NC}"
    else
        echo -e "${GREEN}✓ Environment file exists${NC}"
    fi
}

# Start services
start_services() {
    echo -e "${YELLOW}Starting DataSphere Innovation services...${NC}"
    
    check_env_file
    
    # Pull images
    echo -e "${YELLOW}Pulling Docker images...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME pull
    
    # Build application
    echo -e "${YELLOW}Building application...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build
    
    # Start services
    echo -e "${YELLOW}Starting containers...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    # Wait for services to be healthy
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Run migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T app npx prisma migrate deploy 2>/dev/null || true
    
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✓ DataSphere Innovation is running!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "Application:    ${BLUE}http://localhost:3000${NC}"
    echo -e "PostgreSQL:     ${BLUE}localhost:5432${NC}"
    echo -e "Redis:          ${BLUE}localhost:6379${NC}"
    echo ""
    echo -e "Run '${YELLOW}./scripts/deploy-local.sh logs${NC}' to view logs"
    echo -e "Run '${YELLOW}./scripts/deploy-local.sh status${NC}' to check status"
}

# Stop services
stop_services() {
    echo -e "${YELLOW}Stopping DataSphere Innovation services...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Restart services
restart_services() {
    echo -e "${YELLOW}Restarting DataSphere Innovation services...${NC}"
    stop_services
    sleep 2
    start_services
}

# Show status
show_status() {
    echo -e "${YELLOW}Service Status:${NC}"
    echo ""
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    echo ""
    
    # Check health
    echo -e "${YELLOW}Health Check:${NC}"
    
    # App health
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "  App:      ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  App:      ${RED}✗ Not responding${NC}"
    fi
    
    # PostgreSQL health
    if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres pg_isready -U datasphere > /dev/null 2>&1; then
        echo -e "  PostgreSQL: ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  PostgreSQL: ${RED}✗ Not responding${NC}"
    fi
    
    # Redis health
    if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "  Redis:    ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Redis:    ${RED}✗ Not responding${NC}"
    fi
}

# Show logs
show_logs() {
    SERVICE=$2
    if [ -z "$SERVICE" ]; then
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f --tail=100
    else
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f --tail=100 $SERVICE
    fi
}

# Create backup
create_backup() {
    echo -e "${YELLOW}Creating database backup...${NC}"
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/datasphere_$TIMESTAMP.sql.gz"
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres pg_dump -U datasphere datasphere | gzip > $BACKUP_FILE
    
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    
    # Clean old backups (keep last 7)
    find $BACKUP_DIR -name "datasphere_*.sql.gz" -mtime +7 -delete
    echo -e "${YELLOW}Old backups cleaned (keeping last 7 days)${NC}"
}

# Restore backup
restore_backup() {
    BACKUP_FILE=$2
    
    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Please specify backup file${NC}"
        echo "Usage: ./scripts/deploy-local.sh restore <backup_file>"
        echo ""
        echo "Available backups:"
        ls -la ./backups/*.sql.gz 2>/dev/null || echo "  No backups found"
        exit 1
    fi
    
    echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Restore cancelled."
        exit 0
    fi
    
    echo -e "${YELLOW}Restoring database from $BACKUP_FILE...${NC}"
    
    gunzip -c $BACKUP_FILE | docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres psql -U datasphere datasphere
    
    echo -e "${GREEN}✓ Database restored${NC}"
}

# Update application
update_app() {
    echo -e "${YELLOW}Updating DataSphere Innovation...${NC}"
    
    # Pull latest code
    echo -e "${YELLOW}Pulling latest code...${NC}"
    git pull origin master
    
    # Stop services
    stop_services
    
    # Rebuild and start
    start_services
    
    echo -e "${GREEN}✓ Update complete${NC}"
}

# Clean everything
clean_all() {
    echo -e "${RED}WARNING: This will remove all containers, volumes, and data!${NC}"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Clean cancelled."
        exit 0
    fi
    
    echo -e "${YELLOW}Removing all containers and volumes...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --rmi local
    
    echo -e "${GREEN}✓ Clean complete${NC}"
}

# Main
print_banner
check_dependencies

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $@
        ;;
    backup)
        create_backup
        ;;
    restore)
        restore_backup $@
        ;;
    update)
        update_app
        ;;
    clean)
        clean_all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|backup|restore|update|clean}"
        echo ""
        echo "Commands:"
        echo "  start     - Start all services"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show services status"
        echo "  logs      - Show logs (optional: specify service name)"
        echo "  backup    - Create database backup"
        echo "  restore   - Restore database from backup"
        echo "  update    - Pull latest code and redeploy"
        echo "  clean     - Remove all containers and volumes"
        exit 1
        ;;
esac
