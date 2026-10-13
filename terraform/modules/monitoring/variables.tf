variable "project" {
  description = "Project name used in naming/tags"
  type        = string
  default     = "raja-journey"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "region" {
  description = "AWS region for dashboard widgets"
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name for node metrics"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB (e.g. app/my-alb/1234567890abcdef) for 5xx alarms; empty disables the alarm dimensions"
  type        = string
  default     = ""
}

variable "alb_5xx_threshold" {
  description = "5xx count per 5 minutes that triggers the alarm"
  type        = number
  default     = 50
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Extra tags merged into every resource"
  type        = map(string)
  default     = {}
}
