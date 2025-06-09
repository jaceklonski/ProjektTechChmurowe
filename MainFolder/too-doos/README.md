# Uruchomienie aplikacji Too-Doos

## 0. Konfiguracja pliku `.env` dla Frontendu

Przed zbudowaniem lub uruchomieniem kontenera frontendowego, w katalogu `/frontend` utwórz plik `.env` z następującą zawartością:

```
# URL do API (używane w next.config.ts)
NEXT_PUBLIC_API_URL=

# Keycloak
KEYCLOAK_CLIENT_ID=
KEYCLOAK_CLIENT_SECRET=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Dla NextAuth po stronie serwera (SSR, kontener too-doos-frontend)
KEYCLOAK_ISSUER=http://auth-keycloak:8080/realms/...

# Dla kodu client-side (keycloak-js i ewentualnie keycloak logout)
NEXT_PUBLIC_KEYCLOAK_ISSUER=http://auth-keycloak:8080/realms/...
NEXT_PUBLIC_KEYCLOAK_REALM=...
```

## 1. Docker Compose

W katalogu `/API`, gdzie masz `docker-compose.yml`, uruchom:

```bash
# Zatrzymanie istniejących kontenerów i przebudowa
docker compose down

docker compose up --build -d
```

### Sprawdzenie statusu usług

```bash
docker compose ps
```

### Dostęp z przeglądarki / curl

* Frontend: `http://localhost:3000`
* API health: `http://localhost:5000/health`
* Keycloak: `http://localhost:8080`

### Logi

```bash
docker compose logs -f api

docker compose logs -f frontend

docker compose logs -f auth-keycloak
```

Następnie, skonfiguruj Realm w Keycloak:

1. Zaloguj się do konsoli Keycloaka ([http://localhost:8080](http://localhost:8080)).
2. Utwórz (lub uzupełnij) Realm `too-doos`.
3. W zakładce **Clients** dodaj klienta `frontend` i skopiuj jego sekret do pola `KEYCLOAK_CLIENT_SECRET` w `.env`.
4. Przebuduj kontener frontendu (patrz sekcje poniżej).


## 2. Kubernetes

### Przygotowanie klastra

* **Minikube**:

  ```bash
  minikube start
  eval $(minikube docker-env)
  ```
* **Kind**:

  ```bash
  kind create cluster --name toodoos
  ```

### Budowa obrazów w klastrze

```bash
# API
cd API
docker build -t too-doos-api:latest .

# Frontend
cd ../too-doos-frontend
docker build -t too-doos-frontend:latest .
```

### Aplikacja manifestów

```bash
kubectl apply -f manifests/
```

### Monitorowanie

```bash
kubectl get pods -w
```

### Port-forward do lokalnych testów

```bash
kubectl port-forward svc/too-doos-frontend 3000:3000 &
kubectl port-forward svc/too-doos-api      5000:5000 &
kubectl port-forward svc/auth-keycloak     8080:8080 &
```

## 3. Skrypty pomocnicze

### `deploy-all.sh` (K8s apply krok-po-kroku)

```bash
#!/usr/bin/env bash
set -euo pipefail

apply() {
  echo "👉 kubectl apply -f $1"
  kubectl apply -f "$1"
}

echo "1) PVC-e..."
apply db-data-persistentvolumeclaim.yaml
apply keycloak-db-data-persistentvolumeclaim.yaml

echo "2) Secret'y i ConfigMap..."
apply db-password-secret.yaml
apply keycloak-client-secret.yaml
apply frontend--env-local-configmap.yaml

echo "3) Bazy danych..."
apply too-doos-db-deployment.yaml
apply too-doos-db-service.yaml
apply keycloak-db-deployment.yaml
apply keycloak-db-service.yaml

echo "4) Keycloak..."
apply auth-keycloak-deployment.yaml
apply auth-keycloak-service.yaml

echo "5) API + migracje..."
apply too-doos-api-deployment.yaml
apply too-doos-api-service.yaml

# Job migracji
kubectl wait --for=condition=complete job/too-doos-api-migrate

echo "6) Frontend..."
apply too-doos-frontend-deployment.yaml
apply too-doos-frontend-service.yaml

echo "✅ Wszystko wgrane."
```

---

Dokument zaktualizowano o sekcję 0, opisującą dodanie pliku `.env` w katalogu frontend oraz krok tworzenia realm w Keycloak i przebudowy kontenera.
