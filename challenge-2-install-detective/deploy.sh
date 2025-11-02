#!/bin/bash

set -e

echo "Deploying SekiOS v1.0..."

# Create namespace
kubectl create namespace sekios --dry-run=client -o yaml | kubectl apply -f -

# Deploy helm chart
helm install sekios ./helm-chart -n sekios

echo "Deployment initiated!"
echo ""
echo "Check status with:"
echo "  kubectl get pods -n sekios"
echo "  kubectl describe pod <pod-name> -n sekios"
