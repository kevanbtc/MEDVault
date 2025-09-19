# MEDVault Infrastructure Deployment Guide

## Quick Start Deployment

### Prerequisites Checklist

```bash
# Required tools installation
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Helm installation
curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar -xzO linux-amd64/helm | sudo tee /usr/local/bin/helm > /dev/null
sudo chmod +x /usr/local/bin/helm

# Terraform installation
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# AWS CLI installation
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Environment Variables Setup

```bash
# Create environment configuration
cat > .env << EOF
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
EKS_CLUSTER_NAME=medvault-production

# Database Configuration  
DB_INSTANCE_CLASS=db.r5.2xlarge
DB_ALLOCATED_STORAGE=100
DB_ENGINE_VERSION=14.9

# Application Configuration
APP_ENVIRONMENT=production
APP_DOMAIN=medvault.example.com
DOCKER_REGISTRY=your-registry.com

# Security Configuration
ENABLE_WAF=true
ENABLE_GUARD_DUTY=true
SSL_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/abcd1234
EOF

# Load environment variables
source .env
```

### Step-by-Step Deployment

#### Phase 1: Infrastructure Provisioning

```bash
# 1. Initialize Terraform
cd terraform/
terraform init

# 2. Plan infrastructure changes
terraform plan -var-file="environments/production.tfvars"

# 3. Apply infrastructure
terraform apply -var-file="environments/production.tfvars" -auto-approve

# 4. Get cluster credentials
aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME

# 5. Verify cluster access
kubectl cluster-info
kubectl get nodes
```

#### Phase 2: Core Services Installation

```bash
# 1. Install NGINX Ingress Controller
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# 2. Install Cert-Manager for SSL
helm upgrade --install cert-manager cert-manager \
  --repo https://charts.jetstack.io \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# 3. Install Istio Service Mesh
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH
istioctl install --set values.defaultRevision=default

# 4. Enable Istio injection
kubectl label namespace default istio-injection=enabled
```

#### Phase 3: Monitoring Stack

```bash
# 1. Add Prometheus Community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 2. Install kube-prometheus-stack
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.enabled=true \
  --set grafana.adminPassword=secure-admin-password

# 3. Install Elasticsearch and Kibana
helm repo add elastic https://helm.elastic.co
helm upgrade --install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace \
  --set replicas=3

helm upgrade --install kibana elastic/kibana \
  --namespace logging \
  --set elasticsearchHosts="http://elasticsearch-master:9200"

# 4. Install Fluentd for log collection
helm repo add fluent https://fluent.github.io/helm-charts
helm upgrade --install fluentd fluent/fluentd \
  --namespace logging \
  --set elasticsearch.host=elasticsearch-master
```

#### Phase 4: Database Setup

```bash
# 1. Create database secrets
kubectl create secret generic database-credentials \
  --from-literal=url="jdbc:postgresql://medvault-db.cluster-xxx.us-east-1.rds.amazonaws.com:5432/medvault" \
  --from-literal=username="medvault_user" \
  --from-literal=password="secure-database-password" \
  --namespace medvault

# 2. Run database migrations
kubectl run db-migration \
  --image=medvault/db-migration:latest \
  --env="DATABASE_URL=$(kubectl get secret database-credentials -o jsonpath='{.data.url}' | base64 -d)" \
  --restart=Never

# 3. Verify migration completion
kubectl logs db-migration
kubectl delete pod db-migration
```

#### Phase 5: Application Deployment

```bash
# 1. Create application namespace
kubectl create namespace medvault
kubectl label namespace medvault istio-injection=enabled

# 2. Deploy MEDVault application
helm upgrade --install medvault ./helm/medvault \
  --namespace medvault \
  --set global.environment=production \
  --set api.image.repository=$DOCKER_REGISTRY/medvault/api \
  --set api.image.tag=latest \
  --set ingress.hosts[0].host=$APP_DOMAIN \
  --wait --timeout=600s

# 3. Verify deployment
kubectl get pods -n medvault
kubectl get services -n medvault
kubectl get ingress -n medvault
```

### Health Checks and Validation

#### Infrastructure Validation
```bash
#!/bin/bash
# validation-script.sh

echo "=== Infrastructure Validation ==="

# Check EKS Cluster
echo "1. EKS Cluster Status:"
aws eks describe-cluster --name $EKS_CLUSTER_NAME --query 'cluster.status'

# Check RDS Database
echo "2. RDS Database Status:"
aws rds describe-db-instances --db-instance-identifier medvault-production --query 'DBInstances[0].DBInstanceStatus'

