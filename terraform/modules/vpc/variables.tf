variable "project" {
  description = "Project name used in resource naming/tags"
  type        = string
  default     = "raja-journey"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_name" {
  description = "EKS cluster name — used for Kubernetes subnet discovery tags"
  type        = string
}

variable "single_nat_gateway" {
  description = "true = one NAT GW for all AZs (cheaper, dev); false = one per AZ (prod)"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Extra tags merged into every resource"
  type        = map(string)
  default     = {}
}
