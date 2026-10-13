variable "project" {
  description = "Project name used in naming/tags"
  type        = string
  default     = "raja-journey"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "jenkins_agent_role_arn" {
  description = "ARN of the Jenkins agent instance-profile role allowed to assume the deploy role (placeholder OK until wired)"
  type        = string
  default     = "arn:aws:iam::<ACCOUNT_ID>:role/jenkins-agent"
}

variable "ecr_repository_arns" {
  description = "ECR repository ARNs the deploy roles may push to"
  type        = list(string)
}

variable "eks_cluster_arn" {
  description = "EKS cluster ARN the deploy roles may access"
  type        = string
}

variable "log_group_arn" {
  description = "CloudWatch log group ARN for deploy logs"
  type        = string
}

variable "eks_oidc_provider_arn" {
  description = "EKS cluster OIDC provider ARN (for the app IRSA role)"
  type        = string
}

variable "eks_oidc_issuer" {
  description = "EKS cluster OIDC issuer URL (for the app IRSA role)"
  type        = string
}

variable "app_namespace" {
  description = "Kubernetes namespace of the app service account"
  type        = string
  default     = "raja-journey"
}

variable "app_service_account" {
  description = "Kubernetes service account name bound to the app IRSA role"
  type        = string
  default     = "raja-journey"
}

variable "tags" {
  description = "Extra tags merged into every resource"
  type        = map(string)
  default     = {}
}
