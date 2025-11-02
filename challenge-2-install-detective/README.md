# Challenge 2: Installation Detective 🔍

## 📖 Context

A client wants to deploy SekiOS v1.0 in their air-gapped Kubernetes cluster. They followed the documentation but pods don't start correctly. Support sends you the manifests and logs.

## 🎯 Objectives

1. **Deploy the provided Helm chart** in a local cluster
2. **Identify errors** preventing startup
3. **Propose fixes** with corrected manifests
4. **Create an automated installation test**

## 🚀 Prerequisites

```bash
# Install a local cluster
kind create cluster --name sekoia-test
# OR
minikube start

# Verify kubectl
kubectl cluster-info

# Install Helm
brew install helm  # macOS
# OR
choco install kubernetes-helm  # Windows
# OR
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash  # Linux

# Install Tilt (optional but recommended)
brew install tilt  # macOS
# OR see: https://docs.tilt.dev/install.html
```

## 📦 Installation

### Option 1: With Tilt (Recommended)

```bash
cd challenge-2-install-detective

# Launch Tilt
tilt up

# Open Tilt dashboard in browser
# http://localhost:10350

# Observe problems in real time
# Tilt will automatically reload changes
```

### Option 2: Manual

```bash
cd challenge-2-install-detective

# Installation attempt
./deploy.sh

# Observe problems
kubectl get pods -n sekios
kubectl describe pod <pod-name> -n sekios
kubectl logs <pod-name> -n sekios
```

## 🐛 Observed Symptoms

After deployment, you should see:

```
NAME                      READY   STATUS              RESTARTS   AGE
sekios-api-xxx            0/1     CrashLoopBackOff/CreateContainerConfigError   5          2m
sekios-worker-xxx         0/1     CreateContainerConfigError   1          2m
sekios-frontend-xxx       0/1     OOMKilled           3          2m
```

## 📤 Expected Deliverables

The complete and corrected challenge-2-install-detective folder including the automated test verifying the installation.

## 🎯 Quality Objective

Your installation test must:

- ✅ Verify that all pods are `Ready 1/1`
- ✅ Validate fixed bugs
- ✅ Test a simple API call
- ✅ Return an error code if failure

Happy investigation! 🕵️
