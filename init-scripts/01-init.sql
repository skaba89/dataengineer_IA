-- DataSphere Innovation - PostgreSQL Initialization Script
-- Run this script to set up the PostgreSQL database

-- Set timezone
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS datasphere;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set default search path
SET search_path TO datasphere, public;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'analyst', 'viewer');
CREATE TYPE project_status AS ENUM ('draft', 'discovery', 'architecture', 'development', 'deployed', 'completed');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE audit_status AS ENUM ('success', 'failure', 'blocked');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create functions

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate CUID-like IDs
CREATE OR REPLACE FUNCTION generate_cuid()
RETURNS TEXT AS $$
DECLARE
    timestamp TEXT;
    counter TEXT;
    random_part TEXT;
BEGIN
    timestamp := TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT);
    counter := LPAD(TO_HEX(FLOOR(RANDOM() * 16777216)::INT), 6, '0');
    random_part := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    RETURN 'c' || timestamp || counter || random_part;
END;
$$ LANGUAGE plpgsql;

-- Create tables for audit logging (separate schema for security)

CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT,
    organization_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET NOT NULL,
    user_agent TEXT,
    status audit_status NOT NULL DEFAULT 'success',
    risk_level risk_level NOT NULL DEFAULT 'low',
    metadata JSONB,
    signature TEXT NOT NULL DEFAULT ''
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit.audit_logs(risk_level);

-- Partition audit logs by month (for performance with large datasets)
-- Note: This is for production with high volume
-- CREATE TABLE audit.audit_logs_y2024m01 PARTITION OF audit.audit_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Create table for security events
CREATE TABLE IF NOT EXISTS datasphere.security_events (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    type TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'system',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON datasphere.security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON datasphere.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON datasphere.security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON datasphere.security_events(timestamp DESC);

-- Create table for security alerts
CREATE TABLE IF NOT EXISTS datasphere.security_alerts (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    event_id TEXT NOT NULL,
    type TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    channels TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_event_id ON datasphere.security_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_sent_at ON datasphere.security_alerts(sent_at DESC);

-- Create table for system metrics (for Prometheus-like storage)
CREATE TABLE IF NOT EXISTS datasphere.system_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON datasphere.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON datasphere.system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_timestamp ON datasphere.system_metrics(metric_name, timestamp DESC);

-- Create hypertable-like structure for time-series data (requires TimescaleDB)
-- SELECT create_hypertable('datasphere.system_metrics', 'timestamp', if_not_exists => TRUE);

-- Create table for alert rules configuration
CREATE TABLE IF NOT EXISTS datasphere.alert_rules (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    name TEXT NOT NULL,
    description TEXT,
    metric TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('gt', 'lt', 'eq', 'gte', 'lte')),
    threshold DOUBLE PRECISION NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'warning',
    duration_seconds INT DEFAULT 0,
    channels TEXT[] NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    labels JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for notification channels
CREATE TABLE IF NOT EXISTS datasphere.notification_channels (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'slack', 'pagerduty', 'sms', 'webhook')),
    config JSONB NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create views for monitoring

-- View: Active alerts
CREATE OR REPLACE VIEW datasphere.v_active_alerts AS
SELECT 
    sa.id,
    sa.type,
    sa.severity,
    sa.message,
    sa.sent_at,
    sa.channels
FROM datasphere.security_alerts sa
JOIN datasphere.security_events se ON sa.event_id = se.id
WHERE se.resolved = FALSE
ORDER BY sa.sent_at DESC;

-- View: Daily metrics summary
CREATE OR REPLACE VIEW datasphere.v_daily_metrics_summary AS
SELECT 
    metric_name,
    DATE(timestamp) as metric_date,
    COUNT(*) as data_points,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    STDDEV(metric_value) as stddev_value
FROM datasphere.system_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY metric_name, DATE(timestamp)
ORDER BY metric_name, metric_date DESC;

-- View: Security dashboard
CREATE OR REPLACE VIEW datasphere.v_security_dashboard AS
SELECT 
    DATE(timestamp) as event_date,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE severity = 'warning') as warning_events,
    COUNT(*) FILTER (WHERE severity = 'info') as info_events,
    COUNT(*) FILTER (WHERE resolved = TRUE) as resolved_events
