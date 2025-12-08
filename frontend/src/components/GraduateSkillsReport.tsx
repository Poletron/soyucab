import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Filter, Download, TrendingUp, Users, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const GraduateSkillsReport = () => {
  // Datos de aptitudes populares por escuela
  const skillsData = [
    { skill: 'Programación', count: 45, percentage: 18.2 },
    { skill: 'Liderazgo', count: 38, percentage: 15.4 },
    { skill: 'Análisis de Datos', count: 32, percentage: 13.0 },
    { skill: 'Gestión de Proyectos', count: 28, percentage: 11.4 },
    { skill: 'Comunicación Efectiva', count: 25, percentage: 10.1 },
    { skill: 'Pensamiento Crítico', count: 22, percentage: 8.9 },
    { skill: 'Trabajo en Equipo', count: 20, percentage: 8.1 },
    { skill: 'Innovación', count: 18, percentage: 7.3 },
    { skill: 'Resolución de Problemas', count: 15, percentage: 6.1 },
    { skill: 'Inteligencia Artificial', count: 4, percentage: 1.5 }
  ];

  // Colores institucionales de UCAB para el gráfico
  const COLORS = [
    '#40b4e5', // Azul UCAB
    '#ffc526', // Amarillo UCAB
    '#047732', // Verde UCAB
    '#12100c', // Negro UCAB
    '#6366f1', // Índigo
    '#8b5cf6', // Violeta
    '#ec4899', // Rosa
    '#f97316', // Naranja
    '#84cc16', // Lima
    '#06b6d4'  // Cian
  ];

  // Métricas principales
  const totalGraduates = 247;
  const totalSkills = skillsData.reduce((sum, item) => sum + item.count, 0);
  const avgSkillsPerGraduate = (totalSkills / totalGraduates).toFixed(1);
  const topSkill = skillsData[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl">Top 10 Aptitudes de Egresados</h1>
          <p className="text-gray-600">Competencias más valoradas en el mercado laboral</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="ingenieria">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar Escuela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ingenieria">Ingeniería</SelectItem>
              <SelectItem value="derecho">Derecho</SelectItem>
              <SelectItem value="administracion">Administración</SelectItem>
              <SelectItem value="medicina">Medicina</SelectItem>
              <SelectItem value="comunicacion">Comunicación Social</SelectItem>
              <SelectItem value="psicologia">Psicología</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#ffc526', color: '#12100c' }}
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Egresados</p>
                <p className="text-2xl" style={{ color: '#40b4e5' }}>{totalGraduates}</p>
                <p className="text-sm text-gray-500">Escuela de Ingeniería</p>
              </div>
              <Users className="h-8 w-8" style={{ color: '#40b4e5' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aptitudes Registradas</p>
                <p className="text-2xl" style={{ color: '#047732' }}>{totalSkills}</p>
                <p className="text-sm text-gray-500">Últimos 6 meses</p>
              </div>
              <Award className="h-8 w-8" style={{ color: '#047732' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio por Egresado</p>
                <p className="text-2xl" style={{ color: '#ffc526' }}>{avgSkillsPerGraduate}</p>
                <p className="text-sm text-gray-500">aptitudes/perfil</p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: '#ffc526' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aptitud Más Popular</p>
                <p className="text-lg truncate">{topSkill.skill}</p>
                <p className="text-sm text-gray-500">{topSkill.count} menciones</p>
              </div>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#40b4e5' }}
              >
                1
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pie Chart + Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Aptitudes</CardTitle>
              <p className="text-gray-600">Porcentaje de menciones por aptitud</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="skill"
                    >
                      {skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, 'Menciones']}
                      labelFormatter={(label) => `Aptitud: ${label}`}
                    />
                    <Legend 
                      formatter={(value, entry) => entry.payload.skill}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado por Competencia</CardTitle>
              <p className="text-gray-600">Insights sobre las aptitudes más demandadas</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-lg mb-2" style={{ color: '#40b4e5' }}>Aptitudes Técnicas</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Programación (18.2%)</li>
                    <li>• Análisis de Datos (13.0%)</li>
                    <li>• Inteligencia Artificial (1.5%)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">32.7% del total</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="text-lg mb-2" style={{ color: '#047732' }}>Aptitudes Blandas</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Liderazgo (15.4%)</li>
                    <li>• Comunicación Efectiva (10.1%)</li>
                    <li>• Trabajo en Equipo (8.1%)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">33.6% del total</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="text-lg mb-2" style={{ color: '#ffc526' }}>Aptitudes Estratégicas</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Gestión de Proyectos (11.4%)</li>
                    <li>• Pensamiento Crítico (8.9%)</li>
                    <li>• Innovación (7.3%)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">27.6% del total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Skills Ranking */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Ranking de Aptitudes</CardTitle>
              <p className="text-gray-600">Ordenado por número de menciones</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skillsData.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: index < 3 ? '#40b4e5' : '#6b7280' }}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{skill.skill}</p>
                        <p className="text-xs text-gray-500">{skill.percentage}%</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm" style={{ color: '#40b4e5' }}>{skill.count}</p>
                      <p className="text-xs text-gray-500">menciones</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GraduateSkillsReport;