output "controller_role_arn" {
  description = "IAM role ARN used by the AWS Load Balancer Controller"
  value       = aws_iam_role.controller.arn
}

output "controller_release" {
  description = "Helm release name of the controller"
  value       = helm_release.controller.name
}
