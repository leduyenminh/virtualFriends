# Magent AWS Deployment Guide

This guide provides comprehensive instructions for deploying the Magent microservices application to AWS using Infrastructure as Code (IaC) with CloudFormation, CI/CD with CodePipeline, and container orchestration with ECS Fargate.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   Application   │────│   ECS Fargate   │
│   (CDN)         │    │   Load Balancer │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Amazon RDS    │    │   AWS Secrets   │
                    │   PostgreSQL    │    │   Manager       │
                    └─────────────────┘    └─────────────────┘
```

### Components:
- **Frontend**: React app served via CloudFront + S3
- **API Gateway**: Spring Cloud Gateway for routing
- **Microservices**: Agent, Auth, Avatar, Voice services on ECS Fargate
- **Database**: PostgreSQL on Amazon RDS
- **CI/CD**: CodePipeline + CodeBuild for automated deployments
- **Container Registry**: Amazon ECR for Docker images

## 📋 Prerequisites

### AWS Account Setup
1. Create an AWS account or use existing one
2. Install AWS CLI v2:
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

3. Configure AWS CLI:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and default region
   ```

### Required Permissions
Your AWS user/role needs the following permissions:
- CloudFormation: Full access
- ECS: Full access
- ECR: Full access
- S3: Full access
- IAM: Full access
- RDS: Full access
- CodePipeline: Full access
- CodeBuild: Full access

### GitHub Setup
1. Create a GitHub repository for your Magent project
2. Generate a Personal Access Token with `repo` and `workflow` permissions
3. Set up the following secrets in GitHub (or pass as environment variables):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_DEFAULT_REGION`

## 🚀 Quick Start Deployment

### Option 1: Automated Deployment Script

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd magent
   ```

2. **Set environment variables:**
   ```bash
   export ENVIRONMENT=dev
   export AWS_REGION=us-east-1
   export GITHUB_OWNER=your-github-username
   export GITHUB_REPO=magent
   export GITHUB_BRANCH=main
   export GITHUB_TOKEN=your-github-token
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x aws/deploy.sh
   ./aws/deploy.sh
   ```

### Option 2: Manual CloudFormation Deployment

1. **Create S3 bucket for templates:**
   ```bash
   aws s3 mb s3://magent-templates-$(aws sts get-caller-identity --query Account --output text)-$AWS_REGION
   ```

2. **Upload CloudFormation templates:**
   ```bash
   aws s3 cp aws/infrastructure.yaml s3://magent-templates-$(aws sts get-caller-identity --query Account --output text)-$AWS_REGION/
   aws s3 cp aws/ecs-services.yaml s3://magent-templates-$(aws sts get-caller-identity --query Account --output text)-$AWS_REGION/
   aws s3 cp aws/pipeline.yaml s3://magent-templates-$(aws sts get-caller-identity --query Account --output text)-$AWS_REGION/
   ```

3. **Deploy infrastructure:**
   ```bash
   aws cloudformation create-stack \
     --stack-name dev-magent-infrastructure \
     --template-url https://magent-templates-$(aws sts get-caller-identity --query Account --output text)-$AWS_REGION.s3.$AWS_REGION.amazonaws.com/infrastructure.yaml \
     --parameters ParameterKey=Environment,ParameterValue=dev \
     --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
   ```

4. **Deploy CI/CD pipeline:**
   ```bash
   aws cloudformation create-stack \
     --stack-name dev-magent-pipeline \
     --template-url https://magent-templates-$(aws sts get-caller-identity --query Account --output text)-$AWS_REGION.s3.$AWS_REGION.amazonaws.com/pipeline.yaml \
     --parameters \
       ParameterKey=Environment,ParameterValue=dev \
       ParameterKey=GitHubOwner,ParameterValue=your-github-username \
       ParameterKey=GitHubRepo,ParameterValue=magent \
       ParameterKey=GitHubBranch,ParameterValue=main \
       ParameterKey=GitHubToken,ParameterValue=your-github-token \
     --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
   ```

## 🔧 Configuration

