output "repository_urls" {
  description = "Map of repository name → registry URL"
  value       = { for k, r in aws_ecr_repository.repos : k => r.repository_url }
}

output "repository_arns" {
  description = "Map of repository name → ARN"
  value       = { for k, r in aws_ecr_repository.repos : k => r.arn }
}
