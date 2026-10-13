# Mokku Journey DevOps — AWS Free Tier Terraform

This is the **only Terraform path we actually deploy to**. It provisions a
single EC2 `t3.micro` (Free Tier eligible) with everything needed to run the
production stack. The EKS modules under `terraform/modules/` are portfolio /
reference architecture only — they are NOT Free Tier and are never applied.

## What it provisions

| Resource | Detail |
|---|---|
| VPC | `10.0.0.0/16`, DNS hostnames on |
| Public subnet | `10.0.1.0/24` in `var.az` |
| Internet gateway + route table | `0.0.0.0/0` → IGW |
| Security group | 22 (SSH), 80, 443 open; 3000 (Grafana), 9090 (Prometheus) via `monitoring_cidr` |
| EC2 instance | `t3.micro`, Amazon Linux 2023, 30 GB gp3 root volume |
| Elastic IP | stable public IP → your app URL |

On boot, `user_data.sh` installs Docker + Compose v2, clones this repo to
`/opt/mokku-journey-devops`, and runs `docker compose -f docker-compose.prod.yml
up -d --build`, then waits until `/api/health` responds.

## Free Tier cost (while eligible)

| Item | Free Tier allowance | Cost |
|---|---|---|
| EC2 `t3.micro` | 750 hrs/month, 12 months | $0 |
| EBS | 30 GB/month (gp3 counts) | $0 |
| Data transfer | 100 GB/month out | $0 |
| Elastic IP | $0 while attached to a running instance | $0 |

⚠️ The EIP costs ~$0.005/hr **if the instance is stopped** — either keep the
instance running or release the EIP (`terraform destroy` handles this).

## Deploy

```bash
cd terraform/free-tier
terraform init
terraform plan  -var "key_name=<your-ec2-keypair-name>" \
                -var "repo_url=https://github.com/<your-github-username>/mokku-journey-devops.git"
terraform apply -var "key_name=<your-ec2-keypair-name>" \
                -var "repo_url=https://github.com/<your-github-username>/mokku-journey-devops.git"
terraform output   # app_url, api_health_url, grafana_url, prometheus_url, ssh_command
```

Prerequisite: create an EC2 key pair named `<your-ec2-keypair-name>` in the
target region first (AWS Console → EC2 → Key Pairs), and save the `.pem`.

## Locking down

The defaults are lab-convenient, not hardened. Before real use:

```bash
terraform apply \
  -var "key_name=<keypair>" \
  -var "repo_url=<repo-url>" \
  -var "ssh_allowed_cidr=<your-ip>/32" \
  -var "monitoring_cidr=<your-ip>/32"
```

Port 80/443 stay public (it is a public web app). Also change the Grafana
password via the `GRAFANA_PASSWORD` env var before/after first boot
(see the root README).

## Cleanup

```bash
cd terraform/free-tier
terraform destroy -var "key_name=<your-ec2-keypair-name>" -var "repo_url=<repo-url>"
```

This removes the instance, EIP, security group, subnet, IGW, and VPC.
Verify in the console that no EIP is left unattached (those are billed).
