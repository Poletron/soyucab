import React from 'react';
import { Users, UserPlus, TrendingUp, Activity, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const CommunityGrowthReport = () => {
  const monthlyGrowthData = [
    { month: 'Mayo', Estudiantes: 145, Egresados: 78, Profesores: 23, total: 246 },
    { month: 'Junio', Estudiantes: 167, Egresados: 89, Profesores: 28, total: 284 },
    { month: 'Julio', Estudiantes: 189, Egresados: 98, Profesores: 31, total: 318 },
    { month: 'Agosto', Estudiantes: 234, Egresados: 115, Profesores: 34, total: 383 },
    { month: 'Septiembre', Estudiantes: 278, Egresados: 134, Profesores: 38, total: 450 },
    { month: 'Octubre', Estudiantes: 312, Egresados: 156, Profesores: 42, total: 510 }
  ];

  const userTypeDistribution = [
    { name: 'Estudiantes', value: 312, color: '#40b4e5' },
    { name: 'Egresados', value: 156, color: '#ffc526' },
    { name: 'Profesores', value: 42, color: '#047732' }
  ];

  const totalUsers = userTypeDistribution.reduce((sum, item) => sum + item.value, 0);
  const currentMonthNew = 60; // Nuevos usuarios este mes
  const interactionRate = 78.5; // Tasa de interacción promedio
  const growthRate = 13.2; // Crecimiento mensual

  const topMetrics = [
    {
      title: 'Total de Usuarios',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      trend: '+13.2%',
      trendUp: true
    },
    {
      title: 'Nuevos Usuarios (Mes)',
      value: currentMonthNew.toString(),
      icon: UserPlus,
      color: 'green',
      trend: '+8.5%',
      trendUp: true
    },
    {
      title: 'Tasa de Interacción',
      value: `${interactionRate}%`,
      icon: Activity,
      color: 'orange',
      trend: '+2.1%',
      trendUp: true
    },
    {
      title: 'Crecimiento Mensual',
      value: `${growthRate}%`,
      icon: TrendingUp,
      color: 'purple',
      trend: '-0.8%',
      trendUp: false
    }
  ];

  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'blue': return { backgroundColor: '#40b4e5', opacity: 0.1, iconColor: '#40b4e5' };
      case 'green': return { backgroundColor: '#047732', opacity: 0.1, iconColor: '#047732' };
      case 'orange': return { backgroundColor: '#ffc526', opacity: 0.1, iconColor: '#ffc526' };
      case 'purple': return { backgroundColor: '#12100c', opacity: 0.1, iconColor: '#12100c' };
      default: return { backgroundColor: '#666666', opacity: 0.1, iconColor: '#666666' };
    }
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl">Dashboard de Crecimiento de Usuarios</h1>
          <p className="text-gray-600">Análisis de la comunidad SoyUCAB - Últimos 6 meses</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorConfig = getIconColorClass(metric.color);
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        metric.trendUp ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trendUp ? '↗' : '↘'} {metric.trend}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg" style={colorConfig}>
                    <IconComponent className="h-6 w-6" style={{ color: colorConfig.iconColor }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolución de Usuarios por Tipo</CardTitle>
            <p className="text-gray-600">Crecimiento mensual de la comunidad</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value} usuarios`, name]}
                    labelStyle={{ color: '#333' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Estudiantes" 
                    stroke="#40b4e5" 
                    strokeWidth={3}
                    dot={{ fill: '#40b4e5', strokeWidth: 2, r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Egresados" 
                    stroke="#ffc526" 
                    strokeWidth={3}
                    dot={{ fill: '#ffc526', strokeWidth: 2, r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Profesores" 
                    stroke="#047732" 
                    strokeWidth={3}
                    dot={{ fill: '#047732', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
            <p className="text-gray-600">Por tipo de usuario</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} usuarios`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {userTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad Reciente</CardTitle>
          <p className="text-gray-600">Principales métricas de engagement de la comunidad</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-gray-600">Publicaciones</div>
              <div className="text-xs text-gray-500">Este mes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3,567</div>
              <div className="text-sm text-gray-600">Comentarios</div>
              <div className="text-xs text-gray-500">Este mes</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">2,890</div>
              <div className="text-sm text-gray-600">Reacciones</div>
              <div className="text-xs text-gray-500">Este mes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">456</div>
              <div className="text-sm text-gray-600">Conexiones</div>
              <div className="text-xs text-gray-500">Este mes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityGrowthReport;