# ── staging environment ────────────────────────────────────────────────────
# Mirrors production topology at smaller scale: one NAT gateway, ON_DEMAND
# nodes. Encrypted S3 backend + native S3 state locking (use_lockfile).
# ─────────────────────────────────────────────────────────────────────────────
terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.14"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    # ── REPLACE with your real bucket before first apply ──
    bucket       = "raja-journey-tfstate-<ACCOUNT_ID>-ap-south-1"
    key          = "staging/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project
      Environment = "staging"
      ManagedBy   = "terraform"
    }
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}

data "aws_eks_cluster_auth" "main" {
  name = module.eks.cluster_name
}

module "vpc" {
  source             = "../../modules/vpc"
  project            = var.project
  environment        = "staging"
  vpc_cidr           = var.vpc_cidr
  cluster_name       = var.cluster_name
  single_nat_gateway = true
}

module "eks" {
  source                  = "../../modules/eks"
  project                 = var.project
  environment             = "staging"
  cluster_name            = var.cluster_name
  kubernetes_version      = var.kubernetes_version
  private_subnet_ids      = module.vpc.private_subnet_ids
  nodes_security_group_id = module.vpc.nodes_security_group_id
  node_instance_types     = var.node_instance_types
  node_capacity_type      = "ON_DEMAND"
  node_desired_size       = 2
  node_min_size           = 2
  node_max_size           = 4
}

module "ecr" {
  source      = "../../modules/ecr"
  project     = var.project
  environment = "staging"
}

module "alb_ingress" {
  source            = "../../modules/alb-ingress"
  project           = var.project
  environment       = "staging"
  cluster_name      = module.eks.cluster_name
  region            = var.region
  vpc_id            = module.vpc.vpc_id
  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_issuer       = module.eks.cluster_oidc_issuer
}

module "monitoring" {
  source             = "../../modules/monitoring"
  project            = var.project
  environment        = "staging"
  region             = var.region
  cluster_name       = module.eks.cluster_name
  log_retention_days = 14
}

module "iam" {
  source                = "../../modules/iam"
  project               = var.project
  environment           = "staging"
  ecr_repository_arns   = values(module.ecr.repository_arns)
  eks_cluster_arn       = "arn:aws:eks:${var.region}:<ACCOUNT_ID>:cluster/${module.eks.cluster_name}"
  log_group_arn         = module.monitoring.log_group_arn
  eks_oidc_provider_arn = module.eks.oidc_provider_arn
  eks_oidc_issuer       = module.eks.cluster_oidc_issuer
  app_namespace         = "raja-journey-staging"
}
