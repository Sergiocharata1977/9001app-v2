import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface ApiError {
  status?: number
  message?: string
  code?: string
  details?: any
}

interface Props {
  children: ReactNode
  fallback?: (error: ApiError, retry: () => void) => ReactNode
  onError?: (error: ApiError) => void
  showRetry?: boolean
  retryDelay?: number
  maxRetries?: number
}

interface State {
  hasError: boolean
  error: ApiError | null
  retryCount: number
  isRetrying: boolean
  isOnline: boolean
}

class ApiErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
      isOnline: navigator.onLine
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleOnline = () => {
    this.setState({ isOnline: true })
    if (this.state.hasError) {
      toast.success('Conexión restaurada')
      this.handleRetry()
    }
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
    toast.error('Sin conexión a internet')
  }

  static getDerivedStateFromError(error: any): Partial<State> {
    // Check if it's an API error
    if (error?.response || error?.status || error?.code) {
      return {
        hasError: true,
        error: {
          status: error.response?.status || error.status,
          message: error.response?.data?.message || error.message,
          code: error.code,
          details: error.response?.data || error.details
        }
      }
    }

    // Re-throw non-API errors to be handled by general ErrorBoundary
    throw error
  }

  componentDidCatch(error: any) {
    const { onError } = this.props
    
    console.error('ApiErrorBoundary caught an error:', error)
    
    if (this.state.error) {
      onError?.(this.state.error)
    }

    // Log API errors for monitoring
    this.logApiError(this.state.error)
  }

  logApiError = async (error: ApiError | null) => {
    if (!error) return

    try {
      const errorData = {
        type: 'api_error',
        status: error.status,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        isOnline: navigator.onLine
      }

      console.warn('API Error logged:', errorData)
      
      // In production, send to monitoring service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // })
    } catch (logError) {
      console.error('Failed to log API error:', logError)
    }
  }

  handleRetry = async () => {
    const { retryDelay = 1000, maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      toast.error('Máximo número de reintentos alcanzado')
      return
    }

    this.setState({ isRetrying: true, retryCount: retryCount + 1 })

    this.retryTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false
      })
    }, retryDelay)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    })
  }

  getErrorMessage = (error: ApiError): string => {
    if (!this.state.isOnline) {
      return 'Sin conexión a internet. Verifica tu conexión y vuelve a intentar.'
    }

    switch (error.status) {
      case 400:
        return 'Solicitud inválida. Verifica los datos enviados.'
      case 401:
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'El recurso solicitado no fue encontrado.'
      case 429:
        return 'Demasiadas solicitudes. Intenta más tarde.'
      case 500:
        return 'Error interno del servidor. Nuestro equipo ha sido notificado.'
      case 502:
      case 503:
      case 504:
        return 'Servicio temporalmente no disponible. Intenta más tarde.'
      default:
        return error.message || 'Ha ocurrido un error inesperado con la conexión.'
    }
  }

  render() {
    const { children, fallback, showRetry = true } = this.props
    const { hasError, error, isRetrying, retryCount, isOnline } = this.state

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleRetry)
      }

      // Default API error UI
      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center border border-red-200">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                {isOnline ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isOnline ? 'Error de conexión' : 'Sin conexión'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {this.getErrorMessage(error)}
            </p>

            {error.status && (
              <div className="text-sm text-gray-500 mb-4">
                Código de error: {error.status}
                {retryCount > 0 && ` (Intento ${retryCount})`}
              </div>
            )}

            {showRetry && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={this.handleRetry}
                  disabled={isRetrying || !isOnline}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Reintentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Reintentar
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={this.resetError}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            )}

            {/* Network status indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">En línea</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">Sin conexión</span>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

// Hook for handling API errors
export function useApiError() {
  const handleApiError = (error: any) => {
    // This will trigger the nearest ApiErrorBoundary
    if (error?.response || error?.status || error?.code) {
      throw error
    }
    
    // For non-API errors, create a generic API error
    throw {
      status: 500,
      message: error?.message || 'Error desconocido',
      code: 'UNKNOWN_ERROR'
    }
  }

  return { handleApiError }
}

// HOC for wrapping components with API error boundary
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ApiErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ApiErrorBoundary>
  )

  WrappedComponent.displayName = `withApiErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ApiErrorBoundary