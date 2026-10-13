# Mokku Journey DevOps — Ansible deployment

Configures an existing EC2 instance (created by `terraform/free-tier`) and
deploys the app with Docker Compose. Infrastructure is Terraform's job;
Ansible is the configuration/deployment tool here — together they demonstrate
the classic Terraform + Ansible split.

## Prerequisites

- Ansible ≥ 2.15 (`pip install ansible` or your OS package)
- SSH access to the EC2 instance (`.pem` key, `ec2-user`)
- Python 3 on the control machine

## Configure inventory

Edit `inventory/hosts.yml`:

```yaml
app1:
  ansible_host: <your-ec2-elastic-ip>     # from terraform output public_ip
  ansible_user: ec2-user
  ansible_ssh_private_key_file: ~/.ssh/<your-key>.pem
```

## Run

From the `ansible/` directory:

```bash
ansible-playbook -i inventory/hosts.yml playbook.yml \
  -e repo_url=https://github.com/<your-github-username>/mokku-journey-devops.git
```

What it does: installs Docker + Git via `dnf`, enables the Docker service,
installs the Docker Compose v2 plugin, clones/pulls the repo to
`/opt/mokku-journey-devops`, runs `docker compose -f docker-compose.prod.yml
up -d --build`, waits for port 80, then verifies `http://localhost/api/health`
returns 200 (30 retries × 10 s).

## Idempotence

Re-running is safe: `git` pulls only when the remote changed, and `docker
compose up -d` only recreates containers whose images/config changed. The
health check is the final gate — the playbook fails if the API is not up.

## Only ansible.builtin

The playbook uses only `ansible.builtin.*` modules (no Galaxy collections),
so nothing extra needs installing.
