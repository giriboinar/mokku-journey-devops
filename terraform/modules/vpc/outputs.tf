output "vpc_id" {
  description = "VPC id"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet ids (ALB lives here)"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet ids (EKS nodes live here)"
  value       = aws_subnet.private[*].id
}

output "alb_security_group_id" {
  description = "Security group for the ALB"
  value       = aws_security_group.alb.id
}

output "nodes_security_group_id" {
  description = "Security group for EKS worker nodes"
  value       = aws_security_group.nodes.id
}
