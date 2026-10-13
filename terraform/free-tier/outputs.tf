# ─────────────────────────────────────────────────────────────────────────────
# Free Tier (EC2) outputs — Mokku Journey DevOps
# ─────────────────────────────────────────────────────────────────────────────
output "public_ip" {
  description = "Elastic IP of the app instance."
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "Public URL of the Mokku Journey web app."
  value       = "http://${aws_eip.app.public_ip}"
}

output "api_health_url" {
  description = "Backend health endpoint (proxied through nginx)."
  value       = "http://${aws_eip.app.public_ip}/api/health"
}

output "grafana_url" {
  description = "Grafana dashboard UI (default login admin / <GRAFANA_PASSWORD>)."
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "prometheus_url" {
  description = "Prometheus UI."
  value       = "http://${aws_eip.app.public_ip}:9090"
}

output "ssh_command" {
  description = "SSH command for the instance (replace the key file path)."
  value       = "ssh -i ~/.ssh/<your-key>.pem ec2-user@${aws_eip.app.public_ip}"
}
