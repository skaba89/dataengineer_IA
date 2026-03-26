-- ============================================
-- DataSphere Innovation - Database Initialization
-- ============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE datasphere TO datasphere;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO datasphere;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO datasphere;

-- Create initial admin user (will be handled by Prisma)
-- This is just a placeholder for any custom initialization

-- Log
DO $$
BEGIN
    RAISE NOTICE 'DataSphere Innovation database initialized successfully';
END $$;