# Check ElastiCache Redis
echo "3. Redis Cluster Status:"
aws elasticache describe-replication-groups --replication-group-id medvault-redis-production --query 'ReplicationGroups[0].Status'

# Check Load Balancer
echo "4. Load Balancer Status:"
kubectl get services -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Check Certificate Status
echo "5. SSL Certificate Status:"
kubectl get certificates -n medvault

echo "=== Application Validation ==="

# Check pod health
echo "6. Pod Status:"
kubectl get pods -n medvault -o wide

# Check service endpoints
echo "7. Service Endpoints:"
kubectl get endpoints -n medvault

# Test API health
echo "8. API Health Check:"
APP_URL="https://$APP_DOMAIN"
curl -s "$APP_URL/actuator/health" | jq '.status'

# Check database connectivity
echo "9. Database Connectivity:"
kubectl run --rm -i --tty db-test \
  --image=postgres:14 \
  --restart=Never \
  --env="PGPASSWORD=secure-database-password" \
  -- psql -h medvault-db.cluster-xxx.us-east-1.rds.amazonaws.com -U medvault_user -d medvault -c "SELECT 1;"

echo "=== Monitoring Validation ==="

# Check Prometheus targets
echo "10. Prometheus Targets:"
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090 &
sleep 5
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'
kill %1

# Check Grafana accessibility
echo "11. Grafana Status:"
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana

