output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "alb_controller_role_arn" {
  value = module.alb_ingress.controller_role_arn
}

output "github_actions_role_arn" {
  description = "Set this as the AWS_ROLE_ARN secret for the staging workflow"
  value       = module.iam.github_actions_role_arn
}

output "app_role_arn" {
  value = module.iam.app_role_arn
}

output "log_group_name" {
  value = module.monitoring.log_group_name
}

output "dashboard_name" {
  value = module.monitoring.dashboard_name
}

output "kubeconfig_command" {
  description = "Command to point kubectl at this cluster"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region}"
}
