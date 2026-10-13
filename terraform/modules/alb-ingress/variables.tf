variable "project" {
  description = "Project name used in tags"
  type        = string
  default     = "raja-journey"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name the controller attaches to"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC id the ALBs are provisioned in"
  type        = string
}

variable "oidc_provider_arn" {
  description = "IAM OIDC provider ARN from the EKS module (IRSA)"
  type        = string
}

variable "oidc_issuer" {
  description = "OIDC issuer URL from the EKS module (IRSA)"
  type        = string
}

variable "chart_version" {
  description = "aws-load-balancer-controller Helm chart version"
  type        = string
  default     = "1.8.1"
}

variable "tags" {
  description = "Extra tags merged into every resource"
  type        = map(string)
  default     = {}
}
