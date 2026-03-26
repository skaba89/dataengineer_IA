# DataSphere Innovation - Disaster Recovery Plan

## Overview

This document outlines the disaster recovery procedures for DataSphere Innovation's production infrastructure.

## Recovery Time Objectives (RTO)

| Service | RTO | RPO |
|---------|-----|-----|
| Web Application | 15 minutes | 0 (stateless) |
| PostgreSQL Database | 1 hour | 5 minutes |
| Redis Cache | 5 minutes | 0 (transient) |
| Object Storage | 2 hours | 0 (replicated) |

## Recovery Procedures

### 1. Application Failure

#### Symptoms
- 503 Service Unavailable
- Health check failures
- High error rates

#### Recovery Steps

```bash
# 1. Check pod status
kubectl get pods -n datasphere -l component=web

# 2. Check pod logs
kubectl logs -n datasphere -l component=web --tail=100

# 3. Force rollout restart
kubectl rollout restart deployment/datasphere-app -n datasphere

# 4. Scale up if needed
kubectl scale deployment datasphere-app --replicas=5 -n datasphere

# 5. Monitor rollout
kubectl rollout status deployment/datasphere-app -n datasphere
```

### 2. Database Failure

#### Symptoms
- Connection timeouts
- Query failures
- High latency

#### Recovery Steps

```bash
# 1. Check PostgreSQL status
kubectl get pods -n datasphere -l component=database
kubectl exec -n datasphere postgres-0 -- pg_isready

# 2. Check replication status
kubectl exec -n datasphere postgres-0 -- psql -c "SELECT * FROM pg_stat_replication;"

# 3. Failover to replica (if using replication)
kubectl exec -n datasphere postgres-replica-0 -- pg_ctl promote

# 4. Restore from backup if needed
# Download latest backup
aws s3 cp s3://datasphere-backups/postgres/latest.sql.gz /tmp/

# Restore
kubectl cp /tmp/latest.sql.gz datasphere/postgres-0:/tmp/
kubectl exec -n datasphere postgres-0 -- gunzip -c /tmp/latest.sql.gz | psql

# 5. Verify data integrity
kubectl exec -n datasphere postgres-0 -- psql -c "SELECT COUNT(*) FROM users;"
```

### 3. Redis Failure

#### Symptoms
- Session issues
- Cache misses
- Rate limiting failures

#### Recovery Steps

```bash
# 1. Check Redis status
kubectl get pods -n datasphere -l component=cache
kubectl exec -n datasphere redis-xxx -- redis-cli ping

# 2. Restart Redis
kubectl rollout restart deployment/redis -n datasphere

# 3. Clear corrupt cache if needed
kubectl exec -n datasphere redis-xxx -- redis-cli FLUSHALL

# 4. Verify cache is working
kubectl exec -n datasphere redis-xxx -- redis-cli INFO stats
```

### 4. Complete Region Failure

#### Recovery Steps

```bash
# 1. Activate DR region
# Update DNS to point to DR region
aws route53 change-resource-record-sets --hosted-zone-id $ZONE_ID --change-batch file://dr-dns.json

# 2. Scale up DR cluster
kubectl scale deployment datasphere-app --replicas=5 -n datasphere

# 3. Restore database from backup
aws s3 cp s3://datasphere-backups/postgres/latest.sql.gz /tmp/
kubectl cp /tmp/latest.sql.gz datasphere/postgres-0:/tmp/

# 4. Verify all services
curl https://datasphere.io/api/health

# 5. Notify stakeholders
./scripts/notify-incident.sh "DR activated"
```

## Backup Verification

### Daily Backup Check

```bash
#!/bin/bash
# Check backup exists and is recent
BACKUP_DATE=$(aws s3 ls s3://datasphere-backups/postgres/ | tail -1 | awk '{print $1}')
TODAY=$(date +%Y-%m-%d)

if [ "$BACKUP_DATE" != "$TODAY" ]; then
  echo "ERROR: Backup is not from today!"
  exit 1
fi

# Verify backup integrity
aws s3 cp s3://datasphere-backups/postgres/latest.sql.gz - | gunzip | head -10

echo "Backup verification complete"
```

### Monthly DR Test

1. Restore backup to test environment
2. Verify data integrity
3. Run smoke tests
4. Document results
5. Update procedures if needed

## Contact Information

### Escalation Path

1. **L1 - Operations Team**: ops@datasphere.io
2. **L2 - Engineering Lead**: eng-lead@datasphere.io
3. **L3 - CTO**: cto@datasphere.io

### External Contacts

- **AWS Support**: Premium Support Portal
- **PagerDuty**: https://datasphere.pagerduty.com
- **Status Page**: https://status.datasphere.io

## Runbook Index

1. [Application Deployment](./application-deployment.md)
2. [Database Maintenance](./database-maintenance.md)
3. [Scaling Operations](./scaling-operations.md)
4. [Security Incident Response](./security-incident.md)
5. [Performance Troubleshooting](./performance-troubleshooting.md)
