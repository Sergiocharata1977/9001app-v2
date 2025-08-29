import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Settings, 
  Activity,
  Shield,
  UserCheck,
  BarChart3,
  Bot
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import OrganizationModal from './OrganizationModal';
import UserModal from './UserModal';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';

const SuperAdminPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgsResponse, usersResponse] = await Promise.all([
        adminService.getAllOrganizations(),
        adminService.getAllUsers()
      ]);
      
      // Corregir acceso a los datos - el backend devuelve { success: true, data: [...], total: ... }
      setOrganizations(orgsResponse.data.data || []);
      setUsers(usersResponse.data.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Inicializar arrays vacíos en caso de error
      setOrganizations([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = () => {
    setSelectedOrganization(null);
    setShowOrganizationModal(true);
  };

  const handleEditOrganization = (org) => {
    setSelectedOrganization(org);
    setShowOrganizationModal(true);
  };

  const handleOrganizationSuccess = () => {
    loadData(); // Recargar datos
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUserSuccess = () => {
    loadData(); // Recargar datos
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await adminService.deleteUser(userId);
        loadData(); // Recargar datos
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'super_admin': { color: 'bg-purple-100 text-purple-800', icon: Shield },
      'admin': { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      'manager': { color: 'bg-green-100 text-green-800', icon: Users },
      'employee': { color: 'bg-gray-100 text-gray-800', icon: Users }
    };
    
    const config = roleConfig[role] || roleConfig.employee;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (isActive) => (
    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando panel de administración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel Super Administrador
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestión global de organizaciones y usuarios
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('dashboard')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('organizations')}>
            <Building2 className="w-4 h-4 mr-2" />
            Organizaciones
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('users')}>
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('agents')}>
            <Bot className="w-4 h-4 mr-2" />
            Agentes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
          <TabsTrigger value="users">Usuarios Globales</TabsTrigger>
          <TabsTrigger value="agents">🤖 Agent Coordinator</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Organizaciones ({Array.isArray(organizations) ? organizations.length : 0})</CardTitle>
              <Button onClick={handleCreateOrganization}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Organización
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Array.isArray(organizations) && organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Building2 className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{org.name}</h3>
                        <p className="text-sm text-gray-600">{org.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(org.is_active)}
                          <Badge variant="outline">{org.plan}</Badge>
                          <Badge variant="outline">{org.total_users || 0} usuarios</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditOrganization(org)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuarios Globales ({Array.isArray(users) ? users.length : 0})</CardTitle>
              <Button onClick={handleCreateUser}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Array.isArray(users) && users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.is_active)}
                          <Badge variant="outline">{user.organization_name}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <AgentDashboard />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Features por Organización</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aquí podrás habilitar/deshabilitar módulos específicos para cada organización.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoreo Global</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Organizaciones Activas</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {Array.isArray(organizations) ? organizations.filter(org => org.is_active).length : 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Usuarios Totales</p>
                      <p className="text-2xl font-bold text-green-900">{Array.isArray(users) ? users.length : 0}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Sesiones Activas</p>
                      <p className="text-2xl font-bold text-purple-900">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para crear/editar organizaciones */}
      <OrganizationModal
        isOpen={showOrganizationModal}
        onClose={() => setShowOrganizationModal(false)}
        organization={selectedOrganization}
        onSuccess={handleOrganizationSuccess}
      />

      {/* Modal para crear/editar usuarios */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        organizations={organizations}
        onSuccess={handleUserSuccess}
      />
    </div>
  );
};

export default SuperAdminPanel; 