import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api/authApi'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock the authApi
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn(),
    refreshToken: vi.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useAuthStore.getState().reset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Login', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'admin',
        organization_id: 'org-1',
        organization_name: 'Test Org'
      }
      const mockToken = 'mock-access-token'
      const mockRefreshToken = 'mock-refresh-token'

      const mockResponse = {
        data: {
          data: {
            user: mockUser,
            tokens: {
              accessToken: mockToken,
              refreshToken: mockRefreshToken
            }
          }
        }
      }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', mockRefreshToken)
    })

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      }

      vi.mocked(authApi.login).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' })
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
    })

    it('should handle invalid login response', async () => {
      const mockResponse = {
        data: {
          data: {
            // Missing user or token
          }
        }
      }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'password' })
        } catch (error) {
          expect(error.message).toBe('Respuesta de login inválida')
        }
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Logout', () => {
    it('should handle successful logout', async () => {
      // Set initial authenticated state
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.updateUser({ id: '1', email: 'test@example.com' })
        useAuthStore.setState({
          token: 'mock-token',
          isAuthenticated: true
        })
      })

      vi.mocked(authApi.logout).mockResolvedValue({ data: { success: true } })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    })

    it('should handle logout even if API fails', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'test@example.com' },
          token: 'mock-token',
          isAuthenticated: true
        })
      })

      vi.mocked(authApi.logout).mockRejectedValue(new Error('API Error'))

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Token Management', () => {
    it('should get valid token from state', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({ token: 'state-token' })
      })

      const token = await result.current.getValidToken()
      expect(token).toBe('state-token')
    })

    it('should get valid token from localStorage when state is empty', async () => {
      mockLocalStorage.getItem.mockReturnValue('local-token')

      const { result } = renderHook(() => useAuthStore())

      const token = await result.current.getValidToken()
      expect(token).toBe('local-token')
      expect(result.current.token).toBe('local-token')
    })

    it('should return null when no token available', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useAuthStore())

      const token = await result.current.getValidToken()
      expect(token).toBeNull()
    })
  })

  describe('Token Refresh', () => {
    it('should refresh access token successfully', async () => {
      const newToken = 'new-access-token'
      mockLocalStorage.getItem.mockReturnValue('refresh-token')
      
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        data: {
          data: {
            accessToken: newToken
          }
        }
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const token = await result.current.refreshAccessToken()
        expect(token).toBe(newToken)
      })

      expect(result.current.token).toBe(newToken)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', newToken)
    })

    it('should logout on refresh token failure', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-refresh-token')
      
      vi.mocked(authApi.refreshToken).mockRejectedValue(new Error('Invalid refresh token'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.refreshAccessToken()
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('User Role Utilities', () => {
    it('should correctly identify super admin', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', role: 'super_admin' },
          isAuthenticated: true
        })
      })

      expect(result.current.isSuperAdmin()).toBe(true)
      expect(result.current.isOrganizationAdmin()).toBe(false)
    })

    it('should correctly identify organization admin', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', role: 'admin' },
          isAuthenticated: true
        })
      })

      expect(result.current.isSuperAdmin()).toBe(false)
      expect(result.current.isOrganizationAdmin()).toBe(true)
    })

    it('should get organization ID', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', organization_id: 'org-123' },
          isAuthenticated: true
        })
      })

      expect(result.current.getOrganizationId()).toBe('org-123')
    })

    it('should get user role', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', role: 'user' },
          isAuthenticated: true
        })
      })

      expect(result.current.getUserRole()).toBe('user')
    })
  })

  describe('Initialize Auth', () => {
    it('should initialize auth with valid token', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      mockLocalStorage.getItem.mockReturnValue('valid-token')
      
      vi.mocked(authApi.verifyToken).mockResolvedValue({
        data: { user: mockUser }
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const isValid = await result.current.initializeAuth()
        expect(isValid).toBe(true)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe('valid-token')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle invalid token on initialization', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-token')
      
      vi.mocked(authApi.verifyToken).mockRejectedValue(new Error('Invalid token'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const isValid = await result.current.initializeAuth()
        expect(isValid).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('Update User', () => {
    it('should update user data', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1', email: 'old@example.com', name: 'Old Name' }
        })
      })

      act(() => {
        result.current.updateUser({ name: 'New Name', role: 'admin' })
      })

      expect(result.current.user).toEqual({
        id: '1',
        email: 'old@example.com',
        name: 'New Name',
        role: 'admin'
      })
    })
  })

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({ error: 'Some error' })
      })

      expect(result.current.error).toBe('Some error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        useAuthStore.setState({
          user: { id: '1' },
          token: 'token',
          isAuthenticated: true,
          error: 'error'
        })
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    })
  })
})