FROM datasphere.security_events
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY event_date DESC;

-- Create triggers

-- Trigger for audit logs
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.audit_logs (
        user_id,
        organization_id,
        action,
        resource,
        resource_id,
        ip_address,
        user_agent,
        status
    ) VALUES (
        current_setting('app.current_user_id', TRUE),
        current_setting('app.current_org_id', TRUE),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        '0.0.0.0'::INET,
        'system',
        'success'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create roles for row-level security

-- Create read-only role for analytics
CREATE ROLE IF NOT EXISTS datasphere_readonly NOINHERIT;
GRANT CONNECT ON DATABASE datasphere TO datasphere_readonly;
GRANT USAGE ON SCHEMA datasphere TO datasphere_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA datasphere TO datasphere_readonly;

-- Create read-write role for application
CREATE ROLE IF NOT EXISTS datasphere_readwrite NOINHERIT;
GRANT CONNECT ON DATABASE datasphere TO datasphere_readwrite;
GRANT USAGE ON SCHEMA datasphere TO datasphere_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA datasphere TO datasphere_readwrite;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA datasphere TO datasphere_readwrite;

-- Create admin role
CREATE ROLE IF NOT EXISTS datasphere_admin NOINHERIT;
GRANT ALL PRIVILEGES ON DATABASE datasphere TO datasphere_admin;
GRANT ALL PRIVILEGES ON SCHEMA datasphere TO datasphere_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA datasphere TO datasphere_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA datasphere TO datasphere_admin;

-- Create default application user (to be changed in production)
-- CREATE USER datasphere_app WITH PASSWORD 'change_me_in_production';
-- GRANT datasphere_readwrite TO datasphere_app;

-- Insert default alert rules
INSERT INTO datasphere.alert_rules (name, description, metric, condition, threshold, severity, channels, enabled) VALUES
('High CPU Usage', 'CPU usage exceeds 80%', 'cpu_usage', 'gt', 80, 'warning', ARRAY['email', 'slack'], TRUE),
('Critical CPU Usage', 'CPU usage exceeds 95%', 'cpu_usage', 'gt', 95, 'critical', ARRAY['email', 'slack', 'pagerduty'], TRUE),
('High Memory Usage', 'Memory usage exceeds 85%', 'memory_usage', 'gt', 85, 'warning', ARRAY['email', 'slack'], TRUE),
('Database Connection Pool Low', 'Available database connections below 10', 'db_available_connections', 'lt', 10, 'critical', ARRAY['email', 'pagerduty'], TRUE),
('Slow Query Count High', 'More than 10 slow queries in 5 minutes', 'slow_queries_count', 'gt', 10, 'warning', ARRAY['slack'], TRUE),
('High Error Rate', 'Error rate exceeds 5%', 'error_rate', 'gt', 5, 'critical', ARRAY['email', 'slack', 'pagerduty'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert default notification channels
INSERT INTO datasphere.notification_channels (name, type, config, enabled) VALUES
('Default Email', 'email', '{"recipient": "admin@datasphere.io"}', TRUE),
('Default Slack', 'slack', '{"channel": "#alerts"}', TRUE),
('PagerDuty Critical', 'pagerduty', '{"service_key": "CHANGE_ME"}', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create function to vacuum analyze tables periodically
CREATE OR REPLACE FUNCTION maintenance_vacuum_analyze()
RETURNS void AS $$
BEGIN
    -- Analyze tables for query optimization
    ANALYZE datasphere.system_metrics;
    ANALYZE audit.audit_logs;
    ANALYZE datasphere.security_events;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to monitoring
GRANT pg_read_all_stats TO datasphere_readonly;

-- Log successful initialization
INSERT INTO datasphere.security_events (type, severity, message, source) 
VALUES ('system_init', 'info', 'PostgreSQL database initialized successfully', 'init_script');
