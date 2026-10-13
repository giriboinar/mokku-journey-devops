#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Teardown notes for Raja's Mokku Journey test environments.
#
# Destroys are DESTRUCTIVE and (for production) require explicit approval.
# EKS clusters, NAT gateways, load balancers and EC2 nodes bill HOURLY —
# destroy dev/staging when idle. Never run against production casually.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENV="${1:-dev}"                       # dev | staging | production
REGION="${AWS_REGION:-ap-south-1}"
NAMESPACE="raja-journey"
[[ "$ENV" == "dev" ]] && NAMESPACE="raja-journey-dev"
[[ "$ENV" == "staging" ]] && NAMESPACE="raja-journey-staging"

if [[ "$ENV" == "production" ]]; then
  echo "Refusing to destroy production without explicit confirmation."
  echo "Re-run with: CONFIRM_DESTROY_PRODUCTION=yes $0 production"
  [[ "${CONFIRM_DESTROY_PRODUCTION:-}" == "yes" ]] || exit 1
fi

echo "=== 1. Uninstall the Helm release ($ENV) ==="
helm uninstall raja-journey -n "$NAMESPACE" || true

echo "=== 2. Empty ECR repositories (Terraform cannot delete non-empty repos) ==="
for repo in raja-journey-backend raja-journey-java-service; do
  images=$(aws ecr list-images --repository-name "$repo" --region "$REGION" \
             --query 'imageIds' --output json 2>/dev/null || echo "[]")
  if [[ "$images" != "[]" ]]; then
    echo "Deleting images from $repo ..."
    aws ecr batch-delete-image --repository-name "$repo" --region "$REGION" \
      --image-ids "$images" >/dev/null
  fi
done

echo "=== 3. Terraform destroy ($ENV) ==="
cd "$(dirname "$0")/../terraform/environments/$ENV"
terraform init
terraform plan -destroy -out=tfplan-destroy
echo "Review the destroy plan above."
read -r -p "Type 'destroy' to continue: " answer
[[ "$answer" == "destroy" ]] || { echo "Aborted."; exit 1; }
terraform apply tfplan-destroy

echo "=== 4. (Optional) Delete the remote-state bucket ==="
echo "Only if you are tearing down EVERYTHING for this AWS account:"
echo "  aws s3 rb s3://raja-journey-tfstate-<ACCOUNT_ID>-${REGION} --force"
echo
echo "Cleanup of '$ENV' complete."
