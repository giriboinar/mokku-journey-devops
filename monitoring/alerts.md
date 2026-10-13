# Alerts — Raja's Mokku Journey

Provisioned by `terraform/modules/monitoring`. Wire an SNS topic / PagerDuty /
Slack webhook to the alarms for paging.

| Alarm | Signal | Threshold | Meaning | First response |
|---|---|---|---|---|
| `raja-journey-<env>-alb-5xx-spike` | ALB `HTTPCode_Target_5XX_Count` | > 50 / 5 min (prod: 25) | App returning server errors | Check recent deploy → `helm history`; tail app logs |
| `raja-journey-<env>-node-cpu-high` | EC2 `CPUUtilization` (cluster) | > 80% for 15 min | Node CPU pressure | Check HPA events; scale node group if sustained |
| `raja-journey-<env>-node-memory-high` | ContainerInsights `node_memory_utilization` | > 85% for 15 min | Node memory pressure, OOMKilled risk | Find memory-hungry pods; raise limits or scale out |

## Recommended additional alerts (add as you grow)

- **Failed liveness/readiness probes**: no direct CloudWatch metric — watch
  `pod_number_of_container_restarts` (Container Insights) or scrape
  `kube_pod_container_status_restarts_total` in Prometheus. Sustained restarts
  = probe or crash problem; see `troubleshooting.md`.
- **HPA at max replicas**: alert when `kube_horizontalpodautoscaler_status_current_replicas == max` for > 15 min — means autoscaling can't keep up.
- **ECR image scan findings**: EventBridge rule on ECR scan completion → SNS when `CRITICAL` findings appear.
- **Terraform drift**: scheduled `terraform plan -detailed-exitcode` in CI; alert on exit code 2.
- **Certificate expiry**: ACM `DaysToExpiry` < 30 days for the ingress certificate.

## Runbook pointers

- 5xx spike right after a deploy → `helm rollback raja-journey -n <ns>` (see Jenkinsfile post-failure block).
- Node pressure → `kubectl top nodes`, then `kubectl -n <ns> top pods --sort-by=memory`.
- Probe failures → `kubectl -n <ns> describe pod <pod>` → check Events, then `troubleshooting.md`.
