// Mocks para APIs
const mockApiResponses = {
  // Auth endpoints
  login: {
    success: {
      status: 200,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'user-001',
          email: 'user@test.com',
          role: 'user',
          name: 'Test User'
        }
      }
    },
    error: {
      status: 401,
      data: {
        message: 'Invalid credentials'
      }
    }
  },

  // User endpoints
  getUsers: {
    success: {
      status: 200,
      data: [
        {
          id: 'user-001',
          email: 'user@test.com',
          role: 'user',
          name: 'Test User'
        }
      ]
    }
  },

  // Organization endpoints
  getOrganizations: {
    success: {
      status: 200,
      data: [
        {
          id: 'org-001',
          name: 'Test Organization',
          isActive: true
        }
      ]
    }
  },

  // Audit endpoints
  getAudits: {
    success: {
      status: 200,
      data: [
        {
          id: 'audit-001',
          title: 'Test Audit',
          status: 'pending',
          organization: 'org-001'
        }
      ]
    }
  }
};

// Mock para axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  create: jest.fn(() => mockAxios),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

// Mock para fetch
global.fetch = jest.fn();

// Mock para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock para sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

module.exports = {
  mockApiResponses,
  mockAxios,
  localStorageMock,
  sessionStorageMock
};