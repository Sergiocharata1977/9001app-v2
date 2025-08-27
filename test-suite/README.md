# 🧪 Suite de Tests Completa - 9001app-v2

## 📋 Descripción

Suite completa de tests para validar la migración del proyecto **9001app-v2** de Turso SQLite a MongoDB Atlas. Esta suite incluye tests unitarios, de integración, E2E, performance y seguridad para asegurar la calidad del sistema durante y después de la migración.

## 🎯 Objetivos

- ✅ **Validar la migración completa** de Turso a MongoDB Atlas
- ✅ **Asegurar la calidad del código** con cobertura > 90%
- ✅ **Verificar la funcionalidad** de todos los módulos del sistema
- ✅ **Validar el rendimiento** bajo diferentes cargas
- ✅ **Garantizar la seguridad** del sistema
- ✅ **Automatizar el testing** para CI/CD

## 🏗️ Arquitectura de Tests

```
test-suite/
├── unit/                    # Tests unitarios
│   ├── backend/            # Tests del backend
│   ├── frontend/           # Tests del frontend
│   └── shared/             # Tests compartidos
├── integration/            # Tests de integración
│   ├── api/               # Tests de APIs
│   ├── database/          # Tests de base de datos
│   ├── frontend-backend/  # Tests frontend-backend
│   └── agents/            # Tests de agentes
├── e2e/                   # Tests end-to-end
│   ├── user-flows/        # Flujos de usuario
│   ├── performance/       # Tests de performance
│   └── security/          # Tests de seguridad
├── performance/           # Tests de performance
│   ├── load/             # Tests de carga
│   ├── stress/           # Tests de estrés
│   └── monitoring/       # Monitoreo
├── security/             # Tests de seguridad
│   ├── authentication/   # Tests de autenticación
│   ├── authorization/    # Tests de autorización
│   ├── data-protection/  # Tests de protección de datos
│   └── api-security/     # Tests de seguridad de API
├── visual/               # Tests visuales
│   ├── screenshots/      # Capturas de pantalla
│   ├── responsive/       # Tests responsive
│   └── accessibility/    # Tests de accesibilidad
├── data/                 # Datos de prueba
│   ├── fixtures/         # Datos de prueba
│   ├── mocks/            # Mocks
│   └── scenarios/        # Escenarios de prueba
├── reports/              # Reportes
│   ├── test-results/     # Resultados de tests
│   ├── coverage-reports/ # Reportes de cobertura
│   ├── performance-reports/ # Reportes de performance
│   └── security-reports/ # Reportes de seguridad
├── config/               # Configuración
└── scripts/              # Scripts de ejecución
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local o Atlas)
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Sergiocharata1977/9001app-v2.git
cd 9001app-v2

# Instalar dependencias de la suite de tests
cd test-suite
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Configuración de Variables de Entorno

```env
# Entorno de testing
NODE_ENV=test
TEST_DATABASE_URL=mongodb://localhost:27017/9001app-v2-test
TEST_API_URL=http://localhost:5000/api
TEST_TIMEOUT=30000
COVERAGE_THRESHOLD=90

# MongoDB Atlas (para tests de integración)
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/9001app-v2-test

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# API Keys (si es necesario)
API_KEY=your-api-key
```

## 🧪 Ejecución de Tests

### Comandos Principales

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm run test:unit          # Solo tests unitarios
npm run test:integration   # Solo tests de integración
npm run test:e2e          # Solo tests E2E
npm run test:performance  # Solo tests de performance
npm run test:security     # Solo tests de seguridad

# Tests con opciones
npm run test:coverage     # Tests con reporte de cobertura
npm run test:watch        # Tests en modo watch
npm run test:ci          # Tests para CI/CD
```

### Scripts Avanzados

```bash
# Usando el script principal
./scripts/run-all-tests.sh                    # Todos los tests
./scripts/run-all-tests.sh --unit-only        # Solo unitarios
./scripts/run-all-tests.sh --e2e-only         # Solo E2E
./scripts/run-all-tests.sh --no-cleanup       # Sin limpieza

# Tests E2E con Playwright
npm run e2e:run          # Ejecutar tests E2E
npm run e2e:ui           # Interfaz visual de tests
npm run e2e:debug        # Modo debug

# Tests de Performance con k6
npm run performance:load    # Tests de carga
npm run performance:stress  # Tests de estrés
npm run performance:memory  # Tests de memoria
```

## 📊 Tipos de Tests

### 1. Tests Unitarios

**Ubicación:** `test-suite/unit/`

**Descripción:** Tests que validan funciones y componentes individuales.

**Ejemplos:**
- Controladores de autenticación
- Modelos de base de datos
- Componentes de React
- Utilidades y helpers

**Ejecución:**
```bash
npm run test:unit
```

### 2. Tests de Integración

**Ubicación:** `test-suite/integration/`

**Descripción:** Tests que validan la interacción entre componentes.

**Ejemplos:**
- APIs REST completas
- Operaciones de base de datos
- Comunicación frontend-backend
- Coordinación de agentes

**Ejecución:**
```bash
npm run test:integration
```

### 3. Tests E2E

