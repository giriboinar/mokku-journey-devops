# Architecture — Raja's Mokku Journey

## Overview

A containerised FastAPI backend serves the 16-stage interactive pilgrimage
journey; a static vanilla-JS frontend renders it. An optional Spring Boot
service demonstrates polyglot DevOps. Everything runs on Amazon EKS behind an
ALB, with infrastructure managed by Terraform and delivery automated by
Jenkins and GitHub Actions.

See `docs/architecture-diagram.svg` for the visual flow.

## Request flow

```
User browser
  → Route 53 (DNS, your domain) → ALB (TLS termination, ACM cert)
  → Kubernetes Ingress (aws-load-balancer-controller, target-type: ip)
  → ClusterIP Service (port 80 → 8000)
  → FastAPI pods (Deployment, HPA 2–10, PDB, rolling update)
      → GET /api/health, /api/stages, /api/stages/{id}, /api/config
```

The frontend is static HTML/CSS/JS and can be served from the same backend
container, an S3 + CloudFront distribution, or the `frontend` service in
`docker-compose.yml` for local dev.

## Components

| Layer | Technology | Notes |
|---|---|---|
| Frontend | HTML5, CSS3, vanilla JS | Mobile-first, no build step, Telugu/English toggle |
| Backend | Python FastAPI | Stage API, health checks, structured logging, pytest |
| Optional service | Java 21 + Spring Boot (Maven) | Standalone demo module, own Dockerfile |
| Containers | Docker, multi-stage builds | Non-root users, pinned bases, Trivy-scanned |
| Registry | Amazon ECR | Scan-on-push, immutable tags, lifecycle policy |
| Orchestration | Amazon EKS 1.32 | Managed node groups, IRSA, control-plane logs |
| Ingress | AWS Load Balancer Controller | ALB via Kubernetes Ingress |
| IaC | Terraform ≥ 1.10 | Modules: vpc, eks, ecr, alb-ingress, iam, monitoring |
| CI | GitHub Actions | Lint, tests, Trivy, Helm lint, Terraform validate |
| CD | Jenkins declarative pipeline | 15 stages incl. manual prod approval + rollback |
| Observability | CloudWatch (+ optional Prometheus/Grafana) | Dashboards in `monitoring/dashboards/`, alarms in Terraform |

## Environments

| | dev | staging | production |
|---|---|---|---|
| NAT gateways | 1 | 1 | 2 (one per AZ) |
| Nodes | 1–2 × t3.medium SPOT | 2–4 × t3.medium | 2–6 × t3.large ON_DEMAND |
| Replicas | 1 | 1–3 (HPA) | 3–10 (HPA) |
| Log retention | 7 d | 14 d | 30 d |
| Deploy | automatic | automatic (main) | manual approval gate |

## Data & state

- Stage content lives in JSON (`backend/app/data/stages.json`), served by the API — content edits don't require code changes.
- Terraform state: encrypted S3 bucket + native S3 locking (`use_lockfile`).
- No database: the app is stateless; journey progress is client-side.

## Security boundaries

- Public subnets: ALB only. Private subnets: EKS nodes only.
- Security groups: ALB ← internet 80/443; nodes ← ALB NodePorts only.
- IRSA everywhere: pods assume IAM roles via OIDC — no static credentials.
- Secrets: AWS Secrets Manager / Parameter Store, synced with External Secrets; never committed.
- See `docs/security.md`.

## Failure modes & resilience

- Rolling updates (`maxUnavailable: 0`) + PDB keep the site serving during deploys.
- HPA scales pods on CPU/memory; Cluster Autoscaler territory if nodes saturate.
- Failed smoke tests trigger automatic `helm rollback` in both Jenkins and GitHub Actions.
- Multi-AZ subnets + NAT per AZ in production survive a single AZ failure.
