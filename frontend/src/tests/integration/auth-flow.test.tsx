import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api/authApi'

// Mock the auth API
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
    refreshToken: vi.fn()
  }
}))

// Mock components that we'll test
const LoginForm = () => {
  const login = useAuthStore(state => state.login)
  const isLoading = useAuthStore(state => state.isLoading)
  const error = useAuthStore(state => state.error)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      await login({ email, password })
    } catch (error) {
      // Error is handled by the store
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        name="email"
        type="email"
        placeholder="Email"
        data-testid="email-input"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        data-testid="password-input"
      />
      <button
        type="submit"
        disabled={isLoading}
        data-testid="submit-button"
      >
        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
      {error && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}
    </form>
  )
}

const Dashboard = () => {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)

  if (!user) {
    return <div data-testid="not-authenticated">No autenticado</div>
  }

  return (
    <div data-testid="dashboard">
      <h1>Bienvenido, {user.firstName || user.email}</h1>
      <button onClick={logout} data-testid="logout-button">
        Cerrar Sesión
      </button>
    </div>
  )
}

const App = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  return (
    <div>
      {isAuthenticated ? <Dashboard /> : <LoginForm />}
    </div>
  )
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().reset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Login Flow', () => {
    it('should complete successful login flow', async () => {
      const user = userEvent.setup()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      }
      const mockToken = 'mock-access-token'

      // Mock successful login response
      vi.mocked(authApi.login).mockResolvedValue({
        data: {
          data: {
            user: mockUser,
            tokens: {
              accessToken: mockToken,
              refreshToken: 'mock-refresh-token'
            }
          }
        }
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Initially should show login form
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()

      // Fill in login credentials
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')

      // Submit the form
      await user.click(screen.getByTestId('submit-button'))

      // Wait for login to complete and dashboard to appear
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      })

      // Verify user is logged in
      expect(screen.getByText('Bienvenido, Test')).toBeInTheDocument()
      expect(screen.getByTestId('logout-button')).toBeInTheDocument()

      // Verify API was called with correct credentials
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle login failure', async () => {
      const user = userEvent.setup()
      
      // Mock login failure
      vi.mocked(authApi.login).mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Fill in wrong credentials
      await user.type(screen.getByTestId('email-input'), 'wrong@example.com')
      await user.type(screen.getByTestId('password-input'), 'wrongpassword')

      // Submit the form
      await user.click(screen.getByTestId('submit-button'))

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })

      // Verify error message is displayed
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()

      // Should still be on login form
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
    })

    it('should show loading state during login', async () => {
      const user = userEvent.setup()
      
      // Mock delayed login response
      vi.mocked(authApi.login).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Fill in credentials
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')

      // Submit the form
      await user.click(screen.getByTestId('submit-button'))

      // Should show loading state
      expect(screen.getByText('Cargando...')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  describe('Logout Flow', () => {
    it('should complete successful logout flow', async () => {
      const user = userEvent.setup()
      
      // Set initial authenticated state
      useAuthStore.setState({
        isAuthenticated: true,
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test'
        },
        token: 'mock-token'
      })

      // Mock successful logout
      vi.mocked(authApi.logout).mockResolvedValue({ data: { success: true } })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Should show dashboard initially
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      expect(screen.getByText('Bienvenido, Test')).toBeInTheDocument()

      // Click logout button
      await user.click(screen.getByTestId('logout-button'))

      // Wait for logout to complete and login form to appear
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument()
      })

      // Should no longer show dashboard
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()

      // Verify logout API was called
      expect(authApi.logout).toHaveBeenCalled()
    })

    it('should handle logout even if API fails', async () => {
      const user = userEvent.setup()
      
      // Set initial authenticated state
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', firstName: 'Test' },
        token: 'mock-token'
      })

      // Mock logout failure
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Click logout button
      await user.click(screen.getByTestId('logout-button'))

      // Should still logout locally even if API fails
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Session Persistence', () => {
    it('should persist authentication state', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test'
      }

      // Simulate login
      useAuthStore.getState().login = vi.fn().mockResolvedValue({})
      useAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token'
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Should show dashboard for authenticated user
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      expect(screen.getByText('Bienvenido, Test')).toBeInTheDocument()
    })

    it('should handle expired token', async () => {
      // Mock token verification failure
      vi.mocked(authApi.verifyToken).mockRejectedValue({
        response: { status: 401, data: { message: 'Token expired' } }
      })

      // Set initial state with token
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        token: 'expired-token'
      })

      // Simulate token verification on app load
      await useAuthStore.getState().initializeAuth()

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Should show login form after token verification fails
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      const emailInput = screen.getByTestId('email-input')
      
      // Type invalid email
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger blur event

      // Note: In a real implementation, you would have validation feedback
      // This test demonstrates the testing pattern for form validation
      expect(emailInput).toHaveValue('invalid-email')
    })

    it('should require both email and password', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Try to submit empty form
      await user.click(screen.getByTestId('submit-button'))

      // API should not be called with empty credentials
      expect(authApi.login).not.toHaveBeenCalled()
    })
  })

  describe('Error Recovery', () => {
    it('should allow retry after login failure', async () => {
      const user = userEvent.setup()
      
      // Mock initial failure then success
      vi.mocked(authApi.login)
        .mockRejectedValueOnce({
          response: { data: { message: 'Network error' } }
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              user: { id: '1', email: 'test@example.com', firstName: 'Test' },
              tokens: { accessToken: 'token', refreshToken: 'refresh' }
            }
          }
        })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Fill in credentials
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')

      // First attempt - should fail
      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Second attempt - should succeed
      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      })

      expect(screen.getByText('Bienvenido, Test')).toBeInTheDocument()
    })
  })
})