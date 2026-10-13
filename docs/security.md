# Security — Raja's Mokku Journey

## Golden rules

1. **No secrets in Git.** Not in code, not in Helm values, not in Terraform, not in the Jenkinsfile.
2. **No static AWS keys.** OIDC for GitHub Actions, IAM roles for Jenkins agents and pods.
3. **Least privilege everywhere.** Every IAM role and security group grants the minimum it needs.

## Authentication & authorization

| Surface | Mechanism |
|---|---|
| GitHub Actions → AWS | OIDC (`token.actions.githubusercontent.com`), `role-to-assume: ${{ secrets.AWS_ROLE_ARN }}`, scoped to this repo via `sub` condition |
| Jenkins → AWS | Agent instance-profile role assumes the deploy role (`terraform/modules/iam`) |
| Pods → AWS | IRSA: ServiceAccount annotated with the app role ARN (OIDC trust, namespace+SA-scoped) |
| Humans → EKS | `aws eks update-kubeconfig` with personal IAM credentials / SSO |
| ALB → pods | Security groups: ALB SG → node SG on NodePorts only |

## Secrets handling

- Runtime secrets live in **AWS Secrets Manager** (or SSM Parameter Store).
- Sync to Kubernetes with the **External Secrets Operator** (`ClusterSecretStore` → `ExternalSecret`).
- The `helm/raja-journey/templates/secrets.yaml` template renders only with
  `secrets.create=true` and contains placeholders — never real values.
- `.gitignore` blocks `.env`, `*.pem`, `*.key`, `secrets*.yaml`, `*.tfvars`, `*.tfstate`.
- Rotate secrets on a schedule; enable Secrets Manager rotation where supported.

## Container & supply-chain security

- Multi-stage Dockerfiles, minimal base images, pinned versions, non-root users.
- ECR scan-on-push + immutable tags + lifecycle policy (`terraform/modules/ecr`).
- Trivy gates the Jenkins pipeline on HIGH/CRITICAL; CI uploads SARIF to GitHub code scanning.
- `pip-audit` and Bandit run on every PR.

## Network security

- ALB is the only internet-facing entry point (80/443).
- Nodes in private subnets; EKS API endpoint can be made private (`public_endpoint = false`).
- Security groups deny by default; only documented flows are allowed.

## Data & state security

- Terraform state: S3 with SSE, versioning, public-access-block, native locking.
- CloudWatch logs encrypted at rest by default; retention is bounded per environment.
- Frontend ships no secrets; the app is stateless (progress is client-side).

## Audit & incident response

- EKS control-plane audit logs → CloudWatch (`enabled_cluster_log_types`).
- CloudTrail should be enabled at the account level (outside this repo's scope).
- On a suspected credential leak: revoke/rotate immediately, check CloudTrail,
  purge from git history (BFG / filter-repo) — and treat the secret as compromised.

## What NOT to do

- Don't `kubectl create secret` with `--from-literal` in shared shell history without care.
- Don't paste ARNs with real account IDs into public docs — keep `<ACCOUNT_ID>` placeholders.
- Don't disable the Trivy gate or `helm rollback` on failure to "ship faster".
