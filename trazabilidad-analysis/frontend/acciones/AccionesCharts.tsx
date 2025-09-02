import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { accionWorkflow } from '@/config/accionWorkflow';

const AccionesCharts = ({ acciones }) => {
  // 1. Data for Bar Chart (Acciones por Estado)
  const dataPorEstado = Object.keys(accionWorkflow).map(estadoKey => ({
    name: accionWorkflow[estadoKey].title,
    cantidad: acciones.filter(a => a.estado === estadoKey).length,
  }));

  // 2. Data for Pie Chart (Acciones por Prioridad)
  const prioridades = {
    'Alta': { color: '#ef4444' }, // red-500
    'Media': { color: '#f97316' }, // orange-500
    'Baja': { color: '#84cc16' }, // lime-500
  };

  const dataPorPrioridad = Object.keys(prioridades)
    .map(prioridadKey => ({
      name: prioridadKey,
      value: acciones.filter(a => a.prioridad === prioridadKey).length,
    }))
    .filter(item => item.value > 0); // Solo mostrar prioridades con acciones

  const COLORS = Object.keys(prioridades).map(key => prioridades[key].color);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Acciones por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPorEstado} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" name="Nº de Acciones" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Prioridad</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPorPrioridad}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataPorPrioridad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[Object.keys(prioridades).indexOf(entry.name)]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccionesCharts;
