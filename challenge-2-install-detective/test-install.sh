#!/bin/bash

set -e

echo "🧪 Running installation test..."

# 1. Verify that all pods are Ready 1/1
echo "Checking pod status..."
kubectl wait --for=condition=Ready pod --all -n sekios --timeout=120s

READY_PODS=$(kubectl get pods -n sekios -o 'jsonpath={..status.conditions[?(@.type=="Ready")].status}')
for STATUS in $READY_PODS; do
  if [ "$STATUS" != "True" ]; then
    echo "❌ Test failed: Not all pods are ready."
    exit 1
  fi
done
echo "✅ All pods are ready."


# 2. Test a simple API call
echo "Testing API endpoint..."
kubectl port-forward svc/sekios-api -n sekios 8080:80 > /dev/null 2>&1 &
PORT_FORWARD_PID=$!

# Ensure the port-forward process is killed on script exit
trap "kill $PORT_FORWARD_PID 2>/dev/null || true" EXIT

sleep 2 # Wait for port-forward to be ready

API_RESPONSE=$(curl -s http://localhost:8080)

EXPECTED_RESPONSE="SekiOS API v1.0"
if [ "$API_RESPONSE" != "$EXPECTED_RESPONSE" ]; then
  echo "❌ Test failed: API response did not match expected value."
  echo "   Expected: '$EXPECTED_RESPONSE'"
  echo "   Received: '$API_RESPONSE'"
  exit 1
fi
echo "✅ API endpoint test passed."

echo "🎉 Installation test successful!"
exit 0
