# Enterprise Amazon ECS Deployment Guide

## Overview

This repository deploys a production-ready ecommerce application to Amazon ECS using GitHub Actions.

The deployment pipeline performs the following tasks automatically:

* Builds Backend Docker image
* Builds Frontend Docker image
* Pushes images to Amazon ECR
* Updates ECS Task Definitions
* Deploys Backend ECS Service
* Deploys Frontend ECS Service
* Waits for deployment stability
* Publishes deployment summary

---

# Architecture

```text
                    GitHub

                       │
             Push to main/master

                       │

                GitHub Actions

                       │

        ┌──────────────┴──────────────┐
        │                             │

 Build Backend                  Build Frontend

        │                             │

 Push Backend Image            Push Frontend Image

        │                             │

 Amazon ECR                    Amazon ECR

        │                             │

 Register Task Definition      Register Task Definition

        │                             │

 Deploy Backend ECS            Deploy Frontend ECS

        │                             │

 CloudWatch Logs         Application Load Balancer

                       │

                  Internet Users
```

---

# Prerequisites

Install the following tools:

* Git
* Docker Desktop
* AWS CLI v2
* Node.js 20+
* npm
* GitHub CLI (optional)

---

# AWS Services Used

* Amazon ECS (Fargate)
* Amazon ECR
* Application Load Balancer (ALB)
* CloudWatch Logs
* IAM
* VPC
* Secrets Manager (recommended)
* Route53 (optional)
* ACM (SSL Certificates)

---

# Repository Structure

```text
.
├── .github/
│   └── workflows/
│       └── aws_ecs.yml
├── backend/
├── frontend/
├── backend-taskdef.json
├── frontend-task.json
├── ecs-deploy.sh
├── README-ECS.md
└── variables.md
```

---

# Step 1 - Create ECR Repositories

```bash
aws ecr create-repository \
  --repository-name ecommerce-backend

aws ecr create-repository \
  --repository-name ecommerce-frontend
```

---

# Step 2 - Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name ecommerce-backend-cluster

aws ecs create-cluster \
  --cluster-name ecommerce-frontend-cluster
```

> You can also deploy both services to a single ECS cluster if preferred.

---

# Step 3 - Create IAM Roles

Create:

* `ecsTaskExecutionRole`
* `backendTaskRole`
* `frontendTaskRole`

The execution role should include:

* AmazonECSTaskExecutionRolePolicy

The task roles should have only the permissions your application requires (for example, access to Secrets Manager, S3, or SNS).

---

# Step 4 - Create CloudWatch Log Groups

```bash
aws logs create-log-group \
  --log-group-name /ecs/backend

aws logs create-log-group \
  --log-group-name /ecs/frontend
```

---

# Step 5 - Configure GitHub

Configure all Variables and Secrets listed in **variables.md**.

---

# Step 6 - Commit Files

Ensure the repository contains:

```text
.github/workflows/aws_ecs.yml
backend-taskdef.json
frontend-task.json
ecs-deploy.sh
README-ECS.md
variables.md
```

---

# Step 7 - Deploy

Commit and push:

```bash
git add .
git commit -m "Deploy to ECS"
git push origin main
```

Or manually trigger the workflow from the **Actions** tab in GitHub.

---

# Deployment Flow

1. Checkout repository
2. Configure AWS credentials
3. Login to Amazon ECR
4. Build backend image
5. Push backend image
6. Build frontend image
7. Push frontend image
8. Render backend task definition
9. Deploy backend service
10. Render frontend task definition
11. Deploy frontend service
12. Wait for services to stabilize
13. Publish deployment summary

---

# Viewing Logs

Backend:

```bash
aws logs tail /ecs/backend --follow
```

Frontend:

```bash
aws logs tail /ecs/frontend --follow
```

---

# Scaling

Increase backend desired count:

```bash
aws ecs update-service \
  --cluster ecommerce-backend-cluster \
  --service ecommerce-backend-service \
  --desired-count 3
```

Increase frontend desired count:

```bash
aws ecs update-service \
  --cluster ecommerce-frontend-cluster \
  --service ecommerce-frontend-service \
  --desired-count 3
```

---

# Rollback

List task definition revisions:

```bash
aws ecs list-task-definitions \
  --family-prefix backend-task \
  --sort DESC
```

Rollback backend:

```bash
aws ecs update-service \
  --cluster ecommerce-backend-cluster \
  --service ecommerce-backend-service \
  --task-definition backend-task:12
```

Rollback frontend:

```bash
aws ecs update-service \
  --cluster ecommerce-frontend-cluster \
  --service ecommerce-frontend-service \
  --task-definition frontend-task:8
```

---

# Troubleshooting

## Docker build fails

* Verify Docker is installed and running.
* Confirm `backend/Dockerfile` and `frontend/Dockerfile` exist.

## Push to ECR fails

* Check IAM permissions.
* Verify ECR repositories exist.
* Ensure the repository names match your GitHub Variables.

## ECS deployment fails

* Verify the ECS cluster and service names.
* Check that the task definition JSON is valid.
* Confirm the execution and task IAM roles exist.

## Tasks stop immediately

* Review CloudWatch Logs.
* Confirm environment variables and secrets are configured.
* Verify the application binds to the expected port.

## Health checks fail

* Ensure your backend exposes `/health`.
* Verify your frontend responds on the configured port.
* Check ALB target group health settings.

---

# Security Best Practices

* Use GitHub OIDC instead of long-lived AWS access keys where possible.
* Store secrets in AWS Secrets Manager or Systems Manager Parameter Store.
* Enable image scanning in Amazon ECR.
* Use HTTPS with AWS Certificate Manager (ACM).
* Grant least-privilege IAM permissions.
* Enable CloudTrail for auditing.

---

# Future Enhancements

* Blue/Green deployments with AWS CodeDeploy
* Canary deployments
* Automatic rollback on failed health checks
* Multi-environment support (Dev, QA, Staging, Production)
* Infrastructure as Code using Terraform or AWS CDK
* Auto Scaling policies
* WAF integration
* CloudFront CDN for the frontend
* Monitoring with Amazon CloudWatch dashboards and alarms

---

# Support Checklist

Before opening a deployment issue, verify:

* Docker builds locally.
* AWS CLI authentication succeeds (`aws sts get-caller-identity`).
* ECR repositories exist.
* ECS clusters and services exist.
* IAM roles are configured.
* GitHub Variables and Secrets are complete.
* CloudWatch logs contain no startup errors.
* Health checks pass.

Following this guide will result in a repeatable, production-oriented deployment of your backend and frontend services to Amazon ECS using GitHub Actions.
