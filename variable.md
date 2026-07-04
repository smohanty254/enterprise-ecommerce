# GitHub Variables & Secrets Configuration

This document describes all the GitHub Variables and Secrets required for the ECS deployment workflow.

---

# Repository Variables

Navigate to:

**GitHub → Repository → Settings → Secrets and variables → Actions → Variables**

Create the following variables.

| Variable         | Example                    | Description                  |
| ---------------- | -------------------------- | ---------------------------- |
| AWS_REGION       | ap-south-1                 | AWS Region                   |
| BACKEND_IMAGE    | ecommerce-backend          | Backend ECR Repository Name  |
| FRONTEND_IMAGE   | ecommerce-frontend         | Frontend ECR Repository Name |
| BACKEND_CLUSTER  | ecommerce-backend-cluster  | ECS Backend Cluster          |
| FRONTEND_CLUSTER | ecommerce-frontend-cluster | ECS Frontend Cluster         |
| BACKEND_SERVICE  | ecommerce-backend-service  | ECS Backend Service          |
| FRONTEND_SERVICE | ecommerce-frontend-service | ECS Frontend Service         |

---

# GitHub Secrets

Navigate to:

**GitHub → Repository → Settings → Secrets and variables → Actions → Secrets**

Create the following secrets.

| Secret                | Description        |
| --------------------- | ------------------ |
| AWS_ACCESS_KEY_ID     | AWS IAM Access Key |
| AWS_SECRET_ACCESS_KEY | AWS IAM Secret Key |

---

# Optional Secrets

These are recommended if your application uses databases, Redis, authentication, or third-party services.

| Secret                |
| --------------------- |
| DATABASE_URL          |
| REDIS_URL             |
| JWT_SECRET            |
| JWT_REFRESH_SECRET    |
| STRIPE_SECRET_KEY     |
| STRIPE_WEBHOOK_SECRET |
| SMTP_USERNAME         |
| SMTP_PASSWORD         |
| CLOUDINARY_API_KEY    |
| CLOUDINARY_API_SECRET |
| CLOUDINARY_CLOUD_NAME |
| OPENAI_API_KEY        |
| SENTRY_DSN            |

---

# Backend Environment Variables

Typical environment variables used by a NestJS backend.

```
NODE_ENV=production
PORT=3000

DATABASE_URL=

REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

CORS_ORIGIN=https://yourdomain.com

LOG_LEVEL=info

AWS_REGION=ap-south-1
```

---

# Frontend Environment Variables

Typical variables for a React or Next.js frontend.

### React

```
REACT_APP_API_URL=https://api.example.com
```

### Next.js

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

# Required AWS Resources

The workflow assumes the following AWS resources already exist.

## Amazon ECR

Backend Repository

```
ecommerce-backend
```

Frontend Repository

```
ecommerce-frontend
```

---

## ECS

Backend Cluster

```
ecommerce-backend-cluster
```

Frontend Cluster

```
ecommerce-frontend-cluster
```

Backend Service

```
ecommerce-backend-service
```

Frontend Service

```
ecommerce-frontend-service
```

---

## IAM Roles

Execution Role

```
ecsTaskExecutionRole
```

Backend Task Role

```
backendTaskRole
```

Frontend Task Role

```
frontendTaskRole
```

---

## CloudWatch Log Groups

```
/ecs/backend
```

```
/ecs/frontend
```

---

## AWS Permissions Required

The deployment IAM user or role should have permissions for:

* Amazon ECS
* Amazon ECR
* IAM PassRole
* CloudWatch Logs
* AWS Secrets Manager (if used)
* Systems Manager Parameter Store (optional)

Typical actions include:

* ecs:RegisterTaskDefinition
* ecs:UpdateService
* ecs:DescribeServices
* ecs:DescribeTaskDefinition
* ecr:GetAuthorizationToken
* ecr:BatchCheckLayerAvailability
* ecr:PutImage
* ecr:InitiateLayerUpload
* logs:CreateLogGroup
* logs:CreateLogStream
* logs:PutLogEvents
* iam:PassRole

---

# Deployment Flow

1. Developer pushes code to GitHub.
2. GitHub Actions builds backend and frontend Docker images.
3. Images are pushed to Amazon ECR.
4. ECS task definitions are updated with the new image tags.
5. Backend ECS service is updated.
6. Frontend ECS service is updated.
7. ECS waits for both services to become stable.
8. Deployment summary is published to the GitHub Actions job.

---

# Verification Checklist

Before triggering the workflow, verify that:

* AWS Region is correct.
* ECR repositories exist.
* ECS clusters exist.
* ECS services exist.
* IAM roles are configured.
* CloudWatch log groups exist or can be created.
* GitHub Variables are configured.
* GitHub Secrets are configured.
* `backend-taskdef.json` is present.
* `frontend-task.json` is present.
* `aws_ecs.yml` is committed under `.github/workflows/`.

Once all items are complete, pushing to the configured branch or manually triggering the workflow will deploy both backend and frontend services to Amazon ECS.
