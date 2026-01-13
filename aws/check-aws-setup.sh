#!/bin/bash

# Magent AWS Account Validation Script
# This script checks your AWS account setup for Magent deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check AWS CLI installation
check_aws_cli() {
    log "Checking AWS CLI installation..."
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first:"
        echo "  curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\""
        echo "  unzip awscliv2.zip"
        echo "  sudo ./aws/install"
        exit 1
    fi

    AWS_VERSION=$(aws --version | cut -d' ' -f1 | cut -d'/' -f2)
    log "AWS CLI version: $AWS_VERSION"
}

# Check AWS credentials
check_credentials() {
    log "Checking AWS credentials..."
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Please run:"
        echo "  aws configure"
        exit 1
    fi

    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    REGION=$(aws configure get region)

    log "Account ID: $ACCOUNT_ID"
    log "Region: $REGION"
    log "User ARN: $USER_ARN"
}

# Check required permissions
check_permissions() {
    log "Checking AWS permissions..."

    # Test CloudFormation permissions
    if aws cloudformation list-stacks &> /dev/null; then
        log "✅ CloudFormation permissions: OK"
    else
        warn "❌ CloudFormation permissions: FAILED"
        echo "  Required: cloudformation:*"
    fi

    # Test ECS permissions
    if aws ecs list-clusters &> /dev/null; then
        log "✅ ECS permissions: OK"
    else
        warn "❌ ECS permissions: FAILED"
        echo "  Required: ecs:*"
    fi

    # Test ECR permissions
    if aws ecr describe-repositories &> /dev/null; then
        log "✅ ECR permissions: OK"
    else
        warn "❌ ECR permissions: FAILED"
        echo "  Required: ecr:*"
    fi

    # Test S3 permissions
    if aws s3 ls &> /dev/null; then
        log "✅ S3 permissions: OK"
    else
        warn "❌ S3 permissions: FAILED"
        echo "  Required: s3:*"
    fi

    # Test IAM permissions
    if aws iam list-users &> /dev/null; then
        log "✅ IAM permissions: OK"
    else
        warn "❌ IAM permissions: FAILED"
        echo "  Required: iam:*"
    fi
}

# Check free tier usage
check_free_tier() {
    log "Checking Free Tier usage..."

    REGION=$(aws configure get region)

    # Check EC2 instances
    EC2_COUNT=$(aws ec2 describe-instances --query 'length(Reservations[])' --output text)
    if [ "$EC2_COUNT" -eq 0 ]; then
        log "✅ EC2 instances: $EC2_COUNT (Free tier: OK)"
    else
        warn "⚠️  EC2 instances: $EC2_COUNT (Check free tier usage)"
    fi

    # Check RDS instances
    RDS_COUNT=$(aws rds describe-db-instances --query 'length(DBInstances[])' --output text 2>/dev/null || echo "0")
    if [ "$RDS_COUNT" -eq 0 ]; then
        log "✅ RDS instances: $RDS_COUNT (Free tier: OK)"
    else
        warn "⚠️  RDS instances: $RDS_COUNT (Check free tier usage)"
    fi

    # Check ECS clusters
    ECS_COUNT=$(aws ecs list-clusters --query 'length(clusterArns[])' --output text)
    if [ "$ECS_COUNT" -eq 0 ]; then
        log "✅ ECS clusters: $ECS_COUNT (Free tier: OK)"
    else
        warn "⚠️  ECS clusters: $ECS_COUNT (Check free tier usage)"
    fi

    # Check S3 buckets
    S3_COUNT=$(aws s3 ls | wc -l)
    if [ "$S3_COUNT" -lt 10 ]; then
        log "✅ S3 buckets: $S3_COUNT (Free tier: OK)"
    else
        warn "⚠️  S3 buckets: $S3_COUNT (Monitor free tier usage)"
    fi
}

# Check region for free tier
check_region() {
    REGION=$(aws configure get region)
    if [ "$REGION" = "us-east-1" ]; then
        log "✅ Region: $REGION (Free tier optimized)"
    else
        warn "⚠️  Region: $REGION (Free tier is region-specific)"
        echo "  Consider using us-east-1 for maximum free tier benefits"
    fi
}

# Generate deployment command
generate_commands() {
    log "Generating deployment commands..."

    cat << EOF

🚀 Ready to deploy Magent to AWS!

Run these commands in order:

1. Set environment variables:
   export AWS_REGION=$(aws configure get region)
   export ENVIRONMENT=dev
   export GITHUB_OWNER=leduyenminh
   export GITHUB_REPO=magent
   export GITHUB_BRANCH=main
   export GITHUB_TOKEN=your_github_token_here

2. Run deployment:
   cd /workspaces/magent
   chmod +x aws/deploy.sh
   ./aws/deploy.sh

3. After deployment, get your application URLs:
   CLOUDFRONT_URL=\$(aws cloudformation describe-stacks --stack-name dev-magent-infrastructure --query 'Stacks[0].Outputs[?OutputKey==\`CloudFrontDistributionURL\`].OutputValue' --output text)
   ALB_DNS=\$(aws cloudformation describe-stacks --stack-name dev-magent-infrastructure --query 'Stacks[0].Outputs[?OutputKey==\`ALBDNSName\`].OutputValue' --output text)
   echo "Frontend: \$CLOUDFRONT_URL"
   echo "API: http://\$ALB_DNS"

📝 Don't forget to:
- Get your GitHub token from: https://github.com/settings/tokens
- Set up API keys in AWS Secrets Manager after deployment
- Monitor your free tier usage at: https://console.aws.amazon.com/billing/home?#/freetier

EOF
}

# Main function
main() {
    echo "🔍 Magent AWS Account Validation"
    echo "================================="
    echo ""

    check_aws_cli
    echo ""

    check_credentials
    echo ""

    check_region
    echo ""

    check_permissions
    echo ""

    check_free_tier
    echo ""

    generate_commands
}

# Run main function
main