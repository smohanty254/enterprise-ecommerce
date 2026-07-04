#!/usr/bin/env bash

##############################################################################
# Enterprise ECS Deployment Script
##############################################################################

set -Eeuo pipefail

###############################################
# Configuration
###############################################

AWS_REGION="${AWS_REGION:-ap-south-1}"

BACKEND_CLUSTER="${BACKEND_CLUSTER:-backend-cluster}"
FRONTEND_CLUSTER="${FRONTEND_CLUSTER:-frontend-cluster}"

BACKEND_SERVICE="${BACKEND_SERVICE:-backend-service}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-frontend-service}"

BACKEND_TASK_FILE="${BACKEND_TASK_FILE:-backend-taskdef.json}"
FRONTEND_TASK_FILE="${FRONTEND_TASK_FILE:-frontend-task.json}"

###############################################
# Colors
###############################################

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m"

###############################################
# Helpers
###############################################

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}$1${NC}"
}

warn() {
    echo -e "${YELLOW}$1${NC}"
}

error() {
    echo -e "${RED}$1${NC}"
}

###############################################
# Validate
###############################################

command -v aws >/dev/null || {
    error "AWS CLI not installed."
    exit 1
}

###############################################
# AWS Identity
###############################################

log "Checking AWS credentials..."

aws sts get-caller-identity >/dev/null

success "AWS credentials verified."

###############################################
# Register Backend Task
###############################################

log "Registering backend task definition..."

BACKEND_TASK_ARN=$(
aws ecs register-task-definition \
    --cli-input-json file://${BACKEND_TASK_FILE} \
    --query "taskDefinition.taskDefinitionArn" \
    --output text
)

success "Backend Task:"
echo "$BACKEND_TASK_ARN"

###############################################
# Register Frontend Task
###############################################

log "Registering frontend task definition..."

FRONTEND_TASK_ARN=$(
aws ecs register-task-definition \
    --cli-input-json file://${FRONTEND_TASK_FILE} \
    --query "taskDefinition.taskDefinitionArn" \
    --output text
)

success "Frontend Task:"
echo "$FRONTEND_TASK_ARN"

###############################################
# Deploy Backend
###############################################

log "Updating backend service..."

aws ecs update-service \
    --cluster "$BACKEND_CLUSTER" \
    --service "$BACKEND_SERVICE" \
    --task-definition "$BACKEND_TASK_ARN"

log "Waiting for backend..."

aws ecs wait services-stable \
    --cluster "$BACKEND_CLUSTER" \
    --services "$BACKEND_SERVICE"

success "Backend deployment completed."

###############################################
# Deploy Frontend
###############################################

log "Updating frontend service..."

aws ecs update-service \
    --cluster "$FRONTEND_CLUSTER" \
    --service "$FRONTEND_SERVICE" \
    --task-definition "$FRONTEND_TASK_ARN"

log "Waiting for frontend..."

aws ecs wait services-stable \
    --cluster "$FRONTEND_CLUSTER" \
    --services "$FRONTEND_SERVICE"

success "Frontend deployment completed."

###############################################
# Service Status
###############################################

echo
echo "=============================================="
echo "Backend"
echo "=============================================="

aws ecs describe-services \
    --cluster "$BACKEND_CLUSTER" \
    --services "$BACKEND_SERVICE" \
    --query "services[0].{
        Status:status,
        Running:runningCount,
        Desired:desiredCount,
        Pending:pendingCount,
        TaskDefinition:taskDefinition
    }"

echo
echo "=============================================="
echo "Frontend"
echo "=============================================="

aws ecs describe-services \
    --cluster "$FRONTEND_CLUSTER" \
    --services "$FRONTEND_SERVICE" \
    --query "services[0].{
        Status:status,
        Running:runningCount,
        Desired:desiredCount,
        Pending:pendingCount,
        TaskDefinition:taskDefinition
    }"

###############################################
# Finished
###############################################

echo
success "=============================================="
success "Deployment Successful"
success "=============================================="

echo
echo "Backend Cluster : $BACKEND_CLUSTER"
echo "Backend Service : $BACKEND_SERVICE"

echo
echo "Frontend Cluster : $FRONTEND_CLUSTER"
echo "Frontend Service : $FRONTEND_SERVICE"

echo
echo "Completed at $(date)"