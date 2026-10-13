# Troubleshooting — Raja's Mokku Journey

## Pods

### CrashLoopBackOff
The container starts then exits repeatedly.
1. `kubectl -n <ns> logs <pod> --previous` — read the crash message.
2. Common causes: bad config/env var, missing stage-data file (`STAGE_DATA_PATH`),
   port mismatch (app must listen on **8000**), unhandled exception on startup.
3. `kubectl -n <ns> describe pod <pod>` → check exit codes and Events.
4. Fix config or image, redeploy; the Deployment's rolling update keeps old pods alive.

### ImagePullBackOff / ErrImagePull
1. Verify the image exists: `aws ecr describe-images --repository-name raja-journey-backend --image-ids imageTag=<TAG>`.
2. Check node IAM: nodes need `AmazonEC2ContainerRegistryReadOnly` (wired in `terraform/modules/eks`).
3. Check tag mutability: tags are **IMMUTABLE** — a failed push with an existing tag means the pipeline reused a tag; use the commit-SHA tag.
4. `kubectl -n <ns> describe pod <pod>` shows the exact registry error.

### Failed liveness / readiness probes
1. `kubectl -n <ns> describe pod <pod>` → Events show probe failures with HTTP codes.
2. Port 8000 must serve `GET /api/health` returning 2xx within the probe timeouts
   (liveness: 20s initial delay; readiness: 10s; startup: 12 × 5s).
3. Slow cold starts → raise `startupProbe.failureThreshold`, not the liveness delay.
4. A failing **readiness** probe removes the pod from the Service (traffic stops, pod lives);
   a failing **liveness** probe restarts it. Don't confuse the two.

### OOMKilled (exit code 137)
Raise `resources.limits.memory` in values, or find the leak with `kubectl top pods`.

### Pending pods
`kubectl -n <ns> describe pod <pod>` → likely insufficient CPU/memory on nodes
(HPA scaled pods faster than nodes) or a restrictive nodeSelector/toleration.

## Networking

### Unhealthy ALB targets
1. Target group health checks must match the readiness probe path (`/api/health`, port 8000 traffic port).
2. With `target-type: ip`, pods need the VPC CNI with enough IPs per node.
3. Security groups: ALB SG → node SG NodePort range 30000–32767 (wired in `terraform/modules/vpc`).

### Ingress returns 404 / 503
- 404: check `ingress.hosts[].host` matches the DNS record and `pathType: Prefix`.
- 503: Service selector mismatch — `kubectl -n <ns> get endpoints raja-journey`.

## Helm

```bash
helm lint helm/raja-journey -f helm/raja-journey/values-staging.yaml
helm template raja-journey helm/raja-journey -f helm/raja-journey/values-staging.yaml | kubectl apply --dry-run=client -f -
helm history raja-journey -n <ns>
helm rollback raja-journey <REVISION> -n <ns>
```

## Terraform

### `terraform plan` fails
- "Backend initialization required" → run `terraform init` (or `-reconfigure` after backend edits).
- State lock held → confirm no apply is running, then `terraform force-unlock <LOCK_ID>`.
- Provider version conflicts → `terraform init -upgrade`, then re-run plan.

### `terraform apply` fails halfway
- Never hand-edit state; fix the config and re-run `terraform plan`/`apply`.
- EKS cluster creation is slow (10–20 min) — don't Ctrl-C; let it finish or `terraform apply -refresh-only` first.

## ECR / pipeline

- Push denied → the CI role needs the deploy policy from `terraform/modules/iam`
  and `aws ecr get-login-password` must target the right region.
- Trivy `HIGH,CRITICAL` findings fail the Jenkins gate by design — fix the base
  image or dependency, don't bypass the gate.
