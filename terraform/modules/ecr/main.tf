# ── ECR module ─────────────────────────────────────────────────────────────
# Private repositories with image scanning on push, AES-256 encryption,
# and a lifecycle policy that keeps the last N tagged images.
# ─────────────────────────────────────────────────────────────────────────────

locals {
  common_tags = merge(var.tags, {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "ecr"
  })
}

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repositories)

  name                 = each.value
  image_tag_mutability = "IMMUTABLE" # tagged releases can never be overwritten

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(local.common_tags, { Name = each.value })
}

resource "aws_ecr_lifecycle_policy" "keep_last" {
  for_each   = aws_ecr_repository.repos
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the last ${var.keep_last_n} tagged images"
      selection = {
        tagStatus   = "tagged"
        tagPatternList = ["*"]
        countType   = "imageCountMoreThan"
        countNumber = var.keep_last_n
      }
      action = { type = "expire" }
    }]
  })
}
