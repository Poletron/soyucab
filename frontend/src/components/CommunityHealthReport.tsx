import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { UserPlus, Users, FileText, Link2, TrendingUp, TrendingDown, Hash, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data para usuarios activos a lo largo del tiempo
const activeUsersData = [
  { date: '01 Oct', users: 1245 },
  { date: '03 Oct', users: 1318 },
  { date: '05 Oct', users: 1402 },
  { date: '07 Oct', users: 1389 },
  { date: '09 Oct', users: 1456 },
  { date: '11 Oct', users: 1523 },
  { date: '13 Oct', users: 1598 },
  { date: '15 Oct', users: 1634 },
  { date: '17 Oct', users: 1702 },
  { date: '19 Oct', users: 1789 },
  { date: '21 Oct', users: 1856 },
  { date: '23 Oct', users: 1923 },
  { date: '25 Oct', users: 1987 },
  { date: '27 Oct', users: 2045 },
  { date: '29 Oct', users: 2134 },
  { date: '31 Oct', users: 2198 },
  { date: '02 Nov', users: 2267 },
  { date: '04 Nov', users: 2345 },
  { date: '06 Nov', users: 2412 },
  { date: '08 Nov', users: 2478 }
];

// Mock data para temas y habilidades populares
const popularTopicsData = [
  { id: 1, topic: 'Inteligencia Artificial', category: 'Tecnología', mentions: 1847, trend: '+12%' },
  { id: 2, topic: 'Python', category: 'Programación', mentions: 1623, trend: '+8%' },
  { id: 3, topic: 'Gestión de Proyectos', category: 'Administración', mentions: 1542, trend: '+15%' },
  { id: 4, topic: 'Marketing Digital', category: 'Marketing', mentions: 1489, trend: '+10%' },
  { id: 5, topic: 'Data Science', category: 'Tecnología', mentions: 1356, trend: '+18%' },
  { id: 6, topic: 'React', category: 'Programación', mentions: 1298, trend: '+7%' },
  { id: 7, topic: 'Finanzas Corporativas', category: 'Finanzas', mentions: 1187, trend: '+5%' },
  { id: 8, topic: 'Diseño UX/UI', category: 'Diseño', mentions: 1134, trend: '+14%' },
  { id: 9, topic: 'Blockchain', category: 'Tecnología', mentions: 1089, trend: '+22%' },
  { id: 10, topic: 'SQL', category: 'Programación', mentions: 1056, trend: '+6%' },
  { id: 11, topic: 'Liderazgo', category: 'Soft Skills', mentions: 987, trend: '+9%' },
  { id: 12, topic: 'DevOps', category: 'Tecnología', mentions: 945, trend: '+11%' },
  { id: 13, topic: 'Contabilidad', category: 'Finanzas', mentions: 923, trend: '+4%' },
  { id: 14, topic: 'Análisis de Datos', category: 'Tecnología', mentions: 896, trend: '+16%' },
  { id: 15, topic: 'Comunicación Efectiva', category: 'Soft Skills', mentions: 854, trend: '+8%' }
];

// KPIs data
const kpisData = {
  newUsers: {
    value: 342,
    change: 15.3,
    isPositive: true,
    period: 'vs. último mes'
  },
  dailyActiveUsers: {
    value: 2478,
    change: 8.7,
    isPositive: true,
    period: 'promedio últimos 7 días'
  },
  totalPosts: {
    value: 8945,
    change: 12.4,
    isPositive: true,
    period: 'este mes'
  },
  newConnections: {
    value: 1823,
    change: -2.1,
    isPositive: false,
    period: 'vs. último mes'
  }
};

const CommunityHealthReport = () => {
  const [dateRange, setDateRange] = useState('30days');

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Tecnología': '#40b4e5',
      'Programación': '#047732',
      'Administración': '#ffc526',
      'Marketing': '#ff6b9d',
      'Finanzas': '#9b59b6',
      'Diseño': '#e74c3c',
      'Soft Skills': '#3498db'
    };
    return colors[category] || '#94a3b8';
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>
            Monitor de Actividad de la Comunidad
          </h1>
          <p className="text-gray-600 mt-2">
            Panel de control para monitorear la salud y el engagement de la plataforma SoyUCAB
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5" style={{ color: '#40b4e5' }} />
          <div>
            <label className="block text-sm text-gray-600 mb-1">Rango de Fechas</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 días</SelectItem>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="90days">Últimos 90 días</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Nuevos Usuarios Registrados */}
        <Card style={{ borderColor: '#40b4e5', borderWidth: '2px' }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                    <UserPlus className="h-5 w-5" style={{ color: '#40b4e5' }} />
                  </div>
                  <span className="text-sm text-gray-600">Nuevos Usuarios</span>
                </div>
                <div className="text-3xl mb-1" style={{ color: '#12100c' }}>
                  {kpisData.newUsers.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                    kpisData.newUsers.isPositive ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {kpisData.newUsers.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      kpisData.newUsers.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpisData.newUsers.change}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{kpisData.newUsers.period}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuarios Activos Diarios (DAU) */}
        <Card style={{ borderColor: '#ffc526', borderWidth: '2px' }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#fff9e5' }}>
                    <Users className="h-5 w-5" style={{ color: '#ffc526' }} />
                  </div>
                  <span className="text-sm text-gray-600">Usuarios Activos Diarios</span>
                </div>
                <div className="text-3xl mb-1" style={{ color: '#12100c' }}>
                  {kpisData.dailyActiveUsers.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                    kpisData.dailyActiveUsers.isPositive ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {kpisData.dailyActiveUsers.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      kpisData.dailyActiveUsers.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpisData.dailyActiveUsers.change}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{kpisData.dailyActiveUsers.period}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Publicaciones */}
        <Card style={{ borderColor: '#047732', borderWidth: '2px' }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
                    <FileText className="h-5 w-5" style={{ color: '#047732' }} />
                  </div>
                  <span className="text-sm text-gray-600">Total de Publicaciones</span>
                </div>
                <div className="text-3xl mb-1" style={{ color: '#12100c' }}>
                  {kpisData.totalPosts.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                    kpisData.totalPosts.isPositive ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {kpisData.totalPosts.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      kpisData.totalPosts.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpisData.totalPosts.change}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{kpisData.totalPosts.period}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nuevas Conexiones Realizadas */}
        <Card style={{ borderColor: '#12100c', borderWidth: '2px' }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
                    <Link2 className="h-5 w-5" style={{ color: '#12100c' }} />
                  </div>
                  <span className="text-sm text-gray-600">Nuevas Conexiones</span>
                </div>
                <div className="text-3xl mb-1" style={{ color: '#12100c' }}>
                  {kpisData.newConnections.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                    kpisData.newConnections.isPositive ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {kpisData.newConnections.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      kpisData.newConnections.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(kpisData.newConnections.change)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{kpisData.newConnections.period}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart - Evolución de Usuarios Activos */}
      <Card style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
        <CardHeader style={{ backgroundColor: '#40b4e5' }}>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Evolución de Usuarios Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={activeUsersData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#40b4e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#40b4e5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: '13px' }}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #40b4e5',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Usuarios Activos']}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={() => 'Usuarios Activos Diarios'}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#40b4e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" style={{ color: '#40b4e5' }} />
                <span className="text-sm" style={{ color: '#12100c' }}>Tendencia General</span>
              </div>
              <p className="text-sm text-gray-700">
                Crecimiento constante del <strong>76.6%</strong> en usuarios activos en el período seleccionado
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff9e5' }}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" style={{ color: '#ffc526' }} />
                <span className="text-sm" style={{ color: '#12100c' }}>Pico Máximo</span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>2,478 usuarios</strong> alcanzados el 08 de noviembre
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" style={{ color: '#047732' }} />
                <span className="text-sm" style={{ color: '#12100c' }}>Tasa de Retención</span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>68.5%</strong> de usuarios regresan diariamente a la plataforma
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics Table */}
      <Card>
        <CardHeader style={{ backgroundColor: '#ffc526' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#12100c' }}>
            <Hash className="h-5 w-5" />
            Temas y Habilidades Populares
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#fff9e5', borderBottom: '2px solid #ffc526' }}>
                  <th className="px-6 py-4 text-left text-sm" style={{ color: '#12100c' }}>
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ color: '#12100c' }}>
                    Tema / Habilidad
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ color: '#12100c' }}>
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-center text-sm" style={{ color: '#12100c' }}>
                    Menciones
                  </th>
                  <th className="px-6 py-4 text-center text-sm" style={{ color: '#12100c' }}>
                    Tendencia
                  </th>
                  <th className="px-6 py-4 text-center text-sm" style={{ color: '#12100c' }}>
                    Popularidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {popularTopicsData.map((topic, index) => (
                  <tr
                    key={topic.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {index < 3 ? (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: index === 0 ? '#ffc526' : index === 1 ? '#e0e0e0' : '#cd7f32'
                            }}
                          >
                            <span className="text-white text-sm">{index + 1}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-sm">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="font-medium" style={{ color: '#12100c' }}>
                          {topic.topic}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        style={{
                          backgroundColor: getCategoryColor(topic.category) + '20',
                          color: getCategoryColor(topic.category),
                          border: `1px solid ${getCategoryColor(topic.category)}`
                        }}
                      >
                        {topic.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium" style={{ color: '#12100c' }}>
                        {topic.mentions.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" style={{ color: '#047732' }} />
                        <span className="text-sm" style={{ color: '#047732' }}>
                          {topic.trend}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(topic.mentions / popularTopicsData[0].mentions) * 100}%`,
                            backgroundColor: getCategoryColor(topic.category)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Tasa de Engagement Promedio</div>
              <div className="text-3xl mb-1" style={{ color: '#40b4e5' }}>
                34.8%
              </div>
              <div className="text-xs text-gray-500">
                Interacciones por usuario activo
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Tiempo Promedio en Plataforma</div>
              <div className="text-3xl mb-1" style={{ color: '#ffc526' }}>
                28 min
              </div>
              <div className="text-xs text-gray-500">
                Por sesión de usuario
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Satisfacción de Usuarios</div>
              <div className="text-3xl mb-1" style={{ color: '#047732' }}>
                4.6/5
              </div>
              <div className="text-xs text-gray-500">
                Basado en 1,245 valoraciones
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHealthReport;
