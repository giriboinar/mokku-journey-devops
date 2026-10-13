# Deployment Guide — Raja's Mokku Journey

## 1. Local development

```bash
# Backend API on :8000, frontend on :8080
docker compose up

# With the optional Java service on :8081
docker compose --profile java up

docker compose down
```

Or run the backend directly:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
curl localhost:8000/api/health
```

Serve `frontend/` with any static server (e.g. `python -m http.server 8080`).

## 2. AWS prerequisites

- AWS account (replace every `<ACCOUNT_ID>` placeholder in this repo).
- IAM principal able to create VPC/EKS/ECR/IAM/CloudWatch resources.
- Route 53 hosted zone + ACM certificate for your domain (for TLS on the ALB).
- Bootstrap the Terraform state bucket (see `terraform/README.md` §0).
- GitHub: repository secret `AWS_ROLE_ARN` (from `terraform output github_actions_role_arn`)
  and variable `AWS_REGION`; protect the `production` environment with required reviewers.
- Jenkins: credentials `aws-account-id`, `kubeconfig-staging`, `kubeconfig-production`;
  agent label `docker-agent` with docker, kubectl, helm, terraform, trivy, aws-cli.

## 3. Provision infrastructure (per environment)

```bash
cd terraform/environments/dev   # then staging, then production
cp terraform.tfvars.example terraform.tfvars   # fill in, never commit
terraform init
terraform plan -out=tfplan      # review carefully
terraform apply tfplan
```

Production: apply only an approved plan; never `-auto-approve`.

## 4. EKS access

```bash
aws eks update-kubeconfig --name raja-journey-staging --region ap-south-1
kubectl get nodes
kubectl get pods -A
```

## 5. Deploy the application with Helm

```bash
# Staging
helm upgrade --install raja-journey helm/raja-journey \
  --namespace raja-journey-staging --create-namespace \
  -f helm/raja-journey/values-staging.yaml \
  --set image.repository=<ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/raja-journey-backend \
  --set image.tag=<GIT_SHA> \
  --wait --timeout 10m

# Production (after manual approval)
helm upgrade --install raja-journey helm/raja-journey \
  --namespace raja-journey --create-namespace \
  -f helm/raja-journey/values-production.yaml \
  --set image.repository=<ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/raja-journey-backend \
  --set image.tag=<GIT_SHA> \
  --wait --timeout 10m
```

Validate before deploying:

```bash
helm lint helm/raja-journey -f helm/raja-journey/values-staging.yaml
helm template raja-journey helm/raja-journey -f helm/raja-journey/values-staging.yaml | kubectl apply --dry-run=client -f -
```

Plain-manifest alternative: `kubectl apply -f k8s/` (update the image placeholder first).

## 6. Verify the rollout

```bash
kubectl -n raja-journey rollout status deploy/raja-journey
kubectl -n raja-journey get pods -l app.kubernetes.io/name=raja-journey
SVC_HOST=$(kubectl -n raja-journey get svc raja-journey -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
BASE_URL="http://${SVC_HOST}" ./scripts/smoke-test.sh
```

## 7. Rollback

```bash
helm history raja-journey -n raja-journey
helm rollback raja-journey <REVISION> -n raja-journey
kubectl -n raja-journey rollout status deploy/raja-journey
```

Jenkins and the production GitHub workflow roll back automatically when smoke
tests fail.

## 8. DNS

Point your domain (e.g. `journey.example.com`) at the ALB hostname with a
Route 53 alias record, then set the matching host in the Helm values and
attach your ACM certificate ARN via the ingress annotation.

## 9. Cleanup

See `scripts/cleanup.sh` and `terraform/README.md` §3. Destroy dev/staging
when idle — EKS clusters, NAT gateways and load balancers bill hourly.
