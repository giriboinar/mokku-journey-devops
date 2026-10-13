# ─────────────────────────────────────────────────────────────────────────────
# Free Tier (EC2) input variables — Mokku Journey DevOps
# ─────────────────────────────────────────────────────────────────────────────
variable "region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "ap-south-1"
}

variable "az" {
  description = "Availability zone for the single public subnet."
  type        = string
  default     = "ap-south-1a"
}

variable "project" {
  description = "Project name used for resource naming and tags."
  type        = string
  default     = "mokku-journey-devops"
}

variable "key_name" {
  description = "Name of an EXISTING EC2 key pair in var.region (create one in the AWS console first)."
  type        = string
  # No default on purpose — you must supply your real key pair name.
}

variable "repo_url" {
  description = "Git repository cloned onto the instance by user_data. Replace EXAMPLE with your GitHub username/org."
  type        = string
  default     = "https://github.com/EXAMPLE/mokku-journey-devops.git"
}

variable "compose_file" {
  description = "Compose file (inside the repo) used for the production stack."
  type        = string
  default     = "docker-compose.prod.yml"
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH (port 22). Default is open for lab convenience — set to your IP, e.g. 203.0.113.7/32."
  type        = string
  default     = "0.0.0.0/0"
}

variable "monitoring_cidr" {
  description = "CIDR allowed to reach Grafana (3000) and Prometheus (9090). Restrict to your IP for real use."
  type        = string
  default     = "0.0.0.0/0"
}
