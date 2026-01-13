# 🚀 Quick AWS Free Tier Deployment for Magent

## Prerequisites Check ✅

Since you have a working AWS account with free tier access, let's verify your setup:

```bash
# Check AWS CLI configuration
aws sts get-caller-identity

# Check your region (should be us-east-1 for free tier)
aws configure get region

# Verify free tier services are available
aws service-quotas get-service-quota --service-code ec2 --quota-code L-1216C47A
```

## Step 1: Prepare Your Environment

### Set Environment Variables
```bash
export AWS_REGION=ap-southest-2  # Free tier region
export ENVIRONMENT=dev
export GITHUB_OWNER=leduyenminh  # Your GitHub username
export GITHUB_REPO=magent
export GITHUB_BRANCH=main
export GITHUB_TOKEN=your_github_token_here
```

### Get Your GitHub Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate new token with `repo` and `workflow` permissions
3. Copy the token and set it: `export GITHUB_TOKEN=your_token_here`

## Step 2: Deploy Infrastructure (Free Tier Optimized)

### Option A: Automated Deployment (Recommended)
```bash
cd /workspaces/magent
chmod +x aws/deploy.sh
./aws/deploy.sh
```

### Option B: Manual CloudFormation Deployment

1. **Create S3 bucket for templates:**
```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="magent-templates-${ACCOUNT_ID}-${AWS_REGION}"

# Create bucket
aws s3 mb s3://${BUCKET_NAME}
```

2. **Upload CloudFormation templates:**
```bash
aws s3 cp aws/infrastructure.yaml s3://${BUCKET_NAME}/
aws s3 cp aws/ecs-services.yaml s3://${BUCKET_NAME}/
aws s3 cp aws/pipeline.yaml s3://${BUCKET_NAME}/
```

3. **Deploy Infrastructure Stack:**
```bash
aws cloudformation create-stack \
  --stack-name dev-magent-infrastructure \
  --template-url https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/infrastructure.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

4. **Wait for infrastructure to complete:**
```bash
aws cloudformation wait stack-create-complete --stack-name dev-magent-infrastructure
```

5. **Deploy CI/CD Pipeline:**
```bash
aws cloudformation create-stack \
  --stack-name dev-magent-pipeline \
  --template-url https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/pipeline.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=GitHubOwner,ParameterValue=${GITHUB_OWNER} \
    ParameterKey=GitHubRepo,ParameterValue=${GITHUB_REPO} \
    ParameterKey=GitHubBranch,ParameterValue=${GITHUB_BRANCH} \
    ParameterKey=GitHubToken,ParameterValue=${GITHUB_TOKEN} \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

## Step 3: Set Up Secrets Manager

After infrastructure deployment, create API keys:

```bash
# Create secrets for API keys
aws secretsmanager create-secret \
  --name dev/magent/api-keys \
  --secret-string '{
    "OPENAI_API_KEY": "your-openai-api-key",
    "SERP_API_KEY": "your-serp-api-key",
    "JWT_SECRET": "your-256-bit-jwt-secret-key-here"
  }'

# Create database password secret
aws secretsmanager create-secret \
  --name dev/magent/db-password \
  --secret-string '{"password": "your-secure-db-password"}'
```

## Step 4: Initialize Database

1. **Get RDS endpoint:**
```bash
RDS_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name dev-magent-infrastructure \
  --query 'Stacks[0].Outputs[?OutputKey==`RDSEndpoint`].OutputValue' \
  --output text)
```

2. **Connect to database and run schema:**
```bash
# The database schema will be automatically applied by Spring Boot
# But you can manually initialize if needed:
psql -h ${RDS_ENDPOINT} -U magentadmin -d magent -f aws/database-schema.sql
```

## Step 5: First Deployment

### Trigger CodePipeline:
```bash
# Get pipeline name and trigger first deployment
PIPELINE_NAME=$(aws cloudformation describe-stacks \
  --stack-name dev-magent-pipeline \
  --query 'Stacks[0].Outputs[?OutputKey==`PipelineName`].OutputValue' \
  --output text)

aws codepipeline start-pipeline-execution --name ${PIPELINE_NAME}
```

### Monitor Deployment:
```bash
# Watch pipeline execution
aws codepipeline get-pipeline-state --name ${PIPELINE_NAME}

# Check CodeBuild logs
aws logs tail /aws/codebuild/dev-magent-build --follow
```

## Step 6: Access Your Application

### Get Application URLs:
```bash
# CloudFront URL for frontend
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name dev-magent-infrastructure \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionURL`].OutputValue' \
  --output text)

# ALB DNS for API
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name dev-magent-infrastructure \
  --query 'Stacks[0].Outputs[?OutputKey==`ALBDNSName`].OutputValue' \
  --output text)

echo "Frontend: ${CLOUDFRONT_URL}"
echo "API Gateway: http://${ALB_DNS}"
echo "Swagger UI: http://${ALB_DNS}/swagger-ui/index.html"
```

## 🆓 Free Tier Usage Summary

| Service | Free Tier Limit | Our Usage | Status |
|---------|----------------|-----------|---------|
| **ECS Fargate** | 750 hours/month | 1 t3.micro task | ✅ Safe |
| **RDS PostgreSQL** | 750 hours/month | 1 db.t3.micro | ✅ Safe |
| **S3** | 5GB + 20K requests | Static assets | ✅ Safe |
| **CloudFront** | 1TB transfer | Global CDN | ✅ Safe |
| **CodeBuild** | 100 build minutes | ~10-15 min/build | ✅ Safe |
| **ECR** | 500MB storage | Docker images | ✅ Safe |
| **Secrets Manager** | 30-day trial | API keys | ⚠️ Monitor |

## 🔧 Troubleshooting

### Check Service Status:
```bash
# ECS cluster status
aws ecs describe-cluster --cluster dev-magent-cluster

# Service health
aws ecs describe-services --cluster dev-magent-cluster --services dev-magent-gateway

# Check logs
aws logs tail /ecs/dev/magent-gateway --follow
```

### Common Issues:

1. **Pipeline fails:**
```bash
# Check CodeBuild logs
aws codebuild list-builds-for-project --project-name dev-magent-build
aws codebuild batch-get-builds --ids <build-id>
```

2. **Services won't start:**
```bash
# Check task definitions and events
aws ecs describe-task-definition --task-definition dev-magent-gateway
aws ecs describe-services --cluster dev-magent-cluster --services dev-magent-gateway
```

3. **Database connection issues:**
```bash
# Verify RDS security group allows ECS access
aws ec2 describe-security-groups --group-names dev-magent-ecs-sg
```

## 💰 Cost Monitoring

### Set up billing alerts:
```bash
# Create billing alarm for $5/month threshold
aws cloudwatch put-metric-alarm \
  --alarm-name "MagentMonthlyCharges" \
  --alarm-description "Monthly charges have exceeded $5" \
  --metric-name "EstimatedCharges" \
  --namespace "AWS/Billing" \
  --statistic "Maximum" \
  --period 21600 \
  --threshold 5 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 1
```

### Check current costs:
```bash
# View current month charges
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 🎯 Next Steps

1. **Test your application** using the URLs above
2. **Set up custom domain** (optional) with Route 53
3. **Configure monitoring** with CloudWatch dashboards
4. **Set up backup policies** for RDS
5. **Add SSL certificate** for HTTPS

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Verify your IAM permissions
4. Check the [AWS Free Tier page](https://aws.amazon.com/free/) for limits

**Happy Deploying! 🚀**