import React, { useState, useEffect } from 'react';
import { testConnectionService } from '../services/testConnection';

interface PlanItem {
  _id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual?: number;
  max_users?: number;
  features?: string[];
}

const TestDataRendering: React.FC = () => {
  const [planes, setPlanes] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await testConnectionService.getPlanes();
      
      if (response.success) {
        setPlanes(response.data);
        setDataSource(response.source || 'unknown');
      } else {
        throw new Error(response.message || 'Error cargando datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded-md">
        <h3 className="text-red-800 font-medium">❌ Error</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadPlanes}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🛒 Test de Renderizado de Datos - Planes
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            Verificando que los datos del backend se renderizan correctamente
          </p>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            dataSource === 'mongodb' ? 'bg-green-100 text-green-800' :
            dataSource === 'mock_data' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            📊 Fuente: {dataSource === 'mongodb' ? 'MongoDB' : 
                      dataSource === 'mock_data' ? 'Datos Mock' : 
                      dataSource || 'Desconocida'}
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Planes encontrados: {planes.length}
        </h2>
        <button
          onClick={loadPlanes}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Recargar datos
        </button>
      </div>

      {planes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ℹ️ No se encontraron planes
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planes.map((plan) => (
            <div 
              key={plan._id} 
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Header del plan */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Precio */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatPrice(plan.price_monthly)}
                  <span className="text-lg font-normal text-gray-500">/mes</span>
                </div>
                {plan.price_annual && (
                  <div className="text-sm text-gray-500">
                    {formatPrice(plan.price_annual)}/año
                    <span className="ml-1 text-green-600 font-medium">
                      (Ahorra {formatPrice(plan.price_monthly * 12 - plan.price_annual)})
                    </span>
                  </div>
                )}
              </div>

              {/* Límites */}
              {plan.max_users && (
                <div className="mb-4 text-sm text-gray-600">
                  👥 Hasta {plan.max_users} usuarios
                </div>
              )}

              {/* Características */}
              {plan.features && plan.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                    ✨ Características:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ID para debugging */}
              <div className="text-xs text-gray-400 border-t pt-2">
                ID: {plan._id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información de debugging */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-800 mb-2">🐛 Información de Debug</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Última actualización: {new Date().toLocaleString()}</div>
          <div>• Fuente de datos: {dataSource}</div>
          <div>• Cantidad de planes: {planes.length}</div>
          <div>• Estado: {error ? 'Error' : loading ? 'Cargando' : 'Exitoso'}</div>
        </div>
      </div>
    </div>
  );
};

export default TestDataRendering;