# DataSphere Innovation - Operational Runbooks

## Table of Contents

1. [Incident Response Runbook](#incident-response-runbook)
2. [Database Migration Runbook](#database-migration-runbook)
3. [Deployment Runbook](#deployment-runbook)
4. [Monitoring & Alerting Runbook](#monitoring--alerting-runbook)
5. [Backup & Recovery Runbook](#backup--recovery-runbook)
6. [Security Incident Runbook](#security-incident-runbook)

---

## 1. Incident Response Runbook

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 - Critical** | Service down, data loss | 15 minutes | Database unavailable, security breach |
| **P2 - High** | Major functionality impaired | 30 minutes | API latency > 5s, partial service degradation |
| **P3 - Medium** | Minor functionality impaired | 2 hours | Non-critical feature broken, UI glitches |
| **P4 - Low** | Cosmetic issues | 24 hours | Typos, minor styling issues |

### Incident Response Procedure

```
1. DETECT
   ├── Alert triggered via PagerDuty/Slack
   ├── User report received
   └── Monitoring dashboard anomaly detected

2. TRIAGE
   ├── Assess severity level
   ├── Identify affected components
   └── Assign incident commander

3. INVESTIGATE
   ├── Check application logs: `vercel logs --follow`
   ├── Check database health: `/api/health`
   ├── Review recent deployments
   └── Check external dependencies status

4. MITIGATE
   ├── If code issue: Rollback to previous deployment
   ├── If infrastructure: Scale resources or failover
   ├── If database: Restore from backup if needed
   └── Document all actions taken

5. RESOLVE
   ├── Implement permanent fix
   ├── Deploy fix to production
   ├── Verify resolution
   └── Update incident ticket

6. POST-MORTEM
   ├── Create incident report within 24 hours
   ├── Identify root cause
   ├── Create action items to prevent recurrence
   └── Schedule follow-up review
```

### Escalation Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| On-Call Engineer | @oncall Slack channel | 24/7 |
| Tech Lead | tech-lead@datasphere.io | Business hours |
| Security Lead | security@datasphere.io | 24/7 (P1 only) |
| Management | management@datasphere.io | P1 incidents |

---

## 2. Database Migration Runbook

### Pre-Migration Checklist

- [ ] Backup current database
- [ ] Verify backup integrity
- [ ] Notify stakeholders of maintenance window
- [ ] Prepare rollback plan
- [ ] Test migration on staging environment

### SQLite to PostgreSQL Migration

```bash
# Step 1: Backup SQLite database
./scripts/migrate-to-postgres.sh backup

# Step 2: Verify backup
ls -la ./backups/

# Step 3: Set environment variables
export DATABASE_URL="postgresql://user:pass@host:5432/datasphere"
export DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/datasphere"

# Step 4: Generate Prisma client
./scripts/migrate-to-postgres.sh generate

# Step 5: Create PostgreSQL schema
./scripts/migrate-to-postgres.sh schema

# Step 6: Migrate data
./scripts/migrate-to-postgres.sh migrate

# Step 7: Verify migration
./scripts/migrate-to-postgres.sh verify
```

### Rollback Procedure

```bash
# If migration fails, rollback to SQLite
./scripts/migrate-to-postgres.sh rollback

# Restore from backup if needed
cp ./backups/sqlite_backup_YYYYMMDD_HHMMSS.db ./db/custom.db
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Connection timeout | Check firewall rules, verify PostgreSQL is running |
| Schema mismatch | Run `prisma migrate reset` on staging first |
| Data type conversion error | Check JSON field parsing in migration script |
| Foreign key violations | Ensure migration order respects dependencies |

---

## 3. Deployment Runbook

### Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | develop | dev.datasphere.io | Feature testing |
| Staging | develop | staging.datasphere.io | Pre-production testing |
| Production | main | datasphere.io | Live environment |

### Standard Deployment

```bash
# 1. Verify all tests pass
bun run test
bun run test:e2e

# 2. Build application
bun run build

# 3. Deploy to staging (automatic via CI/CD)
git push origin develop

# 4. Verify staging
curl https://staging.datasphere.io/api/health

# 5. Promote to production
git checkout main
git merge develop
git push origin main

# 6. Verify production
curl https://datasphere.io/api/health
```

### Rollback Procedure

```bash
# Option 1: Revert commit
git revert HEAD
git push origin main

# Option 2: Redeploy previous version
# Via Vercel dashboard or CLI
vercel rollback

# Option 3: Emergency rollback
vercel rollback --force
```

### Health Check Endpoints

```bash
# Application health
curl https://datasphere.io/api/health

# Response example:
{
  "status": "healthy",
  "version": "1.2.3",
  "timestamp": "2025-01-15T10:30:00Z",
  "checks": {
    "database": "healthy",
    "memory": { "used": 256, "total": 512 },
    "uptime": 86400
  }
}

# Metrics (Prometheus format)
curl https://datasphere.io/api/metrics
```

---

## 4. Monitoring & Alerting Runbook

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| API Response Time (P95) | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |
| Database Connections | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| CPU Usage | > 70% | > 90% |
| Disk Usage | > 80% | > 95% |

### Alert Response Procedures

#### High Latency Alert

```
1. Check current metrics dashboard
2. Identify slow endpoints
3. Check database query performance
4. Scale resources if needed
5. Optimize slow queries
```

#### Error Rate Spike

```
1. Check Sentry for error details
2. Identify affected endpoints
3. Check recent deployments
4. Rollback if caused by recent change
5. Create hotfix if needed
```

#### Database Connection Exhaustion

```
1. Check connection pool status
2. Identify long-running queries
3. Kill stuck queries if needed
4. Increase pool size temporarily
5. Investigate root cause
```

### Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Main Monitoring | grafana.datasphere.io | System overview |
| API Performance | grafana.datasphere.io/d/api | API metrics |
| Database | grafana.datasphere.io/d/db | Database metrics |
| Security | grafana.datasphere.io/d/security | Security events |

---

## 5. Backup & Recovery Runbook

### Backup Schedule

| Component | Frequency | Retention | Storage |
|-----------|-----------|-----------|---------|
| Database | Hourly | 30 days | S3 |
| File Uploads | Daily | 90 days | S3 |
| Configuration | On change | 1 year | Git |
| Audit Logs | Daily | 7 years | Glacier |

### Backup Verification

```bash
# Verify database backup
pg_restore --list /backups/latest.dump

# Test restore to staging
pg_restore --dbname=datasphere_test /backups/latest.dump
bun run test:integration
```

### Recovery Procedures

#### Database Recovery

```bash
# 1. Stop application
vercel pause datasphere-production

# 2. Create safety backup
pg_dump $DATABASE_URL > /backups/pre_recovery_$(date +%Y%m%d).sql

# 3. Restore from backup
pg_restore --clean --dbname=$DATABASE_URL /backups/target_backup.dump

# 4. Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 5. Resume application
vercel resume datasphere-production
```

#### Point-in-Time Recovery (PostgreSQL)

```bash
# Enable WAL archiving first (in postgresql.conf)
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://backup-bucket/wal/%f'

# Recovery to specific timestamp
pg_restore --target-time="2025-01-15 10:30:00" \
  --dbname=$DATABASE_URL /backups/base_backup.dump
```

---

## 6. Security Incident Runbook

### Security Incident Classification

| Type | Severity | Examples |
|------|----------|----------|
| Data Breach | Critical | Unauthorized data access, data exfiltration |
| Unauthorized Access | High | Compromised credentials, privilege escalation |
| Vulnerability Exploit | High | SQL injection, XSS exploitation |
| DDoS Attack | Medium | Service availability impact |
| Phishing | Low | Employee targeted, no compromise |

### Immediate Response

```
1. CONTAIN
   ├── Isolate affected systems
   ├── Block suspicious IPs
   ├── Revoke compromised credentials
   └── Enable read-only mode if needed

2. ASSESS
   ├── Identify attack vector
   ├── Determine data affected
   ├── Document timeline of events
   └── Preserve evidence

3. NOTIFY
   ├── Inform security team lead
   ├── Notify management (P1)
   ├── Prepare customer notification
   └── Report to authorities if required

4. REMEDIATE
   ├── Apply security patches
   ├── Reset affected credentials
   ├── Update security rules
   └── Enhance monitoring

5. RECOVER
   ├── Verify system integrity
   ├── Restore from clean backup if needed
   ├── Resume normal operations
   └── Monitor for recurrence
```

### Security Checklist

```bash
# Check for suspicious activity
curl https://datasphere.io/api/security/audit?severity=high

# Review failed login attempts
psql $DATABASE_URL -c "SELECT * FROM audit_log 
  WHERE action = 'auth.login' AND status = 'failure' 
  AND timestamp > NOW() - INTERVAL '24 hours';"

# Check IP rules
curl https://datasphere.io/api/security/ip-rules

# Review API key usage
psql $DATABASE_URL -c "SELECT * FROM api_key WHERE last_used > NOW() - INTERVAL '1 hour';"
```

### Contact Information

| Role | Contact | Purpose |
|------|---------|---------|
| Security Lead | security-lead@datasphere.io | Incident commander |
| Legal | legal@datasphere.io | Compliance, breach notification |
| PR/Communications | pr@datasphere.io | Customer communication |
| Cyber Insurance | +1-XXX-XXX-XXXX | Insurance claim |

---

## Appendix A: Quick Reference Commands

```bash
# Application
bun run dev                  # Start development server
bun run build                # Build for production
bun run test                 # Run unit tests
bun run test:e2e             # Run E2E tests
bun run lint                 # Run linter

# Database
bunx prisma migrate dev      # Run migrations
bunx prisma studio           # Open database GUI
bunx prisma db push          # Push schema changes

# Deployment
vercel                       # Deploy to preview
vercel --prod               # Deploy to production
vercel logs --follow        # Stream logs

# Monitoring
curl /api/health             # Health check
curl /api/metrics            # Prometheus metrics
```

## Appendix B: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_DATABASE_URL` | Direct database connection | Yes |
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `SENTRY_DSN` | Sentry error tracking | No |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |

---

*Last Updated: January 2025*
*Document Owner: DevOps Team*
