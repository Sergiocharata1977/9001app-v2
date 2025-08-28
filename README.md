# 🏢 9001app-v2 - Sistema de Gestión de Calidad ISO 9001

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Descripción

**9001app-v2** es un sistema completo de gestión de calidad basado en la norma ISO 9001:2015, diseñado para empresas que requieren un control integral de sus procesos de calidad, auditorías, hallazgos, acciones correctivas y gestión de personal.

## 🎯 Características Principales

### 🏢 **Gestión Organizacional**
- Multi-organización con roles y permisos
- Gestión de usuarios y personal
- Sistema de autenticación JWT
- Control de acceso por funcionalidades

### 🔍 **Sistema de Auditorías**
- Planificación y ejecución de auditorías
- Gestión de hallazgos y no conformidades
- Seguimiento de acciones correctivas
- Generación de informes automáticos

### 🌾 **CRM Agro Especializado**
- Gestión de clientes agrícolas
- Seguimiento de cultivos y lotes
- Análisis de riesgo financiero
- Pronósticos climáticos
- Métricas de ventas agro

### 🎓 **Capacitación y Competencias**
- Planificación de capacitaciones
- Evaluación de competencias
- Seguimiento de asistencias
- Gestión de temas y programas

### 🤖 **Sistema RAG (IA)**
- Búsqueda inteligente en documentos
- Respuestas automáticas basadas en IA
- Análisis de contenido
- Embeddings de documentos

### 📊 **Indicadores y Objetivos**
- Dashboard de métricas en tiempo real
- Seguimiento de objetivos de calidad
- Indicadores de rendimiento
- Reportes automáticos

## 🏗️ Arquitectura

### **Frontend**
- **React 19** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **React Query** para estado
- **React Router** para navegación

### **Backend**
- **Node.js** con TypeScript
- **Express.js** como framework
- **Turso (SQLite)** como base de datos
- **JWT** para autenticación
- **Multer** para uploads
- **CORS** habilitado

### **Base de Datos**
- **Turso SQLite** en la nube
- **50+ tablas** organizadas por módulos
- **Índices optimizados** para consultas
- **Relaciones** bien definidas

## 🚀 Instalación

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Git

### **1. Clonar el repositorio**
```bash
git clone https://github.com/Sergiocharata1977/9001app-v2.git
cd 9001app-v2
```

### **2. Instalar dependencias**
```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Instalar dependencias del coordinador de agentes
cd ../agent-coordinator
npm install
```

### **3. Configurar variables de entorno**
```bash
# Backend
cd backend
cp env.example .env
# Editar .env con tus configuraciones

# Frontend
cd ../frontend
cp env.example .env
# Editar .env con tus configuraciones
```

### **4. Configurar base de datos**
```bash
cd backend
npm run setup-database
```

### **5. Ejecutar el proyecto**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Estructura del Proyecto

```
9001app-v2/
├── backend/                 # API REST con Node.js
│   ├── controllers/         # Controladores de la API
│   ├── routes/             # Rutas de la API
│   ├── middleware/         # Middleware personalizado
│   ├── database/           # Migraciones y esquemas
│   ├── scripts/            # Scripts de utilidad
│   └── RAG-System/         # Sistema de IA
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios de API
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Archivos estáticos
├── agent-coordinator/      # Sistema de agentes IA
├── docs-esenciales/        # Documentación interna
└── scripts/                # Scripts de despliegue
```

## 🔧 Configuración

### **Variables de Entorno Backend**
```env
# Base de datos
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Servidor
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### **Variables de Entorno Frontend**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=9001app-v2
```

## 📊 Módulos Disponibles

### **🏢 Organizaciones y Usuarios**
- Gestión de organizaciones
- Usuarios y roles
- Permisos por funcionalidad

### **👥 Gestión de Personal**
- Personal y empleados
- Puestos y departamentos
- Competencias y evaluaciones

### **🔍 Auditorías y Calidad**
- Auditorías del sistema
- Hallazgos y no conformidades
- Acciones correctivas

### **🌾 CRM Agro**
- Clientes agrícolas
- Cultivos y lotes
- Análisis de riesgo
- Pronósticos climáticos

### **🤖 Sistema RAG**
- Documentos inteligentes
- Búsqueda con IA
- Respuestas automáticas

### **📝 Documentos y Procesos**
- Gestión documental
- Procesos del SGC
- Normas y estándares

### **🎓 Capacitaciones**
- Planificación de cursos
- Asistencias y evaluaciones
- Temas y programas

## 🚀 Despliegue

### **Despliegue Local**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### **Despliegue en Producción**
```bash
# Usar PM2 para el backend
cd backend
npm run build
pm2 start ecosystem.config.cjs

# Frontend en servidor web
cd frontend
npm run build
# Subir dist/ a tu servidor web
```

## 📚 Documentación

### Documentación Interna
- [📖 Documentación Completa](./docs/README.md)
- [🏗️ Arquitectura del Sistema](./docs/internal/super-admin/architecture.md)
- [💻 Setup del Entorno](./docs/internal/programmers/environment-setup.md)
- [🔧 API Reference](./docs/api/api-reference.md)

### Para Super Administradores
- [👑 Gestión de Organizaciones](./docs/internal/super-admin/organization-management.md)
- [🔒 Configuración de Seguridad](./docs/internal/super-admin/security-config.md)
- [📊 Monitoreo y Logs](./docs/internal/super-admin/monitoring.md)

### Para Desarrolladores
- [🏗️ Arquitectura de Código](./docs/internal/programmers/code-architecture.md)
- [🗄️ Base de Datos](./docs/internal/programmers/database.md)
- [🧪 Testing](./docs/internal/programmers/testing.md)

### Procesos y Planes
- [🔄 Flujo de Desarrollo](./docs/internal/processes/development-workflow.md)
- [🚀 Roadmap 2024](./docs/internal/plans/development-roadmap.md)

## 🔧 Scripts Organizados

Los scripts están organizados por categoría en el directorio [`/scripts`](./scripts/):

- **🚀 Deployment**: Scripts de despliegue ([docs](./scripts/deployment/README.md))
- **⚙️ Setup**: Scripts de configuración inicial
- **🔧 Maintenance**: Scripts de mantenimiento
- **💻 Development**: Scripts de desarrollo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Desarrollo
- Sigue el [flujo de desarrollo](./docs/internal/processes/development-workflow.md)
- Usa [conventional commits](https://www.conventionalcommits.org/)
- Mantén cobertura de tests > 80%
- Documenta nuevas características

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Sergio Charata**
- GitHub: [@Sergiocharata1977](https://github.com/Sergiocharata1977)

## 🙏 Agradecimientos

- **MongoDB** por la base de datos robusta y escalable
- **React** y **Node.js** por los frameworks
- **TypeScript** por el sistema de tipos
- **Tailwind CSS** por el sistema de diseño
- **Radix UI** por los componentes accesibles

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: [tu-email@ejemplo.com]
- 🐛 Issues: [GitHub Issues](https://github.com/Sergiocharata1977/9001app-v2/issues)

---

**⭐ Si este proyecto te ayuda, considera darle una estrella en GitHub!**
