# 🚀 ISOFlow4 - Sistema de Gestión de Calidad ISO 9001 con Agentes de IA

Un sistema avanzado de gestión de calidad ISO 9001 que integra agentes de inteligencia artificial para automatizar y optimizar procesos de calidad en organizaciones multi-tenant.

## 🌟 Características Principales

### 🤖 Sistema de Agentes de IA
- **Agentes Especializados**: Validación, sugerencias, autocompletado, análisis y optimización
- **Aprendizaje Continuo**: Entrenamiento automático con datos históricos
- **Integración OpenAI**: GPT-4 para procesamiento de lenguaje natural
- **Métricas en Tiempo Real**: Monitoreo de performance y costos

### 🔍 Sistema RAG (Retrieval Augmented Generation)
- **Búsqueda Semántica**: Encuentra información relevante en documentos
- **Generación Contextual**: Respuestas basadas en documentación específica
- **Ingestión Automática**: Procesamiento de PDFs, DOCX, TXT y más
- **Embeddings Vectoriales**: Búsqueda por similitud semántica

### 🏢 Arquitectura Multi-Tenant
- **Aislamiento Completo**: Cada organización tiene su propia base de datos
- **Escalabilidad Horizontal**: Soporte para miles de organizaciones
- **Límites Configurables**: Control de recursos por organización
- **Roles y Permisos**: Sistema RBAC granular

### 📊 Observabilidad y Monitoreo
- **Logging Estructurado**: Winston con rotación automática
- **Métricas en Tiempo Real**: Prometheus y Grafana
- **Alertas Inteligentes**: Notificaciones proactivas
- **Auditoría Completa**: Trazabilidad de todas las acciones

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js + TypeScript
- Express.js + Socket.io
- MongoDB Atlas (multi-tenant)
- Redis (cache y colas)
- OpenAI GPT-4
- Winston (logging)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (cache)
- Zustand (estado)
- Socket.io-client
- Tailwind CSS

**Infraestructura:**
- AWS ECS/EKS
- MongoDB Atlas
- Redis Cloud
- S3 (archivos)
- CloudFront (CDN)

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- MongoDB Atlas
- Redis
- OpenAI API Key

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Sergiocharata1977/9001app-v2.git
cd 9001app-v2
```

### 2. Configurar Variables de Entorno

```bash
# Backend
cd backend
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/isoflow4

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_ORGANIZATION=org-your-organization-id

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Configurar Base de Datos

```bash
# Crear índices y estructura
cd backend
npm run build
npm run migrate

# Poblar con datos de ejemplo
npm run seed
```

### 5. Iniciar el Sistema

```bash
# Backend (desarrollo)
cd backend
npm run dev

# Frontend (desarrollo)
cd frontend
npm run dev
```

## 📚 Documentación de APIs

### Autenticación

Todas las APIs requieren autenticación JWT y el header `x-organization-id`:

```bash
Authorization: Bearer <jwt-token>
x-organization-id: <organization-id>
```

### Agentes de IA

#### Crear Agente
```http
POST /api/org/:orgId/agents
Content-Type: application/json

{
  "name": "Validador de Procesos",
  "type": "validation",
  "capabilities": ["process_validation", "data_validation"],
  "configuration": {
    "temperature": 0.1,
    "max_tokens": 500
  }
}
```

#### Ejecutar Agente
```http
POST /api/org/:orgId/agents/:agentId/execute
Content-Type: application/json

{
  "input": {
    "process": {...},
    "data": {...}
  },
  "context": {
    "validation_type": "process_validation"
  }
}
```

#### Listar Agentes
```http
GET /api/org/:orgId/agents?type=validation
```

### Sistema RAG

#### Ingestionar Documento
```http
POST /api/org/:orgId/rag/ingest
Content-Type: application/json

{
  "title": "Manual de Calidad",
  "content": "Contenido del documento...",
  "type": "pdf",
  "source": "upload",
  "metadata": {
    "author": "Equipo de Calidad",
    "category": "manuales",
    "tags": ["iso9001", "calidad"]
  }
}
```

#### Consulta RAG
```http
POST /api/org/:orgId/rag/query
Content-Type: application/json

{
  "query": "¿Cuáles son los requisitos de la norma ISO 9001?",
  "options": {
    "limit": 5,
    "filters": {
      "category": "manuales"
    }
  }
}
```

#### Buscar Documentos
```http
POST /api/org/:orgId/rag/search
Content-Type: application/json

{
  "query": "procesos de calidad",
  "limit": 10,
  "filters": {
    "type": "pdf",
    "tags": ["iso9001"]
  }
}
```

### Procesos

#### Validar Proceso con IA
```http
POST /api/org/:orgId/ai/validate
Content-Type: application/json

{
  "process": {
    "name": "Proceso de Desarrollo",
    "states": [...],
    "transitions": [...]
  },
  "data": {
    "current_state": "diseño",
    "fields": {...}
  }
}
```

#### Obtener Sugerencias
```http
POST /api/org/:orgId/ai/suggest
Content-Type: application/json

{
  "process": {...},
  "currentState": "revisión",
  "data": {...}
}
```

## 🏢 Estructura Multi-Tenant

### Organizaciones

Cada organización tiene:
- Base de datos separada
- Configuración personalizada
- Límites de recursos
- Usuarios y permisos propios

### Roles de Usuario

- **SuperAdmin**: Acceso global a todas las organizaciones
- **OrgAdmin**: Administrador de la organización
- **Auditor**: Lectura y reportes
- **Operador**: Ejecución de procesos
- **Invitado**: Acceso limitado

