import React from 'react';
import { Calendar, Users, TrendingUp, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const EventsReport = () => {
  const reportData = [
    { event: 'Hackathon UCAB 2024', attendees: 156, date: '2024-10-15' },
    { event: 'Feria de Empleo Tech', attendees: 234, date: '2024-09-28' },
    { event: 'Workshop IA y Machine Learning', attendees: 89, date: '2024-09-20' },
    { event: 'Conferencia Blockchain', attendees: 78, date: '2024-09-10' },
    { event: 'Taller de React Avanzado', attendees: 67, date: '2024-08-25' }
  ];

  // Datos para el gráfico de líneas de participación mensual
  const monthlyParticipation = [
    { month: 'Enero', eventos: 8, asistentes: 245, satisfaccion: 4.2 },
    { month: 'Febrero', eventos: 12, asistentes: 378, satisfaccion: 4.3 },
    { month: 'Marzo', eventos: 15, asistentes: 456, satisfaccion: 4.5 },
    { month: 'Abril', eventos: 18, asistentes: 523, satisfaccion: 4.4 },
    { month: 'Mayo', eventos: 22, asistentes: 689, satisfaccion: 4.6 },
    { month: 'Junio', eventos: 25, asistentes: 734, satisfaccion: 4.7 },
    { month: 'Julio', eventos: 20, asistentes: 612, satisfaccion: 4.5 },
    { month: 'Agosto', eventos: 28, asistentes: 845, satisfaccion: 4.8 },
    { month: 'Septiembre', eventos: 32, asistentes: 967, satisfaccion: 4.9 },
    { month: 'Octubre', eventos: 35, asistentes: 1045, satisfaccion: 4.8 }
  ];

  const detailedEvents = [
    {
      name: 'Hackathon UCAB 2024',
      date: '2024-10-15',
      category: 'Competencia',
      attendees: 156,
      registrations: 180,
      satisfaction: 4.8,
      location: 'Campus UCAB',
      organizer: 'Escuela de Ingeniería Informática'
    },
    {
      name: 'Feria de Empleo Tech',
      date: '2024-09-28',
      category: 'Networking',
      attendees: 234,
      registrations: 250,
      satisfaction: 4.6,
      location: 'Aula Magna',
      organizer: 'Dirección de Desarrollo Estudiantil'
    },
    {
      name: 'Workshop IA y Machine Learning',
      date: '2024-09-20',
      category: 'Educativo',
      attendees: 89,
      registrations: 120,
      satisfaction: 4.9,
      location: 'Laboratorio de Informática',
      organizer: 'Departamento de Computación'
    },
    {
      name: 'Conferencia Blockchain',
      date: '2024-09-10',
      category: 'Conferencia',
      attendees: 78,
      registrations: 95,
      satisfaction: 4.4,
      location: 'Auditorio Central',
      organizer: 'Grupo de Investigación Fintech'
    },
    {
      name: 'Taller de React Avanzado',
      date: '2024-08-25',
      category: 'Educativo',
      attendees: 67,
      registrations: 85,
      satisfaction: 4.7,
      location: 'Aula 301',
      organizer: 'Comunidad Desarrolladores UCAB'
    }
  ];

  // Ordenar datos para el gráfico de barras (de menor a mayor para el layout horizontal)
  const sortedReportData = [...reportData].sort((a, b) => a.attendees - b.attendees);
  
  const totalAttendees = reportData.reduce((sum, event) => sum + event.attendees, 0);
  const averageAttendance = Math.round(totalAttendees / reportData.length);
  const topEvent = reportData.reduce((max, event) => event.attendees > max.attendees ? event : max);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl">Reporte de Participación en Eventos</h1>
          <p className="text-gray-600">Último Semestre (Agosto - Octubre 2024)</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="semester">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">Último Semestre</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#ffc526' }}
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#40b4e5', opacity: 0.1 }}>
                <Calendar className="h-5 w-5" style={{ color: '#40b4e5' }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold">{reportData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#047732', opacity: 0.1 }}>
                <Users className="h-5 w-5" style={{ color: '#047732' }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Asistentes</p>
                <p className="text-2xl font-bold">{totalAttendees.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffc526', opacity: 0.1 }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#ffc526' }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Promedio Asistencia</p>
                <p className="text-2xl font-bold">{averageAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#12100c', opacity: 0.1 }}>
                <Calendar className="h-5 w-5" style={{ color: '#12100c' }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Evento Más Popular</p>
                <p className="text-lg font-bold truncate">{topEvent.event}</p>
                <p className="text-sm text-gray-500">{topEvent.attendees} asistentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Eventos Más Populares */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Eventos Más Populares</CardTitle>
          <p className="text-gray-600">Eventos ordenados por número de asistentes</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.sort((a, b) => b.attendees - a.attendees)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="event"
                  tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                  height={100}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Asistentes', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, 'Asistentes']}
                  labelFormatter={(label) => `Evento: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="attendees" 
                  fill="#ffc526"
                  radius={[4, 4, 0, 0]}
                  stroke="#ffc526"
                  strokeWidth={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Participación Mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Participación Mensual</CardTitle>
          <p className="text-gray-600">Tendencia de eventos y asistentes por mes</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyParticipation}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="eventos" 
                  stroke="#40b4e5" 
                  strokeWidth={3}
                  dot={{ fill: '#40b4e5', strokeWidth: 2, r: 5 }}
                  name="Número de Eventos"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="asistentes" 
                  stroke="#ffc526" 
                  strokeWidth={3}
                  dot={{ fill: '#ffc526', strokeWidth: 2, r: 5 }}
                  name="Total Asistentes"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="satisfaccion" 
                  stroke="#047732" 
                  strokeWidth={3}
                  dot={{ fill: '#047732', strokeWidth: 2, r: 5 }}
                  name="Satisfacción Promedio"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Eventos</CardTitle>
          <p className="text-gray-600">Información completa de todos los eventos del período</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Evento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Asistentes</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Tasa Asistencia</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Satisfacción</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Organizador</th>
                </tr>
              </thead>
              <tbody>
                {detailedEvents.map((event, index) => {
                  const attendanceRate = Math.round((event.attendees / event.registrations) * 100);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{event.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {event.attendees}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                          attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-medium">{event.satisfaction}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {event.organizer}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsReport;