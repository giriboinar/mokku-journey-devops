output "github_actions_role_arn" {
  description = "Role ARN for GitHub Actions OIDC (set as AWS_ROLE_ARN secret)"
  value       = aws_iam_role.github_actions.arn
}

output "jenkins_deploy_role_arn" {
  description = "Role ARN for Jenkins deployments"
  value       = aws_iam_role.jenkins.arn
}

output "app_role_arn" {
  description = "IRSA role ARN for the application pods"
  value       = aws_iam_role.app.arn
}
