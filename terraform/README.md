# Terraform — AWS infrastructure for Raja's Mokku Journey

Provisions a production-style AWS landing zone per environment:

- **VPC** — public + private subnets across 2 AZs, Internet Gateway, NAT Gateway(s), least-privilege security groups, Kubernetes subnet auto-discovery tags.
- **EKS** — managed cluster + managed node group, IRSA (OIDC) enabled, control-plane logs to CloudWatch.
- **ECR** — private repos with scan-on-push, immutable tags, lifecycle policy.
- **ALB ingress** — AWS Load Balancer Controller via Helm with an IRSA-scoped IAM role.
- **IAM** — GitHub Actions OIDC role, Jenkins deploy role, app IRSA role. No static keys.
- **Monitoring** — CloudWatch log group, ALB 5xx / node CPU / node memory alarms, dashboard.

```
terraform/
├── modules/                  # reusable building blocks
│   ├── vpc/                  # network + security groups
│   ├── eks/                  # cluster + node group + IRSA OIDC
│   ├── ecr/                  # container registries
│   ├── alb-ingress/          # AWS Load Balancer Controller
│   ├── iam/                  # CI/CD + app roles (OIDC, least privilege)
│   └── monitoring/           # logs, alarms, dashboard
└── environments/
    ├── dev/                  # cheapest: single NAT, SPOT t3.medium nodes
    ├── staging/              # prod-like: single NAT, ON_DEMAND nodes
    └── production/           # resilient: NAT per AZ, larger node group
```

## Prerequisites

- Terraform >= 1.10, AWS CLI v2, an AWS account with admin (or scoped) rights.
- Replace every `<ACCOUNT_ID>` placeholder and the backend bucket name in each
  environment's `main.tf` before the first apply.

## 0. Bootstrap the remote-state backend (once per AWS account)

The environments expect an **encrypted, versioned S3 bucket** for state. Create
it once (outside Terraform, so state has somewhere to live):

```bash
export AWS_REGION=ap-south-1
export ACCOUNT_ID=<ACCOUNT_ID>          # your 12-digit AWS account id

aws s3api create-bucket \
  --bucket raja-journey-tfstate-${ACCOUNT_ID}-${AWS_REGION} \
  --region ${AWS_REGION} \
  --create-bucket-configuration LocationConstraint=${AWS_REGION}

aws s3api put-bucket-versioning \
  --bucket raja-journey-tfstate-${ACCOUNT_ID}-${AWS_REGION} \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket raja-journey-tfstate-${ACCOUNT_ID}-${AWS_REGION} \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Block all public access (belt and braces — bucket policy denies it anyway)
aws s3api put-public-access-block \
  --bucket raja-journey-tfstate-${ACCOUNT_ID}-${AWS_REGION} \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### State locking — design choice

We use **native S3 state locking** (`use_lockfile = true` in the `backend "s3"`
block, requires Terraform >= 1.10). S3 itself now coordinates the lock, so no
separate lock table is needed.

> Legacy alternative: a DynamoDB table referenced via `dynamodb_table` in the
> backend block. This still works but is deprecated in favour of `use_lockfile`.

If a stale lock ever blocks you (crashed apply), confirm no apply is running,
then: `terraform force-unlock <LOCK_ID>`.

## 1. Deploy an environment (dev → staging → production)

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars   # fill in real values
# ...and edit the backend bucket name in main.tf...

terraform init        # downloads providers, wires the S3 backend
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan        # REVIEW the plan carefully
terraform apply tfplan
```

Production additionally requires an **approved plan** — never `terraform apply -auto-approve`
against production.

## 2. Point kubectl at the new cluster

```bash
aws eks update-kubeconfig --name raja-journey-dev --region ap-south-1
kubectl get nodes
```

## 3. Destroy a test environment (dev/staging)

```bash
cd terraform/environments/dev
terraform plan -destroy -out=tfplan-destroy
terraform destroy tfplan-destroy
```

Empty ECR repositories first if the destroy complains about non-empty repos:
`aws ecr batch-delete-image ...`. Production destroys require explicit approval.

## Cost warnings

AWS bills for real usage. The expensive parts of this stack:

| Resource | Rough cost driver |
|---|---|
| EKS cluster | ~$0.10/hr per cluster (~$73/mo) even idle |
| NAT Gateway | ~$0.045/hr + data processing (~$33–45/mo each; prod has 2) |
| ALB | ~$0.025/hr + LCU charges (~$18–25/mo) |
| EC2 worker nodes | per instance-hour (SPOT in dev saves ~60–70%) |
| EBS volumes, CloudWatch logs | small but non-zero |

Keep dev destroyed when not in use. Tag everything (done by default) and enable
AWS Budgets with an alert at your monthly threshold.

## Security notes

- No access keys anywhere: OIDC for GitHub Actions, instance-profile/IAM roles for Jenkins.
- Security groups are least-privilege (ALB ← internet on 80/443 only; nodes ← ALB NodePorts only).
- State bucket is encrypted, versioned, and public-access-blocked.
- See `docs/security.md` for the full policy.

---

## ✅ Deployable path: terraform/free-tier/ (AWS Free Tier)

The `modules/` and `environments/` directories above describe a **reference
production architecture** (EKS + ALB + NAT) that is **not** Free Tier eligible
and is never applied as part of a real deployment.

To actually deploy **Mokku Journey DevOps** on AWS for $0 (while Free Tier
eligible), use **`terraform/free-tier/`**:

```bash
cd terraform/free-tier
terraform init
terraform apply -var "key_name=<your-ec2-keypair>" \
                -var "repo_url=https://github.com/<your-github-username>/mokku-journey-devops.git"
terraform output   # app_url, api_health_url, grafana_url, prometheus_url
```

It provisions a VPC, public subnet, security group, one `t3.micro` EC2
instance (Amazon Linux 2023, 30 GB gp3), and an Elastic IP — and the instance
boots the full app + monitoring stack itself via `user_data.sh`
(`docker compose -f docker-compose.prod.yml`). See
[`terraform/free-tier/README.md`](free-tier/README.md) for the full guide,
cost table, and lockdown steps.
