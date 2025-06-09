#!/usr/bin/env bash
set -euo pipefail

apply() {
  echo "kubectl apply -f $1"
  kubectl apply -f "$1"
}

echo "3) Deploy baz danych..."
apply too-doos-db-deployment.yaml
apply too-doos-db-service.yaml
apply keycloak-db-deployment.yaml
apply keycloak-db-service.yaml

echo "4) Deploy Keycloak..."
apply auth-keycloak-deployment.yaml
apply auth-keycloak-service.yaml

echo "5) Deploy API (razem z migracjami)..."
apply too-doos-api-deployment.yaml
apply too-doos-api-service.yaml

echo "6) Deploy Frontendu..."
apply too-doos-frontend-deployment.yaml
apply too-doos-frontend-service.yaml

echo "✅ Gotowe — wszystkie zasoby wgrane do klastra."
