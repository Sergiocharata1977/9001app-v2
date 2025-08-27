import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Server, 
  Shield, 
  Key, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info,
  Code,
  Settings
} from 'lucide-react';

const ConfiguracionEntornos = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Configuración de Entornos</h1>
          <p className="text-gray-600">Documentación técnica para administradores del sistema</p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Acceso Restringido:</strong> Esta documentación es solo para administradores del sistema.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="development">Desarrollo</TabsTrigger>
          <TabsTrigger value="production">Producción</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Arquitectura de Entornos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-800">🏠 Desarrollo Local</h3>
                  <p className="text-sm text-blue-600">Base de datos separada para desarrollo</p>
                  <Badge variant="secondary" className="mt-2">.env.local</Badge>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800">🖥️ Producción VPS</h3>
                  <p className="text-sm text-green-600">Base de datos principal en servidor</p>
                  <Badge variant="secondary" className="mt-2">.env.production</Badge>
                </div>
                <div className="border rounded-lg p-4 bg-orange-50">
                  <h3 className="font-semibold text-orange-800">🔧 Configuración</h3>
                  <p className="text-sm text-orange-600">Sistema de carga automática</p>
                  <Badge variant="secondary" className="mt-2">Prioridad</Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Orden de Carga de Configuración:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li><code>.env.local</code> - Configuración local (máxima prioridad)</li>
                  <li><code>.env.development</code> - Configuración de desarrollo</li>
                  <li><code>.env</code> - Configuración por defecto</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Configuración de Desarrollo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para desarrollo local, crear una base de datos separada en Turso para evitar conflictos con producción.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">📝 Pasos para Configurar Desarrollo:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Ir a <a href="https://turso.tech" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">turso.tech</a></li>
                  <li>Crear nueva base de datos (ej: <code>iso-flow-dev</code>)</li>
                  <li>Copiar credenciales de la nueva base de datos</li>
                  <li>Crear archivo <code>.env.local</code> en carpeta backend</li>
                  <li>Pegar credenciales en el archivo</li>
                </ol>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div className="mb-2"># Contenido para .env.local:</div>
                  <div>MONGODB_URI=mongodb://tu-base-desarrollo.turso.io</div>
                  <div>MONGODB_AUTH_TOKEN=eyJ... (tu token completo)</div>
                  <div>JWT_SECRET=desarrollo-local-secret-key-123456789</div>
                  <div>PORT=5000</div>
                  <div>NODE_ENV=development</div>
                  <div>DEFAULT_ORG_ID=1</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configuración de Producción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Las credenciales de producción están en el servidor VPS y no deben compartirse.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-semibold">🖥️ Variables de Entorno en Producción:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium">Base de Datos:</h5>
                    <ul className="text-sm space-y-1">
                      <li><code>MONGODB_URI</code> - URL de Turso</li>
                      <li><code>MONGODB_AUTH_TOKEN</code> - Token de autenticación</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">Seguridad:</h5>
                    <ul className="text-sm space-y-1">
                      <li><code>JWT_SECRET</code> - Clave JWT</li>
                      <li><code>SESSION_SECRET</code> - Clave de sesión</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">Servidor:</h5>
                    <ul className="text-sm space-y-1">
                      <li><code>PORT</code> - Puerto del servidor</li>
                      <li><code>NODE_ENV</code> - Entorno (production)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">CORS:</h5>
                    <ul className="text-sm space-y-1">
                      <li><code>CORS_ORIGIN</code> - Dominios permitidos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad y Mejores Prácticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 NO HACER:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Compartir credenciales de producción</li>
                    <li>• Subir archivos .env al repositorio</li>
                    <li>• Usar la misma base de datos para desarrollo y producción</li>
                    <li>• Usar claves débiles para JWT_SECRET</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ SÍ HACER:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Usar .env.local para desarrollo local</li>
                    <li>• Crear base de datos separada para desarrollo</li>
                    <li>• Usar claves fuertes y únicas</li>
                    <li>• Mantener .env en .gitignore</li>
                    <li>• Rotar credenciales regularmente</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔧 Comandos Útiles:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Verificar configuración:</strong>
                      <code className="block bg-gray-100 p-1 rounded mt-1">node -e "console.log(process.env.NODE_ENV)"</code>
                    </div>
                    <div>
                      <strong>Probar conexión a Turso:</strong>
                      <code className="block bg-gray-100 p-1 rounded mt-1">node scripts/test-db-connection.js</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivos de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">📁 Estructura de Archivos:</h4>
                <div className="text-sm space-y-1">
                  <div><code>backend/.env.local</code> - Desarrollo local</div>
                  <div><code>backend/.env.development</code> - Desarrollo</div>
                  <div><code>backend/.env</code> - Por defecto</div>
                  <div><code>backend/env-local-template.txt</code> - Template</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔧 Archivos de Sistema:</h4>
                <div className="text-sm space-y-1">
                  <div><code>backend/config/env-setup.js</code> - Cargador</div>
                  <div><code>backend/lib/tursoClient.js</code> - Cliente DB</div>
                  <div><code>.gitignore</code> - Protección</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracionEntornos; 