### Environment Variables

Create the following secrets in AWS Secrets Manager:

```json
{
  "OPENAI_API_KEY": "your-openai-api-key",
  "SERP_API_KEY": "your-serp-api-key",
  "JWT_SECRET": "your-256-bit-jwt-secret"
}
```

### Database Configuration

The RDS instance is automatically created with:
- PostgreSQL 15.4
- db.t3.micro instance (free tier eligible)
- 20GB storage
- Multi-AZ disabled (for dev environment)

### Custom Domain Setup

1. **Purchase domain** (optional):
   ```bash
   # Using Route 53
   aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)
   ```

2. **Configure CloudFront:**
   - Add custom domain to CloudFront distribution
   - Request SSL certificate in AWS Certificate Manager
   - Update DNS records to point to CloudFront

## 📊 Monitoring & Logging

### CloudWatch Dashboards

Access logs and metrics:
- ECS service logs: `/ecs/{environment}/magent-*`
- Application Load Balancer metrics
- RDS performance metrics
- CloudFront access logs

### Health Checks

The application includes health check endpoints:
- `/actuator/health` - Service health status
- ALB health checks configured for each service

## 🔄 CI/CD Pipeline

The CodePipeline automatically:
1. **Source**: Monitors GitHub repository for changes
2. **Build**: Compiles services, builds Docker images, pushes to ECR
3. **Deploy**: Updates ECS services and deploys UI to S3

### Manual Pipeline Triggers

```bash
aws codepipeline start-pipeline-execution --name dev-magent-pipeline
```

### Build Customization

Modify `aws/buildspec.yml` to customize the build process:
- Add additional build steps
- Configure test execution
- Add security scanning
- Customize artifact packaging

## 🛠️ Troubleshooting

### Common Issues

1. **Pipeline fails during build:**
   - Check CodeBuild logs in CloudWatch
   - Verify GitHub token permissions
   - Ensure all dependencies are available

2. **Services fail to start:**
   - Check ECS service logs
   - Verify environment variables in task definitions
   - Check RDS connectivity

3. **UI not loading:**
   - Verify CloudFront distribution is deployed
   - Check S3 bucket permissions
   - Clear CloudFront cache if needed

### Useful Commands

```bash
# Check stack status
aws cloudformation describe-stack-events --stack-name dev-magent-infrastructure

# View service logs
aws logs tail /ecs/dev/magent-gateway --follow

# Check ECS service status
aws ecs describe-services --cluster dev-magent-cluster --services dev-magent-gateway

# Restart a service
aws ecs update-service --cluster dev-magent-cluster --service dev-magent-gateway --force-new-deployment
```

## 💰 Cost Optimization

### Free Tier Usage
- **EC2**: t3.micro instances (750 hours/month free)
- **RDS**: db.t3.micro PostgreSQL (750 hours/month free)
- **S3**: 5GB storage, 20,000 GET requests free
- **CloudFront**: 1TB data transfer free

### Cost Monitoring
```bash
# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "MonthlyCharges" \
  --alarm-description "Monthly charges have exceeded $50" \
  --metric-name "EstimatedCharges" \
  --namespace "AWS/Billing" \
  --statistic "Maximum" \
  --period 21600 \
  --threshold 50 \
  --comparison-operator "GreaterThanThreshold"
```

## 🔒 Security Best Practices

1. **Network Security:**
   - Services run in private subnets
   - ALB in public subnets with security groups
   - RDS in private subnets with restricted access

2. **Access Control:**
   - IAM roles with least privilege
   - Secrets stored in AWS Secrets Manager
   - API keys encrypted at rest

3. **Monitoring:**
   - CloudTrail for API activity logging
   - AWS Config for resource compliance
   - GuardDuty for threat detection

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
- [Spring Cloud AWS](https://spring.io/projects/spring-cloud-aws)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Push to your fork and create a PR
5. CI/CD pipeline will automatically test and deploy

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Create an issue in the GitHub repository
4. Check AWS service status

---

**Happy Deploying! 🚀**