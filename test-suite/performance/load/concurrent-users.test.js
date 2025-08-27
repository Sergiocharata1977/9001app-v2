import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const successRate = new Rate('success');

// Configuración de la prueba
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Rampa de 0 a 10 usuarios en 2 minutos
    { duration: '5m', target: 10 }, // Mantener 10 usuarios por 5 minutos
    { duration: '2m', target: 50 }, // Rampa de 10 a 50 usuarios en 2 minutos
    { duration: '5m', target: 50 }, // Mantener 50 usuarios por 5 minutos
    { duration: '2m', target: 100 }, // Rampa de 50 a 100 usuarios en 2 minutos
    { duration: '5m', target: 100 }, // Mantener 100 usuarios por 5 minutos
    { duration: '2m', target: 0 }, // Rampa descendente a 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de las requests deben completarse en menos de 2 segundos
    http_req_failed: ['rate<0.1'], // Menos del 10% de requests deben fallar
    errors: ['rate<0.05'], // Menos del 5% de errores
    success: ['rate>0.95'], // Más del 95% de éxito
  },
};

// Variables globales
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Función para generar datos de prueba
function generateTestData() {
  return {
    email: `test${Date.now()}${Math.random()}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${Date.now()}`,
  };
}

// Función para obtener token de autenticación
function getAuthToken() {
  const loginData = {
    email: 'admin@test.com',
    password: 'TestPassword123!'
  };

  const loginResponse = http.post(`${API_BASE}/auth/login`, JSON.stringify(loginData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (loginResponse.status === 200) {
    const responseBody = JSON.parse(loginResponse.body);
    return responseBody.token;
  }

  return null;
}

// Función principal de la prueba
export default function() {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };

  // Grupo de tests para autenticación
  const authTests = () => {
    const testData = generateTestData();

    // Test de registro
    const registerResponse = http.post(`${API_BASE}/auth/register`, JSON.stringify(testData), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(registerResponse, {
      'register status is 201': (r) => r.status === 201,
      'register response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    if (registerResponse.status === 201) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    // Test de login
    const loginResponse = http.post(`${API_BASE}/auth/login`, JSON.stringify({
      email: testData.email,
      password: testData.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(loginResponse, {
      'login status is 200': (r) => r.status === 200,
      'login response time < 1000ms': (r) => r.timings.duration < 1000,
      'login returns token': (r) => JSON.parse(r.body).token !== undefined,
    });

    if (loginResponse.status === 200) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    sleep(1);
  };

  // Grupo de tests para operaciones CRUD de usuarios
  const userCrudTests = () => {
    if (!token) {
      errorRate.add(1);
      return;
    }

    // GET /api/admin/users
    const getUsersResponse = http.get(`${API_BASE}/admin/users`, { headers });

    check(getUsersResponse, {
      'get users status is 200': (r) => r.status === 200,
      'get users response time < 2000ms': (r) => r.timings.duration < 2000,
      'get users returns array': (r) => Array.isArray(JSON.parse(r.body).users),
    });

    if (getUsersResponse.status === 200) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    // POST /api/admin/users
    const newUserData = generateTestData();
    const createUserResponse = http.post(`${API_BASE}/admin/users`, JSON.stringify(newUserData), { headers });

    check(createUserResponse, {
      'create user status is 201': (r) => r.status === 201,
      'create user response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    if (createUserResponse.status === 201) {
      successRate.add(1);
      
      const createdUser = JSON.parse(createUserResponse.body).user;
      
      // PUT /api/admin/users/:id
      const updateData = { name: 'Updated User Name' };
      const updateUserResponse = http.put(`${API_BASE}/admin/users/${createdUser.id}`, JSON.stringify(updateData), { headers });

      check(updateUserResponse, {
        'update user status is 200': (r) => r.status === 200,
        'update user response time < 2000ms': (r) => r.timings.duration < 2000,
      });

      if (updateUserResponse.status === 200) {
        successRate.add(1);
      } else {
        errorRate.add(1);
      }

      // DELETE /api/admin/users/:id
      const deleteUserResponse = http.del(`${API_BASE}/admin/users/${createdUser.id}`, null, { headers });

      check(deleteUserResponse, {
        'delete user status is 200': (r) => r.status === 200,
        'delete user response time < 2000ms': (r) => r.timings.duration < 2000,
      });

      if (deleteUserResponse.status === 200) {
        successRate.add(1);
      } else {
        errorRate.add(1);
      }
    } else {
      errorRate.add(1);
    }

    sleep(1);
  };

  // Grupo de tests para operaciones de organizaciones
  const organizationTests = () => {
    if (!token) {
      errorRate.add(1);
      return;
    }

    // GET /api/admin/organizations
    const getOrgsResponse = http.get(`${API_BASE}/admin/organizations`, { headers });

    check(getOrgsResponse, {
      'get organizations status is 200': (r) => r.status === 200,
      'get organizations response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    if (getOrgsResponse.status === 200) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    // POST /api/admin/organizations
    const newOrgData = {
      name: `Test Organization ${Date.now()}`,
      description: 'Test organization description',
      address: '123 Test Street',
      phone: '+1234567890',
      email: `org${Date.now()}@example.com`,
    };

    const createOrgResponse = http.post(`${API_BASE}/admin/organizations`, JSON.stringify(newOrgData), { headers });

    check(createOrgResponse, {
      'create organization status is 201': (r) => r.status === 201,
      'create organization response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    if (createOrgResponse.status === 201) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    sleep(1);
  };

  // Grupo de tests para dashboard y analytics
  const dashboardTests = () => {
    if (!token) {
      errorRate.add(1);
      return;
    }

    // GET /api/admin/dashboard
    const dashboardResponse = http.get(`${API_BASE}/admin/dashboard`, { headers });

    check(dashboardResponse, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time < 3000ms': (r) => r.timings.duration < 3000,
      'dashboard returns statistics': (r) => {
        const body = JSON.parse(r.body);
        return body.totalUsers !== undefined && body.totalOrganizations !== undefined;
      },
    });

    if (dashboardResponse.status === 200) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    // GET /api/admin/analytics
    const analyticsResponse = http.get(`${API_BASE}/admin/analytics`, { headers });

    check(analyticsResponse, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics response time < 5000ms': (r) => r.timings.duration < 5000,
    });

    if (analyticsResponse.status === 200) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    sleep(2);
  };

  // Grupo de tests para operaciones de auditorías
  const auditTests = () => {
    if (!token) {
      errorRate.add(1);
      return;
    }

    // GET /api/auditorias
    const getAuditsResponse = http.get(`${API_BASE}/auditorias`, { headers });

    check(getAuditsResponse, {
      'get audits status is 200': (r) => r.status === 200,
      'get audits response time < 3000ms': (r) => r.timings.duration < 3000,
    });

    if (getAuditsResponse.status === 200) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    // POST /api/auditorias
    const newAuditData = {
      title: `Test Audit ${Date.now()}`,
      description: 'Test audit description',
      type: 'internal',
      status: 'pending',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
    };

    const createAuditResponse = http.post(`${API_BASE}/auditorias`, JSON.stringify(newAuditData), { headers });

    check(createAuditResponse, {
      'create audit status is 201': (r) => r.status === 201,
      'create audit response time < 3000ms': (r) => r.timings.duration < 3000,
    });

    if (createAuditResponse.status === 201) {
      successRate.add(1);
    } else {
      errorRate.add(1);
    }

    sleep(1);
  };

  // Ejecutar todos los grupos de tests
  authTests();
  userCrudTests();
  organizationTests();
  dashboardTests();
  auditTests();
}

// Función de setup (se ejecuta una vez al inicio)
export function setup() {
  console.log('Starting load test setup...');
  
  // Verificar que el servidor esté disponible
  const healthCheck = http.get(`${BASE_URL}/health`);
  
  if (healthCheck.status !== 200) {
    throw new Error('Server is not available');
  }
  
  console.log('Load test setup completed');
}

// Función de teardown (se ejecuta una vez al final)
export function teardown(data) {
  console.log('Load test completed');
  console.log('Final error rate:', errorRate.value);
  console.log('Final success rate:', successRate.value);
}