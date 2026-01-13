#!/bin/bash

# AWS Cost Monitoring Script for Magent
# Helps track free tier usage and costs

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

# Check if AWS CLI is configured
check_aws() {
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI not configured. Run 'aws configure' first."
        exit 1
    fi
}

# Get current month costs
get_monthly_costs() {
    log "Getting current month AWS costs..."

    # Get current month start and end dates
    START_DATE=$(date +%Y-%m-01)
    END_DATE=$(date +%Y-%m-%d)

    echo "Cost period: $START_DATE to $END_DATE"
    echo "----------------------------------------"

    # Get costs by service
    aws ce get-cost-and-usage \
        --time-period Start=$START_DATE,End=$END_DATE \
        --granularity MONTHLY \
        --metrics "BlendedCost" \
        --group-by Type=DIMENSION,Key=SERVICE \
        --query 'ResultsByTime[0].Groups[].[Dimensions[0].Key, Metrics.BlendedCost.Amount]' \
        --output text 2>/dev/null | \
    while read -r service cost; do
        if [ "$service" != "None" ] && [ "$cost" != "0" ]; then
            printf "%-25s \$%s\n" "$service" "$cost"
        fi
    done | sort -k2 -nr

    echo ""
}

# Check free tier usage
check_free_tier_usage() {
    log "Checking Free Tier usage status..."

    # ECS Fargate usage (750 hours free)
    ECS_TASKS=$(aws ecs list-tasks --cluster dev-magent-cluster --query 'length(taskArns[])' --output text 2>/dev/null || echo "0")
    if [ "$ECS_TASKS" -gt 0 ]; then
        info "ECS Tasks running: $ECS_TASKS (Free tier: 750 hours/month)"
    fi

    # RDS usage (750 hours free)
    RDS_INSTANCES=$(aws rds describe-db-instances --query 'length(DBInstances[?DBInstanceStatus==`available`])' --output text 2>/dev/null || echo "0")
    if [ "$RDS_INSTANCES" -gt 0 ]; then
        info "RDS Instances: $RDS_INSTANCES (Free tier: 750 hours/month)"
    fi

    # S3 usage
    S3_BUCKETS=$(aws s3 ls | wc -l)
    info "S3 Buckets: $S3_BUCKETS (Free tier: 5GB storage + 20K requests)"

    # ECR repositories
    ECR_REPOS=$(aws ecr describe-repositories --query 'length(repositories[])' --output text 2>/dev/null || echo "0")
    info "ECR Repositories: $ECR_REPOS (Free tier: 500MB storage)"

    echo ""
}

# Get resource counts
get_resource_counts() {
    log "Current AWS resource counts:"

    # CloudFormation stacks
    CF_STACKS=$(aws cloudformation list-stacks --query 'length(StackSummaries[?StackStatus!=`DELETE_COMPLETE`])' --output text)
    info "CloudFormation stacks: $CF_STACKS"

    # ECS clusters
    ECS_CLUSTERS=$(aws ecs list-clusters --query 'length(clusterArns[])' --output text)
    info "ECS clusters: $ECS_CLUSTERS"

    # ECR repositories
    ECR_REPOS=$(aws ecr describe-repositories --query 'length(repositories[])' --output text 2>/dev/null || echo "0")
    info "ECR repositories: $ECR_REPOS"

    # S3 buckets
    S3_BUCKETS=$(aws s3 ls | wc -l)
    info "S3 buckets: $S3_BUCKETS"

    # RDS instances
    RDS_INSTANCES=$(aws rds describe-db-instances --query 'length(DBInstances[])' --output text 2>/dev/null || echo "0")
    info "RDS instances: $RDS_INSTANCES"

    echo ""
}

# Check billing alerts
check_billing_alerts() {
    log "Checking billing alerts..."

    ALARMS=$(aws cloudwatch describe-alarms --alarm-name-prefix "Magent" --query 'length(MetricAlarms[])' --output text)

    if [ "$ALARMS" -gt 0 ]; then
        info "✅ Billing alerts configured: $ALARMS"
    else
        warn "⚠️  No billing alerts configured"
        echo "  Consider setting up cost monitoring alerts"
    fi

    echo ""
}

# Show cost optimization tips
show_cost_tips() {
    log "💡 Cost Optimization Tips:"
    echo ""
    echo "1. 🛑 Stop unused resources:"
    echo "   - Delete CloudFormation stacks when not needed"
    echo "   - Stop ECS services: aws ecs update-service --desired-count 0"
    echo "   - Delete unused S3 buckets and ECR images"
    echo ""
    echo "2. 💰 Free Tier Limits:"
    echo "   - ECS Fargate: 750 hours/month"
    echo "   - RDS: 750 hours/month"
    echo "   - S3: 5GB storage + 20K requests"
    echo "   - CloudFront: 1TB transfer"
    echo ""
    echo "3. 📊 Monitor regularly:"
    echo "   - Run this script weekly"
    echo "   - Set up billing alerts"
    echo "   - Check AWS Cost Explorer"
    echo ""
}

# Main function
main() {
    echo "💰 AWS Cost Monitor for Magent"
    echo "================================"
    echo ""

    check_aws

    get_monthly_costs

    check_free_tier_usage

    get_resource_counts

    check_billing_alerts

    show_cost_tips

    echo "📈 For detailed cost analysis, visit:"
    echo "   https://console.aws.amazon.com/cost-management/home"
    echo ""
    echo "🆓 Free Tier usage:"
    echo "   https://console.aws.amazon.com/billing/home?#/freetier"
}

# Run main function
main