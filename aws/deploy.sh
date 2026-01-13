#!/bin/bash

# Magent AWS Deployment Script
# This script deploys the Magent application to AWS using CloudFormation

set -e

# Configuration
ENVIRONMENT=${ENVIRONMENT:-dev}
AWS_REGION=${AWS_REGION:-us-east-1}
STACK_PREFIX="${ENVIRONMENT}-magent"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        error "jq is not installed. Please install it first."
        exit 1
    fi

    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        error "AWS credentials not found. Please configure AWS CLI."
        exit 1
    fi

    log "Prerequisites check passed."
}

# Create S3 bucket for templates (if it doesn't exist)
create_template_bucket() {
    local bucket_name="${STACK_PREFIX}-templates-${AWS_REGION}"

    if aws s3 ls "s3://${bucket_name}" 2>&1 | grep -q 'NoSuchBucket'; then
        log "Creating template bucket: ${bucket_name}"
        aws s3 mb "s3://${bucket_name}" --region "$AWS_REGION"
    else
        log "Template bucket already exists: ${bucket_name}"
    fi

    echo "$bucket_name"
}

# Upload CloudFormation templates to S3
upload_templates() {
    local bucket_name=$1

    log "Uploading CloudFormation templates to S3..."

    aws s3 cp aws/infrastructure.yaml "s3://${bucket_name}/infrastructure.yaml"
    aws s3 cp aws/ecs-services.yaml "s3://${bucket_name}/ecs-services.yaml"
    aws s3 cp aws/pipeline.yaml "s3://${bucket_name}/pipeline.yaml"

    log "Templates uploaded successfully."
}

# Deploy infrastructure stack
deploy_infrastructure() {
    local template_bucket=$1
    local stack_name="${STACK_PREFIX}-infrastructure"

    log "Deploying infrastructure stack: ${stack_name}"

    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$stack_name" --region "$AWS_REGION" &> /dev/null; then
        log "Updating existing infrastructure stack..."
        aws cloudformation update-stack \
            --stack-name "$stack_name" \
            --template-url "https://${template_bucket}.s3.${AWS_REGION}.amazonaws.com/infrastructure.yaml" \
            --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    else
        log "Creating new infrastructure stack..."
        aws cloudformation create-stack \
            --stack-name "$stack_name" \
            --template-url "https://${template_bucket}.s3.${AWS_REGION}.amazonaws.com/infrastructure.yaml" \
            --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    fi

    log "Waiting for infrastructure stack to complete..."
    aws cloudformation wait stack-create-complete --stack-name "$stack_name" --region "$AWS_REGION" 2>/dev/null || \
    aws cloudformation wait stack-update-complete --stack-name "$stack_name" --region "$AWS_REGION"

    log "Infrastructure stack deployed successfully."
}

# Deploy CI/CD pipeline
deploy_pipeline() {
    local template_bucket=$1
    local stack_name="${STACK_PREFIX}-pipeline"

    log "Deploying CI/CD pipeline stack: ${stack_name}"

    # Get GitHub configuration
    if [ -z "$GITHUB_OWNER" ]; then
        read -p "Enter GitHub repository owner: " GITHUB_OWNER
    fi

    if [ -z "$GITHUB_REPO" ]; then
        read -p "Enter GitHub repository name: " GITHUB_REPO
    fi

    if [ -z "$GITHUB_BRANCH" ]; then
        GITHUB_BRANCH="main"
    fi

    if [ -z "$GITHUB_TOKEN" ]; then
        read -s -p "Enter GitHub personal access token: " GITHUB_TOKEN
        echo
    fi

    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$stack_name" --region "$AWS_REGION" &> /dev/null; then
        log "Updating existing pipeline stack..."
        aws cloudformation update-stack \
            --stack-name "$stack_name" \
            --template-url "https://${template_bucket}.s3.${AWS_REGION}.amazonaws.com/pipeline.yaml" \
            --parameters \
                ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
                ParameterKey=GitHubOwner,ParameterValue="$GITHUB_OWNER" \
                ParameterKey=GitHubRepo,ParameterValue="$GITHUB_REPO" \
                ParameterKey=GitHubBranch,ParameterValue="$GITHUB_BRANCH" \
                ParameterKey=GitHubToken,ParameterValue="$GITHUB_TOKEN" \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    else
        log "Creating new pipeline stack..."
        aws cloudformation create-stack \
            --stack-name "$stack_name" \
            --template-url "https://${template_bucket}.s3.${AWS_REGION}.amazonaws.com/pipeline.yaml" \
            --parameters \
                ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
                ParameterKey=GitHubOwner,ParameterValue="$GITHUB_OWNER" \
                ParameterKey=GitHubRepo,ParameterValue="$GITHUB_REPO" \
                ParameterKey=GitHubBranch,ParameterValue="$GITHUB_BRANCH" \
                ParameterKey=GitHubToken,ParameterValue="$GITHUB_TOKEN" \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    fi

    log "Waiting for pipeline stack to complete..."
    aws cloudformation wait stack-create-complete --stack-name "$stack_name" --region "$AWS_REGION" 2>/dev/null || \
    aws cloudformation wait stack-update-complete --stack-name "$stack_name" --region "$AWS_REGION"

    log "CI/CD pipeline deployed successfully."
}

# Get stack outputs
get_stack_outputs() {
    local stack_name=$1

    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs' \
        --output json
}

# Display deployment information
display_info() {
    log "Deployment completed successfully!"
    log ""
    log "Environment: $ENVIRONMENT"
    log "Region: $AWS_REGION"
    log ""

    # Get infrastructure outputs
    local infra_outputs
    infra_outputs=$(get_stack_outputs "${STACK_PREFIX}-infrastructure")

    log "Infrastructure Information:"
    echo "$infra_outputs" | jq -r '.[] | "- \(.OutputKey): \(.OutputValue)"' 2>/dev/null || echo "Unable to retrieve outputs"

    log ""
    log "Next Steps:"
    log "1. Configure your domain DNS to point to the CloudFront distribution"
    log "2. Set up SSL certificate in AWS Certificate Manager"
    log "3. Configure API Gateway custom domain (if needed)"
    log "4. Set up monitoring and alerting in CloudWatch"
    log "5. Configure backup policies for RDS"
}

# Main deployment function
main() {
    log "Starting Magent AWS deployment..."
    log "Environment: $ENVIRONMENT"
    log "Region: $AWS_REGION"

    check_prerequisites

    local template_bucket
    template_bucket=$(create_template_bucket)

    upload_templates "$template_bucket"

    deploy_infrastructure "$template_bucket"

    deploy_pipeline "$template_bucket"

    display_info

    log "Deployment completed successfully! 🎉"
}

# Handle command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --region|-r)
            AWS_REGION="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -e, --environment ENV    Environment (dev, staging, prod) [default: dev]"
            echo "  -r, --region REGION      AWS region [default: us-east-1]"
            echo "  -h, --help              Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  GITHUB_OWNER             GitHub repository owner"
            echo "  GITHUB_REPO              GitHub repository name"
            echo "  GITHUB_BRANCH            GitHub branch [default: main]"
            echo "  GITHUB_TOKEN             GitHub personal access token"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

main