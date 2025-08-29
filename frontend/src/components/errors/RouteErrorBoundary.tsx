import React from 'react'
import { useRouteError, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RouteError {
  status?: number
  statusText?: string
  message?: string
  data?: any
}

export default function RouteErrorBoundary() {
  const error = useRouteError() as RouteError
  const navigate = useNavigate()

  const getErrorInfo = () => {
    if (error?.status) {
      switch (error.status) {
        case 404:
          return {
            title: 'Página no encontrada',
            message: 'La página que buscas no existe o ha sido movida.',
            icon: '🔍',
            showBackButton: true
          }
        case 403:
          return {
            title: 'Acceso denegado',
            message: 'No tienes permisos para acceder a esta página.',
            icon: '🔒',
            showBackButton: true
          }
        case 500:
          return {
            title: 'Error del servidor',
            message: 'Ha ocurrido un error interno del servidor. Intenta más tarde.',
            icon: '⚠️',
            showBackButton: false
          }
        default:
          return {
            title: `Error ${error.status}`,
            message: error.statusText || 'Ha ocurrido un error inesperado.',
            icon: '❌',
            showBackButton: true
          }
      }
    }

    // JavaScript errors
    return {
      title: 'Error de aplicación',
      message: error?.message || 'Ha ocurrido un error inesperado en la aplicación.',
      icon: '🐛',
      showBackButton: true
    }
  }

  const errorInfo = getErrorInfo()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
            <span className="text-4xl">{errorInfo.icon}</span>
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {errorInfo.message}
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Detalles técnicos
              </summary>
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                <pre className="whitespace-pre-wrap text-gray-800">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {errorInfo.showBackButton && (
              <Button
                onClick={handleGoBack}
                variant="default"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            )}
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ir al inicio
            </Button>
            
            <Button
              onClick={handleReload}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500">
          Si el problema persiste, contacta al{' '}
          <a 
            href="mailto:soporte@tuapp.com" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            equipo de soporte
          </a>
        </div>
      </div>
    </div>
  )
}

// Specific error components for common scenarios
export function NotFoundError() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          404 - Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          La página que buscas no existe o ha sido movida a otra ubicación.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Página anterior
          </Button>
        </div>
      </div>
    </div>
  )
}

export function UnauthorizedError() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso denegado
        </h1>
        <p className="text-gray-600 mb-8">
          No tienes los permisos necesarios para acceder a esta página.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ServerError() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Error del servidor
        </h1>
        <p className="text-gray-600 mb-8">
          Ha ocurrido un error interno del servidor. Nuestro equipo ha sido notificado.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}