### Límites por Plan

| Plan | Usuarios | Storage | AI Requests | Procesos |
|------|----------|---------|-------------|----------|
| Free | 5 | 100MB | 100 | 10 |
| Basic | 25 | 1GB | 1,000 | 50 |
| Professional | 100 | 10GB | 10,000 | 200 |
| Enterprise | ∞ | ∞ | ∞ | ∞ |

## 🤖 Tipos de Agentes de IA

### 1. Agente de Validación
- Valida procesos ISO 9001
- Verifica conformidad de datos
- Detecta inconsistencias
- Sugiere correcciones

### 2. Agente de Sugerencias
- Sugiere mejoras de procesos
- Recomienda optimizaciones
- Proporciona mejores prácticas
- Analiza tendencias

### 3. Agente de Autocompletado
- Completa campos automáticamente
- Aprende patrones históricos
- Sugiere valores basados en contexto
- Reduce tiempo de entrada de datos

### 4. Agente de Análisis
- Analiza performance de procesos
- Identifica cuellos de botella
- Genera insights automáticos
- Predice tendencias

### 5. Agente de Optimización
- Optimiza flujos de trabajo
- Sugiere mejoras de eficiencia
- Reduce costos operativos
- Maximiza productividad

## 🔍 Sistema RAG

### Características

- **Ingestión Automática**: Procesa PDFs, DOCX, TXT, HTML
- **Chunking Inteligente**: Divide documentos en fragmentos óptimos
- **Embeddings Vectoriales**: Genera representaciones semánticas
- **Búsqueda Semántica**: Encuentra información por significado
- **Respuestas Contextuales**: Genera respuestas basadas en documentos

### Flujo de Trabajo

1. **Ingestión**: Subir documento al sistema
2. **Procesamiento**: Dividir en chunks y generar embeddings
3. **Indexación**: Almacenar en base de datos vectorial
4. **Búsqueda**: Consulta semántica en documentos
5. **Generación**: Respuesta contextual con fuentes

## 📊 Monitoreo y Observabilidad

### Métricas Clave

- **Performance de Agentes**: Tiempo de respuesta, precisión
- **Uso de RAG**: Consultas, documentos, relevancia
- **Recursos**: CPU, memoria, almacenamiento
- **Negocio**: Usuarios activos, procesos completados

### Alertas

- SLA breaches
- Errores de IA
- Límites de recursos
- Problemas de seguridad

### Logs

- **Aplicación**: Winston con rotación
- **IA**: Logs especializados para agentes
- **Auditoría**: Trazabilidad completa
- **HTTP**: Requests y responses

## 🔧 Desarrollo

### Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de BD
│   ├── controllers/     # Controladores de API
│   ├── middleware/      # Middleware personalizado
│   ├── routes/          # Rutas de API
│   ├── services/        # Lógica de negocio
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   └── scripts/         # Scripts de migración
├── logs/                # Archivos de log
└── tests/               # Tests unitarios

frontend/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── services/        # Servicios de API
│   ├── store/           # Estado global
│   └── types/           # Tipos TypeScript
└── public/              # Archivos estáticos
```

### Comandos de Desarrollo

```bash
# Backend
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run test         # Ejecutar tests
npm run lint         # Linting
npm run seed         # Poblar BD con datos

# Frontend
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run test         # Tests
npm run lint         # Linting
```

### Testing

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## 🚀 Despliegue

### Docker

```bash
# Construir imagen
docker build -t isoflow4-backend .

# Ejecutar contenedor
docker run -p 3000:3000 isoflow4-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/isoflow4
      - REDIS_HOST=redis
    depends_on:
      - mongo
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
```

### AWS ECS

```bash
# Desplegar en ECS
aws ecs create-service \
  --cluster isoflow4-cluster \
  --service-name isoflow4-backend \
  --task-definition isoflow4-backend:1 \
  --desired-count 2
```

## 🔒 Seguridad

### Autenticación y Autorización

- JWT tokens con expiración
- Refresh tokens seguros
- Roles y permisos granulares
- Rate limiting por IP

### Protección de Datos

- Encriptación en tránsito (TLS)
- Encriptación en reposo
- Aislamiento multi-tenant
- Auditoría completa

### Compliance

- ISO 27001 (Seguridad de la información)
- GDPR (Protección de datos)
- SOC 2 Type II
- HIPAA (si aplica)

## 📈 Roadmap

### Fase 1 (Completada)
- ✅ Sistema multi-tenant
- ✅ Agentes de IA básicos
- ✅ Sistema RAG
- ✅ APIs RESTful

### Fase 2 (En Desarrollo)
- 🔄 Procesos dinámicos
- 🔄 Overrides de organización
- 🔄 Validaciones automáticas
- 🔄 WebSockets en tiempo real

### Fase 3 (Próximamente)
- 📋 Análisis predictivo
- 📋 Optimización automática
- 📋 Integración con ERPs
- 📋 Mobile app

### Fase 4 (Futuro)
- 🚀 IA generativa avanzada
- 🚀 Automatización completa
- 🚀 Integración IoT
- 🚀 Blockchain para auditoría

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Email**: soporte@isoflow4.com
- **Documentación**: https://docs.isoflow4.com
- **Discord**: https://discord.gg/isoflow4
- **Issues**: https://github.com/Sergiocharata1977/9001app-v2/issues

## 🙏 Agradecimientos

- OpenAI por GPT-4
- MongoDB por Atlas
- Redis por Redis Cloud
- La comunidad de desarrolladores

---

**ISOFlow4** - Transformando la gestión de calidad con inteligencia artificial 🤖✨
