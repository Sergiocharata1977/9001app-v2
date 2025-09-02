import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AccionCard = ({ accion }) => {
  if (!accion) {
    return null;
  }

  return (
    <Link to={`/acciones/${accion.id}`} className="block no-underline text-current h-full">
      <Card className="h-full flex flex-col shadow-sm hover:shadow-lg hover:border-primary transition-all duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{accion.titulo || 'Acción sin título'}</CardTitle>
            <Badge variant="outline">{accion.estado}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <p className="text-sm text-gray-600 flex-grow">{accion.descripcion || 'Sin descripción.'}</p>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
            <span>
              <strong>Responsable:</strong> {accion.responsable_ejecucion || 'No asignado'}
            </span>
            <span>
              <strong>Fecha Límite:</strong> {accion.fecha_limite ? new Date(accion.fecha_limite).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AccionCard;
