# ── IAM module ─────────────────────────────────────────────────────────────
# Least-privilege roles for CI/CD:
#   1. GitHub Actions OIDC role — assumed by workflows (ECR push + EKS deploy).
#   2. Jenkins deploy role      — assumed by the Jenkins agent instance role.
#   3. App IRSA role            — for pods that need AWS APIs (logs, secrets).
# No static access keys are created anywhere.
# ─────────────────────────────────────────────────────────────────────────────

locals {
  common_tags = merge(var.tags, {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "iam"
  })
}

# ── 1. GitHub Actions OIDC provider + role ───────────────────────────────────
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
  tags            = local.common_tags
}

resource "aws_iam_role" "github_actions" {
  name = "${var.project}-${var.environment}-github-actions"
  tags = local.common_tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        # Scoped to THIS repo only — replace <GITHUB_ORG> with your org/user.
        StringLike = { "token.actions.githubusercontent.com:sub" = "repo:<GITHUB_ORG>/tirumala-rajas-mokku-journey:*" }
      }
    }]
  })
}

# ── 2. Jenkins deploy role (assumed by the Jenkins agent instance role) ──────
resource "aws_iam_role" "jenkins" {
  name = "${var.project}-${var.environment}-jenkins-deploy"
  tags = local.common_tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = var.jenkins_agent_role_arn } # e.g. EC2 instance-profile role ARN
      Action    = "sts:AssumeRole"
      Condition = { Bool = { "aws:SecureTransport" = "true" } }
    }]
  })
}

# ── Shared least-privilege deploy policy (ECR push + EKS access) ─────────────
resource "aws_iam_policy" "deploy" {
  name        = "${var.project}-${var.environment}-deploy-policy"
  description = "Least-privilege CI/CD: ECR push/pull + EKS describe + CloudWatch logs"
  tags        = local.common_tags

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ECRPushPull"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "ECRRepoAccess"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability", "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload", "ecr:DescribeImages",
          "ecr:DescribeRepositories", "ecr:InitiateLayerUpload",
          "ecr:PutImage", "ecr:UploadLayerPart"
        ]
        Resource = var.ecr_repository_arns
      },
      {
        Sid      = "EKSDescribe"
        Effect   = "Allow"
        Action   = ["eks:DescribeCluster", "eks:ListClusters", "eks:AccessKubernetesApi"]
        Resource = var.eks_cluster_arn
      },
      {
        Sid      = "CloudWatchLogs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"]
        Resource = "${var.log_group_arn}:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_deploy" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.deploy.arn
}

resource "aws_iam_role_policy_attachment" "jenkins_deploy" {
  role       = aws_iam_role.jenkins.name
  policy_arn = aws_iam_policy.deploy.arn
}

# ── 3. App IRSA role (pods read secrets / write logs) ────────────────────────
resource "aws_iam_role" "app" {
  name = "${var.project}-${var.environment}-app"
  tags = local.common_tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Federated = var.eks_oidc_provider_arn }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(var.eks_oidc_issuer, "https://", "")}:sub" = "system:serviceaccount:${var.app_namespace}:${var.app_service_account}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "app_secrets" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite" # tighten to specific secrets in prod
}
