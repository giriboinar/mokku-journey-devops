# ─────────────────────────────────────────────────────────────────────────────
# Mokku Journey DevOps — AWS Free Tier deployment (the ONLY path we deploy to)
#
# Provisions a single t3.micro EC2 instance (Free Tier eligible) with a VPC,
# public subnet, internet gateway, security group, and Elastic IP. The app
# stack (frontend + backend + Prometheus + Grafana) boots itself via
# user_data → docker compose -f docker-compose.prod.yml.
# ─────────────────────────────────────────────────────────────────────────────
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ── Base AMI: latest Amazon Linux 2023 (x86_64, Free Tier eligible) ──────────
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Networking ───────────────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name    = "${var.project}-vpc"
    Project = var.project
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name    = "${var.project}-igw"
    Project = var.project
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = var.az
  map_public_ip_on_launch = true

  tags = {
    Name    = "${var.project}-public"
    Project = var.project
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name    = "${var.project}-public-rt"
    Project = var.project
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ── Security group ───────────────────────────────────────────────────────────
# TRADEOFF NOTE: 80/443 are open to the world because this is a public demo
# web app. SSH (22) defaults to 0.0.0.0/0 for lab convenience — tighten
# ssh_allowed_cidr to your IP before real use. Monitoring ports (3000/9090)
# are governed by monitoring_cidr (default open — restrict to your IP too).
resource "aws_security_group" "app" {
  name        = "${var.project}-app-sg"
  description = "Mokku Journey DevOps Free Tier app security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Grafana"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.monitoring_cidr]
  }
  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = [var.monitoring_cidr]
  }

  egress {
    description = "All outbound (dnf, docker pulls, github)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project}-app-sg"
    Project = var.project
  }
}

# ── EC2 instance (t3.micro — Free Tier: 750 hrs/month for 12 months) ──────────
resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = var.key_name

  user_data = templatefile("${path.module}/user_data.sh", {
    repo_url     = var.repo_url
    compose_file = var.compose_file
  })

  root_block_device {
    volume_size           = 30 # Free Tier: 30 GB EBS (gp3) per month
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name    = "${var.project}-app"
    Project = var.project
  }
}

# ── Elastic IP: stable URL that survives instance restarts ────────────────────
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name    = "${var.project}-eip"
    Project = var.project
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
