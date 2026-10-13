variable "project" {
  description = "Project name used in tags"
  type        = string
  default     = "raja-journey"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "repositories" {
  description = "ECR repository names to create"
  type        = list(string)
  default     = ["raja-journey-backend", "raja-journey-java-service"]
}

variable "keep_last_n" {
  description = "Number of tagged images retained per repository"
  type        = number
  default     = 20
}

variable "tags" {
  description = "Extra tags merged into every resource"
  type        = map(string)
  default     = {}
}
