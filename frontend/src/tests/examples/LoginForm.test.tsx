import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/schemas/authSchemas'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

// Mock dependencies
vi.mock('react-hot-toast')
vi.mock('@/store/authStore')

// Example Login Form Component using our validation system
const LoginForm: React.FC = () => {
  const login = useAuthStore(state => state.login)
  const isLoading = useAuthStore(state => state.isLoading)
  const error = useAuthStore(state => state.error)

  const {
    register,
    onSubmit,
    formState,
    getFieldError,
    hasFieldError
  } = useFormValidation<LoginFormData>({
    schema: loginSchema,
    onSuccess: async (data) => {
      await login(data)
      toast.success('¡Bienvenido!')
    },
    showSuccessToast: false, // We handle it manually
    showErrorToast: true
  })

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
      
      <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="tu@email.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              hasFieldError('email')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            data-testid="email-input"
          />
          {hasFieldError('email') && (
            <p className="mt-1 text-sm text-red-600" data-testid="email-error">
              {getFieldError('email')}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            placeholder="Tu contraseña"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              hasFieldError('password')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            data-testid="password-input"
          />
          {hasFieldError('password') && (
            <p className="mt-1 text-sm text-red-600" data-testid="password-error">
              {getFieldError('password')}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            {...register('remember')}
            id="remember"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid="remember-checkbox"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Recordarme
          </label>
        </div>

        {/* Global Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3" data-testid="global-error">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formState.canSubmit}
          className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading || !formState.canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          data-testid="submit-button"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>

        {/* Form State Debug (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500">
            <summary>Form State (Debug)</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded">
              {JSON.stringify(formState, null, 2)}
            </pre>
          </details>
        )}
      </form>
    </div>
  )
}

describe('LoginForm Component', () => {
  const mockLogin = vi.fn()
  const mockAuthStore = {
    login: mockLogin,
    isLoading: false,
    error: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.mocked(toast.success).mockImplementation(() => 'toast-id')
  })

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('remember-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
      expect(screen.getByLabelText('Recordarme')).toBeInTheDocument()
    })

    it('should have correct initial state', () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const rememberCheckbox = screen.getByTestId('remember-checkbox')
      const submitButton = screen.getByTestId('submit-button')

      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
      expect(rememberCheckbox).not.toBeChecked()
      expect(submitButton).toBeEnabled()
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      
      // Type invalid email
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger validation

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
        expect(screen.getByText('Formato de email inválido')).toBeInTheDocument()
      })
    })

    it('should require email field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('submit-button')

      // Fill password but leave email empty
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
        expect(screen.getByText('El email es requerido')).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should require password field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const submitButton = screen.getByTestId('submit-button')

      // Fill email but leave password empty
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toBeInTheDocument()
        expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should validate email length', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      
      // Type very long email
      const longEmail = 'a'.repeat(250) + '@example.com'
      await user.type(emailInput, longEmail)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
        expect(screen.getByText('El email no puede exceder 255 caracteres')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: true })
      
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const rememberCheckbox = screen.getByTestId('remember-checkbox')
      const submitButton = screen.getByTestId('submit-button')

      // Fill form with valid data
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(rememberCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          remember: true
        })
      })

      expect(toast.success).toHaveBeenCalledWith('¡Bienvenido!')
    })

    it('should handle submission error', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Credenciales inválidas'
      mockLogin.mockRejectedValue(new Error(errorMessage))
      
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        error: errorMessage
      })

      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('submit-button')

      // Fill form with valid data
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('global-error')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should prevent submission while loading', async () => {
      const user = userEvent.setup()
      
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        isLoading: true
      })

      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('submit-button')

      // Fill form
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Button should be disabled
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()

      // Try to click anyway
      await user.click(submitButton)

      // Login should not be called
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('User Interactions', () => {
    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const rememberCheckbox = screen.getByTestId('remember-checkbox')

      expect(rememberCheckbox).not.toBeChecked()

      await user.click(rememberCheckbox)
      expect(rememberCheckbox).toBeChecked()

      await user.click(rememberCheckbox)
      expect(rememberCheckbox).not.toBeChecked()
    })

    it('should clear validation errors when user corrects input', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')

      // Type invalid email
      await user.type(emailInput, 'invalid')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
      })

      // Clear and type valid email
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels and ARIA attributes', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Contraseña')
      const rememberCheckbox = screen.getByLabelText('Recordarme')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(rememberCheckbox).toHaveAttribute('type', 'checkbox')
    })

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      
      await user.type(emailInput, 'invalid')
      await user.tab()

      await waitFor(() => {
        const errorMessage = screen.getByTestId('email-error')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')
      const rememberCheckbox = screen.getByTestId('remember-checkbox')
      const submitButton = screen.getByTestId('submit-button')

      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(rememberCheckbox).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Visual States', () => {
    it('should apply error styling to invalid fields', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      
      await user.type(emailInput, 'invalid')
      await user.tab()

      await waitFor(() => {
        expect(emailInput).toHaveClass('border-red-500')
        expect(emailInput).toHaveClass('focus:ring-red-500')
      })
    })

    it('should show loading spinner when submitting', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        isLoading: true
      })

      render(<LoginForm />)

      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled()
    })
  })
})