# ── ALB ingress module ─────────────────────────────────────────────────────
# IAM role (IRSA) + Helm release for the AWS Load Balancer Controller, so
# Kubernetes Ingress objects provision Application Load Balancers.
# ─────────────────────────────────────────────────────────────────────────────

locals {
  common_tags = merge(var.tags, {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "alb-ingress"
  })
  sa_namespace = "kube-system"
  sa_name      = "aws-load-balancer-controller"
}

# Trust policy scoped to the controller's service account (IRSA).
resource "aws_iam_role" "controller" {
  name = "${var.project}-${var.environment}-alb-controller"
  tags = local.common_tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Federated = var.oidc_provider_arn }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(var.oidc_issuer, "https://", "")}:sub" = "system:serviceaccount:${local.sa_namespace}:${local.sa_name}"
        }
      }
    }]
  })
}

# AWS-managed IAM policy for the Load Balancer Controller (least privilege:
# the controller needs ELB/EC2/ACM/WAF describe+write scoped by AWS docs).
resource "aws_iam_role_policy_attachment" "controller" {
  role       = aws_iam_role.controller.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLoadBalancerControllerIAMPolicy"
}

resource "helm_release" "controller" {
  name             = "aws-load-balancer-controller"
  repository       = "https://aws.github.io/eks-charts"
  chart            = "aws-load-balancer-controller"
  version          = var.chart_version
  namespace        = local.sa_namespace
  create_namespace = false

  set {
    name  = "clusterName"
    value = var.cluster_name
  }
  set {
    name  = "serviceAccount.create"
    value = "true"
  }
  set {
    name  = "serviceAccount.name"
    value = local.sa_name
  }
  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.controller.arn
  }
  set {
    name  = "region"
    value = var.region
  }
  set {
    name  = "vpcId"
    value = var.vpc_id
  }
}
