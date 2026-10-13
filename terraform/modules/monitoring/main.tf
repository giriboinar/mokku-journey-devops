# ── Monitoring module ──────────────────────────────────────────────────────
# CloudWatch log group + metric alarms (failed health checks via 5xx rate,
# CPU/memory pressure on the EKS nodes) + a basic dashboard.
# Pod-level metrics come from the Helm chart (Prometheus annotations optional).
# ─────────────────────────────────────────────────────────────────────────────

locals {
  common_tags = merge(var.tags, {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "monitoring"
  })
  alarm_prefix = "${var.project}-${var.environment}"
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/eks/${var.project}/${var.environment}"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}

# Alarm: ALB 5xx spike → likely failed health checks / bad deploy.
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${local.alarm_prefix}-alb-5xx-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.alb_5xx_threshold
  alarm_description   = "ALB target 5xx count exceeded — check app health / recent deploy"
  treat_missing_data  = "notBreaching"
  tags                = local.common_tags

  dimensions = { LoadBalancer = var.alb_arn_suffix }
}

# Alarm: node CPU pressure.
resource "aws_cloudwatch_metric_alarm" "node_cpu" {
  alarm_name          = "${local.alarm_prefix}-node-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EKS node CPU > 80% for 15m — consider scaling"
  treat_missing_data  = "notBreaching"
  tags                = local.common_tags

  dimensions = { ClusterName = var.cluster_name }
}

# Alarm: node memory pressure (via Container Insights, when enabled).
resource "aws_cloudwatch_metric_alarm" "node_memory" {
  alarm_name          = "${local.alarm_prefix}-node-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "node_memory_utilization"
  namespace           = "ContainerInsights"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "EKS node memory > 85% for 15m — risk of OOMKilled pods"
  treat_missing_data  = "notBreaching"
  tags                = local.common_tags

  dimensions = { ClusterName = var.cluster_name }
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.alarm_prefix}-overview"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ALB request count & 5xx"
          region = var.region
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          period = 300
          stat   = "Sum"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "EKS node CPU / memory"
          region = var.region
          metrics = [
            ["AWS/EC2", "CPUUtilization", "ClusterName", var.cluster_name],
            ["ContainerInsights", "node_memory_utilization", "ClusterName", var.cluster_name]
          ]
          period = 300
          stat   = "Average"
        }
      }
    ]
  })
}