**Ubicación:** `test-suite/e2e/`

**Descripción:** Tests que simulan el uso real del sistema.

**Ejemplos:**
- Flujos completos de usuario
- Procesos de negocio
- Validación de UI/UX
- Casos de uso críticos

**Ejecución:**
```bash
npm run test:e2e
```

### 4. Tests de Performance

**Ubicación:** `test-suite/performance/`

**Descripción:** Tests que validan el rendimiento del sistema.

**Ejemplos:**
- Carga de usuarios concurrentes
- Tiempos de respuesta
- Uso de memoria
- Escalabilidad

**Ejecución:**
```bash
npm run test:performance
```

### 5. Tests de Seguridad

**Ubicación:** `test-suite/security/`

**Descripción:** Tests que validan la seguridad del sistema.

**Ejemplos:**
- Autenticación y autorización
- Protección contra ataques
- Validación de inputs
- Encriptación de datos

**Ejecución:**
```bash
npm run test:security
```

## 📈 Métricas y Criterios de Éxito

### Cobertura de Código
- **Objetivo:** > 90%
- **Backend:** > 95%
- **Frontend:** > 85%
- **Compartido:** > 90%

### Performance
- **Tiempo de respuesta:** < 2 segundos
- **Throughput:** > 1000 req/s
- **Uso de memoria:** < 512MB
- **CPU:** < 80%

### Seguridad
- **Vulnerabilidades críticas:** 0
- **Vulnerabilidades altas:** < 5
- **Cumplimiento OWASP:** 100%

### Calidad
- **Tasa de fallos:** < 1%
- **Tests estables:** > 99%
- **Tiempo de ejecución:** < 10 minutos

## 📋 Checklist de Validación

### ✅ Migración de Base de Datos
- [ ] Esquemas MongoDB creados correctamente
- [ ] Datos migrados sin pérdida
- [ ] Índices optimizados
- [ ] Consultas funcionando
- [ ] Transacciones válidas

### ✅ APIs y Endpoints
- [ ] Todos los endpoints funcionando
- [ ] Autenticación válida
- [ ] Autorización correcta
- [ ] Validación de inputs
- [ ] Manejo de errores

### ✅ Frontend
- [ ] Componentes renderizando correctamente
- [ ] Navegación funcionando
- [ ] Formularios válidos
- [ ] Estados manejados
- [ ] Responsive design

### ✅ Performance
- [ ] Tiempos de respuesta aceptables
- [ ] Carga de usuarios concurrentes
- [ ] Uso de recursos optimizado
- [ ] Escalabilidad verificada

### ✅ Seguridad
- [ ] Autenticación segura
- [ ] Autorización robusta
- [ ] Inputs sanitizados
- [ ] Datos encriptados
- [ ] Headers de seguridad

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Tests de Base de Datos Fallan
```bash
# Verificar conexión a MongoDB
mongosh --eval "db.runCommand('ping')"

# Limpiar base de datos de test
npm run cleanup
```

#### 2. Tests E2E Fallan
```bash
# Instalar navegadores de Playwright
npx playwright install

# Verificar que el servidor esté corriendo
curl http://localhost:3000/health
```

#### 3. Tests de Performance Fallan
```bash
# Verificar que k6 esté instalado
k6 version

# Verificar recursos del sistema
htop
```

#### 4. Cobertura Baja
```bash
# Ejecutar tests con cobertura detallada
npm run test:coverage

# Revisar reporte HTML
open test-suite/reports/coverage-reports/index.html
```

### Logs y Debugging

```bash
# Ver logs detallados
DEBUG=* npm test

# Ejecutar tests específicos con debug
npm test -- --verbose --testNamePattern="auth"

# Ver reportes de errores
cat test-suite/reports/test-results/*.json | jq '.testResults[].message'
```

## 📚 Documentación Adicional

### Guías Específicas
- [Guía de Tests Unitarios](docs/unit-testing-guide.md)
- [Guía de Tests E2E](docs/e2e-testing-guide.md)
- [Guía de Performance Testing](docs/performance-testing-guide.md)
- [Guía de Security Testing](docs/security-testing-guide.md)

### Referencias
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [k6 Documentation](https://k6.io/docs/)
- [MongoDB Testing](https://docs.mongodb.com/drivers/node/current/)

## 🤝 Contribución

### Agregar Nuevos Tests

1. **Crear archivo de test** en la ubicación apropiada
2. **Seguir convenciones** de nomenclatura
3. **Incluir mocks** y fixtures necesarios
4. **Documentar** el propósito del test
5. **Ejecutar** para verificar que funciona

### Ejemplo de Test

```javascript
describe('MiNuevoTest', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = await myFunction(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## 📞 Soporte

### Contacto
- **Coordinador:** Agente 1
- **Tester Senior:** [Tu nombre]
- **Email:** [tu-email@example.com]

### Issues y Bugs
- Crear issue en GitHub con etiqueta `testing`
- Incluir logs y pasos para reproducir
- Adjuntar screenshots si es necesario

---

**Última actualización:** $(date)
**Versión:** 1.0.0
**Estado:** ✅ Completado