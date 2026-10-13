variable "project" {
  description = "Project name used in resource naming/tags"
  type        = string
  default     = "raja-journey"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes control-plane version"
  type        = string
  default     = "1.32"
}

variable "private_subnet_ids" {
  description = "Private subnet ids for the cluster and nodes"
  type        = list(string)
}

variable "nodes_security_group_id" {
  description = "Security group attached to worker nodes"
  type        = string
}

variable "public_endpoint" {
  description = "Expose the EKS public API endpoint (false = private only, needs VPN/bastion)"
  type        = bool
  default     = true
}

variable "node_instance_types" {
  description = "EC2 instance types for the managed node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_capacity_type" {
  description = "ON_DEMAND or SPOT"
  type        = string
  default     = "ON_DEMAND"
}

variable "node_desired_size" {
  type        = number
  default     = 2
  description = "Desired node count"
}

variable "node_min_size" {
  type        = number
  default     = 1
  description = "Minimum node count"
}

variable "node_max_size" {
  type        = number
  default     = 4
  description = "Maximum node count"
}

variable "tags" {
  description = "Extra tags merged into every resource"
  type        = map(string)
  default     = {}
}
