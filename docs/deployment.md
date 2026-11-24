# Deployment Documentation

## Overview

This guide covers building, containerizing, and deploying the Clinic ERP Backend to production environments.

## Prerequisites

### Production Requirements

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Node.js / Bun | 20+ / 1.1+ | Bun 1.1+ |
| PostgreSQL | 15+ | 16+ with PgBouncer |
| Redis | 7+ | 7.2+ (cluster for HA) |
| Reverse Proxy | - | Nginx / Traefik / Caddy |

### Environment

- `NODE_ENV=production`
- HTTPS termination at reverse proxy
- Secrets managed via secret manager (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## Build Process

### Local Build

```bash
# Install dependencies
bun install --frozen-lockfile

# Generate Prisma client
bun run prisma generate

# Build TypeScript
bun run build
```

Output: `dist/` directory with compiled JavaScript and copied Prisma contract.

### Build Script Details

```json
// package.json
{
  "scripts": {
    "build": "bun run nest build && bun run copy-assets",
    "copy-assets": "node -e \"require('fs').cpSync('src/core/database/prisma/contracts/contract.json', 'dist/core/database/prisma/contracts/contract.json')\""
  }
}
```

### Production Start

```bash
NODE_ENV=production bun dist/main.js
```

---

## Docker

### Multi-stage Dockerfile

```dockerfile
# Dockerfile
# Stage 1: Build
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

# Copy source
COPY . .

# Generate Prisma client
RUN bun run prisma generate

# Build
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1.1-alpine AS runner

WORKDIR /app

# Install production deps only
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/core/database/prisma/contracts ./dist/core/database/prisma/contracts

# Non-root user
USER bun

EXPOSE 3000

CMD ["bun", "dist/main.js"]
```

### Build & Run

```bash
# Build image
docker build -t clinic-erp-back:latest .

# Run container
docker run -d \
  --name clinic-erp-back \
  -p 3000:3000 \
  --env-file .env.production \
  clinic-erp-back:latest
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.dev
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src:/app/src  # Hot reload

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: clinic
      POSTGRES_PASSWORD: clinic
      POSTGRES_DB: clinic_erp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Kubernetes

### Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clinic-erp-back
  labels:
    app: clinic-erp-back
spec:
  replicas: 3
  selector:
    matchLabels:
      app: clinic-erp-back
  template:
    metadata:
      labels:
        app: clinic-erp-back
    spec:
      containers:
        - name: app
          image: clinic-erp-back:latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: clinic-erp-secrets
            - configMapRef:
                name: clinic-erp-config
          readinessProbe:
            httpGet:
              path: /api/health/live
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /api/health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: clinic-erp-back
spec:
  selector:
    app: clinic-erp-back
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: clinic-erp-config
data:
  NODE_ENV: "production"
  PORT: "3000"
  APP_API_PREFIX: "api"
  APP_CORS_ORIGIN: "https://app.clinic-erp.com"
  REDIS_HOST: "redis-cluster"
  REDIS_PORT: "6379"
  BULLMQ_REDIS_URL: "redis://redis-cluster:6379"
```

### Secrets

```yaml
# k8s/secrets.yaml (apply with kubectl create secret generic ...)
apiVersion: v1
kind: Secret
metadata:
  name: clinic-erp-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/clinic_erp?pgbouncer=true"
  JWT_ACCESS_SECRET: "your-32-char-min-secret"
  JWT_REFRESH_SECRET: "your-32-char-min-secret"
  JWT_ACCESS_EXPIRES_IN: "15m"
  JWT_REFRESH_EXPIRES_IN: "90d"
  REDIS_PASSWORD: "redis-password"
  SMTP_URL: "smtp://user:pass@smtp.example.com:587"
  MAIL_TRANSPORT: "smtp"
  MAIL_FROM: "noreply@clinic-erp.com"
  MAIL_FROM_NAME: "Clinic ERP"
  EMAIL_OTP_HASH_SECRET: "32-char-min-secret"
  EMAIL_CODE_MAX_ATTEMPTS: "5"
  EMAIL_REQUEST_LIMIT_PER_HOUR: "5"
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: clinic-erp-back
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  tls:
    - hosts:
        - api.clinic-erp.com
      secretName: clinic-erp-tls
  rules:
    - host: api.clinic-erp.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: clinic-erp-back
                port:
                  number: 80
```

---

## Database Migration Strategy

### Production Migrations

```bash
# Run migrations (idempotent)
bun run prisma migrate deploy

# Verify
bun run prisma migrate status
```

### Zero-Downtime Migrations

1. **Additive only** — Never drop columns in same migration
2. **Backfill** — Add nullable column, backfill, then add NOT NULL
3. **Index concurrently** — `CREATE INDEX CONCURRENTLY` for large tables
4. **Test in staging** — Run against production-scale data

### PgBouncer Configuration

```ini
# pgbouncer.ini
[databases]
clinic_erp = host=postgres port=5432 dbname=clinic_erp

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
max_db_connections = 50
max_user_connections = 50
```

Connection string:
```
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/clinic_erp?pgbouncer=true&connection_limit=20"
```

---

## Redis Configuration

### Cluster Mode (Production)

```yaml
# redis-cluster.yaml
apiVersion: redis.io/v1alpha1
kind: RedisCluster
metadata:
  name: redis-cluster
spec:
  clusterSize: 6
  replicas: 1
  resources:
    limits:
      memory: 2Gi
```

### Connection String

```
BULLMQ_REDIS_URL=redis://redis-cluster:6379
REDIS_URL=redis://redis-cluster:6379
```

---

## Email (SMTP)

### Production Requirements

```env
MAIL_TRANSPORT=smtp
SMTP_URL=smtp://user:password@smtp.sendgrid.net:587
MAIL_FROM=noreply@clinic-erp.com
MAIL_FROM_NAME=Clinic ERP
EMAIL_OTP_HASH_SECRET=32-character-minimum-secret
```

### Providers

| Provider | SMTP Host | Port |
|----------|-----------|------|
| SendGrid | smtp.sendgrid.net | 587 |
| Mailgun | smtp.mailgun.org | 587 |
| AWS SES | email-smtp.us-east-1.amazonaws.com | 587 |
| Postmark | smtp.postmarkapp.com | 587 |

---

## Monitoring & Observability

### Health Checks

```bash
# Liveness (k8s)
curl http://localhost:3000/api/health/live

# Readiness (k8s)
curl http://localhost:3000/api/health
```

### Logging

Structured JSON logs to stdout:

```json
{
  "timestamp": "2024-11-14T10:30:00.000Z",
  "level": "info",
  "message": "Request completed",
  "context": "PatientsController",
  "meta": {
    "requestId": "uuid",
    "method": "GET",
    "path": "/api/patients",
    "statusCode": 200,
    "durationMs": 45
  }
}
```

### Log Aggregation

Forward to:
- **Datadog** / **New Relic** / **Grafana Loki**
- **Elasticsearch** / **OpenSearch**

### Metrics (Planned)

Prometheus metrics endpoint at `/metrics`:
- HTTP request duration
- Queue depth
- Database connection pool
- Cache hit rate

### Distributed Tracing (Planned)

OpenTelemetry integration for:
- Request tracing across services
- Database query spans
- External API calls

---

## Security Hardening

### Network

- Private subnets for app, DB, Redis
- Security groups: app → DB/Redis only
- WAF on ingress (rate limiting, IP blocking)

### Application

```env
# Enforce in production
NODE_ENV=production
MAIL_TRANSPORT=smtp  # file transport rejected
```

### Headers (Helmet)

Already configured in `main.ts`:
- CSP, HSTS, X-Frame-Options, etc.

### Secrets Rotation

1. Rotate JWT secrets quarterly
2. Use separate secrets per environment
3. Monitor for exposed secrets (GitGuardian, TruffleHog)

---

## Backup & Disaster Recovery

### Database

```bash
# Daily logical backup
pg_dump -h $PGHOST -U $PGUSER clinic_erp | gzip > backup_$(date +%F).sql.gz

# Point-in-time recovery (WAL-G, pgBackRest)
# Configure continuous archiving
```

### Redis

```bash
# RDB snapshots (configured in redis.conf)
save 900 1
save 300 10
save 60 10000
```

### Application State

- Stateless (horizontal scaling)
- Sessions in Redis (auto-expire)
- File storage in S3 (versioned bucket)

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run prisma generate
      - run: bun run build
      - run: docker build -t clinic-erp-back:${{ github.sha }} .
      - run: docker push registry.example.com/clinic-erp-back:${{ github.sha }}

  test:
    needs: build
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: clinic_erp_test
        ports: [5432:5432]
      redis:
        image: redis:7
        ports: [6379:6379]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run test:cov
      - run: bun run test:e2e
        env:
          TEST_DATABASE_URL: postgresql://test:test@localhost:5432/clinic_erp_test

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/clinic-erp-back \
            app=registry.example.com/clinic-erp-back:${{ github.sha }}
          kubectl rollout status deployment/clinic-erp-back
```

---

## Scaling Guidelines

| Component | Scaling Trigger | Action |
|-----------|-----------------|--------|
| App Pods | CPU > 70%, latency > 500ms | HPA: min 3, max 20 |
| PostgreSQL | Connections > 80% | PgBouncer, read replicas |
| Redis | Memory > 80% | Cluster add shards |
| BullMQ | Queue depth > 1000 | Add workers |

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: clinic-erp-back-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: clinic-erp-back
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## Rollback Procedure

```bash
# Quick rollback
kubectl rollout undo deployment/clinic-erp-back

# Specific revision
kubectl rollout undo deployment/clinic-erp-back --to-revision=5

# Verify
kubectl rollout status deployment/clinic-erp-back
```

---

## Checklist for Production Release

- [ ] All env vars set in secret manager
- [ ] `NODE_ENV=production`
- [ ] `MAIL_TRANSPORT=smtp` with valid credentials
- [ ] JWT secrets ≥ 32 chars, unique per env
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Health endpoints responding
- [ ] Load test passed
- [ ] Monitoring alerts configured
- [ ] Runbook documented
- [ ] Rollback tested