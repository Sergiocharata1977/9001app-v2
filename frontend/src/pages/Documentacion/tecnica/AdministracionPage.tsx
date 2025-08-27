import React, { useState } from 'react';
import { Settings, Shield, Users, Database, Activity, AlertTriangle, Building2, Key, Lock, Eye, Code, Terminal, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const AdministracionPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const rolesSistema = [
    {
      rol: 'super_admin',
      descripcion: 'Administrador del sistema multi-tenant',
      permisos: [
        'Acceso a todas las organizaciones',
        'Crear y gestionar organizaciones',
        'Configuración global del sistema',
        'Acceso a logs y métricas',
        'Gestión de planes y suscripciones',
        'Crear super admins y admins',
        'Monitoreo global del sistema'
      ],
      color: 'bg-red-500',
      icon: Shield
    },
    {
      rol: 'admin',
      descripcion: 'Administrador de una organización',
      permisos: [
        'Gestión completa de su organización',
        'Crear y gestionar usuarios (admin, manager, employee)',
        'Configurar departamentos y puestos',
        'Acceso a todos los módulos de su organización',
        'Generar reportes ejecutivos',
        'Configuración local de la organización',
        'Monitoreo de usuarios de su organización'
      ],
      color: 'bg-blue-500',
      icon: Building2
    },
    {
      rol: 'manager',
      descripcion: 'Gerente de área o departamento',
      permisos: [
        'Supervisar procesos de su área',
        'Gestionar personal asignado',
        'Aprobar acciones y hallazgos',
        'Generar reportes de área',
        'Configurar indicadores',
        'Acceso a módulos específicos de su área'
      ],
      color: 'bg-green-500',
      icon: Users
    },
    {
      rol: 'employee',
      descripcion: 'Usuario operativo del sistema',
      permisos: [
        'Acceso a módulos asignados',
        'Crear y gestionar registros',
        'Ver reportes de su área',
        'Participar en auditorías',
        'Actualizar información personal',
        'Acceso limitado según permisos'
      ],
      color: 'bg-gray-500',
      icon: Users
    }
  ];

  const configuracionesSistema = [
    {
      categoria: 'Autenticación y Seguridad',
      configuraciones: [
        { nombre: 'JWT_SECRET', descripcion: 'Clave secreta para tokens JWT', tipo: 'string', requerido: true },
        { nombre: 'JWT_REFRESH_SECRET', descripcion: 'Clave para refresh tokens', tipo: 'string', requerido: true },
        { nombre: 'JWT_EXPIRES_IN', descripcion: 'Tiempo de expiración del token', tipo: 'string', requerido: true },
        { nombre: 'JWT_REFRESH_EXPIRES_IN', descripcion: 'Tiempo de expiración del refresh token', tipo: 'string', requerido: true }
      ]
    },
    {
      categoria: 'Base de Datos',
      configuraciones: [
        { nombre: 'DATABASE_URL', descripcion: 'URL de conexión a MongoDB', tipo: 'string', requerido: true },
        { nombre: 'DATABASE_AUTH_TOKEN', descripcion: 'Token de autenticación Turso', tipo: 'string', requerido: true }
      ]
    },
    {
      categoria: 'Servidor',
      configuraciones: [
        { nombre: 'PORT', descripcion: 'Puerto del servidor backend', tipo: 'number', requerido: true },
        { nombre: 'NODE_ENV', descripcion: 'Entorno de ejecución', tipo: 'string', requerido: true },
        { nombre: 'CORS_ORIGIN', descripcion: 'Origen permitido para CORS', tipo: 'string', requerido: true }
      ]
    }
  ];

  const endpointsAPI = [
    {
      categoria: 'Autenticación',
      endpoints: [
        { metodo: 'POST', ruta: '/api/auth/login', descripcion: 'Iniciar sesión', rol: 'Todos' },
        { metodo: 'POST', ruta: '/api/auth/register', descripcion: 'Registrar usuario', rol: 'Todos' },
        { metodo: 'GET', ruta: '/api/auth/verify', descripcion: 'Verificar token', rol: 'Autenticados' },
        { metodo: 'POST', ruta: '/api/auth/refresh', descripcion: 'Refrescar token', rol: 'Autenticados' }
      ]
    },
    {
      categoria: 'Super Administrador',
      endpoints: [
        { metodo: 'GET', ruta: '/api/admin/organizations', descripcion: 'Listar organizaciones', rol: 'super_admin' },
        { metodo: 'POST', ruta: '/api/admin/organizations', descripcion: 'Crear organización', rol: 'super_admin' },
        { metodo: 'PUT', ruta: '/api/admin/organizations/:id', descripcion: 'Actualizar organización', rol: 'super_admin' },
        { metodo: 'GET', ruta: '/api/admin/users', descripcion: 'Listar usuarios globales', rol: 'super_admin' },
        { metodo: 'POST', ruta: '/api/admin/users', descripcion: 'Crear usuario global', rol: 'super_admin' },
        { metodo: 'PUT', ruta: '/api/admin/users/:id', descripcion: 'Actualizar usuario global', rol: 'super_admin' },
        { metodo: 'DELETE', ruta: '/api/admin/users/:id', descripcion: 'Eliminar usuario global', rol: 'super_admin' }
      ]
    },
    {
      categoria: 'Administrador de Organización',
      endpoints: [
        { metodo: 'GET', ruta: '/api/admin/organization/:id/users', descripcion: 'Listar usuarios de organización', rol: 'admin' },
        { metodo: 'POST', ruta: '/api/admin/organization/:id/users', descripcion: 'Crear usuario en organización', rol: 'admin' },
        { metodo: 'PUT', ruta: '/api/admin/organization/:id/users/:userId', descripcion: 'Actualizar usuario de organización', rol: 'admin' },
        { metodo: 'DELETE', ruta: '/api/admin/organization/:id/users/:userId', descripcion: 'Eliminar usuario de organización', rol: 'admin' }
      ]
    }
  ];

  const comandosUtil = [
    {
      categoria: 'Configuración Inicial',
      comandos: [
        { comando: 'node backend/scripts/setup-admin-users.js', descripcion: 'Crear usuarios administrativos iniciales' },
        { comando: 'node backend/scripts/create-admin-user.js', descripcion: 'Crear solo super administrador' },
        { comando: 'node backend/scripts/create-org-admin-user.js', descripcion: 'Crear solo admin de organización' }
      ]
    },
    {
      categoria: 'Testing y Validación',
      comandos: [
        { comando: 'node scripts/test-admin-system.js', descripcion: 'Probar sistema administrativo completo' },
        { comando: 'npm run smoke', descripcion: 'Ejecutar smoke tests' },
        { comando: 'curl -X GET http://localhost:5000/api/health', descripcion: 'Verificar salud del servidor' }
      ]
    },
    {
      categoria: 'Gestión de Procesos',
      comandos: [
        { comando: 'pm2 status', descripcion: 'Ver estado de procesos PM2' },
        { comando: 'pm2 logs 9001app2-backend', descripcion: 'Ver logs del backend' },
        { comando: 'pm2 restart 9001app2-backend', descripcion: 'Reiniciar backend' },
        { comando: 'systemctl status nginx', descripcion: 'Ver estado de nginx' }
      ]
    }
  ];

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-blue-100 text-blue-800',
      'manager': 'bg-green-100 text-green-800',
      'employee': 'bg-gray-100 text-gray-800',
      'Todos': 'bg-purple-100 text-purple-800',
      'Autenticados': 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🏛️ Sistema Administrativo - Documentación Técnica
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Documentación completa del sistema de administración multi-tenant de ISOFlow4
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
          <TabsTrigger value="commands">Comandos</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Arquitectura del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Backend (Node.js + Express)</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Controladores modulares para cada funcionalidad</li>
                    <li>• Middleware de autenticación y autorización</li>
                    <li>• Base de datos Turso (LibSQL)</li>
                    <li>• Validación de datos con Joi</li>
                    <li>• Logging estructurado</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Frontend (React + Vite)</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Componentes reutilizables</li>
                    <li>• Gestión de estado con Zustand</li>
                    <li>• Protección de rutas por rol</li>
                    <li>• UI moderna con shadcn/ui</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Super Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Gestión global del sistema multi-tenant
                </p>
                <Badge className="bg-red-100 text-red-800">Acceso Completo</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Admin Organización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Gestión local de su organización
                </p>
                <Badge className="bg-blue-100 text-blue-800">Acceso Local</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-500" />
                  Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  MongoDB con soporte multi-tenant
                </p>
                <Badge className="bg-green-100 text-green-800">Multi-Tenant</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sistema de Roles y Permisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rolesSistema.map((rol) => {
                  const Icon = rol.icon;
                  return (
                    <Card key={rol.rol} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          {rol.rol.replace('_', ' ').toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{rol.descripcion}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {rol.permisos.map((permiso, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {permiso}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {configuracionesSistema.map((categoria) => (
                  <div key={categoria.categoria}>
                    <h3 className="font-semibold mb-3 text-lg">{categoria.categoria}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {categoria.configuraciones.map((config) => (
                        <div key={config.nombre} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-mono text-sm font-semibold">{config.nombre}</div>
                            <div className="text-sm text-gray-600">{config.descripcion}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{config.tipo}</Badge>
                            {config.requerido && (
                              <Badge className="bg-red-100 text-red-800">Requerido</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {endpointsAPI.map((categoria) => (
                  <div key={categoria.categoria}>
                    <h3 className="font-semibold mb-3 text-lg">{categoria.categoria}</h3>
                    <div className="space-y-2">
                      {categoria.endpoints.map((endpoint) => (
                        <div key={endpoint.ruta} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge className={getMethodColor(endpoint.metodo)}>
                              {endpoint.metodo}
                            </Badge>
                            <code className="font-mono text-sm">{endpoint.ruta}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{endpoint.descripcion}</span>
                            <Badge className={getRoleColor(endpoint.rol)}>
                              {endpoint.rol}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Comandos Útiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {comandosUtil.map((categoria) => (
                  <div key={categoria.categoria}>
                    <h3 className="font-semibold mb-3 text-lg">{categoria.categoria}</h3>
                    <div className="space-y-2">
                      {categoria.comandos.map((comando) => (
                        <div key={comando.comando} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                            {comando.comando}
                          </div>
                          <div className="text-sm text-gray-600">{comando.descripcion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Problemas Comunes</h3>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-l-red-500 bg-red-50">
                      <h4 className="font-semibold text-red-800">Error 403 - Acceso Denegado</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Verificar que el usuario tenga el rol correcto y el token sea válido.
                      </p>
                      <code className="text-xs mt-2 block">
                        console.log(authStore.getUserRole());
                      </code>
                    </div>

                    <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
                      <h4 className="font-semibold text-yellow-800">Error de Conexión a Base de Datos</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Verificar variables de entorno DATABASE_URL y DATABASE_AUTH_TOKEN.
                      </p>
                      <code className="text-xs mt-2 block">
                        node backend/scripts/test-db-connection.js
                      </code>
                    </div>

                    <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                      <h4 className="font-semibold text-blue-800">Error al Crear Usuario</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Verificar que el email no exista y la organización sea válida.
                      </p>
                      <code className="text-xs mt-2 block">
                        SELECT * FROM usuarios WHERE email = 'email@ejemplo.com';
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 text-lg">Logs y Debugging</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-semibold text-sm">Backend Logs</h4>
                      <code className="text-xs">pm2 logs 9001app2-backend</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-semibold text-sm">Estado de Servicios</h4>
                      <code className="text-xs">pm2 status</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-semibold text-sm">Nginx Status</h4>
                      <code className="text-xs">systemctl status nginx</code>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-semibold text-sm">Test del Sistema</h4>
                      <code className="text-xs">node scripts/test-admin-system.js</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdministracionPage; 
