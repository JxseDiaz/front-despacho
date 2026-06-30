# Frontend Despacho Dashboard

Aplicación web desarrollada en React + Vite + Tailwind CSS para la gestión de despachos y ventas de ITPCARGO™. Desplegada en AWS EKS como parte de la EP3 del curso Introducción a Herramientas DevOps (ISY1101).

## Tecnologías

- React + Vite
- Tailwind CSS
- Docker (multi-stage build)
- Nginx (servidor de producción)
- GitHub Actions (CI/CD)
- Amazon ECR (registro de imágenes)
- Amazon EKS (orquestación Kubernetes)

## Requisitos previos

- Docker Desktop instalado
- Node.js 18 o superior
- AWS CLI v2 configurado
- kubectl instalado

## Cómo ejecutar localmente

### Con Docker Compose

```bash
docker compose up -d
```

Accede en: http://localhost

### Sin Docker

```bash
npm install
npm run dev
```

Accede en: http://localhost:5173

## Variables de entorno

El frontend es estático y no requiere variables de entorno. La comunicación con los backends se realiza mediante el proxy reverso de Nginx definido en `nginx.conf`.

## Estructura del proyecto

```
front_despacho/
├── Dockerfile                    # Multi-stage build (Node builder + Nginx Alpine)
├── docker-compose.yml            # Stack local para desarrollo
├── nginx.conf                    # Servidor web + proxy reverso a backends
├── .dockerignore                 # Archivos excluidos del build
├── .github/
│   └── workflows/
│       └── cicd-frontend.yml     # Pipeline CI/CD hacia EKS
├── src/                          # Código fuente React
└── public/                       # Archivos estáticos
```

## Pipeline CI/CD

El pipeline se activa automáticamente con cada push a la rama `deploy`:

1. Checkout del código fuente
2. Configuración de credenciales AWS
3. Login a Amazon ECR
4. Build de la imagen Docker
5. Push de la imagen a Amazon ECR
6. Configuración de kubectl con kubeconfig
7. Deploy en EKS mediante `kubectl rollout restart`

## Infraestructura AWS — EP3

| Componente | Detalle |
|------------|---------|
| Orquestador | Amazon EKS 1.31 |
| Clúster | cluster-innovatech |
| Namespace | innovatech |
| Tipo de Service | LoadBalancer |
| Réplicas | 2 pods (escalable hasta 4 con HPA) |
| Imagen | Amazon ECR — frontend-despacho:latest |
| Registro | 865721471726.dkr.ecr.us-east-1.amazonaws.com |
| Región | us-east-1 |

## Autoscaling (HPA)

El Horizontal Pod Autoscaler escala automáticamente los pods del frontend:

- Mínimo: 1 pod
- Máximo: 4 pods
- Umbral de escalado: 50% de uso de CPU

## Manifiestos Kubernetes

Los manifiestos del clúster se encuentran en la carpeta `k8s/` del proyecto principal:

- `namespace.yaml` — Namespace `innovatech`
- `frontend-deployment.yaml` — Deployment + Service LoadBalancer
- `hpa.yaml` — Horizontal Pod Autoscaler

## Principios DevOps aplicados

- **Contenedorización**: Dockerfile multi-stage con usuario no-root (`appuser`)
- **Orquestación**: Kubernetes en AWS EKS con autorecuperación de pods
- **CI/CD**: Pipeline completamente automatizado con GitHub Actions
- **Autoscaling**: HPA escala pods según demanda de CPU
- **Seguridad**: Credenciales manejadas via GitHub Secrets y Kubernetes Secrets
- **Alta disponibilidad**: 2 réplicas distribuidas en 2 zonas de disponibilidad (us-east-1a y us-east-1b)
