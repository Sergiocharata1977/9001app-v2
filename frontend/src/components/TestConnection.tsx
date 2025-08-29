import React, { useState, useEffect } from 'react';
import { testConnectionService, PlanData, ApiResponse } from '../services/testConnection';

interface DiagnosticResult {
  backend: any;
  health: any;
  plans: any;
  summary: {
    total_tests: number;
    passed: number;
    failed: number;
    success_rate: number;
  };
}

const TestConnection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const diagnosticResults = await testConnectionService.runFullDiagnostic();
      setResults(diagnosticResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ejecutando diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Ejecutar diagnóstico automáticamente al cargar el componente
    runDiagnostic();
  }, []);

  const getStatusColor = (status: string | boolean) => {
    if (status === 'success' || status === true) return 'text-green-600 bg-green-100';
    if (status === 'error' || status === false) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusIcon = (status: string | boolean) => {
    if (status === 'success' || status === true) return '✅';
    if (status === 'error' || status === false) return '❌';
    return '⚠️';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 Diagnóstico de Conexión Frontend ↔ Backend
        </h1>
        <p className="text-gray-600">
          Verificando la conectividad y funcionamiento del sistema completo
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={runDiagnostic}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? '🔄 Ejecutando diagnóstico...' : '🚀 Ejecutar Diagnóstico'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md">
          <h3 className="text-red-800 font-medium">❌ Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Resumen general */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              📊 Resumen del Diagnóstico
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.summary.total_tests}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.summary.passed}
                </div>
                <div className="text-sm text-gray-600">Exitosos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.summary.failed}
                </div>
                <div className="text-sm text-gray-600">Fallidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {results.summary.success_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Éxito</div>
              </div>
            </div>
          </div>

          {/* Test 1: Conexión Backend */}
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">
                {getStatusIcon(results.backend?.status)}
              </span>
              <h3 className="text-lg font-semibold">Test 1: Conexión al Backend</h3>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.backend?.status)}`}>
              {results.backend?.status === 'success' ? 'CONECTADO' : 'ERROR'}
            </div>
            <p className="mt-2 text-gray-700">{results.backend?.message}</p>
          </div>

          {/* Test 2: Health Endpoint */}
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">
                {getStatusIcon(results.health?.status)}
              </span>
              <h3 className="text-lg font-semibold">Test 2: Health Check</h3>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.health?.status)}`}>
              {results.health?.status === 'success' ? 'SALUDABLE' : 'ERROR'}
            </div>
            {results.health?.data && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                <pre>{JSON.stringify(results.health.data, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Test 3: Datos de Planes */}
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">
                {getStatusIcon(results.plans?.success)}
              </span>
              <h3 className="text-lg font-semibold">Test 3: Obtención de Datos (Planes)</h3>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(results.plans?.success)}`}>
              {results.plans?.success ? 'DATOS OK' : 'ERROR'}
            </div>
            <p className="mt-2 text-gray-700">{results.plans?.message}</p>
            
            {results.plans?.success && results.plans?.data && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  📋 Planes obtenidos ({results.plans.data.length}):
                </h4>
                <div className="grid gap-3">
                  {results.plans.data.map((plan: PlanData) => (
                    <div key={plan._id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-800">{plan.name}</h5>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${plan.price_monthly}/mes
                          </div>
                          {plan.max_users && (
                            <div className="text-sm text-gray-600">
                              Max {plan.max_users} usuarios
                            </div>
                          )}
                        </div>
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Características:</div>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {plan.features.slice(0, 3).map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-gray-400">... y {plan.features.length - 3} más</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  Fuente de datos: <span className="font-medium">{results.plans.source}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestConnection;