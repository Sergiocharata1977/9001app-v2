import React from 'react';
import { useLocation } from 'react-router-dom';

const TestSimpleComponent = () => {
  const location = useLocation();

  return (
    <div className="p-8 bg-blue-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">
        ✅ Componente de Prueba Funcionando
      </h1>
      <p className="text-blue-600 mb-4">
        Si puedes ver este mensaje, el routing está funcionando correctamente.
      </p>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Información del Sistema:</h2>
        <ul className="space-y-1 text-sm">
          <li>• Frontend: React + Vite</li>
          <li>• Backend: Node.js + Express</li>
          <li>• Base de datos: Turso (mongodb)</li>
          <li>• Autenticación: JWT</li>
          <li>• Ruta actual: {location.pathname}</li>
        </ul>
      </div>

      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Estado del Sistema:</h3>
        <ul className="text-green-700 space-y-1">
          <li>• ✅ Frontend funcionando en puerto 3000</li>
          <li>• ✅ Routing básico operativo</li>
          <li>• ✅ Componentes cargando correctamente</li>
          <li>• ✅ Navegación lateral funcionando</li>
        </ul>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded-lg border border-yellow-300">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Problemas Conocidos:</h3>
        <ul className="text-yellow-700 space-y-1">
          <li>• ❌ Backend con errores de ES Modules (en proceso de conversión)</li>
          <li>• ❌ Página de Personal no carga datos</li>
          <li>• ❌ Documentación puede no funcionar completamente</li>
        </ul>
      </div>
    </div>
  );
};

export default TestSimpleComponent; 