echo "Validation complete!"
```

### Performance Testing

#### Load Testing Configuration
```yaml
# k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function () {
  // Test policy creation
  let policyResponse = http.post('https://api.medvault.example.com/api/v1/policies', {
    applicantName: 'Test User',
    coverageType: 'AUTO',
    coverageAmount: 100000,
  });
  
  check(policyResponse, {
    'policy creation status is 201': (r) => r.status === 201,
    'policy response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test policy retrieval
  let policyId = JSON.parse(policyResponse.body).id;
  let getResponse = http.get(`https://api.medvault.example.com/api/v1/policies/${policyId}`);
  
  check(getResponse, {
    'policy retrieval status is 200': (r) => r.status === 200,
    'policy retrieval time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

#### Run Performance Tests
```bash
# Install k6
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Run load test
k6 run --out json=performance-results.json k6-load-test.js

# Generate performance report
echo "Performance Test Results:"
jq '.metrics.http_req_duration.values' performance-results.json
```

### Security Hardening

#### Security Checklist
```bash
#!/bin/bash
# security-hardening.sh

echo "=== Security Hardening Checklist ==="

# 1. Update all system packages
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Configure network policies
echo "2. Applying network policies..."
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: medvault
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-ingress
  namespace: medvault
spec:
  podSelector:
    matchLabels:
      app: medvault-api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
EOF

# 3. Enable Pod Security Standards
echo "3. Enabling Pod Security Standards..."
kubectl label namespace medvault pod-security.kubernetes.io/enforce=restricted
kubectl label namespace medvault pod-security.kubernetes.io/audit=restricted
kubectl label namespace medvault pod-security.kubernetes.io/warn=restricted

# 4. Configure RBAC
echo "4. Configuring RBAC..."
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: medvault
  name: medvault-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: medvault-rolebinding
  namespace: medvault
subjects:
- kind: ServiceAccount
  name: medvault-api
  namespace: medvault
roleRef:
  kind: Role
  name: medvault-role
  apiGroup: rbac.authorization.k8s.io
EOF

# 5. Scan for vulnerabilities
echo "5. Running security scans..."
kubectl create job security-scan \
  --image=aquasec/trivy:latest \
  -- trivy image medvault/api:latest

echo "Security hardening complete!"
```

### Troubleshooting Guide

#### Common Issues and Solutions

**Issue: Pods stuck in Pending state**
```bash
# Check node resources
kubectl describe nodes
kubectl top nodes

# Check pod events
kubectl describe pod <pod-name> -n medvault

# Check resource requests/limits
kubectl get pods -n medvault -o yaml | grep -A 10 resources
```

**Issue: Database connection failures**
```bash
# Check database status
aws rds describe-db-instances --db-instance-identifier medvault-production

# Test connectivity from pod
kubectl run db-debug --rm -i --tty \
  --image=postgres:14 \
  --restart=Never \
  -- bash

# Inside the pod:
pg_isready -h medvault-db.cluster-xxx.us-east-1.rds.amazonaws.com -p 5432
```

**Issue: High memory usage**
```bash
# Check memory usage by pod
kubectl top pods -n medvault

# Check memory limits
kubectl get pods -n medvault -o jsonpath='{.items[*].spec.containers[*].resources.limits.memory}'

# Adjust memory limits
kubectl patch deployment medvault-api -n medvault -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"memory":"4Gi"}}}]}}}}'
```

**Issue: SSL certificate not working**
```bash
# Check certificate status
kubectl get certificates -n medvault
kubectl describe certificate medvault-tls -n medvault

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Force certificate renewal
kubectl delete certificate medvault-tls -n medvault
kubectl apply -f certificate.yaml
```

### Backup and Recovery Procedures

#### Automated Backup Script
```bash
#!/bin/bash
# backup-script.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="medvault-backups"

echo "=== Starting Backup Process ==="

# 1. Database backup
echo "1. Creating database backup..."
kubectl run db-backup-$TIMESTAMP \
  --image=postgres:14 \
  --env="PGPASSWORD=secure-database-password" \
  --restart=Never \
  -- pg_dump -h medvault-db.cluster-xxx.us-east-1.rds.amazonaws.com \
              -U medvault_user \
              -d medvault \
              -f /tmp/backup_$TIMESTAMP.sql

# Wait for backup to complete
kubectl wait --for=condition=complete pod/db-backup-$TIMESTAMP --timeout=300s

# Copy backup to S3
kubectl cp db-backup-$TIMESTAMP:/tmp/backup_$TIMESTAMP.sql ./backup_$TIMESTAMP.sql
aws s3 cp backup_$TIMESTAMP.sql s3://$S3_BUCKET/database/backup_$TIMESTAMP.sql

# 2. Configuration backup
echo "2. Backing up configurations..."
kubectl get all -o yaml -n medvault > medvault-config-$TIMESTAMP.yaml
aws s3 cp medvault-config-$TIMESTAMP.yaml s3://$S3_BUCKET/config/

# 3. Persistent volume backup
echo "3. Creating volume snapshots..."
aws ec2 create-snapshot \
  --volume-id $(kubectl get pv -o jsonpath='{.items[0].spec.awsElasticBlockStore.volumeID}' | cut -d'/' -f4) \
  --description "MEDVault backup $TIMESTAMP"

# Cleanup
kubectl delete pod db-backup-$TIMESTAMP
rm backup_$TIMESTAMP.sql medvault-config-$TIMESTAMP.yaml

echo "=== Backup Process Complete ==="
```

#### Recovery Procedures
```bash
#!/bin/bash
# recovery-script.sh

BACKUP_DATE="20240101_120000"  # Replace with actual backup date
S3_BUCKET="medvault-backups"

echo "=== Starting Recovery Process ==="

# 1. Download backup files
echo "1. Downloading backup files..."
aws s3 cp s3://$S3_BUCKET/database/backup_$BACKUP_DATE.sql ./
aws s3 cp s3://$S3_BUCKET/config/medvault-config-$BACKUP_DATE.yaml ./

# 2. Restore database
echo "2. Restoring database..."
kubectl run db-restore \
  --image=postgres:14 \
  --env="PGPASSWORD=secure-database-password" \
  --restart=Never \
  -- psql -h medvault-db.cluster-xxx.us-east-1.rds.amazonaws.com \
           -U medvault_user \
           -d medvault \
           -f backup_$BACKUP_DATE.sql

# 3. Restore configuration
echo "3. Restoring configuration..."
kubectl apply -f medvault-config-$BACKUP_DATE.yaml

# 4. Verify restoration
echo "4. Verifying restoration..."
kubectl get pods -n medvault
curl -s https://api.medvault.example.com/actuator/health

echo "=== Recovery Process Complete ==="
```

### Maintenance Schedules

#### Weekly Maintenance Tasks
```yaml
# weekly-maintenance.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: weekly-maintenance
  namespace: medvault
spec:
  schedule: "0 2 * * 0"  # Every Sunday at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: maintenance
            image: medvault/maintenance:latest
            command:
            - /bin/bash
            - -c
            - |
              # Update security patches
              apt update && apt upgrade -y
              
              # Clean up old logs
              find /var/log -name "*.log" -mtime +30 -delete
              
              # Update application dependencies
              npm audit fix --force
              
              # Run database maintenance
              psql $DATABASE_URL -c "VACUUM ANALYZE;"
              psql $DATABASE_URL -c "REINDEX DATABASE medvault;"
              
              # Generate maintenance report
              echo "Weekly maintenance completed on $(date)" > /tmp/maintenance.log
          restartPolicy: OnFailure
```

This comprehensive infrastructure deployment guide provides everything needed to deploy and maintain the MEDVault system in production.